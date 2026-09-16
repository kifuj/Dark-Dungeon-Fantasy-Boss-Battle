// Render sert des fichiers statiques : sans règle de réécriture, /menu ou /match/<id>
// renvoient 404 (US-01 CA3). Tant que la règle Redirects/Rewrites du dashboard n'est pas
// active, un 404.html identique à index.html permet quand même à l'application de démarrer.
import { copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
await copyFile(join(dist, 'index.html'), join(dist, '404.html'));
console.log('dist/404.html écrit (repli SPA)');
