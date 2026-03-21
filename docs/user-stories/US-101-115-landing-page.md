# DOMAINE 13 : Landing Page SaaS (US 101-115)

## US-101 : Page d'accueil marketing avec proposition de valeur

```gherkin
Scenario: Hero section
  Given j'arrive sur cadrage.insuffle.com
  Then je vois un titre accrocheur (ex: "Préparez vos interventions à plusieurs. En live.")
  And un sous-titre explique en une phrase la promesse
  And un bouton CTA "Créer un cadrage gratuit" est visible sans scroller
  And une capture d'écran ou animation du canvas est affichée
  And le logo Insuffle est en haut à gauche

Scenario: Pas de friction
  Given je suis sur la landing page
  Then aucun formulaire d'inscription n'est visible dans le hero
  And le CTA mène directement à la création d'un espace
```

## US-102 : Section "Comment ça marche" en 3 étapes

```gherkin
Scenario: Les 3 étapes
  Given je scrolle sous le hero
  Then je vois 3 étapes illustrées :
    | étape | titre                    | description                                      |
    | 1     | Créez un espace          | Un clic, pas de compte, une URL unique générée    |
    | 2     | Partagez le lien         | Client, sponsor, co-facilitateur : tout le monde entre |
    | 3     | Cadrez ensemble en live  | Cartes, curseurs, discussions : tout se synchronise |
  And chaque étape a un visuel ou une icône
```

## US-103 : Section présentant la méthode Insuffle

```gherkin
Scenario: Bloc méthode Insuffle
  Given je scrolle sur la landing page
  Then je vois un bloc "Basé sur le Canvas de Cadrage Insuffle"
  And le texte explique que la méthode repose sur 100+ questions stratégiques
  And les 4 phases (Avant, Pendant Facilitation, Pendant Risques, Conclusion) sont nommées
  And un visuel du canvas est affiché
  And un lien "En savoir plus sur la méthode" mène vers insuffle.com

Scenario: Crédibilité terrain
  Given je lis le bloc méthode
  Then le texte mentionne que cette méthode est utilisée en mission réelle
  And aucun chiffre inventé n'est affiché
```

## US-104 : Section fonctionnalités clés

```gherkin
Scenario: Liste des fonctionnalités
  Given je scrolle sur la landing page
  Then je vois un bloc "Ce que vous pouvez faire" avec au minimum :
    | fonctionnalité                              |
    | Collaboration temps réel                     |
    | Sans compte, accès par URL                   |
    | Canvas structuré en 4 phases                 |
    | 100+ questions-guides Insuffle               |
    | 8 curseurs de positionnement                 |
    | Mode facilitateur                            |
    | Export PDF brandé                             |
    | Mobile et tablette                           |
```

## US-105 : Section "Pour qui ?"

```gherkin
Scenario: Cibles identifiées
  Given je scrolle sur la landing page
  Then je vois un bloc "Pour qui ?" avec :
    | cible                                          |
    | Facilitateurs indépendants                     |
    | Certifiés Insuffle Académie                    |
    | Consultants en transformation                  |
    | Coachs d'équipe et de dirigeants               |
    | Managers facilitateurs                          |
  And chaque cible a une phrase d'usage concret
```

## US-106 : Section Insuffle Académie avec CTA formation

```gherkin
Scenario: Bloc Insuffle Académie
  Given je scrolle sur la landing page
  Then je vois un bloc "Devenez facilitateur certifié - Insuffle Académie"
  And le texte mentionne la certification Qualiopi
  And un CTA "Découvrir les formations" mène vers le site Insuffle Académie
  And le logo Insuffle Académie est affiché
```

## US-107 : Section tarification

```gherkin
Scenario: Grille tarifaire
  Given je scrolle vers la section "Tarifs"
  Then je vois au minimum 2 offres :
    | offre         | prix           | inclut                                        |
    | Gratuit       | 0€             | 3 espaces actifs, 5 participants max, export PDF |
    | Pro           | X€/mois        | Espaces illimités, 15 participants, templates, marque blanche, priorité support |
  And un CTA "Commencer gratuitement" est sous l'offre Gratuit
  And un CTA "Passer en Pro" est sous l'offre Pro

Scenario: Offre Insuffle Académie
  Given je regarde la grille tarifaire
  Then une mention indique "Offre Pro incluse pour les certifiés Insuffle Académie"
  And un lien mène vers Insuffle Académie
```

