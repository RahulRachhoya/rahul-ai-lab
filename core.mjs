export const handbook = `# Shipping
Standard delivery takes 5–7 business days. Express delivery takes 2–3 business days. Orders placed after 2 pm are processed the next business day. Shipping is free on orders above $75.

# Returns
Unused products can be returned within 30 days of delivery in their original packaging. To start a return, contact support with your order number. Final-sale items cannot be returned.

# Refunds
After a returned item passes inspection, refunds are sent to the original payment method within 5–10 business days. Original express shipping charges are non-refundable.

# Damaged orders
If an item arrives damaged, contact support within 48 hours of delivery. Include the order number and photographs of the item and packaging. Support will review the evidence before arranging a replacement.

# Account access
Use the Forgot password link to reset your password. The reset link expires after 30 minutes. If you cannot receive the email, check your spam folder and then contact support.

# Wholesale enquiries
Wholesale orders start at 25 units. Contact the partnerships team with the product, quantity, and delivery location. Custom pricing and delivery dates require a written quote.`;

export const products = [
  {id:'p01', name:'Weekender Carryall', category:'Travel', price:68, icon:'bag', color:'sand', text:'A lightweight overnight duffel bag for weekend trips. Fits clothes, a water bottle and travel essentials. Water-resistant canvas, adjustable shoulder strap, 32 litre capacity.'},
  {id:'p02', name:'Quiet Focus Headphones', category:'Tech', price:89, icon:'headphones', color:'sage', text:'Wireless over-ear noise-cancelling headphones for deep work, video calls and a busy office. Soft ear cushions, built-in microphone, 30 hour battery.'},
  {id:'p03', name:'Daily Trail Bottle', category:'Outdoors', price:24, icon:'bottle', color:'peach', text:'Insulated stainless steel water bottle for hiking, the gym and daily hydration. Leak-proof lid, 750 ml capacity, keeps drinks cold.'},
  {id:'p04', name:'Cloud Desk Lamp', category:'Home', price:42, icon:'lamp', color:'sage', text:'An adjustable warm LED desk lamp for reading and working late. Dimmable light, compact base and a soft glow for a comfortable home office.'},
  {id:'p05', name:'Pocket Power Bank', category:'Tech', price:35, icon:'battery', color:'sand', text:'Portable USB-C phone charger with 10000 mAh battery capacity. Small enough for a pocket. Keeps your phone charged on commutes and travel.'},
  {id:'p06', name:'Field Notes Set', category:'Stationery', price:16, icon:'book', color:'peach', text:'Three pocket notebooks with dotted pages for journaling, planning, sketching and capturing ideas. Recycled paper and a durable soft cover.'},
  {id:'p07', name:'Roam Laptop Backpack', category:'Travel', price:74, icon:'bag', color:'sage', text:'A commuter backpack with a padded 15 inch laptop sleeve, organized pockets and rain-resistant fabric. Comfortable for cycling to work and city travel.'},
  {id:'p08', name:'Sunday Pour-over Kit', category:'Home', price:38, icon:'cup', color:'sand', text:'A ceramic pour-over coffee dripper with reusable steel filter and matching mug. A slow morning coffee ritual and a thoughtful gift for coffee lovers.'}
];

