// Copie `shared/` (moteur de combat) dans `supabase/functions/_shared/game/` pour les
// Edge Functions (US-19). Deno refuse les imports `./x.js` qui pointent vers des `.ts` :
// le script réécrit ces extensions au passage. Plan B assumé de docs/07 §1.
// Usage : `npm run functions:sync` (lancé automatiquement par `npm run functions:deploy`).
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'shared');
const target = join(root, 'supabase', 'functions', '_shared', 'game');

/** Fichiers `.ts` de `shared/`, sans les tests (inutiles côté serveur). */
async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'tests' ? [] : collect(full);
      return entry.name.endsWith('.ts') ? [full] : [];
    }),
  );
  return files.flat();
}

await rm(target, { recursive: true, force: true });
const files = await collect(source);
const header = '// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.\n';

for (const file of files) {
  const destination = join(target, relative(source, file));
  await mkdir(dirname(destination), { recursive: true });
  const code = await readFile(file, 'utf8');
  await writeFile(destination, header + code.replaceAll(/(from\s+'[^']+)\.js'/g, "$1.ts'"));
}

console.log(`${files.length} fichiers copiés de shared/ vers supabase/functions/_shared/game/`);
