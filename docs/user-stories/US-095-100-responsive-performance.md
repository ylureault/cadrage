# DOMAINE 12 : Responsive et performance (US 95-100)

## US-095 : Affichage tablette

```gherkin
Scenario: Layout tablette
  Given j'utilise une tablette en mode paysage (1024px)
  Then le canvas affiche 2 colonnes par phase visible
  And le scroll horizontal permet de naviguer entre les phases
  And les zones tactiles des boutons sont suffisamment grandes (48px minimum)

Scenario: Tablette en mode portrait
  Given j'utilise une tablette en mode portrait (768px)
  Then le canvas affiche 1 colonne à la fois
  And des onglets permettent de changer de colonne
```

## US-096 : Temps de chargement initial

```gherkin
Scenario: Chargement rapide
  Given j'ouvre une URL de cadrage avec une connexion standard (10 Mbps)
  Then la modale de pseudo s'affiche en moins de 2 secondes
  And le canvas complet est utilisable en moins de 3 secondes

Scenario: Espace avec beaucoup de contenu
  Given l'espace contient 80 cartes et 40 commentaires
  Then le canvas se charge en moins de 5 secondes
  And le scroll est fluide (60fps minimum)
```

## US-097 : Raccourcis clavier sur desktop

```gherkin
Scenario: Raccourcis disponibles
  Given je suis sur desktop dans un espace de cadrage
  Then les raccourcis suivants fonctionnent :
    | raccourci  | action                      |
    | N          | Nouvelle carte               |
    | Escape     | Fermer le champ de saisie    |
    | Ctrl+Enter | Valider une carte            |
    | ?          | Afficher l'aide raccourcis    |
```

## US-098 : Accessibilité pour les lecteurs d'écran

```gherkin
Scenario: Navigation au clavier
  Given j'utilise uniquement le clavier
  Then je peux naviguer entre les phases avec Tab
  And je peux créer des cartes avec Entrée
  And chaque zone a un label ARIA descriptif

Scenario: Lecteur d'écran
  Given j'utilise un lecteur d'écran
  Then les phases sont annoncées (ex: "Phase AVANT, Clarifier le cadre et l'intention")
  And les cartes sont lues avec leur auteur et leur contenu
```

## US-099 : Mode sombre

```gherkin
Scenario: Activation du mode sombre
  Given je suis dans un espace de cadrage
  When je clique sur l'icône de thème
  Then l'interface passe en mode sombre
  And les couleurs Insuffle (bleu, jaune/doré) sont adaptées au thème sombre
  And le contraste reste suffisant pour la lisibilité

Scenario: Préférence système
  Given mon système d'exploitation est en mode sombre
  Then l'outil adopte automatiquement le mode sombre
```

## US-100 : Page d'erreur personnalisée Insuffle

```gherkin
Scenario: Erreur 404
  Given j'accède à une URL invalide
  Then je vois une page avec le logo Insuffle
  And le message "Cet espace de cadrage n'existe pas ou a été supprimé"
  And un bouton "Créer un nouveau cadrage"
  And un lien "En savoir plus sur Insuffle"

Scenario: Erreur serveur
  Given le serveur rencontre une erreur
  Then je vois "Le service est temporairement indisponible"
  And un message invite à réessayer dans quelques instants
  And le logo Insuffle est toujours visible
```
