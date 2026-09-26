// Bibliothèque de méthodes pour concevoir un temps collectif.
// Chaque méthode pré-remplit une séquence : l'intention et le format restent à ajuster aux mots du client.
// Les champs « consignes » et « materiel » sont internes : ils ne partent jamais sur le planning client.

export const METHOD_CATEGORIES = [
  { key: 'ouvrir', label: 'Ouvrir', hint: 'Se rendre présent, poser le cadre.' },
  { key: 'diverger', label: 'Diverger', hint: 'Faire émerger, élargir.' },
  { key: 'approfondir', label: 'Groan Zone', hint: 'Creuser, frotter, ne pas conclure trop vite.' },
  { key: 'converger', label: 'Converger', hint: 'Filtrer, choisir.' },
  { key: 'decider', label: 'Décider', hint: 'Trancher sans arbitrer.' },
  { key: 'agir', label: 'La suite', hint: 'Qui fait quoi, pour quand.' },
  { key: 'clore', label: 'Clore', hint: 'Fermer, mesurer, ancrer.' },
  { key: 'apport', label: 'Apports', hint: 'Contenu court et utile.' },
  { key: 'rythme', label: 'Rythme', hint: 'Pauses, énergie, accueil.' },
];

const m = (key, name, cat, props) => ({ key, name, cat, kind: 'collectif', duration: 15, distanciel: true, ...props });

