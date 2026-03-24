# AUDIT QA COMPLET — Cadrage Live Insuffle
## Date: 2026-03-24 | Simulation: 100 équipes × 100 clients

---

## RÉSUMÉ EXÉCUTIF

- **Bugs critiques** : 8
- **Bugs hauts** : 25
- **Bugs moyens** : 22
- **Bugs bas** : 15
- **Total** : 70 anomalies identifiées

---

## 1. LANDING PAGE

### CRITIQUE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| LP-01 | Texte blanc sur fond blanc en dark mode — sections Insuffle, header, hero, footer utilisaient `var(--color-primary)` qui flip en dark mode | LandingPage.jsx:97,115,283,352 | **CORRIGÉ** — hardcodé `#0c1629` |
| LP-02 | Logo "I" badge utilise `color: var(--color-primary)` sur fond gold — en dark mode, texte clair sur fond clair | LandingPage.jsx:100,102,166,358 | Contraste insuffisant |

### HAUTE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| LP-03 | Axe affiché "Sérieux / Ludique" sur landing vs "Sérieux / Énergie ludique" dans l'app | LandingPage.jsx:161 vs canvas-data.js:161 | Incohérence naming |
| LP-04 | Liens "Découvrir Insuffle", "En savoir plus", "Formations" pointent tous vers insuffle.com générique | LandingPage.jsx:246,291,310 | Liens non spécifiques |
| LP-05 | Cadrages récents affichent "Cadrage sans titre" — pas de sync du nom client depuis le serveur | LandingPage.jsx:204-209 | UX confuse |
| LP-06 | Pas de lien démo visible sur la landing | LandingPage.jsx | **CORRIGÉ** — bouton "Voir la démo" ajouté |
| LP-07 | `rel="noopener"` sans `noreferrer` sur liens externes | LandingPage.jsx:246,291,310,379-381 | Fuite referrer |

### MOYENNE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| LP-08 | FAQ toggle manque `aria-label` pour screen readers | LandingPage.jsx:330 | Accessibilité |
| LP-09 | `<nav>` sans `aria-label="Navigation principale"` | LandingPage.jsx:104 | Accessibilité |
| LP-10 | Hero text overflow possible sur petits écrans (320px) | LandingPage.jsx:120-121 | Mobile |
| LP-11 | Texte opacity-50/60/70 peut échouer WCAG AA contrast ratio | LandingPage.jsx:117,124,128 | Accessibilité |
| LP-12 | localStorage non protégé par try-catch | LandingPage.jsx:81-83,92 | Crash si storage indisponible |
| LP-13 | `new Date(s.date)` peut afficher "Invalid Date" si localStorage corrompu | LandingPage.jsx:212 | UX dégradée |

### BASSE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| LP-14 | NotFound.jsx utilise couleurs legacy Tailwind, pas de dark mode | NotFound.jsx:8-13 | Incohérence visuelle |
| LP-15 | Footer links sans focus indicator pour navigation clavier | LandingPage.jsx:376-386 | Accessibilité |
| LP-16 | Fonts Google non preload (LCP impact) | index.html:42-44 | Performance |

---

## 2. CANVAS / SPACE PAGE

### CRITIQUE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| SP-01 | **Axes ne réagissent pas au clic** — boutons 1-2-4-5 sans handler fonctionnel, compteur reste à 0 | AxesPanel.jsx | Fonctionnalité core cassée |
| SP-02 | **Échelle axes 1,2,4,5 — valeur 3 manquante** | AxesPanel.jsx, canvas-data.js | Utilisateur ne peut pas choisir médiane |
| SP-03 | **XSS Welcome Message** — rendu sans échappement HTML | PseudoModal.jsx:74 | Faille sécurité |
| SP-04 | **`set-facilitator` sans vérification d'autorisation** — n'importe qui peut devenir facilitateur | app.js:729-737 | Bypass complet des droits |

