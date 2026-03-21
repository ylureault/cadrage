# DOMAINE 15 : Fonctionnalités avancées (US 123-140)

## US-123 : Voter sur une carte (priorisation)

```gherkin
Scenario: Vote par dot voting
  Given le facilitateur a activé le mode "Vote" sur une colonne
  Then chaque participant dispose de 3 votes (dots)
  When je clique sur une carte
  Then un dot de ma couleur apparaît sur la carte
  And mon compteur de votes restants diminue

Scenario: Résultat du vote visible
  Given tous les participants ont voté
  Then les cartes sont triées par nombre de votes (la plus votée en haut)
  And chaque carte affiche son nombre total de votes

Scenario: Retrait de vote
  Given j'ai voté sur une carte
  When je reclique sur ma dot
  Then mon vote est retiré
  And je récupère un vote disponible
```

## US-124 : Ajouter un tag/étiquette à une carte

```gherkin
Scenario: Ajout de tag
  Given une carte existe
  When je clique sur "Ajouter un tag"
  Then je peux choisir parmi des tags prédéfinis :
    | tag          | couleur |
    | Urgent       | rouge   |
    | À valider    | orange  |
    | Fait         | vert    |
    | Question     | bleu    |
  And le tag apparaît sur la carte

Scenario: Tags personnalisés par le facilitateur
  Given je suis en mode facilitateur
  When je crée un tag personnalisé "Hors scope"
  Then ce tag devient disponible pour tous les participants
```

## US-125 : Rechercher dans un espace de cadrage

```gherkin
Scenario: Recherche textuelle
  Given l'espace contient 50 cartes
  When je saisis "résistance" dans le champ de recherche
  Then les cartes contenant "résistance" sont mises en surbrillance
  And les autres cartes sont grisées
  And un compteur indique "3 résultats trouvés"

Scenario: Recherche sans résultat
  Given je recherche "blockchain"
  Then un message indique "Aucune carte ne contient ce terme"
```

## US-126 : Créer un snapshot (version) du cadrage

```gherkin
Scenario: Création d'un snapshot
  Given je suis en mode facilitateur
  When je clique sur "Sauvegarder un snapshot"
  And je nomme le snapshot "Après call du 10 mars"
  Then l'état actuel du canvas est sauvegardé
  And il apparaît dans la liste des snapshots

Scenario: Consultation d'un snapshot
  Given 2 snapshots existent
  When je clique sur "Après call du 10 mars"
  Then le canvas s'affiche dans l'état sauvegardé (lecture seule)
  And un bouton "Revenir au cadrage actuel" permet de quitter

Scenario: Comparaison de snapshots
  Given je suis en mode facilitateur
  When je clique sur "Comparer"
  Then les cartes ajoutées depuis le snapshot sont surlignées en vert
  And les cartes supprimées sont surlignées en rouge
```

## US-127 : QR Code pour partager l'espace

```gherkin
Scenario: Affichage du QR Code
  Given je suis dans un espace de cadrage
  When je clique sur "QR Code"
  Then un QR Code s'affiche en grand au centre de l'écran
  And il encode l'URL de l'espace
  And le logo Insuffle est au centre du QR Code
  And un bouton "Fermer" permet de revenir au canvas

Scenario: QR Code imprimable
  Given le QR Code est affiché
  When je clique sur "Télécharger le QR Code"
  Then une image PNG haute résolution est téléchargée
  And elle contient le QR Code + le nom du client + "Insuffle Cadrage Live"
```

## US-128 : Lien vers une visio (Zoom, Teams, Meet)

```gherkin
Scenario: Ajout d'un lien visio
  Given je suis en mode facilitateur
  When je clique sur "Ajouter un lien visio"
  And je colle "https://meet.google.com/abc-defg-hij"
  Then un bouton "Rejoindre la visio" apparaît en haut de l'écran pour tous
  When un participant clique dessus
  Then le lien s'ouvre dans un nouvel onglet
```

## US-129 : Notifications sonores configurables

```gherkin
Scenario: Configuration des sons
  Given je clique sur l'icône paramètres
  Then je vois les options de notification :
    | option                         | défaut |
    | Son à l'arrivée d'un participant | Activé  |
    | Son à chaque nouvelle carte     | Désactivé |
    | Son de fin de timer             | Activé  |
  And je peux activer/désactiver chaque option
```

## US-130 : Mode "présentation" plein écran

```gherkin
Scenario: Mode présentation
  Given je suis dans un espace de cadrage
  When je clique sur "Mode présentation" ou appuie sur F11
  Then le canvas passe en plein écran
  And la barre d'outils est masquée (accessible au survol haut)
  And les cartes et curseurs continuent de se mettre à jour en temps réel
  And le logo Insuffle reste visible en watermark discret

Scenario: Navigation en mode présentation
  Given je suis en mode présentation
  Then les flèches gauche/droite du clavier permettent de naviguer entre les phases
```

## US-131 : Regrouper des cartes en cluster

