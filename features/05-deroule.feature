# language: fr

Fonctionnalité: Déroulé d'atelier
  En tant que facilitateur d'un espace de cadrage
  Je veux concevoir le déroulé de mon atelier
  Afin de structurer les activités, les intentions et les durées

  Contexte:
    Soit un espace "abc123" existe
    Et je suis connecté avec le pseudo "Alice"
    Et je suis facilitateur
    Et l'espace n'est pas archivé

  # --- Blocs ---

  Scénario: Créer un bloc d'activité
    Quand j'émets "create-block" avec le titre "Tour de table" et l'intention "Créer du lien"
    Alors le bloc est créé avec un identifiant unique
    Et les autres participants reçoivent "block-created"
    Et une activité "create-block" est enregistrée

  Scénario: Créer un bloc avec tous les champs
    Quand j'émets "create-block" avec les données suivantes :
      | champ         | valeur              |
      | title         | World café          |
      | intention     | Explorer les idées  |
      | block_type    | production          |
      | duration      | 45                  |
      | format        | sous-groupes        |
      | material      | Post-its, feutres   |
      | deliverable   | Synthèse par groupe |
    Alors le bloc est créé avec tous les champs renseignés

  Plan du Scénario: Types de blocs disponibles
    Quand je crée un bloc de type "<type>"
    Alors le type est accepté

    Exemples:
      | type        |
      | ouverture   |
      | icebreaker  |
      | production  |
      | exploration |
      | debriefing  |
      | decision    |
      | pause       |
      | cloture     |
      | transition  |
      | energizer   |

  Plan du Scénario: Formats de travail disponibles
    Quand je crée un bloc avec le format "<format>"
    Alors le format est accepté

    Exemples:
      | format       |
      | plénière     |
      | binômes      |
      | trinômes     |
      | sous-groupes |
      | individuel   |

  Scénario: Créer un bloc sans titre
    Quand j'émets "create-block" sans titre
    Alors je reçois une erreur "Titre requis"

  Scénario: Modifier un bloc
    Soit le bloc "Tour de table" existe
    Quand j'émets "update-block" avec la durée mise à jour à 30 minutes
    Alors le bloc est mis à jour
    Et les autres participants reçoivent "block-updated"

  Scénario: Supprimer un bloc
    Soit le bloc "Tour de table" existe
    Quand j'émets "delete-block" sur ce bloc
    Alors le bloc est supprimé
    Et les autres participants reçoivent "block-deleted"

  Scénario: Dupliquer un bloc
    Soit le bloc "World café" existe
    Quand j'émets "duplicate-block" sur ce bloc
    Alors un nouveau bloc est créé avec les mêmes données
    Et le nouveau bloc a un identifiant différent

  Scénario: Réordonner les blocs
    Soit les blocs "A", "B", "C" existent dans cet ordre
    Quand j'émets "reorder-blocks" avec l'ordre ["C", "A", "B"]
    Alors les blocs sont réordonnés
    Et les autres participants reçoivent "blocks-reordered"

  # --- Drapeaux d'attention ---

  Scénario: Ajouter un drapeau d'attention à un bloc
    Soit le bloc "Décision budget" existe
    Quand j'émets "update-block" avec attention_flag=true et attention_note="Sujet sensible"
    Alors le drapeau d'attention est affiché sur le bloc
    Et la note d'attention est visible

  # --- Liaisons ---

  Scénario: Lier un bloc à des axes
    Soit le bloc "Positionnement" existe
    Quand j'émets "update-block" avec linked_axes=["decider_faire_murir", "produire_explorer"]
    Alors le bloc est lié aux axes spécifiés
    Et la traçabilité est assurée

  Scénario: Lier un bloc à des cartes
    Soit le bloc "Discussion priorités" existe
    Et des cartes existent dans l'espace
    Quand j'émets "update-block" avec linked_card_ids=[id1, id2]
    Alors le bloc est lié aux cartes spécifiées

  # --- Commentaires de bloc ---

  Scénario: Commenter un bloc
    Soit le bloc "Tour de table" existe
    Quand j'émets "add-block-comment" avec le contenu "Prévoir 5 min de plus"
    Alors le commentaire est ajouté au bloc
    Et les autres participants reçoivent "block-comment-added"

  # --- Sections ---

  Scénario: Créer une section pour regrouper des blocs
    Quand j'émets "create-section" avec le titre "Matinée"
    Alors la section est créée
    Et les autres participants reçoivent "section-created"

  Scénario: Modifier une section
    Soit la section "Matinée" existe
    Quand j'émets "update-section" avec le nouveau titre "Matinée - Jour 1"
    Alors la section est mise à jour

  Scénario: Supprimer une section
    Soit la section "Matinée" existe
    Quand j'émets "delete-section" sur cette section
    Alors la section est supprimée
    Et les blocs qu'elle contenait restent disponibles

  Scénario: Réordonner les sections
    Soit les sections "Matinée", "Après-midi" existent
    Quand j'émets "reorder-sections" avec un nouvel ordre
    Alors les sections sont réordonnées

  # --- Templates ---

  Scénario: Sauvegarder le déroulé comme template
    Soit des blocs et sections existent dans le déroulé
    Quand j'émets "save-deroulement-template" avec le nom "Atelier cadrage 2h"
    Alors le template est sauvegardé avec blocs et sections
    Et je reçois "template-saved"

  Scénario: Lister les templates disponibles
    Quand j'émets "list-templates"
    Alors je reçois "templates-list" avec les templates système et personnels

  Scénario: Charger un template
    Soit le template "Atelier cadrage 2h" existe
    Quand j'émets "load-deroulement-template" avec l'identifiant du template
    Alors les blocs et sections du template sont clonés dans l'espace
    Et les éléments clonés ont de nouveaux identifiants
    Et je reçois "deroulement-loaded"

  # --- Espace archivé ---

  Scénario: Tenter de modifier le déroulé dans un espace archivé
    Soit l'espace est archivé
    Quand j'émets "create-block" ou "update-block" ou "delete-block"
    Alors je reçois une erreur "Espace archivé"
