# DOMAINE 21 : Mesure d'impact de la facilitation (US 186-200)

## US-186 : Définir des indicateurs d'impact au moment du cadrage

```gherkin
Scenario: Ajout d'indicateurs
  Given je suis dans la colonne "Définir le succès"
  When je clique sur "Ajouter un indicateur d'impact"
  Then un formulaire spécifique s'affiche :
    | champ               | exemple                                        |
    | Indicateur          | "Nombre de décisions prises en CODIR"          |
    | Valeur avant        | "2 décisions par CODIR en moyenne"             |
    | Valeur cible après  | "5 décisions par CODIR"                        |
    | Échéance de mesure  | "3 mois après le séminaire"                    |
  And l'indicateur est créé comme une carte spéciale (icône jauge)
```

## US-187 : Panneau dédié "Mesure d'impact Insuffle"

```gherkin
Scenario: Panneau Impact
  Given je suis dans un espace de cadrage
  When je clique sur l'onglet "Impact" dans la barre de navigation
  Then je vois un tableau de bord avec :
    | section                                  |
    | Indicateurs définis au cadrage            |
    | État de la mesure (avant/pendant/après)   |
    | Score global d'impact de l'intervention   |
  And le panneau porte le titre "Mesure d'impact - Méthode Insuffle"
```

## US-188 : Sondage pré-intervention envoyé aux participants

```gherkin
Scenario: Création du sondage pré
  Given je suis en mode facilitateur
  When je clique sur "Mesure d'impact" > "Sondage pré-intervention"
  Then un formulaire me permet de définir 5-10 questions
  And des questions par défaut (méthode Insuffle) sont pré-remplies
  And un lien de sondage est généré (sans compte requis)
```

## US-189 : Sondage post-intervention (même questions)

```gherkin
Scenario: Réactivation post-intervention
  Given un sondage pré-intervention a été complété par 12 participants
  When je clique sur "Lancer le sondage post-intervention"
  Then le même questionnaire est envoyé aux mêmes participants
  And un délai configurable est proposé (1 semaine, 1 mois, 3 mois après)

Scenario: Relance automatique
  Given le sondage post a été envoyé il y a 5 jours
  And 4 participants sur 12 ont répondu
  Then une relance automatique est envoyée aux 8 non-répondants
```

## US-190 : Dashboard comparatif avant/après

```gherkin
Scenario: Graphique radar avant/après
  Given les sondages pré et post ont été complétés
  Then un graphique radar superpose les résultats avant (bleu) et après (jaune Insuffle)
  And les écarts sont calculés automatiquement
  And un score global d'amélioration est affiché (ex: "+2.3 points en moyenne")
```

## US-191 : Score d'impact Insuffle

```gherkin
Scenario: Calcul du score
  Given les sondages avant/après sont complétés
  Then un "Score d'Impact Insuffle" est calculé automatiquement
  And il est affiché sur une jauge de 0 à 100
  And la méthodologie est transparente
```

## US-192 : Rapport d'impact PDF exportable

```gherkin
Scenario: Export du rapport d'impact
  Given le panneau Impact contient des données avant/après
  When je clique sur "Exporter le rapport d'impact"
  Then un PDF est généré avec :
    | section                                    |
    | Page de garde avec logo Insuffle           |
    | Contexte de l'intervention                 |
    | Indicateurs définis et résultats            |
    | Graphique radar avant/après                 |
    | Score d'Impact Insuffle                     |
    | Détail par question avec évolution          |
    | Recommandations pour la suite               |
  And le PDF porte le branding Insuffle complet
```

## US-193 : Suivi longitudinal sur plusieurs interventions

```gherkin
Scenario: Tableau de bord multi-interventions
  Given j'ai réalisé 3 cadrages pour le même client (Groupe BPCE)
  When je clique sur "Vue client" dans la section Impact
  Then je vois un graphique temporel montrant l'évolution des scores d'impact
  And la tendance est visualisée (courbe ascendante ou descendante)
```

## US-194 : Indicateurs qualitatifs (verbatims)

```gherkin
Scenario: Sélection de verbatims clés
  Given 10 verbatims ont été collectés
  When le facilitateur sélectionne 3 verbatims marquants
  Then ils sont mis en avant dans le rapport d'impact PDF
```

## US-195 : Alerte de suivi d'impact programmée

```gherkin
Scenario: Programmation d'alertes
  Given le cadrage est terminé et les indicateurs sont définis
  When je clique sur "Programmer le suivi d'impact"
  Then je peux définir des dates de rappel (J+30, J+90, J+180)
  And un email me rappelle à chaque date
```

## US-196 : Benchmark Insuffle (comparaison anonymisée)

```gherkin
Scenario: Benchmark
  Given mon intervention a un Score d'Impact Insuffle de 72
  Then le panneau Impact affiche "Moyenne des interventions Insuffle : 68"
  And les données du benchmark sont agrégées et anonymisées
```

## US-197 : Partager le résultat d'impact sur LinkedIn

```gherkin
Scenario: Partage LinkedIn
  Given le Score d'Impact Insuffle est calculé
  When je clique sur "Partager sur LinkedIn"
  Then un visuel est généré automatiquement (score, type, nombre de participants)
  And le visuel est téléchargeable en PNG
  And aucune donnée client n'apparaît
```

## US-198 : ROI estimé de la facilitation

```gherkin
Scenario: Calcul du ROI
  Given le facilitateur saisit les données de coût et temps gagné
  Then l'outil calcule un ROI estimé sur 3, 6 et 12 mois
  And un disclaimer précise "Estimation basée sur les données saisies"
```

## US-199 : NPS (Net Promoter Score) post-intervention

```gherkin
Scenario: Question NPS
  Given le sondage post-intervention est actif
  Then il contient la question NPS standard (0 à 10)
  And le NPS est calculé automatiquement
```

## US-200 : Tableau de bord d'impact global pour Insuffle

```gherkin
Scenario: Dashboard d'impact global (admin)
  Given je suis sur le dashboard admin Insuffle
  When je clique sur "Impact global"
  Then je vois les métriques agrégées et anonymisées
  And un export PDF "Rapport d'Impact Insuffle [année]" est téléchargeable
```
