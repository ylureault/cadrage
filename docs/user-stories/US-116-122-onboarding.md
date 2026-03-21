# DOMAINE 14 : Onboarding et tutoriel (US 116-122)

## US-116 : Tutoriel au premier cadrage

```gherkin
Scenario: Onboarding en 4 étapes
  Given je crée mon premier espace de cadrage
  Then un overlay de tutoriel s'affiche
  And il me guide en 4 étapes :
    | étape | contenu                                              |
    | 1     | "Voici votre canvas de cadrage Insuffle en 4 phases" |
    | 2     | "Cliquez sur + pour ajouter une carte"               |
    | 3     | "Partagez le lien pour inviter des participants"     |
    | 4     | "Les curseurs vous aident à calibrer l'intervention" |
  And je peux passer le tutoriel à tout moment ("Passer")

Scenario: Tutoriel non réaffiché
  Given j'ai déjà complété le tutoriel
  When je crée un nouvel espace
  Then le tutoriel ne se relance pas
```

## US-117 : Tooltip contextuel sur chaque zone

```gherkin
Scenario: Tooltips au survol
  Given je survole le bouton "+" d'une colonne
  Then un tooltip indique "Ajouter une carte dans cette colonne"

Scenario: Tooltip sur les curseurs
  Given je survole un axe de positionnement
  Then un tooltip explique "Positionnez votre curseur pour exprimer votre lecture."
```

## US-118 : Vidéo d'aide intégrée

```gherkin
Scenario: Bouton aide
  Given je suis dans un espace de cadrage
  When je clique sur l'icône "?" dans la barre d'outils
  Then un panneau s'ouvre avec :
    | ressource                                    |
    | Vidéo "Comment utiliser Insuffle Cadrage" (1 min) |
    | Raccourcis clavier                            |
    | Lien vers la FAQ                              |
    | Lien vers le site Insuffle                    |
```

## US-119 : Email de bienvenue au créateur

```gherkin
Scenario: Email optionnel à la création
  Given je crée un espace de cadrage
  Then après la création, une modale optionnelle propose "Recevez le lien par email ?"
  And un champ email est proposé (non obligatoire)
  When je saisis mon email et je valide
  Then je reçois un email avec le lien de l'espace
  And l'email contient le logo Insuffle et un lien vers Insuffle Académie

Scenario: Refus de l'email
  Given la modale email optionnelle s'affiche
  When je clique sur "Non merci"
  Then la modale se ferme
  And aucun email n'est collecté
```

## US-120 : Message d'accueil personnalisable par le facilitateur

```gherkin
Scenario: Message d'accueil
  Given je suis en mode facilitateur
  When je clique sur "Message d'accueil" dans les paramètres
  And je saisis "Bienvenue dans le cadrage du séminaire CODIR du 15 avril."
  Then ce message s'affiche à chaque nouveau participant qui entre dans l'espace
  And le message apparaît après la saisie du pseudo

Scenario: Pas de message par défaut
  Given aucun message d'accueil n'a été configuré
  Then les participants arrivent directement sur le canvas
```

## US-121 : Espace "bac à sable" pour s'entraîner

```gherkin
Scenario: Bac à sable
  Given je suis sur la page d'accueil
  When je clique sur "S'entraîner (bac à sable)"
  Then un espace temporaire est créé
  And il est pré-rempli avec des cartes exemples
  And un bandeau indique "Espace d'entraînement - sera supprimé dans 24h"
  And la marque Insuffle est visible
```

## US-122 : Guide PDF téléchargeable "Maîtriser le cadrage Insuffle"

```gherkin
Scenario: Téléchargement du guide
  Given je clique sur "Télécharger le guide de cadrage Insuffle"
  Then un PDF est téléchargé
  And il contient la méthode de cadrage expliquée phase par phase
  And toutes les questions-guides y sont listées
  And le PDF porte la marque Insuffle et un lien vers Insuffle Académie
  And aucun email n'est requis pour télécharger
```
