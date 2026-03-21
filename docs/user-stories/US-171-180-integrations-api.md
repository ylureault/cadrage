# DOMAINE 19 : Intégrations et API (US 171-180)

## US-171 : Exporter vers Notion

```gherkin
Scenario: Export Notion
  Given je clique sur "Exporter" > "Notion"
  Then un lien d'autorisation Notion s'affiche
  When je connecte mon compte Notion
  Then une nouvelle page Notion est créée avec le contenu du cadrage
  And la structure phase/colonne/cartes est respectée
  And le titre de la page contient "Cadrage [Client] - Insuffle"
```

## US-172 : Exporter vers Google Docs

```gherkin
Scenario: Export Google Docs
  Given je clique sur "Exporter" > "Google Docs"
  Then un document Google Docs est créé
  And le contenu est structuré par phase et colonne
  And le logo Insuffle est en en-tête
```

## US-173 : Intégrer un cadrage dans un site via iframe

```gherkin
Scenario: Code d'intégration
  Given je suis en mode facilitateur
  When je clique sur "Intégrer" > "iframe"
  Then un code HTML iframe est généré
  And le canvas s'affiche dans l'iframe avec toutes les fonctionnalités

Scenario: Branding Insuffle dans l'iframe
  Given le canvas est affiché en iframe
  Then le logo Insuffle et le lien vers Insuffle sont toujours visibles
```

## US-174 : Webhook à chaque nouvelle carte

```gherkin
Scenario: Configuration webhook
  Given je suis en mode facilitateur (offre Pro)
  When je configure un webhook URL dans les paramètres
  Then chaque événement envoie un POST JSON à cette URL
  And le payload contient : type d'événement, contenu, auteur, timestamp, espace_id

Scenario: Test de webhook
  Given j'ai configuré un webhook
  When je clique sur "Tester"
  Then un événement test est envoyé et le résultat est affiché
```

## US-175 : API REST pour lire un cadrage

```gherkin
Scenario: GET sur un espace
  Given je fais un GET sur /api/v1/spaces/{id}
  And je fournis une clé API valide
  Then je reçois un JSON avec header, phases, curseurs, participants

Scenario: Documentation API
  Given je navigue vers cadrage.insuffle.com/api/docs
  Then je vois une documentation API interactive (style Swagger)
  And la documentation porte le branding Insuffle
```

## US-176 : Import de cartes depuis un CSV

```gherkin
Scenario: Import CSV
  Given je suis en mode facilitateur
  When je clique sur "Importer" > "CSV"
  And j'uploade un CSV avec les colonnes : phase, colonne, contenu
  Then les cartes sont créées dans les bonnes colonnes
  And un résumé indique "12 cartes importées"
```

## US-177 : Intégration Slack pour notifications

```gherkin
Scenario: Connexion Slack
  Given je suis en mode facilitateur (offre Pro)
  When je configure une intégration Slack avec un webhook Slack
  Then chaque nouvelle carte déclenche un message dans le channel configuré
  And le message est formaté avec le branding Insuffle
```

## US-178 : Intégration Zapier / Make

```gherkin
Scenario: Triggers Zapier
  Given Insuffle Cadrage est disponible sur Zapier
  Then les triggers disponibles sont :
    | trigger                        |
    | Nouvel espace créé              |
    | Nouvelle carte ajoutée          |
    | Cadrage archivé                 |
    | Export PDF généré               |
```

## US-179 : Exporter vers Miro

```gherkin
Scenario: Export Miro
  Given je clique sur "Exporter" > "Miro"
  Then je connecte mon compte Miro
  And un board Miro est créé avec les cartes organisées visuellement
  And un encadré "Cadrage réalisé avec Insuffle Cadrage Live" est ajouté
```

## US-180 : Domaine personnalisé (marque blanche partielle)

```gherkin
Scenario: Sous-domaine personnalisé
  Given je suis sur le plan Entreprise
  When je configure le domaine "cadrage.moncabinet.com"
  Then l'outil est accessible via cadrage.moncabinet.com
  And le logo Insuffle reste présent en mention "Propulsé par Insuffle"

Scenario: La mention Insuffle reste obligatoire
  Given un domaine personnalisé est configuré
  Then la mention "Propulsé par Insuffle" est toujours visible
  And elle ne peut pas être supprimée
```