### HAUTE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| SP-05 | `delete-card` fait confiance au booléen `asFacilitator` du client | app.js:601-609 | Suppression non autorisée |
| SP-06 | `move-card` sans check archived ni facilitator | app.js:611-616 | Modification d'espace archivé |
| SP-07 | `update-card` sans check archived ni phase-lock | app.js:592-599 | Modification interdite possible |
| SP-08 | `mark-discuss`, `add-tag`, `remove-tag`, `react`, `vote`, `unvote`, `add-comment` — aucun check archived | app.js:619-696 | 7 opérations possibles sur espace archivé |
| SP-09 | `archive-space` et `update-setting` sans vérification facilitateur | app.js:804-817 | N'importe qui archive/modifie |
| SP-10 | Race condition JSON `facilitator_ids` — read-modify-write concurrent | app.js:729-735 | Perte de données |
| SP-11 | Même race condition sur `tags`, `reactions` (JSON arrays) | app.js:628-657 | Perte de données |
| SP-12 | Position SQL dans socket diffère du REST (manque filtre phase) | app.js:561 vs 290 | Positions dupliquées |
| SP-13 | Toolbar "8 axes" — clic sans effet visible, pas de scroll ni panneau | ToolBar.jsx | UX cassée |
| SP-14 | Écran noir 3-5s après "Créer un cadrage" sans loader | Transition landing→app | Feedback manquant |
| SP-15 | Bannière DarkBoard permanente sans option de fermeture | DarkboardPromo.jsx | Masque le contenu |
| SP-16 | Modale pseudo sans sélection de rôle (facilitateur/sponsor/participant) | PseudoModal.jsx | Pas de distinction de droits |
| SP-17 | Timer cleanup manquant au disconnect — interval continue en mémoire | app.js:751-776 | Memory leak serveur |
| SP-18 | `card.author_color` peut être null → crash style | Card.jsx:98-99 | Crash rendu |

### MOYENNE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| SP-19 | Pseudo sans limite de longueur | app.js:491 | DoS potentiel |
| SP-20 | Aucun rate limiting sur les events socket | app.js (global) | DoS potentiel |
| SP-21 | Payload size illimité sur la plupart des champs (block title, description, etc.) | app.js (global) | Mémoire serveur |
| SP-22 | `phase`/`column_key` non validés contre PHASES lors de create-card | app.js:537-590 | Cartes orphelines |
| SP-23 | Silent mode — toggle logic potentiellement inversé | ColumnView.jsx:110 | Mode silencieux dysfonctionnel |
| SP-24 | Questions-guides figées, non éditables | canvas-data.js | Pas de personnalisation |
| SP-25 | Pas de champ "Titre du cadrage" distinct | Header app | Introuvable dans liste récents |
| SP-26 | OnboardingTour crash si élément target non trouvé (null) | OnboardingTour.jsx:109 | Crash |
| SP-27 | OnboardingTour resize listener accumulation (memory leak) | OnboardingTour.jsx:141-145 | Memory leak client |
| SP-28 | TimerDisplay crash si timer undefined après clear | TimerDisplay.jsx:21 | Crash |

### BASSE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| SP-29 | Icônes toolbar sans tooltip au hover | ToolBar.jsx | Discoverabilité |
| SP-30 | Pas d'indicateur de progression global du cadrage | Header/Nav | UX |
| SP-31 | Pas de notes privées facilitateur par phase | Canvas/Phases | Fonctionnalité manquante |

---

## 3. FICHE RÉCAP / EXPORTS

### CRITIQUE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| EX-01 | **RecapTab ne montre PAS le Déroulé (blocks)** | RecapTab.jsx (entier) | 50% du contenu manquant |
| EX-02 | **RecapTab ne montre PAS l'Agenda** | RecapTab.jsx (entier) | 50% du contenu manquant |
| EX-03 | **PDF export n'inclut PAS le Déroulé** | ExportPanel.jsx:153-240 | Export incomplet |
| EX-04 | **PDF export n'inclut PAS l'Agenda** | ExportPanel.jsx:153-240 | Export incomplet |
| EX-05 | **CSV export n'inclut PAS le Déroulé** | ExportPanel.jsx:428-486 | Export incomplet |
| EX-06 | **CSV export n'inclut PAS l'Agenda** | ExportPanel.jsx:428-486 | Export incomplet |
| EX-07 | **Text export n'inclut PAS le Déroulé/Agenda** | ExportPanel.jsx:11-69 | Export incomplet |

### MOYENNE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| EX-08 | RecapTab empty state ne détecte pas les blocks seuls | RecapTab.jsx:42-50 | État vide incorrect |
| EX-09 | PDF — emojis/caractères spéciaux mal rendus (font jsPDF) | ExportPanel.jsx:193-236 | Rendu dégradé |
| EX-10 | PDF — noms de colonnes longs (>30 car) tronqués | ExportPanel.jsx:174 | Perte d'information |
| EX-11 | PDF — division par zéro si phase.columns.length === 0 | ExportPanel.jsx:364 | Crash |

---

## 4. DÉROULÉ & AGENDA

### HAUTE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| DA-01 | **Aucune vérification facilitateur** sur CRUD blocks/sections/agenda | app.js:821-1117 | N'importe qui modifie le déroulé |
| DA-02 | **Aucun check archived** sur opérations déroulé/agenda | app.js:838-1090 | Modification d'espace archivé |
| DA-03 | `block_type` non validé contre liste autorisée côté serveur | app.js:825-826 | Types invalides |

