const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load, validateDataset, select, projections } = require('../scripts/content.cjs');
const original = load();
const fresh = () => ({ records: structuredClone(original.records), relations: structuredClone(original.relations) });

test('canonical extraction has valid shapes and linked evidence', () => assert.deepEqual(validateDataset(original), []));
test('source gaps stay gaps; no worksheet is accidentally gradeable', () => {
  for (const record of original.records.filter(r => r.type === 'exercise' && r.payload.mode === 'source-answer-key')) {
    assert.equal(record.payload.prompt, null);
    assert.equal(record.payload.gradable, false);
  }
});
test('dangling references and prerequisite cycles are rejected', () => {
  const data = fresh();
  data.records.find(r => r.type === 'session').payload.conceptIds.push('concept-not-present');
  const edge = data.relations[0];
  data.relations.push({ ...edge, id:'rel-cycle-one', type:'requires', from:'concept-modals', to:'concept-advice' });
  data.relations.push({ ...edge, id:'rel-cycle-two', type:'requires', from:'concept-advice', to:'concept-modals' });
  const errors = validateDataset(data);
  assert.ok(errors.some(e => e.includes('missing reference concept-not-present')));
  assert.ok(errors.some(e => e.includes('Prerequisite cycle')));
});
test('unknown block structures cannot silently enter canonical content', () => {
  const data = fresh();
  data.records.find(r => r.type === 'note').payload.blocks[0].type = 'arbitrary-executable-widget';
  assert.ok(validateDataset(data).length);
});
test('a quote cannot be attributed to a different captured source', () => {
  const data = fresh();
  const note = data.records.find(r => r.type === 'note');
  note.provenance.sourceRefs[0].quote = 'A sentence that does not occur in this captured source.';
  assert.ok(validateDataset(data).some(e => e.includes('quote does not match')));
});
test('extensions preserve non-language content and supply plain text fallbacks', () => {
  const data = fresh();
  const note = data.records.find(r => r.type === 'note');
  note.payload.blocks = [{ id:'block-custom-test', type:'extension', version:1, data:{ namespace:'physics.circuit', fallbackText:'A battery connected to a resistor', value:{ resistanceOhms:220 } } }];
  assert.deepEqual(validateDataset(data), []);
  assert.ok(projections(select(data, { includePrivate:true, includeDrafts:true })).rag.some(r => r.text.includes('battery connected')));
});
test('public export excludes drafts, private records and raw sources', () => {
  assert.equal(select(original).records.length, 0);
  const data = fresh();
  const one = data.records.find(r => r.type === 'concept');
  one.status = 'published'; one.visibility = 'public'; one.provenance.review = 'reviewed';
  const result = select(data);
  assert.deepEqual(result.records.map(r => r.id), [one.id]);
  assert.equal(result.relations.length, 0);
});
test('exporting views preserves senses and provenance without inventing definitions', () => {
  const result = projections(select(original, { includePrivate:true, includeDrafts:true }));
  assert.equal(result.vocabulary.length, original.records.filter(r => r.type === 'entry' && r.status !== 'archived').length);
  assert.equal(result.sessions.length, original.records.filter(r => r.type === 'session' && r.status !== 'archived').length);
  const entry = result.vocabulary.find(r => r.payload.lemma === 'take up');
  assert.ok(entry.payload.senses.some(s => s.translation.fa.includes('شروع')));
  for (const card of result.flashcards) {
    assert.ok(card.sourceRefs.length);
  }
  assert.equal(result.vocabulary.find(r => r.payload.lemma === 'afford').payload.senses[0].definition.en, null);
  assert.ok(entry.payload.senses.some(s => s.definition.en?.includes('uses a certain amount of your time')));
  assert.ok(entry.payload.senses.length > 1);
});
