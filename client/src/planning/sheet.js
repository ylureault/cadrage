// Pages A4 Insuffle générées en HTML autonome.
// Un seul rendu pour l'aperçu (iframe), l'impression PDF et le fichier HTML modifiable.
// Le planning client reprend la charte « planning-temps-collectif » : une page A4 par jour,
// question-titre, intention, créneaux de 15 min, 2 à 4 colonnes, encadré, logo.

import logoSvgRaw from '../assets/logo-insuffle.svg?raw';
import { CHARTES, KINDS, HORIZONS, CRITERION_STATUS, ACTION_STATUS, REVIEW_CRITERIA, REVIEW_SCALE, DIAMOND, BLOCK_TYPES } from './constants.js';
import { computeDay, hm, fmtDur, pageOrientation, splitColumns, dayLabel, formatDate, sequencesOf } from './utils.js';

const LOGO = logoSvgRaw.replace(/<\?xml.*?\?>/, '').trim();

export const E = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nl = (s) => E(s).replace(/\n/g, '<br>');

function logoHtml(P) {
  const academie = P.key === 'academie'
    ? '<span class="logo-sub">Académie</span>' : '';
  return `<span class="logo" aria-label="${E(P.entite)}">${LOGO}${academie}</span>`;
}

const BASE_CSS = (P) => `
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { background: #fff }
body { font-family: Poppins, system-ui, sans-serif; color: ${P.txt}; text-rendering: geometricPrecision; font-kerning: normal; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.logo { display: inline-flex; align-items: flex-end; gap: 1.6mm; height: 9mm; color: ${P.main} }
.logo svg { height: 100%; width: auto; display: block }
.logo-sub { font-size: 8pt; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${P.main}; line-height: 1; padding-bottom: .4mm }
.kicker { font-size: 7pt; letter-spacing: .12em; text-transform: uppercase; color: ${P.grey}; text-align: right; line-height: 1.5 }
.tag { flex: none; font-size: 6.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; background: ${P.main}; color: #fff; padding: .6mm 2mm; border-radius: 1mm }
`;

// ---------- Planning client (une page par jour) ----------
const PLANNING_CSS = (P, o) => `
@page { size: A4 ${o.landscape ? 'landscape' : 'portrait'}; margin: 0 }
.page { width: ${o.W}mm; height: ${o.H}mm; padding: 11mm 12mm 9mm; display: flex; flex-direction: column; page-break-after: always; break-after: page; overflow: hidden; position: relative; background: #fff }
.page:last-child { page-break-after: auto; break-after: auto }
.top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5mm }
h1 { font-size: ${o.h1}pt; line-height: 1.12; font-weight: 700; color: ${P.main}; margin-bottom: 3mm }
h1::after { content: ''; display: block; width: 18mm; height: 1.3mm; background: ${P.accent}; border-radius: .6mm; margin-top: 2.4mm }
.intent { display: flex; gap: 3mm; align-items: baseline; font-size: 9.5pt; line-height: 1.4; margin-bottom: 3mm }
.band { font-size: 7.5pt; color: ${P.grey}; border-top: .3mm solid ${P.line}; border-bottom: .3mm solid ${P.line}; padding: 1.6mm 0; margin-bottom: 4mm }
.band b { color: ${P.txt}; font-weight: 600 }
.cols { flex: 1; display: flex; gap: 6mm; min-height: 0 }
.col { flex: 1; display: flex; flex-direction: column; min-height: 0 }
.coltitle { font-size: 7pt; font-weight: 700; color: ${P.main}; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 1mm }
.head, .blk .in { display: grid; grid-template-columns: ${o.grid}; column-gap: 2.5mm }
.head { font-size: 6.3pt; font-weight: 600; color: ${P.grey}; text-transform: uppercase; letter-spacing: .08em; padding: 0 0 1.2mm 9mm }
.grid { position: relative; flex: 1; margin-left: 9mm }
.tick { position: absolute; left: -9mm; right: 0; border-top: .2mm dotted ${P.line} }
.tick.h { border-top: .25mm solid ${P.line} }
.tick i { position: absolute; left: 0; top: -1.6mm; font-style: normal; font-size: 6pt; color: ${P.grey}; background: #fff; padding-right: 1mm }
.tick.h i { font-weight: 700; color: ${P.txt}; font-size: 6.8pt }
.blk { position: absolute; left: 0; right: 0; padding: .6mm 0 }
.blk .in { grid-template-rows: 1fr; height: 100%; background: #fff; border: .3mm solid ${P.line}; border-left: 1.4mm solid ${P.main}; border-radius: 1.2mm; padding: 1.2mm 2mm; overflow: hidden; font-size: var(--fs, 7.6pt); line-height: 1.3 }
.blk.apport .in { border-left-color: ${P.accent}; background: ${P.soft} }
.blk.pause .in { display: flex; align-items: center; border: none; background: repeating-linear-gradient(135deg, #F3F3F3 0 2mm, #FAFAFA 2mm 4mm); color: ${P.grey}; font-size: 7pt; letter-spacing: .1em; text-transform: uppercase }
.blk.over .in { box-shadow: inset 0 0 0 .5mm #ef4444 }
.t { font-weight: 700; color: ${P.main} } .d { display: block; font-size: 6pt; color: ${P.grey}; font-weight: 400 }
.p { font-weight: 600 }
.box { margin-top: 4mm; background: ${P.soft}; border-left: 1.4mm solid ${P.accent}; border-radius: 1.2mm; padding: 2.6mm 3.5mm }
.box h2 { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: ${P.main}; margin-bottom: 1.5mm }
.box ol { list-style: none; display: grid; grid-template-columns: repeat(var(--boxcols, 1), 1fr); gap: 1.2mm 5mm }
.box li { font-size: 7.8pt; line-height: 1.35 } .box li b { color: ${P.main} }
.foot { margin-top: 2.5mm; display: flex; justify-content: space-between; font-size: 6.5pt; color: ${P.grey} }
.empty { flex: 1; display: flex; align-items: center; justify-content: center; color: ${P.grey}; font-size: 9pt; border: .3mm dashed ${P.line}; border-radius: 2mm }
`;

