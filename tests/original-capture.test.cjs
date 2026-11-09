const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, load } = require('../scripts/content.cjs');
const capturePath=path.join(ROOT,'imports/advanced-english-original.json');
if(fs.existsSync(capturePath)) {
  const capture=JSON.parse(fs.readFileSync(capturePath));
  const messages=new Map(capture.messages.map(m=>[m.messageId,m]));
  const dataset=load();
  const records=new Map(dataset.records.map(r=>[r.id,r]));
  const normalize=text=>text.replace(/\s+/g,' ').trim();
  test('captured original branch has all unique indexed messages and both boundaries',()=>{
    assert.equal(messages.size,capture.messages.length);
    assert.equal(capture.chronologicalMessageIds.length,messages.size);
    assert.equal(new Set(capture.chronologicalMessageIds).size,messages.size);
    assert.equal(capture.startBoundaryObserved,true);
    assert.equal(capture.endBoundaryObserved,true);
    for(let i=0;i<capture.chronologicalMessageIds.length;i++)assert.equal(messages.get(capture.chronologicalMessageIds[i]).role,i%2?'assistant':'user');
  });
  test('chronological index respects every captured overlapping viewport batch',()=>{
    const positions=new Map(capture.chronologicalMessageIds.map((id,i)=>[id,i]));
    for(const batch of capture.orderBatches)for(let i=1;i<batch.length;i++)assert.ok(positions.get(batch[i-1])<positions.get(batch[i]));
  });
  test('every captured body and table is retained exactly in canonical source data',()=>{
    for(const message of capture.messages){
      const source=records.get(`src-original-${message.messageId}`);
      assert.ok(source,`missing source for ${message.messageId}`);
      assert.equal(source.payload.text,message.text);
      assert.deepEqual(source.payload.tables.map(t=>t.rows),message.tables);
      assert.equal(source.payload.role,message.role);
    }
  });
  test('splitting messages into lesson blocks loses no textual content',()=>{
    for(const message of capture.messages){
      const note=records.get(`note-original-${message.messageId}`);
      assert.ok(note);
      const body=message.text.replace(/\n(?:Give feedback|Copy table|Show more|Show less)\s*$/g,'').trim();
      const actual=normalize(note.payload.blocks.map(b=>b.data.text).join('\n\n'));
      const expected=normalize(body);
      if(actual!==expected)assert.fail(`Section boundaries changed the text of ${message.messageId}`);
    }
  });
}
