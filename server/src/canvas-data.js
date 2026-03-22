// Structure du Canvas de Cadrage Insuffle
export const PHASES = [
  {
    key: 'avant',
    name: 'AVANT',
    color: '#1a2a4a',
    description: 'Préparer et comprendre le contexte avant l\'intervention',
    columns: [
      {
        key: 'clarifier_cadre',
        name: 'Clarifier le cadre et l\'intention',
        questions: [
          'Quelle est la vraie raison pour laquelle on vous a appelé ?',
          'Qu\'est-ce qui se passe concrètement si on ne fait rien ?',
          'Qu\'est-ce qui va changer concrètement après cette session ?',
          'Comment se fait-il que les solutions tentées jusque-là ne marchent pas ?',
          'Quel est le non-dit ou la question taboue autour de cette commande ?',
          'Est-ce que le vrai problème est celui qui est posé ?'
        ]
      },
      {
        key: 'personnes_roles',
        name: 'Les personnes et les rôles',
        questions: [
          'Il vous manquerait-il quelqu\'un ?',
          'Où êtes-vous dans l\'échiquier politique de décision ?',
          'Qui est-ce qui s\'est déjà exprimé contre cette initiative ?',
          'Quels sont les rôles et les niveaux hiérarchiques des participants ?',
          'Combien ont-ils de latitude pour décider et s\'engager réellement ?',
          'Avez-vous un allié solide à l\'intérieur du groupe ?'
        ]
      },
      {
        key: 'definir_succes',
        name: 'Définir le succès',
        questions: [
          'Ce n\'est pas un échec mais bien un succès si et seulement si...',
          'Où allez-vous voir que ça a bougé ?',
          'Quel comportement observable et concret sera différent ?',
          'C\'est la fin/finalité exactement ?',
          'Faites-vous une distinction entre résultats et satisfaction ?'
        ]
      },
      {
        key: 'attentes',
        name: 'Les attentes',
        questions: [
          'Quelle est la vraie posture client que vous avez ?',
          'Quels sujets sont attendus comme prioritaires ?',
          'Quelle est la tolérance aux exercices créatifs/décalés ?',
          'Existe-t-il des attentes contradictoires entre participants ?',
          'Les participants ont-ils déjà vécu des ateliers de facilitation ?'
        ]
      }
    ]
  },
  {
    key: 'pendant_facilitation',
    name: 'PENDANT - Facilitation',
    color: '#2a5a3a',
    description: 'Piloter la dynamique et le contenu pendant l\'intervention',
    columns: [
      {
        key: 'contenu_sujet',
        name: 'Contenu et sujet',
        questions: [
          'Comment allez-vous du point de départ A au point d\'arrivée B avec eux ?',
          'Qu\'est-ce que le groupe va produire, discuter, décider ?',
          'Quel est le vrai sujet ? Pas le sujet officiel, le vrai.',
          'Est-ce qu\'il faudra des informations de la part du client ?'
        ]
      },
      {
        key: 'energie_dynamique',
        name: 'Énergie et dynamique',
        questions: [
          'Comment est l\'ambiance du groupe actuellement ?',
          'Quel est le niveau de confiance/défiance dans le collectif ?',
          'Y a-t-il des personnes qui monopolisent la parole habituellement ?',
          'Faut-il prévoir des sous-groupes pour libérer la parole ?',
          'Quel est le rythme de la journée le plus adapté ?',
          'Faut-il faciliter la rencontre, l\'expression ou les deux ?'
        ]
      }
    ]
  },
  {
    key: 'pendant_risques',
    name: 'PENDANT - Risques',
    color: '#7a2a2a',
    description: 'Anticiper les risques et résistances',
    columns: [
      {
        key: 'risques_resistances',
        name: 'Risques et résistances',
        questions: [
          'Qu\'est-ce qui pourrait bloquer l\'atelier concrètement ?',
          'Quel est le scénario catastrophe réaliste ?',
          'Quelle résistance serait la plus destructrice pour le groupe ?',
          'À qui le document/restitution devra être présenté ensuite ?',
          'Quel niveau de confidentialité est nécessaire ?',
          'Comment le groupe réagirait si on abordait le vrai sujet ?'
        ]
      }
    ]
  },
  {
    key: 'conclusion',
    name: 'CONCLUSION',
    color: '#4a3a6a',
    description: 'Conclure, produire et projeter la suite',
    columns: [
      {
        key: 'production_livrables',
        name: 'Production et livrables',
        questions: [
          'Quel est le document/livrable attendu à la fin ?',
          'Que doivent produire les participants concrètement ?',
          'Des livrables sous quelle forme pour les participants ?',
          'Combien de temps après doit-on livrer la synthèse ?',
          'Faut-il un plan d\'action, un compte rendu, les deux ?'
        ]
      },
      {
        key: 'suite_impact',
        name: 'Suite et impact',
        questions: [
          'Que se passe-t-il concrètement le lendemain de la session ?',
          'Comment mesurer que le séminaire a réellement servi à quelque chose ?',
          'Qui va porter les décisions après le séminaire ?',
          'Combien de temps est-il réaliste de voir un changement ?',
          'Est-ce une action isolée ou le début d\'un parcours plus long ?'
        ]
      },
      {
        key: 'posture_meta',
        name: 'Posture et meta',
        questions: [
          'Quelle posture m\'est demandée ici : guide, miroir, provocateur ?',
          'Quel est mon niveau de confort avec cette commande ?',
          'Qu\'est-ce que je risque si je dis la vérité dans la salle ?',
          'Faut-il que je sois dans le faire ou dans le faire faire ?',
          'Quelle question aurais-je aimé poser mais que je n\'ai pas osé ?'
        ]
      }
    ]
  }
];

