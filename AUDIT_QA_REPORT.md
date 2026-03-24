# AUDIT QA COMPLET — Cadrage Live Insuffle
## Date: 2026-03-24 | Simulation: 100 équipes × 100 clients | 2 passes

---

## RÉSUMÉ EXÉCUTIF

- **Total anomalies identifiées** : 94
- **Corrigées dans ce sprint** : 18
- **Restantes critiques** : 11 (sécurité serveur)
- **Restantes hautes** : 15
- **Restantes moyennes** : 28
- **Restantes basses** : 22

---

## ✅ ANOMALIES CORRIGÉES (ce sprint)

| # | Description | Statut |
|---|-------------|--------|
| 1 | Axes : valeur 3 manquante (1,2,4,5 → 1,2,3,4,5) | ✅ CORRIGÉ |
| 2 | PDF axes : même fix [1,2,4,5] → [1,2,3,4,5] | ✅ CORRIGÉ |
| 3 | Landing : texte blanc sur fond blanc dark mode (header, hero, footer, Insuffle) | ✅ CORRIGÉ |
| 4 | Landing : badges gold `color: var(--color-primary)` → `#0c1629` | ✅ CORRIGÉ |
| 5 | Landing : naming "Ludique" → "Énergie ludique" | ✅ CORRIGÉ |
| 6 | Landing : bouton "Voir la démo" ajouté (header + hero) | ✅ CORRIGÉ |
| 7 | Landing : cadrages récents améliorés (date + ID au lieu de "sans titre") | ✅ CORRIGÉ |
| 8 | Toolbar axes : scroll vers section au lieu de rien | ✅ CORRIGÉ |
| 9 | DarkBoard bannière : fermeture permanente (localStorage) | ✅ CORRIGÉ |
| 10 | Loading screen : spinner + couleurs hardcoded | ✅ CORRIGÉ |
| 11 | RecapTab : Déroulé et Agenda ajoutés | ✅ CORRIGÉ |
| 12 | PDF export : pages Déroulé et Agenda ajoutées | ✅ CORRIGÉ |
| 13 | CSV/Text export : sections Déroulé et Agenda ajoutées | ✅ CORRIGÉ |
| 14 | ExportPanel : `blockTypeColors` hors scope dans Agenda PDF → déplacé | ✅ CORRIGÉ |
| 15 | ExportPanel : `.sort()` mutait le state → `[...arr].sort()` | ✅ CORRIGÉ |
| 16 | ExportPanel : `block.title.replace()` crash si null → `(block.title \|\| '')` | ✅ CORRIGÉ |
| 17 | RecapTab : midnight time wrap + sort mutation | ✅ CORRIGÉ |
| 18 | Toolbar : notification axes seulement quand section non visible | ✅ CORRIGÉ |

---

## 🔴 CRITIQUES NON CORRIGÉES — SÉCURITÉ SERVEUR (app.js)

Ces vulnérabilités nécessitent un refactoring du middleware d'autorisation.

| # | Event/Endpoint | Vulnérabilité | Impact |
|---|----------------|---------------|--------|
| SEC-01 | `set-facilitator` | Aucune vérification d'autorisation — n'importe qui devient facilitateur | **Escalade de privilèges** |
| SEC-02 | `delete-card` | Fait confiance au booléen `asFacilitator` du client | **Suppression non autorisée** |
| SEC-03 | `set-axis-final` | Pas de check facilitateur | Position finale modifiable par tous |
| SEC-04 | `lock-axis` | Pas de check facilitateur | Axes verrouillables par tous |
| SEC-05 | `lock-phase` / `hide-phase` | Pas de check facilitateur | Phases lockables par tous |
| SEC-06 | `start-timer` / `stop-timer` | Pas de check facilitateur + durée illimitée | DoS + contrôle session |
| SEC-07 | `archive-space` | Pas de check facilitateur | Archivage par n'importe qui |
| SEC-08 | `set-welcome-message` | Pas de check facilitateur + pas d'échappement HTML | XSS + défacement |
| SEC-09 | `update-header` | Pas de check facilitateur | Modification métadonnées |
| SEC-10 | REST `PATCH/DELETE/PUT` | Aucune authentification sur toutes les API REST | Modification de n'importe quel espace |
| SEC-11 | `facilitator_ids` JSON | Race condition read-modify-write concurrent | Perte de données |

