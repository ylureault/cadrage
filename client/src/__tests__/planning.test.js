import { describe, it, expect } from 'vitest';
import { computeDay, analyzePlanning, hm, fmtDur, toTime, toMin, stripDashes, pageOrientation, splitColumns } from '../planning/utils.js';
import { toSkillJson, fromAnyJson, toPlainText, toCsv } from '../planning/exporters.js';
import { buildSheetHtml, successSummary } from '../planning/sheet.js';
import { METHODS, methodToSequence } from '../planning/methods.js';

const day = { id: 'd1', label: 'Jour 1', start_time: '09:00', end_time: '12:30', position: 0 };
const seq = (id, title, duration_minutes, extra = {}) => ({ id, day_id: 'd1', title, duration_minutes, kind: 'collectif', intention: 'Une intention.', position: 0, ...extra });

// Le modèle Mess Family : 9h00 à 12h30, pile 14 créneaux
const blocks = [
  seq('a', 'Ouverture', 15, { position: 0, block_type: 'ouverture' }),
  seq('b', 'Partir du futur', 15, { position: 1, kind: 'apport' }),
  seq('c', 'Tables tournantes (World Café)', 60, { position: 2, diamond: 'diverger', production: '5 nappes remplies.' }),
  seq('d', 'Installation', 30, { position: 3 }),
  { id: 'p', day_id: 'd1', title: 'Pause', duration_minutes: 15, kind: 'pause', position: 4 },
  seq('e', 'La balade des nappes', 15, { position: 5, diamond: 'converger' }),
  seq('f', 'Mon engagement', 45, { position: 6 }),
  seq('g', 'Clôture', 15, { position: 7, block_type: 'cloture' }),
];
const meta = { question: 'Comment grandir avec l\'entreprise quand tout s\'accélère ?', intention: 'Que chacun reparte en sachant ce qu\'il fait grandir.', slot_minutes: 15 };

describe('horaires', () => {
  it('formate les heures et les durées à la française', () => {
    expect(hm(540)).toBe('9h00');
    expect(hm(765)).toBe('12h45');
    expect(fmtDur(45)).toBe('45 min');
    expect(fmtDur(60)).toBe('1h');
    expect(fmtDur(90)).toBe('1h30');
    expect(toTime(toMin('09:15') + 30)).toBe('09:45');
  });

  it('déduit les horaires de l\'ordre et des durées', () => {
    const c = computeDay(day, blocks);
    expect(c.seqs.map(s => hm(s.start))).toEqual(['9h00', '9h15', '9h30', '10h30', '11h00', '11h15', '11h30', '12h15']);
    expect(c.plannedEnd).toBe(toMin('12:30'));
    expect(c.planned).toBe(c.window);
  });

  it('ignore les séquences du banc et des autres jours', () => {
    const c = computeDay(day, [...blocks, { id: 'z', day_id: null, title: 'Banc', duration_minutes: 30 }, { id: 'y', day_id: 'd2', title: 'Autre', duration_minutes: 30 }]);
    expect(c.seqs).toHaveLength(blocks.length);
  });
});

describe('contrôles', () => {
  it('un planning qui tombe juste n\'a aucun bloquant', () => {
    const { issues } = analyzePlanning(meta, [day], blocks);
    expect(issues.filter(i => i.level === 'error')).toEqual([]);
  });

  it('exige une question-titre et une intention', () => {
    const { issues } = analyzePlanning({}, [day], blocks);
    expect(issues.filter(i => i.level === 'error').map(i => i.field)).toEqual(['question', 'intention']);
  });

  it('signale le dépassement et le temps libre', () => {
    const over = analyzePlanning(meta, [day], [...blocks, seq('x', 'En trop', 30, { position: 9 })]);
    expect(over.issues.some(i => i.level === 'error' && /dépassement de 30 min/.test(i.msg))).toBe(true);
    const under = analyzePlanning(meta, [day], blocks.slice(0, -1));
    expect(under.issues.some(i => /15 min non planifiées/.test(i.msg))).toBe(true);
  });

  it('repère les créneaux hors grille, les tirets longs et l\'intention manquante', () => {
    const odd = [...blocks.slice(0, -1), seq('g', 'Clôture — tour', 10, { position: 7, intention: '' }), seq('h', 'Fin', 5, { position: 8 })];
    const { issues } = analyzePlanning(meta, [day], odd);
    expect(issues.some(i => /grille de 15 min/.test(i.msg))).toBe(true);
    expect(issues.some(i => i.fix === 'dashes')).toBe(true);
    expect(issues.some(i => /n'a pas d'intention/.test(i.msg))).toBe(true);
  });

  it('prévient au-delà de 2 h sans pause', () => {
    const long = [seq('a', 'A', 60, { position: 0 }), seq('b', 'B', 60, { position: 1 }), seq('c', 'C', 60, { position: 2 })];
    const { issues } = analyzePlanning(meta, [{ ...day, end_time: '12:00' }], long);
    expect(issues.some(i => /plus de 2 h sans pause/.test(i.msg))).toBe(true);
  });

  it('calcule l\'équilibre collectif / apport / pause et le double diamant', () => {
    const { stats } = analyzePlanning(meta, [day], blocks);
    expect(stats.apport).toBe(15);
    expect(stats.pause).toBe(15);
    expect(stats.collectif).toBe(180);
    expect(stats.diverger).toBe(60);
    expect(stats.converger).toBe(15);
    expect(stats.actif).toBe(92);
  });
});