```gherkin
Scenario: Création d'un cluster
  Given je suis en mode facilitateur
  When je sélectionne 3 cartes dans une colonne (Ctrl+clic)
  And je clique sur "Regrouper"
  Then les 3 cartes sont visuellement encadrées ensemble
  And un champ me demande de nommer le cluster (ex: "Problème de communication")

Scenario: Éclatement d'un cluster
  Given un cluster de 3 cartes existe
  When je clique sur "Dissocier"
  Then les 3 cartes redeviennent indépendantes
```

## US-132 : Ajouter une image ou un fichier à une carte

```gherkin
Scenario: Ajout d'image
  Given je crée ou modifie une carte
  When je clique sur l'icône "Image"
  And je sélectionne un fichier PNG ou JPG
  Then l'image est uploadée et affichée en miniature sur la carte
  And en cliquant sur la miniature, l'image s'affiche en grand

Scenario: Limite de taille
  Given j'uploade un fichier de plus de 5 Mo
  Then un message indique "Fichier trop volumineux (max 5 Mo)"
```

## US-133 : Lier deux cartes entre elles

```gherkin
Scenario: Création d'un lien
  Given je suis en mode facilitateur
  When je clique sur une carte, puis sur "Lier à"
  And je clique sur une deuxième carte
  Then une ligne ou flèche relie visuellement les deux cartes
  And au survol du lien, un tooltip permet de le supprimer
```

## US-134 : Mode "brainstorming silencieux" (cartes masquées)

```gherkin
Scenario: Activation du brainstorming silencieux
  Given je suis en mode facilitateur
  When j'active "Brainstorming silencieux" sur une colonne
  Then chaque participant ne voit que ses propres cartes dans cette colonne
  And les cartes des autres sont masquées
  And un bandeau indique "Mode silencieux - vos cartes sont privées pour le moment"

Scenario: Révélation des cartes
  Given le brainstorming silencieux est actif
  When le facilitateur clique sur "Révéler les cartes"
  Then toutes les cartes deviennent visibles pour tous simultanément
```

## US-135 : Emoji réaction sur une carte

```gherkin
Scenario: Réaction emoji
  Given une carte existe
  When je clique sur l'icône réaction
  Then un sélecteur propose : 👍 👎 ❓ 💡 🔥
  When je clique sur 👍
  Then le compteur 👍 s'incrémente sur la carte
  And mon pseudo apparaît au survol du compteur

Scenario: Retrait de réaction
  Given j'ai réagi avec 👍
  When je reclique sur 👍
  Then ma réaction est retirée
```

## US-136 : Statistiques de contribution par participant

```gherkin
Scenario: Dashboard de contributions
  Given je suis en mode facilitateur
  When je clique sur "Statistiques"
  Then je vois un tableau :
    | participant | cartes | commentaires | curseurs positionnés |
    | Yoan        | 12     | 5            | 8/8                  |
    | Sophie      | 8      | 3            | 6/8                  |
    | Marc        | 2      | 0            | 3/8                  |
  And les participants les moins actifs sont identifiables
```

## US-137 : Sauvegarder automatiquement toutes les 10 secondes

```gherkin
Scenario: Sauvegarde automatique
  Given je suis dans un espace de cadrage
  Then un indicateur discret montre "Sauvegardé" en bas à droite
  And toute modification est persistée en moins de 10 secondes

Scenario: Indicateur de sauvegarde en cours
  Given je viens de créer une carte
  Then l'indicateur passe à "Sauvegarde en cours..." pendant 1-2 secondes
  Then il revient à "Sauvegardé"
```

## US-138 : Annuler ma dernière action (undo)

```gherkin
Scenario: Undo
  Given je viens de supprimer ma carte par erreur
  When j'appuie sur Ctrl+Z
  Then la carte est restaurée dans sa colonne d'origine

Scenario: Undo multiple
  Given j'ai fait 3 actions successives
  When j'appuie 3 fois sur Ctrl+Z
  Then les 3 actions sont annulées dans l'ordre inverse
```

## US-139 : Multi-langue (français/anglais)

```gherkin
Scenario: Changement de langue
  Given je suis dans un espace de cadrage
  When je clique sur "FR" dans la barre d'outils et sélectionne "EN"
  Then l'interface (boutons, labels, phases) passe en anglais
  And les questions-guides passent en anglais
  And le contenu des cartes (rédigé par les participants) reste inchangé
  And le branding "Insuffle" reste en français (c'est la marque)

Scenario: Langue par participant
  Given "Yoan" est en français et "John" est en anglais
  Then chacun voit l'interface dans sa langue
  And les cartes sont visibles dans la langue de rédaction originale
```

## US-140 : Champ libre "Notes du facilitateur"

```gherkin
Scenario: Notes privées
  Given je suis en mode facilitateur
  When je clique sur "Mes notes"
  Then un panneau latéral s'ouvre avec un éditeur de texte libre
  And ce contenu n'est visible que par les facilitateurs de l'espace
  And il est sauvegardé automatiquement

Scenario: Notes incluses dans l'export facilitateur
  Given j'ai rédigé des notes
  When j'exporte le cadrage en PDF
  Then une option "Inclure les notes du facilitateur" est proposée
  And si activée, les notes apparaissent en dernière page du PDF
```
