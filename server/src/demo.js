// La démo NovaPulse : un cas fictif, construit pour montrer chaque fonction de l'outil.
// Les dates suivent le jour courant (jour 1 = aujourd'hui) : le bandeau Jour J, le mode salle
// et les échéances de la suite sont toujours vivants.

import { createPlanningStore } from './planning.js';
import { PHASES } from './canvas-data.js';

export const DEMO_ID = '6AG_demo';

const Y = ['Yoan Lureault', '#3498db'];
const C = ['Camille Lefèvre', '#e74c3c'];
const T = ['Thomas Nguyen', '#2ecc71'];
const S = ['Sarah Ben Ali', '#9b59b6'];
const M = ['Marc Dupont', '#f39c12'];
const L = ['Léa Martin', '#1abc9c'];

// Participants du séminaire qui votent l'échelle Avant / Après et le ROTI
const SALLE = ['Camille Lefèvre', 'Thomas Nguyen', 'Sarah Ben Ali', 'Marc Dupont', 'Léa Martin', 'Inès', 'Hugo', 'Julie', 'Karim', 'Paul', 'Nadia', 'Yoan Lureault'];
const AVANT = [3, 4, 2, 5, 3, 2, 4, 3, 2, 3, 4, 3];
const APRES = [7, 8, 6, 8, 7, 7, 9, 8, 6, 7, 8, 8];
const ROTI = [4, 5, 4, 4, 5, 4, 5, 4, 3, 4, 5, 5];

