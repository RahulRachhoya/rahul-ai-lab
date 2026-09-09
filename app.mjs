import {handbook,products,queues,tickets,chunkDocument,rank,priority,draftReply,shortlistProducts,escapeHtml as h} from './core.mjs';

const main=document.querySelector('main');
const source='https://github.com/RahulRachhoya/rahul-ai-lab';
const projects=[
  {id:'sourcebook',num:'01',name:'Sourcebook',eyebrow:'DOCUMENT INTELLIGENCE',headline:'Find the answer.<br>Keep the source.',desc:'Search a handbook in everyday language and see the passages behind the result.',audience:'For teams & service businesses',color:'sage',icon:'book',proof:'Document chunking · Semantic retrieval · Source references',limit:'This is passage retrieval, not a chatbot that generates answers. It does not read PDFs, connect to a company drive, or verify the policy itself.'},
  {id:'inbox',num:'02',name:'Inbox Pilot',eyebrow:'CUSTOMER OPERATIONS',headline:'A busy inbox.<br>A clearer next step.',desc:'Turn an enquiry into a suggested queue, a review priority and an editable reply.',audience:'For support teams & agencies',color:'peach',icon:'inbox',proof:'Semantic routing · Review rules · Human approval',limit:'Queue suggestions come from similarity to five example categories. Priority uses disclosed keyword rules. Replies are templates, not AI-generated prose. Nothing is sent.'},
  {id:'catalog',num:'03',name:'Catalog Compass',eyebrow:'PRODUCT DISCOVERY',headline:'Search for the need.<br>Discover the product.',desc:'Describe what you need, set a budget and explore a small fictional catalog.',audience:'For brands & online retailers',color:'sand',icon:'bag',proof:'Vector ranking · Structured filters · Match inspection',limit:'Eight fictional products, with illustrative USD prices. Similarity is not a suitability guarantee. This demo has no checkout, stock system, or customer tracking.'}
];
let worker,requestId=0,ready=false,loading=false,mode='keyword',generation=0;
const pending=new Map();
let lastExport=null, toastTimer, progressText='';
function icon(name) {
  const paths={book:'M8 5h9a4 4 0 0 1 4 4v19a4 4 0 0 0-4-4H8z M21 9a4 4 0 0 1 4-4h9v19h-9a4 4 0 0 0-4 4 M13 11h4 M13 16h4 M26 11h4 M26 16h4',inbox:'M8 10h26v22H8z M8 21h8l3 4h4l3-4h8 M15 5h12 M15 15h12',bag:'M10 12h22l2 22H8z M16 13V9a5 5 0 0 1 10 0v4',headphones:'M9 24v-7a12 12 0 0 1 24 0v7 M9 20h5v12H9z M28 20h5v12h-5z',bottle:'M17 4h8v6l4 5v19H13V15l4-5z M13 18h16',lamp:'M14 5h14l6 16H8z M21 21v12 M12 34h18',battery:'M10 9h24v24H10z M17 5h10 M23 14l-7 9h8l-5 7',cup:'M9 12h21v14a9 9 0 0 1-18 0z M30 15h4a5 5 0 0 1 0 10h-4 M9 36h25'};
  return `<svg viewBox="0 0 42 42" aria-hidden="true"><path d="${paths[name]||paths.book}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function notify(text) { document.querySelector('#toast').textContent=text; clearTimeout(toastTimer); toastTimer=setTimeout(()=>document.querySelector('#toast').textContent='',4500); }
function updateEngine() {
  const label=document.querySelector('#engine-status'),btn=document.querySelector('#load-ai');
  if(label) label.textContent=loading ? progressText || 'Preparing AI…' : mode==='ai' ? 'Semantic AI is ready · Runs on your device' : 'Keyword mode · No AI model loaded';
  if(btn) { btn.disabled=loading; btn.textContent=loading?'Loading AI…':ready?(mode==='ai'?'Use keyword mode':'Use semantic AI'):'Enable semantic AI'; }
  document.querySelectorAll('.mode-label').forEach(e=>e.textContent=mode==='ai'?'SEMANTIC AI':'KEYWORD MODE');
}
function request(type,texts=[]) {
  if(!worker) {
    worker=new Worker(new URL('./ai-worker.mjs',import.meta.url),{type:'module'});
    worker.onmessage=({data})=>{
      if(data.type==='progress'){progressText=data.message;updateEngine();return;}
      const p=pending.get(data.id); if(!p)return;
      clearTimeout(p.timer);pending.delete(data.id);
      data.type==='error'?p.reject(new Error(data.message)):p.resolve(data.vectors);
    };
    worker.onerror=()=>{failWorker(new Error('Your browser could not start the AI worker. Keyword mode is available.'));};
  }
  const id=++requestId;
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>failWorker(new Error('The model took too long to respond. Try again on a stronger connection or use keyword mode.')),180000);
    pending.set(id,{resolve,reject,timer});worker.postMessage({id,type,texts});
  });
}
function failWorker(error){
  worker?.terminate();worker=undefined;ready=false;loading=false;mode='keyword';
  for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();updateEngine();
}
async function enableAI(){
  if(ready){mode=mode==='ai'?'keyword':'ai';updateEngine();notify('Mode changed. Run the demo again to refresh its results.');return;}
  loading=true;updateEngine();
  try{await request('load');ready=true;mode='ai';notify('AI is ready. Run a demo to compare semantic results.');}
  catch(e){notify(e.message);}
  finally{loading=false;updateEngine();}
}
async function ranked(query,items,textOf) {
  const usedMode=mode;
  const vectors=usedMode==='ai'?await request('embed',[query,...items.map(textOf)]):null;
  return {results:rank(query,items,textOf,vectors),usedMode};
}
function enginePanel(){
  return `<div class="engine"><div><span class="live-dot"></span><strong id="engine-status"></strong><p>Enable the language model with a one-time download. Your text is processed here in your browser. Downloads come from Hugging Face and jsDelivr.</p></div><button class="button secondary" id="load-ai"></button></div>`;
}
function home(){
  main.innerHTML=`<section class="hero"><div class="eyebrow"><span class="live-dot"></span> THE INTERACTIVE PORTFOLIO / VOL. 01</div><div class="hero-grid"><h1>Small demos.<br><em>Real possibilities.</em></h1><div class="hero-side"><p>A little proof of what we could build together. Three focused AI experiments, ready for you to try.</p><a class="text-link" href="#projects">Pick a demo below <span>↓</span></a></div></div><div class="hero-meta"><span>01 — Try a real workflow</span><span>02 — Bring your own text</span><span>03 — Inspect the result</span><span class="no-signup">NO SIGN-UP NEEDED ↗</span></div></section>
    <section id="projects" class="projects"><div class="section-heading"><h2>The demo collection<span> / 03</span></h2><span>SMALL IN SCOPE. OPEN IN SOURCE.</span></div><div class="project-grid">${projects.map(p=>`<article class="project-card"><a href="#${p.id}" class="project-art ${p.color}" aria-label="Try ${p.name}"><span class="art-index">EXPERIMENT / ${p.num}</span><div class="art-icon">${icon(p.icon)}</div><span class="art-word">${p.name}</span><span class="art-arrow">↗</span></a><div class="card-body"><div class="eyebrow">${p.eyebrow}</div><h3><a href="#${p.id}">${p.name}</a></h3><p>${p.desc}</p><div class="card-bottom"><span>${p.audience}</span><a href="#${p.id}" aria-label="Open ${p.name}">Try demo ↗</a></div></div></article>`).join('')}</div></section>
    <section class="about" id="about"><div><div class="eyebrow">THOUGHTFULLY SMALL</div><h2>A working slice.<br>A useful conversation.</h2></div><div><p>These are independent demonstrations built by Rahul Rachhoya. Each solves one narrow part of a business workflow, with editable inputs and inspectable outputs.</p><p>Semantic mode uses a real, compact language model on your device. Keyword mode works immediately without the download. Every result names the mode that produced it.</p><a class="text-link" href="${source}" target="_blank" rel="noopener">Explore the implementation ↗</a></div><div class="about-note"><span class="eyebrow">FROM DEMO TO YOUR PROJECT</span><p>Bring your use case, sample inputs and current tools. We can define one useful outcome and build a small proof before expanding the scope.</p><a class="button" href="https://rahulrachhoya.is-a.dev/rahul-studio/#start">Tell me what you need ↗</a></div></section>`;
}
function workspace(p){
  main.innerHTML=`<section class="demo-heading"><a href="#" class="back">← All experiments</a><div class="demo-heading-row"><div><div class="eyebrow">${p.num} / ${p.eyebrow}</div><h1>${p.name}<span class="mini-badge">LIVE DEMO</span></h1><p>${p.desc}</p></div><div class="small-art ${p.color}">${icon(p.icon)}</div></div></section>${enginePanel()}<section class="workbench" aria-label="${p.name} workspace"><div class="input-panel" id="inputs"></div><div class="output-panel"><div class="panel-heading"><span class="eyebrow">02 / THE RESULT</span><span class="mode-label"></span></div><div id="result" aria-live="polite"><div class="empty-state">${icon(p.icon)}<h2>Your next step, made clearer.</h2><p>Try the sample, or make it your own.<br>Results and their method will appear here.</p></div></div></div></section><section class="case-study"><div><div class="eyebrow">WHAT THIS DEMONSTRATES</div><p>${p.proof}</p></div><div><div class="eyebrow">DEMO BOUNDARIES</div><p>${p.limit}</p></div><a class="text-link" href="${source}" target="_blank" rel="noopener">View source ↗</a></section>`;
  document.querySelector('#load-ai').addEventListener('click',enableAI);updateEngine();
  ({sourcebook:sourceUI,inbox:inboxUI,catalog:catalogUI})[p.id]();
}
function controls(label){return `<div class="panel-heading"><span class="eyebrow">01 / ${label}</span><button class="reset text-link" type="button">Reset sample ↺</button></div>`;}
function resultHeader(title,usedMode) {return `<div class="result-heading"><span class="result-tag">${usedMode==='ai'?'SEMANTIC AI RESULT':'KEYWORD RESULT'}</span><h2>${h(title)}</h2></div>`;}
function scoreLabel(score,usedMode){return usedMode==='ai'?`Similarity ${score.toFixed(2)}`:`Keyword score ${Math.round(score*100)}%`;}
function exportButton(){return '<div class="export-tools"><button class="button secondary export" type="button">Download result ↓</button> <button class="button secondary copy-json" type="button">Copy result JSON</button></div>';}
function installExport(){
  document.querySelector('.copy-json')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(JSON.stringify(lastExport,null,2));notify('Result JSON copied.');}catch{notify('Clipboard is unavailable in this browser. Try downloading the result.');}});
  document.querySelector('.export')?.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(lastExport,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${lastExport.demo}-result.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notify('Download requested. If your browser blocks it, use Copy result JSON.');
  });
}
async function run(form,action){
  const button=form.querySelector('[type=submit]'),result=document.querySelector('#result'),version=generation;
  const label=button.textContent;
  form.querySelector('.form-error').textContent='';
  button.disabled=true;button.textContent='Working…';result.setAttribute('aria-busy','true');
  try{await action(()=>version===generation);}
  catch(e){if(version===generation)form.querySelector('.form-error').textContent=e.message;}
  finally{button.disabled=false;button.textContent=label;result.removeAttribute('aria-busy');}
}
function sourceUI(){
  const input=document.querySelector('#inputs');
  input.innerHTML=`${controls('YOUR DOCUMENT')}<form id="document-form"><label for="document">A short handbook or policy</label><textarea id="document" rows="12" maxlength="16000" required spellcheck="false"></textarea><div class="field-hint">Plain text or Markdown · Up to 16,000 characters</div><label class="file-label">Or choose a .txt / .md file<input id="doc-file" type="file" accept=".txt,.md,text/plain,text/markdown"></label><label for="question">What are you looking for?</label><input id="question" maxlength="300" required value="How long does a refund take?"><div class="quick-prompts"><button type="button" data-question="Can I return something after two weeks?">Return after 2 weeks?</button><button type="button" data-question="What if my order arrives broken?">A broken delivery?</button></div><p class="form-error" role="alert"></p><button class="button" type="submit">Find relevant passages <span>↗</span></button><p class="fine-print">Source passages are quoted as written. Relevance scores are not probabilities or proof of an answer.</p></form>`;
  const doc=input.querySelector('#document');doc.value=handbook;
  input.querySelector('.reset').onclick=()=>{doc.value=handbook;input.querySelector('#question').value='How long does a refund take?';notify('Sample restored. Run the search to refresh the result.');};
  input.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{input.querySelector('#question').value=b.dataset.question;});
  input.querySelector('#doc-file').onchange=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>64000||!/\.(txt|md)$/i.test(file.name)){notify('Choose a .txt or .md file under 64 KB.');e.target.value='';return;}
    const text=await file.text();if(text.length>16000){notify('The document is too long. Limit it to 16,000 characters.');return;}doc.value=text;notify('Document loaded locally. Run the search when ready.');
  };
  input.querySelector('form').onsubmit=e=>{e.preventDefault();run(e.target,async current=>{
    const query=input.querySelector('#question').value.trim(),chunks=chunkDocument(doc.value);
    if(!query||!chunks.length)throw new Error('Add a document and a question with some text.');
    const {results,usedMode}=await ranked(query,chunks,p=>p.title+' '+p.text);
    if(!current())return;
    const threshold=usedMode==='ai'?0.24:0.05;
    const matches=results.filter(r=>r.score>=threshold).slice(0,3);
    const uncertain=matches.length===0;
    document.querySelector('#result').innerHTML=resultHeader(uncertain?'No strong match found.':'Here are the relevant passages.',usedMode)+`<p class="result-explainer">${uncertain?'Try a more specific question or add relevant source text. The demo will not invent an answer.':'Read the source before relying on it. These passages are retrieved, not generated.'}</p>${matches.map(r=>`<article class="passage"><div class="passage-top"><span class="source-id">[${r.item.id}] ${h(r.item.title)}</span><span>${scoreLabel(r.score,usedMode)}</span></div><blockquote>${h(r.item.text)}</blockquote></article>`).join('')}<p class="fine-print">Searched ${chunks.length} passages. ${usedMode==='ai'?'Normalized MiniLM embeddings, ranked by cosine similarity.':'Shared meaningful words, with extra weight for matching section titles.'}</p>${exportButton()}`;
    lastExport={demo:'sourcebook',mode:usedMode,query,matches:matches.map(r=>({source:r.item,score:r.score})),note:'Retrieved source passages; not generated answers.'};installExport();
  });};
}
function inboxUI(){
  const input=document.querySelector('#inputs');
  input.innerHTML=`${controls('THE ENQUIRY')}<form><label for="ticket">A customer message</label><textarea id="ticket" rows="8" maxlength="1500" required></textarea><div class="field-hint">Up to 1,500 characters · Use sample or non-sensitive text</div><div class="quick-prompts">${tickets.map((_,i)=>`<button type="button" data-ticket="${i}">${['Duplicate charge','Damaged delivery','Wholesale lead'][i]}</button>`).join('')}</div><label for="business">Business name for the draft</label><input id="business" value="Northstar Goods" maxlength="60"><p class="form-error" role="alert"></p><button type="submit" class="button">Sort this enquiry <span>↗</span></button><p class="fine-print">A suggested queue and a template reply for you to review. No inbox connection and no messages sent.</p></form>`;
  input.querySelector('#ticket').value=tickets[0];
  input.querySelector('.reset').onclick=()=>{input.querySelector('#ticket').value=tickets[0];input.querySelector('#business').value='Northstar Goods';notify('Sample restored. Sort it again to refresh the result.');};
  input.querySelectorAll('[data-ticket]').forEach(b=>b.onclick=()=>{input.querySelector('#ticket').value=tickets[Number(b.dataset.ticket)];});
  input.querySelector('form').onsubmit=e=>{e.preventDefault();run(e.target,async current=>{
    const text=input.querySelector('#ticket').value.trim();if(!text)throw new Error('Enter a customer message first.');
    const {results,usedMode}=await ranked(text,queues,p=>p.text);
    if(!current())return;
    const top=results[0],gap=top.score-results[1].score;
    const uncertain=top.score<(usedMode==='ai'?0.25:0.09)||gap<(usedMode==='ai'?0.025:0.02);
    const queue=uncertain?{name:'Manual review',question:'Could you share a little more detail about what you need help with?',action:'Read the request and choose the right support queue.'}:top.item;
    const urgency=priority(text);
    const reply=draftReply(queue).replace('Support team',`${input.querySelector('#business').value.trim()||'Support'} team`);
    document.querySelector('#result').innerHTML=resultHeader('A suggested next step.',usedMode)+`<div class="routing"><div><span class="eyebrow">SUGGESTED QUEUE</span><h3>${h(queue.name)}</h3><span class="fine-print">${uncertain?'Weak or closely tied matches — ask a person.':scoreLabel(top.score,usedMode)}</span></div><div><span class="eyebrow">RULE-BASED PRIORITY</span><h3>${urgency.label}</h3><span class="fine-print">${urgency.reason}</span></div></div><details><summary>Inspect the category matches</summary><div class="matches">${results.map(r=>`<div><span>${r.item.name}</span><span>${scoreLabel(r.score,usedMode)}</span></div>`).join('')}</div><p class="fine-print">Scores describe similarity or overlap, not confidence percentages. Routes are suggested by comparison with short category examples.</p></details><label for="reply">Reply draft <span class="fine-print">· Template · Editable</span></label><textarea id="reply" rows="10"></textarea><div class="result-actions"><button class="button secondary" id="copy-reply">Copy draft</button>${exportButton()}</div><p class="fine-print">Review the facts and applicable policy before sending this yourself.</p>`;
    document.querySelector('#reply').value=reply;
    lastExport={demo:'inbox',mode:usedMode,input:text,suggestedQueue:queue.name,priority:urgency,rankings:results.map(r=>({queue:r.item.name,score:r.score})),draft:reply,draftMethod:'Template, editable by user; not generated by a language model.'};
    document.querySelector('#reply').oninput=e=>{lastExport.draft=e.target.value;};
    document.querySelector('#copy-reply').onclick=async()=>{try{await navigator.clipboard.writeText(document.querySelector('#reply').value);notify('Draft copied. Nothing has been sent.');}catch{notify('Copy is unavailable. Select the draft and copy it manually.');}};
    installExport();
  });};
}
function catalogUI(){
  const input=document.querySelector('#inputs');
  input.innerHTML=`${controls('WHAT YOU NEED')}<form><label for="need">Describe the use, not just the item</label><textarea id="need" rows="4" maxlength="500" required>I need something to block out office noise while I work.</textarea><div class="quick-prompts"><button type="button" data-need="A useful present for someone who loves slow morning coffee">A coffee lover's gift</button><button type="button" data-need="Keep my phone alive on a long train journey">A long train ride</button></div><div class="filter-row"><div><label for="category">Category</label><select id="category"><option value="all">All categories</option>${[...new Set(products.map(p=>p.category))].map(c=>`<option>${c}</option>`).join('')}</select></div><div><label for="budget">Maximum price (USD)</label><input id="budget" type="number" min="0" max="9999" value="100" required></div></div><p class="form-error" role="alert"></p><button class="button" type="submit">Find my matches <span>↗</span></button><p class="fine-print">Eight fictional products. The budget and category are strict filters. Prices are for demonstration only.</p><details class="catalog-list"><summary>Explore the sample catalog</summary>${products.map(p=>`<div><span>${p.name}</span><span>$${p.price}</span></div>`).join('')}</details></form>`;
  input.querySelector('.reset').onclick=()=>{input.querySelector('#need').value='I need something to block out office noise while I work.';input.querySelector('#category').value='all';input.querySelector('#budget').value=100;notify('Sample restored. Search again to refresh the results.');};
  input.querySelectorAll('[data-need]').forEach(b=>b.onclick=()=>{input.querySelector('#need').value=b.dataset.need;});
  input.querySelector('form').onsubmit=e=>{e.preventDefault();run(e.target,async current=>{
    const query=input.querySelector('#need').value.trim(),budget=Number(input.querySelector('#budget').value),category=input.querySelector('#category').value;
    if(!query)throw new Error('Describe what you need first.');
    if(!Number.isFinite(budget)||budget<0)throw new Error('Enter a valid maximum price.');
    const candidates=shortlistProducts(category,budget);
    const {results,usedMode}=candidates.length?await ranked(query,candidates,p=>p.name+'. '+p.text):{results:[],usedMode:mode};
    if(!current())return;
    const matches=results.filter(r=>r.score >= (usedMode==='ai'?0.20:0.05)).slice(0,3);
    document.querySelector('#result').innerHTML=resultHeader(matches.length?'A few things that fit.':'No close matches this time.',usedMode)+`<p class="result-explainer">${matches.length?`Ranked from ${candidates.length} products within your filters. See the description to decide if each one meets your needs.`:candidates.length?'Try a different description. These products may not cover your need.':'No products fit your price and category. Try widening the filters.'}</p><div class="product-results">${matches.map((r,i)=>`<article class="product-result"><div class="product-thumb ${r.item.color}">${icon(r.item.icon)}</div><div><span class="eyebrow">${i===0?'CLOSEST MATCH':`MATCH ${i+1}`} / ${r.item.category.toUpperCase()}</span><div class="product-name"><h3>${r.item.name}</h3><strong>$${r.item.price}</strong></div><p>${r.item.text}</p><span class="match-score">${scoreLabel(r.score,usedMode)}</span></div></article>`).join('')}</div>${exportButton()}<p class="fine-print">Ranking method: ${usedMode==='ai'?'MiniLM sentence embeddings and cosine similarity.':'Shared meaningful words between your query and each description.'} The score is not a recommendation confidence.</p>`;
    lastExport={demo:'catalog',mode:usedMode,query,filters:{category,budgetUSD:budget},matches:matches.map(r=>({product:r.item,score:r.score}))};installExport();
  });};
}
function route(){
  if(location.hash==='#main'){main.focus();return;}
  generation++;lastExport=null;
  const hash=location.hash.slice(1),p=projects.find(p=>p.id===hash);
  if(p){workspace(p);document.title=`${p.name} — Rahul AI Lab`;window.scrollTo(0,0);}
  else {home();document.title='Rahul AI Lab — Small demos. Real possibilities.';if(hash==='projects'||hash==='about')document.getElementById(hash)?.scrollIntoView();else window.scrollTo(0,0);}
}
window.addEventListener('hashchange',route);route();
