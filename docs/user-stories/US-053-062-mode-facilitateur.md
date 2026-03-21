# DOMAINE 7 : Mode facilitateur (US 53-62)

## US-053 : Activer le mode facilitateur

**En tant que** créateur de l'espace,
**je veux** activer un mode facilitateur
**afin d'** avoir des commandes de pilotage.

```gherkin
Scenario: Activation par le créateur
  Given je suis le créateur de l'espace de cadrage
  Then un toggle "Mode facilitateur" est disponible dans la barre d'outils
  When j'active le toggle
  Then des options supplémentaires apparaissent (verrouiller zones, masquer, timer)

Scenario: Non disponible pour les autres
  Given je ne suis pas le créateur de l'espace
  Then le toggle "Mode facilitateur" n'est pas visible
```

## US-054 : Verrouiller une phase du canvas

**En tant que** facilitateur,
**je veux** verrouiller une phase
**afin d'** empêcher les modifications quand le travail est terminé.

```gherkin
Scenario: Verrouillage de la phase AVANT
  Given je suis en mode facilitateur
  When je clique sur "Verrouiller" sur la phase AVANT
  Then toute la phase AVANT passe en lecture seule
  And les boutons "+" disparaissent dans cette phase
  And un cadenas est affiché sur le bandeau de la phase
  And les participants voient un message "Phase verrouillée par le facilitateur"

Scenario: Les cartes existantes restent visibles
  Given la phase AVANT est verrouillée
  Then toutes les cartes existantes restent lisibles
  And les commentaires existants restent visibles
  But aucune nouvelle carte ou commentaire ne peut être ajouté
```

## US-055 : Déverrouiller une phase

**En tant que** facilitateur,
**je veux** déverrouiller une phase
**afin de** permettre des ajouts si nécessaire.

```gherkin
Scenario: Déverrouillage
  Given la phase AVANT est verrouillée
  When je clique sur "Déverrouiller"
  Then les boutons "+" réapparaissent
  And les participants peuvent à nouveau contribuer
```

## US-056 : Masquer temporairement une phase

**En tant que** facilitateur,
**je veux** masquer une phase
**afin de** focaliser le groupe sur la phase en cours.

```gherkin
Scenario: Masquage d'une phase
  Given je suis en mode facilitateur
  When je clique sur "Masquer" sur la phase CONCLUSION
  Then la phase CONCLUSION disparaît de l'écran des participants
  And pour les participants, seules les phases non masquées sont visibles
  And dans ma vue facilitateur, la phase est grisée mais toujours accessible

Scenario: Afficher une phase masquée
  Given la phase CONCLUSION est masquée
  When je clique sur "Afficher"
  Then la phase réapparaît pour tous les participants
```

## US-057 : Lancer un timer de travail

**En tant que** facilitateur,
**je veux** lancer un chrono visible par tous
**afin de** cadrer le temps de réflexion.

```gherkin
Scenario: Lancement d'un timer
  Given je suis en mode facilitateur
  When je saisis "5" dans le champ timer et je lance
  Then un compte à rebours de 5 minutes s'affiche pour tous les participants
  And le timer est visible en haut de l'écran

Scenario: Fin du timer
  Given un timer de 5 minutes est en cours
  When le timer atteint 0
  Then une notification visuelle et sonore se déclenche pour tous
  And le timer affiche "Temps écoulé"

Scenario: Arrêt anticipé
  Given un timer est en cours
  When le facilitateur clique sur "Arrêter le timer"
  Then le timer disparaît pour tous
```

## US-058 : Supprimer une carte de n'importe quel participant

**En tant que** facilitateur,
**je veux** pouvoir supprimer n'importe quelle carte
**afin de** nettoyer le canvas.

```gherkin
Scenario: Suppression en mode facilitateur
  Given je suis en mode facilitateur
  And "Sophie" a créé une carte "Hors sujet total"
  When je clique sur l'icône de suppression de cette carte
  Then une confirmation me demande "Supprimer cette carte de Sophie ?"
  When je confirme
  Then la carte est supprimée pour tous
  And une trace dans l'historique indique "Carte supprimée par le facilitateur"
```

## US-059 : Mettre en avant une carte (spotlight)

**En tant que** facilitateur,
**je veux** mettre en évidence une carte spécifique
**afin de** focaliser la discussion dessus.

```gherkin
Scenario: Spotlight d'une carte
  Given je suis en mode facilitateur
  When je clique sur "Spotlight" sur une carte
  Then la carte est agrandie et mise en surbrillance pour tous les participants
  And le reste du canvas est légèrement assombri
  And un bandeau indique "Le facilitateur attire votre attention sur cette carte"

Scenario: Retrait du spotlight
  When je clique sur "Retirer le spotlight"
  Then l'affichage revient à la normale
```

## US-060 : Passer le rôle de facilitateur à un autre participant

**En tant que** facilitateur,
**je veux** donner le contrôle facilitateur à un co-facilitateur
**afin de** partager le pilotage.

```gherkin
Scenario: Transfert de rôle
  Given je suis en mode facilitateur
  When je clique sur le pseudo de "Marc" dans la liste des participants
  And je sélectionne "Donner le rôle facilitateur"
  Then Marc reçoit le mode facilitateur
  And je conserve aussi le mode facilitateur (multi-facilitateurs)
```

## US-061 : Ajouter un co-facilitateur

**En tant que** facilitateur,
**je veux** ajouter un co-facilitateur sans perdre mes propres droits
**afin de** travailler à deux.

```gherkin
Scenario: Multi-facilitateurs
  Given je suis facilitateur et Marc est facilitateur
  Then nous avons tous les deux accès aux commandes de pilotage
  And nos actions sont identifiées séparément dans l'historique
```

## US-062 : Retirer le mode facilitateur à quelqu'un

**En tant que** créateur de l'espace,
**je veux** retirer le mode facilitateur à un participant
**afin de** garder le contrôle.

```gherkin
Scenario: Retrait du rôle
  Given "Marc" est co-facilitateur
  And je suis le créateur de l'espace
  When je retire le rôle facilitateur à Marc
  Then Marc n'a plus accès aux commandes de pilotage
  And ses cartes et commentaires restent intacts
```
