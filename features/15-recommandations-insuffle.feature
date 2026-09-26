# language: fr
Fonctionnalité: Recommandations Insuffle et Insuffle Académie
  L'outil est offert. Il fait connaître Insuffle et Insuffle Académie
  avec le message le plus utile pour ce cadrage, au bon moment, sans insister.

  Contexte:
    Étant donné un cadrage ouvert par un facilitateur

  Scénario: Le message suit le type de temps collectif
    Quand le type de temps est « Séminaire CODIR »
    Alors l'encart Insuffle présente le séminaire CODIR
    Et propose l'autodiagnostic Flash CODIR

  Scénario: La situation du collectif passe en premier
    Quand la situation du collectif est « Dénouer » ou « Traverser »
    Alors l'encart propose un regard extérieur sur ce collectif

  Scénario: À l'approche de la date
    Étant donné que le temps collectif a lieu dans 5 jours
    Alors l'encart propose de faire relire le planning, 30 minutes gratuites

  Scénario: Une formation oriente vers Insuffle Académie
    Quand le type de temps est « Formation » ou la charte « Académie »
    Alors l'encart présente la formation Facilitation & Intelligence Collective

  Scénario: Trop d'apport descendant
    Étant donné un déroulé à plus de 30 % d'apport
    Alors l'encart rappelle le repère Insuffle : 70 % de travail actif

  Scénario: Un bilan du facilitateur à travailler
    Étant donné un critère du bilan noté « À travailler »
    Alors la page Succès propose les formations Insuffle Académie

  Scénario: Comprendre pourquoi
    Quand je clique sur « Pourquoi ce message ? »
    Alors je lis le signal du cadrage qui a déclenché le message

  Scénario: Refermer un message
    Quand je referme un message
    Alors il ne revient pas pendant 30 jours
    Et un autre message pertinent peut prendre sa place

  Scénario: Le moment clé
    Quand j'exporte, j'imprime, j'envoie le planning ou je clos les votes
    Alors une suggestion apparaît, différente de celle déjà à l'écran
    Et pas plus d'une fois tous les trois jours

  Scénario: Les participants découvrent d'où vient l'atelier
    Étant donné un participant qui a voté l'Après ou le ROTI
    Alors il lit que l'atelier a été préparé avec l'outil gratuit d'Insuffle
    Et peut découvrir Insuffle Académie ou créer son propre cadrage

  Scénario: Aucun prix, rien d'inventé
    Alors aucun message n'affiche de prix ni de tiret cadratin
    Et les liens portent la source « cadrage » pour mesurer ce qui marche
