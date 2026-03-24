# language: fr

Fonctionnalité: Agenda et planification
  En tant que facilitateur d'un espace de cadrage
  Je veux planifier les journées et créneaux de mon atelier
  Afin d'organiser le temps et les pauses de façon cohérente

  Contexte:
    Soit un espace "abc123" existe
    Et je suis connecté avec le pseudo "Alice"
    Et je suis facilitateur
    Et l'espace n'est pas archivé

  # --- Journées ---

  Scénario: Créer une journée d'agenda
    Quand j'émets "create-agenda-day" avec la date "2026-04-15", début "09:00" et fin "17:30"
    Alors la journée est créée
    Et les autres participants reçoivent "agenda-day-created"

  Scénario: Créer un atelier multi-jours
    Quand je crée les journées suivantes :
      | jour | date       | début | fin   |
      | 1    | 2026-04-15 | 09:00 | 17:30 |
      | 2    | 2026-04-16 | 09:00 | 16:00 |
    Alors 2 journées sont créées et ordonnées

  Scénario: Modifier une journée
    Soit la journée du "2026-04-15" existe
    Quand j'émets "update-agenda-day" avec le nouveau début "08:30"
    Alors l'heure de début est mise à jour
    Et les autres participants reçoivent "agenda-day-updated"

  Scénario: Supprimer une journée
    Soit la journée du "2026-04-15" existe
    Quand j'émets "delete-agenda-day" sur cette journée
    Alors la journée et ses créneaux sont supprimés
    Et les autres participants reçoivent "agenda-day-deleted"

  # --- Créneaux ---

  Scénario: Créer un créneau lié à un bloc
    Soit la journée du "2026-04-15" existe
    Et le bloc "Tour de table" existe dans le déroulé
    Quand j'émets "create-agenda-slot" avec block_id et start_time "09:00" et durée 20 min
    Alors le créneau est créé et lié au bloc
    Et les autres participants reçoivent "agenda-slot-created"

  Scénario: Créer un créneau pause autonome
    Soit la journée du "2026-04-15" existe
    Quand j'émets "create-agenda-slot" avec titre "Pause café" et durée 15 min sans block_id
    Alors un créneau pause autonome est créé
    Et il n'est lié à aucun bloc du déroulé

  Scénario: Modifier un créneau
    Soit un créneau "Tour de table" existe à "09:00"
    Quand j'émets "update-agenda-slot" avec le nouveau start_time "09:15"
    Alors le créneau est mis à jour

  Scénario: Supprimer un créneau
    Soit un créneau "Pause café" existe
    Quand j'émets "delete-agenda-slot" sur ce créneau
    Alors le créneau est supprimé

  Scénario: Réordonner les créneaux
    Soit les créneaux "A", "B", "C" existent dans la journée
    Quand j'émets "reorder-agenda-slots" avec un nouvel ordre
    Alors les créneaux sont réordonnés
    Et les autres participants reçoivent "agenda-slots-reordered"

  # --- Auto-planification ---

  Scénario: Planifier automatiquement une journée
    Soit la journée du "2026-04-15" existe (09:00 - 17:30)
    Et les blocs suivants existent dans le déroulé :
      | titre              | durée |
      | Ouverture          | 15    |
      | World café         | 45    |
      | Restitution        | 30    |
      | Décisions          | 60    |
      | Clôture            | 15    |
    Quand j'émets "auto-schedule-agenda" pour cette journée
    Alors les créneaux existants de la journée sont effacés
    Et les blocs sont placés chronologiquement à partir de 09:00
    Et une pause déjeuner est insérée automatiquement vers 12:15
    Et des pauses café de 15 min sont insérées toutes les 90 min de travail
    Et les autres participants reçoivent "agenda-auto-scheduled"

  Scénario: Auto-planification sur une journée vide de blocs
    Soit la journée du "2026-04-15" existe
    Et aucun bloc n'est défini dans le déroulé
    Quand j'émets "auto-schedule-agenda" pour cette journée
    Alors aucun créneau n'est créé

  # --- Espace archivé ---

  Scénario: Tenter de modifier l'agenda dans un espace archivé
    Soit l'espace est archivé
    Quand j'émets "create-agenda-day" ou "create-agenda-slot" ou "auto-schedule-agenda"
    Alors je reçois une erreur "Espace archivé"
