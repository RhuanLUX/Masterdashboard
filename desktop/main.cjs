const {app,BrowserWindow,protocol,net,ipcMain,shell,dialog,screen}=require('electron');
const path=require('node:path'),{pathToFileURL}=require('node:url');
const {CampaignStore}=require('./store.cjs');
const runtime=global.RPG_APP_CONTEXT;
protocol.registerSchemesAsPrivileged([{scheme:'rpg',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true,allowServiceWorkers:true}}]);
// QA profiles are explicit command-line arguments; normal installs always use userData.
let main,store,closing=false,closeRequested=false,quitRequested=false,restartRequested=false;
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
  main.on('close',e=>{if(closing)return;e.preventDefault();if(closeRequested)return;closeRequested=true;main.webContents.send('campaign:closing');setTimeout(async()=>{if(!closing&&closeRequested){closeRequested=false;quitRequested=false;restartRequested=false;await dialog.showMessageBox(main,{type:'error',message:'A gravação ainda não foi confirmada.',detail:'Exporte um backup ou aguarde e tente fechar novamente.'})}},12000).unref()});
  main.on('closed',()=>{main=null;for(const w of BrowserWindow.getAllWindows())w.close()});
  await main.loadURL('rpg://app/index.html');
}
{
 app.on('before-quit',()=>{quitRequested=true});
 app.on('second-instance',()=>{if(main){if(main.isMinimized())main.restore();main.focus()}});
 app.whenReady().then(async()=>{
  const root=runtime.root;
  protocol.handle('rpg',request=>{try{const u=new URL(request.url);if(u.hostname!=='app')return new Response('Forbidden',{status:403});const relative=decodeURIComponent(u.pathname).replace(/^\/+/, '')||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||/^(desktop|node_modules)([\\/]|$)/.test(relative))return new Response('Forbidden',{status:403});return net.fetch(pathToFileURL(file).href)}catch(_){return new Response('Not found',{status:404})}});
  store=new CampaignStore(path.join(app.getPath('userData'),'campaign'));
  runtime.updates.notify=status=>main?.webContents.send('updates:status',status);
  bindIPC('updates:status',()=>({...runtime.updates.status,platform:process.platform,arch:process.arch,restored:runtime.restored}));
  bindIPC('updates:check',()=>runtime.updates.check(true));
  bindIPC('updates:automatic',value=>runtime.updates.setAutomatic(value));
  bindIPC('updates:ready',()=>{runtime.markHealthy();return true});
  bindIPC('updates:restart',()=>{
    if(runtime.updates.status.phase!=='ready')throw Error('Nenhuma atualização pronta.');
    restartRequested=true;quitRequested=true;main.close();return true;
  });
  bindIPC('updates:release',()=>shell.openExternal(runtime.updates.status.releasePage));
  bindIPC('campaign:load',()=>store.load());bindIPC('campaign:save',(x,options)=>store.save(x,{forceBackup:options?.forceBackup===true}));bindIPC('campaign:list',()=>store.list());bindIPC('campaign:recovery',id=>store.readRecovery(id));bindIPC('campaign:location',()=>store.directory);
  bindIPC('session:displays',()=>screen.getAllDisplays().map((d,i)=>({id:d.id,label:d.label||'Monitor '+(i+1),width:d.workArea.width,height:d.workArea.height})));
  bindIPC('session:place',(role,displayId)=>{
    if(role!=='tv')throw Error('Janela inválida.');
    const display=screen.getAllDisplays().find(d=>d.id===displayId);if(!display)throw Error('Monitor desconectado.');
    const pathname='/battle-display.html';
    const win=BrowserWindow.getAllWindows().find(w=>{try{const u=new URL(w.webContents.getURL());return u.protocol==='rpg:'&&u.hostname==='app'&&u.pathname===pathname}catch(_){return false}});
    if(!win)throw Error('Abra esta janela antes de escolher o monitor.');
    if(win.isFullScreen())win.setFullScreen(false);win.setBounds(display.workArea);win.show();return true;
  });
  bindIPC('campaign:closed',async ok=>{closeRequested=false;if(ok){await store.chain;closing=true;if(restartRequested)app.relaunch();if(quitRequested)app.quit();else main.close()}else{quitRequested=false;restartRequested=false;await dialog.showMessageBox(main,{type:'error',message:'Não foi possível salvar. Exporte um backup antes de sair.'})}});
  await createWindow();
  setTimeout(()=>runtime.updates.check(),8000).unref();
  setInterval(()=>runtime.updates.check(),6*60*60*1000).unref();
 });
 app.on('activate',()=>{if(!main){closing=false;quitRequested=false;createWindow()}});
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
}