**Recommandation** : créer un middleware `requireFacilitator(currentSpace, currentPseudo)` et l'appliquer à tous les events admin.

---

## 🟠 HAUTES NON CORRIGÉES

### Archived check manquant
| # | Event | Impact |
|---|-------|--------|
| ARC-01 | `update-card` | Modification de cartes en espace archivé |
| ARC-02 | `move-card` | Déplacement de cartes en espace archivé |
| ARC-03 | `mark-discuss` | Marquage en espace archivé |
| ARC-04 | `add-tag` / `remove-tag` | Tags modifiables en espace archivé |
| ARC-05 | `react` / `unvote` | Réactions/votes en espace archivé |
| ARC-06 | `add-comment` | Commentaires en espace archivé |
| ARC-07 | `delete-block` / `reorder-blocks` | Déroulé modifiable en espace archivé |
| ARC-08 | Toutes opérations sections/agenda | Agenda modifiable en espace archivé |

### Client-side archived enforcement
| # | Composant | Impact |
|---|-----------|--------|
| CLI-01 | Card.jsx:38,45 | saveEdit/deleteCard ne check pas state.archived |
| CLI-02 | ColumnView.jsx:150 | Bouton "Répondre" visible en mode archivé |
| CLI-03 | DeroulePage.jsx:486 | Formulaire création bloc accessible en archivé |

### Database
| # | Description | Impact |
|---|-------------|--------|
| DB-01 | `cards` → `spaces` FK sans ON DELETE CASCADE | Cartes orphelines |
| DB-02 | Autres FK sans CASCADE (axes, activity_log, blocks, etc.) | Données orphelines |
| DB-03 | Aucun rate limiting sur events socket | DoS possible |

---

## 🟡 MOYENNES NON CORRIGÉES

| # | Description | Fichier | Catégorie |
|---|-------------|---------|-----------|
| M-01 | Pseudo sans limite de longueur | app.js:491 | Validation |
| M-02 | Payload size illimité (block title, description, etc.) | app.js | Validation |
| M-03 | `phase`/`column_key` non validés contre PHASES | app.js:537 | Validation |
| M-04 | `block_type` non validé contre liste autorisée | app.js:825 | Validation |
| M-05 | Position SQL dans socket diffère du REST (filtre phase manquant) | app.js:561 vs 290 | Intégrité |
| M-06 | AgendaPage time parsing — "24:00" ou "25:99" accepté | AgendaPage.jsx:39 | Validation |
| M-07 | Auto-schedule ne gère pas dépassement fin de journée | app.js:1043 | Logique |
| M-08 | Live indicator timezone UTC vs local | AgendaPage.jsx:388 | Timezone |
| M-09 | Template import sans timeout ni feedback d'erreur | DeroulePage.jsx:525 | UX |
| M-10 | Template data non validé à l'import | app.js:1092 | Sécurité |
| M-11 | Warning Insuffle dit "90 min" mais vérifie `> 120` | DeroulePage.jsx:434 | Logique |
| M-12 | Couleurs block_type hardcodées (pas CSS variables) | DeroulePage.jsx:12 | Dark mode |
| M-13 | ToolBar overflow sur mobile (pas de menu hamburger) | ToolBar.jsx:102 | Mobile |
| M-14 | PseudoModal background utilise `var(--color-primary)` | PseudoModal.jsx:32 | Dark mode |
| M-15 | OnboardingTour crash si élément target null | OnboardingTour.jsx:109 | Crash |
| M-16 | OnboardingTour resize listener accumulation | OnboardingTour.jsx:141 | Memory leak |
| M-17 | TimerDisplay crash si timer undefined | TimerDisplay.jsx:21 | Crash |
| M-18 | card.author_color peut être null → crash style | Card.jsx:98 | Crash |
| M-19 | Silent mode toggle logic possiblement inversé | ColumnView.jsx:110 | Logique |
| M-20 | Pas de confirmation avant archivage | ToolBar.jsx:87 | UX |
| M-21 | Tag/Reaction spam sans limite | app.js:628,647 | DoS |
| M-22 | Timer cleanup manquant au disconnect | app.js:751 | Memory leak serveur |
| M-23 | Slot overlap possible après édition manuelle | AgendaPage.jsx:252 | Intégrité |
| M-24 | FAQ toggle manque aria-label | LandingPage.jsx:330 | Accessibilité |
| M-25 | `<nav>` sans aria-label | LandingPage.jsx:104 | Accessibilité |
| M-26 | Opacité texte insuffisante pour WCAG AA | LandingPage.jsx:117,124 | Accessibilité |
| M-27 | localStorage non protégé par try-catch sur landing | LandingPage.jsx:81 | Robustesse |
| M-28 | DarkboardPromo clé localStorage globale (pas per-space) | DarkboardPromo.jsx:9 | UX |