function planningCell(s, cols) {
  if (s.kind === 'pause') return `<div class="in"><span class="ed">${E(s.title)}</span></div>`;
  const parts = [`<div><span class="t ed">${E(s.title)}</span><span class="d">${hm(s.start)} · ${s.duration_minutes} min</span></div>`];
  for (const c of cols.slice(1)) {
    parts.push(`<div class="ed${c === 'production' ? ' p' : ''}">${E(s[c] || '')}</div>`);
  }
  return `<div class="in">${parts.join('')}</div>`;
}

function planningPage({ space, meta, day, index, nDays, blocks, P, landscape, cols }) {
  const c = computeDay(day, blocks);
  const labels = { sequence: 'Séquence', intention: 'Intention', format: 'Format', production: 'Ce qui en sort' };
  const groups = splitColumns(c.seqs, landscape);
  const colsHtml = c.seqs.length === 0
    ? '<div class="empty">Aucune séquence pour ce jour.</div>'
    : groups.map(g => {
      const t0 = g.seqs[0].start;
      const t1 = Math.max(g.seqs[g.seqs.length - 1].end, t0 + 15);
      const span = t1 - t0;
      let ticks = '';
      const first = Math.ceil(t0 / 15) * 15;
      for (let m = first; m <= t1; m += 15) {
        const h = m % 60 === 0;
        ticks += `<div class="tick${h ? ' h' : ''}" style="top:${((m - t0) / span * 100).toFixed(3)}%"><i>${h ? hm(m) : m % 60}</i></div>`;
      }
      const blks = g.seqs.map(s => `<div class="blk ${E(s.kind || 'collectif')}" data-seq="${E(s.id)}" style="top:${((s.start - t0) / span * 100).toFixed(3)}%;height:${((s.end - s.start) / span * 100).toFixed(3)}%">${planningCell(s, cols)}</div>`).join('');
      const head = `<div class="head">${cols.map(k => `<div>${labels[k]}</div>`).join('')}</div>`;
      return `<div class="col">${g.title ? `<div class="coltitle">${g.title}</div>` : ''}${head}<div class="grid">${ticks}${blks}</div></div>`;
    }).join('');

  const window = `${hm(c.start)} à ${hm(Math.max(c.end, c.plannedEnd))}` + (meta.accueil ? ` (${E(meta.accueil)})` : '');
  const dateStr = day.date ? formatDate(day.date) : (index === 0 && space?.session_date ? formatDate(space.session_date) : 'Date à confirmer');
  const band = [
    space?.client_name ? `<b>${E(space.client_name)}</b>` : '',
    E(dateStr), window, E(meta.lieu),
    meta.participants ? `${E(meta.participants)} participants` : '',
    E(space?.facilitator),
  ].filter(Boolean).join(' · ');

  let box = '';
  const enc = day.encadre;
  if (enc && (enc.titre || enc.items?.length)) {
    const items = (enc.items || []).map(i => `<li class="ed"><b>${E(i.label)}</b> ${E(i.texte)}</li>`).join('');
    box = `<div class="box" style="--boxcols:${enc.colonnes === 2 ? 2 : 1}"><h2 class="ed">${E(enc.titre)}</h2><ol>${items}</ol></div>`;
  }

  const kicker = 'Planning du temps collectif' + (nDays > 1 ? ` · ${E(dayLabel(day, index).toLowerCase())} / ${nDays}` : '');
  return `<section class="page" data-day="${E(day.id)}">
<div class="top">${logoHtml(P)}<div class="kicker">${kicker}<br>${E(meta.reference)}</div></div>
<h1 class="ed">${E(meta.question || 'Votre question-titre ?')}</h1>
<div class="intent"><span class="tag">Intention</span><span class="ed">${E(meta.intention || 'Ce qu\'on aimerait avoir obtenu à la fin.')}</span></div>
<div class="band ed">${band}</div>
<div class="cols">${colsHtml}</div>${box}
<div class="foot"><span class="ed">${E(meta.footer_note)}</span><span>${E(P.entite)}</span></div>
</section>`;
}

