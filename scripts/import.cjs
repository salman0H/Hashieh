const fs = require('node:fs');
const path = require('node:path');
const { ROOT, load, validateDataset } = require('./content.cjs');
const args = process.argv.slice(2);
const filename = args.find(a => !a.startsWith('--'));
if (!filename || args.some(a => a.startsWith('--') && a !== '--write')) throw new Error('Usage: node scripts/import.cjs bundle.json [--write]');
const bundle = JSON.parse(fs.readFileSync(path.resolve(filename), 'utf8'));
if (bundle.schemaVersion !== '1.0.0' || !Array.isArray(bundle.records) || !Array.isArray(bundle.relations)) throw new Error('Expected v1 bundle with records[] and relations[]');
const current = load();
const candidate = { records: [...current.records, ...bundle.records], relations: [...current.relations, ...bundle.relations] };
const errors = validateDataset(candidate);
if (errors.length) throw new Error(errors.join('\n'));
const folders = { source:'sources', subject:'subjects', session:'sessions', concept:'concepts', entry:'entries', collection:'collections', writing:'writings', correction:'corrections', exercise:'exercises', note:'notes', resource:'resources', policy:'policies' };
const plan = [...bundle.records.map(data => ({ folder: folders[data.type], data })), ...bundle.relations.map(data => ({ folder:'relations', data }))];
for (const item of plan) {
  item.file = path.join(ROOT, 'content', item.folder, `${item.data.id}.json`);
  if (fs.existsSync(item.file)) throw new Error(`Will not overwrite ${item.data.id}; edit canonical file to revise an existing record.`);
}
if (args.includes('--write')) {
  for (const item of plan) {
    fs.mkdirSync(path.dirname(item.file), { recursive: true });
    fs.writeFileSync(item.file, JSON.stringify(item.data, null, 2) + '\n', { flag:'wx' });
  }
  console.log(`Imported ${bundle.records.length} records and ${bundle.relations.length} relations.`);
} else console.log(`Valid bundle: ${bundle.records.length} records, ${bundle.relations.length} relations. Dry run; pass --write to save.`);
