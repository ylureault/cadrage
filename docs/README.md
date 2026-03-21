# Insuffle Cadrage Live - Spécifications Fonctionnelles

**Produit** : Application collaborative de cadrage d'atelier Insuffle
**Principe** : URL unique, sans compte, temps réel, multi-utilisateurs
**Canvas source** : Canvas de Cadrage d'Atelier Insuffle (AVANT / PENDANT / CONCLUSION)

## Récapitulatif des User Stories (260 US, ~900 scénarios Gherkin)

| Domaine | US | Nombre | Fichier |
|---------|-----|--------|---------|
| Accès sans compte | 1-8 | 8 | [US-001-008](user-stories/US-001-008-acces-sans-compte.md) |
| Structure du canvas | 9-16 | 8 | [US-009-016](user-stories/US-009-016-structure-canvas.md) |
| En-tête du cadrage | 17-21 | 5 | [US-017-021](user-stories/US-017-021-entete-cadrage.md) |
| Gestion des cartes | 22-33 | 12 | [US-022-033](user-stories/US-022-033-gestion-cartes.md) |
| Collaboration temps réel | 34-42 | 9 | [US-034-042](user-stories/US-034-042-collaboration-temps-reel.md) |
| Curseurs de positionnement | 43-52 | 10 | [US-043-052](user-stories/US-043-052-curseurs-positionnement.md) |
| Mode facilitateur | 53-62 | 10 | [US-053-062](user-stories/US-053-062-mode-facilitateur.md) |
| Export et partage | 63-72 | 10 | [US-063-072](user-stories/US-063-072-export-partage.md) |
| Questions-guides détaillées | 73-82 | 10 | [US-073-082](user-stories/US-073-082-questions-guides.md) |
| Page d'accueil et gestion | 83-88 | 6 | [US-083-088](user-stories/US-083-088-page-accueil.md) |
| Sécurité et confidentialité | 89-94 | 6 | [US-089-094](user-stories/US-089-094-securite.md) |
| Responsive et performance | 95-100 | 6 | [US-095-100](user-stories/US-095-100-responsive-performance.md) |
| Landing page SaaS | 101-115 | 15 | [US-101-115](user-stories/US-101-115-landing-page.md) |
| Onboarding et tutoriel | 116-122 | 7 | [US-116-122](user-stories/US-116-122-onboarding.md) |
| Fonctionnalités avancées | 123-140 | 18 | [US-123-140](user-stories/US-123-140-fonctionnalites-avancees.md) |
| Écosystème Insuffle / Académie | 141-152 | 12 | [US-141-152](user-stories/US-141-152-ecosysteme-insuffle.md) |
| Administration et pilotage | 153-160 | 8 | [US-153-160](user-stories/US-153-160-administration.md) |
| Modèle économique et conversion | 161-170 | 10 | [US-161-170](user-stories/US-161-170-modele-economique.md) |
| Intégrations et API | 171-180 | 10 | [US-171-180](user-stories/US-171-180-integrations-api.md) |
| Retour post-intervention | 181-185 | 5 | [US-181-185](user-stories/US-181-185-retour-post-intervention.md) |
| Mesure d'impact de la facilitation | 186-200 | 15 | [US-186-200](user-stories/US-186-200-mesure-impact.md) |
| Calibration collaborative des 8 axes | 201-225 | 25 | [US-201-225](user-stories/US-201-225-calibration-axes.md) |
| Design System et UX | 226-250 | 25 | [US-226-250](user-stories/US-226-250-design-system-ux.md) |
| UX Flows critiques | 251-260 | 10 | [US-251-260](user-stories/US-251-260-ux-flows.md) |
| **TOTAL** | **1-260** | **260** | |

## Cas de Test Critiques (100 TC)

| Bloc | Tests | Domaine couvert | Fichier |
|------|-------|-----------------|---------|
| 1 | TC-001 à TC-015 | Accès, création, navigation, templates | [TC-001-015](test-cases/TC-001-015-acces-creation.md) |
| 2-3 | TC-016 à TC-050 | Structure canvas, en-tête, cartes CRUD | [TC-016-050](test-cases/TC-016-050-canvas-cartes.md) |
| 4-7 | TC-051 à TC-100 | Temps réel, axes, facilitateur, export | [TC-051-100](test-cases/TC-051-100-collab-axes-export.md) |

### Critères de recette

Le système est recettable si et seulement si :

1. Les 100 tests passent au vert (0 KO toléré)
2. Chaque test est exécuté sur au minimum 2 navigateurs (Chrome + un autre)
3. Les tests de collaboration temps réel sont exécutés sur 2 machines physiques différentes
4. Les tests de performance sont mesurés avec des outils de timing
5. Les tests d'export sont validés visuellement
6. Le logo Insuffle est vérifié sur : page d'accueil, canvas, modale de pseudo, export PDF, page d'erreur, QR Code, footer

---

*Insuffle Cadrage Live | insuffle.com | Insuffle Académie | Certifié Qualiopi*
