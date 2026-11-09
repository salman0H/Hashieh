const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');
const ROOT = path.resolve(__dirname, '..');

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : full.endsWith('.json') ? [full] : [];
  }).sort();
}

function load(root = ROOT) {
  const documents = files(path.join(root, 'content')).map(file => ({
    file: path.relative(root, file), data: JSON.parse(fs.readFileSync(file, 'utf8')),
  }));
  return {
    records: documents.filter(d => !d.file.startsWith('content/relations/')).map(d => d.data),
    relations: documents.filter(d => d.file.startsWith('content/relations/')).map(d => d.data),
    documents,
  };
}

function validateDataset(dataset) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const recordSchema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/record.schema.json')));
  const relationSchema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/relation.schema.json')));
  const recordCheck = ajv.compile(recordSchema);
  const relationCheck = ajv.compile(relationSchema);
  const errors = [];
  const byId = new Map();
  for (const item of [...dataset.records, ...dataset.relations]) {
    if (byId.has(item.id)) errors.push(`Duplicate ID: ${item.id}`);
    byId.set(item.id, item);
  }
  const checkRef = (id, owner, expectedType) => {
    const target = byId.get(id);
    if (!target) errors.push(`${owner}: missing reference ${id}`);
    else if (expectedType && target.type !== expectedType) errors.push(`${owner}: ${id} must be ${expectedType}`);
  };
  const referenceArrays = { subjectIds: 'subject', conceptIds: 'concept', itemIds: null, sourceMessageIds: 'source', revisionIds: 'writing' };
  const walk = (value, owner) => {
    if (Array.isArray(value)) return value.forEach(v => walk(v, owner));
    if (!value || typeof value !== 'object') return;
    for (const [key, data] of Object.entries(value)) {
      if (key === 'extensions') continue; // Opaque namespaced extensions own their own validation.
      if (key === 'sourceId') checkRef(data, owner, 'source');
      if (key === 'quote' && typeof value.sourceId === 'string') {
        const source = byId.get(value.sourceId);
        const normalize = text => text.replace(/\s+/g, ' ').trim();
        if (source?.payload?.text && !normalize(source.payload.text).includes(normalize(data))) errors.push(`${owner}: quote does not match captured source ${value.sourceId}`);
      }
      if (Object.hasOwn(referenceArrays, key) && Array.isArray(data)) data.forEach(id => checkRef(id, owner, referenceArrays[key]));
      if (['familyId', 'sessionId', 'resourceId'].includes(key) && data !== null) checkRef(data, owner, { familyId: 'collection', sessionId: 'session', resourceId: 'resource' }[key]);
      walk(data, owner);
    }
  };
  const blockIds = new Set();
  const senseIds = new Set();
  for (const item of dataset.records) {
    if (!recordCheck(item)) errors.push(`${item.id}: ${ajv.errorsText(recordCheck.errors)}`);
    walk(item, item.id);
    if (item.type !== 'source' && !item.provenance?.sourceRefs?.length) errors.push(`${item.id}: provenance is required`);
    if (['reviewed', 'published'].includes(item.status) && item.provenance.review !== 'reviewed') errors.push(`${item.id}: reviewed/published record needs explicit content review`);
    for (const block of item.payload?.blocks || []) {
      if (blockIds.has(block.id)) errors.push(`${item.id}: duplicate block ID ${block.id}`);
      blockIds.add(block.id);
    }
    for (const sense of item.payload?.senses || []) {
      if (senseIds.has(sense.id)) errors.push(`${item.id}: duplicate sense ID ${sense.id}`);
      senseIds.add(sense.id);
    }
    if (item.type === 'exercise' && item.payload.gradable && (!item.payload.prompt || item.payload.missing.length || !item.payload.answers.length)) errors.push(`${item.id}: incomplete exercise cannot be graded`);
    if (item.type === 'exercise' && new Set(item.payload.answers.map(a => a.number)).size !== item.payload.answers.length) errors.push(`${item.id}: duplicate answer number`);
    if (item.type === 'session' && item.payload.datePrecision !== 'unknown' && !item.payload.occurredAt) errors.push(`${item.id}: known date requires occurredAt`);
  }
  for (const item of dataset.records) for (const blockId of item.payload?.blockIds || []) if (!blockIds.has(blockId)) errors.push(`${item.id}: missing block ${blockId}`);
  const edgeKeys = new Set();
  for (const relation of dataset.relations) {
    if (!relationCheck(relation)) errors.push(`${relation.id}: ${ajv.errorsText(relationCheck.errors)}`);
    checkRef(relation.from, relation.id); checkRef(relation.to, relation.id);
    if (relation.from === relation.to) errors.push(`${relation.id}: self relation`);
    const key = `${relation.from}|${relation.type}|${relation.to}`;
    if (edgeKeys.has(key)) errors.push(`${relation.id}: duplicate relation`);
    edgeKeys.add(key);
    walk(relation, relation.id);
  }
  const dependencies = new Map();
  for (const edge of dataset.relations.filter(e => e.type === 'requires')) {
    dependencies.set(edge.from, [...(dependencies.get(edge.from) || []), edge.to]);
    if (byId.get(edge.from)?.type !== 'concept' || byId.get(edge.to)?.type !== 'concept') errors.push(`${edge.id}: prerequisites must connect concepts`);
  }
  const visited = new Set(), visiting = new Set();
  function visit(id) {
    if (visiting.has(id)) { errors.push(`Prerequisite cycle at ${id}`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of dependencies.get(id) || []) visit(next);
    visiting.delete(id); visited.add(id);
  }
  for (const id of dependencies.keys()) visit(id);
  if (dataset.documents) for (const d of dataset.documents) if (path.basename(d.file, '.json') !== d.data.id) errors.push(`${d.file}: filename must match ID`);
  return errors;
}

