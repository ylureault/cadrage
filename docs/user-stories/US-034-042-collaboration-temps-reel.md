# DOMAINE 5 : Collaboration temps réel (US 34-42)

## US-034 : Voir les participants connectés

**En tant que** participant,
**je veux** voir qui est connecté en ce moment
**afin de** savoir avec qui je travaille.

```gherkin
Scenario: Liste des participants
  Given 3 personnes sont connectées à l'espace
  Then une barre de présence affiche 3 pastilles colorées
  And chaque pastille montre le pseudo au survol
  And les pastilles sont visibles en permanence (header ou sidebar)

Scenario: Arrivée d'un participant
  Given je suis dans l'espace
  When "Marc" rejoint l'espace
  Then une nouvelle pastille apparaît avec la couleur de Marc
  And une notification discrète indique "Marc a rejoint le cadrage"
```

---

## US-035 : Voir quand un participant quitte l'espace

**En tant que** participant,
**je veux** savoir quand quelqu'un se déconnecte
**afin de** ne pas attendre quelqu'un qui est parti.

```gherkin
Scenario: Départ d'un participant
  Given "Sophie" est connectée
  When "Sophie" ferme son navigateur
  Then sa pastille passe en grisé après 30 secondes
  And une notification indique "Sophie a quitté le cadrage"
  And ses cartes restent visibles et intactes
```

---

## US-036 : Voir le curseur ou la zone de focus d'un autre participant

**En tant que** participant,
**je veux** voir dans quelle zone les autres travaillent
**afin de** coordonner nos efforts.

```gherkin
Scenario: Indicateur de présence par zone
  Given "Yoan" est en train d'écrire dans la colonne "Énergie et dynamique"
  Then les autres participants voient un indicateur coloré (couleur de Yoan) sur cette colonne
  And le pseudo "Yoan" apparaît sur l'indicateur
```

---

## US-037 : Travailler à 2 dans la même colonne sans conflit

**En tant que** participant,
**je veux** ajouter des cartes en même temps qu'un autre dans la même colonne
**afin de** ne pas être bloqué.

```gherkin
Scenario: Contributions simultanées dans la même colonne
  Given "Yoan" et "Sophie" ajoutent chacun une carte dans "Les attentes"
  When les deux valident à moins d'une seconde d'intervalle
  Then les deux cartes sont créées sans perte
  And elles apparaissent dans l'ordre de réception serveur

Scenario: Pas de verrouillage de colonne
  Given "Yoan" est en train de saisir une carte dans "Contenu et sujet"
  Then "Sophie" peut aussi cliquer sur "+" dans la même colonne
  And les deux champs de saisie coexistent
```

---

## US-038 : Notification de nouvelle carte dans une zone non visible

**En tant que** participant,
**je veux** être notifié quand une carte est ajoutée dans une zone que je ne vois pas
**afin de** ne rien rater.

```gherkin
Scenario: Badge de nouveauté sur une phase
  Given je regarde la phase AVANT
  And "Sophie" ajoute une carte dans la phase CONCLUSION
  Then l'onglet "CONCLUSION" affiche un badge de notification (point coloré)
  When je navigue vers CONCLUSION
  Then le badge disparaît
  And la nouvelle carte est mise en surbrillance brièvement
```

---

## US-039 : Travailler hors connexion temporairement

**En tant que** participant,
**je veux** que mes actions soient sauvegardées si je perds la connexion
**afin de** ne pas perdre mon travail.

```gherkin
Scenario: Perte de connexion
  Given je suis connecté à un espace
  When ma connexion internet se coupe
  Then un bandeau "Connexion perdue - vos modifications seront synchronisées au retour" s'affiche
  And je peux continuer à créer des cartes localement

Scenario: Retour de connexion
  Given j'ai créé 2 cartes hors connexion
  When ma connexion revient
  Then les 2 cartes sont synchronisées avec le serveur
  And elles apparaissent pour tous les participants
  And le bandeau de déconnexion disparaît
```

---

## US-040 : Temps réel sur connexion lente

**En tant que** participant sur un réseau faible,
**je veux** que l'outil reste utilisable
**afin de** contribuer même en conditions dégradées.

```gherkin
Scenario: Latence élevée
  Given ma connexion a une latence de 500ms
  When je crée une carte
  Then la carte apparaît immédiatement en local (optimistic update)
  And elle est confirmée par le serveur dans les 2 secondes
```

---

## US-041 : Voir l'historique des actions récentes

**En tant que** participant,
**je veux** voir les dernières actions sur le canvas
**afin de** rattraper ce qui s'est passé en mon absence.

```gherkin
Scenario: Fil d'activité
  Given je rejoins un espace avec des contributions existantes
  When je clique sur l'icône "Activité récente"
  Then je vois les 20 dernières actions (cartes ajoutées, modifiées, commentées)
  And chaque action indique le pseudo, l'heure et la zone concernée
```

---

## US-042 : Limite de participants simultanés

**En tant qu'** administrateur de l'outil,
**je veux** limiter le nombre de participants simultanés
**afin de** garantir la performance.

```gherkin
Scenario: Limite atteinte
  Given 15 participants sont connectés à un espace
  When un 16e tente de rejoindre
  Then un message indique "Cet espace a atteint sa capacité maximale (15 participants)"
  And le participant est invité à réessayer plus tard

Scenario: Place libérée
  Given l'espace est plein (15/15)
  When un participant quitte
  Then un nouveau peut rejoindre
```
