# Contribuer

Merci de vouloir améliorer l'outil. Ce dépôt accueille deux sortes de contributions, aussi précieuses l'une que l'autre.

## Vous facilitez, vous formez

Pas besoin de coder. Ce qui rend l'outil utile, c'est le terrain.

- **Une méthode** pour la bibliothèque : son nom, son intention, son format, sa durée type, ce qui en sort, les consignes. [Proposer une méthode](https://github.com/ylureault/cadrage/issues/new?template=methode.yml)
- **Un modèle de déroulé** qui a fait ses preuves : la question-titre, l'intention, les séquences au quart d'heure.
- **Une question générative**, une amélioration de repère, une formulation plus juste.
- **Un retour d'usage** : ce qui vous a manqué le jour J, ce qui vous a gêné.

Deux règles de fond, héritées de la méthode :

1. **Rien d'inventé.** Pas de chiffre, de client, de témoignage qu'on ne peut pas vérifier.
2. **Zéro tiret long** dans les textes destinés aux clients. Un point, une virgule ou deux-points.

## Vous codez

### Installer

```bash
git clone https://github.com/ylureault/cadrage.git
cd cadrage
npm run install:all
npm run dev
```

Client sur [localhost:3000](http://localhost:3000), serveur sur [localhost:3001](http://localhost:3001).

### Avant d'ouvrir une pull request

```bash
npm test          # tests serveur et client
npm run build     # le client doit se construire sans erreur
```

- Une pull request = un sujet. Petite, c'est mieux.
- Ajoutez un test quand vous touchez au cœur métier (`client/src/planning/`, `server/src/planning.js`, `server/src/success.js`).
- Si vous changez un comportement, mettez à jour le scénario Gherkin correspondant dans `features/`.
- Vérifiez l'interface sur téléphone (390 px) et en mode sombre.

### Où est quoi

| Dossier | Contenu |
|---|---|
| `client/src/planning/` | Le cœur : calculs d'horaires, contrôles, méthodes, modèles, pages A4, exports. Sans React, testé. |
| `client/src/components/` | Les écrans. `shell/` pour la barre, `planning/` pour la conception et l'agenda, `success/`, `salle/`, `promo/`. |
| `client/src/live/` | Le direct : présence, curseurs, fil d'activité. |
| `server/src/app.js` | Routes REST et événements Socket.IO. |
| `server/src/db.js` | Schéma SQLite et migrations (idempotentes, jouées au démarrage). |

### Conventions

- **Français** pour tout ce que voit l'utilisateur, les commentaires et les messages de commit.
- Le style du code suit l'existant : composants fonctionnels React, Tailwind et variables CSS (`var(--color-…)`) pour les couleurs, afin que le mode sombre fonctionne.
- Les couleurs de marque : navy `#141E37`, jaune `#F2C245`, violet Académie `#6B1963` / `#8E2183`.
- Messages de commit : `feat: …`, `fix: …`, `docs: …`, `test: …`, en français, au présent.

## Licence

En contribuant, vous acceptez que votre code soit publié sous [licence MIT](LICENSE). Les contenus de méthode proposés rejoignent la bibliothèque Insuffle (voir [MARQUES.md](MARQUES.md)).
