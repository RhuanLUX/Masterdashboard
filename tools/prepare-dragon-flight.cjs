/* Extract only the east-facing flight row. No stretching, masks or neighboring frames. */
const sharp=require('sharp'),path=require('node:path');
const folder=path.resolve(__dirname,'../assets/themes/dragon-flight');
(async()=>{for(let i=0;i<3;i++)await sharp(path.join(folder,'golden-source.png')).extract({left:i*144,top:128,width:144,height:128}).png().toFile(path.join(folder,'fly-'+i+'.png'));console.log('DRAGON_FRAMES_READY: 3 individual 144×128 frames')})().catch(e=>{console.error(e);process.exitCode=1});
