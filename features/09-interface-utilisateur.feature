# language: fr

Fonctionnalité: Interface utilisateur et navigation
  En tant qu'utilisateur de Cadrage
  Je veux naviguer facilement dans l'application
  Afin d'accéder rapidement aux fonctionnalités dont j'ai besoin

  # --- Page d'accueil ---

  Scénario: Accéder à la page d'accueil
    Quand j'accède à la page d'accueil
    Alors je vois le hero avec le titre et le sous-titre
    Et je vois le bouton pour créer un nouvel espace
    Et je vois le micro-texte "Gratuit · Sans inscription · Prêt en 5 secondes"
    Et je vois les sections : problème, étapes, 8 axes, fonctionnalités, pour qui, FAQ
    Et je vois mes espaces récents si j'en ai

  Scénario: Créer un espace depuis la page d'accueil
    Quand je clique sur le bouton de création d'espace
    Alors un nouvel espace est créé
    Et je suis redirigé vers la page de l'espace
    Et le modal de pseudo s'affiche

  # --- Modal de pseudo ---

  Scénario: Saisir mon pseudo pour rejoindre un espace
    Soit j'accède à un espace pour la première fois
    Quand le modal de pseudo s'affiche
    Et je saisis "Alice" et je valide
    Alors je rejoins l'espace avec le pseudo "Alice"

  # --- Navigation par onglets ---

  Scénario: Naviguer entre les onglets de l'espace
    Soit je suis connecté à un espace
    Alors je peux naviguer entre les onglets suivants :
      | onglet    |
      | Canvas    |
      | Axes      |
      | Déroulé   |
      | Agenda    |
      | Recap     |
      | Activité  |
      | Stats     |
      | Export    |

  # --- Palette de commandes ---

  Scénario: Ouvrir la palette de commandes
    Soit je suis connecté à un espace
    Quand j'appuie sur Cmd+K ou sur "?"
    Alors la palette de commandes s'ouvre
    Et je peux basculer entre les panneaux (export, axes, activité)
    Et je peux devenir facilitateur depuis la palette

  Scénario: Fermer la palette de commandes
    Soit la palette de commandes est ouverte
    Quand j'appuie sur Échap
    Alors la palette se ferme

  # --- Barre d'outils ---

  Scénario: Utiliser la barre d'outils
    Soit je suis connecté à un espace
    Alors la barre d'outils affiche :
      | élément                    |
      | Logo                       |
      | Recherche de cartes        |
      | Masquer/afficher colonnes  |
      | Copier le lien de l'espace |

  Scénario: Copier le lien de partage
    Quand je clique sur "Copier le lien"
    Alors l'URL de l'espace est copiée dans le presse-papier
    Et un message de confirmation s'affiche

  # --- Masquer des colonnes ---

  Scénario: Masquer une colonne
    Quand je masque la colonne "risques_resistances"
    Alors la colonne disparaît du canvas
    Et le réglage est persisté pour cet espace

  Scénario: Réafficher une colonne masquée
    Soit la colonne "risques_resistances" est masquée
    Quand je réaffiche la colonne
    Alors elle réapparaît dans le canvas

  # --- Responsive mobile ---

  Scénario: Accéder à la page d'accueil sur mobile
    Quand j'accède à la page d'accueil sur un écran mobile
    Alors les boutons Démo et Créer sont visibles dans l'en-tête compact
    Et le contenu est adapté à la largeur de l'écran

  # --- Page 404 ---

  Scénario: Accéder à une URL inexistante
    Quand j'accède à une URL qui n'existe pas
    Alors la page 404 s'affiche
