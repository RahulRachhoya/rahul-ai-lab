import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const files=new Set(['index.html','styles.css','app.mjs','core.mjs','ai-worker.mjs','favicon.svg']);
const types={html:'text/html',css:'text/css',mjs:'text/javascript',svg:'image/svg+xml'};
const port=Number(process.env.PORT||4174);
createServer(async(req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/rahul-ai-lab/,'');}catch{res.writeHead(400);return res.end();}
  const file=pathname==='/'?'index.html':pathname.slice(1);
  if(!files.has(file)){res.writeHead(404);return res.end('Not found');}
  try{const bytes=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':`${types[file.split('.').pop()]}; charset=utf-8`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(bytes);}
  catch{res.writeHead(500);res.end('Could not read asset');}
}).listen(port,'127.0.0.1',()=>console.log(`Demo preview: http://127.0.0.1:${port}/rahul-ai-lab/`));
