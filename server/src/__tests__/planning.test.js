import { describe, it, expect, beforeEach } from 'vitest';
import { createDatabase, migrateAgendaToPlanning } from '../db.js';
import { createPlanningStore, sanitizeMeta, sanitizeSequence } from '../planning.js';
import { createSuccessStore } from '../success.js';
import { SYSTEM_TEMPLATES } from '../templates.js';

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
let n = 0;
const gen = () => `t${(n++).toString(36)}`;

function freshSpace(db, id = 'sp1') {
  db.prepare(`INSERT INTO spaces (id) VALUES (?)`).run(id);
  return id;
}

describe('modèles Insuffle', () => {
  for (const t of SYSTEM_TEMPLATES) {
    it(`« ${t.name} » tombe juste au quart d'heure, sans tiret long`, () => {
      expect(t.data.planning.question).toMatch(/\?$/);
      expect(t.data.planning.intention.length).toBeGreaterThan(10);
      for (const d of t.data.days) {
        const total = d.sequences.reduce((a, s) => a + s.duration_minutes, 0);
        expect(total, `${t.name} ${d.label}`).toBe(toMin(d.end_time) - toMin(d.start_time));
        for (const s of d.sequences) {
          expect(s.duration_minutes % 15, s.title).toBe(0);
          if (s.kind !== 'pause') expect(s.intention, s.title).toBeTruthy();
        }
      }
      expect(/[—–]/.test(JSON.stringify(t.data))).toBe(false);
    });
  }
});

describe('planning', () => {
  let db, planning;
  beforeEach(() => {
    db = createDatabase(':memory:');
    planning = createPlanningStore(db, gen);
    freshSpace(db);
  });

  it('crée des jours numérotés et des séquences ordonnées', () => {
    const d1 = planning.createDay('sp1', { start_time: '09:00', end_time: '12:00' });
    const a = planning.insertSequence('sp1', d1, null, { title: 'A', duration_minutes: 30 });
    const b = planning.insertSequence('sp1', d1, 0, { title: 'B' });
    const st = planning.state('sp1');
    expect(st.agendaDays[0]).toMatchObject({ label: 'Jour 1', day_number: 1, start_time: '09:00' });
    expect(st.blocks.map(x => x.id)).toEqual([b, a]);
    expect(st.blocks.find(x => x.id === b).duration_minutes).toBe(15);
  });

  it('déplace une séquence d\'un jour à l\'autre et vers le banc', () => {
    const d1 = planning.createDay('sp1');
    const d2 = planning.createDay('sp1');
    const a = planning.insertSequence('sp1', d1, null, { title: 'A' });
    const b = planning.insertSequence('sp1', d1, null, { title: 'B' });
    planning.moveSequence('sp1', a, d2, 0);
    let st = planning.state('sp1');
    expect(st.blocks.find(x => x.id === a).day_id).toBe(d2);
    expect(st.blocks.find(x => x.id === b).position).toBe(0);
    planning.moveSequence('sp1', a, null, null);
    st = planning.state('sp1');
    expect(st.blocks.find(x => x.id === a).day_id).toBeNull();
  });

  it('réordonne dans un même jour', () => {
    const d1 = planning.createDay('sp1');
    const ids = ['A', 'B', 'C'].map(t => planning.insertSequence('sp1', d1, null, { title: t }));
    planning.moveSequence('sp1', ids[0], d1, 2);
    const st = planning.state('sp1');
    expect([...st.blocks].sort((x, y) => x.position - y.position).map(x => x.title)).toEqual(['B', 'C', 'A']);
  });

  it('supprimer un jour envoie ses séquences sur le banc et renumérote', () => {
    const d1 = planning.createDay('sp1');
    const d2 = planning.createDay('sp1');
    planning.insertSequence('sp1', d1, null, { title: 'A' });
    planning.deleteDay('sp1', d1, true);
    const st = planning.state('sp1');
    expect(st.agendaDays).toHaveLength(1);
    expect(st.agendaDays[0]).toMatchObject({ id: d2, day_number: 1 });
    expect(st.blocks[0].day_id).toBeNull();
  });

  it('remplace tout le planning en gardant les identifiants (annuler)', () => {
    const d1 = planning.createDay('sp1', { encadre: { titre: 'Les tables', items: [{ label: '1.', texte: 'Q ?' }] } });
    const a = planning.insertSequence('sp1', d1, null, { title: 'A', kind: 'apport' });
    const snap = planning.state('sp1');
    planning.insertSequence('sp1', d1, null, { title: 'B' });
    planning.replaceAll('sp1', snap);
    const st = planning.state('sp1');
    expect(st.blocks.map(x => x.id)).toEqual([a]);
    expect(st.blocks[0].kind).toBe('apport');
    expect(st.agendaDays[0].encadre.titre).toBe('Les tables');
  });

  it('applique un modèle au format jours / séquences', () => {
    const tpl = SYSTEM_TEMPLATES.find(t => t.id === 'tpl2-codir-2-jours');
    planning.replaceAll('sp1', tpl.data);
    const st = planning.state('sp1');
    expect(st.planning.question).toBe(tpl.data.planning.question);
    expect(st.agendaDays).toHaveLength(2);
    expect(st.blocks).toHaveLength(tpl.data.days.reduce((a, d) => a + d.sequences.length, 0));
  });

  it('nettoie les entrées', () => {
    expect(sanitizeMeta({ charte: 'pirate', slot_minutes: 7, planning_columns: ['intention', 'bidon'] }))
      .toEqual({ charte: 'insuffle', slot_minutes: 15, planning_columns: JSON.stringify(['sequence', 'intention']) });
    expect(sanitizeSequence({ kind: 'pause', duration_minutes: 9999, diamond: 'x' }))
      .toMatchObject({ kind: 'pause', duration_minutes: 600, diamond: '', block_type: 'pause' });
  });
});

