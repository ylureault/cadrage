# DOMAINE 16 : Écosystème Insuffle & Insuffle Académie (US 141-152)

## US-141 : Templates exclusifs pour les certifiés Insuffle Académie

```gherkin
Scenario: Accès aux templates premium
  Given je suis sur la page d'accueil
  And je suis identifié comme certifié Insuffle Académie (via code d'accès)
  Then je vois une section "Templates Insuffle Académie" avec :
    | template                                   |
    | Séminaire CODIR - Futur Désiré             |
    | Diagnostic Boussole 4C                      |
    | Atelier intelligence collective avancé      |
    | Accompagnement transformation longue durée  |
    | Kick-off avec Blobbie                       |

Scenario: Accès refusé sans code
  Given je ne suis pas certifié
  When je clique sur un template marqué "Insuffle Académie"
  Then un message indique "Réservé aux facilitateurs certifiés Insuffle Académie"
  And un lien mène vers la page de formation
```

## US-142 : Badge "Certifié Insuffle Académie" sur le canvas

```gherkin
Scenario: Badge visible
  Given je suis identifié comme certifié Insuffle Académie
  Then un badge "Certifié Insuffle Académie" apparaît à côté de mon pseudo
  And dans l'en-tête du canvas, le champ Facilitateur affiche le badge

Scenario: Badge dans l'export PDF
  Given j'exporte un cadrage en PDF
  Then le badge "Certifié Insuffle Académie" apparaît sur le document
```

## US-143 à US-152 : Intégrations écosystème Insuffle

```gherkin
Scenario: Intégration Blobbie (US-143)
  Given je suis en mode facilitateur
  When je clique sur "Outils Insuffle"
  Then je vois un lien "Lancer un diagnostic Blobbie pour cette équipe"
  When je clique dessus
  Then je suis redirigé vers blobbie.insuffle.com dans un nouvel onglet

Scenario: Intégration Baromètre (US-144)
  Given je suis en mode facilitateur
  When je clique sur "Outils Insuffle"
  Then je vois un lien "Créer un sondage Baromètre en amont"

Scenario: Bandeau promotionnel Insuffle Académie - offre gratuite (US-145)
  Given l'espace est en offre gratuite
  Then un bandeau discret en bas indique "Outil propulsé par Insuffle | Formez-vous avec Insuffle Académie"
  And il est non intrusif

Scenario: Bandeau absent en offre Pro (US-145)
  Given l'espace est en offre Pro
  Then aucun bandeau promotionnel n'est affiché

Scenario: Page "La méthode Insuffle" (US-146)
  Given je clique sur "La méthode" dans le menu
  Then je vois une page décrivant l'exercice de cadrage, les 4 phases, les 8 axes
  And elle contient des liens vers insuffle.com et Insuffle Académie

Scenario: Signature email automatique (US-147)
  Given un email d'invitation est envoyé depuis l'outil
  Then l'email contient une signature "Insuffle Cadrage Live"

Scenario: Galerie d'exemples anonymisés (US-148)
  Given je clique sur "Exemples" dans le menu
  Then je vois 3-5 cadrages anonymisés en lecture seule
  And aucune donnée confidentielle n'est exposée

Scenario: Newsletter opt-in (US-149)
  Given je suis dans les paramètres
  Then une option "Recevoir les conseils de facilitation Insuffle" est proposée

Scenario: Lien vers le blog Insuffle (US-150)
  Given je clique sur l'icône "?" (aide)
  Then je vois un lien "Articles et ressources - Blog Insuffle"

Scenario: Co-branding client (US-151)
  Given je suis en mode facilitateur sur une offre Pro
  When je clique sur "Personnaliser" dans l'en-tête
  Then je peux uploader le logo du client à côté du logo Insuffle

Scenario: Catalogue formations Insuffle Académie (US-152)
  Given je clique sur "Insuffle Académie" dans le menu principal
  Then une page affiche les formations disponibles avec liens "En savoir plus"
  And la mention "Certifié Qualiopi" est visible
```
