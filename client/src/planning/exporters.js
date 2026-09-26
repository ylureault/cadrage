// Formats d'échange du planning.
// Le JSON « planning-temps-collectif » est celui de la compétence Insuffle (build.py) : un aller-retour sans perte.

import { computeDay, hm, sortByPos, toTime, toMin, dayLabel, formatDate, fmtDur } from './utils.js';
import { HORIZONS } from './constants.js';

export function toSkillJson({ space, meta, days, blocks }) {
  const sorted = sortByPos(days);
  return {
    meta: {
      charte: meta.charte || 'insuffle',
      slug: `${(space?.client_name || 'client').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-planning`,
      client: space?.client_name || '',
      date: space?.session_date ? formatDate(space.session_date, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date à confirmer',
      accueil: meta.accueil || '',
      lieu: meta.lieu || '',
      participants: meta.participants ? (Number(meta.participants) || meta.participants) : '',
      animateur: space?.facilitator || '',
      reference: meta.reference || '',
      pied: meta.footer_note || '',
    },
    question: meta.question || '',
    intention: meta.intention || '',
    colonnes: meta.planning_columns?.length ? meta.planning_columns : ['sequence', 'intention', 'format', 'production'],
    jours: sorted.map(d => {
      const c = computeDay(d, blocks);
      const out = {
        debut: toTime(c.start),
        fin: toTime(Math.max(c.end, c.plannedEnd)),
        sequences: c.seqs.map(s => (s.kind === 'pause'
          ? { debut: toTime(s.start), fin: toTime(s.end), titre: s.title, type: 'pause' }
          : { debut: toTime(s.start), fin: toTime(s.end), titre: s.title, type: s.kind, intention: s.intention || '', format: s.format || '', production: s.production || '' })),
      };
      if (d.date) out.date = formatDate(d.date, { day: 'numeric', month: 'long', year: 'numeric' });
      if (d.encadre && (d.encadre.titre || d.encadre.items?.length)) out.encadre = { titre: d.encadre.titre || '', items: d.encadre.items || [] };
      return out;
    }),
  };
}

// Accepte le JSON de la compétence, ou un export complet de l'outil
export function fromAnyJson(data) {
  if (!data || typeof data !== 'object') throw new Error('Fichier illisible.');
  if (data.format === 'insuffle-cadrage-planning' && data.planning) {
    return { planning: data.planning, agendaDays: data.agendaDays || [], blocks: data.blocks || [] };
  }
  if (Array.isArray(data.jours)) {
    const m = data.meta || {};
    const planning = {
      question: data.question || '', intention: data.intention || '', charte: m.charte || 'insuffle',
      lieu: m.lieu || '', participants: m.participants ? String(m.participants) : '', accueil: m.accueil || '',
      reference: m.reference || '', footer_note: m.pied || '',
      planning_columns: Array.isArray(data.colonnes) ? data.colonnes : undefined,
    };
    if (m.client) planning.client_name = m.client;
    if (m.animateur) planning.facilitator = m.animateur;
    const days = data.jours.map((j, i) => {
      const seqs = (j.sequences || []).map(s => ({
        title: s.titre || '', kind: ['collectif', 'apport', 'pause'].includes(s.type) ? s.type : 'collectif',
        duration_minutes: Math.max(5, toMin(s.fin) - toMin(s.debut)),
        intention: s.intention || '', format: s.format || '', production: s.production || '',
        block_type: s.type === 'pause' ? 'pause' : s.type === 'apport' ? 'transition' : 'production',
      }));
      return { label: `Jour ${i + 1}`, start_time: j.debut || '09:00', end_time: j.fin || '17:00', encadre: j.encadre || null, sequences: seqs };
    });
    return { planning, days };
  }
  throw new Error('Format non reconnu : ni un planning Insuffle, ni un export de l\'outil.');
}

export function toFullJson({ space, meta, days, blocks }) {
  return {
    format: 'insuffle-cadrage-planning', version: 2, exported_at: new Date().toISOString(),
    client: space?.client_name || '',
    planning: meta, agendaDays: sortByPos(days), blocks: sortByPos(blocks),
  };
}

// Texte brut : à coller dans un mail
export function toPlainText({ space, meta, days, blocks }) {
  const sorted = sortByPos(days);
  let t = `${meta.question || ''}\n\nIntention : ${meta.intention || ''}\n`;
  const band = [space?.client_name, meta.lieu, meta.participants && `${meta.participants} participants`, space?.facilitator].filter(Boolean).join(' · ');
  if (band) t += `${band}\n`;
  sorted.forEach((d, i) => {
    const c = computeDay(d, blocks);
    t += `\n${dayLabel(d, i)}${d.date ? `, ${formatDate(d.date)}` : ''} : ${hm(c.start)} à ${hm(Math.max(c.end, c.plannedEnd))}\n`;
    for (const s of c.seqs) {
      if (s.kind === 'pause') { t += `${hm(s.start)}  ${s.title}\n`; continue; }
      t += `${hm(s.start)}  ${s.title} (${fmtDur(s.duration_minutes)})${s.kind === 'apport' ? ' · apport' : ''}\n`;
      if (s.intention) t += `        ${s.intention}\n`;
    }
    if (d.encadre?.titre) {
      t += `\n${d.encadre.titre}\n`;
      for (const it of d.encadre.items || []) t += `  ${it.label} ${it.texte}\n`;
    }
  });
  t += `\n${meta.charte === 'academie' ? 'Insuffle Académie' : 'Insuffle'}\n`;
  t += 'Préparé avec l\'outil de cadrage offert par Insuffle : https://cadrage.insuffle.com\n';
  return t;
}

// Une cellule qui commence par = + - @ serait lue comme une formule par Excel : on la neutralise
const csvCell = (v) => {
  let t = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

export function toCsv({ days, blocks }) {
  const rows = [['Jour', 'Date', 'Début', 'Fin', 'Durée (min)', 'Type', 'Séquence', 'Intention', 'Format', 'Ce qui en sort', 'Consignes', 'Matériel', 'Rôles', 'Point d\'attention'].map(csvCell).join(';')];
  sortByPos(days).forEach((d, i) => {
    for (const s of computeDay(d, blocks).seqs) {
      rows.push([dayLabel(d, i), d.date || '', hm(s.start), hm(s.end), s.duration_minutes, s.kind, s.title, s.intention, s.format, s.production, s.description, s.material, s.roles, s.attention_flag ? s.attention_note : ''].map(csvCell).join(';'));
    }
  });
  return '﻿' + rows.join('\n');
}

export function successToCsv(success) {
  const hz = Object.fromEntries(HORIZONS.map(h => [h.key, h.label]));
  const rows = [['Critère', 'Ce qu\'on observe', 'Échéance', 'Cible', 'Statut', 'Constat'].map(csvCell).join(';')];
  for (const c of success.criteria || []) rows.push([c.statement, c.indicator, hz[c.horizon], c.target, c.status, c.result_note].map(csvCell).join(';'));
  rows.push('');
  rows.push(['Action', 'Qui', 'Échéance', 'Date', 'Statut', 'Note'].map(csvCell).join(';'));
  for (const a of success.actions || []) rows.push([a.what, a.who, hz[a.horizon], a.due_date, a.status, a.note].map(csvCell).join(';'));
  return '﻿' + rows.join('\n');
}
