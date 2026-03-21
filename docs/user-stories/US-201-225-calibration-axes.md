# DOMAINE 22 : Calibration collaborative des 8 axes avec le sponsor (US 201-225)

## US-201 : Chaque axe comme espace de discussion

```gherkin
Scenario: Chaque axe ouvre un espace de discussion
  Given je clique sur l'axe "Décider / Faire murir"
  Then un panneau s'ouvre avec :
    | élément                                              |
    | Le slider 5 positions                                |
    | Une zone de texte "Pourquoi ce positionnement ?"      |
    | Les positions de chaque participant avec leur pseudo   |
    | Un fil de commentaires dédié à cet axe                |
  And les questions-guides Insuffle spécifiques à cet axe sont affichées
```

## US-202 : Double positionnement facilitateur + sponsor

```gherkin
Scenario: Double positionnement
  Given l'axe "Agir ensemble / Porter le cap" est affiché
  And le facilitateur positionne en position 2
  And le sponsor positionne en position 4
  Then les deux curseurs sont visibles simultanément
  And l'écart est matérialisé par une zone colorée

Scenario: Convergence après discussion
  Given un écart existe
  When les deux déplacent vers la position 3
  Then un label "Aligné" remplace "Écart à discuter"
```

## US-203 : Position "souhaitée par le sponsor" vs "recommandée par le facilitateur"

```gherkin
Scenario: Double lecture visible
  Given le sponsor et le facilitateur ont positionné leurs curseurs
  Then pour chaque axe, deux marqueurs distincts sont affichés :
    | marqueur                    | forme   | couleur        |
    | Position sponsor            | Carré   | Bleu Insuffle  |
    | Recommandation facilitateur | Rond    | Jaune Insuffle |

Scenario: Position finale négociée
  Given facilitateur et sponsor ont discuté
  When le facilitateur clique sur "Valider la position finale"
  Then un troisième marqueur "Position retenue" apparaît (étoile dorée)
```

## US-204 : Argumenter un positionnement sur un axe

```gherkin
Scenario: Note argumentée sur un axe
  Given je positionne mon curseur sur un axe
  When je clique sur "Expliquer mon choix"
  Then un champ de texte s'ouvre
  And le facilitateur voit le commentaire et peut y répondre

Scenario: Dialogue sur un axe
  Given le sponsor a argumenté sa position
  When le facilitateur répond
  Then le fil de discussion de cet axe affiche les deux messages
```

## US-205 à US-212 : Questions-guides spécifiques par axe

```gherkin
Scenario: Questions "Décider / Faire murir" (US-205)
  Given je suis sur l'axe "Décider / Faire murir"
  Then les questions suivantes sont affichées :
    | "Le groupe a-t-il le pouvoir de décider, ou seulement de recommander ?"  |
    | "Qui valide les décisions après l'atelier ?"                              |
    | "Une non-décision serait-elle un échec pour le sponsor ?"                 |
    | "Le sujet est-il assez mûr pour décider, ou faut-il d'abord explorer ?"  |
    | "Y a-t-il des décisions déjà prises qu'on présente comme ouvertes ?"     |

Scenario: Questions "Agir ensemble / Porter le cap" (US-206)
  Given je suis sur l'axe "Agir ensemble / Porter le cap"
  Then les questions suivantes sont affichées :
    | "Cherche-t-on à construire une vision commune ou à aligner derrière une vision existante ?" |
    | "Le leader doit-il co-construire ou fixer le cap et embarquer ?"              |
    | "Si le groupe propose une direction différente, que se passe-t-il ?"           |
    | "Est-ce un exercice de cohésion ou d'adhésion ?"                               |

Scenario: Questions "Tenir le cadre / Autonomie du groupe" (US-207)
  Given je suis sur l'axe "Tenir le cadre / Autonomie du groupe"
  Then les questions suivantes sont affichées :
    | "Le groupe est-il mature pour s'auto-organiser ?"                |
    | "Qu'est-ce qui se passe si les participants sortent du sujet ?" |
    | "Y a-t-il des sujets interdits ?"                                |

Scenario: Questions "Produire / Explorer" (US-208)
  Given je suis sur l'axe "Produire / Explorer"
  Then les questions suivantes sont affichées :
    | "Faut-il sortir avec un plan d'action chiffré ou des pistes ouvertes ?"      |
    | "Le sponsor sera-t-il satisfait avec des questions plutôt que des réponses ?" |

Scenario: Questions "Contenu / Processus" (US-209)
  Given je suis sur l'axe "Contenu / Processus"
  Then les questions suivantes sont affichées :
    | "Le problème est-il un problème de fond ou de fonctionnement ?" |
    | "Si on ne traite que le processus, sera-ce jugé utile ?"        |

Scenario: Questions "Prendre du recul / Passer à l'action" (US-210)
  Given je suis sur l'axe "Prendre du recul / Passer à l'action"
  Then les questions suivantes sont affichées :
    | "Y a-t-il urgence à agir ou urgence à comprendre ?"             |
    | "Le groupe a-t-il tendance à foncer ou à analyser sans trancher ?" |

Scenario: Questions "Ouvert / Ciblé" (US-211)
  Given je suis sur l'axe "Ouvert / Ciblé"
  Then les questions suivantes sont affichées :
    | "L'agenda est-il fixé ou peut-on accueillir ce qui émerge ?" |
    | "Quel est le degré de surprise acceptable pour le sponsor ?"  |

Scenario: Questions "Sérieux / Énergie ludique" (US-212)
  Given je suis sur l'axe "Sérieux / Énergie ludique"
  Then les questions suivantes sont affichées :
    | "La culture de l'entreprise tolère-t-elle le décalage ?"       |
    | "Le sponsor sera-t-il mal à l'aise avec un ice-breaker décalé ?" |
```

