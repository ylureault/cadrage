# BLOC 4 : COLLABORATION TEMPS RÉEL (TC-051 à TC-070)

## TC-051 : Voir les participants connectés
| **Préconditions** | 3 personnes connectées. |
| **Résultat attendu** | 3 pastilles colorées. Pseudo au survol. |

## TC-052 : Arrivée d'un nouveau participant
| **Préconditions** | 2 participants connectés. |
| **Étapes** | 1. "Marc" rejoint. |
| **Résultat attendu** | Nouvelle pastille. Notification "Marc a rejoint le cadrage". Compteur à 3. |

## TC-053 : Départ d'un participant
| **Étapes** | 1. Sophie ferme son navigateur. |
| **Résultat attendu** | Pastille grisée en < 30s. Notification "Sophie a quitté". Cartes intactes. |

## TC-054 : Indicateur de zone de travail
| **Étapes** | 1. Yoan écrit dans "Énergie et dynamique". |
| **Résultat attendu** | Sophie voit un indicateur coloré de Yoan sur cette colonne. |

## TC-055 : Notification dans une zone non visible
| **Étapes** | 1. Sophie crée une carte dans CONCLUSION (Yoan regarde AVANT). |
| **Résultat attendu** | Badge de notification sur l'onglet CONCLUSION chez Yoan. |

## TC-056 : Perte de connexion et reconnexion
| **Étapes** | 1. Couper la connexion. 2. Créer une carte localement. 3. Rétablir la connexion. |
| **Résultat attendu** | Bandeau "Connexion perdue". Carte synchronisée à la reconnexion. |

## TC-057 : Sauvegarde automatique
| **Étapes** | 1. Créer une carte. 2. Observer l'indicateur. |
| **Résultat attendu** | Indicateur "Sauvegarde en cours..." puis "Sauvegardé" en < 10 secondes. |

## TC-058 : 5 participants max (plan gratuit)
| **Préconditions** | Espace gratuit, 5 participants connectés. |
| **Étapes** | 1. Un 6e tente de rejoindre. |
| **Résultat attendu** | Message "Limité à 5 participants (plan gratuit)". Les 5 existants non impactés. |

## TC-059 : 15 participants simultanés (plan Pro)
| **Préconditions** | Espace Pro. |
| **Étapes** | 1. 15 participants rejoignent et créent chacun une carte. |
| **Résultat attendu** | 15 connectés sans erreur. 15 cartes visibles. Performance acceptable. |

## TC-060 : Latence de synchronisation
| **Préconditions** | 2 participants sur réseaux différents. |
| **Étapes** | 1. Yoan crée une carte. 2. Mesurer le temps d'apparition chez Sophie. |
| **Résultat attendu** | Apparition en < 2 secondes. |

## TC-061 : QR Code pour accès mobile
| **Étapes** | 1. Cliquer "QR Code". 2. Scanner avec téléphone. |
| **Résultat attendu** | QR Code avec logo Insuffle. Le scan ouvre l'espace sur mobile. |

## TC-062 : Lien visio associé
| **Étapes** | 1. Ajouter un lien visio. 2. Valider. |
| **Résultat attendu** | Bouton "Rejoindre la visio" visible par tous. Ouvre dans nouvel onglet. |

## TC-063 : Fil d'activité récente
| **Étapes** | 1. Cliquer "Activité récente". |
| **Résultat attendu** | 10 dernières actions listées avec pseudo, heure et zone. |

## TC-064 : Modification concurrente du même champ d'en-tête
| **Étapes** | 1. Yoan et Sophie tentent de modifier "Client" en même temps. |
| **Résultat attendu** | Champ verrouillé pour Sophie. Indicateur de la couleur de Yoan visible. |

## TC-065 : Espace avec 80 cartes (performance)
| **Préconditions** | 80 cartes, 40 commentaires. |
| **Étapes** | 1. Ouvrir l'espace. 2. Naviguer. 3. Créer une carte. |
| **Résultat attendu** | Chargement < 5s. Scroll fluide. Création de carte fonctionnelle. |