// ---------- Fiche animateur (document interne) ----------
const DOC_CSS = (P) => `
@page { size: A4 portrait; margin: 14mm 12mm 16mm }
.doc { max-width: 186mm; margin: 0 auto; background: #fff }
.doc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5mm }
.doc h1 { font-size: 17pt; line-height: 1.15; font-weight: 700; color: ${P.main}; margin-bottom: 2.5mm }
.doc h1::after { content: ''; display: block; width: 16mm; height: 1.2mm; background: ${P.accent}; border-radius: .6mm; margin-top: 2mm }
.doc .intent { display: flex; gap: 3mm; align-items: baseline; font-size: 9pt; line-height: 1.4; margin-bottom: 3mm }
.doc .band { font-size: 7.5pt; color: ${P.grey}; border-top: .3mm solid ${P.line}; border-bottom: .3mm solid ${P.line}; padding: 1.6mm 0; margin-bottom: 5mm }
.doc .band b { color: ${P.txt} }
.doc h2 { font-size: 10pt; font-weight: 700; color: ${P.main}; text-transform: uppercase; letter-spacing: .08em; margin: 6mm 0 2.5mm; display: flex; justify-content: space-between; align-items: baseline; break-after: avoid }
.doc h2 small { font-size: 7.5pt; color: ${P.grey}; letter-spacing: 0; text-transform: none; font-weight: 500 }
.seq { border: .3mm solid ${P.line}; border-left: 1.4mm solid ${P.main}; border-radius: 1.2mm; padding: 2.4mm 3mm; margin-bottom: 2mm; break-inside: avoid; font-size: 8pt; line-height: 1.4 }
.seq.apport { border-left-color: ${P.accent}; background: ${P.soft} }
.seq.pause { border: none; background: repeating-linear-gradient(135deg, #F3F3F3 0 2mm, #FAFAFA 2mm 4mm); color: ${P.grey}; text-transform: uppercase; letter-spacing: .1em; font-size: 7pt; padding: 1.6mm 3mm }
.seq-h { display: flex; gap: 3mm; align-items: baseline; margin-bottom: 1mm }
.seq-h .time { font-weight: 700; color: ${P.main}; min-width: 22mm; font-size: 8.5pt }
.seq-h .title { font-weight: 700; font-size: 9pt; color: ${P.main}; flex: 1 }
.seq-h .dur { color: ${P.grey}; font-size: 7.5pt }
.chips { display: flex; flex-wrap: wrap; gap: 1mm; margin: .6mm 0 1.2mm 25mm }
.chip { font-size: 6.3pt; padding: .3mm 1.6mm; border-radius: 3mm; background: #F1F1F1; color: ${P.grey}; font-weight: 600 }
.row { display: grid; grid-template-columns: 22mm 1fr; gap: 3mm; margin-top: .6mm }
.row .k { font-size: 6.5pt; text-transform: uppercase; letter-spacing: .08em; color: ${P.grey}; font-weight: 600; padding-top: .3mm }
.row.warn .v { color: #9a5b00 }
.list { font-size: 8pt; line-height: 1.5; padding-left: 4mm }
.doc-wrap { width: 100%; border-collapse: collapse } .doc-wrap > tbody > tr > td, .doc-wrap > tfoot > tr > td { padding: 0 }
.doc-foot { display: flex; justify-content: space-between; align-items: center; font-size: 6.5pt; color: ${P.grey}; border-top: .3mm solid ${P.line}; padding-top: 2mm; margin-top: 4mm }
.doc-foot .logo { height: 4.5mm }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; margin-bottom: 4mm }
.kpi { border: .3mm solid ${P.line}; border-radius: 1.2mm; padding: 2.4mm 3mm }
.kpi b { display: block; font-size: 14pt; color: ${P.main}; line-height: 1.1 }
.kpi span { font-size: 6.8pt; color: ${P.grey}; text-transform: uppercase; letter-spacing: .06em }
table.t { width: 100%; border-collapse: collapse; font-size: 7.8pt; margin-bottom: 3mm }
table.t th { text-align: left; font-size: 6.4pt; text-transform: uppercase; letter-spacing: .08em; color: ${P.grey}; font-weight: 600; border-bottom: .4mm solid ${P.main}; padding: 1.2mm 1.5mm }
table.t td { border-bottom: .2mm solid ${P.line}; padding: 1.5mm; vertical-align: top }
.pill { display: inline-block; white-space: nowrap; font-size: 6.5pt; font-weight: 700; padding: .3mm 1.8mm; border-radius: 3mm; color: #fff }
.scale { display: flex; gap: 1mm; align-items: flex-end; height: 18mm; margin: 2mm 0 1mm }
.scale div { flex: 1; background: ${P.soft}; border-top: .8mm solid ${P.accent}; position: relative }
.scale-l { display: flex; gap: 1mm; font-size: 6.3pt; color: ${P.grey} } .scale-l span { flex: 1; text-align: center }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm }
.note { font-size: 7.5pt; color: ${P.grey}; font-style: italic; margin-bottom: 3mm }
`;

