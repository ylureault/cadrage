// Du cadrage à la conception : les 8 polarités et la situation du collectif suggèrent des méthodes.
// Une suggestion n'est jamais un verdict : elle ouvre la bibliothèque au bon endroit, avec sa raison.

import { METHODS_BY_KEY } from './methods.js';

// Pour chaque polarité : ce qu'on propose quand le groupe penche à gauche (1-2) ou à droite (4-5)
const POLARITES = {
  decider_murir: { left: 'Décider', right: 'Faire mûrir', gauche: ['consentement', 'gradients-accord', 'vote-gommettes'], droite: ['1-2-4-tous', 'forum-ouvert', '9-pourquoi'] },
  agir_cap: { left: 'Agir ensemble', right: 'Porter le cap', gauche: ['projection-futur-desire', 'world-cafe'], droite: ['apport-futur-desire', 'boussole-4c'] },
  cadre_autonomie: { left: 'Tenir le cadre', right: 'Autonomie du groupe', gauche: ['regles-du-jeu', 'ouverture'], droite: ['forum-ouvert', 'troika'] },
  produire_explorer: { left: 'Produire', right: 'Explorer', gauche: ['chantier-90-jours', '15-pourcent', 'matrice-impact-effort'], droite: ['world-cafe', 'brainwriting', 'se-souvenir-du-futur'] },
  contenu_processus: { left: 'Contenu', right: 'Processus', gauche: ['apport-court', 'codev'], droite: ['regles-du-jeu', 'osbd', 'aquarium'] },
  recul_action: { left: 'Prendre du recul', right: 'Passer à l\'action', gauche: ['ligne-du-temps', 'what-so-what', 'carte-complexite'], droite: ['qui-quoi-quand', 'engagement-binome', '15-pourcent'] },
  ouvert_cible: { left: 'Ouvert', right: 'Ciblé', gauche: ['forum-ouvert', 'impromptu-networking'], droite: ['1-2-4-tous', 'consentement'] },
  serieux_ludique: { left: 'Sérieux', right: 'Énergie ludique', gauche: ['what-so-what', 'pre-mortem'], droite: ['photolangage', 'energizer', 'impromptu-networking'] },
};

const SITUATION = {
  explorer: { raison: 'Situation « Explorer » : on travaille le contenu', methodes: ['brainwriting', 'world-cafe', '1-2-4-tous'] },
  denouer: { raison: 'Situation « Dénouer » : on travaille ce que le groupe est', methodes: ['osbd', 'aquarium', 'triz'] },
  traverser: { raison: 'Situation « Traverser » : décider, puis transformer', methodes: ['carte-complexite', 'projection-futur-desire', 'consentement'] },
};

// Position retenue d'une polarité : la position finale du facilitateur, sinon la moyenne du groupe
export function polariteValue(key, axes = [], axesFinal = []) {
  const fin = axesFinal.find(a => a.axis_key === key && a.position);
  if (fin) return fin.position;
  const vals = axes.filter(a => a.axis_key === key && a.position != null).map(a => a.position);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

// Renvoie [{ method, raisons: [...] }] triées par nombre de raisons
export function suggestMethods({ axes = [], axesFinal = [], situation = '' } = {}) {
  const found = new Map();
  const add = (key, raison) => {
    const method = METHODS_BY_KEY[key];
    if (!method) return;
    const cur = found.get(key) || { method, raisons: [] };
    if (!cur.raisons.includes(raison)) cur.raisons.push(raison);
    found.set(key, cur);
  };
  for (const [key, p] of Object.entries(POLARITES)) {
    const v = polariteValue(key, axes, axesFinal);
    if (v == null) continue;
    if (v <= 2.4) p.gauche.forEach(m => add(m, `Côté « ${p.left} »`));
    else if (v >= 3.6) p.droite.forEach(m => add(m, `Côté « ${p.right} »`));
  }
  const s = SITUATION[situation];
  if (s) s.methodes.forEach(m => add(m, s.raison));
  return [...found.values()].sort((a, b) => b.raisons.length - a.raisons.length);
}
