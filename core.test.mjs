import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handbook,chunkDocument,lexicalScore,rank,dot,priority,draftReply,shortlistProducts,queues,escapeHtml} from './core.mjs';
test('policy search retrieves the actual refund passage',()=>{
  const chunks=chunkDocument(handbook);
  const results=rank('How long does a refund take?',chunks,p=>p.title+' '+p.text);
  assert.equal(results[0].item.title,'Refunds');
  assert.match(results[0].item.text,/5–10 business days/);
});
test('unrelated questions do not have keyword matches',()=>{
  assert.equal(Math.max(...chunkDocument(handbook).map(p=>lexicalScore('quantum pineapple orchestra',p.title+' '+p.text))),0);
});
test('chunking preserves long document content and stable source references',()=>{
  const input=Array.from({length:400},(_,i)=>'word'+i).join(' ');
  const chunks=chunkDocument(input);
  assert.ok(chunks.length>1);
  assert.equal(chunks.map(c=>c.text).join(' '),input);
  assert.deepEqual(chunks.map(c=>c.id),chunks.map((_,i)=>i+1));
  assert.throws(()=>chunkDocument('x'.repeat(16001)),/16,000/);
});
test('semantic ranking uses vector similarity rather than string overlap',()=>{
  const items=[{text:'noise cancellation'},{text:'desk lamp'}];
  assert.equal(rank('quiet',items,x=>x.text,[[1,0],[.9,.1],[.1,.9]])[0].item,items[0]);
  assert.equal(dot([1,0],[0,1]),0);assert.throws(()=>dot([1],[1,0]));
});
test('budget and category are hard filters including zero budget',()=>{
  assert.equal(shortlistProducts('all',0).length,0);
  const found=shortlistProducts('Tech',40);
  assert.equal(found.length,1);assert.equal(found[0].name,'Pocket Power Bank');
});
test('payment enquiry routes to billing in keyword mode',()=>{
  assert.equal(rank('My card was charged twice. Please refund the duplicate payment.',queues,q=>q.text)[0].item.id,'billing');
});
test('priority and replies are transparent deterministic suggestions',()=>{
  assert.equal(priority('This is urgent').label,'High');
  assert.equal(priority('My mug is broken').label,'Review soon');
  assert.equal(priority('I like it').label,'Normal');
  const draft=draftReply(queues[0]);assert.match(draft,/review/i);assert.doesNotMatch(draft,/refund has been issued/i);
});
test('untrusted markup is displayed as text',()=>{assert.equal(escapeHtml('<script>"x"&</script>'),'&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;');});
