# BLOC 1 : ACCÈS ET CRÉATION D'ESPACE (TC-001 à TC-015)

## TC-001 : Chargement de la page d'accueil

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Aucune. Navigateur Chrome 90+. Connexion standard. |
| **Étapes** | 1. Ouvrir cadrage.insuffle.com dans Chrome |
| **Résultat attendu** | La page se charge en moins de 3 secondes. Le logo Insuffle est visible. Le bouton "Créer un cadrage" est affiché au-dessus de la ligne de flottaison. Aucun formulaire de connexion n'apparaît. |

## TC-002 : Création d'un espace de cadrage

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Page d'accueil chargée. |
| **Étapes** | 1. Cliquer sur "Créer un cadrage" |
| **Résultat attendu** | Un espace est créé en moins de 2 secondes. L'URL change vers cadrage.insuffle.com/[id] avec un identifiant d'au moins 8 caractères alphanumériques. La modale de pseudo s'affiche. Aucun email ni mot de passe n'est demandé. |

## TC-003 : Saisie du pseudo et entrée dans l'espace

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Modale de pseudo affichée après TC-002. |
| **Étapes** | 1. Saisir "Yoan" dans le champ pseudo. 2. Cliquer sur "Rejoindre". |
| **Résultat attendu** | Le canvas de cadrage Insuffle s'affiche avec les 4 phases. Le pseudo "Yoan" apparaît dans la barre de présence. Une couleur unique est attribuée. |

## TC-004 : Pseudo vide refusé

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Modale de pseudo affichée. |
| **Étapes** | 1. Laisser le champ vide. 2. Cliquer sur "Rejoindre". |
| **Résultat attendu** | Message d'erreur "Le pseudo est requis". L'utilisateur reste sur la modale. |

## TC-005 : Accès à un espace existant via URL

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Un espace existe avec 3 cartes créées. |
| **Étapes** | 1. Ouvrir l'URL dans un nouveau navigateur. 2. Saisir le pseudo "Sophie". 3. Cliquer sur "Rejoindre". |
| **Résultat attendu** | Sophie entre dans l'espace. Les 3 cartes existantes sont visibles. Sophie a une couleur différente. Le compteur de participants passe à 2. |

## TC-006 : URL inexistante

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Aucune. |
| **Étapes** | 1. Ouvrir cadrage.insuffle.com/zzzzzzzzz |
| **Résultat attendu** | Page d'erreur Insuffle avec logo, message "Cet espace de cadrage n'existe pas" et bouton "Créer un nouveau cadrage". |

## TC-007 : Deux créations successives produisent des IDs différents

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Page d'accueil chargée. |
| **Étapes** | 1. Créer un espace, noter l'ID. 2. Revenir à l'accueil. 3. Créer un 2e espace, noter l'ID. |
| **Résultat attendu** | Les deux IDs sont différents. Les deux espaces sont indépendants. |

## TC-008 : Accès HTTPS forcé

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Aucune. |
| **Étapes** | 1. Saisir http://cadrage.insuffle.com |
| **Résultat attendu** | Redirection automatique vers https://cadrage.insuffle.com. Connexion chiffrée. |

## TC-009 : Accès depuis Firefox

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Firefox 88+. Un espace existant. |
| **Étapes** | 1. Ouvrir l'URL dans Firefox. 2. Saisir un pseudo et rejoindre. 3. Créer une carte. |
| **Résultat attendu** | Canvas correct. Carte créée et visible. Collaboration temps réel fonctionnelle. |

## TC-010 : Accès depuis Safari

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Safari 14+ sur macOS ou iOS. Un espace existant. |
| **Étapes** | 1. Ouvrir l'URL dans Safari. 2. Saisir un pseudo. 3. Créer une carte. |
| **Résultat attendu** | Canvas correct. Carte créée et visible. WebSocket fonctionnels. |

## TC-011 : Accès depuis Edge

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Edge 90+. Un espace existant. |
| **Étapes** | 1. Ouvrir l'URL dans Edge. 2. Saisir un pseudo et rejoindre. |
| **Résultat attendu** | Canvas correct. Toutes les fonctionnalités opérationnelles. |

## TC-012 : Retour sur un espace après fermeture du navigateur

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Espace existant avec des cartes. L'utilisateur a contribué puis fermé son navigateur. |
| **Étapes** | 1. Rouvrir le navigateur. 2. Saisir l'URL. 3. Saisir le pseudo et rejoindre. |
| **Résultat attendu** | Toutes les cartes et contributions précédentes sont présentes. Aucune donnée perdue. |

## TC-013 : Espace persistant après 7 jours

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Un espace créé il y a 7 jours avec du contenu. |
| **Étapes** | 1. Ouvrir l'URL de l'espace. |
| **Résultat attendu** | L'espace est toujours accessible. Toutes les données sont intactes. |

## TC-014 : Espaces récents sur la page d'accueil

| Champ | Valeur |
|-------|--------|
| **Préconditions** | 3 espaces visités cette semaine depuis le même navigateur. |
| **Étapes** | 1. Ouvrir cadrage.insuffle.com. |
| **Résultat attendu** | Section "Vos cadrages récents" avec les 3 espaces. Chaque entrée est cliquable. |

## TC-015 : Créer un espace depuis un template

| Champ | Valeur |
|-------|--------|
| **Préconditions** | Page d'accueil chargée. |
| **Étapes** | 1. Cliquer sur "Créer à partir d'un template". 2. Sélectionner "Séminaire CODIR (2 jours)". |
| **Résultat attendu** | Nouvel espace avec URL unique. Cartes pré-remplies spécifiques CODIR. Cartes modifiables et supprimables. |