## US-108 : Section FAQ

```gherkin
Scenario: FAQ complète
  Given je scrolle vers la FAQ
  Then je vois au minimum ces questions/réponses :
    | question                                                |
    | Faut-il créer un compte ?                              |
    | Mes données sont-elles confidentielles ?               |
    | Combien de participants peuvent travailler en même temps ? |
    | L'outil fonctionne-t-il sur mobile ?                   |
    | Qui est derrière cet outil ?                           |
    | Puis-je exporter le cadrage ?                          |
    | Qu'est-ce qu'Insuffle Académie ?                       |
  And chaque réponse est dépliable (accordéon)
```

## US-109 : Footer avec liens Insuffle complets

```gherkin
Scenario: Footer complet
  Given je suis en bas de la landing page
  Then le footer contient :
    | lien                          | URL                          |
    | Insuffle                      | insuffle.com                 |
    | Insuffle Académie             | académie URL                 |
    | Blog Insuffle                 | blog URL                     |
    | LinkedIn Insuffle             | linkedin URL                 |
    | Politique de confidentialité  | lien interne                 |
    | Mentions légales              | lien interne                 |
    | Contact                       | lien interne                 |
  And le logo Insuffle est affiché dans le footer
```

## US-110 : SEO de la landing page

```gherkin
Scenario: Balises SEO
  Given la landing page est chargée
  Then la balise title contient "Cadrage d'atelier collaboratif | Insuffle"
  And la meta description mentionne "Préparez vos interventions à plusieurs en live"
  And les balises H1, H2, H3 sont structurées correctement
  And les images ont des attributs alt descriptifs

Scenario: Schema.org
  Given la landing page est chargée
  Then un balisage Schema.org de type SoftwareApplication est présent
  And il référence Insuffle comme éditeur
```

## US-111 : Page de démo interactive

```gherkin
Scenario: Espace de démo
  Given je clique sur "Voir la démo" sur la landing page
  Then un espace de démonstration s'ouvre
  And il est pré-rempli avec un cadrage exemple (client fictif)
  And je peux interagir avec les cartes et les curseurs
  And un bandeau indique "Mode démonstration - Insuffle Cadrage Live"

Scenario: Réinitialisation de la démo
  Given je suis dans l'espace de démo
  Then la démo se réinitialise toutes les heures
  And mes modifications sont temporaires
```

## US-112 : Vidéo de présentation sur la landing page

```gherkin
Scenario: Vidéo intégrée
  Given je scrolle sur la landing page
  Then je vois un bloc vidéo avec une miniature cliquable
  And la vidéo dure moins de 2 minutes
  And elle montre un vrai cadrage collaboratif
  And Yoan Lureault / Insuffle est identifiable

Scenario: Lecture sans quitter la page
  Given je clique sur la vidéo
  Then elle se joue en embedded sans quitter la landing page
```

## US-113 : Formulaire de contact rapide

```gherkin
Scenario: Formulaire simple
  Given je clique sur "Contactez-nous"
  Then un formulaire s'affiche avec : Nom, Email, Message
  And aucun champ inutile (pas de téléphone obligatoire, pas de société)
  When je soumets le formulaire
  Then un message confirme "Message envoyé. L'équipe Insuffle vous répond sous 48h."
```

## US-114 : Page mentions légales et CGU

```gherkin
Scenario: Mentions légales
  Given je clique sur "Mentions légales"
  Then je vois les informations légales d'Insuffle (SIRET, adresse, directeur de publication)
  And les CGU d'utilisation de l'outil sont accessibles

Scenario: CGU à l'entrée
  Given je crée un espace de cadrage pour la première fois
  Then un lien discret vers les CGU est présent sur la modale de pseudo
  And l'utilisation de l'outil vaut acceptation des CGU
```

## US-115 : Analytics de la landing page

```gherkin
Scenario: Tracking respectueux
  Given la landing page est chargée
  Then un analytics respectueux de la vie privée est actif (ex: Plausible, Matomo)
  And aucun cookie tiers n'est déposé
  And les métriques suivies sont : visites, clics CTA, espaces créés
```