describe('tirets longs', () => {
  it('remplace le tiret long par une ponctuation', () => {
    expect(stripDashes('Ouverture — le cadre')).toBe('Ouverture, le cadre');
    expect(stripDashes('Fin. — Suite')).toBe('Fin. Suite');
    expect(stripDashes('Rien à faire')).toBe('Rien à faire');
  });
});

describe('orientation A4', () => {
  it('portrait jusqu\'à 8 h, paysage au-delà', () => {
    expect(pageOrientation([day], blocks)).toBe('portrait');
    expect(pageOrientation([{ ...day, end_time: '17:30' }], blocks)).toBe('paysage');
    expect(pageOrientation([day], blocks, 'paysage')).toBe('paysage');
  });

  it('coupe matin / après-midi à la pause la plus proche du milieu', () => {
    const c = computeDay(day, blocks);
    const cols = splitColumns(c.seqs, true);
    expect(cols).toHaveLength(2);
    expect(cols[0].seqs[cols[0].seqs.length - 1].kind).toBe('pause');
  });
});

describe('export et import au format planning-temps-collectif', () => {
  const space = { client_name: 'Mess Family', facilitator: 'Yoan Lureault, Insuffle' };
  it('produit le JSON de la compétence (debut / fin / type)', () => {
    const j = toSkillJson({ space, meta: { ...meta, charte: 'insuffle', participants: '30' }, days: [day], blocks });
    expect(j.meta.client).toBe('Mess Family');
    expect(j.meta.participants).toBe(30);
    expect(j.jours[0].debut).toBe('09:00');
    expect(j.jours[0].fin).toBe('12:30');
    expect(j.jours[0].sequences[1]).toMatchObject({ debut: '09:15', fin: '09:30', type: 'apport' });
    expect(j.jours[0].sequences[4]).toEqual({ debut: '11:00', fin: '11:15', titre: 'Pause', type: 'pause' });
  });

  it('relit ce JSON sans perte de durée', () => {
    const j = toSkillJson({ space, meta, days: [day], blocks });
    const back = fromAnyJson(j);
    expect(back.planning.question).toBe(meta.question);
    expect(back.planning.client_name).toBe('Mess Family');
    expect(back.days[0].sequences.map(s => s.duration_minutes)).toEqual(blocks.map(b => b.duration_minutes));
  });

  it('refuse un fichier inconnu', () => {
    expect(() => fromAnyJson({ foo: 1 })).toThrow();
  });

  it('texte pour un mail et CSV', () => {
    const t = toPlainText({ space, meta, days: [day], blocks });
    expect(t).toContain('9h30  Tables tournantes (World Café) (1h)');
    const csv = toCsv({ days: [day], blocks });
    expect(csv.split('\n')).toHaveLength(blocks.length + 1);
  });
});

describe('pages A4', () => {
  it('le planning client porte le logo, la question-titre et aucune consigne interne', () => {
    const html = buildSheetHtml({ variant: 'planning', space: { client_name: 'Mess Family' }, meta, days: [day], blocks: [...blocks.slice(0, -1), { ...blocks[7], description: 'CONSIGNE-SECRETE', material: 'Gommettes-secretes' }] });
    expect(html).toContain('<svg');
    expect(html).toContain('Comment grandir avec l&#39;entreprise'.replace('&#39;', '\''));
    expect(html).toContain('Tables tournantes (World Café)');
    expect(html).not.toContain('CONSIGNE-SECRETE');
    expect(html).not.toContain('Gommettes-secretes');
    expect(html).toContain('size: A4 portrait');
  });

  it('la fiche animateur, elle, porte les consignes et le matériel', () => {
    const html = buildSheetHtml({ variant: 'animateur', space: {}, meta, days: [day], blocks: [{ ...blocks[0], description: 'Dire pourquoi on est là.', material: 'Micro' }] });
    expect(html).toContain('Dire pourquoi on est là.');
    expect(html).toContain('Matériel à prévoir');
  });

  it('la charte Académie passe en violet', () => {
    const html = buildSheetHtml({ variant: 'planning', space: {}, meta: { ...meta, charte: 'academie' }, days: [day], blocks });
    expect(html).toContain('#6B1963');
    expect(html).toContain('Académie');
  });

  it('le HTML modifiable embarque la barre d\'édition', () => {
    const html = buildSheetHtml({ variant: 'planning', mode: 'editable', space: {}, meta, days: [day], blocks });
    expect(html).toContain('contenteditable');
    expect(html).toContain('Enregistrer ce fichier');
  });
});

