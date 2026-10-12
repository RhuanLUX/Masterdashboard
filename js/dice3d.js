/* Mesa física local — adaptador mínimo para @3d-dice/dice-box (MIT).
   O módulo e todos os seus modelos/Ammo ficam em vendor/, sem CDN. */
import DiceBox from '../vendor/dice-box/package/dist/dice-box.es.js';

let box=null;

function activeHost(){return document.querySelector('#dice-3d-stage')}

export async function mountDiceTable({onDieComplete,onRollComplete}={}){
  const host=activeHost();
  if(!host) return null;
  if(box?.canvas?.isConnected) return box;
  box=new DiceBox({
    container:'#dice-3d-stage',
    assetPath:'vendor/dice-box/package/dist/assets/',
    /* O worker de física nasce de um Blob; portanto ele precisa de URL absoluta
       para localizar o WASM e não pode depender de caminho relativo do Blob. */
    origin:`${window.location.origin}/`,
    offscreen:false,
    enableShadows:true,
    shadowTransparency:.58,
    lightIntensity:1.18,
    scale:6,
    theme:'default',
    themeColor:'#9d6b32',
    onDieComplete:die=>onDieComplete?.(die),
    onRollComplete:results=>onRollComplete?.(results)
  });
  await box.init();
  host.querySelector('.dice-loading')?.remove();
  host.dataset.diceReady='true';
  return box;
}

export async function throwPhysicalDice(dice){
  if(!box) throw new Error('Mesa física ainda não foi inicializada.');
  let items=Array.isArray(dice)?dice:[{sides:Number(dice),count:1}],notation=[];
  /* Cada elemento é deliberadamente separado: assim o resultado físico
     conserva a ordem lógica, inclusive no d100 (percentual + unidade). */
  items.forEach(({sides,count})=>{for(let n=0;n<count;n++){
    if(Number(sides)===100)notation.push('1d100','1d10');
    else notation.push(`1d${Number(sides)}`);
  }});
  return box.roll(notation);
}

export function clearPhysicalDice(){box?.clear()}
