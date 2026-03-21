# BLOC 2 : STRUCTURE DU CANVAS ET EN-TÊTE (TC-016 à TC-025)

## TC-016 : Affichage des 4 phases du canvas
| **Préconditions** | Un espace de cadrage ouvert. |
| **Étapes** | 1. Observer le canvas. |
| **Résultat attendu** | 4 zones distinctes : AVANT, PENDANT Facilitation, PENDANT Risques, CONCLUSION. Chaque zone a un bandeau coloré. |

## TC-017 : Affichage des 10 colonnes
| **Préconditions** | Un espace de cadrage ouvert. |
| **Étapes** | 1. Naviguer à travers les 4 phases. |
| **Résultat attendu** | 10 colonnes présentes avec titre lisible et bouton "+". |

## TC-018 : Questions-guides visibles dans chaque colonne
| **Préconditions** | Un espace de cadrage ouvert. Aucune carte créée. |
| **Étapes** | 1. Observer la colonne "Clarifier le cadre et l'intention". |
| **Résultat attendu** | Au moins 5 questions-guides en filigrane. Questions non éditables. |

## TC-019 : Saisie du champ Client dans l'en-tête
| **Préconditions** | 2 participants connectés. |
| **Étapes** | 1. Yoan saisit "Groupe BPCE" dans le champ Client. |
| **Résultat attendu** | Sophie voit la mise à jour en temps réel (< 2 secondes). |

## TC-020 : Saisie du champ Sponsor
| **Étapes** | 1. Saisir "Marie Dupont - DRH" dans le champ Sponsor. |
| **Résultat attendu** | Visible par tous les participants en temps réel. |

## TC-021 : Saisie du champ Facilitateur
| **Étapes** | 1. Saisir "Yoan Lureault - Insuffle" dans le champ Facilitateur. |
| **Résultat attendu** | Visible par tous. |

## TC-022 : Saisie de la date
| **Étapes** | 1. Cliquer sur "Date". 2. Sélectionner le 15 avril 2026. |
| **Résultat attendu** | Le champ affiche "15/04/2026". |

## TC-023 : Modification concurrente de l'en-tête
| **Préconditions** | 2 participants connectés. |
| **Étapes** | 1. Yoan modifie "Client" en même temps que Sophie modifie "Sponsor". |
| **Résultat attendu** | Les deux modifications sont enregistrées sans conflit. |

## TC-024 : Navigation entre phases sur desktop
| **Préconditions** | Écran 1440px+. |
| **Étapes** | 1. Cliquer sur l'onglet "CONCLUSION". |
| **Résultat attendu** | Scroll fluide vers CONCLUSION. Onglet marqué actif. |

## TC-025 : Texte introductif Insuffle visible
| **Étapes** | 1. Observer la zone gauche de la phase AVANT. |
| **Résultat attendu** | Encadré avec texte explicatif Insuffle. |

---

# BLOC 3 : GESTION DES CARTES (TC-026 à TC-050)

## TC-026 : Créer une carte dans une colonne
| **Étapes** | 1. Cliquer "+" dans "Clarifier le cadre et l'intention". 2. Saisir le texte. 3. Valider. |
| **Résultat attendu** | Carte créée avec couleur de l'auteur. Pseudo affiché. Compteur colonne à 1. |

## TC-027 : Carte vide refusée
| **Étapes** | 1. Cliquer "+". 2. Valider sans rien saisir. |
| **Résultat attendu** | Aucune carte créée. |

## TC-028 : Carte visible par les autres en temps réel
| **Préconditions** | 2 participants sur navigateurs différents. |
| **Étapes** | 1. Yoan crée une carte. |
| **Résultat attendu** | Sophie voit la carte en moins de 2 secondes avec la couleur de Yoan. |

## TC-029 : Modifier sa propre carte
| **Étapes** | 1. Double-cliquer sa carte. 2. Modifier le texte. 3. Valider. |
| **Résultat attendu** | Nouveau texte affiché. Visible par tous en temps réel. |

## TC-030 : Impossible de modifier la carte d'un autre
| **Étapes** | 1. Yoan double-clique sur la carte de Sophie. |
| **Résultat attendu** | Texte non éditable. Message "Seul l'auteur peut modifier". |

## TC-031 : Supprimer sa propre carte
| **Étapes** | 1. Cliquer suppression. 2. Confirmer. |
| **Résultat attendu** | Carte disparaît pour tous. Compteur décrémenté. |

