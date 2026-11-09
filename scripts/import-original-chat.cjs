// Imports the saved browser capture. No browser access or network calls occur here.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { ROOT, load, validateDataset } = require('./content.cjs');
const archive = JSON.parse(fs.readFileSync(path.join(ROOT, 'imports/advanced-english-original.json'), 'utf8'));
const byMessage = new Map(archive.messages.map(m => [m.messageId, m]));
const order = archive.chronologicalMessageIds;
if (!order || order.length !== byMessage.size || new Set(order).size !== order.length || order.some(id => !byMessage.has(id))) throw new Error('Missing or incomplete chronological index');
if (order.some((id, i) => byMessage.get(id).role !== (i % 2 ? 'assistant' : 'user'))) throw new Error('Unexpected turn structure; review the capture before importing');
const current = load();
const records = new Map(current.records.map(r => [r.id, structuredClone(r)]));
const relations = new Map(current.relations.map(r => [r.id, structuredClone(r)]));
const changed = new Map();
const hash = value => crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
const sourceId = id => `src-original-${id}`;
const noteId = id => `note-original-${id}`;
const reference = (id, locator = 'message-body') => ({ sourceId: sourceId(id), locator });
const normalize = text => String(text).normalize('NFKC').replace(/[’‘]/g, "'").replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\s+/g, ' ').trim();
const slug = text => normalize(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titleOf = message => (message.headings[0]?.text || message.text.split('\n').find(t => t.trim() && !/^\d+ selections?$/.test(t.trim())) || message.role).slice(0, 160);
function upsert(record) { records.set(record.id, record); changed.set(record.id, record); }
function make(id, type, title, payload, refs, origin = 'extracted', tags = []) {
  return { schemaVersion:'1.0.0', id, type, subjectIds:type === 'source' ? [] : ['subject-english'], title:{ en:title }, tags, status:'draft', visibility:'private', provenance:{ origin, review:'unreviewed', sourceRefs:refs }, payload, extensions:{} };
}
function appendUnique(list, value) { if (!list.some(v => JSON.stringify(v) === JSON.stringify(value))) list.push(value); }
function link(from, type, to, ref) {
  const id = `rel-${hash(`${from}|${type}|${to}`)}`;
  const edge = relations.get(id) || { schemaVersion:'1.0.0', id, type, from, to, status:'proposed', sourceRefs:[], extensions:{} };
  appendUnique(edge.sourceRefs, ref); relations.set(id, edge);
}

const topicRules = [
  ['present-simple', /present simple/i], ['present-continuous', /present continuous/i],
  ['past-simple', /past simple/i], ['past-continuous', /past continuous/i],
  ['present-perfect', /present perfect/i], ['present-perfect-continuous', /present perfect continuous/i],
  ['past-perfect', /past perfect/i], ['past-perfect-continuous', /past perfect continuous/i],
  ['future-forms', /future forms|ساختارهای آینده|زمان آینده/i],
  ['relative-clauses', /relative clauses?|defining.*non.defining/i],
  ['zero-conditional', /zero conditional|zero.condition|شرطی.*صفر/i],
  ['first-conditional', /first conditional|first.condition|شرطی.*اول/i],
  ['second-conditional', /second conditional|second.condition|شرطی.*دوم/i],
  ['third-conditional', /third conditional|third.condition|شرطی.*سوم/i],
  ['gerund-infinitive', /gerund|infinitive|verb patterns?/i],
  ['stative-verbs', /stative verbs?/i], ['passive-voice', /passive voice|active.*passive/i],
  ['articles', /articles?|حروف تعریف/i], ['parts-of-speech', /parts? of speech|parse of speech/i],
  ['so-such-too-enough', /so.*such.*too.*enough/i],
  ['modals', /modal verbs?|افعال وجهی/i], ['used-to', /used to/i],
  ['phrasal-verbs', /phrasal verbs?/i], ['word-families', /word famil|خانواده.*کلمات|هم.خانواده/i],
  ['writing', /writing|رایتینگ|نوشتن/i], ['reported-speech', /reported speech/i],
];
const touchedConcepts = new Map();
const messageNotes = new Map();
let totalSections = 0;
function sections(message) {
  const text = message.text.replace(/\n(?:Give feedback|Copy table|Show more|Show less)\s*$/g, '').trim();
  const cuts = [];
  let cursor = 0;
  for (const heading of message.headings) {
    let at = text.indexOf(heading.text, cursor);
    // A short heading such as "on" must not split a word such as "noon".
    while (at >= 0 && !((at === 0 || text[at-1] === '\n') && (at+heading.text.length === text.length || text[at+heading.text.length] === '\n'))) at = text.indexOf(heading.text, at+1);
    if (at >= 0) { cuts.push(at); cursor = at + heading.text.length; }
  }
  const positions = [...new Set([0, ...cuts, text.length])].sort((a,b) => a-b);
  return positions.slice(0,-1).map((start, i) => text.slice(start, positions[i+1]).trim()).filter(Boolean);
}

for (let i = 0; i < order.length; i++) {
  const message = byMessage.get(order[i]);
  const src = make(sourceId(message.messageId), 'source', `Advanced English — original message ${i+1}`, {
    uri:archive.sourceUrl, role:message.role, messageOrdinal:i+1,
    ordinalScope:'selected-original-conversation-branch-in-observed-order', capturedOn:archive.capturedOn,
    dateLabel:null, occurredAt:null, captureScope:'rendered-message-body-and-tables', text:message.text,
    limitations:['Visible text of the selected branch only; hidden variants, linked documents and attachments are separate.', 'Some UI labels and selection counts remain in the source capture.'],
    tables:message.tables.map((rows,t) => ({ locator:`table:${t+1}`, rows })),
  }, []);
  src.extensions['capture.message-id'] = message.messageId;
  src.extensions['capture.headings'] = message.headings;
  src.extensions['capture.links'] = message.links;
  upsert(src);
  const conceptIds = [];
  for (const [key, regex] of topicRules) if (regex.test(message.text)) {
    const id = `concept-${key}`;
    let concept = records.get(id);
    if (!concept) concept = make(id, 'concept', key.replaceAll('-', ' '), { summary:null, blockIds:[] }, [], 'editorial', ['grammar-index']);
    appendUnique(concept.provenance.sourceRefs, reference(message.messageId));
    upsert(concept); touchedConcepts.set(id, concept); conceptIds.push(id);
  }
  const tags = ['original-conversation', message.role === 'user' ? 'learner-message' : 'assistant-response'];
  if (/آزمون|exam|test\b/i.test(message.text)) tags.push('assessment');
  if (/song lab|آهنگ|lyrics/i.test(message.text)) tags.push('song-lab');
  if (/vocabulary|واژگان|لغات/i.test(message.text)) tags.push('vocabulary');
  const blocks = sections(message).map((text,j) => ({ id:`block-original-${message.messageId}-${j+1}`, type:'text', version:1, data:{ format:'plain', locale:'mixed', text, role:message.role === 'user' ? 'learner-original' : 'assistant-source' } }));
  totalSections += blocks.length;
  const note = make(noteId(message.messageId), 'note', titleOf(message), { blocks, conceptIds }, [reference(message.messageId)], 'extracted', tags);
  note.extensions['capture.message-id'] = message.messageId;
  note.extensions['capture.turn-number'] = Math.floor(i/2)+1;
  upsert(note); messageNotes.set(message.messageId, note);
  for (const concept of conceptIds) link(note.id, 'covers', concept, reference(message.messageId));
}

// Explicitly map the eight earlier session records to their now-accessible original turns.
const existingSessions = {
  dd7591ab:'session-jobs', '1ace4d60':'session-future', '4854e7d4':'session-experiences-news',
  '3854a164':'session-sports-habits', '1bd1ed7e':'session-water-sports', '5fbc8c7a':'session-team-spirit',
  '9b258c20':'session-modals', d0d4111a:'session-unit-8',
};
const addedClassTurns = new Map([
  ['a6ec72fa','Foundation notes A1–A8'], ['d63a3c02','Services, clothing, weather and intensifiers'],
  ['1920ed9d','Previous class: language progress and everyday expressions'],
  ['77659a96','Advanced grammar and Unit 7 notes'], ['22cf3704','Work, restaurants and everyday grammar'],
  ['04d90228','Anxiety, expectations and writing'], ['98593651','Employment and career'],
  ['f631f914','Zero and first conditional'], ['0bf90c5f','Conditional review and speaking'],
  ['ab3a1c6d','Basic needs, earnings and summarising speakers'], ['1fc4fb80','Unit 8 and perfect tense review'],
]);
const sessionOrder = [];
for (let i = 0; i < order.length; i += 2) {
  const user = byMessage.get(order[i]), assistant = byMessage.get(order[i+1]);
  const prefix = user.messageId.slice(0,8);
  let sid = existingSessions[prefix];
  if (!sid && addedClassTurns.has(prefix)) {
    sid = `session-original-${prefix}`;
    upsert(make(sid, 'session', addedClassTurns.get(prefix), { occurredAt:null, dateLabel:null, datePrecision:'unknown', conceptIds:[], itemIds:[], sourceMessageIds:[], completeness:'partial', missing:['Any referenced original attachments are not imported in this text pass.'] }, [reference(user.messageId)], 'editorial'));
  }
  if (!sid) continue;
  const session = records.get(sid);
  for (const message of [user,assistant]) {
    appendUnique(session.payload.sourceMessageIds, sourceId(message.messageId));
    appendUnique(session.payload.itemIds, noteId(message.messageId));
    for (const id of messageNotes.get(message.messageId).payload.conceptIds) appendUnique(session.payload.conceptIds,id);
    appendUnique(session.provenance.sourceRefs, reference(message.messageId));
    link(sid, 'contains', noteId(message.messageId), reference(message.messageId));
  }
  if (sid === 'session-unit-8') {
    session.title.en = 'Unit 8 — Get Set, Go!'; session.payload.completeness = 'partial';
    session.payload.missing = ['Original textbook page/image is not imported; the complete assistant explanation is now available.'];
  }
  upsert(session); sessionOrder.push(sid);
}
upsert(make('collection-original-conversation', 'collection', 'Advanced English — complete captured message sequence', { kind:'custom', itemIds:order.map(noteId) }, [reference(order[0])], 'editorial'));
upsert(make('collection-original-class-sessions', 'collection', 'Class sessions recovered from the original chat', { kind:'session-sequence', itemIds:sessionOrder }, [reference(order[0])], 'editorial'));

// Extract only explicitly labelled lexical tables. Every row remains in the raw source.
const lemmaIndex = new Map([...records.values()].filter(r=>r.type==='entry').map(r=>[normalize(r.payload.lemma).toLowerCase(),r]));
const importedRows = [];
const familyMembers = new Map();
let vocabularyRows = 0, newEntries = 0;
const normHeader = text => normalize(text).toLowerCase().replace(/[^a-z\u0600-\u06ff]+/g,' ').trim();
function column(headers, patterns) { return headers.findIndex(h=>patterns.some(p=>p.test(h))); }
for (const message of archive.messages.filter(m=>m.role==='assistant')) for (let ti=0;ti<message.tables.length;ti++) {
  const table = message.tables[ti];
  if (!table.length) continue;
  const headers = table[0].map(normHeader);
  const wi = column(headers,[/^word(?: phrase)?$/, /^word$/, /^واژه$/, /^واژه یا ترکیب$/, /^واژه یا عبارت$/, /^کلمه$/, /^عبارت$/, /^expression$/]);
  const mi = column(headers,[/^معنی$/, /معنی فارسی/, /translation persian/, /^meaning$/, /^معنی و کاربرد$/, /^معنی و نکته$/, /^معنی دقیق$/, /^معنی اصلی$/]);
  if (wi < 0 || mi < 0 || wi === mi) continue;
  const pi = column(headers,[/part of speech/, /^نوع$/, /^نقش$/, /نقش دستوری/, /^type$/, /^category$/]);
  const fi = column(headers,[/^خانواده$/, /^word family$/]);
  const si = column(headers,[/synonym/, /^equivalents?$/]);
  const di = column(headers,[/english definition/, /^definition$/]);
  const ei = column(headers,[/^example$/, /^مثال$/, /^مثال جدید$/, /^ترکیب نمونه$/, /^مثال طبیعی$/]);
  for (let ri=1;ri<table.length;ri++) {
    const cells = table[ri];
    const lemma = normalize(cells[wi] || '');
    const meaning = normalize(cells[mi] || '');
    if (!lemma || !meaning || !/[A-Za-z]/.test(lemma) || lemma.length>120 || /\n/.test(cells[wi] || '') || ['word','word / phrase'].includes(lemma.toLowerCase())) continue;
    vocabularyRows++;
    const key = lemma.toLowerCase(); let entry = lemmaIndex.get(key);
    if (!entry) {
      let eid = `entry-${slug(lemma) || hash(lemma)}`;
      if (records.has(eid)) eid += `-${hash(key)}`;
      entry = make(eid, 'entry', lemma, { lemma, language:'en', aliases:[], familyId:null, senses:[], occurrences:[] }, [], 'extracted', ['vocabulary','original-chat-extraction']);
      lemmaIndex.set(key, entry); newEntries++;
    }
    const rr = reference(message.messageId, `table:${ti+1}/data-row:${ri}`);
    const pos = pi >= 0 && cells[pi]?.trim() ? normalize(cells[pi]) : 'Unspecified in source';
    const fa = /[\u0600-\u06ff]/.test(meaning) ? meaning : null;
    const en = di>=0 ? normalize(cells[di]||'')||null : !fa ? meaning : null;
    let sense = entry.payload.senses.find(s=>s.partOfSpeech===pos && s.translation.fa===fa && (fa || s.definition.en===en));
    if (!sense) {
      const sid = `sense-${hash(`${entry.id}|${pos}|${fa}|${en}`)}`;
      sense = { id:sid, partOfSpeech:pos, translation:{fa}, definition:{en}, equivalents:[], examples:[], sourceRefs:[], review:'unreviewed' };
      entry.payload.senses.push(sense);
    }
    if (en && !sense.definition.en) sense.definition.en = en;
    if (si>=0) for (const value of normalize(cells[si]||'').split(/[,;]/).map(s=>s.trim()).filter(s=>s && s!=='—')) appendUnique(sense.equivalents,value);
    if (ei>=0 && cells[ei]?.trim()) {
      const text = normalize(cells[ei]);
      if (!sense.examples.some(b=>b.data.text===text)) sense.examples.push({ id:`block-example-${hash(`${entry.id}|${sense.id}|${text}`)}`, type:'example', version:1, data:{ text, locale:/[\u0600-\u06ff]/.test(text)?'mixed':'en' } });
    }
    appendUnique(sense.sourceRefs,rr); appendUnique(entry.provenance.sourceRefs,rr);
    const pairIndex=order.indexOf(message.messageId)-1;
    const sessionId = pairIndex>=0 ? existingSessions[order[pairIndex].slice(0,8)] || (addedClassTurns.has(order[pairIndex].slice(0,8)) ? `session-original-${order[pairIndex].slice(0,8)}` : null) : null;
    appendUnique(entry.payload.occurrences,{ sourceRef:rr, group:'original-chat-table', sessionId, priority:null });
    if (fi>=0 && cells[fi]?.trim()) {
      const family = normalize(cells[fi]); const fid=`family-${slug(family)||hash(family)}`;
      if (!familyMembers.has(fid)) familyMembers.set(fid,{ title:family, ids:new Set(), refs:[] });
      familyMembers.get(fid).ids.add(entry.id); appendUnique(familyMembers.get(fid).refs,rr);
      // Existing curated family membership takes precedence over a new table grouping.
      if (!entry.payload.familyId) entry.payload.familyId=fid;
      link(entry.id,'member-of',fid,rr);
    }
    upsert(entry); importedRows.push({ messageId:message.messageId, sourceRef:rr, header:table[0], cells, entryId:entry.id, senseId:sense.id });
  }
}
for (const [fid,family] of familyMembers) {
  const existing=records.get(fid);
  const collection=existing?.type==='collection' ? existing : make(fid,'collection',`${family.title} — source word family`,{kind:'word-family',itemIds:[]},[],'extracted');
  for(const id of family.ids) appendUnique(collection.payload.itemIds,id);
  for(const rr of family.refs) appendUnique(collection.provenance.sourceRefs,rr);
  upsert(collection);
}

// Retain links from earlier records without rewriting their original evidence.
const crosswalk=[];
for (const old of [...records.values()].filter(r=>/^src-chat-m/.test(r.id))) {
  const oldText=normalize(old.payload.text || '');
  if(oldText.length<30)continue;
  const match=archive.messages.filter(m=>m.role===old.payload.role).find(m=>{
    const t=normalize(m.text); return t.includes(oldText) || (oldText.length>80 && t.includes(oldText.slice(0,80)));
  });
  if(match){old.extensions['capture.original-source-id']=sourceId(match.messageId);upsert(old);crosswalk.push({previousSourceId:old.id,originalSourceId:sourceId(match.messageId),matchMethod:'normalized-exact-prefix-or-full-text'});}
}
const candidate={records:[...records.values()],relations:[...relations.values()]};
const errors=validateDataset(candidate); if(errors.length)throw new Error(errors.join('\n'));
const metrics={messages:order.length,userMessages:order.filter(id=>byMessage.get(id).role==='user').length,assistantMessages:order.filter(id=>byMessage.get(id).role==='assistant').length,characters:archive.counts.characters,sections:totalSections,lexicalRows:vocabularyRows,newEntries,entries:[...records.values()].filter(r=>r.type==='entry').length,sourceTables:archive.counts.tables,classSessions:sessionOrder.length,recordCount:records.size,relationCount:relations.size};
if (!process.argv.includes('--write')) { console.log(JSON.stringify({dryRun:true,...metrics},null,2)); process.exit(0); }
const folders={source:'sources',subject:'subjects',session:'sessions',concept:'concepts',entry:'entries',collection:'collections',writing:'writings',correction:'corrections',exercise:'exercises',note:'notes',resource:'resources',policy:'policies'};
function save(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');}
for(const record of changed.values())save(path.join(ROOT,'content',folders[record.type],`${record.id}.json`),record);
for(const edge of relations.values())save(path.join(ROOT,'content/relations',`${edge.id}.json`),edge);
save(path.join(ROOT,'imports/original-chat-import-report.json'),{capturedOn:archive.capturedOn,sourceUrl:archive.sourceUrl,scope:'visible textual bodies of the selected original conversation branch',...metrics,crosswalk,remainingGaps:['Referenced attachments and linked documents were not opened in this text extraction pass.','Selections are preserved only to the extent their text was rendered in the captured message body.','Separate interactive artifacts or document versions may contain additional text.','Assistant explanations remain unreviewed source material.']});
save(path.join(ROOT,'imports/original-lexical-rows.json'),{rows:importedRows});
fs.writeFileSync(path.join(ROOT,'imports/advanced-english-transcript.txt'),order.map((id,i)=>`[${i+1}] ${byMessage.get(id).role.toUpperCase()} — ${id}\n\n${byMessage.get(id).text}\n`).join('\n'+'='.repeat(72)+'\n\n'));
console.log(JSON.stringify({written:true,...metrics},null,2));
