# DOMAINE 2 : Structure du Canvas (US 9-16)

## US-009 : Voir le canvas de cadrage structuré en 4 phases

**En tant que** participant,
**je veux** voir le canvas organisé en AVANT / PENDANT Facilitation / PENDANT Risques / CONCLUSION
**afin de** suivre la structure Insuffle.

```gherkin
Scenario: Affichage des 4 phases
  Given je suis dans un espace de cadrage
  Then je vois 4 zones distinctes visuellement
  And la zone "AVANT" contient le sous-titre "Canvas de Cadrage d'Atelier"
  And la zone "PENDANT" contient le sous-titre "Phase de facilitation"
  And la zone "PENDANT" contient le sous-titre "Les risques"
  And la zone "CONCLUSION" contient le sous-titre "Production, suite & impact, clôture"

Scenario: Code couleur par phase
  Given je suis dans un espace de cadrage
  Then la phase AVANT a un bandeau bleu foncé
  And la phase PENDANT Facilitation a un bandeau bleu
  And la phase PENDANT Risques a un bandeau bleu
  And la phase CONCLUSION a un bandeau jaune/doré Insuffle
```

---

## US-010 : Voir les colonnes de la phase AVANT

**En tant que** participant,
**je veux** voir les 3 colonnes de la phase AVANT
**afin de** cadrer l'intervention.

```gherkin
Scenario: Colonnes AVANT affichées
  Given je suis dans la phase AVANT du canvas
  Then je vois la colonne "Clarifier le cadre et l'intention"
  And je vois la colonne "Les personnes et les rôles"
  And je vois la colonne "Définir le succès"
  And chaque colonne a un espace de saisie vide prêt à recevoir des cartes
```

---

## US-011 : Voir les colonnes de la phase PENDANT Facilitation

**En tant que** participant,
**je veux** voir les 3 colonnes de facilitation
**afin de** préparer le déroulé.

```gherkin
Scenario: Colonnes PENDANT Facilitation affichées
  Given je suis dans la phase PENDANT Facilitation
  Then je vois la colonne "Les attentes"
  And je vois la colonne "Contenu et sujet"
  And je vois la colonne "Énergie et dynamique"
```

---

## US-012 : Voir la colonne Risques et résistances

**En tant que** participant,
**je veux** voir la zone dédiée aux risques
**afin d'** anticiper les blocages.

```gherkin
Scenario: Colonne Risques affichée
  Given je suis dans la phase PENDANT Risques
  Then je vois la colonne "Risques et résistances"
  And des questions-guides sont affichées en filigrane
```

---

## US-013 : Voir les colonnes de la phase CONCLUSION

**En tant que** participant,
**je veux** voir les 3 colonnes de conclusion
**afin de** planifier les livrables et la suite.

```gherkin
Scenario: Colonnes CONCLUSION affichées
  Given je suis dans la phase CONCLUSION
  Then je vois la colonne "Production et livrables"
  And je vois la colonne "Suite et impact"
  And je vois la colonne "Posture et meta"
```

---

## US-014 : Voir les questions-guides dans chaque colonne

**En tant que** participant,
**je veux** voir les questions de réflexion propres à chaque colonne
**afin d'** être guidé dans ma contribution.

```gherkin
Scenario: Questions-guides visibles dans "Clarifier le cadre et l'intention"
  Given je suis dans la colonne "Clarifier le cadre et l'intention"
  Then je vois en filigrane des questions comme :
    | question                                                    |
    | Quelle est la vraie raison pour laquelle on vous a appelé ? |
    | Complétez cette qui dit toujours devrait en réalité, mais... |
    | Qu'est-ce qui va changer concrètement après cette session ?  |
  And ces questions ne sont pas éditables
  And elles servent d'inspiration pour créer des cartes

Scenario: Questions-guides visibles dans chaque colonne
  Given je suis dans la colonne "<colonne>"
  Then au moins 3 questions-guides sont affichées en filigrane

  Examples:
    | colonne                           |
    | Clarifier le cadre et l'intention |
    | Les personnes et les rôles        |
    | Définir le succès                 |
    | Les attentes                      |
    | Contenu et sujet                  |
    | Énergie et dynamique              |
    | Risques et résistances            |
    | Production et livrables           |
    | Suite et impact                   |
    | Posture et meta                   |
```

---

## US-015 : Naviguer entre les phases sur grand écran

**En tant que** participant sur desktop,
**je veux** voir l'ensemble du canvas ou naviguer facilement entre les phases
**afin d'** avoir une vue d'ensemble.

```gherkin
Scenario: Scroll horizontal sur desktop
  Given je suis sur un écran de 1440px ou plus
  Then le canvas s'affiche en scroll horizontal
  And je peux voir au moins 2 phases simultanément
  And un scroll latéral fluide permet de naviguer

Scenario: Navigation par onglets optionnelle
  Given je suis dans un espace de cadrage
  Then une barre de navigation affiche les 4 phases (AVANT, PENDANT Facilitation, PENDANT Risques, CONCLUSION)
  When je clique sur "CONCLUSION"
  Then le canvas scrolle directement vers la zone CONCLUSION
```

---

## US-016 : Voir le texte introductif du canvas Insuffle

**En tant que** participant,
**je veux** lire l'explication de la démarche de cadrage Insuffle
**afin de** comprendre le processus.

```gherkin
Scenario: Bloc introductif affiché
  Given je suis dans un espace de cadrage
  Then un encadré à gauche de la phase AVANT contient le texte explicatif
  And ce texte commence par "L'exercice de cadrage d'atelier Insuffle"
  And il explique les 3 phases et les 100+ questions stratégiques
  And le mot "Insuffle" y apparaît clairement
```
