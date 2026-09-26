import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ioc } from 'socket.io-client';
import { createDatabase } from '../db.js';
import { createApp } from '../app.js';

let server, url, db;
const clients = [];

beforeAll(async () => {
  db = createDatabase(':memory:');
  ({ server } = createApp(db));
  await new Promise(r => server.listen(0, r));
  url = `http://localhost:${server.address().port}`;
});
afterAll(async () => {
  clients.forEach(c => c.close());
  await new Promise(r => server.close(r));
});

function connect(spaceId, pseudo) {
  const c = ioc(url, { transports: ['websocket'], forceNew: true });
  clients.push(c);
  return new Promise((resolve, reject) => {
    c.on('joined', () => resolve(c));
    c.on('error', e => reject(new Error(e.message)));
    c.emit('join-space', { spaceId, pseudo });
  });
}
const next = (c, ev) => new Promise(r => c.once(ev, r));

async function newSpace(body = {}) {
  const res = await fetch(`${url}/api/spaces`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return (await res.json()).id;
}

describe('temps réel', () => {
  it('le planning se synchronise entre deux participants', async () => {
    const id = await newSpace({ templateId: 'tpl2-retro-equipe' });
    const a = await connect(id, 'Yoan');
    const b = await connect(id, 'Claire');
    const got = next(b, 'planning-sync');
    a.emit('planning:meta', { fields: { question: 'Qu\'est-ce qu\'on garde ?' } });
    const st = await got;
    expect(st.planning.question).toBe('Qu\'est-ce qu\'on garde ?');
    expect(st.agendaDays).toHaveLength(1);
    expect(st.blocks).toHaveLength(5);

    const day = st.agendaDays[0].id;
    const got2 = next(b, 'planning-sync');
    a.emit('seq:create', { dayId: day, index: 0, fields: { title: 'Accueil café', kind: 'pause', duration_minutes: 15 } });
    const st2 = await got2;
    const first = [...st2.blocks].filter(x => x.day_id === day).sort((x, y) => x.position - y.position)[0];
    expect(first).toMatchObject({ title: 'Accueil café', kind: 'pause' });
  });

  it('l\'en-tête est modifiable tant qu\'aucun facilitateur n\'est désigné, puis réservé', async () => {
    const id = await newSpace();
    const a = await connect(id, 'Yoan');
    const b = await connect(id, 'Claire');
    a.emit('update-header', { field: 'client_name', value: 'Mess Family' });
    await next(b, 'header-updated');
    const fac = next(a, 'facilitators-updated');
    a.emit('set-facilitator', { pseudo: 'Yoan', add: true });
    await fac;
    b.emit('update-header', { field: 'client_name', value: 'Piraté' });
    await new Promise(r => setTimeout(r, 150));
    const sp = await (await fetch(`${url}/api/spaces/${id}`)).json();
    expect(sp.space.client_name).toBe('Mess Family');
  });

  it('un vote n\'est accepté que s\'il est ouvert, et seul le facilitateur l\'ouvre', async () => {
    const id = await newSpace();
    const a = await connect(id, 'Yoan');
    const b = await connect(id, 'Claire');
    const fac = next(a, 'facilitators-updated');
    a.emit('set-facilitator', { pseudo: 'Yoan', add: true });
    await fac;

    const refused = next(b, 'error');
    b.emit('success:vote', { kind: 'avant', value: 4 });
    expect((await refused).message).toMatch(/pas ouvert/);

    const refusedOpen = next(b, 'error');
    b.emit('success:votes-open', { kinds: ['avant'] });
    expect((await refusedOpen).message).toMatch(/facilitateur/);

    const opened = next(b, 'success-sync');
    a.emit('success:votes-open', { kinds: ['avant'] });
    expect((await opened).votesOpen).toEqual(['avant']);

    const voted = next(a, 'success-sync');
    b.emit('success:vote', { kind: 'avant', value: 4 });
    const st = await voted;
    expect(st.votes).toEqual([expect.objectContaining({ pseudo: 'Claire', kind: 'avant', value: 4 })]);
  });

  it('les votes sur les cartes renvoient le détail par personne', async () => {
    const id = await newSpace();
    const a = await connect(id, 'Yoan');
    const created = next(a, 'card-created');
    a.emit('create-card', { phase: 'avant', columnKey: 'clarifier_cadre', content: 'Une carte' });
    const card = await created;
    const upd = next(a, 'votes-updated');
    a.emit('vote', { cardId: card.id });
    const votes = await upd;
    expect(votes).toEqual([expect.objectContaining({ card_id: card.id, pseudo: 'Yoan' })]);
  });

  it('un cadrage archivé refuse les modifications du planning', async () => {
    const id = await newSpace();
    db.prepare(`UPDATE spaces SET archived = 1 WHERE id = ?`).run(id);
    const a = await connect(id, 'Yoan');
    const err = next(a, 'error');
    a.emit('day:create', {});
    expect((await err).message).toMatch(/archivé/);
  });
});

describe('messages malformés', () => {
  it('le serveur survit aux messages absurdes', async () => {
    const id = await newSpace();
    const a = await connect(id, 'Yoan');
    a.emit('add-block-comment');
    a.emit('cursor', null);
    a.emit('update-header', { field: 'client_name', value: {} });
    a.emit('react', { cardId: 'x', emoji: '__proto__' });
    a.emit('planning:replace', { data: 'pas un objet' });
    a.emit('seq:move', { id: 'inconnu', index: 'abc' });
    a.emit('join-space');
    await new Promise(r => setTimeout(r, 200));
    // le serveur répond toujours
    const res = await fetch(`${url}/api/spaces/${id}`);
    expect(res.status).toBe(200);
    const created = next(a, 'planning-sync');
    a.emit('day:create', {});
    expect((await created).agendaDays).toHaveLength(1);
  });
});

describe('clé de facilitateur', () => {
  function connectWith(spaceId, pseudo, key) {
    const c = ioc(url, { transports: ['websocket'], forceNew: true });
    clients.push(c);
    return new Promise((resolve) => {
      const out = { c, admin: null };
      c.on('admin-status', ({ facilitator }) => { out.admin = facilitator; resolve(out); });
      c.emit('join-space', { spaceId, pseudo, key });
    });
  }

  it('prendre le prénom du facilitateur ne donne aucun droit', async () => {
    const id = await newSpace();
    const yoan = await connect(id, 'Yoan');
    const gotKey = next(yoan, 'facilitator-key');
    yoan.emit('set-facilitator', { pseudo: 'Yoan', add: true });
    const { key } = await gotKey;
    expect(typeof key).toBe('string');

    const imposteur = await connectWith(id, 'Yoan');
    expect(imposteur.admin).toBe(false);
    imposteur.c.emit('update-header', { field: 'client_name', value: 'Usurpé' });
    imposteur.c.emit('success:votes-open', { kinds: ['avant'] });
    await new Promise(r => setTimeout(r, 150));
    const sp = await (await fetch(`${url}/api/spaces/${id}`)).json();
    expect(sp.space.client_name).not.toBe('Usurpé');
    expect(sp.success.votesOpen).toEqual([]);

    const vrai = await connectWith(id, 'Yoan', key);
    expect(vrai.admin).toBe(true);
    const opened = next(vrai.c, 'success-sync');
    vrai.c.emit('success:votes-open', { kinds: ['avant'] });
    expect((await opened).votesOpen).toEqual(['avant']);
  });
});

describe('démo', () => {
  it('« Essayer » crée une copie complète et modifiable, datée d\'aujourd\'hui', async () => {
    const res = await fetch(`${url}/api/demo`, { method: 'POST' });
    expect(res.status).toBe(201);
    const { id } = await res.json();
    const sp = await (await fetch(`${url}/api/spaces/${id}`)).json();
    expect(sp.space.archived).toBe(false);
    expect(sp.space.facilitator_ids).toEqual([]);
    expect(sp.cards.length).toBeGreaterThan(30);
    expect(sp.agendaDays).toHaveLength(2);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(sp.agendaDays[0].date).toBe(today);
    expect(sp.blockComments.length).toBeGreaterThan(0);
    expect(sp.success.votes.length).toBe(36);
    expect(sp.success.review.length).toBe(9);
    // la référence, elle, reste en lecture seule
    const ref = await (await fetch(`${url}/api/spaces/6AG_demo`)).json();
    expect(ref.space.archived).toBe(true);
  });
});