export const AXES = [
  { key: 'decider_murir', left: 'Décider', right: 'Faire mûrir' },
  { key: 'agir_cap', left: 'Agir ensemble', right: 'Porter le cap' },
  { key: 'cadre_autonomie', left: 'Tenir le cadre', right: 'Autonomie du groupe' },
  { key: 'produire_explorer', left: 'Produire', right: 'Explorer' },
  { key: 'contenu_processus', left: 'Contenu', right: 'Processus' },
  { key: 'recul_action', left: 'Prendre du recul', right: 'Passer à l\'action' },
  { key: 'ouvert_cible', left: 'Ouvert', right: 'Ciblé' },
  { key: 'serieux_ludique', left: 'Sérieux', right: 'Énergie ludique' }
];

export const AXES_QUESTIONS = {
  decider_murir: [
    'Le groupe a-t-il le pouvoir de décider, ou seulement de recommander ?',
    'Qui valide les décisions après l\'atelier ?',
    'Une non-décision serait-elle un échec pour le sponsor ?',
    'Le sujet est-il assez mûr pour décider, ou faut-il d\'abord explorer ?',
    'Y a-t-il des décisions déjà prises qu\'on présente comme ouvertes ?'
  ],
  agir_cap: [
    'Cherche-t-on à construire une vision commune ou à aligner derrière une vision existante ?',
    'Le leader doit-il co-construire ou fixer le cap et embarquer ?',
    'Si le groupe propose une direction différente, que se passe-t-il ?',
    'Est-ce un exercice de cohésion ou d\'adhésion ?'
  ],
  cadre_autonomie: [
    'Le groupe est-il mature pour s\'auto-organiser ?',
    'Qu\'est-ce qui se passe si les participants sortent du sujet ?',
    'Y a-t-il des sujets interdits ?'
  ],
  produire_explorer: [
    'Faut-il sortir avec un plan d\'action chiffré ou des pistes ouvertes ?',
    'Le sponsor sera-t-il satisfait avec des questions plutôt que des réponses ?'
  ],
  contenu_processus: [
    'Le problème est-il un problème de fond ou de fonctionnement ?',
    'Si on ne traite que le processus, sera-ce jugé utile ?'
  ],
  recul_action: [
    'Y a-t-il urgence à agir ou urgence à comprendre ?',
    'Le groupe a-t-il tendance à foncer ou à analyser sans trancher ?'
  ],
  ouvert_cible: [
    'L\'agenda est-il fixé ou peut-on accueillir ce qui émerge ?',
    'Quel est le degré de surprise acceptable pour le sponsor ?'
  ],
  serieux_ludique: [
    'La culture de l\'entreprise tolère-t-elle le décalage ?',
    'Le sponsor sera-t-il mal à l\'aise avec un ice-breaker décalé ?'
  ]
};

export const PARTICIPANT_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#d35400', '#c0392b',
  '#16a085', '#8e44ad', '#27ae60', '#2980b9', '#f1c40f'
];