## TC-032 : Annulation de suppression
| **Étapes** | 1. Cliquer suppression. 2. Cliquer "Annuler". |
| **Résultat attendu** | Carte reste en place. |

## TC-033 : Commenter la carte d'un autre
| **Étapes** | 1. Cliquer commentaire sur carte de Sophie. 2. Saisir et valider. |
| **Résultat attendu** | Commentaire affiché avec pseudo et couleur. Badge "1". Visible en temps réel. |

## TC-034 : Plusieurs commentaires sur une carte
| **Préconditions** | Carte avec 2 commentaires. |
| **Étapes** | 1. Marc ajoute un 3e commentaire. |
| **Résultat attendu** | Badge "3". 3 commentaires chronologiques. |

## TC-035 : Marquer une carte "à discuter"
| **Étapes** | 1. Cliquer sur l'icône "à discuter". |
| **Résultat attendu** | Marqueur visuel visible par tous. |

## TC-036 : Retirer le marquage "à discuter"
| **Étapes** | 1. Recliquer sur l'icône. |
| **Résultat attendu** | Marqueur disparaît pour tous. |

## TC-037 : Déplacer une carte (drag & drop)
| **Étapes** | 1. Glisser carte vers une autre colonne. |
| **Résultat attendu** | Carte déplacée. Compteurs mis à jour. Visible par tous. |

## TC-038 : Déplacement entre phases
| **Étapes** | 1. Glisser carte de phase AVANT vers CONCLUSION. |
| **Résultat attendu** | Déplacement autorisé et effectué. |

## TC-039 : Réordonner les cartes
| **Préconditions** | 4 cartes A, B, C, D. |
| **Étapes** | 1. Glisser C en position 1. |
| **Résultat attendu** | Ordre C, A, B, D. Synchronisé pour tous. |

## TC-040 : Carte multiligne
| **Étapes** | 1. Créer une carte avec 3 lignes. |
| **Résultat attendu** | 3 lignes affichées avec retours à la ligne. Carte agrandie. |

## TC-041 : Limite de 500 caractères
| **Étapes** | 1. Saisir 501 caractères. |
| **Résultat attendu** | Compteur indique le dépassement. Saisie bloquée à 500. |

## TC-042 : Compteur de cartes par colonne
| **Préconditions** | 6 cartes dans une colonne. |
| **Résultat attendu** | Badge "6" à côté du titre. |

## TC-043 : Replier une colonne
| **Étapes** | 1. Cliquer icône de pliage. |
| **Résultat attendu** | Colonne réduite à titre + badge. Cartes masquées. |

## TC-044 : Déplier une colonne repliée
| **Étapes** | 1. Cliquer icône de dépliage. |
| **Résultat attendu** | Cartes réapparaissent. |

## TC-045 : 2 cartes simultanées dans la même colonne
| **Préconditions** | 2 participants connectés. |
| **Étapes** | 1. Les deux créent une carte en même temps dans la même colonne. |
| **Résultat attendu** | Les deux cartes sont créées sans conflit. |

## TC-046 : Auteur visible sur chaque carte
| **Préconditions** | 3 participants ont créé des cartes. |
| **Résultat attendu** | Chaque carte affiche le pseudo et la couleur de son auteur. |

## TC-047 : Annuler la dernière action (Ctrl+Z)
| **Étapes** | 1. Supprimer une carte. 2. Appuyer Ctrl+Z. |
| **Résultat attendu** | Carte restaurée dans sa colonne d'origine. |

## TC-048 : Rechercher dans les cartes
| **Préconditions** | 30 cartes dont 3 contiennent "résistance". |
| **Étapes** | 1. Saisir "résistance" dans le champ de recherche. |
| **Résultat attendu** | 3 cartes surlignées. Autres grisées. Compteur "3 résultats". |

## TC-049 : Réaction emoji sur une carte
| **Étapes** | 1. Cliquer icône réaction. 2. Cliquer 👍. |
| **Résultat attendu** | Compteur 👍 à 1. Pseudo au survol. Visible par tous. |

## TC-050 : Vote par dot voting
| **Préconditions** | Vote activé par le facilitateur. 3 participants, 3 votes chacun. |
| **Étapes** | 1. Yoan vote 2 fois sur carte A, 1 fois sur carte B. |
| **Résultat attendu** | Carte A a 2 votes, carte B a 1 vote. Yoan a 0 vote restant. |
