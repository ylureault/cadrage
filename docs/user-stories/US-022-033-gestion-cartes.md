# DOMAINE 4 : Gestion des cartes (US 22-33)

## US-022 : Ajouter une carte dans une colonne

**En tant que** participant,
**je veux** ajouter une carte dans n'importe quelle colonne
**afin de** contribuer au cadrage.

```gherkin
Scenario: Ajout d'une carte
  Given je suis dans la colonne "Clarifier le cadre et l'intention"
  When je clique sur le bouton "+"
  Then un champ de saisie apparaît
  When je saisis "Le CODIR veut sortir des silos entre les 4 directions"
  And je valide (Entrée ou bouton)
  Then la carte est créée dans la colonne
  And elle porte ma couleur de participant
  And mon pseudo est affiché sur la carte
  And tous les participants voient la carte apparaître en temps réel

Scenario: Carte vide refusée
  Given je clique sur "+"
  When je valide sans rien saisir
  Then aucune carte n'est créée
  And le champ de saisie se ferme
```

---

## US-023 : Modifier ma propre carte

**En tant que** participant,
**je veux** modifier une carte que j'ai créée
**afin de** corriger ou enrichir ma contribution.

```gherkin
Scenario: Modification de carte
  Given j'ai créé une carte "Objectif flou"
  When je double-clique sur la carte
  Then le texte devient éditable
  When je modifie en "Objectif à clarifier avec le DG"
  And je valide
  Then la carte affiche le nouveau texte
  And la modification est visible par tous

Scenario: Impossible de modifier la carte d'un autre
  Given "Sophie" a créé une carte
  When je double-clique sur sa carte
  Then le texte ne devient pas éditable
  And un message discret indique "Seul l'auteur peut modifier"
```

---

## US-024 : Supprimer ma propre carte

**En tant que** participant,
**je veux** supprimer une carte que j'ai créée
**afin de** retirer une contribution obsolète.

```gherkin
Scenario: Suppression de carte
  Given j'ai créé une carte "Point inutile"
  When je clique sur l'icône de suppression de ma carte
  Then une confirmation me demande "Supprimer cette carte ?"
  When je confirme
  Then la carte disparaît pour tous les participants

Scenario: Annulation de suppression
  Given je clique sur l'icône de suppression
  When je clique sur "Annuler"
  Then la carte reste en place
```

---

## US-025 : Voir l'auteur d'une carte

**En tant que** participant,
**je veux** savoir qui a écrit chaque carte
**afin de** pouvoir en discuter avec la bonne personne.

```gherkin
Scenario: Identification de l'auteur
  Given plusieurs participants ont contribué
  Then chaque carte affiche le pseudo de son auteur
  And la bordure ou le fond de la carte porte la couleur de l'auteur
```

---

## US-026 : Commenter une carte existante

**En tant que** participant,
**je veux** commenter la carte d'un autre
**afin de** réagir sans modifier sa contribution.

```gherkin
Scenario: Ajout d'un commentaire
  Given une carte existe dans la colonne "Risques et résistances"
  When je clique sur l'icône commentaire de la carte
  Then un champ de commentaire s'ouvre
  When je saisis "Vu ce risque chez un client similaire l'an dernier"
  And je valide
  Then le commentaire apparaît sous la carte
  And il porte mon pseudo et ma couleur
  And un badge indique le nombre de commentaires sur la carte

Scenario: Plusieurs commentaires sur une carte
  Given une carte a déjà 2 commentaires
  When j'ajoute un 3e commentaire
  Then les 3 commentaires sont affichés chronologiquement
  And le badge affiche "3"
```

---

## US-027 : Marquer une carte "à discuter"

**En tant que** participant,
**je veux** marquer une carte comme "à discuter"
**afin de** la mettre en avant pour le prochain échange.

```gherkin
Scenario: Marquage à discuter
  Given une carte existe
  When je clique sur l'icône "à discuter" (point d'interrogation ou drapeau)
  Then la carte reçoit un marqueur visuel "À discuter"
  And tous les participants voient ce marqueur

Scenario: Retrait du marquage
  Given une carte est marquée "à discuter"
  When je reclique sur l'icône
  Then le marqueur disparaît
```

---

## US-028 : Déplacer une carte vers une autre colonne

**En tant que** participant,
**je veux** déplacer une carte d'une colonne à une autre
**afin de** la reclasser si elle est mal placée.

```gherkin
Scenario: Drag and drop d'une carte
  Given une carte "Gérer les résistances du middle management" est dans "Contenu et sujet"
  When je glisse cette carte vers la colonne "Risques et résistances"
  Then la carte apparaît dans "Risques et résistances"
  And elle disparaît de "Contenu et sujet"
  And le déplacement est visible par tous en temps réel

Scenario: Déplacement entre phases
  Given une carte est dans la phase AVANT
  When je la glisse vers une colonne de la phase PENDANT
  Then le déplacement est autorisé et effectué
```

---

## US-029 : Voir les cartes apparaître en temps réel

**En tant que** participant,
**je veux** voir les cartes des autres apparaître instantanément
**afin de** travailler en live.

```gherkin
Scenario: Synchronisation temps réel des cartes
  Given "Yoan" et "Sophie" sont dans le même espace
  When "Yoan" crée une carte dans "Les attentes"
  Then "Sophie" voit la carte apparaître en moins de 2 secondes
  And la carte porte la couleur de Yoan

Scenario: Création simultanée
  Given "Yoan" et "Sophie" créent chacun une carte au même moment dans la même colonne
  Then les deux cartes apparaissent sans conflit
  And elles sont empilées dans l'ordre chronologique
```

---

## US-030 : Réordonner les cartes dans une colonne

**En tant que** participant,
**je veux** réordonner les cartes au sein d'une colonne
**afin de** prioriser les éléments.

```gherkin
Scenario: Réordonnancement par drag
  Given la colonne "Définir le succès" contient 4 cartes
  When je glisse la carte en position 3 vers la position 1
  Then la carte passe en première position
  And l'ordre est mis à jour pour tous les participants
```

---

## US-031 : Ajouter une carte longue avec texte riche

**En tant que** participant,
**je veux** saisir un texte de plusieurs lignes sur une carte
**afin de** détailler un point.

```gherkin
Scenario: Texte multiligne
  Given je crée une carte
  When je saisis un texte de 5 lignes avec des retours à la ligne
  Then la carte affiche le texte complet avec les retours
  And la carte s'agrandit verticalement pour afficher tout le contenu

Scenario: Limite de caractères
  Given je crée une carte
  When je dépasse 500 caractères
  Then un compteur m'indique le nombre de caractères restants
  And je ne peux pas dépasser 500 caractères
```

---

## US-032 : Voir le nombre de cartes par colonne

**En tant que** participant,
**je veux** voir combien de cartes chaque colonne contient
**afin d'** évaluer l'avancement.

```gherkin
Scenario: Compteur de cartes
  Given la colonne "Les personnes et les rôles" contient 6 cartes
  Then un badge "6" est affiché à côté du titre de la colonne
```

---

## US-033 : Replier/déplier une colonne

**En tant que** participant,
**je veux** replier une colonne déjà remplie
**afin de** gagner de l'espace à l'écran.

```gherkin
Scenario: Replier une colonne
  Given la colonne "Clarifier le cadre et l'intention" contient 8 cartes
  When je clique sur l'icône de pliage
  Then la colonne se réduit à son titre et le badge du nombre de cartes
  And les cartes sont masquées

Scenario: Déplier une colonne
  Given la colonne est repliée
  When je clique sur l'icône de dépliage
  Then toutes les cartes réapparaissent
```