## TC-066 : Copier le lien de l'espace
| **Étapes** | 1. Cliquer "Copier le lien". |
| **Résultat attendu** | URL copiée. Toast "Lien copié". |

## TC-067 : Message d'accueil personnalisé
| **Étapes** | 1. Configurer un message d'accueil. 2. Un nouveau participant rejoint. |
| **Résultat attendu** | Message affiché après saisie du pseudo. |

## TC-068 : Brainstorming silencieux
| **Étapes** | 1. Activer. 2. 3 participants créent 2 cartes chacun. 3. Révéler. |
| **Résultat attendu** | Pendant : chacun ne voit que ses cartes. Après : les 6 cartes apparaissent. |

## TC-069 : Tag sur une carte
| **Étapes** | 1. Ajouter un tag "Urgent". |
| **Résultat attendu** | Tag rouge visible par tous. |

## TC-070 : Regrouper des cartes en cluster
| **Étapes** | 1. Sélectionner 3 cartes. 2. Regrouper. 3. Nommer. |
| **Résultat attendu** | 3 cartes encadrées ensemble avec le label. |

---

# BLOC 5 : 8 AXES DE CALIBRATION (TC-071 à TC-085)

## TC-071 : Affichage des 8 axes
| **Résultat attendu** | 8 axes affichés avec 5 positions chacun. Labels corrects. |

## TC-072 : Positionner un curseur
| **Étapes** | 1. Cliquer position 2 sur "Décider / Faire murir". |
| **Résultat attendu** | Curseur positionné avec ma couleur. Visible par tous. |

## TC-073 : Modifier sa position
| **Étapes** | 1. Passer de position 2 à position 4. |
| **Résultat attendu** | Curseur déplacé. Visible en temps réel. |

## TC-074 : Voir les positions de tous
| **Préconditions** | 4 participants ont positionné. |
| **Résultat attendu** | 4 points colorés visibles. Pseudo au survol. |

## TC-075 : Moyenne et dispersion
| **Préconditions** | 3 participants en positions 2, 3, 4. |
| **Résultat attendu** | Marqueur moyenne en position 3. Dispersion faible. |

## TC-076 : Forte divergence détectée
| **Préconditions** | 2 en position 1, 2 en position 5. |
| **Résultat attendu** | Indicateur "Divergence forte". Axe en surbrillance. |

## TC-077 : Vote aveugle sur les axes
| **Étapes** | 1. Activer vote aveugle. 2. Chacun positionne. 3. Révéler. |
| **Résultat attendu** | Pendant : positions des autres masquées. Après : toutes visibles. |

## TC-078 : Questions-guides par axe
| **Étapes** | 1. Cliquer sur "Décider / Faire murir". |
| **Résultat attendu** | Au moins 4 questions-guides spécifiques affichées. |

## TC-079 : Argumenter un positionnement
| **Étapes** | 1. Sponsor positionne et clique "Expliquer mon choix". 2. Saisit explication. |
| **Résultat attendu** | Commentaire lié à la position. Facilitateur peut y répondre. |

## TC-080 : Profil type d'intervention
| **Étapes** | 1. Cliquer "Partir d'un profil type". 2. Sélectionner "Séminaire CODIR". |
| **Résultat attendu** | 8 axes pré-positionnés. Chaque axe ajustable. |

## TC-081 : Vue radar des 8 axes
| **Résultat attendu** | Graphique radar avec positions finales. Couleurs Insuffle. |

## TC-082 : Verrouiller les axes
| **Étapes** | 1. Cliquer "Valider et verrouiller". 2. Confirmer. |
| **Résultat attendu** | 8 axes en lecture seule. Cadenas visible. Label "Positionnement validé". |

## TC-083 : Exporter le radar en PNG
| **Étapes** | 1. Cliquer "Exporter le profil d'intervention". |
| **Résultat attendu** | Image PNG haute résolution avec radar, labels et logo Insuffle. |

