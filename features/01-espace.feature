# language: fr

Fonctionnalité: Gestion des espaces de cadrage
  En tant qu'utilisateur de Cadrage
  Je veux créer et rejoindre des espaces collaboratifs
  Afin de préparer mes temps collectifs avec mon équipe

  Contexte:
    Soit un espace de cadrage existe avec l'identifiant "abc123"

  # --- Création ---

  Scénario: Créer un nouvel espace de cadrage
    Quand je crée un nouvel espace via l'API POST /api/spaces
    Alors un espace est créé avec un identifiant unique
    Et l'espace contient 4 phases prédéfinies (AVANT, PENDANT Facilitation, PENDANT Risques, CONCLUSION)
    Et l'espace contient les 8 polarités
    Et l'espace n'est pas archivé

  # --- Rejoindre ---

  Scénario: Rejoindre un espace avec un pseudo
    Soit l'espace "abc123" n'est pas plein
    Quand j'émets l'événement "join-space" avec le pseudo "Alice"
    Alors je reçois l'événement "joined" avec mon pseudo et une couleur unique
    Et les autres participants reçoivent une notification de mon arrivée
    Et je suis ajouté à la liste des participants

  Scénario: Rejoindre un espace sans pseudo
    Quand j'émets l'événement "join-space" sans pseudo
    Alors je reçois une erreur "Pseudo requis"

  Scénario: Rejoindre un espace plein (plan gratuit, 5 max)
    Soit l'espace "abc123" a déjà 80 participants uniques connectés
    Quand j'émets l'événement "join-space" avec le pseudo "Sixième"
    Alors je reçois une erreur de capacité dépassée

  Scénario: Rejoindre un espace avec un pseudo déjà utilisé
    Soit "Alice" est déjà connectée à l'espace "abc123"
    Quand j'émets l'événement "join-space" avec le pseudo "Alice"
    Alors la connexion est acceptée (multi-session même pseudo)
    Et la capacité ne compte qu'un seul participant unique

  # --- Session ---

  Scénario: Persister la session utilisateur
    Soit je suis connecté à l'espace "abc123" avec le pseudo "Alice"
    Quand je ferme et rouvre la page
    Alors mon pseudo est récupéré depuis le sessionStorage
    Et je peux rejoindre l'espace sans ressaisir mon pseudo

  Scénario: Voir les espaces récents
    Soit j'ai rejoint l'espace "abc123" précédemment
    Quand j'accède à la page d'accueil
    Alors l'espace "abc123" apparaît dans mes espaces récents
    Et un maximum de 20 espaces récents est affiché

  # --- Déconnexion ---

  Scénario: Quitter un espace
    Soit je suis connecté à l'espace "abc123" avec le pseudo "Alice"
    Quand je me déconnecte
    Alors je suis retiré de la liste des participants
    Et les autres participants reçoivent une notification de mon départ
    Et une activité "leave" est enregistrée

  # --- Duplication ---

  Scénario: Dupliquer un espace
    Soit l'espace "abc123" contient des cartes et des axes positionnés
    Quand j'appelle POST /api/spaces/abc123/duplicate
    Alors un nouvel espace est créé avec toutes les données copiées
    Et le nouvel espace a un identifiant différent

  Scénario: Dupliquer un espace comme template
    Quand j'appelle POST /api/spaces/abc123/duplicate avec l'option "asTemplate"
    Alors un nouvel espace est créé sans les données de participants

  # --- Suppression ---

  Scénario: Supprimer un espace (soft delete)
    Quand j'appelle DELETE /api/spaces/abc123
    Alors l'espace est marqué comme supprimé (deleted=1)
    Et l'espace n'apparaît plus dans la liste des espaces

  Scénario: Restaurer un espace supprimé
    Soit l'espace "abc123" est supprimé
    Quand j'appelle POST /api/spaces/abc123/restore
    Alors l'espace est restauré et accessible à nouveau
