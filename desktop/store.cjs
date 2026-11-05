const fs = require('node:fs/promises');
const path = require('node:path');
const {validateBackup} = require('../js/platform-data.js');
class CampaignStore {
  constructor(directory) {this.directory=directory;this.file=path.join(directory,'campaign.json');this.backups=path.join(directory,'backups');this.chain=Promise.resolve();this.lastBackup=0;}
  async list(){await fs.mkdir(this.backups,{recursive:true});return (await fs.readdir(this.backups)).filter(n=>/^\d+-[a-f0-9-]+\.json$/.test(n)).sort().reverse().map(id=>({id,date:new Date(Number(id.split('-')[0])).toISOString()}))}
  async readRecovery(id){if(!/^\d+-[a-f0-9-]+\.json$/.test(id))throw Error('Backup inválido.');return validateBackup(JSON.parse(await fs.readFile(path.join(this.backups,id),'utf8')))}
  async load(){
    try{return validateBackup(JSON.parse(await fs.readFile(this.file,'utf8')))}catch(e){
      if(e.code==='ENOENT')return null;
      for(const item of await this.list())try{const restored=await this.readRecovery(item.id);this.recovering=true;return {...restored,recovered:true}}catch(_){}
      throw Error('A campanha não pôde ser lida. O arquivo foi preservado; restaure um backup.');
    }
  }
  save(value,options={}){validateBackup(value);const text=JSON.stringify(value);if(Buffer.byteLength(text)>512*1024*1024)throw Error('Campanha maior que 512 MB.');const job=this.chain.catch(()=>{}).then(async()=>{
    await fs.mkdir(this.backups,{recursive:true});
    if(this.recovering){await fs.rename(this.file,path.join(this.directory,'campaign-corrupt-'+Date.now()+'.json'));this.recovering=false;}
    if(options.forceBackup||Date.now()-this.lastBackup>600000){try{const old=await fs.readFile(this.file,'utf8');validateBackup(JSON.parse(old));const name=Date.now()+'-'+require('node:crypto').randomUUID()+'.json';await fs.writeFile(path.join(this.backups,name),old,{flag:'wx'});this.lastBackup=Date.now();for(const x of (await this.list()).slice(10))await fs.unlink(path.join(this.backups,x.id));}catch(e){if(e.code!=='ENOENT')throw e}}
    const temp=this.file+'.tmp';const handle=await fs.open(temp,'w');try{await handle.writeFile(text,'utf8');await handle.sync()}finally{await handle.close()}
    await fs.rename(temp,this.file);return true;
  });this.chain=job;return job}
}
module.exports={CampaignStore};