## US-213 : Vue synthétique radar des 8 axes négociés

```gherkin
Scenario: Radar des 8 axes
  Given les positions finales sont définies sur les 8 axes
  Then une vue radar affiche les 8 axes avec les positions retenues
  And les couleurs Insuffle sont utilisées (bleu foncé fond, jaune doré silhouette)

Scenario: Profils types Insuffle
  Given la vue radar est affichée
  Then des profils types sont proposés en comparaison :
    | profil type               | description                                          |
    | "Le séminaire exploratoire" | Faire murir, Explorer, Processus, Ouvert, Ludique    |
    | "Le CODIR décisionnel"     | Décider, Porter le cap, Tenir le cadre, Produire, Ciblé |
    | "Le team building profond"  | Agir ensemble, Autonomie, Processus, Prendre du recul |
```

## US-214 : Profils types d'intervention Insuffle

```gherkin
Scenario: Sélection d'un profil type
  Given je suis dans le panneau des 8 axes
  When je clique sur "Partir d'un profil type"
  Then une liste de profils Insuffle s'affiche
  When je sélectionne "Workshop innovation"
  Then les 8 axes sont pré-positionnés selon ce profil
  And je peux ajuster chaque axe individuellement
```

## US-215 : Alerte de tension entre axes et cartes

```gherkin
Scenario: Détection d'incohérence
  Given l'axe "Produire / Explorer" est positionné sur "Explorer" (position 5)
  And la colonne "Production et livrables" contient 8 cartes très précises
  Then un avertissement discret apparaît
```

## US-216 : Historique de la négociation des axes

```gherkin
Scenario: Fil chronologique par axe
  Given je clique sur "Historique" sur un axe
  Then je vois la chronologie des positions et commentaires avec heure et acteur
```

## US-217 : Exporter les 8 axes en visuel standalone

```gherkin
Scenario: Export du radar seul
  Given les 8 axes ont des positions finales
  When je clique sur "Exporter le profil d'intervention"
  Then une image PNG haute résolution est générée avec le radar et le logo Insuffle
```

## US-218 : Verrouiller les axes après validation avec le sponsor

```gherkin
Scenario: Verrouillage global des axes
  Given facilitateur et sponsor sont d'accord
  When le facilitateur clique sur "Valider et verrouiller le positionnement"
  Then les 8 axes passent en lecture seule

Scenario: Signature symbolique du sponsor
  Given le verrouillage est demandé
  Then le sponsor reçoit une notification de confirmation
```

## US-219 : Pondérer les axes par importance

```gherkin
Scenario: Pondération d'un axe
  Given je suis sur le panneau des 8 axes
  When je clique sur l'étoile à côté d'un axe
  Then l'axe est marqué comme "Axe prioritaire"
  And maximum 3 axes prioritaires sont autorisés
```

## US-220 : Note de synthèse auto-générée depuis les 8 axes

```gherkin
Scenario: Génération de la synthèse
  Given les 8 axes ont des positions finales et des commentaires
  When je clique sur "Générer la note de cadrage"
  Then une note de synthèse textuelle est créée
  And elle est éditable par le facilitateur
```

## US-221 : Comparer les axes entre le cadrage initial et le cadrage révisé

```gherkin
Scenario: Comparaison de snapshots des axes
  Given j'ai sauvegardé un snapshot et modifié 3 axes depuis
  When je clique sur "Comparer les positionnements"
  Then les deux radars sont superposés
  And les axes qui ont bougé sont mis en évidence avec le delta
```

## US-222 : Mode "vote aveugle" sur les axes

```gherkin
Scenario: Activation du vote aveugle
  Given je suis en mode facilitateur
  When j'active "Vote aveugle sur les axes"
  Then chaque participant positionne ses curseurs sans voir les autres

Scenario: Révélation des positions
  Given tous les participants ont voté
  When le facilitateur clique sur "Révéler les positions"
  Then toutes les positions apparaissent simultanément
```

## US-223 : Relier un axe à une carte du canvas

```gherkin
Scenario: Création d'un lien axe-carte
  Given un axe est positionné
  When je clique sur "Lier à une carte"
  And je sélectionne une carte
  Then un lien visuel relie l'axe à cette carte
```

## US-224 : Suggestion de positionnement basée sur les cartes

```gherkin
Scenario: Suggestion automatique
  Given j'ai rempli au moins 20 cartes dans le canvas
  When je clique sur "Suggérer un positionnement"
  Then l'outil analyse les cartes et propose des positions avec raisons
```

## US-225 : Imprimer les 8 axes en grand format

```gherkin
Scenario: Export A1 pour impression
  Given les 8 axes ont des positions finales
  When je clique sur "Imprimer en grand format"
  Then un PDF est généré au format A1 paysage
  And le logo Insuffle est en bas à droite

Scenario: Version vierge pour salle
  Given je clique sur "Imprimer en version vierge"
  Then les axes sont imprimés sans aucune position
```
