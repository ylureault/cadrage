// Le moteur de recommandation Insuffle.
// L'outil est offert : il fait connaître Insuffle et Insuffle Académie, mais au bon moment et avec la bonne offre.
// On lit le cadrage (type de temps, situation du collectif, date, taille, équilibre, bilan du facilitateur),
// on note chaque message, on écarte ce qui a été refermé ou trop vu, on garde le plus pertinent.
// Règles : pas de prix, rien d'inventé, pas de tiret cadratin, un seul message par emplacement.

import { CONTACT, FORMATIONS, OFFRES_INSUFFLE, OUTILS, PREMIER_ECHANGE, RELAIS_SITUATION } from './insuffle.js';

const DAY = 86400000;
const offre = (k) => OFFRES_INSUFFLE.find(o => o.key === k);
const formation = (k) => FORMATIONS.find(f => f.key === k);
const outil = (t) => OUTILS.find(o => o.titre === t);

export function withUtm(url, placement, id) {
  if (!url || !/^https?:/.test(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'cadrage');
    u.searchParams.set('utm_medium', 'outil-gratuit');
    if (placement) u.searchParams.set('utm_campaign', placement);
    if (id) u.searchParams.set('utm_content', id);
    return u.toString();
  } catch { return url; }
}

function toDate(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  const d = new Date(`${s.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Ce que l'on sait du cadrage, réduit à quelques signaux lisibles
export function promoSignals(state, now = Date.now()) {
  const meta = state?.planning || {};
  const space = state?.space || {};
  const blocks = (state?.blocks || []).filter(b => b.day_id);
  const days = state?.agendaDays || [];
  let collectif = 0, apport = 0;
  for (const b of blocks) {
    const m = Number(b.duration_minutes) || 0;
    if (b.kind === 'apport') apport += m; else if (b.kind !== 'pause') collectif += m;
  }
  const work = collectif + apport;
  const dates = [space.session_date, ...days.map(d => d.date)].map(toDate).filter(Boolean).sort((a, b) => a - b);
  const first = dates[0];
  const last = dates[dates.length - 1];
  const today = new Date(now); today.setHours(12, 0, 0, 0); // on compte en jours de calendrier
  const daysUntil = first ? Math.round((first.getTime() - today.getTime()) / DAY) : null;
  const daysSince = last ? Math.round((today.getTime() - last.getTime()) / DAY) : null;
  const review = state?.success?.review || [];
  const scored = review.filter(r => r.score > 0);
  const weak = scored.filter(r => r.score <= 2).map(r => r.criterion);
  const votes = state?.success?.votes || [];
  const avg = (k) => { const v = votes.filter(x => x.kind === k); return v.length ? v.reduce((a, x) => a + x.value, 0) / v.length : null; };
  const participants = parseInt(meta.participants, 10) || 0;
  return {
    eventType: meta.event_type || '',
    situation: meta.situation || '',
    academie: meta.charte === 'academie',
    participants,
    dayCount: days.length,
    seqCount: blocks.length,
    apportPct: work >= 60 ? Math.round((apport / work) * 100) : null,
    daysUntil,
    daysSince,
    after: daysSince != null && daysSince >= 1,
    weakReview: weak,
    reviewed: scored.length,
    gain: avg('avant') != null && avg('apres') != null ? Math.round((avg('apres') - avg('avant')) * 10) / 10 : null,
    criteria: (state?.success?.criteria || []).length,
    actions: (state?.success?.actions || []).length,
    actionsSansPorteur: (state?.success?.actions || []).filter(a => !String(a.who || '').trim()).length,
    facilitator: !!state?.isFacilitator || (state?.facilitators || []).length === 0,
  };
}

const plural = (n, s = 's') => (n > 1 ? s : '');

// Le catalogue. Chaque message dit pourquoi il apparaît (« why ») : la recommandation reste transparente.
// score(s) renvoie 0 quand le message ne s'applique pas ; plus il est haut, plus il est pertinent.
export const PROMOS = [
  {
    id: 'j-moins', brand: 'insuffle', placements: ['conception', 'agenda', 'moment'],
    score: s => (s.facilitator && s.daysUntil != null && s.daysUntil >= 1 && s.daysUntil <= 21 ? 70 + (21 - s.daysUntil) : 0),
    title: s => `J-${s.daysUntil}. Un regard extérieur sur votre déroulé ?`,
    text: () => `On relit votre planning avec vous et on vous dit ce qu'on changerait. ${PREMIER_ECHANGE}`,
    why: s => `Votre temps collectif a lieu dans ${s.daysUntil} jour${plural(s.daysUntil)}.`,
    cta: { label: 'Faire relire mon planning', mail: 'Relecture de notre planning' },
  },
  {
    id: 'situation', brand: 'insuffle', placements: ['conception', 'agenda'],
    score: s => (RELAIS_SITUATION[s.situation] ? 80 : 0),
    title: () => 'Un regard extérieur pour ce collectif ?',
    text: s => RELAIS_SITUATION[s.situation],
    why: s => `Vous avez situé le collectif sur « ${s.situation === 'denouer' ? 'Dénouer' : 'Traverser'} ».`,
    cta: { label: 'En parler 30 minutes', mail: 'Un collectif à dénouer' },
  },
  {
    id: 'codir', brand: 'insuffle', placements: ['conception', 'agenda', 'moment'],
    score: s => (s.eventType === 'codir' ? 75 : 0),
    title: () => 'Un CODIR ne se facilite pas de l\'intérieur.',
    text: () => offre('codir').texte,
    why: () => 'Vous préparez un séminaire CODIR.',
    cta: { label: 'Découvrir le séminaire CODIR', url: offre('codir').url },
    extra: { label: 'Flash CODIR, l\'autodiagnostic gratuit', url: outil('Flash CODIR').url },
  },
  {
    id: 'formation-academie', brand: 'academie', placements: ['conception', 'agenda', 'reperes', 'moment'],
    score: s => (s.eventType === 'formation' || s.academie ? 72 : 0),
    title: () => 'Former, c\'est aussi faciliter.',
    text: () => `${formation('facilitation').titre}, ${formation('facilitation').duree}. Pour concevoir des formations où l'on pratique plus qu'on n'écoute. Certifiée Qualiopi, finançable OPCO.`,
    why: () => 'Vous concevez une formation.',
    cta: { label: 'Voir la formation', url: formation('facilitation').url },
  },
  {
    id: 'apport', brand: 'insuffle', placements: ['conception', 'agenda'],
    score: s => (s.apportPct != null && s.apportPct > 30 ? 60 + Math.min(20, s.apportPct - 30) : 0),
    title: s => `${s.apportPct} % d'apport. Nous visons 30 %.`,
    text: () => 'Dans nos séminaires, 70 % du temps est du travail actif. C\'est là que le groupe produit et décide. On peut vous aider à rééquilibrer.',
    why: s => `Votre déroulé compte ${s.apportPct} % d'apport descendant.`,
    cta: { label: 'Voir nos séminaires', url: offre('seminaire').url },
  },
  {
    id: 'bilan-faible', brand: 'academie', placements: ['succes', 'reperes', 'moment'],
    score: s => (s.weakReview.length ? 85 + s.weakReview.length : 0),
    title: () => 'Ce qui est à travailler se travaille en formation.',
    text: s => `Votre bilan pointe ${s.weakReview.length} repère${plural(s.weakReview.length)} à travailler. ${formation('facilitation').titre} : ${formation('facilitation').duree}, 80 % pratique. Et pour les managers : ${formation('manager').titre}.`,
    why: s => `Bilan du facilitateur : ${s.weakReview.length} critère${plural(s.weakReview.length)} noté${plural(s.weakReview.length)} « À travailler » ou « En progrès ».`,
    cta: { label: 'Voir les formations', url: formation('facilitation').url },
  },
  {
    id: 'suivi', brand: 'insuffle', placements: ['succes', 'moment'],
    score: s => (s.after ? 78 : s.actions > 0 ? 50 : 30),
    title: s => (s.after ? 'Le séminaire est passé. Le succès se joue maintenant.' : 'Le succès se joue après le séminaire.'),
    text: s => `${s.actionsSansPorteur ? `${s.actionsSansPorteur} action${plural(s.actionsSansPorteur)} sans porteur. ` : ''}Insuffle porte le suivi à J+15 et J+90, et accompagne les transformations dans la durée avec le cycle Futur Désiré®.`,
    why: s => (s.after ? `Votre temps collectif a eu lieu il y a ${s.daysSince} jour${plural(s.daysSince)}.` : 'Vous posez les critères de succès.'),
    cta: { label: 'Parler du suivi', mail: 'Suivi après notre temps collectif' },
  },
  {
    id: 'gain', brand: 'insuffle', placements: ['succes', 'moment'],
    score: s => (s.gain != null && s.gain > 0 ? 65 : 0),
    title: s => `+${String(s.gain).replace('.', ',')} point${s.gain >= 2 ? 's' : ''} entre l'avant et l'après.`,
    text: () => 'Le mouvement est là. Pour qu\'il tienne, il faut l\'ancrer. C\'est le travail de l\'accompagnement Futur Désiré® : Observer, Désirer, Concevoir, Transformer.',
    why: () => 'Votes Avant et Après enregistrés.',
    cta: { label: 'Découvrir Futur Désiré®', url: offre('transformation').url },
  },
  {
    id: 'multi-jours', brand: 'insuffle', placements: ['conception', 'agenda'],
    score: s => (s.dayCount >= 2 ? 55 : 0),
    title: s => `${s.dayCount} jours, ça se conçoit à plusieurs.`,
    text: () => offre('seminaire').texte,
    why: s => `Votre planning compte ${s.dayCount} jours.`,
    cta: { label: 'Voir le séminaire sur-mesure', url: offre('seminaire').url },
  },
  {
    id: 'lancement', brand: 'insuffle', placements: ['conception', 'agenda'],
    score: s => (['lancement', 'parcours'].includes(s.eventType) ? 58 : 0),
    title: () => 'Un lancement, c\'est le début d\'un mouvement.',
    text: () => offre('transformation').texte,
    why: s => (s.eventType === 'parcours' ? 'Vous préparez un parcours en plusieurs temps.' : 'Vous préparez un lancement de projet.'),
    cta: { label: 'Découvrir Futur Désiré®', url: offre('transformation').url },
  },
  {
    id: 'grand-groupe', brand: 'insuffle', placements: ['conception', 'agenda'],
    score: s => (s.participants >= 40 ? 57 : 0),
    title: s => `${s.participants} participants : le cadre doit tenir.`,
    text: () => offre('facilitation').texte,
    why: s => `${s.participants} participants annoncés.`,
    cta: { label: 'Nous confier la facilitation', mail: 'Facilitation d\'un grand groupe' },
  },
  {
    id: 'distanciel', brand: 'insuffle', placements: ['conception', 'agenda', 'moment'],
    score: s => (s.eventType === 'distanciel' ? 52 : 0),
    title: () => 'À distance, le temps se voit ou se perd.',
    text: () => `${outil('Timer visuel').texte} Gratuit, comme cet outil.`,
    why: () => 'Vous préparez un atelier à distance.',
    cta: { label: 'Ouvrir le timer', url: outil('Timer visuel').url },
  },
  {
    id: 'manager', brand: 'academie', placements: ['conception', 'reperes'],
    score: s => (['reunion', 'retro', 'atelier', 'decision'].includes(s.eventType) ? 45 : 0),
    title: () => 'Animer son équipe, c\'est déjà faciliter.',
    text: () => `${formation('manager').titre}, ${formation('manager').duree}. ${formation('manager').public}. Certifiée Qualiopi, finançable OPCO.`,
    why: () => 'Vous préparez un temps avec votre équipe.',
    cta: { label: 'Voir la formation', url: formation('manager').url },
  },
  {
    id: 'reperes', brand: 'academie', placements: ['reperes'],
    score: () => 40,
    title: () => 'Ces repères, on les pratique en formation.',
    text: () => `${formation('facilitation').titre}, ${formation('facilitation').duree}, Insuffle Académie. 80 % pratique. Certifiée Qualiopi, finançable OPCO.`,
    why: () => 'Vous consultez les repères de facilitation.',
    cta: { label: 'Voir la formation', url: formation('facilitation').url },
  },
  {
    id: 'boussole', brand: 'insuffle', placements: ['conception', 'succes'],
    score: s => (!s.situation && s.seqCount < 3 ? 35 : 0),
    title: () => 'Avant de concevoir, faites le point.',
    text: () => `${outil('Boussole 4C').texte} Gratuit.`,
    why: () => 'Le cadrage démarre.',
    cta: { label: 'Ouvrir la Boussole 4C', url: outil('Boussole 4C').url },
  },
  {
    id: 'animer', brand: 'insuffle', placements: ['conception', 'agenda', 'succes', 'moment'],
    score: () => 20,
    title: () => 'Ce temps collectif, on peut aussi l\'animer.',
    text: () => 'Insuffle conçoit et facilite séminaires, CODIR et ateliers, partout en France. Le facilitateur n\'a pas d\'enjeu politique interne : c\'est ce qui libère la parole.',
    why: () => 'Message par défaut.',
    cta: { label: 'Parler de votre temps collectif', mail: 'Échange sur un temps collectif' },
  },
  {
    id: 'fondamentaux', brand: 'academie', placements: ['conception', 'agenda', 'reperes'],
    score: () => 18,
    title: () => 'Facilitateur, ça s\'apprend.',
    text: () => `${formation('fondamentaux').titre} en ${formation('fondamentaux').duree}, ou ${formation('facilitation').titre} en ${formation('facilitation').duree}. Certifiées Qualiopi, finançables OPCO.`,
    why: () => 'Message par défaut.',
    cta: { label: 'Découvrir Insuffle Académie', url: CONTACT.siteAcademie },
  },
  // Côté participant : on ne vend rien, on fait savoir d'où vient l'atelier
  {
    id: 'participant', brand: 'academie', placements: ['participant'],
    score: s => (!s.facilitator ? 50 : 0),
    title: () => 'Vous aussi, vous voulez animer comme ça ?',
    text: () => `Cet atelier a été préparé avec l'outil de cadrage gratuit d'Insuffle. Insuffle Académie forme à la facilitation : ${formation('facilitation').titre}, ${formation('manager').titre}.`,
    why: () => 'Vous participez à un atelier préparé avec cet outil.',
    cta: { label: 'Découvrir Insuffle Académie', url: CONTACT.siteAcademie },
    extra: { label: 'Créer mon propre cadrage', url: '/' },
  },
];