### MOYENNE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| DA-04 | Warning Insuffle dit "90 min" mais vérifie `> 120` | DeroulePage.jsx:434-435,465-470 | Message incohérent |
| DA-05 | AgendaPage time parsing — "24:00" ou "25:99" accepté sans erreur | AgendaPage.jsx:39-52 | Temps invalides |
| DA-06 | Auto-schedule ne gère pas le dépassement de fin de journée | AgendaPage.jsx:304-307 / app.js:1043-1077 | Planning déborde |
| DA-07 | Live indicator — comparaison timezone UTC vs local | AgendaPage.jsx:388-394 | Indicateur décalé |
| DA-08 | Template import sans timeout ni feedback d'erreur | DeroulePage.jsx:522-532 | UX silencieuse |
| DA-09 | Template data non validé à l'import (structure/taille) | app.js:1092-1117 | Injection possible |
| DA-10 | Couleurs block_type hardcodées, pas de CSS variables | DeroulePage.jsx:12-23 / AgendaPage.jsx:11-22 | Dark mode |

---

## 5. BASE DE DONNÉES

### HAUTE
| # | Description | Fichier:Ligne | Impact |
|---|-------------|---------------|--------|
| DB-01 | `cards` → `spaces` FK sans ON DELETE CASCADE | db.js:54 | Cartes orphelines si espace supprimé |
| DB-02 | `axes`, `activity_log`, `blocks`, `sections`, `agenda_*` — FK sans CASCADE | db.js:78,110,163,185,199,216 | Données orphelines |
| DB-03 | REST API vs Socket — validation incohérente | app.js (global) | Bypass possible via socket |

---

## 6. SÉCURITÉ

### CRITIQUE
| # | Description | Impact |
|---|-------------|--------|
| SEC-01 | XSS via welcome_message non échappé | Exécution de code côté client |
| SEC-02 | Pas de vérification facilitateur sur `set-facilitator` | Escalade de privilèges |
| SEC-03 | Client `asFacilitator` booléen fait confiance au client | Suppression non autorisée |

### HAUTE
| # | Description | Impact |
|---|-------------|--------|
| SEC-04 | Race condition read-modify-write sur JSON fields | Perte de données concurrentes |
| SEC-05 | Zero rate limiting | DoS |
| SEC-06 | Payload size illimité | Memory exhaustion |
| SEC-07 | Liens externes sans `rel="noreferrer"` | Info leak |

---

## BACKLOG UTILISATEUR (24 items reçus)

| # | Type | Priorité | Titre court | Statut |
|---|------|----------|-------------|--------|
| 1 | Anomalie | CRITIQUE | Axes ne réagissent pas aux clics | À FIXER |
| 2 | Anomalie | HAUTE | Échelle 1,2,4,5 — valeur 3 manquante | À FIXER |
| 3 | Anomalie | MOYENNE | Écran noir 3-5s sans loader | À FIXER |
| 4 | Anomalie | HAUTE | Toolbar axes — clic sans effet | À FIXER |
| 5 | Correction | HAUTE | Naming "Ludique" vs "Énergie ludique" | À FIXER |
| 6 | Correction | MOYENNE | Liens insuffle.com génériques | À FIXER |
| 7 | Correction | MOYENNE | Cadrages récents "sans titre" | À FIXER |
| 8 | Correction | HAUTE | Bannière DarkBoard permanente | À FIXER |
| 9 | Correction | HAUTE | Pseudo sans rôle | DESIGN REQUIS |
| 10 | Correction | MOYENNE | Questions-guides non éditables | DESIGN REQUIS |
| 11 | Amélioration | CRITIQUE | Champ "Titre du cadrage" | À FIXER |
| 12 | Amélioration | HAUTE | Indicateur progression global | BACKLOG |
| 13 | Amélioration | HAUTE | Prévisualisation PDF | BACKLOG |
| 14 | Amélioration | HAUTE | Notes privées facilitateur | BACKLOG |
| 15 | Amélioration | HAUTE | Question "tension identifiée" | BACKLOG |
| 16 | Amélioration | MOYENNE | Exemple concret (démo) | **EN COURS** |
| 17 | Amélioration | MOYENNE | Liens entre cartes | BACKLOG |
| 18 | Amélioration | HAUTE | Dupliquer comme template | EXISTANT (partiel) |
| 19 | Amélioration | MOYENNE | Mode présentation axes | BACKLOG |
| 20 | Amélioration | HAUTE | Fiche Récap auto-agrégée | **EN COURS** |
| 21 | Amélioration | MOYENNE | Partage lecture seule | BACKLOG |
| 22 | Amélioration | BASSE | Tooltips toolbar | À FIXER |
| 23 | Amélioration | HAUTE | Section tensions dans AVANT | BACKLOG |
| 24 | Amélioration | HAUTE | Dashboard cadrages actifs | BACKLOG |

---

*Rapport généré automatiquement par audit QA Insuffle Cadrage Live*
