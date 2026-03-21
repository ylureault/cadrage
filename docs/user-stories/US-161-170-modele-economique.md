# DOMAINE 18 : Modèle économique et conversion (US 161-170)

## US-161 : Limite d'espaces atteinte sur le plan gratuit

```gherkin
Scenario: Limite de 3 espaces
  Given j'ai 3 espaces actifs sur le plan gratuit
  When je clique sur "Créer un cadrage"
  Then un message indique "Vous avez atteint la limite de 3 espaces actifs"
  And deux options sont proposées :
    | option                                      |
    | Archiver un espace existant pour en libérer un |
    | Passer au plan Pro pour des espaces illimités   |
```

## US-162 : Limite de participants sur le plan gratuit

```gherkin
Scenario: 5 participants max
  Given 5 participants sont dans un espace gratuit
  When un 6e tente de rejoindre
  Then un message indique "Cet espace est limité à 5 participants (plan gratuit)"
  And un lien propose de passer en Pro pour 15 participants
```

## US-163 : Page de paiement pour le plan Pro

```gherkin
Scenario: Souscription Pro
  Given je clique sur "Passer en Pro"
  Then une page de paiement s'affiche (via Stripe ou équivalent)
  And le prix est clairement affiché (mensuel et annuel)
  And les avantages Pro sont listés

Scenario: Paiement réussi
  Given je complète le paiement
  Then un email de confirmation est envoyé
  And mes espaces passent immédiatement en mode Pro
```

## US-164 à US-170

```gherkin
Scenario: Offre annuelle avec réduction (US-164)
  Given je suis sur la page de tarification
  Then un toggle permet de basculer entre mensuel et annuel
  And le tarif annuel affiche "-20%"

Scenario: Essai gratuit Pro 14 jours (US-165)
  Given je clique sur "Essayer Pro gratuitement pendant 14 jours"
  Then le plan Pro est activé sans carte bancaire requise
  And un compteur indique "J-14 avant la fin de l'essai"

Scenario: Factures (US-166)
  Given je suis abonné Pro
  When je clique sur "Mon compte" > "Factures"
  Then je vois la liste de mes factures téléchargeables en PDF

Scenario: Annulation (US-167)
  Given je suis dans "Mon compte" > "Abonnement"
  When je clique sur "Annuler l'abonnement"
  Then l'accès Pro reste actif jusqu'à la fin de la période payée

Scenario: Pro inclus pour les certifiés Académie (US-168)
  Given je saisis mon code d'accès Insuffle Académie
  Then le plan Pro est automatiquement activé sans paiement

Scenario: Parrainage (US-169)
  Given je suis abonné Pro
  When je clique sur "Parrainer un facilitateur"
  Then un code de parrainage unique est généré

Scenario: Plan Entreprise (US-170)
  Given je clique sur "Offre Entreprise" dans la tarification
  Then un formulaire de contact s'affiche pour équiper une équipe
```