## TC-084 : Double positionnement facilitateur + sponsor
| **Étapes** | 1. Facilitateur en 2, sponsor en 4 sur un axe. |
| **Résultat attendu** | Deux marqueurs distincts. Écart visualisé. |

## TC-085 : Snapshot des axes pour comparaison
| **Étapes** | 1. Sauvegarder snapshot. 2. Modifier 3 axes. 3. Comparer. |
| **Résultat attendu** | Deux radars superposés. Deltas affichés. |

---

# BLOC 6 : MODE FACILITATEUR (TC-086 à TC-095)

## TC-086 : Activer le mode facilitateur
| **Résultat attendu** | Barre d'outils facilitateur visible. Autres participants ne la voient pas. |

## TC-087 : Mode facilitateur inaccessible aux non-créateurs
| **Résultat attendu** | Toggle invisible pour Sophie (non-créatrice). |

## TC-088 : Verrouiller une phase
| **Étapes** | 1. Verrouiller phase AVANT. |
| **Résultat attendu** | Boutons "+" disparus. Cadenas visible. Message pour les participants. |

## TC-089 : Déverrouiller une phase
| **Étapes** | 1. Déverrouiller phase AVANT. |
| **Résultat attendu** | Boutons "+" réapparus. Contributions possibles. |

## TC-090 : Masquer une phase
| **Étapes** | 1. Masquer phase CONCLUSION. |
| **Résultat attendu** | Phase invisible pour les participants. Grisée pour le facilitateur. |

## TC-091 : Afficher une phase masquée
| **Étapes** | 1. Afficher phase CONCLUSION. |
| **Résultat attendu** | Phase réapparaît pour tous. |

## TC-092 : Lancer un timer
| **Étapes** | 1. Saisir "5". 2. Lancer. |
| **Résultat attendu** | Compte à rebours 5:00 visible par tous. Notification à 0:00. |

## TC-093 : Spotlight sur une carte
| **Étapes** | 1. Cliquer "Spotlight" sur une carte. |
| **Résultat attendu** | Carte agrandie et surlignée. Canvas assombri. Bandeau d'attention. |

## TC-094 : Supprimer une carte d'un autre (mode facilitateur)
| **Étapes** | 1. Supprimer carte de Sophie. 2. Confirmer. |
| **Résultat attendu** | Carte supprimée pour tous. Historique : "supprimée par le facilitateur". |

## TC-095 : Statistiques de contribution
| **Étapes** | 1. Cliquer "Statistiques". |
| **Résultat attendu** | Tableau avec cartes, commentaires et curseurs par participant. |

---

# BLOC 7 : EXPORT (TC-096 à TC-100)

## TC-096 : Export PDF complet
| **Étapes** | 1. Cliquer "Exporter en PDF". 2. Ouvrir le fichier. |
| **Résultat attendu** | PDF avec page de garde (logo Insuffle, client, facilitateur, date), 4 phases avec cartes lisibles, 8 axes, pied de page Insuffle. |

## TC-097 : Export d'une seule phase en PDF
| **Étapes** | 1. Exporter uniquement "AVANT". |
| **Résultat attendu** | PDF contenant uniquement la phase AVANT avec en-tête. Logo Insuffle présent. |

## TC-098 : Dupliquer un espace
| **Étapes** | 1. Cliquer "Dupliquer cet espace". |
| **Résultat attendu** | Nouvel espace, nouvelle URL. Cartes copiées. Curseurs non copiés. En-tête copié (sauf date). |

## TC-099 : Archiver un espace
| **Étapes** | 1. Cliquer "Archiver". 2. Confirmer. |
| **Résultat attendu** | Lecture seule. Bandeau "Cadrage archivé". Contenu visible mais non modifiable. |

## TC-100 : Export texte brut
| **Étapes** | 1. Cliquer "Exporter en texte". |
| **Résultat attendu** | Fichier .txt avec cartes organisées par phase/colonne. Auteur indiqué. |
