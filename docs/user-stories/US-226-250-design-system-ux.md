# DOMAINE 23 : Design System et UX (US 226-250)

## US-226 : Palette de couleurs Insuffle

```gherkin
Scenario: Couleurs principales
  Given je suis dans l'outil
  Then les couleurs suivantes sont utilisées :
    | usage                    | couleur                          |
    | Fond des bandeaux phases | Bleu foncé Insuffle (#1a2a4a)    |
    | Éléments d'accent        | Jaune doré Insuffle (#f5c518)    |
    | Fond du canvas           | Blanc cassé (#fafafa)            |
    | Texte principal          | Gris très foncé (#2d2d2d)        |
    | Cartes                   | Fond blanc, bordure couleur du participant |

Scenario: Mode sombre cohérent
  Given le mode sombre est activé
  Then les contrastes respectent WCAG AA (ratio 4.5:1 minimum)
```

## US-227 : Typographie lisible et hiérarchisée

```gherkin
Scenario: Hiérarchie typographique
  Given je suis dans un espace de cadrage
  Then la typographie respecte cette hiérarchie :
    | élément              | taille    | poids    |
    | Nom de la phase      | 20px      | Bold     |
    | Nom de la colonne    | 16px      | Semi-bold |
    | Texte de carte       | 14px      | Regular  |
    | Questions-guides     | 13px      | Italic, opacité 60% |
    | Pseudo participant   | 12px      | Medium   |
    | Labels et badges     | 11px      | Medium   |
```

## US-228 : Espacement et respiration visuelle

```gherkin
Scenario: Espacement entre les cartes
  Given une colonne contient 5 cartes
  Then l'espacement entre chaque carte est de 8px minimum
  And les cartes ne se touchent jamais

Scenario: Padding des colonnes
  Given une colonne est affichée
  Then elle a un padding interne de 16px

Scenario: Espacement entre les phases
  Given les 4 phases sont affichées
  Then un séparateur visuel de 24px sépare chaque phase
```

## US-229 : Composant carte cohérent partout

```gherkin
Scenario: Anatomie d'une carte
  Given une carte est affichée
  Then elle contient : bandeau auteur (haut), contenu texte (centre), barre d'actions (bas)
  And border-radius de 8px, ombre légère, bordure gauche de 3px couleur participant

Scenario: Carte au survol
  Given je survole une carte
  Then l'ombre s'intensifie et la barre d'actions apparaît

Scenario: Carte en focus
  Given je clique sur une carte
  Then une bordure jaune Insuffle entoure la carte
```

## US-230 à US-250 : Animations, transitions et UX

```gherkin
Scenario: Animation de création de carte (US-230)
  Given je crée une carte
  Then elle apparaît avec un slide-in (150ms, ease-out)

Scenario: Transition entre phases (US-231)
  Given je clique sur un onglet de phase
  Then le canvas scrolle avec une transition de 300ms ease-in-out

Scenario: États des boutons (US-232)
  Given le bouton "+" est dans une colonne
  Then il a les états : Normal (bleu), Hover (jaune), Pressed (jaune foncé), Disabled (gris)

Scenario: Toast de confirmation (US-233)
  Given je copie le lien de l'espace
  Then un toast "Lien copié" apparaît et disparaît après 3 secondes

Scenario: Barre de présence (US-234)
  Given 4 participants sont connectés
  Then 4 avatars circulaires (couleur + initiale) sont affichés en haut à droite

Scenario: Barre d'outils facilitateur (US-235)
  Given le mode facilitateur est activé
  Then une barre d'outils apparaît avec les icônes de pilotage (48px max de haut)

Scenario: Style des questions-guides (US-236)
  Given une colonne contient des questions-guides
  Then elles sont en gris (#888), italique, 13px, opacité 60%

Scenario: Timer en cours (US-237)
  Given un timer de 5 minutes est lancé
  Then il s'affiche en haut au centre (24px bold, fond jaune Insuffle)
  And la dernière minute fait clignoter le fond en rouge orangé

Scenario: Modale de pseudo (US-238)
  Given j'ouvre une URL de cadrage pour la première fois
  Then la modale affiche le logo Insuffle, le titre du cadrage et un bouton jaune "Rejoindre"

Scenario: Visuel des curseurs (US-239)
  Given les 8 axes sont affichés
  Then chaque axe a 5 cercles bleu foncé reliés par une ligne pointillée
  And la position sélectionnée est en jaune Insuffle

Scenario: Breakpoints responsive (US-240)
  Given l'application s'affiche sur différentes tailles
  Then les breakpoints sont : Desktop XL (>1440px), Desktop (1024-1440), Tablette (768-1024), Mobile (<768px)

Scenario: Empty states (US-241)
  Given une colonne ne contient aucune carte
  Then un message "Pas encore de contribution ici. Cliquez sur + pour ajouter." s'affiche

Scenario: Tags visuels (US-242)
  Given une carte a un tag "Urgent"
  Then le tag est en pill rouge clair en haut à droite de la carte

Scenario: Page de garde PDF (US-243)
  Given j'exporte en PDF
  Then la page de garde contient le logo Insuffle, le client, le facilitateur, la date

Scenario: Set d'icônes (US-244)
  Given l'application utilise des icônes
  Then toutes proviennent du même set (outline, 20px, couleur bleu Insuffle)

Scenario: Skeleton au chargement (US-245)
  Given je viens d'entrer dans un espace
  Then des placeholders gris animés s'affichent pendant le chargement

Scenario: Erreur de connexion (US-246)
  Given la connexion WebSocket est perdue
  Then un bandeau jaune "Connexion interrompue" apparaît sans pop-up bloquant

Scenario: Hero de la landing page (US-247)
  Given la landing page est affichée
  Then le hero a un fond bleu foncé Insuffle, titre blanc 48px, CTA jaune

Scenario: Double encodage couleur + forme (US-248)
  Given les participants ont des couleurs différentes
  Then chaque couleur est doublée d'une initiale dans l'avatar

Scenario: Progressive disclosure (US-249)
  Given c'est ma première visite
  Then seules les fonctionnalités essentielles sont visibles

Scenario: Footer dans l'application (US-250)
  Given je suis dans un espace de cadrage
  Then le footer est une barre fine (32px) avec "Propulsé par Insuffle" et liens discrets
```
