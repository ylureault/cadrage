import db from './db.js';
import { createApp } from './app.js';

const { server } = createApp(db);

// Filet de sécurité : une erreur imprévue est journalisée, le service continue pour les autres salles
process.on('uncaughtException', (e) => console.error('Erreur non rattrapée :', e));
process.on('unhandledRejection', (e) => console.error('Promesse rejetée :', e));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Insuffle Cadrage : serveur démarré sur le port ${PORT}`);
});
