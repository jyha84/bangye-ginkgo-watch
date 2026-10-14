import {readFileSync,writeFileSync,mkdirSync,rmSync,copyFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const assets={};for(const [name,type] of [['index.html','text/html'],['style.css','text/css'],['app.js','application/javascript'],['directions.js','application/javascript'],['cctv.js','application/javascript'],['studio.js','application/javascript'],['cctv-zoom.js','application/javascript'],['tree3d.js','application/javascript']])assets['/'+name]={body:readFileSync('web/'+name,'utf8'),type:type+'; charset=utf-8'};
assets['/ginkgo-leaf.png']={body:readFileSync('web/ginkgo-leaf.png').toString('base64'),type:'image/png',encoding:'base64'};
writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+readFileSync('worker/index.js','utf8'));copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
const m=await import('data:text/javascript;base64,'+Buffer.from(readFileSync('dist/server/index.js')).toString('base64'));if(typeof m.default?.fetch!=='function')throw new Error('Worker export missing');console.log('Worker build verified');
