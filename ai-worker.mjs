let extractor;
let cache = new Map();
const MODEL = 'Xenova/all-MiniLM-L6-v2';
// Serialise requests: one inference session, bounded cache, no server calls with user text.
let chain = Promise.resolve();
self.onmessage = ({data}) => {
  chain = chain.then(async () => {
    try {
      if (!extractor) {
        const {pipeline,env} = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
        env.allowLocalModels = false;
        env.backends.onnx.wasm.numThreads = 1;
        extractor = await pipeline('feature-extraction',MODEL,{
          dtype:'q8', device:'wasm',
          progress_callback: p => self.postMessage({type:'progress',message:p.status==='progress' ? `Downloading ${p.file}: ${Math.round(p.progress || 0)}%` : 'Preparing the language model…'})
        });
      }
      if(data.type === 'load') return self.postMessage({id:data.id,type:'ready'});
      const vectors=[];
      for (const text of data.texts) {
        if(!cache.has(text)) {
          const output = await extractor(text,{pooling:'mean',normalize:true});
          if(cache.size >= 128) cache.delete(cache.keys().next().value);
          cache.set(text,Array.from(output.data));
        }
        vectors.push(cache.get(text));
      }
      self.postMessage({id:data.id,type:'result',vectors});
    } catch(error) {
      self.postMessage({id:data.id,type:'error',message:error.message || 'The AI model could not run.'});
    }
  });
};
