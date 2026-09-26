# language: fr

Fonctionnalité: Le direct et le mode salle
  En tant que facilitateur
  Je veux sentir que tout le monde travaille en même temps, et projeter le jour J
  Afin que le cadrage soit un vrai travail collectif, avant comme pendant

  Contexte:
    Soit Yoan, Claire et Thomas sont connectés au même cadrage

  Scénario: Voir qui est où
    Quand Claire ouvre l'onglet « Concevoir »
    Alors son avatar apparaît sur l'onglet « Concevoir » chez Yoan et Thomas

  Scénario: Voir les curseurs des autres
    Quand Thomas bouge sa souris sur le déroulé
    Alors Yoan voit un curseur vert étiqueté « Thomas » suivre le mouvement

  Scénario: Voir qui écrit
    Quand Claire ouvre la séquence « Tables tournantes » et écrit dans l'intention
    Alors la séquence porte « Claire écrit » chez les autres
    Et l'éditeur de Yoan, s'il ouvre la même séquence, affiche que Claire y est

  Scénario: Voir ce qui vient de changer
    Quand Thomas allonge « Ouverture » de 15 min
    Alors la séquence s'illumine de la couleur de Thomas chez les autres
    Et un fil discret annonce « Thomas a modifié « Ouverture » »

  Scénario: Commenter une séquence
    Quand Camille écrit « On peut couper en deux ? » sur « Le futur désiré »
    Alors le commentaire apparaît dans l'éditeur de la séquence pour tous
    Et la séquence affiche un compteur d'échanges
    Et Yoan reçoit « Camille a commenté une séquence »

  Scénario: Rejoindre avec un QR code
    Quand Yoan clique sur « Partager »
    Alors il voit le lien et un QR code à projeter

  Scénario: Arriver dans un cadrage
    Quand une nouvelle personne ouvre le lien
    Alors elle voit la question-titre, l'intention et qui est déjà là, en direct

  Scénario: Projeter le jour J
    Quand Yoan clique sur « Projeter »
    Alors le mode salle affiche l'étape, ses horaires, l'intention, le format et ce qui en sort
    Et le QR code pour rejoindre, ou le vote ouvert qui se remplit en direct
    Et la frise de la journée avec l'heure qu'il est

  Scénario: La salle suit l'étape projetée
    Quand Yoan passe à l'étape suivante avec la flèche droite
    Alors le téléphone de Claire affiche le bandeau « En salle » avec la nouvelle étape
    Et un tap sur le bandeau montre l'intention, le format et les sous-questions du jour

  Scénario: Lancer le timer de l'étape
    Quand Yoan appuie sur espace en mode salle
    Alors un compte à rebours de la durée de l'étape démarre pour toute la salle

  Scénario: Seul le facilitateur change l'étape
    Soit Yoan est facilitateur
    Quand Claire tente de changer l'étape projetée
    Alors rien ne change