function select(dataset, { includePrivate = false, includeDrafts = false } = {}) {
  const records = dataset.records.filter(r => r.type !== 'source' && r.status !== 'archived' &&
    (includePrivate || r.visibility === 'public') && (includeDrafts || r.status === 'published'));
  const ids = new Set(records.map(r => r.id));
  // Preserve references in canonical records. Projections omit unpublished targets and raw evidence.
  return { records, relations: dataset.relations.filter(r => ids.has(r.from) && ids.has(r.to) && (includeDrafts || r.status === 'accepted')) };
}

function blockText(block) {
  const d = block.data;
  switch (block.type) {
    case 'text': return d.text;
    case 'question': return d.prompt;
    case 'example': return [d.text, ...Object.values(d.translation || {})].join('\n');
    case 'formula': return d.parts.map(p => p.text).join(' + ');
    case 'comparison': return d.columns.map(c => `${Object.values(c.title).join(' / ')}: ${c.text}`).join('\n');
    case 'timeline': return d.events.map(e => `${e.position}: ${Object.values(e.label).join(' / ')}`).join('\n');
    case 'quiz': return `${d.prompt}\n${Object.values(d.explanation).filter(Boolean).join('\n')}`;
    case 'code': return d.code;
    case 'media': return Object.values(d.alt).filter(Boolean).join(' / ');
    case 'extension': return d.fallbackText;
    default: throw new Error(`Missing adapter for block ${block.type}`);
  }
}
function recordText(record) {
  const p = record.payload;
  const parts = [Object.values(record.title).filter(Boolean).join(' / ')];
  if (p.blocks) parts.push(...p.blocks.map(blockText));
  if (p.senses) for (const s of p.senses) parts.push(`${s.partOfSpeech}: ${Object.values(s.translation).filter(Boolean).join(' / ')}; ${s.equivalents.join(', ')}`);
  if (p.original) parts.push(p.original, p.replacement, ...Object.values(p.explanation));
  if (p.summary) parts.push(...Object.values(p.summary));
  if (p.prompt) parts.push(p.prompt);
  return parts.filter(Boolean).join('\n\n');
}

function projections(selected) {
  const { records, relations } = selected;
  const vocabulary = records.filter(r => r.type === 'entry');
  const flashcards = vocabulary.flatMap(entry => entry.payload.senses.filter(s => s.translation.fa).map(sense => ({
    id: `card-${sense.id}`, entryId: entry.id, senseId: sense.id,
    front: { text: entry.payload.lemma, language: 'en', context: sense.partOfSpeech },
    back: { translation: sense.translation, definition: sense.definition, equivalents: sense.equivalents },
    sourceRefs: sense.sourceRefs, status: entry.status, review: sense.review,
  })));
  const sessions = records.filter(r => r.type === 'session');
  const graph = {
    nodes: records.filter(r => ['subject','session','concept','entry','collection'].includes(r.type)).map(r => ({ id: r.id, type: r.type, title: r.title, subjectIds: r.subjectIds, tags: r.tags, status: r.status })),
    edges: [],
  };
  const graphIds = new Set(graph.nodes.map(n => n.id));
  graph.edges = relations.filter(r => graphIds.has(r.from) && graphIds.has(r.to));
  const rag = records.map(record => ({ id: record.id, type: record.type, text: recordText(record), sourceRefs: record.provenance.sourceRefs, status: record.status }));
  return { vocabulary, flashcards, sessions, graph, rag };
}
module.exports = { ROOT, load, validateDataset, select, projections, recordText };
