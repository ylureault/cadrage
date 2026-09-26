# language: fr

Fonctionnalité: Préparation guidée
  En tant que facilitateur
  Je veux savoir ce qui manque avant d'entrer dans la salle
  Afin de ne rien oublier de ce qui fait un temps collectif réussi

  Scénario: Premiers pas sur un cadrage vide
    Soit un cadrage sans aucune carte
    Alors le bandeau « Premiers pas » propose : inviter le sponsor, répondre aux questions-guides, positionner les 8 polarités, concevoir le déroulé

  Plan du Scénario: La jauge de préparation
    Soit <etat>
    Alors la jauge affiche « Prêt à <pct> % »

    Exemples:
      | etat                                             | pct |
      | un cadrage vide                                   | 0   |
      | les 9 points de préparation remplis               | 100 |

  Scénario: Aller directement à ce qui manque
    Quand j'ouvre la jauge et que je clique sur « Au moins un critère de succès observable »
    Alors j'arrive sur l'onglet Succès

  Scénario: Des méthodes suggérées par le cadrage
    Soit la polarité « Décider / Faire mûrir » est positionnée du côté « Décider »
    Et la situation du collectif est « Traverser »
    Quand j'ouvre la bibliothèque de méthodes
    Alors « Décision par consentement » est suggérée en tête
    Et ses raisons s'affichent : « Côté « Décider » » et la situation « Traverser »
