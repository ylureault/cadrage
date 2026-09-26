// Référentiel Insuffle : vocabulaire, repères et chartes.
// Sources : compétences Insuffle (planning-temps-collectif, art-de-la-facilitation, matrice-insuffle,
// insuffle-offers, planning-formation). Rien d'inventé : si ce n'est pas dans ces sources, ce n'est pas ici.

export const CHARTES = {
  insuffle: {
    key: 'insuffle', label: 'Insuffle', entite: 'Insuffle',
    main: '#141E37', accent: '#F2C245', soft: '#FAF6E9', line: '#D9D4C7', txt: '#1E1E1E', grey: '#6B6B6B',
  },
  academie: {
    key: 'academie', label: 'Insuffle Académie', entite: 'Insuffle Académie',
    main: '#6B1963', accent: '#FFD466', soft: '#F6EEF5', line: '#DCCBD9', txt: '#1E1E1E', grey: '#6B6B6B',
  },
};

// Les trois types de séquence du planning A4
export const KINDS = {
  collectif: { key: 'collectif', label: 'Collectif', hint: 'Le groupe travaille. Filet navy.' },
  apport: { key: 'apport', label: 'Apport', hint: 'Contenu descendant, court. Filet jaune, fond crème.' },
  pause: { key: 'pause', label: 'Pause', hint: 'Pauses, déjeuner, accueil. Bande hachurée.' },
};

// Nature de la séquence (pour l'équilibre du déroulé, pas affiché au client)
export const BLOCK_TYPES = {
  ouverture: { label: 'Ouverture', color: '#22c55e' },
  icebreaker: { label: 'Inclusion', color: '#f59e0b' },
  exploration: { label: 'Exploration', color: '#8b5cf6' },
  production: { label: 'Production', color: '#3b82f6' },
  debriefing: { label: 'Débrief', color: '#ec4899' },
  decision: { label: 'Décision', color: '#ef4444' },
  transition: { label: 'Transition', color: '#a3a3a3' },
  energizer: { label: 'Énergie', color: '#f97316' },
  cloture: { label: 'Clôture', color: '#14b8a6' },
  pause: { label: 'Pause', color: '#6b7280' },
};

// Double diamant (L'art de la facilitation)
export const DIAMOND = {
  diverger: { label: 'Diverger', short: 'D', color: '#C185BB', hint: 'Ouvrir, faire émerger, multiplier.' },
  groan: { label: 'Groan Zone', short: 'G', color: '#8D8D8E', hint: 'Le moment inconfortable. On reformule, on relance, on ne conclut pas trop vite.' },
  converger: { label: 'Converger', short: 'C', color: '#8E2183', hint: 'Filtrer, choisir, décider.' },
};

export const EVENT_TYPES = [
  { key: 'seminaire', label: 'Séminaire' },
  { key: 'codir', label: 'Séminaire CODIR' },
  { key: 'atelier', label: 'Atelier' },
  { key: 'decision', label: 'Atelier de décision' },
  { key: 'lancement', label: 'Lancement de projet' },
  { key: 'retro', label: 'Rétrospective' },
  { key: 'formation', label: 'Formation' },
  { key: 'distanciel', label: 'Atelier à distance' },
  { key: 'conference', label: 'Conférence participative' },
  { key: 'reunion', label: 'Réunion à enjeu' },
  { key: 'parcours', label: 'Parcours (plusieurs temps)' },
  { key: 'autre', label: 'Autre' },
];

// La carte de la complexité du collectif (matrice Insuffle). Ne sert pas à classer : à ouvrir la conversation.
export const SITUATIONS = [
  { key: 'executer', label: 'Exécuter', probleme: 'connu', collectif: 'aligné', appelle: 'Aucune facilitation.' },
  { key: 'explorer', label: 'Explorer', probleme: 'inconnu', collectif: 'aligné', appelle: 'Facilitation de contenu.' },
  { key: 'denouer', label: 'Dénouer', probleme: 'connu', collectif: 'noué', appelle: 'Facilitation de transformation. L\'angle mort des modèles : problème résolu, rien ne bouge quand même.' },
  { key: 'traverser', label: 'Traverser', probleme: 'inconnu', collectif: 'noué', appelle: 'Facilitation stratégique, puis de transformation.' },
  { key: 'stabiliser', label: 'Stabiliser', probleme: 'plus rien ne tient', collectif: 'indisponible', appelle: 'Aucune des trois. On stabilise d\'abord.' },
];

