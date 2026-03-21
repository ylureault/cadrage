# DOMAINE 17 : Administration et pilotage (US 153-160)

## US-153 : Dashboard admin Insuffle

```gherkin
Scenario: Métriques principales
  Given j'accède au dashboard admin (cadrage.insuffle.com/admin)
  Then je vois :
    | métrique                          | période |
    | Nombre d'espaces créés            | jour, semaine, mois |
    | Nombre de participants uniques     | jour, semaine, mois |
    | Espaces actifs en ce moment       | temps réel          |
    | Templates les plus utilisés       | mois                |
    | Taux de conversion gratuit → Pro  | mois                |

Scenario: Accès protégé
  Given je tente d'accéder à /admin sans authentification
  Then je suis redirigé vers un formulaire de connexion
```

## US-154 à US-160

```gherkin
Scenario: Compteur de branding (US-154)
  Given je suis sur le dashboard admin
  Then je vois "X espaces créés depuis le lancement"
  And "Y PDF exportés avec la marque Insuffle"

Scenario: Gestion des templates (US-155)
  Given je suis dans l'admin section "Templates"
  When je clique sur "Nouveau template"
  Then je peux nommer le template, choisir sa catégorie (gratuit/Académie)
  And pré-remplir des cartes dans chaque colonne

Scenario: Modération contenu (US-156)
  Given un espace contient du contenu inapproprié
  When je le supprime depuis l'admin
  Then l'espace est immédiatement inaccessible

Scenario: Export métriques CSV (US-157)
  Given je suis sur le dashboard admin
  When je clique sur "Exporter les métriques"
  Then un fichier CSV est téléchargé sans données personnelles

Scenario: Configuration limites gratuit (US-158)
  Given je suis dans l'admin section "Plans"
  Then je peux modifier les limites (espaces max, participants max, export PDF)

Scenario: Codes d'accès Insuffle Académie (US-159)
  Given je suis dans l'admin section "Insuffle Académie"
  When je génère 20 codes d'accès pour la promo 2026
  Then 20 codes uniques sont créés et exportables en CSV

Scenario: Page de statut (US-160)
  Given je navigue vers status.cadrage.insuffle.com
  Then je vois l'état du service (Application web, Temps réel, Export PDF)
  And le logo Insuffle est affiché
```
