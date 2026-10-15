/* Actual offline 3D dice regression; isolated browser storage, never user data. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-v3.2.3/dice'),url='http://127.0.0.1:43995';
async function run(){
 fs.mkdirSync(out,{recursive:true});const server=spawn(process.execPath,['js/offline-server.mjs','43995'],{cwd:root,windowsHide:true});let browser;
 try{
  await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j)});
  browser=await chromium.launch({executablePath:process.env.ARENA_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[],rolls=[],externalRequests=[];
  await context.route('**/*',route=>{const u=route.request().url();if(u.startsWith(url)||u.startsWith('data:')||u.startsWith('blob:'))return route.continue();externalRequests.push(u);return route.abort()});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('[data-enter-adventure]').click();await page.locator('[data-view="dice"]').click();
  await page.waitForSelector('#dice-3d-stage[data-dice-ready="true"]',{timeout:60000});
  async function roll(button){
   const previous=await page.evaluate(()=>RPGMasterHost.getState().diceHistory[0]?.at||0);
   await page.locator(button).click();
   await page.waitForFunction(at=>RPGMasterHost.getState().diceHistory[0]?.at>at,previous,{timeout:90000});
   const record=await page.evaluate(()=>RPGMasterHost.getState().diceHistory[0]);assert.equal(record.total,record.roll+record.bonus);
   assert((await page.locator('#dice-history').innerText()).includes(String(record.total)));rolls.push(record);return record;
  }
  for(const sides of [4,6,8,10,12,20,100]){
   await page.locator(`[data-die="${sides}"]`).click();await page.waitForSelector('#dice-3d-stage[data-dice-ready="true"]');
   assert(await page.locator('#dice-3d-stage canvas').count());await page.locator('#dice-bonus').fill(sides===100?'-2':'2');
   const r=await roll('#roll-dice');assert(r.roll>=1&&r.roll<=sides);
   if(sides===100){assert(await page.locator('#d100-legend').isVisible());assert(r.historyDetail.includes('d100'));}
  }
  await page.locator('#dice-formula').fill('1d100 + 1d6 + 1d8');await page.locator('#dice-bonus').fill('3');
  const mixed=await roll('#roll-formula');assert(mixed.roll>=3&&mixed.roll<=114);assert(mixed.historyDetail.includes('d100')&&mixed.historyDetail.includes('d6')&&mixed.historyDetail.includes('d8'));
  await page.screenshot({path:path.join(out,'physical-mixed-dice.png'),fullPage:true});assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({rolls,errors,externalRequests,networkRestrictedToLocalhost:true},null,2));console.log(JSON.stringify({rolls:rolls.length,errors,externalRequests}));
 }finally{await browser?.close();server.kill();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
