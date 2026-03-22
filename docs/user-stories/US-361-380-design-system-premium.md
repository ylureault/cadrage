# DOMAINE A : Système de Design Premium (US 361-380)

## US-361 : Typographie à 3 niveaux lisible sur tous les écrans
```gherkin
Scenario: Hiérarchie typographique
  Given l'application est affichée
  Then 3 niveaux sont utilisés :
    | Niveau     | Font            | Poids | Taille desktop | Taille mobile |
    | Titre H1   | Poppins         | 700   | 28-32px        | 22-24px       |
    | Sous-titre | Poppins         | 600   | 18-22px        | 16-18px       |
    | Corps      | Inter ou Poppins| 400   | 14-16px        | 14px          |
  And le line-height corps est entre 1.5 et 1.7
  And aucun texte n'est en dessous de 13px sauf labels secondaires (min 11px)
```

## US-362 : Palette de couleurs Insuffle avec tokens sémantiques
```gherkin
Scenario: Tokens de couleurs
  Given le design system est implémenté
  Then les tokens suivent cette structure :
    | Token                | Valeur Insuffle      | Usage                        |
    | --color-primary      | #0c1629 (Navy)       | Fond principal, texte fort    |
    | --color-accent       | #ffde59 (Jaune)      | CTA, highlights, sélections  |
    | --color-surface      | #ffffff              | Cartes, modales              |
    | --color-surface-alt  | #f8f9fc              | Fond secondaire              |
    | --color-border       | #e2e5eb              | Séparateurs                  |
    | --color-text         | #0c1629              | Texte principal              |
    | --color-text-muted   | #6b7280              | Texte secondaire             |
    | --color-success      | #10b981              | Validation, sauvegarde       |
    | --color-warning      | #f59e0b              | Attention                    |
    | --color-error        | #ef4444              | Erreurs                      |
    | --color-academie     | #8E2183 (Violet)     | Éléments Insuffle Académie   |
  And aucune couleur hardcodée dans le CSS

Scenario: Contraste WCAG AA
  Given chaque paire texte/fond est testée
  Then le ratio de contraste >= 4.5:1 pour le texte corps
  And >= 3:1 pour les éléments interactifs
```

## US-363 à US-380 : Grille, espacement, ombres, icônes, formulaires, boutons, états, skeletons, empty states, toasts, transitions, drag&drop, scroll, dark mode, focus trap, micro-animations

_(Voir document complet des spécifications dans le ticket parent)_