export const queues = [
  {id:'billing', name:'Billing & refunds', text:'I was charged twice. Please refund my payment. My invoice or bill is incorrect. The refund has not arrived.', question:'Could you share the order reference and the charge or refund date? Please omit card details.', action:'Review the payment record before confirming any refund.'},
  {id:'delivery', name:'Delivery & orders', text:'My package is late, missing or damaged. Track my delivery shipment. My order arrived broken. Where is my parcel?', question:'Could you share your order reference and expected delivery date?', action:'Check the shipment status and applicable delivery policy.'},
  {id:'account', name:'Account access', text:'I cannot log in to my account. I forgot my password. The password reset email is missing. My account is locked.', question:'Which sign-in step fails, and what error message appears? Please do not share your password.', action:'Review the sign-in issue and approved recovery procedure.'},
  {id:'sales', name:'Sales & partnerships', text:'I want to buy in bulk. Can I get a wholesale quote for my company? Partnership enquiry. Pricing for multiple units.', question:'Which products, quantity and delivery location should the quote cover?', action:'Prepare a quote for human review.'},
  {id:'feedback', name:'Product feedback', text:'I love this product. Here is a suggestion to improve a feature. I would like a different colour or size. Product review and general feedback.', question:'Is there a particular product or feature you would like us to focus on?', action:'Share the feedback with the product team after review.'}
];
export const tickets = [
  'My card was charged twice for order #1042 yesterday. Please help me get the duplicate payment back.',
  'The package arrived today, but the ceramic mug is broken. I have photos of the packaging.',
  'We are opening a small café and would like a quote for 40 pour-over kits.'
];

const stop = new Set('a an the and or is are was were i me my we our you your it its to for of in on at by with this that can could do does how what when where please'.split(' '));
export function tokens(text) { return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(t => t.length > 1 && !stop.has(t)).map(t => t.length > 4 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0,-1) : t); }
export function lexicalScore(query, text) {
  const q = new Set(tokens(query)), t = new Set(tokens(text));
  if (!q.size) return 0;
  return [...q].filter(w => t.has(w)).length / q.size;
}
export function dot(a,b) {
  if (a.length !== b.length || !a.length) throw new Error('Vector sizes must match.');
  return a.reduce((s,v,i) => s + v*b[i],0);
}
export function rank(query, items, textOf, vectors) {
  return items.map((item,i) => ({item, score:vectors ? dot(vectors[0], vectors[i+1]) : item.title ? 0.8*lexicalScore(query,textOf(item))+0.2*lexicalScore(query,item.title) : lexicalScore(query,textOf(item))}))
    .sort((a,b) => b.score - a.score);
}
export function chunkDocument(text) {
  if (text.length > 16000) throw new Error('Keep the document under 16,000 characters.');
  let section = 'Document', parts = [], number = 0;
  for (const block of text.trim().split(/\n\s*\n/)) {
    const lines = block.split('\n');
    if (/^#{1,6}\s/.test(lines[0])) section = lines.shift().replace(/^#{1,6}\s+/, '').slice(0,120);
    const content = lines.join(' ').trim();
    if (!content) continue;
    // Keep passages within the embedding model's practical context. Never drop a remainder.
    const sentences = content.match(/[^.!?]+[.!?]*(?:\s|$)/g) || [content];
    let chunk = '';
    const flush = () => { if(chunk.trim()) parts.push({id:++number, title:section, text:chunk.trim()}); chunk=''; };
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      for(let i=0; i<words.length; i+=70) {
        const piece=words.slice(i,i+70).join(' ');
        if ((chunk+' '+piece).length > 600) flush();
        chunk += ' '+piece;
      }
    }
    flush();
  }
  return parts;
}
export function priority(text) {
  const urgent = /\b(urgent|asap|immediately|locked out|cannot log in|can't log in)\b/i;
  const elevated = /\b(broken|damaged|charged twice|duplicate payment|missing|late)\b/i;
  return urgent.test(text) ? {label:'High', reason:'The text matches an explicit urgency or access keyword.'} :
    elevated.test(text) ? {label:'Review soon', reason:'The text matches a damage, payment or delivery issue keyword.'} :
    {label:'Normal', reason:'No configured urgency keyword was found. A person should check the context.'};
}
export function draftReply(queue) {
  return `Hi,\n\nThanks for getting in touch. We have received your request and will review it.\n\n${queue.question}\n\nOur next step is to ${queue.action.charAt(0).toLowerCase()+queue.action.slice(1)}\n\nBest,\nSupport team`;
}
export function shortlistProducts(category, budget) {
  return products.filter(p => (category === 'all' || p.category === category) && p.price <= budget);
}
export function escapeHtml(value) { return String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