---

## 🟢 BASSES NON CORRIGÉES

| # | Description | Catégorie |
|---|-------------|-----------|
| B-01 | NotFound.jsx couleurs legacy, pas de dark mode | Design |
| B-02 | Footer links sans focus indicator clavier | Accessibilité |
| B-03 | Fonts Google non preload (LCP) | Performance |
| B-04 | Icônes toolbar sans tooltip | Discoverabilité |
| B-05 | Pas d'indicateur progression global | UX |
| B-06 | Pas de notes privées facilitateur | Feature |
| B-07 | External links sans `rel="noreferrer"` | Sécurité mineure |
| B-08 | PDF emojis/caractères spéciaux mal rendus | Rendu |
| B-09 | PDF noms colonnes > 30 car tronqués | Rendu |
| B-10 | PDF division par zéro si phase.columns.length === 0 | Crash edge case |
| B-11 | Pas d'audio quand timer expire | UX |
| B-12 | Clipboard fallback affiche URL brute | UX |
| B-13 | Section editing via prompt() non sécurisé | UX |
| B-14 | Pas de confirmation suppression jour agenda | UX |
| B-15 | AgendaPage table view sans dark mode complet | Dark mode |
| B-16 | Card preview truncation dans command palette | UX |
| B-17 | CommandPalette sélection carte ne scroll pas | Navigation |
| B-18 | iframe DarkBoard manque allow-presentation | Fonctionnalité |
| B-19 | URL.createObjectURL non nettoyé si nav avant fin export | Memory |
| B-20 | DarkboardPromo hardcoded dark colors mal en light mode | Dark mode |
| B-21 | Search results recalculated every render (pas de useMemo) | Performance |
| B-22 | Date picker agenda pas de validation séquence jours | Validation |

---

## BACKLOG UTILISATEUR (24 items)

