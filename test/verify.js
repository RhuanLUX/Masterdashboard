/* Checks that do not require a browser or network. Run: node test/verify.js */
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
for(const file of ['data/story-data.js','data/roster-data.js','data/nando-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const story=ctx.window.FANGORN_STORY, roster=ctx.window.FANGORN_ROSTER, nando=ctx.window.FANGORN_NANDO;
function must(ok,msg){if(!ok)throw Error(msg)}
must(story.blocks.length===1060,'A aventura não contém 1060 blocos');
must(story.headings.length===66,'A aventura não contém 66 títulos');
must(['ATO I','ATO II','ATO III','ATO IV','ATO V','EPÍLOGO','RECOMPENSA'].every(x=>story.headings.some(h=>h.label.includes(x))),'Faltam seções obrigatórias');
must(roster.characters.length===4,'Não há quatro fichas');
must(nando.sheets?.Ficha?.rows?.length===27,'Planilha de Nando incompleta');
must(!/https?:\/\//.test(fs.readFileSync(path.join(root,'index.html'),'utf8')+fs.readFileSync(path.join(root,'js/app.js'),'utf8')),'Há referência de rede no runtime');
for(const [name,hash] of Object.entries({'Aventura 5.docx':'c36e993d16ed7c504c7d32b9cb11bd12b02fb26d80175651b517d60034d19dcf','Anão Caolho de Hirnath.docx':'226ea8ac77edd3b0a9362c72c7206fd6e7a3a686625c4edfb150d8f0e0f4635e','Ficha_Nando.xlsx':'c1ecbd0a40c950ad09427b9e7040c7498fd28fba6b002ce4e8f3b2f7148299cb','Francisco(1).docx':'f06dcf874ec9d85923a0c29da8cef8432b8e392092eedc155f1c4fca07b10cdf','Rodrigo(1).docx':'72a525027bea4662c6d856f0d16457280c54d7f64a99f5fa8802365fe09fbd8b'})){const f=path.join('C:/Users/User/Downloads/RPG_Fangorn_Codex_Handover/RPG_Fangorn_Handover/source',name);if(fs.existsSync(f))must(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')===hash,'Hash divergente: '+name)}
console.log('PASS: dados estruturais, integridade das fontes e isolamento de rede.');