describe('migration des anciens cadrages (agenda v1)', () => {
  it('range les blocs planifiés dans leurs jours et convertit pauses et formats', () => {
    const db = createDatabase(':memory:');
    db.prepare(`INSERT INTO spaces (id) VALUES ('old')`).run();
    db.prepare(`INSERT INTO blocks (id, space_id, title, intention, block_type, duration_minutes, format, format_detail, position) VALUES ('b1', 'old', 'Atelier', 'I', 'production', 45, 'sous-groupes', 'Groupes de 4', 0)`).run();
    db.prepare(`INSERT INTO blocks (id, space_id, title, intention, block_type, duration_minutes, format, position) VALUES ('b2', 'old', 'Pas planifié', 'I', 'exploration', 30, 'pleniere', 1)`).run();
    db.prepare(`INSERT INTO agenda_days (id, space_id, day_number, start_time, end_time, position) VALUES ('d1', 'old', 1, '09:00', '12:00', 0)`).run();
    db.prepare(`INSERT INTO agenda_slots (id, space_id, day_id, block_id, slot_type, start_time, duration_minutes, position) VALUES ('s1', 'old', 'd1', 'b1', 'block', '09:00', 60, 0)`).run();
    db.prepare(`INSERT INTO agenda_slots (id, space_id, day_id, slot_type, title, start_time, duration_minutes, position) VALUES ('s2', 'old', 'd1', 'pause', 'Pause café', '10:00', 15, 1)`).run();
    migrateAgendaToPlanning(db);
    const st = createPlanningStore(db, gen).state('old');
    const b1 = st.blocks.find(b => b.id === 'b1');
    expect(b1).toMatchObject({ day_id: 'd1', duration_minutes: 60, format: 'Groupes de 4', kind: 'collectif' });
    expect(st.blocks.find(b => b.id === 'b2')).toMatchObject({ day_id: null, format: 'Plénière' });
    expect(st.blocks.find(b => b.kind === 'pause')).toMatchObject({ day_id: 'd1', title: 'Pause café', duration_minutes: 15 });
    expect(st.agendaDays[0].label).toBe('Jour 1');
  });

  it('la démo est migrée et tombe juste', () => {
    const db = createDatabase(':memory:');
    const st = createPlanningStore(db, gen).state('6AG_demo');
    for (const d of st.agendaDays) {
      const total = st.blocks.filter(b => b.day_id === d.id).reduce((a, b) => a + b.duration_minutes, 0);
      expect(total).toBe(toMin(d.end_time) - toMin(d.start_time));
    }
    const text = JSON.stringify({ p: st.planning, b: st.blocks.map(b => [b.title, b.intention, b.format, b.production]) });
    expect(/[—–]/.test(text)).toBe(false);
  });
});

describe('mesure du succès', () => {
  let db, success;
  beforeEach(() => {
    db = createDatabase(':memory:');
    success = createSuccessStore(db, gen);
    freshSpace(db);
  });

  it('crée, modifie et supprime critères et actions', () => {
    const c = success.saveCriterion('sp1', null, { statement: 'Chacun repart avec une action.', horizon: 'j90', status: 'pirate' }, 'Yoan');
    success.saveCriterion('sp1', c, { status: 'atteint' });
    const a = success.saveAction('sp1', null, { what: 'Envoyer la synthèse', who: 'Camille', horizon: '72h' }, 'Yoan');
    let st = success.state('sp1');
    expect(st.criteria[0]).toMatchObject({ statement: 'Chacun repart avec une action.', horizon: 'j90', status: 'atteint' });
    expect(st.actions[0]).toMatchObject({ what: 'Envoyer la synthèse', status: 'a_faire' });
    success.deleteAction('sp1', a);
    st = success.state('sp1');
    expect(st.actions).toHaveLength(0);
  });

  it('un vote par personne et par échelle, dans les bornes', () => {
    expect(success.vote('sp1', 'Claire', 'avant', 4)).toBe(true);
    expect(success.vote('sp1', 'Claire', 'avant', 6)).toBe(true);
    expect(success.vote('sp1', 'Claire', 'roti', 6)).toBe(false);
    expect(success.vote('sp1', 'Claire', 'bidon', 3)).toBe(false);
    const st = success.state('sp1');
    expect(st.votes).toHaveLength(1);
    expect(st.votes[0].value).toBe(6);
    success.clearVotes('sp1', 'avant');
    expect(success.state('sp1').votes).toHaveLength(0);
  });

  it('ouvre et ferme les votes', () => {
    success.setVotesOpen('sp1', ['avant', 'roti', 'pirate']);
    expect(success.state('sp1').votesOpen).toEqual(['avant', 'roti']);
  });
});
