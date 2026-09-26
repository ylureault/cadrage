# language: fr

Fonctionnalité: Export et snapshots
  En tant qu'utilisateur d'un espace de cadrage
  Je veux exporter les données et sauvegarder des points de repère
  Afin de partager les résultats et conserver l'historique

  Contexte:
    Soit un espace "abc123" existe avec des cartes, axes et un déroulé
    Et je suis connecté avec le pseudo "Alice"

  # --- Export texte ---

  Scénario: Exporter l'espace en texte brut
    Quand je demande l'export texte
    Alors le fichier contient les sections suivantes :
      | section                        |
      | En-tête (client, sponsor, etc) |
      | Phases et cartes               |
      | 8 axes (moyenne, écart, final) |
      | Déroulé (blocs et durées)      |
      | Agenda (jours et créneaux)     |
    Et je peux copier le texte dans le presse-papier
    Et je peux télécharger un fichier .txt

  # --- Export PDF ---

  Scénario: Exporter l'espace en PDF
    Quand je demande l'export PDF
    Alors un PDF est généré avec l'en-tête de marque Insuffle
    Et le PDF contient les métadonnées de l'espace
    Et le PDF contient les cartes organisées par phase
    Et le PDF contient les axes avec les positionnements
    Et le PDF contient le déroulé avec les durées
    Et le PDF contient le déroulé jour par jour, horaires calculés
    Et le PDF est téléchargeable

  # --- Export depuis un espace archivé ---

  Scénario: Exporter un espace archivé
    Soit l'espace est archivé
    Quand je demande l'export texte ou PDF
    Alors l'export fonctionne normalement
    Et les données sont en lecture seule mais accessibles

  # --- Snapshots ---

  Scénario: Créer un snapshot nommé
    Quand j'appelle POST /api/spaces/abc123/snapshots avec le nom "Fin de matinée"
    Alors un snapshot est créé avec toutes les données de l'espace
    Et le snapshot est horodaté

  Scénario: Lister les snapshots
    Soit des snapshots existent pour l'espace
    Quand j'appelle GET /api/spaces/abc123/snapshots
    Alors la liste des snapshots est retournée avec leurs noms et dates

  Scénario: Restaurer un snapshot
    Soit le snapshot "Fin de matinée" existe
    Quand je restaure le snapshot
    Alors toutes les données de l'espace sont remplacées par celles du snapshot
    Et les participants voient les données restaurées en temps réel
