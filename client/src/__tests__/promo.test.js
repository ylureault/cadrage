import { describe, it, expect } from 'vitest';
import { pickPromo, promoSignals, withUtm, PROMOS } from '../planning/promo.js';

const NOW = new Date('2026-09-26T10:00:00').getTime();
const base = (planning = {}, extra = {}) => ({ spaceId: 'abc', isFacilitator: true, planning, space: {}, agendaDays: [], blocks: [], success: { review: [], votes: [], criteria: [], actions: [] }, ...extra });
const mem = { dismissed: {}, views: {} };
const pick = (st, pl, o = {}) => pickPromo(st, pl, { memory: mem, now: NOW, ...o });

describe('moteur de recommandation Insuffle', () => {
  it('propose le séminaire CODIR pour un CODIR', () => {
    expect(pick(base({ event_type: 'codir' }), 'conception').id).toBe('codir');
  });
  it('la situation « Dénouer » passe devant le type de temps', () => {
    expect(pick(base({ event_type: 'codir', situation: 'denouer' }), 'conception').id).toBe('situation');
  });
  it('à J-5, propose la relecture du planning', () => {
    const p = pick(base({ event_type: 'codir' }, { space: { session_date: '2026-10-01' } }), 'agenda');
    expect(p.id).toBe('j-moins');
    expect(p.title).toContain('J-5');
  });
  it('une formation oriente vers Insuffle Académie', () => {
    const p = pick(base({ event_type: 'formation' }), 'conception');
    expect(p.brand).toBe('academie');
  });
  it('trop d\'apport : le repère 70 / 30', () => {
    const blocks = [{ day_id: 'd', kind: 'apport', duration_minutes: 90 }, { day_id: 'd', kind: 'collectif', duration_minutes: 60 }];
    const p = pick(base({}, { blocks }), 'agenda');
    expect(p.id).toBe('apport');
    expect(p.title).toContain('60 %');
  });
  it('un bilan faible propose une formation', () => {
    const success = { review: [{ criterion: 'posture', score: 1 }, { criterion: 'parole', score: 4 }], votes: [], criteria: [], actions: [] };
    const p = pick(base({}, { success }), 'succes');
    expect(p.id).toBe('bilan-faible');
    expect(p.text).toContain('1 repère');
  });
  it('après la séance, on parle du suivi', () => {
    expect(pick(base({}, { space: { session_date: '2026-09-20' } }), 'succes').id).toBe('suivi');
    expect(promoSignals(base({}, { space: { session_date: '2026-09-20' } }), NOW).daysSince).toBe(6);
  });
  it('un message refermé ne revient pas avant 30 jours, un autre prend la place', () => {
    const st = base({ event_type: 'codir' });
    expect(pick(st, 'conception', { memory: { dismissed: { codir: NOW - 86400000 }, views: {} } }).id).not.toBe('codir');
    expect(pick(st, 'conception', { memory: { dismissed: { codir: NOW - 40 * 86400000 }, views: {} } }).id).toBe('codir');
  });
  it('un message trop vu laisse la place', () => {
    const st = base({ event_type: 'distanciel', participants: '45' });
    expect(pick(st, 'conception').id).toBe('grand-groupe');
    expect(pick(st, 'conception', { memory: { dismissed: {}, views: { 'grand-groupe': 10 } } }).id).toBe('distanciel');
  });
  it('le participant ne voit que son message, le facilitateur jamais', () => {
    expect(pick(base({}, { isFacilitator: false, facilitators: ['Yoan'] }), 'participant').id).toBe('participant');
    expect(pick(base({}, { facilitators: ['Yoan'] }), 'participant')).toBeNull();
  });
  it('la démo reste sobre', () => {
    expect(pick(base({ event_type: 'codir' }, { spaceId: '6AG_demo' }), 'conception').id).toBe('animer');
  });
  it('les liens portent les UTM', () => {
    const p = pick(base({ event_type: 'codir' }), 'agenda');
    expect(p.cta.href).toContain('utm_source=cadrage');
    expect(p.cta.href).toContain('utm_campaign=agenda');
    expect(withUtm('mailto:x@y.z')).toBe('mailto:x@y.z');
  });
  it('chaque emplacement a toujours un message, sans tiret cadratin ni prix', () => {
    const states = [base(), base({ event_type: 'codir', situation: 'traverser', participants: '60' }), base({ event_type: 'formation', charte: 'academie' })];
    for (const st of states) {
      for (const pl of ['conception', 'agenda', 'succes', 'reperes', 'moment']) {
        const p = pick(st, pl);
        expect(p, pl).toBeTruthy();
        expect(`${p.title} ${p.text}`).not.toMatch(/—|€/);
      }
    }
    expect(PROMOS.every(p => p.placements.length)).toBe(true);
  });
});
