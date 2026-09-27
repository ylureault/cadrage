# Déployer une nouvelle version

Le serveur Node sert à la fois l'API, le temps réel et l'interface construite. **Il faut donc toujours faire les deux : reconstruire l'interface ET redémarrer le serveur.** Reconstruire sans redémarrer laisse l'ancien serveur en mémoire : la nouvelle interface s'affiche, mais l'agenda, le planning et le succès restent vides.

## Les étapes

```bash
cd /chemin/vers/cadrage

# 1. Sauvegarder les données (les migrations se jouent au démarrage)
cp server/data/cadrage.db server/data/cadrage-$(date +%Y%m%d-%H%M).db

# 2. Récupérer la version
git fetch origin
git checkout <branche-ou-tag>
git pull

# 3. Installer (de nouvelles dépendances serveur sont arrivées en v2 : compression…)
npm run install:all

# 4. Construire l'interface
npm run build

# 5. Redémarrer le serveur Node : selon votre installation
pm2 restart cadrage            # si le serveur tourne sous pm2 (voir « pm2 list »)
# sudo systemctl restart cadrage   # si c'est un service systemd
# sinon : arrêter le processus « node src/index.js » et relancer « npm start »
```

## Voir qui utilise l'outil

La page `/admin` liste les cadrages, les facilitateurs, les pseudos qui les ont rejoints et l'activité. Elle n'existe que si le serveur connaît un jeton :

```bash
# Un jeton long et aléatoire, à garder pour vous
openssl rand -hex 24
# Le donner au serveur, puis redémarrer (étape 5)
ADMIN_TOKEN=le-jeton npm start
# pm2 : pm2 restart cadrage --update-env après « export ADMIN_TOKEN=le-jeton »
# systemd : Environment=ADMIN_TOKEN=le-jeton dans le service
```

Ouvrez ensuite https://cadrage.insuffle.com/admin et saisissez le jeton. Sans jeton, la page et la liste des cadrages (`/api/spaces`) restent fermées.

## Vérifier

```bash
curl -s https://cadrage.insuffle.com/api/health
```

La réponse doit être :

```json
{"ok":true,"api":2,"features":["planning","success","demo","versions","presence"]}
```

Si vous obtenez une page HTML ou une erreur 404, c'est encore l'ancien serveur qui tourne : refaites l'étape 5.

Au premier démarrage de la v2, le journal affiche les migrations : les anciens agendas sont convertis en planning (rien n'est supprimé), et la démo NovaPulse est reconstruite.
