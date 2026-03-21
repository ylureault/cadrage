# DOMAINE 1 : Accès sans compte (US 1-8)

## US-001 : Accéder à la page d'accueil Insuffle Cadrage

**En tant que** visiteur,
**je veux** arriver sur la page d'accueil d'Insuffle Cadrage
**afin de** comprendre l'outil et créer un espace.

```gherkin
Scenario: Affichage de la page d'accueil
  Given je navigue vers cadrage.insuffle.com
  Then je vois le logo Insuffle
  And je vois un bouton "Créer un cadrage"
  And je vois une phrase d'accroche expliquant l'outil
  And aucun formulaire de connexion n'est affiché

Scenario: Aucun cookie de tracking au chargement
  Given je navigue vers cadrage.insuffle.com
  Then aucun cookie de tracking tiers n'est déposé
  And aucune bannière de consentement n'est affichée
```

---

## US-002 : Créer un espace de cadrage sans compte

**En tant que** facilitateur Insuffle,
**je veux** créer un espace de cadrage en un clic
**afin de** démarrer une préparation sans friction.

```gherkin
Scenario: Création d'un espace
  Given je suis sur la page d'accueil
  When je clique sur "Créer un cadrage"
  Then un nouvel espace est créé
  And une URL unique est générée (ex: cadrage.insuffle.com/abc123)
  And je suis redirigé vers cet espace
  And le canvas de cadrage Insuffle vide s'affiche

Scenario: L'URL générée est aléatoire et non devinable
  Given je crée un espace de cadrage
  Then l'identifiant dans l'URL fait au minimum 8 caractères alphanumériques
  And deux créations successives produisent des identifiants différents

Scenario: Pas de compte requis
  Given je n'ai aucun compte sur la plateforme
  When je clique sur "Créer un cadrage"
  Then l'espace est créé sans me demander email ni mot de passe
```

---

## US-003 : Choisir un pseudo en entrant dans un espace

**En tant que** participant,
**je veux** choisir un prénom ou pseudo en arrivant
**afin que** les autres sachent qui contribue.

```gherkin
Scenario: Saisie du pseudo à l'entrée
  Given j'ouvre une URL de cadrage pour la première fois
  Then une modale me demande mon prénom ou pseudo
  And un champ texte est affiché avec le placeholder "Votre prénom"
  And un bouton "Rejoindre" est présent

Scenario: Pseudo obligatoire
  Given la modale de pseudo est affichée
  When je clique sur "Rejoindre" sans rien saisir
  Then un message m'indique que le pseudo est requis
  And je ne suis pas admis dans l'espace

Scenario: Pseudo accepté
  Given la modale de pseudo est affichée
  When je saisis "Yoan" et je clique sur "Rejoindre"
  Then j'accède au canvas de cadrage
  And mon pseudo "Yoan" apparaît dans la liste des participants connectés

Scenario: Attribution automatique d'une couleur
  Given je saisis mon pseudo et je rejoins l'espace
  Then une couleur unique m'est attribuée automatiquement
  And cette couleur est visible à côté de mon pseudo
  And toutes mes contributions porteront cette couleur
```

---

## US-004 : Accéder à un espace existant via URL

**En tant que** client ou co-facilitateur,
**je veux** rejoindre un espace de cadrage via un lien reçu
**afin de** contribuer au cadrage.

```gherkin
Scenario: Accès via lien partagé
  Given j'ai reçu l'URL cadrage.insuffle.com/abc123
  When j'ouvre cette URL dans mon navigateur
  Then la modale de pseudo s'affiche
  And après saisie du pseudo, je vois le canvas avec les contributions existantes

Scenario: URL invalide
  Given j'ouvre cadrage.insuffle.com/xxxxxx (espace inexistant)
  Then je vois un message "Cet espace de cadrage n'existe pas"
  And un bouton "Créer un nouveau cadrage" est proposé
```

---

## US-005 : Retrouver un espace après fermeture du navigateur

**En tant que** participant,
**je veux** retrouver mon espace si je ferme mon navigateur
**afin de** ne pas perdre mon travail.

```gherkin
Scenario: Retour via URL
  Given j'ai contribué à l'espace cadrage.insuffle.com/abc123
  And j'ai fermé mon navigateur
  When je rouvre cadrage.insuffle.com/abc123
  Then la modale de pseudo s'affiche à nouveau
  And après saisie, je retrouve toutes les contributions existantes

Scenario: L'espace persiste dans le temps
  Given un espace a été créé il y a 7 jours
  When j'ouvre son URL
  Then l'espace est toujours accessible avec toutes ses données
```

---

## US-006 : Accéder depuis n'importe quel navigateur

**En tant que** participant,
**je veux** utiliser l'outil depuis Chrome, Firefox, Safari ou Edge
**afin de** ne pas être limité par mon navigateur.

```gherkin
Scenario: Compatibilité navigateurs
  Given j'utilise <navigateur>
  When j'ouvre une URL de cadrage
  Then le canvas s'affiche correctement
  And la collaboration temps réel fonctionne

  Examples:
    | navigateur       |
    | Chrome 90+       |
    | Firefox 88+      |
    | Safari 14+       |
    | Edge 90+         |
```

---

## US-007 : Voir la mention Insuffle sur chaque espace

**En tant que** visiteur,
**je veux** voir clairement que cet outil est un produit Insuffle
**afin de** savoir qui est derrière.

```gherkin
Scenario: Branding Insuffle visible
  Given je suis sur un espace de cadrage
  Then le logo Insuffle est affiché dans le header
  And le footer contient "Propulsé par Insuffle - insuffle.com"
  And la favicon est celle d'Insuffle
```

---

## US-008 : Accéder à un espace sur mobile

**En tant que** participant en déplacement,
**je veux** consulter et contribuer au cadrage depuis mon téléphone
**afin de** ne pas dépendre d'un ordinateur.

```gherkin
Scenario: Affichage mobile
  Given j'ouvre une URL de cadrage sur un écran de 375px de large
  Then le canvas s'affiche en mode vertical (une colonne à la fois)
  And je peux naviguer entre les phases par swipe ou onglets
  And les cartes sont lisibles sans zoom

Scenario: Ajout de carte sur mobile
  Given je suis sur mobile dans un espace de cadrage
  When je tape sur "+" dans une colonne
  Then le clavier s'ouvre
  And je peux saisir le contenu de ma carte
  And la carte est ajoutée et visible par tous
```
