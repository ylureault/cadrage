# DOMAINE 6 : Curseurs de positionnement (US 43-52)

## US-043 : Voir les 8 axes de positionnement

**En tant que** participant,
**je veux** voir les 8 curseurs de positionnement du canvas Insuffle
**afin de** calibrer l'intervention.

```gherkin
Scenario: Affichage des 8 axes
  Given je suis dans un espace de cadrage
  Then je vois un panneau avec les 8 axes de positionnement :
    | axe_gauche        | axe_droit          |
    | Décider           | Faire murir        |
    | Agir ensemble     | Porter le cap      |
    | Tenir le cadre    | Autonomie du groupe |
    | Produire          | Explorer           |
    | Contenu           | Processus          |
    | Prendre du recul  | Passer à l'action  |
    | Ouvert            | Ciblé              |
    | Sérieux           | Énergie ludique    |
  And chaque axe est représenté par un slider avec 5 positions
```

---

## US-044 : Positionner mon curseur sur un axe

**En tant que** participant,
**je veux** placer mon curseur sur chaque axe
**afin d'** exprimer ma vision du cadrage.

```gherkin
Scenario: Positionnement sur un axe
  Given l'axe "Décider / Faire murir" est affiché
  When je clique sur la position 2 (plus vers "Décider")
  Then mon curseur se place en position 2
  And il porte ma couleur
  And les autres participants voient mon positionnement

Scenario: Modification de position
  Given j'ai positionné mon curseur en position 2 sur "Décider / Faire murir"
  When je clique sur la position 4
  Then mon curseur se déplace en position 4
```

---

## US-045 : Voir les positions de tous les participants sur un axe

**En tant que** participant,
**je veux** voir où chaque personne s'est positionnée
**afin de** détecter les alignements et les tensions.

```gherkin
Scenario: Visualisation multi-participants
  Given 4 participants ont positionné leur curseur sur "Contenu / Processus"
  Then je vois 4 points colorés sur l'axe
  And chaque point porte la couleur de son auteur
  And au survol d'un point, le pseudo s'affiche

Scenario: Tous alignés
  Given 4 participants ont tous choisi la position 3
  Then les 4 points sont empilés au même endroit
  And un indicateur montre "4 participants"
```

---

## US-046 : Voir la moyenne et la dispersion sur un axe

**En tant que** facilitateur,
**je veux** voir la moyenne du groupe et la dispersion
**afin d'** identifier les consensus et les divergences.

```gherkin
Scenario: Moyenne affichée
  Given 3 participants sont en position 2, 3, 4
  Then un marqueur "moyenne" apparaît en position 3
  And il est visuellement distinct des curseurs individuels

Scenario: Dispersion forte
  Given 2 participants sont en position 1 et 2 en position 5
  Then le marqueur de dispersion indique "Divergence forte"
  And l'axe est mis en surbrillance pour attirer l'attention

Scenario: Consensus
  Given 4 participants sont tous en position 3 ou 4
  Then le marqueur de dispersion indique "Aligné"
```

---

## US-047 : Réinitialiser mes curseurs

**En tant que** participant,
**je veux** réinitialiser tous mes positionnements
**afin de** repartir à zéro.

```gherkin
Scenario: Réinitialisation complète
  Given j'ai positionné mes curseurs sur 6 axes
  When je clique sur "Réinitialiser mes positions"
  And je confirme
  Then mes 6 curseurs sont supprimés
  And les positions des autres participants restent intactes
```

---

## US-048 : Axes non remplis mis en évidence

**En tant que** facilitateur,
**je veux** voir quels axes n'ont pas encore été positionnés
**afin de** relancer les participants.

```gherkin
Scenario: Axes vides
  Given 4 participants sont connectés
  And seuls 5 axes sur 8 ont été positionnés par au moins un participant
  Then les 3 axes sans positionnement sont visuellement marqués (opacité réduite ou icône)
```

---

## US-049 : Verrouiller les curseurs après discussion

**En tant que** facilitateur,
**je veux** figer les curseurs après un consensus trouvé
**afin de** ne plus y revenir.

```gherkin
Scenario: Verrouillage d'un axe
  Given je suis en mode facilitateur
  When je clique sur "Verrouiller" à côté de l'axe "Produire / Explorer"
  Then aucun participant ne peut plus modifier sa position sur cet axe
  And un cadenas apparaît sur l'axe
  And les positions restent visibles

Scenario: Déverrouillage
  Given un axe est verrouillé
  When je clique sur "Déverrouiller"
  Then les participants peuvent à nouveau modifier leur position
```

---

## US-050 : Positionner les curseurs indépendamment des cartes

**En tant que** participant,
**je veux** accéder aux curseurs sans quitter la vue des cartes
**afin de** ne pas perdre le fil.

```gherkin
Scenario: Panneau latéral des curseurs
  Given je travaille sur les cartes de la phase AVANT
  When je clique sur l'icône "Positionnement" dans la barre latérale
  Then le panneau des 8 axes s'ouvre en overlay ou panneau latéral
  And le canvas reste visible derrière
  And je peux positionner mes curseurs sans perdre le contexte
```

---

## US-051 : Voir un résumé des positionnements

**En tant que** facilitateur,
**je veux** un résumé visuel de tous les positionnements
**afin de** préparer la restitution.

```gherkin
Scenario: Vue résumé
  Given tous les participants ont positionné leurs curseurs
  When je clique sur "Voir le résumé"
  Then une vue synthétique montre les 8 axes
  And pour chaque axe : la moyenne, la dispersion, le nombre de répondants
  And les axes à forte divergence sont en haut de la liste
```

---

## US-052 : Historique des positionnements

**En tant que** facilitateur,
**je veux** voir si un participant a changé de position
**afin de** comprendre l'évolution de la réflexion.

```gherkin
Scenario: Trace de modification
  Given "Sophie" a changé sa position de 2 à 4 sur "Tenir le cadre / Autonomie du groupe"
  When je survole le point de Sophie sur cet axe
  Then un tooltip indique "Position initiale : 2 → Position actuelle : 4"
```
