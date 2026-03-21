# DOMAINE 24 : UX Flows critiques (US 251-260)

## US-251 : Flow "Créer un cadrage et inviter le sponsor"

```gherkin
Scenario: Parcours en moins de 2 minutes
  Given je suis sur la page d'accueil
  When je clique "Créer un cadrage"
  Then en moins de 5 secondes, l'espace est créé
  When je remplis Client et Facilitateur et j'envoie l'invitation
  Then le temps total du flow est inférieur à 2 minutes

Scenario: Aucune étape bloquante
  Given je suis dans le flow de création
  Then aucune étape ne requiert une validation email
  And aucune étape ne requiert un choix de plan
```

## US-252 : Flow "Sponsor rejoint et commence à contribuer"

```gherkin
Scenario: Parcours sponsor fluide
  Given je reçois l'email d'invitation
  When je clique sur le lien
  Then j'arrive sur la modale de pseudo directement
  When je saisis mon pseudo
  Then en moins de 30 secondes, je peux ajouter ma première carte

Scenario: Pas de friction technique
  Given je suis sponsor et pas tech-savvy
  Then aucune étape ne me demande d'installer quoi que ce soit
```

## US-253 : Flow "Facilitation en salle avec projection"

```gherkin
Scenario: Double écran
  Given j'ai le canvas sur le vidéoprojecteur (mode présentation)
  And j'ai le même espace sur ma tablette (mode facilitateur)
  When j'active le spotlight depuis ma tablette
  Then le vidéoprojecteur affiche le spotlight en temps réel

Scenario: Timer depuis la tablette
  Given je lance un timer depuis ma tablette
  Then le timer apparaît sur le vidéoprojecteur ET sur les téléphones
```

## US-254 : Flow "Cadrage asynchrone sur plusieurs jours"

```gherkin
Scenario: Contributions décalées dans le temps
  Given le facilitateur a rempli la phase AVANT le lundi à 10h
  And le sponsor ouvre l'espace le mardi à 14h
  Then le sponsor voit toutes les cartes du facilitateur

Scenario: Résumé d'activité au retour
  Given je reviens sur l'espace après 2 jours d'absence
  Then un panneau "Activité depuis votre dernière visite" s'affiche
```

## US-255 : Flow "Export et envoi au client en fin de cadrage"

```gherkin
Scenario: Export rapide
  Given le cadrage est terminé
  When je clique sur "Finaliser le cadrage"
  Then un assistant affiche 3 actions : Exporter PDF, Envoyer au sponsor, Archiver
  And je peux faire les 3 d'un coup en cliquant "Tout faire"
```

## US-256 : Flow "Certifié Insuffle Académie active ses avantages"

```gherkin
Scenario: Activation par code
  Given je suis sur la page d'accueil
  When je clique sur "Je suis certifié Insuffle Académie"
  And je saisis mon code
  Then en moins de 5 secondes : badge, templates premium et plan Pro activés
```

## US-257 : Flow "Participant mobile en réunion"

```gherkin
Scenario: Contribution mobile en 10 secondes
  Given je suis sur mobile dans l'espace
  When je tape sur "+"
  Then le clavier s'ouvre immédiatement
  When je saisis et tape Entrée
  Then la carte est créée en moins de 10 secondes au total

Scenario: Navigation mobile rapide
  Given je veux voir les curseurs
  When je tape sur l'onglet "AXES" dans la barre du bas
  Then les 8 axes s'affichent en liste scrollable
```

## US-258 : Gestion des cas d'erreur dans les flows

```gherkin
Scenario: Perte de connexion pendant un cadrage
  Given je suis en train d'écrire une carte et ma connexion se coupe
  When je valide ma carte
  Then la carte apparaît localement avec un indicateur "En attente"
  And quand la connexion revient, la carte se synchronise automatiquement

Scenario: Espace supprimé pendant que j'y suis
  Given l'espace est supprimé par le créateur pendant que je suis dedans
  Then un message s'affiche : "Cet espace de cadrage a été fermé."
  And un bouton "Créer un nouveau cadrage" est proposé
```

## US-259 : Cohérence UX entre landing page et application

```gherkin
Scenario: Continuité visuelle
  Given je suis sur la landing page
  When je clique sur "Créer un cadrage gratuit"
  Then la transition est fluide (pas de rechargement complet)
  And les couleurs, la typographie et le header sont identiques

Scenario: Navigation retour
  Given je suis dans un espace de cadrage
  When je clique sur le logo Insuffle
  Then je reviens sur la page d'accueil
```

## US-260 : UX de l'offre premium (upsell non intrusif)

```gherkin
Scenario: Upsell contextuel (pas intrusif)
  Given j'atteins la limite de 5 participants
  Then un message calme s'affiche une seule fois
  And si je clique "Plus tard", il ne réapparaît pas dans cette session

Scenario: Pas de pop-up récurrent
  Given j'utilise le plan gratuit depuis 2 semaines
  Then aucun pop-up de vente ne s'affiche spontanément

Scenario: Fonctionnalités Pro visibles mais verrouillées
  Given je suis sur le plan gratuit
  Then les fonctionnalités Pro sont visibles mais grisées avec un badge "Pro"
  And aucune fenêtre de paiement ne s'ouvre sans mon consentement explicite
```
