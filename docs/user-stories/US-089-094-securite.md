# DOMAINE 11 : Sécurité et confidentialité (US 89-94)

## US-089 : URL non indexable par les moteurs de recherche

```gherkin
Scenario: Non-indexation
  Given un espace de cadrage existe
  Then la page contient une balise meta "noindex, nofollow"
  And le fichier robots.txt interdit l'indexation des espaces

Scenario: URL non devinable
  Given un espace existe à cadrage.insuffle.com/x7k9m2p4
  Then tenter cadrage.insuffle.com/x7k9m2p3 (un caractère différent) renvoie "Espace inexistant"
```

## US-090 : Connexion chiffrée

```gherkin
Scenario: HTTPS obligatoire
  Given je navigue vers http://cadrage.insuffle.com
  Then je suis automatiquement redirigé vers https://cadrage.insuffle.com

Scenario: WebSocket sécurisé
  Given je suis dans un espace de cadrage
  Then les échanges temps réel passent par WSS (WebSocket Secure)
```

## US-091 : Suppression automatique des espaces inactifs

```gherkin
Scenario: Suppression après 90 jours d'inactivité
  Given un espace n'a pas été visité depuis 90 jours
  Then l'espace est supprimé automatiquement
  And l'URL renvoie "Cet espace a été supprimé après 90 jours d'inactivité"

Scenario: Avertissement avant suppression
  Given un espace est inactif depuis 80 jours
  And le créateur revient sur la page d'accueil
  Then un message l'avertit que l'espace sera supprimé dans 10 jours
```

## US-092 : Pas de données personnelles stockées

```gherkin
Scenario: Données minimales
  Given je contribue à un espace de cadrage
  Then seul mon pseudo (choisi librement) est stocké
  And aucun email, adresse IP, ou cookie traceur n'est conservé

Scenario: Page de confidentialité
  Given je clique sur "Confidentialité" dans le footer
  Then je vois la politique de confidentialité d'Insuffle
  And elle confirme qu'aucune donnée personnelle n'est collectée
```

## US-093 : Protection contre le vandalisme

```gherkin
Scenario: Annulation des actions récentes
  Given quelqu'un a supprimé 10 cartes d'un coup
  When je suis en mode facilitateur
  And je clique sur "Restaurer" dans l'historique
  Then les cartes supprimées dans les 5 dernières minutes sont restaurées

Scenario: Historique des suppressions
  Given je suis en mode facilitateur
  When je consulte l'historique
  Then je vois toutes les suppressions avec le pseudo de l'auteur et l'heure
```

## US-094 : Rendre un espace en lecture seule par URL

```gherkin
Scenario: Lien de lecture seule
  Given je suis en mode facilitateur
  When je clique sur "Générer un lien lecture seule"
  Then une URL de type cadrage.insuffle.com/abc123/view est générée
  And cette URL donne accès au canvas complet en lecture seule
  And aucun bouton "+" ou d'édition n'est présent

Scenario: Tentative de modification sur lien lecture seule
  Given j'accède à un lien de lecture seule
  Then aucun champ n'est éditable
  And un bandeau indique "Vue en lecture seule - Outil de cadrage Insuffle"
```
