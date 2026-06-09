/**
 * Compiles models/*.json fragments into root-level component-*.json files.
 * Mirrors the behaviour of the aem-boilerplate-xwalk pre-commit hook.
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const modelsDir = join(root, 'models');

function readJSON(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

const files = readdirSync(modelsDir).filter((f) => f.endsWith('.json') && f.startsWith('_'));

const definitions = [];
const models = [];
const filters = [];

files.forEach((file) => {
  const data = readJSON(join(modelsDir, file));

  if (file === '_component-definition.json') {
    definitions.push(...(Array.isArray(data) ? data : [data]));
  } else if (file === '_component-filters.json') {
    filters.push(...(Array.isArray(data) ? data : [data]));
  } else if (file === '_component-models.json') {
    models.push(...(Array.isArray(data) ? data : [data]));
  } else {
    // Block model files (e.g. _hero.json, _cards.json)
    const arr = Array.isArray(data) ? data : [data];
    arr.forEach((entry) => {
      if (entry.id && entry.fields) models.push(entry);
      if (entry.id && entry.plugins) definitions.push(entry);
      if (entry.id && entry.components) filters.push(entry);
    });
  }
});

writeFileSync(join(root, 'component-definition.json'), JSON.stringify({ groups: definitions }, null, 2));
writeFileSync(join(root, 'component-models.json'), JSON.stringify(models, null, 2));
writeFileSync(join(root, 'component-filters.json'), JSON.stringify(filters, null, 2));

console.log(`Built component-definition.json (${definitions.length} items), component-models.json (${models.length} models), component-filters.json (${filters.length} filters)`);
