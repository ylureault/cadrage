// Calculs du planning : horaires déduits des durées, contrôles, équilibre.

import { RATIO_REPERES } from './constants.js';

export function toMin(t) {
  if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function toTime(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

// 9h00, 12h30
export function hm(mins) {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}

// 45 min, 1h, 1h30
export function fmtDur(mins) {
  const n = Math.max(0, Math.round(mins || 0));
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const r = n % 60;
  return r ? `${h}h${String(r).padStart(2, '0')}` : `${h}h`;
}

export function sortByPos(list) {
  return [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || String(a.created_at || '').localeCompare(String(b.created_at || '')));
}

export function sequencesOf(blocks, dayId) {
  return sortByPos(blocks.filter(b => (b.day_id || null) === (dayId || null)));
}

// Horaires calculés : chaque séquence commence où finit la précédente
export function computeDay(day, blocks) {
  const seqs = sequencesOf(blocks, day.id);
  let t = toMin(day.start_time || '09:00');
  const timed = seqs.map(s => {
    const start = t;
    t += s.duration_minutes || 0;
    return { ...s, start, end: t };
  });
  const dayStart = toMin(day.start_time || '09:00');
  const dayEnd = toMin(day.end_time || '17:00');
  return { day, seqs: timed, start: dayStart, end: dayEnd, plannedEnd: t, planned: t - dayStart, window: dayEnd - dayStart };
}

export const LONG_DASH = /[—–]/;

export function dayLabel(day, index) {
  return day.label || `Jour ${index + 1}`;
}

export function formatDate(dateStr, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('fr-FR', opts);
}

// Contrôles du planning. level : 'error' bloque un planning client propre, 'warn' mérite un regard, 'tip' est un repère.
export function analyzePlanning(meta = {}, days = [], blocks = []) {
  const issues = [];
  const slot = meta.slot_minutes || 15;
  const push = (level, msg, ref = {}) => issues.push({ level, msg, ...ref });

  if (!meta.question?.trim()) push('error', 'Pas de question-titre. C\'est le titre de la page : elle embarque le groupe dans une réponse commune.', { field: 'question' });
  if (!meta.intention?.trim()) push('error', 'Pas d\'intention générale. Une phrase : ce qu\'on aimerait avoir obtenu à la fin.', { field: 'intention' });
  if (days.length === 0) push('warn', 'Aucun jour configuré.');

  const allText = [meta.question, meta.intention, meta.footer_note, meta.reference, meta.accueil,
    ...blocks.flatMap(b => [b.title, b.intention, b.format, b.production]),
    ...days.flatMap(d => [d.label, d.encadre?.titre, ...(d.encadre?.items || []).flatMap(i => [i.label, i.texte])])].join(' ');
  if (LONG_DASH.test(allText)) push('warn', 'Tiret long dans le texte client. Remplacez-le par un point, une virgule ou deux-points.', { fix: 'dashes' });

  const stats = { collectif: 0, apport: 0, pause: 0, diverger: 0, groan: 0, converger: 0, total: 0, byType: {} };

  days.forEach((day, di) => {
    const c = computeDay(day, blocks);
    const label = dayLabel(day, di);
    if (c.window <= 0) push('error', `${label} : l'heure de fin est avant l'heure de début.`, { dayId: day.id });
    if (c.start % slot) push('warn', `${label} : le jour commence hors de la grille de ${slot} min.`, { dayId: day.id });
    if (c.seqs.length === 0) push('warn', `${label} : aucune séquence.`, { dayId: day.id });
    else if (c.plannedEnd > c.end) push('error', `${label} : dépassement de ${c.plannedEnd - c.end} min (fin prévue ${hm(c.plannedEnd)} pour ${hm(c.end)}).`, { dayId: day.id });
    else if (c.plannedEnd < c.end) push('warn', `${label} : ${c.end - c.plannedEnd} min non planifiées avant ${hm(c.end)}.`, { dayId: day.id });

    let sincePause = 0;
    c.seqs.forEach(s => {
      stats.total += s.duration_minutes;
      stats[s.kind || 'collectif'] = (stats[s.kind || 'collectif'] || 0) + s.duration_minutes;
      if (s.diamond) stats[s.diamond] += s.duration_minutes;
      stats.byType[s.block_type] = (stats.byType[s.block_type] || 0) + s.duration_minutes;
      if (s.duration_minutes % slot) push('warn', `« ${s.title} » : ${s.duration_minutes} min ne tombe pas sur la grille de ${slot} min.`, { dayId: day.id, seqId: s.id });
      if (s.kind !== 'pause' && !s.intention?.trim()) push('warn', `« ${s.title} » n'a pas d'intention.`, { dayId: day.id, seqId: s.id });
      if (s.kind === 'pause') sincePause = 0;
      else {
        sincePause += s.duration_minutes;
        if (sincePause > 120 && sincePause - s.duration_minutes <= 120) push('warn', `${label} : plus de 2 h sans pause autour de « ${s.title} ». Un groupe fatigue au bout de 90 min.`, { dayId: day.id, seqId: s.id });
      }
      if (s.kind === 'apport' && s.duration_minutes > 30) push('tip', `« ${s.title} » : apport de ${s.duration_minutes} min. Au-delà de 20 à 30 min, l'attention décroche.`, { dayId: day.id, seqId: s.id });
    });
  });

  const bench = blocks.filter(b => !b.day_id);
  if (bench.length) push('tip', `${bench.length} séquence${bench.length > 1 ? 's' : ''} sur le banc, pas encore placée${bench.length > 1 ? 's' : ''} dans un jour.`);

  const work = stats.collectif + stats.apport;
  const actif = work ? Math.round((stats.collectif / work) * 100) : 0;
  const repere = RATIO_REPERES[meta.event_type === 'formation' ? 'formation' : 'seminaire'];
  if (work >= 60 && actif < repere.actif) push('tip', `${actif} % de travail actif. Repère Insuffle : ${repere.label.toLowerCase()}.`);

  const hasDiamond = stats.diverger + stats.converger + stats.groan > 0;
  if (hasDiamond && stats.diverger > 0 && stats.converger === 0) push('tip', 'On ouvre sans jamais converger. Prévoyez un temps pour filtrer et décider.');
  if (hasDiamond && stats.converger > 0 && stats.diverger === 0) push('tip', 'On converge sans avoir ouvert. Risque de conclusion hâtive.');

  const hasOpen = blocks.some(b => b.day_id && ['ouverture', 'icebreaker'].includes(b.block_type));
  const hasClose = blocks.some(b => b.day_id && b.block_type === 'cloture');
  if (blocks.length > 2 && !hasOpen) push('tip', 'Pas de séquence d\'ouverture : où pose-t-on le cadre et les règles du jeu ?');
  if (blocks.length > 2 && !hasClose) push('tip', 'Pas de clôture : où mesure-t-on le chemin parcouru (Avant / Après, ROTI) ?');

  return { issues, stats: { ...stats, actif, repere } };
}

// Remplace les tirets longs par une ponctuation acceptable
export function stripDashes(text) {
  if (!text) return text;
  return String(text).replace(/\s*[—–]\s*/g, (match, offset, str) => {
    const before = str.slice(0, offset).trim();
    if (!before) return '';
    return /[.!?:]$/.test(before) ? ' ' : ', ';
  });
}

// Orientation A4 : portrait jusqu'à 32 créneaux de 15 min (8 h), paysage au-delà
export function pageOrientation(days, blocks, override = 'auto') {
  if (override === 'portrait' || override === 'paysage') return override;
  const maxSlots = Math.max(0, ...days.map(d => {
    const c = computeDay(d, blocks);
    return (Math.max(c.end, c.plannedEnd) - c.start) / 15;
  }));
  return maxSlots > 32 ? 'paysage' : 'portrait';
}

// Paysage : deux colonnes matin / après-midi, coupées à la pause la plus proche du milieu
export function splitColumns(seqs, landscape) {
  if (!landscape || seqs.length < 2) return [{ title: '', seqs }];
  const mid = (seqs[0].start + seqs[seqs.length - 1].end) / 2;
  const pauses = seqs.map((s, i) => [s, i]).filter(([s]) => s.kind === 'pause');
  const i = pauses.length
    ? pauses.reduce((best, cur) => (Math.abs(cur[0].start - mid) < Math.abs(best[0].start - mid) ? cur : best))[1]
    : Math.floor(seqs.length / 2);
  const left = seqs.slice(0, i + 1);
  const right = seqs.slice(i + 1);
  if (!right.length) return [{ title: '', seqs }];
  return [{ title: 'Matin', seqs: left }, { title: 'Après-midi', seqs: right }];
}

export function slugify(s) {
  return String(s || 'planning').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'planning';
}

export function downloadFile(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