describe('mesure du succès', () => {
  it('calcule le score, le déplacement Avant / Après, le ROTI et les actions', () => {
    const s = successSummary({
      criteria: [{ status: 'atteint' }, { status: 'partiel' }, { status: 'a_mesurer' }],
      actions: [{ status: 'fait' }, { status: 'a_faire' }, { status: 'abandonne' }],
      votes: [{ kind: 'avant', value: 3 }, { kind: 'avant', value: 5 }, { kind: 'apres', value: 8 }, { kind: 'roti', value: 4 }],
    });
    expect(s.score).toBe(75);
    expect(s.measured).toBe(2);
    expect(s.avant.avg).toBe(4);
    expect(s.apres.avg).toBe(8);
    expect(s.roti.n).toBe(1);
    expect(s.actions).toBe(2);
    expect(s.actionRate).toBe(50);
  });
});

describe('bibliothèque de méthodes', () => {
  it('toutes les méthodes tombent sur la grille du quart d\'heure, sans tiret long', () => {
    for (const m of METHODS) {
      expect(m.duration % 15, m.name).toBe(0);
      expect(/[—–]/.test([m.name, m.intention, m.format, m.consignes].join(' ')), m.name).toBe(false);
    }
  });

  it('une méthode devient une séquence complète', () => {
    const m = METHODS.find(x => x.key === 'world-cafe');
    expect(methodToSequence(m)).toMatchObject({ title: 'Tables tournantes (World Café)', duration_minutes: 60, diamond: 'diverger', method_key: 'world-cafe' });
  });
});

import { readiness } from '../planning/readiness.js';

describe('jauge de préparation', () => {
  it('part de zéro et atteint 100 % quand tout est posé', () => {
    const empty = readiness({ planning: {}, space: {}, cards: [], axes: [], agendaDays: [], blocks: [], success: {} });
    expect(empty.pct).toBe(0);
    expect(empty.total).toBe(9);
    const full = readiness({
      planning: { question: 'Q ?', intention: 'I.', situation: 'denouer' },
      space: { client_name: 'Mess Family', session_date: '2026-10-01' },
      cards: ['clarifier_cadre', 'personnes_roles', 'definir_succes'].map(k => ({ phase: 'avant', column_key: k })),
      axes: ['a', 'b', 'c', 'd', 'e'].map(k => ({ axis_key: k, position: 3 })),
      agendaDays: [day],
      blocks,
      success: { criteria: [{ statement: 'Un critère.' }], actions: [{ what: 'Envoyer la synthèse', horizon: '72h' }] },
    });
    expect(full.items.filter(i => !i.done).map(i => i.key)).toEqual([]);
    expect(full.pct).toBe(100);
  });
});

import { suggestMethods, polariteValue } from '../planning/suggestions.js';

describe('suggestions tirées du cadrage', () => {
  it('la position finale prime sur la moyenne du groupe', () => {
    const axes = [{ axis_key: 'decider_murir', position: 5 }, { axis_key: 'decider_murir', position: 4 }];
    expect(polariteValue('decider_murir', axes, [])).toBe(4.5);
    expect(polariteValue('decider_murir', axes, [{ axis_key: 'decider_murir', position: 1 }])).toBe(1);
  });

  it('côté « Décider » : la décision par consentement arrive en tête, avec sa raison', () => {
    const s = suggestMethods({ axesFinal: [{ axis_key: 'decider_murir', position: 1 }], situation: 'traverser' });
    expect(s[0].method.key).toBe('consentement');
    expect(s[0].raisons).toEqual(['Côté « Décider »', 'Situation « Traverser » : décider, puis transformer']);
  });

  it('une polarité au milieu ne suggère rien', () => {
    expect(suggestMethods({ axesFinal: [{ axis_key: 'produire_explorer', position: 3 }] })).toEqual([]);
  });

  it('toutes les méthodes suggérées existent dans la bibliothèque', () => {
    const all = suggestMethods({
      axesFinal: ['decider_murir', 'agir_cap', 'cadre_autonomie', 'produire_explorer', 'contenu_processus', 'recul_action', 'ouvert_cible', 'serieux_ludique'].map(k => ({ axis_key: k, position: 1 })),
    }).concat(suggestMethods({
      axesFinal: ['decider_murir', 'agir_cap', 'cadre_autonomie', 'produire_explorer', 'contenu_processus', 'recul_action', 'ouvert_cible', 'serieux_ludique'].map(k => ({ axis_key: k, position: 5 })),
    }));
    expect(all.length).toBeGreaterThan(20);
    for (const x of all) expect(x.method).toBeTruthy();
  });
});

describe('sécurité des exports', () => {
  it('le CSV neutralise les formules', () => {
    const csv = toCsv({ days: [day], blocks: [seq('z', '=HYPERLINK("http://x")', 15, { position: 0 })] });
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")"`);
  });
  it('le HTML des pages échappe le contenu saisi', () => {
    const html = buildSheetHtml({ variant: 'planning', space: { client_name: '<img src=x onerror=alert(1)>' }, meta: { question: '<script>alert(1)</script>' }, days: [day], blocks });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x');
  });
});
