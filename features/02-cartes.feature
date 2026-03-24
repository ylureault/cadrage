# language: fr

Fonctionnalité: Gestion des cartes
  En tant que participant d'un espace de cadrage
  Je veux créer et interagir avec des cartes
  Afin de capturer les idées et les organiser par phase

  Contexte:
    Soit un espace "abc123" existe
    Et je suis connecté avec le pseudo "Alice"
    Et l'espace n'est pas archivé

  # --- Création ---

  Scénario: Créer une carte dans une colonne
    Soit la phase "AVANT" n'est pas verrouillée
    Quand j'émets "create-card" avec le contenu "Définir les objectifs" dans la colonne "clarifier_cadre"
    Alors la carte est créée avec mon pseudo comme auteur
    Et une couleur d'auteur m'est attribuée
    Et les autres participants reçoivent "card-created"
    Et une activité "create-card" est enregistrée

  Scénario: Créer une carte avec un contenu vide
    Quand j'émets "create-card" avec un contenu vide
    Alors je reçois une erreur "Contenu requis"

  Scénario: Créer une carte dépassant 500 caractères
    Quand j'émets "create-card" avec un contenu de 501 caractères
    Alors je reçois une erreur de contenu trop long

  Scénario: Créer une carte dans une phase verrouillée
    Soit la phase "AVANT" est verrouillée par le facilitateur
    Quand j'émets "create-card" dans la phase "AVANT"
    Alors je reçois une erreur "Phase verrouillée"

  Scénario: Créer une carte dans un espace archivé
    Soit l'espace est archivé
    Quand j'émets "create-card"
    Alors je reçois une erreur "Espace archivé"

  # --- Édition ---

  Scénario: Modifier ma propre carte
    Soit j'ai créé la carte "Objectifs" dans l'espace
    Quand j'émets "update-card" avec le nouveau contenu "Objectifs du sprint"
    Alors la carte est mise à jour
    Et les autres participants reçoivent "card-updated"

  Scénario: Modifier la carte d'un autre participant
    Soit "Bob" a créé la carte "Idée de Bob"
    Quand j'émets "update-card" sur la carte de Bob
    Alors je reçois une erreur d'autorisation

  # --- Suppression ---

  Scénario: Supprimer ma propre carte
    Soit j'ai créé la carte "Brouillon"
    Quand j'émets "delete-card" sur ma carte
    Alors la carte est supprimée
    Et les autres participants reçoivent "card-deleted"

  Scénario: Un facilitateur supprime la carte d'un autre
    Soit "Bob" a créé la carte "Hors sujet"
    Et je suis facilitateur
    Quand j'émets "delete-card" sur la carte de Bob
    Alors la carte est supprimée
    Et l'activité est enregistrée avec le flag facilitateur

  Scénario: Un non-facilitateur tente de supprimer la carte d'un autre
    Soit "Bob" a créé la carte "Idée de Bob"
    Et je ne suis pas facilitateur
    Quand j'émets "delete-card" sur la carte de Bob
    Alors je reçois une erreur d'autorisation

  # --- Déplacement ---

  Scénario: Déplacer une carte entre colonnes
    Soit la carte "Objectifs" existe dans la colonne "clarifier_cadre"
    Quand j'émets "move-card" vers la colonne "definir_succes"
    Alors la carte est déplacée dans la nouvelle colonne
    Et les autres participants reçoivent "card-moved"

  # --- Tags ---

  Scénario: Ajouter un tag à une carte
    Soit la carte "Objectifs" existe
    Quand j'émets "add-tag" avec le tag "Urgent"
    Alors le tag "Urgent" est ajouté à la carte
    Et les autres participants reçoivent "card-tags-updated"

  Plan du Scénario: Tags disponibles
    Quand j'ajoute le tag "<tag>" à une carte
    Alors le tag est accepté

    Exemples:
      | tag         |
      | Urgent      |
      | À valider   |
      | Fait        |
      | Question    |
      | Hors scope  |

  Scénario: Retirer un tag d'une carte
    Soit la carte "Objectifs" a le tag "Urgent"
    Quand j'émets "remove-tag" avec le tag "Urgent"
    Alors le tag est retiré de la carte

  # --- Réactions ---

  Scénario: Réagir à une carte avec un emoji
    Soit la carte "Bonne idée" existe
    Quand j'émets "react" avec l'emoji "👍" sur la carte
    Alors ma réaction est ajoutée
    Et le compteur de "👍" augmente de 1
    Et les autres participants reçoivent "card-reactions-updated"

  Plan du Scénario: Emojis de réaction disponibles
    Quand je réagis avec "<emoji>" sur une carte
    Alors la réaction est acceptée

    Exemples:
      | emoji |
      | 👍    |
      | 👎    |
      | ❓    |
      | 💡    |
      | 🔥    |

  Scénario: Retirer sa réaction (toggle off)
    Soit j'ai réagi avec "👍" sur la carte "Bonne idée"
    Quand j'émets "react" avec "👍" à nouveau
    Alors ma réaction est retirée
    Et le compteur de "👍" diminue de 1

  # --- Votes ---

  Scénario: Voter pour une carte
    Soit j'ai 0 vote utilisé sur 3 maximum
    Quand j'émets "vote" sur la carte "Priorité haute"
    Alors mon vote est comptabilisé
    Et j'ai maintenant 1 vote utilisé
    Et les autres participants reçoivent "votes-updated"

  Scénario: Voter au-delà de la limite de 3 votes
    Soit j'ai déjà 3 votes utilisés
    Quand j'émets "vote" sur une nouvelle carte
    Alors je reçois une erreur "Limite de votes atteinte"

  Scénario: Retirer un vote
    Soit j'ai voté pour la carte "Priorité haute"
    Quand j'émets "unvote" sur cette carte
    Alors mon vote est retiré
    Et j'ai un vote disponible supplémentaire

  # --- Commentaires ---

  Scénario: Commenter une carte
    Soit la carte "Discussion" existe
    Quand j'émets "add-comment" avec le contenu "Je suis d'accord"
    Alors le commentaire est ajouté sous la carte
    Et le badge compteur de commentaires augmente
    Et les autres participants reçoivent "comment-added"
    Et une notification d'activité est envoyée

  # --- Discussion ---

  Scénario: Marquer une carte pour discussion
    Soit la carte "Point sensible" existe
    Quand j'émets "mark-discuss" sur la carte
    Alors la carte est marquée pour discussion (marked_discuss = true)
    Et un cercle d'avertissement apparaît sur la carte
    Et les autres participants reçoivent "card-marked-discuss"

  # --- Recherche ---

  Scénario: Rechercher des cartes par contenu
    Soit plusieurs cartes existent dans l'espace
    Quand je filtre les cartes avec le texte "objectif"
    Alors seules les cartes contenant "objectif" sont affichées
    Et les résultats sont mis en surbrillance en temps réel
