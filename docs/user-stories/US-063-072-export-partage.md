# DOMAINE 8 : Export et partage (US 63-72)

## US-063 : Exporter le cadrage en PDF

**En tant que** facilitateur,
**je veux** exporter le canvas rempli en PDF
**afin de** garder une trace formelle.

```gherkin
Scenario: Export PDF complet
  Given le canvas contient des cartes dans toutes les phases
  When je clique sur "Exporter en PDF"
  Then un fichier PDF est généré
  And le PDF reprend la mise en page du canvas Insuffle
  And le logo Insuffle est présent sur le document
  And toutes les cartes sont lisibles avec leur auteur
  And les positionnements des curseurs sont inclus
  And le nom du client, sponsor, facilitateur et date apparaissent

Scenario: PDF avec mention Insuffle Académie
  Given j'exporte le cadrage en PDF
  Then le pied de page contient "Outil de cadrage Insuffle | insuffle.com"
```

## US-064 : Exporter uniquement une phase en PDF

**En tant que** facilitateur,
**je veux** exporter une seule phase
**afin d'** envoyer un extrait au client.

```gherkin
Scenario: Export partiel
  Given je suis en mode facilitateur
  When je clique sur "Exporter" puis sélectionne uniquement "AVANT"
  Then le PDF généré ne contient que la phase AVANT
  And l'en-tête (Client, Sponsor, Facilitateur, Date) est inclus
```

## US-065 : Copier le lien de l'espace

**En tant que** participant,
**je veux** copier le lien de l'espace en un clic
**afin de** l'envoyer à quelqu'un.

```gherkin
Scenario: Copie du lien
  Given je suis dans un espace de cadrage
  When je clique sur l'icône "Copier le lien"
  Then l'URL de l'espace est copiée dans mon presse-papier
  And un toast confirme "Lien copié"
```

## US-066 : Envoyer le lien par email depuis l'outil

**En tant que** facilitateur,
**je veux** envoyer le lien par email directement
**afin de** gagner du temps.

```gherkin
Scenario: Envoi par email
  Given je clique sur "Inviter par email"
  Then un champ email apparaît
  When je saisis "sponsor@client.com" et je clique "Envoyer"
  Then un email est envoyé avec le lien et un message d'invitation
  And l'email contient le logo Insuffle et un texte explicatif
```

## US-067 : Exporter les cartes en format texte brut

```gherkin
Scenario: Export texte
  Given le canvas contient des cartes
  When je clique sur "Exporter en texte"
  Then un fichier .txt est téléchargé
  And il contient les cartes organisées par phase et par colonne
  And chaque carte indique son auteur
```

## US-068 : Imprimer le canvas

```gherkin
Scenario: Impression
  Given je clique sur "Imprimer"
  Then la boîte de dialogue d'impression du navigateur s'ouvre
  And le canvas est formaté pour impression A3 paysage
  And les couleurs sont optimisées pour l'impression
```

## US-069 : Dupliquer un espace de cadrage

```gherkin
Scenario: Duplication
  Given je suis dans un espace rempli
  When je clique sur "Dupliquer cet espace"
  Then un nouvel espace est créé avec une nouvelle URL
  And toutes les cartes sont copiées
  And les curseurs ne sont pas copiés (à repositionner)
  And l'en-tête est copié sauf la date (à mettre à jour)

Scenario: Duplication comme template vide
  Given je clique sur "Dupliquer comme template"
  Then un nouvel espace est créé sans cartes
  And seuls l'en-tête et la structure sont conservés
```

## US-070 : Archiver un espace de cadrage

```gherkin
Scenario: Archivage
  Given je suis le créateur de l'espace
  When je clique sur "Archiver"
  Then l'espace passe en lecture seule pour tout le monde
  And un bandeau "Cadrage archivé" s'affiche
  And les cartes et curseurs restent visibles mais non modifiables

Scenario: Désarchivage
  Given l'espace est archivé
  When je clique sur "Réouvrir"
  Then l'espace redevient éditable
```

## US-071 : Partager le PDF exporté avec la marque Insuffle

```gherkin
Scenario: Export avec marque Insuffle Académie
  Given je suis identifié comme facilitateur certifié Insuffle Académie
  When j'exporte en PDF
  Then le logo Insuffle Académie apparaît en plus du logo Insuffle
  And la mention "Facilitateur certifié Insuffle Académie" est présente
```

## US-072 : Récupérer un espace supprimé par erreur

```gherkin
Scenario: Corbeille
  Given je supprime un espace de cadrage
  Then l'espace est déplacé en corbeille (accessible depuis la page d'accueil)
  And il reste récupérable pendant 30 jours

Scenario: Récupération
  Given un espace est en corbeille depuis 5 jours
  When je clique sur "Restaurer"
  Then l'espace redevient actif avec son URL originale
```