function docHeader({ space, meta, P, kicker }) {
  const band = [
    space?.client_name ? `<b>${E(space.client_name)}</b>` : '',
    space?.session_date ? E(formatDate(space.session_date, { day: 'numeric', month: 'long', year: 'numeric' })) : '',
    E(meta.lieu), meta.participants ? `${E(meta.participants)} participants` : '', E(space?.facilitator),
  ].filter(Boolean).join(' · ');
  return `<div class="doc-top">${logoHtml(P)}<div class="kicker">${E(kicker)}<br>${E(meta.reference)}</div></div>
<h1 class="ed">${E(meta.question || 'Votre question-titre ?')}</h1>
<div class="intent"><span class="tag">Intention</span><span class="ed">${E(meta.intention)}</span></div>
${band ? `<div class="band">${band}</div>` : ''}`;
}

// Le tfoot d'un tableau se répète sur chaque page imprimée : le logo reste visible partout
function docWrap(content, footer) {
  return `<table class="doc-wrap"><tfoot><tr><td>${footer}</td></tr></tfoot><tbody><tr><td>${content}</td></tr></tbody></table>`;
}

function docFooter(P, label) {
  return `<div class="doc-foot"><span>${E(label)} · outil de cadrage offert par ${E(P.entite)} · insuffle.com</span>${logoHtml(P)}</div>`;
}

