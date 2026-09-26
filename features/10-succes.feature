# language: fr

Fonctionnalité: Mesure du succès
  En tant que facilitateur Insuffle
  Je veux définir le succès avant, le mesurer pendant et le suivre après
  Afin qu'un temps collectif réussi ne se résume pas à « tout le monde était content »

  Contexte:
    Soit un cadrage « abc123 » avec Yoan (facilitateur) et Claire (participante)

  Scénario: Définir un critère observable
    Quand Yoan ajoute le critère « Chaque participant repart avec une action qu'il porte lui-même »
    Et l'observable « 30 cartes d'engagement lues à un binôme »
    Et l'échéance « Fin de séance »
    Alors le critère est visible de tous, au statut « À mesurer »

  Scénario: Reprendre les cartes « Définir le succès » du cadrage
    Soit le cadrage contient deux cartes dans « Définir le succès »
    Quand Yoan clique sur « Reprendre du cadrage »
    Alors chaque carte peut devenir un critère en un clic

  Scénario: Échelle Avant 1, après 10, votée en direct
    Quand Yoan ouvre le vote « Avant »
    Alors Claire voit un bandeau de vote, où qu'elle soit dans l'outil
    Quand Claire vote 4
    Alors la distribution et la moyenne se mettent à jour en direct
    Et Claire peut changer son vote tant que le vote est ouvert

  Scénario: Mesurer le déplacement
    Soit la moyenne Avant est 3,5 et la moyenne Après est 7,3
    Alors l'outil affiche un déplacement de +3,8 sur 10

  Scénario: Le ROTI ne remplace pas les critères
    Quand le ROTI est voté à 4,3 / 5
    Alors il s'affiche à part, avec le rappel : la satisfaction ne dit pas le résultat

  Scénario: Un vote fermé est refusé
    Soit le vote « Après » est fermé
    Quand Claire tente de voter
    Alors le serveur refuse avec « Ce vote n'est pas ouvert »

  Scénario: La suite, qui fait quoi pour quand
    Quand Yoan ajoute l'action « Envoyer la synthèse » pour « Camille » à « 72 h »
    Alors la date est calculée depuis la fin du temps collectif
    Et une action en retard est signalée en rouge

  Scénario: Les rendez-vous de suivi
    Soit le temps collectif se termine le 16 avril
    Alors l'outil affiche J+15 (1er mai) et J+90 (15 juillet) avec les critères et actions de chaque échéance

  Scénario: Le score de succès
    Soit 1 critère atteint, 1 partiel, 1 à mesurer
    Alors le score affiché est 75 % sur 2 critères mesurés

  Scénario: Le regard du facilitateur
    Quand Yoan évalue « Le singe sur l'épaule » à « En progrès » avec une note
    Alors l'évaluation est réservée aux facilitateurs du cadrage
    Et apparaît dans la fiche « Mesure du succès »

  Scénario: Exporter la mesure du succès
    Quand je clique sur « PDF »
    Alors j'obtiens une page A4 Insuffle : indicateurs, critères, la suite, distributions Avant / Après
