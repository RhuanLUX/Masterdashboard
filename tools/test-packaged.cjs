const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),exe=process.platform==='win32'?path.join(root,'dist/win-unpacked/RPG Master.exe'):path.join(root,process.arch==='arm64'?'dist/mac-arm64':'dist/mac','RPG Master.app/Contents/MacOS/RPG Master');
if(!fs.existsSync(exe))throw Error('Packaged application not found: '+exe);
for(const test of ['desktop-smoke.cjs','desktop-import.cjs']){const r=spawnSync(process.execPath,[path.join(root,'tests',test)],{cwd:root,stdio:'inherit',env:{...process.env,RPG_TEST_EXE:exe}});if(r.status!==0)process.exit(r.status||1)}
