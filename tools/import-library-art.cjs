/* Copy the user-supplied artwork into portable, lightweight local assets.
 * Usage: node tools/import-library-art.cjs <art_generated-directory>
 * No image retouching, cropping, remote requests or source-file changes. */
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
global.window=global;require('../data/library-expansion.js');
const sourceDir=process.argv[2];if(!sourceDir)throw Error('Informe a pasta art_generated.');
const root=path.resolve(__dirname,'..'),pack=RPG_LIBRARY_EXPANSION;
(async()=>{
  const files=[...new Set([...pack.classes,...pack.entities].map(x=>x.image))],assets=[];
  fs.mkdirSync(path.join(root,'assets/library-expansion'),{recursive:true});
  for(const asset of files){
    const stem=path.basename(asset,'.webp'),source=[stem+'_art1.png',stem+'_extra1.png'].find(f=>fs.existsSync(path.join(sourceDir,f)));
    if(!source)throw Error('Ilustração ausente: '+stem);
    await sharp(path.join(sourceDir,source)).resize({width:768,height:768,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toFile(path.join(root,asset));
    assets.push({asset,source,operation:'Redução proporcional e codificação WebP; sem recorte nem retoque.'});
  }
  fs.writeFileSync(path.join(root,'assets/library-expansion/MANIFEST.json'),JSON.stringify({source:'Acervo art_generated fornecido pelo mestre, projeto Reconstrucao_PHB_2024',license:'Acervo fornecido pelo usuário; não se declara licença aberta para estas ilustrações.',assets},null,2)+'\n');
  console.log({entities:pack.entities.length,classes:pack.classes.length,subclasses:pack.classes.reduce((n,c)=>n+c.subclasses.length,0),spells:pack.spells.length,images:assets.length,bytes:assets.reduce((n,x)=>n+fs.statSync(path.join(root,x.asset)).size,0)});
})().catch(e=>{console.error(e);process.exitCode=1});