export const FACILITATION_TYPES = [
  { key: 'contenu', label: 'Contenu', text: 'On travaille ce que le groupe produit.' },
  { key: 'strategique', label: 'Stratégique', text: 'On travaille ce que le groupe décide. Décider déplace les places.' },
  { key: 'transformation', label: 'Transformation', text: 'On travaille ce que le groupe est. Contient les deux autres.' },
];

export const BOUSSOLE_4C = [
  { key: 'cap', label: 'Cap', question: 'Vers où va le groupe ? Tout le monde peut-il le dire en une phrase ?' },
  { key: 'capacite', label: 'Capacité', question: 'Sponsor (le commanditaire), clients (le système), les 3P : permission, pouvoir, puissance.' },
  { key: 'cadence', label: 'Cadence', question: 'Qui, et à quel rythme ? Trop vite, on s\'épuise. Trop lent, on s\'enlise.' },
  { key: 'contraintes', label: 'Contraintes', question: 'Temps, lieu, budget. Les vraies, pas les imaginées.' },
];

export const TROIS_P = [
  { label: 'Permission', text: 'Donner au groupe la permission de s\'exprimer.' },
  { label: 'Pouvoir', text: 'Pour avoir la permission, il faut donner le pouvoir : la capacité, le droit d\'agir.' },
  { label: 'Puissance', text: 'L\'énergie pour le faire.' },
];

export const DECISION_MODES = [
  { label: 'Consensus', text: 'Tout le monde est d\'accord. Rare, long, souvent mou.' },
  { label: 'Compromis', text: 'Chacun lâche un bout. Personne n\'est vraiment content.' },
  { label: 'Consentement', text: 'Personne n\'a d\'objection argumentée. Assez bon pour maintenant, assez sûr pour essayer.' },
];

export const CONVICTIONS = [
  'La facilitation, c\'est pas des post-its.',
  'Le facilitateur neutre et invisible, c\'est faux.',
  'Un atelier réussi, ce n\'est pas tout le monde content et tout le monde a parlé.',
  'L\'intelligence collective, c\'est pas juste mettre du monde dans une salle.',
  'Intelligence collectée n\'est pas intelligence collective.',
  'La facilitation, c\'est pas (que) du fun.',
  'Ça ne marche pas dans tous les contextes.',
];

export const SIGNATURE = 'La facilitation, c\'est rendre le système intelligent en le questionnant.';

export const QUESTIONS_GENERATIVES = [
  'Imaginons que tout se soit parfaitement passé : qu\'observez-vous de différent ?',
  'À quoi verrez-vous que cette rencontre a été utile ?',
  'Quel petit pas ferait une vraie différence ?',
  'De quoi auriez-vous besoin pour avancer ?',
  'Que désirez-vous profondément pour ce collectif ?',
  'Il est 16h30, vous êtes satisfait·e parce que… ?',
  'Si tout était possible, que feriez-vous ?',
  'Qu\'aimeriez-vous lire demain matin dans votre boîte mail ?',
  'Comment saurez-vous que vous avez atteint votre état désiré ?',
  'Quelle est la meilleure chose qui pourrait nous arriver ?',
  'Qu\'est-ce qui doit absolument être conservé ?',
  'Que faudrait-il vraiment arrêter de faire ?',
  'Projetez-vous dans 3 mois, l\'obstacle est levé : à quoi ça ressemble ?',
  'Quel est le véritable enjeu, ici et maintenant ?',
  'Qu\'est-ce qui sera différent après notre échange ?',
  'Quelle question aimeriez-vous que je vous pose ?',
  'Que se passerait-il si tout se passait bien ?',
  'À quoi ressemblerait une décision idéale ?',
  'Qu\'êtes-vous prêt·e à faire différemment ?',
  'Quelle est l\'étape suivante ?',
  'Comment rendre ce moment inoubliable ?',
  'Quel impact espérez-vous ?',
  'Quels pièges faudrait-il vraiment éviter ?',
  'Si vous ne deviez garder qu\'une seule action, laquelle ?',
  'Quel bénéfice aimeriez-vous obtenir ?',
  'Que faudra-t-il faire pour passer de l\'intention à l\'action ?',
  'Supposons que ce soit réussi : qu\'est-ce que ça change en vous ?',
  'Et… quoi d\'autre ?',
];