function animateurBody({ space, meta, days, blocks, P }) {
  let html = `<div class="doc">${docHeader({ space, meta, P, kicker: 'Fiche animateur · document interne' })}`;
  const materials = [];
  days.forEach((day, i) => {
    const c = computeDay(day, blocks);
    html += `<h2>${E(dayLabel(day, i))}${day.date ? ` · ${E(formatDate(day.date))}` : ''}<small>${hm(c.start)} à ${hm(c.end)} · ${fmtDur(c.planned)} planifiées</small></h2>`;
    for (const s of c.seqs) {
      if (s.kind === 'pause') {
        html += `<div class="seq pause">${hm(s.start)} · ${E(s.title)} · ${s.duration_minutes} min</div>`;
        continue;
      }
      const chips = [
        KINDS[s.kind]?.label, BLOCK_TYPES[s.block_type]?.label, s.diamond ? DIAMOND[s.diamond]?.label : '',
      ].filter(Boolean).map(x => `<span class="chip">${E(x)}</span>`).join('');
      const row = (k, v, cls = '') => (v ? `<div class="row ${cls}"><span class="k">${k}</span><span class="v">${nl(v)}</span></div>` : '');
      html += `<div class="seq ${E(s.kind)}">
<div class="seq-h"><span class="time">${hm(s.start)} à ${hm(s.end)}</span><span class="title">${E(s.title)}</span><span class="dur">${s.duration_minutes} min</span></div>
<div class="chips">${chips}</div>
${row('Intention', s.intention)}${row('Format', s.format)}${row('Consignes', s.description)}${row('Ce qui en sort', s.production)}
${row('Matériel', s.material)}${row('Rôles', s.roles)}${row('Attention', s.attention_flag ? (s.attention_note || 'Point d\'attention') : '', 'warn')}${row('Notes', s.facilitator_notes)}
</div>`;
      if (s.material) materials.push({ seq: s.title, text: s.material });
    }
    if (day.encadre && (day.encadre.titre || day.encadre.items?.length)) {
      html += `<div class="seq apport"><b>${E(day.encadre.titre)}</b><ul class="list" style="list-style:none;padding-left:0">${(day.encadre.items || []).map(it => `<li><b>${E(it.label)}</b> ${E(it.texte)}</li>`).join('')}</ul></div>`;
    }
  });
  const bench = sequencesOf(blocks, null);
  if (bench.length) {
    html += `<h2>Sur le banc<small>séquences non placées</small></h2><ul class="list">${bench.map(b => `<li>${E(b.title)} · ${b.duration_minutes} min</li>`).join('')}</ul>`;
  }
  if (materials.length) {
    html += `<h2>Matériel à prévoir</h2><table class="t"><tr><th style="width:35%">Séquence</th><th>Matériel</th></tr>${materials.map(m => `<tr><td>${E(m.seq)}</td><td>${nl(m.text)}</td></tr>`).join('')}</table>`;
  }
  html += `</div>`;
  return docWrap(html, docFooter(P, `Fiche animateur · ${space?.client_name || ''}`));
}

// ---------- Fiche succès ----------
function voteStats(votes, kind) {
  const v = votes.filter(x => x.kind === kind).map(x => x.value);
  if (!v.length) return null;
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  return { n: v.length, avg, values: v };
}

export function successSummary(success) {
  const criteria = success?.criteria || [];
  const actions = success?.actions || [];
  const votes = success?.votes || [];
  const measured = criteria.filter(c => c.status !== 'a_mesurer');
  const score = measured.length
    ? Math.round((measured.reduce((a, c) => a + (c.status === 'atteint' ? 1 : c.status === 'partiel' ? 0.5 : 0), 0) / measured.length) * 100)
    : null;
  const live = actions.filter(a => a.status !== 'abandonne');
  const done = live.filter(a => a.status === 'fait').length;
  return {
    criteria: criteria.length, measured: measured.length, score,
    actions: live.length, done, actionRate: live.length ? Math.round((done / live.length) * 100) : null,
    avant: voteStats(votes, 'avant'), apres: voteStats(votes, 'apres'), roti: voteStats(votes, 'roti'),
  };
}