const STORE_KEY = 'insuffle-promo';
const DISMISS_MS = 30 * DAY;
const MAX_VIEWS = 6; // au-delà, le message se repose

export function readMemory() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { dismissed: {}, views: {} }; } catch { return { dismissed: {}, views: {} }; }
}
function writeMemory(m) { try { localStorage.setItem(STORE_KEY, JSON.stringify(m)); } catch { /* stockage indisponible */ } }

export function rememberView(id, placement) {
  const m = readMemory();
  m.views = m.views || {};
  m.views[id] = (m.views[id] || 0) + 1;
  m.last = { id, placement };
  writeMemory(m);
}
export function rememberDismiss(id, now = Date.now()) {
  const m = readMemory();
  m.dismissed = m.dismissed || {};
  m.dismissed[id] = now;
  writeMemory(m);
}

// Choisit le message le plus pertinent pour un emplacement.
// exclude : les messages déjà affichés ailleurs sur l'écran (on ne répète pas).
export function pickPromo(state, placement, { memory = readMemory(), exclude = [], now = Date.now() } = {}) {
  const s = promoSignals(state, now);
  const ranked = PROMOS
    .filter(p => p.placements.includes(placement) && !exclude.includes(p.id))
    .filter(p => !(memory.dismissed?.[p.id] && now - memory.dismissed[p.id] < DISMISS_MS))
    .map(p => {
      let score = p.score(s);
      if (!score) return null;
      const views = memory.views?.[p.id] || 0;
      if (views >= MAX_VIEWS) score -= 25; // lassitude : on laisse la place à un autre
      if (memory.last?.id === p.id && memory.last.placement !== placement) score -= 30; // on vient de le lire ailleurs
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  return ranked.length ? render(ranked[0].p, s, placement) : null;
}

function render(p, s, placement) {
  const link = (c) => (c?.url ? { label: c.label, href: withUtm(c.url, placement, p.id), external: /^https?:/.test(c.url) } : c ? { label: c.label, mail: c.mail } : null);
  return { id: p.id, brand: p.brand, title: p.title(s), text: p.text(s), why: p.why(s), cta: link(p.cta), extra: link(p.extra) };
}