// Horizons de mesure et de suite (72 h, 2 semaines, 1 mois : L'art de la facilitation ; J+15, J+90 : suivi séminaire)
export const HORIZONS = [
  { key: 'fin', label: 'Fin de séance' },
  { key: '72h', label: '72 h' },
  { key: '2sem', label: '2 semaines' },
  { key: 'j15', label: 'J+15' },
  { key: '1mois', label: '1 mois' },
  { key: 'j90', label: 'J+90' },
  { key: '3mois', label: '3 mois' },
  { key: '6mois', label: '6 mois' },
];
export const HORIZON_DAYS = { fin: 0, '72h': 3, '2sem': 14, j15: 15, '1mois': 30, j90: 90, '3mois': 91, '6mois': 182 };

export const CRITERION_STATUS = {
  a_mesurer: { label: 'À mesurer', color: '#6B6B6B' },
  atteint: { label: 'Atteint', color: '#10b981' },
  partiel: { label: 'Partiel', color: '#f59e0b' },
  non_atteint: { label: 'Non atteint', color: '#ef4444' },
};

export const ACTION_STATUS = {
  a_faire: { label: 'À faire', color: '#6B6B6B' },
  en_cours: { label: 'En cours', color: '#3b82f6' },
  fait: { label: 'Fait', color: '#10b981' },
  abandonne: { label: 'Abandonné', color: '#a3a3a3' },
};

// Grille d'observation du facilitateur (planning-formation)
export const REVIEW_CRITERIA = [
  { key: 'cadre', label: 'Le cadre', question: 'Ai-je posé un cadre clair (intention, règles du jeu, sécurité) ?' },
  { key: 'intention', label: 'L\'intention', question: 'Ai-je distingué intention et objectif, et tenu le cap ?' },
  { key: 'questions', label: 'Les questions', question: 'Ai-je posé des questions génératives plutôt que des « pourquoi » ?' },
  { key: 'singe', label: 'Le singe sur l\'épaule', question: 'Ai-je évité de répondre à la place du groupe ?' },
  { key: 'energie', label: 'L\'énergie', question: 'Ai-je lu et régulé l\'énergie et la dynamique du groupe ?' },
  { key: 'parole', label: 'La parole', question: 'Ai-je réparti la parole, géré le bavard et inclus le silencieux ?' },
  { key: 'decision', label: 'La décision', question: 'Ai-je aidé le groupe à décider sans tomber dans le consensus mou ?' },
  { key: 'posture', label: 'La posture', question: 'Suis-je resté facilitateur plutôt qu\'animateur ?' },
  { key: 'mouvement', label: 'Le mouvement', question: 'Ai-je créé du mouvement et conclu vers une suite concrète ?' },
];
export const REVIEW_SCALE = ['Pas évalué', 'À travailler', 'En progrès', 'Solide', 'Remarquable'];

export const PLANNING_COLUMNS = [
  { key: 'sequence', label: 'Séquence' },
  { key: 'intention', label: 'Intention' },
  { key: 'format', label: 'Format' },
  { key: 'production', label: 'Ce qui en sort' },
];

// Repères Insuffle affichés dans le déroulé (sources : insuffle-offers)
export const RATIO_REPERES = {
  seminaire: { actif: 70, label: 'Séminaire : 70 % travail actif, 30 % apport' },
  formation: { actif: 80, label: 'Formation : 80 % pratique, 20 % théorie' },
};
