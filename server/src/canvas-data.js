// Structure du Canvas de Cadrage Insuffle
export const PHASES = [
  {
    key: 'avant',
    name: 'Avant',
    color: '#1e3a5f',
    bgColor: '#eef3f9',
    description: 'Préparer et comprendre le contexte avant le temps collectif',
    columns: [
      {
        key: 'clarifier_cadre',
        name: 'Clarifier le cadre et l\'intention',
        questions: [
          'Pourquoi fait-on appel à vous maintenant ?',
          'Que se passe-t-il concrètement si on ne fait rien ?',
          'Qu\'est-ce qui doit changer après cette session ?',
          'Qu\'est-ce qui a déjà été tenté et pourquoi ça n\'a pas marché ?',
          'Y a-t-il un sujet sensible ou un non-dit autour de cette demande ?',
          'Le vrai problème est-il bien celui qui est posé ?'
        ]
      },
      {
        key: 'personnes_roles',
        name: 'Les personnes et les rôles',
        questions: [
          'Manque-t-il quelqu\'un d\'important dans le groupe ?',
          'Qui décide vraiment dans cette organisation ?',
          'Y a-t-il des personnes opposées à cette initiative ?',
          'Quels sont les rôles et niveaux hiérarchiques des participants ?',
          'Les participants peuvent-ils vraiment décider et s\'engager ?',
          'Avez-vous un allié dans le groupe ?'
        ]
      },
      {
        key: 'definir_succes',
        name: 'Définir le succès',
        questions: [
          'C\'est un succès si et seulement si…',
          'À quoi verra-t-on que ça a bougé ?',
          'Quel comportement concret sera différent après ?',
          'Quel est le livrable ou le résultat attendu ?',
          'Fait-on la différence entre résultats et satisfaction ?'
        ]
      },
      {
        key: 'attentes',
        name: 'Les attentes',
        questions: [
          'Quelle posture le client attend-il de vous ?',
          'Quels sujets sont prioritaires pour le sponsor ?',
          'Le groupe est-il ouvert aux exercices créatifs ou décalés ?',
          'Y a-t-il des attentes contradictoires entre participants ?',
          'Les participants ont-ils déjà vécu ce type d\'atelier ?'
        ]
      }
    ]
  },
  {
    key: 'pendant_facilitation',
    name: 'Pendant · facilitation',
    color: '#2a5a3a',
    bgColor: '#eef7f0',
    description: 'Piloter la dynamique et le contenu pendant le temps collectif',
    columns: [
      {
        key: 'contenu_sujet',
        name: 'Contenu et sujet',
        questions: [
          'Comment emmener le groupe du point A au point B ?',
          'Que doit produire, discuter ou décider le groupe ?',
          'Quel est le vrai sujet derrière la demande officielle ?',
          'Faudra-t-il des informations ou données de la part du client ?'
        ]
      },
      {
        key: 'energie_dynamique',
        name: 'Énergie et dynamique',
        questions: [
          'Quelle est l\'ambiance actuelle du groupe ?',
          'Quel est le niveau de confiance dans le collectif ?',
          'Y a-t-il des personnes qui monopolisent la parole ?',
          'Faut-il des sous-groupes pour libérer la parole ?',
          'Quel rythme de journée est le plus adapté ?',
          'Faut-il faciliter la rencontre, l\'expression, ou les deux ?'
        ]
      }
    ]
  },
  {
    key: 'pendant_risques',
    name: 'Pendant · risques',
    color: '#7a2a2a',
    bgColor: '#fdf2f2',
    description: 'Anticiper les risques et résistances',
    columns: [
      {
        key: 'risques_resistances',
        name: 'Risques et résistances',
        questions: [
          'Qu\'est-ce qui pourrait bloquer l\'atelier ?',
          'Quel est le pire scénario réaliste ?',
          'Quelle résistance pourrait faire dérailler le groupe ?',
          'À qui la restitution devra-t-elle être présentée ?',
          'Quel niveau de confidentialité est nécessaire ?',
          'Comment le groupe réagirait si on abordait le vrai sujet ?'
        ]
      }
    ]
  },
  {
    key: 'conclusion',
    name: 'Conclusion',
    color: '#4a3a6a',
    bgColor: '#f3f0f7',
    description: 'Conclure, produire et projeter la suite',
    columns: [
      {
        key: 'production_livrables',
        name: 'Production et livrables',
        questions: [
          'Quel livrable est attendu à la fin ?',
          'Que doivent produire concrètement les participants ?',
          'Sous quelle forme : compte rendu, plan d\'action, les deux ?',
          'Dans quel délai faut-il livrer la synthèse ?'
        ]
      },
      {
        key: 'suite_impact',
        name: 'Suite et impact',
        questions: [
          'Que se passe-t-il le lendemain de la session ?',
          'Comment saura-t-on que ce temps collectif a été utile ?',
          'Qui porte les décisions après ?',
          'En combien de temps peut-on espérer voir un changement ?',
          'Est-ce une action isolée ou le début d\'un parcours ?'
        ]
      },
      {
        key: 'posture_meta',
        name: 'Posture et meta',
        questions: [
          'Quelle posture est attendue : guide, miroir, provocateur ?',
          'Suis-je à l\'aise avec cette commande ?',
          'Qu\'est-ce que je risque si je dis la vérité dans la salle ?',
          'Mon rôle est-il de faire ou de faire faire ?',
          'Quelle question n\'ai-je pas encore osé poser ?'
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