| # | Type | Priorité | Description | Statut |
|---|------|----------|-------------|--------|
| 1 | Anomalie | CRITIQUE | Axes ne réagissent pas aux clics (valeur 3 manquante) | ✅ CORRIGÉ |
| 2 | Anomalie | HAUTE | Échelle 1,2,4,5 — valeur 3 manquante | ✅ CORRIGÉ |
| 3 | Anomalie | MOYENNE | Écran noir 3-5s sans loader | ✅ CORRIGÉ |
| 4 | Anomalie | HAUTE | Toolbar axes — clic sans effet | ✅ CORRIGÉ |
| 5 | Correction | HAUTE | Naming "Ludique" vs "Énergie ludique" | ✅ CORRIGÉ |
| 6 | Correction | MOYENNE | Liens insuffle.com génériques | 🔲 À FAIRE |
| 7 | Correction | MOYENNE | Cadrages récents "sans titre" | ✅ CORRIGÉ |
| 8 | Correction | HAUTE | Bannière DarkBoard permanente | ✅ CORRIGÉ |
| 9 | Correction | HAUTE | Pseudo sans rôle | 🔲 DESIGN REQUIS |
| 10 | Correction | MOYENNE | Questions-guides non éditables | 🔲 DESIGN REQUIS |
| 11 | Amélioration | CRITIQUE | Champ "Titre du cadrage" | 🔲 À FAIRE |
| 12 | Amélioration | HAUTE | Indicateur progression global | 🔲 BACKLOG |
| 13 | Amélioration | HAUTE | Prévisualisation PDF | 🔲 BACKLOG |
| 14 | Amélioration | HAUTE | Notes privées facilitateur | 🔲 BACKLOG |
| 15 | Amélioration | HAUTE | Question "tension identifiée" | 🔲 BACKLOG |
| 16 | Amélioration | MOYENNE | Exemple concret (démo) | ✅ CORRIGÉ |
| 17 | Amélioration | MOYENNE | Liens entre cartes | 🔲 BACKLOG |
| 18 | Amélioration | HAUTE | Dupliquer comme template | 🔲 EXISTANT (partiel) |
| 19 | Amélioration | MOYENNE | Mode présentation axes | 🔲 BACKLOG |
| 20 | Amélioration | HAUTE | Fiche Récap auto-agrégée (Déroulé/Agenda) | ✅ CORRIGÉ |
| 21 | Amélioration | MOYENNE | Partage lecture seule | 🔲 BACKLOG |
| 22 | Amélioration | BASSE | Tooltips toolbar | 🔲 À FAIRE |
| 23 | Amélioration | HAUTE | Section tensions dans AVANT | 🔲 BACKLOG |
| 24 | Amélioration | HAUTE | Dashboard cadrages actifs | 🔲 BACKLOG |

---

## 10 PARCOURS UTILISATEURS TESTÉS

### Parcours 1 : Nouveau visiteur ✅ Globalement fonctionnel
- Créer un cadrage → Loading spinner → PseudoModal → Canvas OK
- ⚠️ Si création échoue, error handling basique (alert)

### Parcours 2 : Visiteur démo ✅ Fonctionnel
- Bouton "Voir la démo" → /6AG_demo → Board archivé en lecture seule OK
- ⚠️ Si DB pas seedée, 404 standard

### Parcours 3 : Facilitateur workflow ⚠️ Fonctionnel mais fragile
- Devenir facilitateur → Lock → Timer → Export OK
- 🔴 SÉCURITÉ : pas de check serveur pour facilitateur

### Parcours 4 : Collaboration temps réel ✅ Fonctionnel
- Cartes, commentaires, axes synchronisés OK
- ⚠️ Race condition sur positions simultanées

### Parcours 5 : Déroulé ✅ Fonctionnel
- Création, édition, duplication, templates OK
- ⚠️ Template loading sans timeout

### Parcours 6 : Agenda ✅ Fonctionnel
- Jours, slots, auto-schedule OK
- ⚠️ Times invalides (24:00+) non rejetées

### Parcours 7 : Exports ✅ Fonctionnel (après corrections)
- PDF, CSV, Text incluent Déroulé + Agenda OK
- ✅ blockTypeColors scope fix, null title fix, sort mutation fix

### Parcours 8 : Mobile ⚠️ Utilisable mais perfectible
- Landing OK, Canvas OK, Axes OK
- 🟠 Toolbar overflow sur petit écran

### Parcours 9 : Dark mode ⚠️ Amélioré mais pas parfait
- ✅ Landing page badges fixés
- ⚠️ PseudoModal, AgendaPage table, DarkboardPromo restent à adapter

### Parcours 10 : Espace archivé ⚠️ Partiellement protégé
- Banner "archivé" affiché, création cartes bloquée
- 🔴 Édition/suppression cartes, axes, déroulé non bloquées côté client

---

*Rapport mis à jour après 2e passe d'audit — Insuffle Cadrage Live*
