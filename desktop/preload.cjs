const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('RPGDesktop',{
  load:()=>ipcRenderer.invoke('campaign:load'),
  save:(value,options)=>ipcRenderer.invoke('campaign:save',value,options),
  recoveries:()=>ipcRenderer.invoke('campaign:list'),
  recovery:id=>ipcRenderer.invoke('campaign:recovery',id),
  location:()=>ipcRenderer.invoke('campaign:location'),
  onBeforeClose:callback=>ipcRenderer.on('campaign:closing',()=>callback()),
  closed:ok=>ipcRenderer.invoke('campaign:closed',ok)
});
