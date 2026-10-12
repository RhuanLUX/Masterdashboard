/* Checks that do not require a browser or network. Run: node test/verify.js */
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
for(const file of ['data/story-data.js','data/roster-data.js','data/nando-data.js','data/v2-content.js','data/campaign-codex.js']) vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const story=ctx.window.FANGORN_STORY, roster=ctx.window.FANGORN_ROSTER, nando=ctx.window.FANGORN_NANDO, v2=ctx.window.RPG_MASTER_V2_CONTENT, codex=ctx.window.RPG_MASTER_CAMPAIGN_CODEX;
function must(ok,msg){if(!ok)throw Error(msg)}
must(story.blocks.length===1060,'A aventura não contém 1060 blocos');
must(story.headings.length===66,'A aventura não contém 66 títulos');
must(['ATO I','ATO II','ATO III','ATO IV','ATO V','EPÍLOGO','RECOMPENSA'].every(x=>story.headings.some(h=>h.label.includes(x))),'Faltam seções obrigatórias');
must(roster.characters.length===4,'Não há quatro fichas');
must(nando.sheets?.Ficha?.rows?.length===27,'Planilha de Nando incompleta');
must(Object.keys(v2.adventures||{}).length===5,'As cinco aventuras V2 não foram carregadas');
must(v2.adventures['Aventura 5.docx'].blocks.length===1060,'Aventura 5 V2 não preserva 1060 blocos');
must(v2.adventures['Aventura 5.docx'].headings.length===66,'Aventura 5 V2 não preserva 66 títulos');
must(Object.keys(v2.rules||{}).length===2,'Compêndio D20 incompleto');
must(Object.keys(v2.documents||{}).length===4,'Biblioteca narrativa incompleta');
must(v2.atlasCities?.headings?.length===5,'Compêndio pesquisável Cidades LOTR incompleto');
must(codex.visualEntries?.length===15,'Biblioteca visual inicial incompleta');
must(codex.creatures?.length===8,'Bestiário inicial incompleto');
must(codex.visualEntries.every(x=>x.id&&x.name&&x.category&&x.origin&&x.image&&x.description&&x.status),'Metadados visuais incompletos');
must(codex.creatures.every(x=>x.id&&x.name&&x.type&&x.image&&x.ac&&x.hp&&x.attack&&x.special),'Fichas resumidas incompletas');
for(const f of ['assets/generated/npcs/alatar.png','assets/generated/npcs/pai-elenya.png','assets/generated/creatures/vigia-de-hrim.png','assets/generated/entities/espectro-das-sombras.png','assets/generated/enemies/uruk-hai.png'])must(fs.existsSync(path.join(root,f)),'Asset gerado ausente: '+f);
must(!/https?:\/\//.test(fs.readFileSync(path.join(root,'index.html'),'utf8')+fs.readFileSync(path.join(root,'js/app.js'),'utf8')),'Há referência de rede no runtime');
for(const [name,hash] of Object.entries({'Aventura 5.docx':'c36e993d16ed7c504c7d32b9cb11bd12b02fb26d80175651b517d60034d19dcf','Anão Caolho de Hirnath.docx':'226ea8ac77edd3b0a9362c72c7206fd6e7a3a686625c4edfb150d8f0e0f4635e','Ficha_Nando.xlsx':'c1ecbd0a40c950ad09427b9e7040c7498fd28fba6b002ce4e8f3b2f7148299cb','Francisco(1).docx':'f06dcf874ec9d85923a0c29da8cef8432b8e392092eedc155f1c4fca07b10cdf','Rodrigo(1).docx':'72a525027bea4662c6d856f0d16457280c54d7f64a99f5fa8802365fe09fbd8b'})){const f=path.join('C:/Users/User/Downloads/RPG_Fangorn_Codex_Handover/RPG_Fangorn_Handover/source',name);if(fs.existsSync(f))must(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')===hash,'Hash divergente: '+name)}
console.log('PASS: dados estruturais, integridade das fontes e isolamento de rede.');