function isoDay(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// [phase, colonne, auteur, texte, { tags, reactions, discuss }]
const CARTES = [
  ['avant', 'clarifier_cadre', C, 'NovaPulse lève 8 M€ en série A et passe de 15 à 45 personnes en 6 mois. L\'équipe fondatrice sent qu\'elle perd la culture du début. Le board pousse à structurer sans étouffer.', { reactions: { '👍': ['Yoan Lureault', 'Thomas Nguyen'] } }],
  ['avant', 'clarifier_cadre', Y, 'Le vrai sujet n\'est pas la croissance mais l\'identité : qui sommes-nous à 45 quand on s\'est construit à 5 ?', { reactions: { '🔥': ['Camille Lefèvre', 'Sarah Ben Ali'], '💡': ['Thomas Nguyen'] }, discuss: true }],
  ['avant', 'clarifier_cadre', Y, '[Q] Pourquoi fait-on appel à vous maintenant ?\n\nDeux seniors sont partis en trois semaines. Le signal est clair : l\'ADN se dilue. Le séminaire doit poser un cadre avant la prochaine vague de recrutements.'],
  ['avant', 'clarifier_cadre', C, 'On a tenté un offsite l\'an dernier : slides, brainstorm, plan d\'action dans un tableur. Trois mois après, rien n\'avait bougé. Cette fois, il faut que ça transforme.', { tags: ['Question'] }],
  ['avant', 'clarifier_cadre', Y, '[Q] Qu\'est-ce qui a déjà été tenté et pourquoi ça n\'a pas marché ?\n\nL\'approche descendante ne prend pas. Camille est très horizontale, le board veut de la structure. Tension à travailler.'],
  ['avant', 'personnes_roles', C, 'Participants : 12 personnes. CODIR (5), responsables tech (3), responsable RH (1), opérations (2), nouveau COO arrivé il y a trois semaines.'],
  ['avant', 'personnes_roles', Y, 'Attention au COO : recruté pour « mettre de l\'ordre », l\'équipe tech le perçoit comme un contrôleur. Tension latente.', { tags: ['Urgent'], discuss: true }],
  ['avant', 'personnes_roles', Y, '[Q] Y a-t-il des personnes opposées à cette initiative ?\n\nPas ouvertement. Léa (CTO) est sceptique : « Encore un séminaire pour rien ». Il faut la convaincre dans la première demi-heure.'],
  ['avant', 'personnes_roles', S, 'Il manque quelqu\'un : les deux personnes qui sont parties. Leurs retours de départ devraient être partagés, anonymisés.', { tags: ['À valider'] }],
  ['avant', 'definir_succes', Y, 'C\'est un succès si chaque participant repart avec une action qu\'il porte lui-même, et si Léa dit « ça valait le coup » à la fin.', { reactions: { '👍': ['Camille Lefèvre', 'Sarah Ben Ali', 'Thomas Nguyen'] } }],
  ['avant', 'definir_succes', C, 'Livrable attendu : une charte culture en 5 points au plus, co-construite, remise à chaque nouvel arrivant.'],
  ['avant', 'definir_succes', C, '[Q] À quoi verra-t-on que ça a bougé ?\n\nDans 3 mois : au moins 3 rituels d\'équipe installés, et plus aucun départ lié à la culture.'],
  ['avant', 'definir_succes', T, 'Ne pas confondre satisfaction à la sortie et impact réel. Le vrai test, c\'est dans trois mois.', { reactions: { '💡': ['Yoan Lureault'] } }],
  ['avant', 'attentes', Y, 'Camille attend que je provoque les vraies conversations, pas un consensus mou. Elle veut que Marc (COO) et Léa (CTO) se parlent vraiment.'],
  ['avant', 'attentes', Y, 'Le board veut un plan d\'action structuré. L\'équipe veut être entendue. Tension entre les deux.', { discuss: true }],
  ['avant', 'attentes', T, 'L\'équipe tech connaît les rituels agiles. Réceptive aux formats participatifs, allergique au jargon corporate.'],
  ['pendant_facilitation', 'contenu_sujet', Y, 'Séquence clé : faire émerger les non-négociables de l\'équipe fondatrice, puis les confronter au regard des nouveaux.'],
  ['pendant_facilitation', 'contenu_sujet', Y, 'Le vrai sujet derrière la demande : garder l\'esprit du début à 45 sans jouer la famille.'],
  ['pendant_facilitation', 'contenu_sujet', C, 'Données à apporter : l\'enquête interne, les retours de départ anonymisés, la feuille de route produit.', { tags: ['À valider'] }],
  ['pendant_facilitation', 'contenu_sujet', Y, 'Marc présente sa vision des process après le travail collectif, pas avant. Sinon ça cadre trop tôt.'],
  ['pendant_facilitation', 'energie_dynamique', S, 'Ambiance : fatigue et méfiance. Les anciens ont l\'impression de perdre « leur » boîte, les nouveaux ne comprennent pas les codes implicites.'],
  ['pendant_facilitation', 'energie_dynamique', Y, 'Sous-groupes indispensables pour libérer la parole. Mélanger anciens et nouveaux dès le premier atelier.', { reactions: { '👍': ['Sarah Ben Ali'] } }],
  ['pendant_facilitation', 'energie_dynamique', T, 'Attention à l\'énergie après le déjeuner du jour 1 : prévoir un vrai temps de remise en mouvement.'],
  ['pendant_risques', 'risques_resistances', Y, 'Risque : Marc prend trop de place et transforme le séminaire en réunion opérationnelle. Parade : lui confier l\'observation le matin.', { tags: ['Urgent'] }],
  ['pendant_risques', 'risques_resistances', Y, 'Risque : Léa décroche si le format est trop « soft ». Parade : un exercice concret, ancré dans le produit.'],
  ['pendant_risques', 'risques_resistances', Y, 'Risque : les départs reviennent comme un grief. Les accueillir 10 minutes, puis recentrer sur ce qu\'on construit.'],
  ['pendant_risques', 'risques_resistances', S, 'Pire scénario : Camille et Marc se contredisent publiquement sur la direction. Prévoir un temps d\'alignement la veille.', { discuss: true }],
  ['pendant_risques', 'risques_resistances', T, 'Confidentialité : les retours de départ doivent être anonymisés pour de bon.'],
  ['conclusion', 'production_livrables', Y, 'Livrable 1 : la charte culture, 5 principes écrits en comportements observables.'],
  ['conclusion', 'production_livrables', C, 'Livrable 2 : le plan à 90 jours sur une page, avec des pilotes et des dates.'],
  ['conclusion', 'suite_impact', Y, 'Le lendemain : Camille envoie la synthèse et la charte à toute l\'entreprise, pas seulement aux participants.'],
  ['conclusion', 'suite_impact', Y, 'Point de suivi à J+15, puis un atelier de 2 h à J+90 pour mesurer le plan.'],
  ['conclusion', 'posture_meta', Y, 'Ma posture : miroir et provocateur. Si Camille veut du consensus, je dois oser montrer les vrais écarts.'],
  ['conclusion', 'posture_meta', Y, 'La question que je n\'ai pas encore osé poser : « Camille, es-tu prête à entendre que certains voient le COO comme TA solution, pas la leur ? »', { discuss: true }],
];

const COMMENTAIRES_CARTES = [
  [1, C, 'Oui. Et c\'est exactement ce que le board ne voit pas.'],
  [6, M, 'Je préfère le savoir avant. Merci de le dire.'],
  [26, C, 'On se cale 30 minutes la veille avec Marc.'],
];

const POLARITES = [
  ['decider_murir', { Y: [2, 'On sort avec une charte, pas des pistes.'], C: [2, 'Le board attend des décisions.'], T: [4, 'On a besoin de temps pour mûrir.'], S: [3, ''] }, 2],
  ['agir_cap', { Y: [2, ''], C: [4, 'Je dois porter le cap.'], T: [2, ''], S: [3, ''] }, 2],
  ['cadre_autonomie', { Y: [3, ''], C: [2, ''], T: [4, 'L\'équipe sait s\'organiser.'], S: [3, ''] }, 3],
  ['produire_explorer', { Y: [2, ''], C: [2, ''], T: [3, ''], S: [2, ''] }, 2],
  ['contenu_processus', { Y: [4, 'Le problème est d\'abord relationnel.'], C: [2, 'Il nous faut du contenu concret.'], T: [3, ''], S: [4, ''] }, 4],
  ['recul_action', { Y: [3, ''], C: [5, 'Urgence : on recrute le mois prochain.'], T: [4, ''], S: [2, 'Prendre le temps de comprendre les départs.'] }, 4],
  ['ouvert_cible', { Y: [3, ''], C: [4, ''], T: [2, ''], S: [3, ''] }, 3],
  ['serieux_ludique', { Y: [4, ''], C: [2, 'Le board sera dans la pièce.'], T: [4, ''], S: [5, 'Remettre du jeu, comme au début.'] }, 4],
];

const s = (title, duration_minutes, o = {}) => ({ title, duration_minutes, kind: 'collectif', ...o });
const pause = (title, duration_minutes) => ({ title, duration_minutes, kind: 'pause', block_type: 'pause' });

function jour1() {
  return {
    label: 'Jour 1', start_time: '09:00', end_time: '17:00',
    encadre: {
      titre: 'Les 4 tables du futur : dans 3 ans, tout a réussi',
      colonnes: 2,
      items: [
        { label: '1. Nos clients.', texte: 'Que racontent-ils de NovaPulse ?' },
        { label: '2. Notre équipe.', texte: 'Qu\'est-ce qu\'on a gardé du début ?' },
        { label: '3. Notre produit.', texte: 'De quoi sommes-nous fiers ?' },
        { label: '4. Nos décisions.', texte: 'Qui décide quoi, et comment ?' },
      ],
    },
    sequences: [
      pause('Accueil café', 15),
      s('Ouverture', 15, { block_type: 'ouverture', method_key: 'ouverture', intention: 'Oser parler vrai.', format: 'Mot de Camille, règles du jeu.', description: 'Camille dit pourquoi maintenant et ce qu\'elle fera des décisions, puis elle se met à la table. Je pose le cadre : intention, règles du jeu, horaires.', roles: 'Camille ouvre. Yoan tient le cadre.' }),
      s('Ma première semaine ici', 30, { block_type: 'icebreaker', method_key: 'impromptu-networking', intention: 'Relier anciens et nouveaux par un récit.', format: 'Binômes anciens et nouveaux, 3 tours.', description: 'Question : « Racontez votre première semaine ici. Qu\'est-ce qui vous a marqué ? » On change de binôme à chaque tour.' }),
      s('Forces et irritants', 60, { block_type: 'exploration', diamond: 'diverger', method_key: '1-2-4-tous', intention: 'Voir ce qui fait tenir la boîte et ce qui coince, sans filtre.', format: '1-2-4-Tous, sous-groupes mélangés.', production: 'Carte des forces et irritants', material: 'Post-its de deux couleurs, paperboard', attention_flag: true, attention_note: 'Les départs peuvent ressurgir : les accueillir 10 minutes, puis recentrer sur ce qu\'on construit.' }),
      pause('Pause', 15),
      s('Restitution et convergence', 45, { block_type: 'decision', diamond: 'converger', method_key: 'vote-gommettes', intention: 'Choisir les 5 thèmes qui comptent.', format: 'Plénière, vote par gommettes.', production: '5 thèmes prioritaires', material: 'Gommettes, 3 par personne' }),
      pause('Déjeuner', 60),
      s('Rencontres éclair', 15, { block_type: 'energizer', method_key: 'impromptu-networking', intention: 'Relancer l\'énergie.', format: 'Debout, binômes successifs.' }),
      s('Partir du futur', 15, { kind: 'apport', block_type: 'transition', method_key: 'apport-futur-desire', intention: 'Se placer dans l\'après.', format: 'Apport Futur Désiré®.' }),
      s('NovaPulse dans 3 ans', 75, { block_type: 'exploration', diamond: 'diverger', method_key: 'world-cafe', intention: 'Raconter au passé la boîte qui a réussi sa croissance.', format: 'Tables tournantes, 3 tours de 25 min. Questions ci-dessous.', production: 'Les nappes remplies', material: 'Une nappe par table, feutres', roles: 'Un hôte par table, volontaire.' }),
      pause('Pause', 15),
      s('Galerie des récits', 45, { block_type: 'decision', diamond: 'converger', method_key: 'balade-nappes', intention: 'Faire émerger les 5 non-négociables.', format: 'Nappes au mur, 3 gommettes chacun.', production: '5 principes candidats', material: 'Gommettes' }),
      s('Ce qui nous freine', 45, { block_type: 'exploration', diamond: 'groan', method_key: 'triz', intention: 'Nommer ce qu\'on fait et qui plombe.', format: 'Groupes de 3 : comment tout rater ?', production: 'Ce qu\'on arrête', facilitator_notes: 'Si ça devient un procès du COO : reformuler en comportements, pas en personnes.' }),
      s('Clôture du jour 1', 30, { block_type: 'cloture', method_key: 'un-mot', intention: 'Poser un mot sur la journée.', format: 'Un mot chacun, debout en cercle.' }),
    ],
  };
}

function jour2() {
  return {
    label: 'Jour 2', start_time: '09:00', end_time: '16:00',
    encadre: {
      titre: 'Chaque chantier sort avec',
      items: [
        { label: 'Un pilote.', texte: 'Une personne, pas un comité.' },
        { label: 'Un objectif à 90 jours.', texte: 'Mesurable. On saura dire si c\'est fait.' },
        { label: 'Les ressources.', texte: 'Temps, budget, personnes : ce qui est vraiment disponible.' },
      ],
    },
    sequences: [
      s('Réveil', 15, { block_type: 'energizer', method_key: 'energizer', intention: 'Se remettre en mouvement.', format: 'Debout.' }),
      s('Le cap du jour 2', 15, { kind: 'apport', block_type: 'transition', method_key: 'apport-court', intention: 'Viser l\'action.', format: 'Apport court.' }),
      s('La charte en comportements', 90, { block_type: 'production', diamond: 'converger', intention: 'Traduire chaque principe en gestes observables.', format: '5 sous-groupes, un par principe.', production: 'Charte en comportements', material: 'Canevas A3, feutres', roles: 'Un rapporteur par groupe.', description: 'Pour chaque principe : 3 comportements qu\'on verrait un mardi matin. Pas de valeurs creuses.' }),
      pause('Pause', 15),
      s('Pitch et validation', 45, { block_type: 'decision', diamond: 'converger', method_key: 'consentement', intention: 'Valider ensemble la charte finale.', format: '5 min par principe, puis décision par consentement.', production: 'Charte validée', attention_flag: true, attention_note: 'Léa peut objecter sur le principe « vitesse ». Écouter l\'objection, bonifier, ne pas passer en force.' }),
      pause('Déjeuner', 60),
      s('Pré-mortem du plan', 30, { block_type: 'exploration', diamond: 'groan', method_key: 'pre-mortem', intention: 'Nommer ce qui pourrait tout faire rater.', format: 'Groupes de 4 : dans 90 jours, c\'est un échec.', production: 'Risques et parades' }),
      s('Plan 90 jours', 75, { block_type: 'production', diamond: 'converger', method_key: 'chantier-90-jours', intention: 'Passer de la charte aux actions pilotées.', format: 'Un sous-groupe par chantier.', production: '3 chantiers pilotés', material: 'Fiches chantier A4' }),
      pause('Pause', 15),
      s('Mon engagement', 30, { block_type: 'production', method_key: 'engagement-binome', intention: 'Chacun porte une action, publiquement.', format: 'Carte « Dans un mois, j\'aurai... », lue à un binôme témoin.', production: 'Une action par personne', material: 'Cartes d\'engagement' }),
      s('Clôture : avant, après', 30, { block_type: 'cloture', method_key: 'avant-apres', intention: 'Mesurer le chemin parcouru.', format: 'Vote Avant / Après et ROTI sur les téléphones, puis un mot.' }),
    ],
  };
}

// Construit la démo complète dans l'espace `id`. archived : lecture seule (la référence) ou copie modifiable.
export function buildDemo(d, id, { archived = true, gen }) {
  let n = 0;
  const newId = gen || (() => `${id}-${(n++).toString(36)}`);
  const planning = createPlanningStore(d, newId);
  const today = isoDay(0);

  d.prepare(`INSERT INTO spaces (id, client_name, sponsor, facilitator, session_date, session_date_end, welcome_message, archived, facilitator_ids, plan,
      question, intention, charte, lieu, participants, accueil, reference, footer_note, event_type, situation, orientation, scale_question)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'insuffle', ?, ?, ?, ?, ?, 'seminaire', 'traverser', 'auto', ?)`).run(
    id, 'NovaPulse', 'Camille Lefèvre, CEO', 'Yoan Lureault, Insuffle', today, isoDay(1),
    'Bienvenue dans la démo. NovaPulse est un cas fictif, construit pour montrer tout ce que fait l\'outil : le cadrage avec le sponsor, les 8 polarités, un déroulé sur deux jours et la mesure du succès.',
    archived ? 1 : 0, archived ? JSON.stringify(['Yoan Lureault']) : '[]', archived ? 'demo' : 'demo-copy',
    'Qui voulons-nous être à 45, sans perdre ce qui nous a fait tenir à 5 ?',
    'Que chacun reparte avec une charte culture co-écrite et une action qu\'il porte lui-même dans les 90 jours.',
    'Maison de la Mer, Deauville', '12', 'café d\'accueil dès 8h45', 'Séminaire de lancement · 2 jours',
    'Démo Insuffle : NovaPulse est un cas fictif.',
    'Sur notre culture à 45, où en est le groupe ?'
  );
  for (const ph of PHASES) d.prepare(`INSERT INTO phase_state (space_id, phase) VALUES (?, ?)`).run(id, ph.key);

  // Cartes, réactions, étiquettes, à discuter, votes, commentaires
  const cardIds = [];
  const insCard = d.prepare(`INSERT INTO cards (id, space_id, phase, column_key, content, author, author_color, position, tags, reactions, marked_discuss) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  CARTES.forEach(([phase, col, [author, color], content, o = {}], i) => {
    const cid = newId();
    cardIds.push(cid);
    insCard.run(cid, id, phase, col, content, author, color, i, JSON.stringify(o.tags || []), JSON.stringify(o.reactions || {}), o.discuss ? 1 : 0);
  });
  const vote = d.prepare(`INSERT OR IGNORE INTO votes (space_id, card_id, pseudo) VALUES (?, ?, ?)`);
  [[1, ['Camille Lefèvre', 'Thomas Nguyen', 'Sarah Ben Ali']], [9, ['Camille Lefèvre', 'Yoan Lureault']], [26, ['Sarah Ben Ali', 'Thomas Nguyen']], [6, ['Yoan Lureault']]]
    .forEach(([i, who]) => who.forEach(p => vote.run(id, cardIds[i], p)));
  const insCom = d.prepare(`INSERT INTO comments (id, card_id, space_id, author, author_color, content) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const [i, [author, color], content] of COMMENTAIRES_CARTES) insCom.run(newId(), cardIds[i], id, author, color, content);

  // Les 8 polarités : positions, explications, positions finales (une verrouillée)
  const people = { Y, C, T, S };
  const insAxis = d.prepare(`INSERT OR IGNORE INTO axes (space_id, axis_key, pseudo, color, position, explanation) VALUES (?, ?, ?, ?, ?, ?)`);
  const insFinal = d.prepare(`INSERT OR IGNORE INTO axes_final (space_id, axis_key, position, locked) VALUES (?, ?, ?, ?)`);
  POLARITES.forEach(([key, byPerson, final], i) => {
    for (const [k, [pos, expl]] of Object.entries(byPerson)) insAxis.run(id, key, people[k][0], people[k][1], pos, expl);
    insFinal.run(id, key, final, i === 0 ? 1 : 0);
  });

  // Le déroulé : deux jours, une séquence en réserve sur le banc
  planning.replaceAll(id, {
    days: [{ ...jour1(), date: today }, { ...jour2(), date: isoDay(1) }],
    bench: [s('Aquarium CEO et COO', 30, { block_type: 'debriefing', diamond: 'groan', method_key: 'aquarium', intention: 'Faire vivre devant tous la conversation qui manque.', format: 'Camille et Marc au centre, une chaise vide.', facilitator_notes: 'Plan B si la tension CEO / COO bloque le jour 1.' })],
  }, 'Yoan Lureault');
  const st = planning.state(id);
  const byTitle = (t) => st.blocks.find(b => b.title === t)?.id;
  const insBlockCom = d.prepare(`INSERT INTO block_comments (id, block_id, space_id, author, author_color, content) VALUES (?, ?, ?, ?, ?, ?)`);
  insBlockCom.run(newId(), byTitle('NovaPulse dans 3 ans'), id, C[0], C[1], '75 minutes, c\'est long après le déjeuner. On garde ?');
  insBlockCom.run(newId(), byTitle('NovaPulse dans 3 ans'), id, Y[0], Y[1], 'On garde : c\'est le cœur du jour 1. Les rencontres éclair relancent l\'énergie juste avant.');
  insBlockCom.run(newId(), byTitle('Pitch et validation'), id, L[0], L[1], 'Je veux qu\'on puisse objecter pour de vrai.');

  // Une version figée : ce qui est parti chez le sponsor
  d.prepare(`INSERT INTO snapshots (id, space_id, name, data) VALUES (?, ?, ?, ?)`).run(newId(), id, 'planning:V1 envoyée à Camille', JSON.stringify(st));

  // La mesure du succès
  const insCrit = d.prepare(`INSERT INTO success_criteria (id, space_id, statement, indicator, horizon, target, status, result_note, position, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Yoan Lureault')`);
  insCrit.run(newId(), id, 'Chaque participant repart avec une action qu\'il porte lui-même.', 'Cartes d\'engagement lues à un binôme témoin.', 'fin', '12 sur 12', 'atteint', '12 cartes lues en clôture.', 0);
  insCrit.run(newId(), id, 'La charte tient en 5 principes, écrits en comportements observables.', 'Charte validée par consentement, sans objection.', 'fin', '5 principes', 'partiel', '4 principes validés, le 5e à retravailler.', 1);
  insCrit.run(newId(), id, 'Léa dit « ça valait le coup ».', 'Son mot en clôture.', 'fin', '', 'atteint', '« Pour une fois, on a parlé du vrai sujet. »', 2);
  insCrit.run(newId(), id, 'Les rituels d\'équipe sont installés.', 'Rituels tenus trois semaines de suite.', 'j90', '3 rituels', 'a_mesurer', '', 3);
  const insAct = d.prepare(`INSERT INTO success_actions (id, space_id, what, who, horizon, due_date, status, note, position, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Yoan Lureault')`);
  insAct.run(newId(), id, 'Envoyer la synthèse et la charte à toute l\'entreprise.', 'Camille', '72h', isoDay(4), 'en_cours', '', 0);
  insAct.run(newId(), id, 'Retravailler le 5e principe avec deux volontaires.', 'Sarah', '2sem', isoDay(15), 'a_faire', '', 1);
  insAct.run(newId(), id, 'Point de suivi avec le sponsor.', 'Yoan', 'j15', isoDay(16), 'a_faire', '', 2);
  insAct.run(newId(), id, 'Intégrer la charte au parcours d\'arrivée.', 'Marc', '1mois', isoDay(31), 'a_faire', '', 3);
  insAct.run(newId(), id, 'Partager les retours de départ anonymisés.', 'Sarah', '72h', isoDay(-1), 'fait', 'Fait la veille du séminaire.', 4);
  const insVote = d.prepare(`INSERT OR IGNORE INTO success_votes (space_id, kind, pseudo, value) VALUES (?, ?, ?, ?)`);
  SALLE.forEach((p, i) => { insVote.run(id, 'avant', p, AVANT[i]); insVote.run(id, 'apres', p, APRES[i]); insVote.run(id, 'roti', p, ROTI[i]); });
  const insRev = d.prepare(`INSERT OR REPLACE INTO facilitator_review (space_id, criterion, score, note) VALUES (?, ?, ?, ?)`);
  [['cadre', 4, 'Règles du jeu posées et tenues.'], ['intention', 3, ''], ['questions', 3, ''], ['singe', 2, 'J\'ai répondu à la place du groupe pendant le pitch. À travailler.'], ['energie', 4, ''], ['parole', 3, 'Marc a beaucoup parlé le matin du jour 1.'], ['decision', 4, 'Le consentement a tenu, l\'objection de Léa a bonifié la charte.'], ['posture', 3, ''], ['mouvement', 4, '']]
    .forEach(([k, sc, note]) => insRev.run(id, k, sc, note));

  // Un peu d'histoire dans le journal d'activité
  const insLog = d.prepare(`INSERT INTO activity_log (space_id, pseudo, action, target, details) VALUES (?, ?, ?, ?, ?)`);
  [['Yoan Lureault', 'apply-template', '', ''], ['Camille Lefèvre', 'create-card', 'clarifier_cadre', 'NovaPulse lève 8 M€'], ['Thomas Nguyen', 'create-card', 'definir_succes', 'Ne pas confondre satisfaction'], ['Yoan Lureault', 'save-version', 'V1 envoyée à Camille', '']]
    .forEach(r => insLog.run(id, ...r));
  return id;
}

const SPACE_TABLES = ['cards', 'comments', 'axes', 'axes_final', 'snapshots', 'activity_log', 'phase_state', 'votes', 'block_comments', 'blocks', 'sections', 'agenda_slots', 'agenda_days', 'success_criteria', 'success_actions', 'success_votes', 'facilitator_review'];

export function deleteSpaceData(d, id) {
  for (const t of SPACE_TABLES) d.prepare(`DELETE FROM ${t} WHERE space_id = ?`).run(id);
  d.prepare(`DELETE FROM deroulement_templates WHERE space_id = ? AND is_system = 0`).run(id);
  d.prepare(`DELETE FROM spaces WHERE id = ?`).run(id);
}

// À chaque démarrage : la démo de référence est reconstruite (dates à jour),
// les copies d'essai inactives depuis 7 jours sont supprimées.
export function refreshDemo(d) {
  d.transaction(() => {
    deleteSpaceData(d, DEMO_ID);
    buildDemo(d, DEMO_ID, { archived: true });
    const old = d.prepare(`SELECT id FROM spaces s WHERE plan = 'demo-copy' AND created_at < datetime('now', '-7 days')
      AND NOT EXISTS (SELECT 1 FROM activity_log a WHERE a.space_id = s.id AND a.created_at > datetime('now', '-7 days'))`).all();
    for (const { id } of old) deleteSpaceData(d, id);
  })();
}
