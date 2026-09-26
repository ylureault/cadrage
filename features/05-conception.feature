# language: fr

Fonctionnalité: Conception du temps collectif
  En tant que facilitateur Insuffle
  Je veux concevoir le déroulé au quart d'heure, avec une question-titre et une intention
  Afin d'envoyer au client un planning qui tombe juste et qui embarque le groupe

  Contexte:
    Soit un cadrage "abc123" existe
    Et je suis connecté avec le prénom "Yoan"
    Et le cadrage n'est pas archivé

  # --- La fiche du temps collectif ---

  Scénario: Écrire la question-titre et l'intention
    Quand j'écris la question-titre « Comment grandir avec l'entreprise quand tout s'accélère ? »
    Et j'écris l'intention « Que chacun reparte en sachant ce qu'il fait grandir chez lui. »
    Alors tous les participants voient la fiche mise à jour
    Et le haut de chaque page du planning A4 reprend la question et l'intention

  Scénario: Choisir la charte
    Quand je passe la charte en « Académie »
    Alors le planning prend les couleurs d'Insuffle Académie (violet)
    Et le logo affiche « Académie »

  Scénario: Situer le collectif sur la carte de la complexité
    Quand je choisis la situation « Dénouer »
    Alors l'outil rappelle : problème connu, collectif noué, facilitation de transformation
    Et rappelle que la carte ouvre la conversation, elle ne classe pas

  # --- Jours et séquences ---

  Scénario: Les horaires se déduisent des durées
    Soit un jour de 9h00 à 12h30
    Quand j'ajoute « Ouverture » (15 min) puis « Tables tournantes » (60 min)
    Alors « Ouverture » est à 9h00 et « Tables tournantes » à 9h15
    Et il n'y a jamais de trou ni de chevauchement

  Plan du Scénario: Les trois types de séquence du planning
    Quand j'ajoute une séquence de type « <type> »
    Alors elle s'affiche avec <rendu>

    Exemples:
      | type      | rendu                         |
      | Collectif | un filet navy                 |
      | Apport    | un filet jaune sur fond crème |
      | Pause     | une bande hachurée            |

  Scénario: Déplacer une séquence par glisser-déposer
    Quand je glisse « Pause » avant « La balade des nappes »
    Alors l'ordre et tous les horaires sont recalculés pour toute la salle

  Scénario: Mettre une séquence sur le banc
    Quand je glisse « Energizer » sur le banc
    Alors elle quitte le jour mais n'est pas supprimée
    Et je peux la replacer dans n'importe quel jour

  Scénario: Supprimer un jour sans rien perdre
    Soit le jour 2 contient 5 séquences
    Quand je supprime le jour 2
    Alors ses 5 séquences partent sur le banc
    Et les jours restants sont renumérotés

  Scénario: Finir pile à l'heure
    Soit un jour de 9h00 à 12h30 planifié jusqu'à 12h15
    Quand je clique sur « Finir à 12h30 »
    Alors la dernière séquence qui n'est pas une pause est allongée de 15 min

  Scénario: Annuler et rétablir
    Quand j'ajoute une séquence puis j'appuie sur Ctrl+Z
    Alors la séquence disparaît
    Et Ctrl+Maj+Z la fait revenir, avec le même identifiant et ses commentaires

  # --- Séquence : client et coulisses ---

  Scénario: Ce qui part au client et ce qui reste en coulisses
    Quand j'ouvre une séquence
    Alors je renseigne pour le client : intention, format, ce qui en sort
    Et pour moi seul : consignes, matériel, rôles, point d'attention, notes
    Et les coulisses n'apparaissent jamais sur le planning client

  Scénario: Situer la séquence dans le double diamant
    Quand je marque une séquence « Diverger », une autre « Groan Zone », une autre « Converger »
    Alors l'équilibre du déroulé affiche la part de chaque temps

  # --- Bibliothèque et modèles ---

  Scénario: Ajouter une méthode de la bibliothèque
    Quand j'ouvre la bibliothèque et que je cherche « décision »
    Et j'ajoute « Décision par consentement » au jour 1
    Alors une séquence de 45 min est créée avec intention, format et consignes pré-remplis

  Scénario: Filtrer les méthodes compatibles visio
    Quand je coche « Compatible visio »
    Alors les méthodes présentielles (balade des nappes, aquarium, ligne d'ancienneté) disparaissent

  Scénario: Partir d'un modèle Insuffle
    Quand j'applique le modèle « Séminaire CODIR · 2 jours » en mode remplacement
    Alors la fiche, les 2 jours et les 21 séquences sont créés
    Et chaque jour tombe juste au quart d'heure

  Scénario: Enregistrer mon propre modèle
    Quand j'enregistre le planning actuel sous « Mon séminaire type »
    Alors je le retrouve dans « Mes modèles », y compris depuis un autre cadrage sur ce navigateur

  # --- Contrôles ---

  Plan du Scénario: Contrôles du planning
    Soit <situation>
    Alors le panneau des contrôles affiche « <message> »

    Exemples:
      | situation                                     | message                                  |
      | la question-titre est vide                    | Pas de question-titre                    |
      | le jour 1 dépasse de 30 min                   | dépassement de 30 min                    |
      | une séquence dure 20 min                      | ne tombe pas sur la grille de 15 min     |
      | un texte client contient un tiret long        | Tiret long dans le texte client          |
      | 2 h 15 de travail s'enchaînent sans pause     | plus de 2 h sans pause                   |
      | une séquence collective n'a pas d'intention   | n'a pas d'intention                      |

  Scénario: Corriger tous les tirets longs d'un coup
    Soit trois séquences contiennent un tiret long
    Quand je clique sur « Corriger partout »
    Alors chaque tiret long est remplacé par une virgule ou un point

  Scénario: Repère d'équilibre Insuffle
    Soit un séminaire avec 60 % de travail actif
    Alors l'outil rappelle le repère : 70 % de travail actif, 30 % d'apport

  # --- Jour J ---

  Scénario: Suivre le déroulé le jour J
    Soit un jour daté d'aujourd'hui
    Et il est 10h20, pendant « Tables tournantes » (10h00 à 11h00)
    Alors le bandeau Jour J affiche la séquence en cours et le temps restant
    Et le facilitateur peut lancer un timer jusqu'à 11h00

  Scénario: Cadrage archivé
    Soit le cadrage est archivé
    Alors toute modification du planning est refusée avec « lecture seule »
