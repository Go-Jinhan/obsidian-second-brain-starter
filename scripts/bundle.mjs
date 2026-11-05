import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const files = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else {
      const relative = path.relative(path.join(root, 'vault'), file).split(path.sep).join('/');
      files.push(entry.name.endsWith('.png') ? { path: relative, base64: (await fs.readFile(file)).toString('base64') } : { path: relative, text: await fs.readFile(file, 'utf8') });
    }
  }
}
await walk(path.join(root, 'vault'));
files.sort((a, b) => a.path.localeCompare(b.path));
const folders = JSON.parse(await fs.readFile(path.join(root, 'vault-folders.json'), 'utf8'));
await fs.writeFile(path.join(root, 'src/bundle.json'), JSON.stringify({ folders, files }));
