# language: fr

Fonctionnalité: Collaboration en temps réel
  En tant que participant d'un espace de cadrage
  Je veux collaborer en temps réel avec les autres participants
  Afin de co-construire le cadrage de façon synchrone et interactive

  Contexte:
    Soit un espace "abc123" existe
    Et "Alice" et "Bob" sont connectés à l'espace

  # --- Participants ---

  Scénario: Voir la liste des participants en temps réel
    Quand "Charlie" rejoint l'espace
    Alors la liste des participants est mise à jour pour tous
    Et "Alice", "Bob" et "Charlie" apparaissent dans la barre des participants

  Scénario: Voir qu'un participant a quitté
    Quand "Bob" se déconnecte
    Alors "Bob" est retiré de la liste des participants
    Et "Alice" et "Charlie" voient la mise à jour

  # --- Notifications ---

  Scénario: Recevoir une notification de carte créée
    Quand "Bob" crée une carte "Nouvelle idée"
    Alors "Alice" reçoit une notification d'activité
    Et la notification contient le pseudo, la couleur et un aperçu du contenu

  Scénario: Recevoir une notification de commentaire
    Quand "Bob" commente la carte "Discussion"
    Alors "Alice" reçoit une notification d'activité
    Et la notification mentionne le commentaire

  Scénario: Recevoir une notification d'arrivée
    Quand "Charlie" rejoint l'espace
    Alors "Alice" et "Bob" reçoivent une notification "Charlie a rejoint l'espace"

  Scénario: Recevoir une notification de départ
    Quand "Charlie" quitte l'espace
    Alors "Alice" et "Bob" reçoivent une notification "Charlie a quitté l'espace"

  # --- Synchronisation des données ---

  Scénario: Les modifications de cartes sont synchronisées
    Quand "Alice" modifie la carte "Objectifs"
    Alors "Bob" voit la modification en temps réel sans recharger la page

  Scénario: Les positions d'axes sont synchronisées
    Quand "Alice" se positionne sur l'axe "produire_explorer" à la valeur 4
    Alors "Bob" voit la position d'Alice apparaître sur le slider
    Et la moyenne est recalculée pour tous

  Scénario: L'en-tête est synchronisé
    Soit "Alice" est facilitateur
    Quand "Alice" met à jour le nom du client en "Acme Corp"
    Alors "Bob" voit "Acme Corp" dans l'en-tête immédiatement

  # --- Zones de focus ---

  Scénario: Voir où se concentrent les autres participants
    Quand "Alice" travaille sur la colonne "clarifier_cadre"
    Et "Alice" émet "focus-zone" pour cette colonne
    Alors "Bob" voit un indicateur de présence d'Alice sur cette colonne

  # --- Journal d'activité ---

  Scénario: Consulter le journal d'activité
    Soit des cartes ont été créées, des commentaires ajoutés et des participants ont rejoint
    Quand j'ouvre le panneau d'activité
    Alors je vois un fil chronologique de toutes les actions
    Et chaque entrée indique le pseudo, l'action et l'horodatage

  Scénario: L'activité se met à jour en direct
    Soit le panneau d'activité est ouvert
    Quand "Bob" crée une nouvelle carte
    Alors l'action apparaît immédiatement dans le journal

  # --- Statistiques ---

  Scénario: Consulter les statistiques de l'espace
    Quand j'ouvre le panneau de statistiques
    Alors je vois le nombre total de cartes
    Et je vois le nombre total de votes
    Et je vois le nombre d'auteurs uniques
    Et je vois le nombre de cartes marquées pour discussion
