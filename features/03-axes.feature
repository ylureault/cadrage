# language: fr

Fonctionnalité: Axes de positionnement
  En tant que participant d'un espace de cadrage
  Je veux me positionner sur les 8 axes
  Afin de rendre visibles les convergences et divergences du groupe

  Contexte:
    Soit un espace "abc123" existe
    Et je suis connecté avec le pseudo "Alice"
    Et l'espace n'est pas archivé

  # --- Les 8 axes ---

  Plan du Scénario: Les 8 axes sont disponibles
    Alors l'axe "<axe>" est disponible avec les pôles "<pole_gauche>" et "<pole_droit>"

    Exemples:
      | axe                    | pole_gauche        | pole_droit           |
      | decider_faire_murir    | Décider            | Faire mûrir          |
      | agir_ensemble          | Agir ensemble      | Porter le cap        |
      | tenir_cadre            | Tenir le cadre     | Autonomie du groupe  |
      | produire_explorer      | Produire           | Explorer             |
      | contenu_processus      | Contenu            | Processus            |
      | recul_action           | Prendre du recul   | Passer à l'action    |
      | ouvert_cible           | Ouvert             | Ciblé                |
      | serieux_ludique        | Sérieux            | Énergie ludique      |

  # --- Positionnement participant ---

  Scénario: Se positionner sur un axe
    Quand j'émets "set-axis-position" avec la clé "decider_faire_murir" et la position 3
    Alors ma position est enregistrée
    Et les autres participants voient ma position en temps réel
    Et la moyenne et l'écart sont recalculés

  Scénario: Se positionner avec une explication
    Quand j'émets "set-axis-position" avec la position 2 et l'explication "Je préfère trancher rapidement"
    Alors ma position et mon explication sont enregistrées
    Et les autres participants peuvent lire mon explication

  Scénario: Position hors limites
    Quand j'émets "set-axis-position" avec la position 6
    Alors je reçois une erreur de validation (positions 1 à 5 uniquement)

  Scénario: Se positionner sur un axe verrouillé
    Soit l'axe "decider_faire_murir" est verrouillé par le facilitateur
    Quand j'émets "set-axis-position" sur cet axe
    Alors je reçois une erreur "Axe verrouillé"

  # --- Détection de divergence ---

  Scénario: Alignement du groupe (écart < 2)
    Soit les positions sur l'axe "produire_explorer" sont [2, 2, 3, 2]
    Alors l'écart calculé est inférieur à 2
    Et le statut affiché est "Aligné" en vert

  Scénario: Écart modéré (2 ≤ écart < 3)
    Soit les positions sur l'axe "produire_explorer" sont [1, 3, 4, 2]
    Alors l'écart calculé est entre 2 et 3
    Et le statut affiché est "Écart modéré" en orange

  Scénario: Divergence forte (écart ≥ 3)
    Soit les positions sur l'axe "produire_explorer" sont [1, 1, 5, 5]
    Alors l'écart calculé est supérieur ou égal à 3
    Et le statut affiché est "Divergence forte" en rouge
    Et un cercle d'alerte met l'axe en surbrillance

  # --- Position finale (facilitateur) ---

  Scénario: Fixer la position finale d'un axe
    Soit je suis facilitateur
    Quand j'émets "set-axis-final" avec la clé "contenu_processus" et la position 4
    Alors la position finale est enregistrée
    Et les autres participants reçoivent "axis-final-updated"
    Et la position finale est distincte des positions individuelles

  Scénario: Un non-facilitateur tente de fixer la position finale
    Soit je ne suis pas facilitateur
    Quand j'émets "set-axis-final"
    Alors je reçois une erreur d'autorisation

  # --- Verrouillage (facilitateur) ---

  Scénario: Verrouiller un axe
    Soit je suis facilitateur
    Quand j'émets "lock-axis" sur l'axe "ouvert_cible" avec locked=true
    Alors l'axe est verrouillé
    Et les participants ne peuvent plus modifier leur position
    Et les autres reçoivent "axis-lock-changed"

  Scénario: Déverrouiller un axe
    Soit je suis facilitateur
    Et l'axe "ouvert_cible" est verrouillé
    Quand j'émets "lock-axis" sur l'axe "ouvert_cible" avec locked=false
    Alors l'axe est déverrouillé
    Et les participants peuvent à nouveau se positionner