function successBody({ space, meta, success, P }) {
  const S = successSummary(success);
  const hz = Object.fromEntries(HORIZONS.map(h => [h.key, h.label]));
  const f1 = (x) => (x == null ? '·' : x.toFixed(1).replace('.', ','));
  const delta = S.avant && S.apres ? S.apres.avg - S.avant.avg : null;
  let html = `<div class="doc">${docHeader({ space, meta, P, kicker: 'Mesure du succès' })}
<div class="kpis">
<div class="kpi"><b>${S.score == null ? '·' : S.score + ' %'}</b><span>Critères atteints</span></div>
<div class="kpi"><b>${f1(S.avant?.avg)} → ${f1(S.apres?.avg)}</b><span>Avant / Après sur 10${delta != null ? ` · ${delta >= 0 ? '+' : ''}${f1(delta)}` : ''}</span></div>
<div class="kpi"><b>${S.roti ? f1(S.roti.avg) + ' / 5' : '·'}</b><span>ROTI${S.roti ? ` · ${S.roti.n} votes` : ''}</span></div>
<div class="kpi"><b>${S.actionRate == null ? '·' : S.actionRate + ' %'}</b><span>Actions faites · ${S.done}/${S.actions}</span></div>
</div>
<p class="note">La satisfaction (ROTI) ne dit pas le résultat. On la lit à côté des critères, jamais à leur place.</p>`;
  if (meta.scale_question) html += `<p class="note">Question de l'échelle Avant / Après : « ${E(meta.scale_question)} »</p>`;

  html += `<h2>C'est un succès si et seulement si…</h2>`;
  if (success?.criteria?.length) {
    html += `<table class="t"><tr><th style="width:32%">Critère</th><th style="width:26%">Ce qu'on observe</th><th>Échéance</th><th>Cible</th><th>Statut</th><th style="width:20%">Constat</th></tr>`;
    for (const c of success.criteria) {
      const st = CRITERION_STATUS[c.status] || CRITERION_STATUS.a_mesurer;
      html += `<tr><td>${nl(c.statement)}</td><td>${nl(c.indicator)}</td><td>${E(hz[c.horizon] || '')}</td><td>${E(c.target)}</td><td><span class="pill" style="background:${st.color}">${st.label}</span></td><td>${nl(c.result_note)}</td></tr>`;
    }
    html += `</table>`;
  } else html += `<p class="note">Aucun critère défini.</p>`;

  html += `<h2>La suite : qui fait quoi, pour quand</h2>`;
  if (success?.actions?.length) {
    html += `<table class="t"><tr><th style="width:40%">Action</th><th>Qui</th><th>Pour quand</th><th>Statut</th><th style="width:22%">Note</th></tr>`;
    for (const a of success.actions) {
      const st = ACTION_STATUS[a.status] || ACTION_STATUS.a_faire;
      const due = a.due_date ? formatDate(a.due_date, { day: 'numeric', month: 'short', year: 'numeric' }) : (hz[a.horizon] || '');
      html += `<tr><td>${nl(a.what)}</td><td>${E(a.who)}</td><td>${E(due)}</td><td><span class="pill" style="background:${st.color}">${st.label}</span></td><td>${nl(a.note)}</td></tr>`;
    }
    html += `</table>`;
  } else html += `<p class="note">Aucune action.</p>`;

  const dist = (st, max) => {
    if (!st) return '<p class="note">Pas de vote.</p>';
    const counts = Array.from({ length: max }, (_, i) => st.values.filter(v => v === i + 1).length);
    const top = Math.max(1, ...counts);
    return `<div class="scale">${counts.map(n => `<div style="height:${Math.max(4, (n / top) * 100)}%" title="${n}"></div>`).join('')}</div><div class="scale-l">${counts.map((n, i) => `<span>${i + 1}${n ? ` (${n})` : ''}</span>`).join('')}</div>`;
  };
  html += `<div class="two"><div><h2>Avant<small>${S.avant ? `${S.avant.n} votes` : ''}</small></h2>${dist(S.avant, 10)}</div><div><h2>Après<small>${S.apres ? `${S.apres.n} votes` : ''}</small></h2>${dist(S.apres, 10)}</div></div>`;

  const reviewed = (success?.review || []).filter(r => r.score > 0 || r.note);
  if (reviewed.length) {
    html += `<h2>Regard du facilitateur</h2><table class="t"><tr><th style="width:26%">Critère</th><th style="width:18%">Niveau</th><th>Note</th></tr>`;
    for (const rc of REVIEW_CRITERIA) {
      const r = success.review.find(x => x.criterion === rc.key);
      if (!r || (!r.score && !r.note)) continue;
      html += `<tr><td>${E(rc.label)}</td><td>${E(REVIEW_SCALE[r.score] || '')}</td><td>${nl(r.note)}</td></tr>`;
    }
    html += `</table>`;
  }
  html += `</div>`;
  return docWrap(html, docFooter(P, `Mesure du succès · ${space?.client_name || ''}`));
}

