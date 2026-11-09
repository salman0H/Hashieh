const { load, validateDataset } = require('./content.cjs');
const dataset = load();
const errors = validateDataset(dataset);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Valid: ${dataset.records.length} records, ${dataset.relations.length} relations.`);
