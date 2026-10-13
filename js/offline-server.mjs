/* Servidor estático mínimo para o modo offline.
   Necessário porque módulos ES, WebAssembly e workers não são confiáveis em file://. */
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname,extname,join,normalize,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.wasm':'application/wasm','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{
  const pathName=decodeURIComponent((req.url||'/').split('?')[0]);
  const relative=pathName==='/'?'index.html':pathName.replace(/^[/\\]+/,'');
  const file=resolve(root,normalize(relative));
  if(!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return}
  try{const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch(_){res.writeHead(404);res.end('Not found')}
});
const requestedPort=Number(process.argv.find(value=>/^\d+$/.test(value)))||41731;
server.listen(requestedPort,'127.0.0.1',()=>console.log(`RPG Master offline em http://127.0.0.1:${requestedPort}/`));