// ---------- Assemblage ----------
const EDIT_UI = (P) => `<style>
@media screen { body { background: #E9E7E1; padding: 64px 0 40px } .page, .doc { margin: 0 auto 24px; box-shadow: 0 2px 18px rgba(0,0,0,.12) } .doc { padding: 14mm 12mm; max-width: 210mm }
 .ed:hover { outline: 1px dashed ${P.accent}; outline-offset: 1px } .ed:focus { outline: 2px solid ${P.accent}; outline-offset: 1px }
 .bar { position: fixed; top: 0; left: 0; right: 0; z-index: 9; display: flex; gap: 10px; align-items: center; padding: 10px 16px; background: ${P.main}; color: #fff; font: 13px Poppins, sans-serif }
 .bar button { white-space: nowrap; font: 600 13px Poppins, sans-serif; border: 0; border-radius: 6px; padding: 7px 14px; background: ${P.accent}; color: ${P.main}; cursor: pointer }
 .bar button.alt { background: #fff } .bar span { opacity: .8 } .doc-wrap { max-width: 210mm; margin: 0 auto 24px; background: #fff; box-shadow: 0 2px 18px rgba(0,0,0,.12) } .doc-wrap .doc { box-shadow: none; margin: 0 } .doc-foot { padding: 2mm 12mm 6mm } }
@media print { .bar { display: none } }
</style>`;
const EDIT_BAR = `<div class="bar"><button onclick="window.print()">Imprimer / PDF</button><button class="alt" id="save">Enregistrer ce fichier</button>
<span>Cliquez sur un texte pour le modifier. Pour un PDF : Imprimer, destination PDF, format A4, marges aucune, graphiques d'arrière-plan cochés.</span></div>`;
const EDIT_JS = `<script>document.querySelectorAll('.ed').forEach(e => e.setAttribute('contenteditable', 'true'));
document.getElementById('save').onclick = () => { const h = '<!doctype html>' + document.documentElement.outerHTML;
 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([h], {type: 'text/html'}));
 a.download = (document.title || 'planning') + '.html'; a.click(); };</script>`;

// Réduit la police des blocs jusqu'à 7 pt si un texte déborde, puis signale ce qui déborde encore.
const FIT_JS = `<script>(function(){
 function fit(){ var fs = 7.6, root = document.documentElement, over = [];
  function check(){ over = []; document.querySelectorAll('.blk').forEach(function(b){ var i = b.querySelector('.in'); b.classList.remove('over');
    if (i && i.scrollHeight > i.clientHeight + 1) over.push(b); }); return over.length; }
  root.style.setProperty('--fs', fs + 'pt');
  while (check() && fs > 7.0) { fs = Math.round((fs - 0.2) * 10) / 10; root.style.setProperty('--fs', fs + 'pt'); }
  over.forEach(function(b){ b.classList.add('over'); });
  var msg = { type: 'sheet-fit', fs: fs, overflow: over.map(function(b){ return b.getAttribute('data-seq'); }), height: document.body.scrollHeight };
  if (window.parent && window.parent !== window) window.parent.postMessage(msg, '*');
  return msg; }
 window.__fit = fit;
 (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){ fit(); if (window.__autoprint) setTimeout(function(){ window.print(); }, 250); });
 document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('[data-seq]');
  if (b && window.parent && window.parent !== window && !document.body.classList.contains('editable')) window.parent.postMessage({ type: 'sheet-click', seq: b.getAttribute('data-seq') }, '*'); });
})();</script>`;

