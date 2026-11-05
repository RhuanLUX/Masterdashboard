const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'../vendor/import');fs.mkdirSync(out,{recursive:true});
function dir(pkg){return path.dirname(require.resolve(pkg+'/package.json'))}
function copy(pkg,from,to=from){const src=path.join(dir(pkg),from),dest=path.join(out,to);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(src,dest,{recursive:true})}
copy('mammoth','mammoth.browser.min.js');copy('mammoth','LICENSE','licenses/mammoth.txt');
copy('pdfjs-dist','build/pdf.mjs','pdf/pdf.mjs');copy('pdfjs-dist','build/pdf.worker.mjs','pdf/pdf.worker.mjs');
for(const name of ['cmaps','standard_fonts','wasm'])copy('pdfjs-dist',name,'pdf/'+name);
copy('pdfjs-dist','LICENSE','licenses/pdfjs.txt');
copy('tesseract.js','dist/tesseract.min.js','ocr/tesseract.min.js');copy('tesseract.js','dist/worker.min.js','ocr/worker.min.js');copy('tesseract.js','LICENSE.md','licenses/tesseract.txt');
for(const file of fs.readdirSync(dir('tesseract.js-core')).filter(n=>/\.wasm(\.js)?$/.test(n)))copy('tesseract.js-core',file,'ocr/core/'+file);
copy('tesseract.js-core','LICENSE','licenses/tesseract-core.txt');
for(const lang of ['por','eng']){copy('@tesseract.js-data/'+lang,'4.0.0_best_int/'+lang+'.traineddata.gz','ocr/lang/'+lang+'.traineddata.gz')}
console.log('Importadores e OCR copiados para vendor/import — execução inteiramente local.');
