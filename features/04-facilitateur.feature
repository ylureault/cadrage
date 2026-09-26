# language: fr

Fonctionnalité: Rôle de facilitateur
  En tant que facilitateur d'un espace de cadrage
  Je veux disposer d'outils avancés de facilitation
  Afin de guider le groupe et structurer le temps collectif

  Contexte:
    Soit un espace "abc123" existe
    Et je suis connecté avec le pseudo "Alice"
    Et l'espace n'est pas archivé

  # --- Attribution du rôle ---

  Scénario: Le premier arrivant s'auto-assigne facilitateur
    Soit aucun facilitateur n'est défini dans l'espace
    Quand j'émets "set-facilitator" avec mon pseudo et add=true
    Alors je deviens facilitateur
    Et les autres participants reçoivent "facilitators-updated"

  Scénario: Un facilitateur ajoute un co-facilitateur
    Soit je suis facilitateur
    Et "Bob" est participant
    Quand j'émets "set-facilitator" avec le pseudo "Bob" et add=true
    Alors "Bob" devient également facilitateur

  Scénario: Un facilitateur retire le rôle à un autre
    Soit je suis facilitateur
    Et "Bob" est aussi facilitateur
    Quand j'émets "set-facilitator" avec le pseudo "Bob" et add=false
    Alors "Bob" n'est plus facilitateur

  Scénario: Un non-facilitateur tente de promouvoir quelqu'un
    Soit un facilitateur existe déjà dans l'espace
    Et je ne suis pas facilitateur
    Quand j'émets "set-facilitator" avec le pseudo "Charlie" et add=true
    Alors je reçois une erreur d'autorisation

  # --- En-tête de l'espace ---

  Plan du Scénario: Modifier les champs d'en-tête
    Soit je suis facilitateur
    Quand j'émets "update-header" avec le champ "<champ>" et la valeur "<valeur>"
    Alors le champ est mis à jour
    Et les autres participants reçoivent "header-updated"

    Exemples:
      | champ            | valeur                   |
      | client_name      | Acme Corp                |
      | sponsor          | Marie Dupont             |
      | facilitator      | Jean Martin              |
      | session_date     | 2026-04-15               |
      | session_date_end | 2026-04-16               |

  Scénario: Un non-facilitateur tente de modifier l'en-tête
    Soit je ne suis pas facilitateur
    Quand j'émets "update-header" avec un champ quelconque
    Alors je reçois une erreur d'autorisation

  # --- Phases ---

  Scénario: Verrouiller une phase
    Soit je suis facilitateur
    Quand j'émets "lock-phase" sur la phase "Avant" avec locked=true
    Alors la phase est verrouillée
    Et aucun participant ne peut créer de carte dans cette phase
    Et les autres reçoivent "phase-state-changed"

  Scénario: Déverrouiller une phase
    Soit je suis facilitateur
    Et la phase "Avant" est verrouillée
    Quand j'émets "lock-phase" sur la phase "Avant" avec locked=false
    Alors la phase est déverrouillée
    Et les participants peuvent à nouveau créer des cartes

  Scénario: Masquer une phase
    Soit je suis facilitateur
    Quand j'émets "hide-phase" sur la phase "Conclusion" avec hidden=true
    Alors la phase est masquée pour tous les participants
    Et les autres reçoivent "phase-state-changed"

  Scénario: Afficher une phase masquée
    Soit je suis facilitateur
    Et la phase "Conclusion" est masquée
    Quand j'émets "hide-phase" sur la phase "Conclusion" avec hidden=false
    Alors la phase redevient visible

  # --- Timer ---

  Scénario: Démarrer un chronomètre
    Soit je suis facilitateur
    Quand j'émets "start-timer" avec une durée de 300 secondes
    Alors le chronomètre démarre pour tous les participants
    Et un décompte est envoyé chaque seconde via "timer-update"

  Scénario: Démarrer un chronomètre avec durée invalide
    Soit je suis facilitateur
    Quand j'émets "start-timer" avec une durée de 5000 secondes
    Alors je reçois une erreur (durée max 3600 secondes)

  Scénario: Le chronomètre atteint zéro
    Soit un chronomètre est en cours à 1 seconde restante
    Quand le chronomètre atteint 0
    Alors tous les participants reçoivent "timer-ended"
    Et une notification sonore/visuelle est affichée

  Scénario: Arrêter le chronomètre manuellement
    Soit je suis facilitateur
    Et un chronomètre est en cours
    Quand j'émets "stop-timer"
    Alors le chronomètre s'arrête immédiatement
    Et les participants reçoivent "timer-stopped"

  Scénario: Un non-facilitateur tente de démarrer le chronomètre
    Soit je ne suis pas facilitateur
    Quand j'émets "start-timer"
    Alors je reçois une erreur d'autorisation

  # --- Spotlight ---

  Scénario: Mettre en lumière une carte
    Soit je suis facilitateur
    Et la carte "Point clé" existe
    Quand j'émets "spotlight" avec l'identifiant de la carte
    Alors la carte est mise en surbrillance dorée pour tous
    Et la carte apparaît plus grande avec un z-index élevé

  Scénario: Retirer le spotlight
    Soit je suis facilitateur
    Et une carte est sous le spotlight
    Quand j'émets "spotlight" avec le même identifiant
    Alors le spotlight est retiré

  # --- Message d'accueil ---

  Scénario: Définir un message d'accueil
    Soit je suis facilitateur
    Quand j'émets "set-welcome-message" avec "Bienvenue dans cet atelier de cadrage !"
    Alors le message est enregistré
    Et les nouveaux arrivants voient ce message à leur connexion

  # --- Mode silencieux ---

  Scénario: Activer le brainstorming silencieux
    Soit je suis facilitateur
    Quand j'émets "toggle-silent-mode" sur la colonne "clarifier_cadre"
    Alors les cartes de cette colonne sont masquées aux autres
    Et les participants peuvent ajouter des cartes sans voir celles des autres

  Scénario: Révéler les cartes après le brainstorming silencieux
    Soit le mode silencieux est actif sur la colonne "clarifier_cadre"
    Et des cartes ont été ajoutées en silence
    Quand j'émets "reveal-cards" sur la colonne
    Alors toutes les cartes apparaissent simultanément pour tous

  # --- Archivage ---

  Scénario: Archiver un espace
    Soit je suis facilitateur
    Quand j'émets "archive-space"
    Alors l'espace passe en mode lecture seule
    Et toutes les opérations d'écriture sont bloquées
    Et les autres participants reçoivent "space-archived"

  Scénario: Un non-facilitateur tente d'archiver
    Soit je ne suis pas facilitateur
    Quand j'émets "archive-space"
    Alors je reçois une erreur d'autorisation