// Poppins servie par l'outil (adresse absolue : le fichier HTML téléchargé la retrouve aussi), Google Fonts en secours
function fontsHtml() {
  const origin = typeof window !== 'undefined' && /^https?:/.test(window.location.origin) ? window.location.origin : 'https://cadrage.insuffle.com';
  const faces = [400, 500, 600, 700].map(w => `@font-face{font-family:'Poppins';font-style:normal;font-weight:${w};font-display:swap;src:url('${origin}/fonts/poppins-latin-${w}-normal.woff2') format('woff2')}`).join('');
  return `<style>${faces}</style><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">`;
}

/**
 * variant : 'planning' | 'animateur' | 'succes'
 * mode : 'preview' (iframe) | 'print' (s'imprime à l'ouverture) | 'editable' (fichier autonome modifiable)
 */
export function buildSheetHtml({ variant = 'planning', mode = 'preview', space, meta = {}, days = [], blocks = [], success = null, dayIds = null }) {
  const P = CHARTES[meta.charte] || CHARTES.insuffle;
  const title = `${variant === 'planning' ? 'planning' : variant === 'animateur' ? 'fiche-animateur' : 'mesure-du-succes'}-${(space?.client_name || 'insuffle').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  let css = BASE_CSS(P);
  let body = '';
  const shownDays = dayIds ? days.filter(d => dayIds.includes(d.id)) : days;

  if (variant === 'planning') {
    const orient = pageOrientation(shownDays, blocks, meta.orientation);
    const landscape = orient === 'paysage';
    const cols = (meta.planning_columns?.length ? meta.planning_columns : ['sequence', 'intention', 'format', 'production']);
    const grid = { 4: '1.15fr 1.35fr 1.25fr .9fr', 3: '1.2fr 1.5fr 1.1fr', 2: '1fr 1.4fr' }[cols.length] || '1fr';
    css += PLANNING_CSS(P, { landscape, W: landscape ? 297 : 210, H: landscape ? 210 : 297, grid, h1: landscape ? 19 : 21 });
    const list = shownDays.length ? shownDays : [{ id: '_', label: 'Jour 1', start_time: '09:00', end_time: '12:00' }];
    body = list.map((day) => planningPage({ space, meta, day, index: days.indexOf(day) >= 0 ? days.indexOf(day) : 0, nDays: days.length || 1, blocks, P, landscape, cols })).join('');
  } else if (variant === 'animateur') {
    css += DOC_CSS(P);
    body = animateurBody({ space, meta, days: shownDays, blocks, P });
  } else {
    css += DOC_CSS(P);
    body = successBody({ space, meta, success, P });
  }

  const screenCss = mode === 'preview'
    ? `<style>@media screen { html, body { background: transparent } body { padding: 0 } .page { margin: 0 auto 10mm; box-shadow: 0 1px 8px rgba(0,0,0,.14) } .doc-wrap { background: #fff; box-shadow: 0 1px 8px rgba(0,0,0,.14) } .doc { padding: 12mm 12mm 0 } .doc-foot { padding: 2mm 12mm 8mm } [data-seq] { cursor: pointer } [data-seq]:hover .in { box-shadow: 0 0 0 .6mm ${P.accent} } }</style>`
    : mode === 'print' ? '<style>@media screen { body { background: #E9E7E1; padding: 20px 0 } .page { margin: 0 auto 20px } .doc-wrap { max-width: 210mm; margin: 0 auto; background: #fff } .doc { padding: 14mm 12mm 0 } .doc-foot { padding: 2mm 12mm 8mm } }</style>' : EDIT_UI(P);

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${E(title)}</title>${fontsHtml()}<style>${css}</style>${screenCss}</head><body${mode === 'editable' ? ' class="editable"' : ''}>${mode === 'editable' ? EDIT_BAR : ''}${body}${mode === 'print' ? '<script>window.__autoprint = true;</script>' : ''}${FIT_JS}${mode === 'editable' ? EDIT_JS : ''}</body></html>`;
}

export function sheetFileName(variant, space) {
  const slug = (space?.client_name || 'insuffle').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'insuffle';
  const base = variant === 'planning' ? 'planning' : variant === 'animateur' ? 'fiche-animateur' : 'mesure-du-succes';
  return `${base}-${slug}`;
}

// Ouvre la page dans un nouvel onglet et lance l'impression (PDF via « Enregistrer en PDF »)
export function printSheet(opts) {
  const html = buildSheetHtml({ ...opts, mode: 'print' });
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
