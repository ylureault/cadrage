# language: fr

Fonctionnalité: La démo
  En tant que visiteur
  Je veux essayer un cadrage complet
  Afin de voir tout ce que fait l'outil sans rien préparer

  Scénario: Essayer un cadrage complet
    Quand je clique sur « Essayer un cadrage complet » sur la page d'accueil
    Alors une copie de la démo NovaPulse est créée pour moi, modifiable
    Et j'arrive sur la conception

  Scénario: Une démo qui montre tout
    Alors la copie contient : des cartes avec réactions, votes, étiquettes et commentaires,
      les 8 polarités positionnées avec leurs explications, un déroulé de deux jours avec encadrés,
      consignes, matériel, rôles, points d'attention, double diamant, une séquence sur le banc,
      des échanges sur les séquences, une version figée, des critères de succès, les votes Avant / Après
      et ROTI d'une douzaine de participants, la suite et le regard du facilitateur

  Scénario: Une démo toujours à jour
    Alors le jour 1 de la démo est aujourd'hui et le jour 2 demain
    Et le bandeau Jour J et le mode salle montrent la séquence en cours

  Scénario: La démo de référence reste intacte
    Quand j'ouvre la démo de référence
    Alors elle est en lecture seule
    Et un bouton « Créer ma copie pour tout essayer » me donne ma propre copie

  Scénario: Les copies d'essai ne s'accumulent pas
    Soit une copie d'essai sans activité depuis 7 jours
    Quand le serveur redémarre
    Alors elle est supprimée
