const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { ROOT, load, validateDataset, select, projections, recordText } = require('./content.cjs');
const flags = new Set(process.argv.slice(2));
for (const flag of flags) if (!['--include-private','--include-drafts'].includes(flag)) throw new Error(`Unknown flag ${flag}`);
const dataset = load();
const errors = validateDataset(dataset);
if (errors.length) throw new Error(errors.join('\n'));
const selected = select(dataset, { includePrivate: flags.has('--include-private'), includeDrafts: flags.has('--include-drafts') });
const output = path.join(ROOT, 'dist', flags.has('--include-private') ? 'private' : 'public');
fs.mkdirSync(output, { recursive: true });
function save(name, value) { fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + '\n'); }
const views = projections(selected);
save('catalog.json', { schemaVersion: '1.0.0', records: selected.records, relations: selected.relations });
for (const name of ['vocabulary','flashcards','sessions','graph']) save(`${name}.json`, views[name]);
fs.writeFileSync(path.join(output, 'retrieval.ndjson'), views.rag.map(r => JSON.stringify(r)).join('\n') + (views.rag.length ? '\n' : ''));
fs.writeFileSync(path.join(output, 'lessons.md'), selected.records.filter(r => ['note','writing','correction'].includes(r.type)).map(r => `<!-- ${r.id}; ${r.status}; ${r.visibility} -->\n\n${recordText(r)}\n`).join('\n---\n\n'));
save('manifest.json', {
  schemaVersion: '1.0.0', audience: flags.has('--include-private') ? 'private' : 'public',
  includesDrafts: flags.has('--include-drafts'),
  contentHash: crypto.createHash('sha256').update(JSON.stringify(selected)).digest('hex'),
  counts: { records: selected.records.length, relations: selected.relations.length, vocabulary: views.vocabulary.length, flashcards: views.flashcards.length, sessions: views.sessions.length },
  note: 'Build outputs are disposable projections. Canonical data lives in content/. Raw source records are excluded.',
});
console.log(`Exported ${selected.records.length} records to ${path.relative(ROOT, output)}.`);
if (flags.has('--include-private')) console.log('Private export contains original learner notes. Use only in an authenticated/private site.');
