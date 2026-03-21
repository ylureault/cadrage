# DOMAINE 10 : Page d'accueil et gestion des espaces (US 83-88)

## US-083 : Voir mes espaces récents sur la page d'accueil

```gherkin
Scenario: Espaces récents (stockage local)
  Given j'ai visité 3 espaces de cadrage cette semaine
  When je retourne sur cadrage.insuffle.com
  Then une section "Vos cadrages récents" affiche les 3 espaces
  And chaque entrée montre le nom du client et la date de dernière visite
  And je peux cliquer pour y retourner directement

Scenario: Stockage local uniquement
  Given mes espaces récents sont stockés dans le navigateur
  When je change de navigateur
  Then la liste des espaces récents est vide
  And je peux toujours accéder aux espaces via leur URL
```

## US-084 : Rechercher un espace par nom de client

```gherkin
Scenario: Recherche locale
  Given j'ai 10 espaces dans mes cadrages récents
  When je saisis "BPCE" dans le champ de recherche
  Then seul l'espace avec le client "Groupe BPCE" s'affiche
```

## US-085 : Supprimer un espace de mes récents

```gherkin
Scenario: Suppression de la liste locale
  Given un espace apparaît dans mes récents
  When je clique sur "Retirer de la liste"
  Then l'espace disparaît de ma liste
  And l'espace existe toujours sur le serveur (accessible via URL)
```

## US-086 : Créer un espace à partir d'un template

```gherkin
Scenario: Templates disponibles
  Given je suis sur la page d'accueil
  When je clique sur "Créer à partir d'un template"
  Then je vois une liste de templates Insuffle :
    | Séminaire CODIR (2 jours)            |
    | Atelier équipe (demi-journée)         |
    | Kick-off projet                       |
    | Diagnostic collectif                  |
    | Séminaire transformation              |
  And chaque template est pré-rempli avec des cartes-guides

Scenario: Création depuis template
  Given je sélectionne le template "Séminaire CODIR (2 jours)"
  Then un nouvel espace est créé
  And les colonnes contiennent des cartes pré-remplies spécifiques CODIR
  And je peux modifier ou supprimer ces cartes
```

## US-087 : Découvrir Insuffle Académie depuis l'outil

```gherkin
Scenario: Lien vers Insuffle Académie
  Given je suis dans un espace de cadrage
  Then un lien discret dans le footer indique "Formez-vous à la facilitation - Insuffle Académie"
  When je clique dessus
  Then je suis redirigé vers le site d'Insuffle Académie
```

## US-088 : Voir les crédits Insuffle

```gherkin
Scenario: Page "À propos"
  Given je clique sur "À propos" dans le footer
  Then je vois une page présentant Insuffle et la méthode de cadrage
  And le lien vers insuffle.com est présent
  And le lien vers Insuffle Académie est présent
  And aucune inscription n'est sollicitée
```
