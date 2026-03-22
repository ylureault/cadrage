import db from './db.js';
import { createApp } from './app.js';

const { server } = createApp(db);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Insuffle Cadrage Live server running on port ${PORT}`);
});
