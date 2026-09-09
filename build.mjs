import {mkdir,copyFile} from 'node:fs/promises';
const files=['index.html','styles.css','app.mjs','core.mjs','ai-worker.mjs','favicon.svg'];
await mkdir('dist',{recursive:true});
await Promise.all(files.map(f=>copyFile(f,`dist/${f}`)));
console.log(`Prepared ${files.length} public assets in dist/.`);