export const METHODS = [
  // ===== Ouvrir =====
  m('ouverture', 'Ouverture', 'ouvrir', {
    block_type: 'ouverture', duration: 15,
    intention: 'Dire pourquoi on est là et ce qu\'on fera de ce qui sort.',
    format: 'Mot du sponsor, en plénière.',
    consignes: 'Le sponsor dit pourquoi maintenant et ce qu\'il fera des décisions. Puis il se met à la table. Le facilitateur pose le cadre : intention, règles du jeu, horaires.',
  }),
  m('regles-du-jeu', 'Règles du jeu', 'ouvrir', {
    block_type: 'ouverture', duration: 15,
    intention: 'Poser un cadre où chacun peut parler sans risque.',
    format: 'Proposées par le facilitateur, amendées par le groupe.',
    production: 'Les règles du jeu au mur.',
    consignes: 'Trois à cinq règles, pas plus. Confidentialité, droit de ne pas être d\'accord, téléphones. On demande : « Qu\'est-ce qui vous permettrait de parler vrai aujourd\'hui ? »',
  }),
  m('meteo', 'Météo, tour d\'inclusion', 'ouvrir', {
    block_type: 'icebreaker', duration: 15,
    intention: 'Que chacun arrive vraiment dans la pièce.',
    format: 'Une question, un tour. Une phrase chacun.',
    consignes: 'Une seule question, courte. Le facilitateur passe en dernier. Pas de commentaire entre les prises de parole.',
  }),
  m('ligne-anciennete', 'La ligne d\'ancienneté', 'ouvrir', {
    block_type: 'icebreaker', duration: 15, distanciel: false,
    intention: 'Voir l\'histoire du collectif de ses propres yeux.',
    format: 'Debout, du plus ancien au plus récent. Le plus ancien raconte.',
    consignes: 'Chacun se place selon sa date d\'arrivée. On fait parler les deux bouts de la ligne, puis le milieu.',
  }),
  m('impromptu-networking', 'Rencontres éclair', 'ouvrir', {
    block_type: 'icebreaker', duration: 15,
    intention: 'Lancer l\'énergie et les échanges avant d\'entrer dans le dur.',
    format: 'Paires successives autour d\'une question. 3 tours de 4 min.',
    consignes: 'Impromptu Networking (Liberating Structures). Une question générative, on change de binôme à chaque tour.',
  }),
  m('photolangage', 'Photolangage', 'ouvrir', {
    block_type: 'icebreaker', duration: 30,
    intention: 'Dire ce qui est difficile à dire avec des mots.',
    format: 'Chacun choisit une image et dit pourquoi.',
    materiel: 'Un jeu d\'images étalé sur une table.',
    consignes: 'Question d\'entrée : « Choisissez une image qui dit où vous en êtes sur le sujet. » On écoute, on ne commente pas.',
  }),

  // ===== Diverger =====
  m('1-2-4-tous', '1-2-4-Tous', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 15,
    intention: 'Faire contribuer tout le monde, pas seulement ceux qui parlent fort.',
    format: 'Seul, en duo, à 4, puis tous ensemble.',
    production: 'Les idées qui tiennent.',
    consignes: '1 min seul en silence, 2 min en duo, 4 min à 4, 5 min en plénière. Une question générative. En plénière : « Qu\'est-ce qui ressort de votre groupe ? »',
  }),
  m('world-cafe', 'Tables tournantes (World Café)', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 60,
    intention: 'Croiser les regards sur plusieurs angles d\'une même question.',
    format: '3 tours de 20 min. L\'hôte reste à sa table, les autres changent.',
    production: 'Les nappes remplies.',
    materiel: 'Une nappe papier par table, feutres.',
    consignes: 'Une question par table, toutes dérivées de la question-titre. L\'hôte accueille, résume le tour précédent, relance. Tables de 5 à 6.',
  }),
  m('forum-ouvert', 'Forum ouvert', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 90,
    intention: 'Laisser le groupe choisir ses sujets et s\'y mettre.',
    format: 'Chacun propose un sujet, la place du marché, ateliers en parallèle.',
    production: 'Un compte rendu par atelier.',
    materiel: 'Mur de programme, feuilles de compte rendu.',
    consignes: 'Open Space. La loi des deux pieds : si vous n\'apprenez ni ne contribuez, allez ailleurs. Le porteur du sujet écrit le compte rendu.',
  }),
  m('brainwriting', 'Idéation silencieuse', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 15,
    intention: 'Avoir beaucoup d\'idées avant de les discuter.',
    format: 'Chacun écrit seul, une idée par post-it, puis on affiche.',
    production: 'Le mur d\'idées.',
    consignes: 'Silence complet. Quantité avant qualité. On regroupe après, pas pendant.',
  }),
  m('projection-futur-desire', 'Projection Futur Désiré®', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 45,
    intention: 'Décrire ce qui est vrai quand tout a réussi.',
    format: 'Projection individuelle, puis binômes, puis plénière. On raconte au passé.',
    production: 'Les récits du futur.',
    consignes: 'On se place à un horizon précis (1 an, 3 ans). On raconte au passé, avec des faits observables. On part de ce qu\'on désire, pas de ce qui ne va pas.',
  }),
  m('se-souvenir-du-futur', 'Se souvenir du futur', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 30,
    intention: 'Rendre le succès concret et observable avant de commencer.',
    format: 'Binômes. « Nous sommes dans 6 mois, c\'est réussi. Racontez. »',
    production: 'Les critères de succès.',
    consignes: 'Remember the Future. On relance : « Qu\'est-ce qui vous fait dire que c\'est réussi ? Qu\'est-ce que vous voyez ? » Les réponses nourrissent les critères de succès.',
  }),
  m('deux-falaises', 'Les deux falaises', 'diverger', {
    block_type: 'exploration', diamond: 'diverger', duration: 30,
    intention: 'Voir l\'écart entre là où on est et là où on veut aller.',
    format: 'Une falaise pour aujourd\'hui, une pour demain, le pont entre les deux.',
    production: 'Le pont : ce qu\'il faut construire.',
    materiel: 'Grand format au mur.',
    consignes: 'D\'abord la falaise d\'arrivée (le succès), puis celle de départ, puis les planches du pont.',
  }),

  // ===== Approfondir (Groan Zone) =====
  m('9-pourquoi', '9 pourquoi', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 15,
    intention: 'Remonter au vrai pourquoi, à l\'intention profonde.',
    format: 'Binômes. L\'un demande « Pourquoi est-ce important ? » jusqu\'au fond.',
    production: 'Le vrai pourquoi.',
    consignes: '9 Whys (Liberating Structures). On note la dernière réponse, celle qui fait silence.',
  }),
  m('triz', 'Ce qu\'on fait pour que ça rate', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 30,
    intention: 'Nommer ce qui plombe, sans accuser personne.',
    format: 'Groupes de 3. On imagine comment tout saboter, puis on regarde ce qu\'on fait déjà.',
    production: 'Ce qu\'on arrête.',
    consignes: 'TRIZ (Liberating Structures). 1) La liste du pire. 2) « Qu\'est-ce qu\'on fait déjà de cette liste ? » 3) « Qu\'est-ce qu\'on arrête ? »',
  }),
  m('pre-mortem', 'Pré-mortem', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 30,
    intention: 'Nommer maintenant ce qui pourrait tout faire rater.',
    format: 'Groupes de 4. On imagine l\'échec et on remonte le fil.',
    production: 'Les risques et leurs parades.',
    consignes: '« Nous sommes dans 6 mois, c\'est un échec. Racontez ce qui s\'est passé. » Puis une parade par risque majeur.',
  }),
  m('troika', 'Troïka consultative', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 30,
    intention: 'Aider chacun sur un défi réel, avec l\'intelligence de deux pairs.',
    format: 'Groupes de 3. Un porteur, deux consultants. Le porteur tourne le dos pendant qu\'ils échangent.',
    production: 'Un pas suivant par personne.',
    consignes: 'Troika Consulting (Liberating Structures). 2 min pour poser le défi, 1 min de questions, 5 min de conseils dos tourné, 2 min de retour. On tourne.',
  }),
  m('codev', 'Codéveloppement', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 60,
    intention: 'Traiter un vrai problème d\'un participant avec le groupe.',
    format: 'Un client, des consultants, un animateur. Exposé, questions, consultation, plan d\'action.',
    production: 'Le plan d\'action du client.',
    consignes: 'Groupes de 5 à 7. On tient les étapes et les temps. Le client ne se justifie pas pendant la consultation.',
  }),
  m('aquarium', 'Aquarium', 'approfondir', {
    block_type: 'debriefing', diamond: 'groan', duration: 30, distanciel: false,
    intention: 'Faire vivre une conversation à enjeu devant tout le groupe.',
    format: 'Un petit cercle parle, le grand cercle écoute. Une chaise vide pour entrer.',
    consignes: 'Fishbowl. 4 à 5 chaises au centre, dont une vide. Qui veut parler s\'y assoit, quelqu\'un sort.',
  }),
  m('ligne-du-temps', 'La ligne du temps', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 30,
    intention: 'Revoir ensemble ce qui s\'est passé, pas chacun son souvenir.',
    format: 'Frise au mur. Chacun pose ses moments forts et faibles.',
    production: 'La frise de la période.',
    materiel: 'Frise papier, post-its de deux couleurs.',
  }),
  m('osbd', 'Conversation OSBD', 'approfondir', {
    block_type: 'exploration', diamond: 'groan', duration: 30,
    intention: 'Utiliser le désaccord au lieu de l\'éviter.',
    format: 'Binômes. Observation, sentiment, besoin, demande.',
    consignes: 'Communication non violente. On s\'entraîne sur une situation réelle et récente. Le facilitateur rappelle : le conflit est un catalyseur.',
  }),
  m('what-so-what', 'Quoi ? Et alors ? Et maintenant ?', 'approfondir', {
    block_type: 'debriefing', diamond: 'converger', duration: 30,
    intention: 'Débriefer proprement : les faits, le sens, l\'action.',
    format: 'Trois temps : ce qu\'on a vu, ce que ça veut dire, ce qu\'on fait.',
    production: 'Les apprentissages et les suites.',
    consignes: 'What / So What / Now What (Liberating Structures). On ne saute pas le « quoi ».',
  }),

  // ===== Converger =====
  m('balade-nappes', 'La balade des nappes', 'converger', {
    block_type: 'decision', diamond: 'converger', duration: 15, distanciel: false,
    intention: 'Voir tout ce qui a été dit, pas seulement ses propres tables.',
    format: 'Nappes au mur, 3 gommettes chacun.',
    production: 'Ce qui donne le plus envie.',
    materiel: 'Gommettes.',
  }),
  m('vote-gommettes', 'Vote par gommettes', 'converger', {
    block_type: 'decision', diamond: 'converger', duration: 15,
    intention: 'Faire apparaître les priorités du groupe en quelques minutes.',
    format: '3 gommettes chacun, sur les propositions affichées.',
    production: 'Les priorités.',
    materiel: 'Gommettes.',
    consignes: 'Dot voting. Voter d\'abord en silence, commenter ensuite. Le vote éclaire la décision, il ne la remplace pas.',
  }),
  m('matrice-impact-effort', 'Impact / effort', 'converger', {
    block_type: 'decision', diamond: 'converger', duration: 30,
    intention: 'Trier les idées selon ce qu\'elles rapportent et ce qu\'elles coûtent.',
    format: 'Chaque idée est placée sur une matrice à deux axes.',
    production: 'Les gains rapides et les gros chantiers.',
  }),
  m('15-pourcent', 'Les 15 %', 'converger', {
    block_type: 'production', diamond: 'converger', duration: 15,
    intention: 'Repérer ce que chacun peut faire dès maintenant, sans permission ni budget.',
    format: 'Seul, puis en groupes de 3.',
    production: 'Un premier pas par personne.',
    consignes: '15% Solutions (Liberating Structures). « Où avez-vous la main ? Que pouvez-vous faire sans demander ? »',
  }),

  // ===== Décider =====
  m('consentement', 'Décision par consentement', 'decider', {
    block_type: 'decision', diamond: 'converger', duration: 45,
    intention: 'Trouver une décision assez bonne pour maintenant, assez sûre pour essayer.',
    format: 'Proposition, clarification, réactions, objections, bonification.',
    production: 'La décision.',
    consignes: 'Une objection n\'est pas une préférence : elle dit en quoi la proposition nuit à l\'objectif. On bonifie jusqu\'à ce qu\'il n\'y ait plus d\'objection.',
  }),
  m('gradients-accord', 'Gradients d\'accord', 'decider', {
    block_type: 'decision', diamond: 'converger', duration: 15,
    intention: 'Voir le vrai niveau d\'accord, pas un oui poli.',
    format: 'Chacun se positionne sur une échelle, de l\'adhésion totale au blocage.',
    consignes: 'Gradients d\'accord de Kaner. On fait parler les positions extrêmes avant de décider.',
  }),

  // ===== La suite =====
  m('qui-quoi-quand', 'La suite : qui fait quoi, pour quand', 'agir', {
    block_type: 'production', diamond: 'converger', duration: 30,
    intention: 'Que les décisions sortent de la salle.',
    format: 'Une action, un nom, une date. À 72 h, 2 semaines, 1 mois.',
    production: 'Le plan de suite.',
    consignes: 'Pas d\'action sans nom. Pas de « l\'équipe ». Une date réaliste. On reporte les actions dans l\'onglet Succès.',
  }),
  m('chantier-90-jours', 'Chantiers à 90 jours', 'agir', {
    block_type: 'production', diamond: 'converger', duration: 90,
    intention: 'Rendre chaque chantier pilotable dès lundi.',
    format: 'Un sous-groupe par chantier. Pilote, objectif à 90 jours, ressources.',
    production: 'Une fiche par chantier.',
    consignes: 'Un pilote, pas un comité. Un objectif mesurable. Les ressources vraiment disponibles.',
  }),
  m('engagement-binome', 'Engagement individuel', 'agir', {
    block_type: 'production', duration: 15,
    intention: 'Passer de ce qu\'on veut pour le collectif à ce que je fais, moi.',
    format: 'Carte « Dans un mois, j\'aurai... », lue à un binôme témoin.',
    production: 'Un engagement par personne.',
    materiel: 'Cartes d\'engagement.',
    consignes: 'Petit, visible, daté, avec un témoin. Le binôme se rappelle à la date dite.',
  }),

  // ===== Clore =====
  m('avant-apres', 'Échelle Avant / Après', 'clore', {
    block_type: 'cloture', duration: 15,
    intention: 'Mesurer où en est le groupe avant et après le temps collectif.',
    format: 'Chacun se place de 1 à 10, au début puis à la fin.',
    production: 'Le déplacement du groupe.',
    consignes: 'Ouvrir le vote « Avant » dans l\'onglet Succès en début de séance, le vote « Après » en fin. Même question les deux fois.',
  }),
  m('roti', 'ROTI', 'clore', {
    block_type: 'cloture', duration: 15,
    intention: 'Savoir si le temps passé valait le coup.',
    format: 'Chacun note de 1 à 5 le retour sur le temps investi.',
    consignes: 'Return On Time Invested. Ouvrir le vote ROTI dans l\'onglet Succès. La satisfaction ne dit pas le résultat : on la mesure à part.',
  }),
  m('un-mot', 'Clôture en un mot', 'clore', {
    block_type: 'cloture', duration: 15,
    intention: 'Fermer avec ce qu\'on emporte.',
    format: 'Un mot chacun.',
  }),

  // ===== Apports =====
  m('apport-futur-desire', 'Partir du futur', 'apport', {
    kind: 'apport', block_type: 'transition', duration: 15,
    intention: 'Arrêter d\'améliorer le passé. Se placer dans l\'après.',
    format: 'Apport Futur Désiré®.',
    consignes: 'Futur Désiré® avec le ® à chaque fois. Sur un format court, on parle de posture ou d\'apport Futur Désiré®, jamais de Fresque.',
  }),
  m('apport-court', 'Apport court', 'apport', {
    kind: 'apport', block_type: 'transition', duration: 15,
    intention: 'Donner juste ce qu\'il faut pour la suite.',
    format: 'Apport, illustré d\'un exemple.',
  }),
  m('carte-complexite', 'La carte de la complexité', 'apport', {
    kind: 'apport', block_type: 'exploration', diamond: 'groan', duration: 30,
    intention: 'Ouvrir la conversation sur l\'état du collectif, pas seulement sur le problème.',
    format: 'Le groupe se situe sur la carte, puis on parle de ce qui résiste.',
    consignes: 'Ne jamais s\'en servir pour classer. C\'est l\'échec du classement qui fait le travail.',
  }),
  m('boussole-4c', 'Boussole 4C', 'apport', {
    kind: 'collectif', block_type: 'exploration', diamond: 'diverger', duration: 45,
    intention: 'Faire le point sur le cap, les contraintes, les capacités et la cadence.',
    format: 'Chacun répond, puis on compare les profils.',
    production: 'La photo lucide sur 4 axes.',
    consignes: 'Diagnostic en ligne possible sur boussole.insuffle.com (version CODIR : flash-codir.insuffle.com).',
  }),

  // ===== Rythme =====
  m('accueil-cafe', 'Accueil café', 'rythme', { kind: 'pause', block_type: 'pause', duration: 15 }),
  m('pause', 'Pause', 'rythme', { kind: 'pause', block_type: 'pause', duration: 15 }),
  m('dejeuner', 'Déjeuner', 'rythme', { kind: 'pause', block_type: 'pause', duration: 60 }),
  m('energizer', 'Energizer', 'rythme', {
    block_type: 'energizer', duration: 15,
    intention: 'Réveiller le groupe.',
    format: 'Debout, en mouvement.',
  }),
  m('installation', 'Installation', 'rythme', {
    block_type: 'transition', duration: 15,
    intention: 'Parler avec des collègues qu\'on croise peu.',
    format: 'Groupes mélangés. Un hôte volontaire par table.',
  }),
];

export const METHODS_BY_KEY = Object.fromEntries(METHODS.map(x => [x.key, x]));

// Transforme une méthode en champs de séquence
export function methodToSequence(method) {
  return {
    title: method.name,
    kind: method.kind,
    block_type: method.block_type || (method.kind === 'pause' ? 'pause' : 'production'),
    duration_minutes: method.duration,
    intention: method.intention || '',
    format: method.format || '',
    production: method.production || '',
    description: method.consignes || '',
    material: method.materiel || '',
    diamond: method.diamond || '',
    method_key: method.key,
  };
}
