const {app,BrowserWindow,protocol,net,ipcMain,shell,dialog}=require('electron');
const path=require('node:path'),{pathToFileURL}=require('node:url');
const {CampaignStore}=require('./store.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'rpg',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true,allowServiceWorkers:true}}]);
// QA profiles are explicit command-line arguments; normal installs always use userData.
const qaProfile=process.argv.find(a=>a.startsWith('--rpg-profile='));
if(qaProfile)app.setPath('userData',path.resolve(qaProfile.slice(14)));
const gotLock=app.requestSingleInstanceLock();
if(!gotLock)app.quit();
let main,store,closing=false,closeRequested=false,quitRequested=false;
function isMain(event){if(event.sender!==main?.webContents||event.senderFrame!==main.webContents.mainFrame||!event.senderFrame.url.startsWith('rpg://app/index.html'))throw Error('Acesso restrito à janela do mestre.')}
function bindIPC(name,fn){ipcMain.handle(name,(event,...args)=>{isMain(event);return fn(...args)})}
function configureWindow(win){
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('rpg://app/')){e.preventDefault();if(/^https?:\/\//.test(url))shell.openExternal(url)}});
  win.webContents.setWindowOpenHandler(({url})=>{
    if(url.startsWith('rpg://app/')||url==='about:blank')return {action:'allow',overrideBrowserWindowOptions:{autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,preload:undefined}}};
    if(/^https?:\/\//.test(url))shell.openExternal(url);return {action:'deny'};
  });
  win.webContents.on('did-create-window',configureWindow);
}
async function createWindow(){
  main=new BrowserWindow({width:1440,height:920,minWidth:800,minHeight:600,backgroundColor:'#050c15',title:'RPG Master',autoHideMenuBar:true,show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  configureWindow(main);main.once('ready-to-show',()=>main.show());
  main.on('close',e=>{if(closing)return;e.preventDefault();if(closeRequested)return;closeRequested=true;main.webContents.send('campaign:closing');setTimeout(async()=>{if(!closing&&closeRequested){closeRequested=false;quitRequested=false;await dialog.showMessageBox(main,{type:'error',message:'A gravação ainda não foi confirmada.',detail:'Exporte um backup ou aguarde e tente fechar novamente.'})}},12000).unref()});
  main.on('closed',()=>{main=null;for(const w of BrowserWindow.getAllWindows())w.close()});
  await main.loadURL('rpg://app/index.html');
}
if(gotLock){
 app.on('before-quit',()=>{quitRequested=true});
 app.on('second-instance',()=>{if(main){if(main.isMinimized())main.restore();main.focus()}});
 app.whenReady().then(async()=>{
  const root=app.getAppPath();
  protocol.handle('rpg',request=>{try{const u=new URL(request.url);if(u.hostname!=='app')return new Response('Forbidden',{status:403});const relative=decodeURIComponent(u.pathname).replace(/^\/+/, '')||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||/^(desktop|node_modules)([\\/]|$)/.test(relative))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(file).href)}catch(_){return new Response('Not found',{status:404})}});
  store=new CampaignStore(path.join(app.getPath('userData'),'campaign'));
  bindIPC('campaign:load',()=>store.load());bindIPC('campaign:save',(x,options)=>store.save(x,{forceBackup:options?.forceBackup===true}));bindIPC('campaign:list',()=>store.list());bindIPC('campaign:recovery',id=>store.readRecovery(id));bindIPC('campaign:location',()=>store.directory);
  bindIPC('campaign:closed',async ok=>{closeRequested=false;if(ok){await store.chain;closing=true;if(quitRequested)app.quit();else main.close()}else{quitRequested=false;await dialog.showMessageBox(main,{type:'error',message:'Não foi possível salvar. Exporte um backup antes de sair.'})}});
  await createWindow();
 });
 app.on('activate',()=>{if(!main){closing=false;quitRequested=false;createWindow()}});
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
}
