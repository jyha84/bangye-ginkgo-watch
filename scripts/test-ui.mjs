import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
class Element{
 constructor(){this.hidden=false;this.attributes={};this.listeners={};this.dataset={};this.disabled=false;}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 emit(name,data={}){const event={preventDefault(){this.prevented=true;},...data};for(const fn of this.listeners[name]??[])fn(event);return event;}
 setAttribute(k,v){this.attributes[k]=v;}
 getAttribute(k){return this.attributes[k]??null;}
 removeAttribute(k){delete this.attributes[k];}
 focus(){this.focused=true;}
 scrollIntoView(){this.scrolled=true;}
 pause(){}load(){}play(){return Promise.resolve();}canPlayType(){return true;}
}
function tabs(hash=''){
 const ids=['tab-live','tab-tree','tab-visit','panel-live','panel-tree','panel-visit','recent','tree-studio','forecast'];const els=Object.fromEntries(ids.map(id=>[id,new Element()]));
 const win=new Element(),doc=new Element(),location={hash},history={pushState(_,__,hash){location.hash=hash;}};let loaded=0;
 win.BangyeLoadTree=()=>loaded++;
 Object.assign(doc,{getElementById:id=>els[id]});
 vm.runInNewContext(readFileSync('web/ui.js','utf8'),{document:doc,window:win,history,location,requestAnimationFrame:fn=>fn(),matchMedia:()=>({matches:true})});
 return {els,win,doc,location,get loaded(){return loaded;}};
}
const t=tabs();assert.equal(t.loaded,0);assert.equal(t.els['panel-live'].hidden,false);assert.equal(t.els['panel-tree'].hidden,true);assert.equal(t.els['tab-live'].attributes['aria-selected'],'true');
t.els['tab-tree'].emit('click');assert.equal(t.location.hash,'#tree');assert.equal(t.loaded,1);assert.equal(t.els['panel-live'].hidden,true);assert.equal(t.els['panel-tree'].hidden,false);assert.equal(t.els['tab-tree'].tabIndex,0);assert.equal(t.els['tab-live'].tabIndex,-1);
t.win.BangyeUI.open('invalid');assert.equal(t.win.BangyeUI.active,'tree');
t.els['tab-tree'].emit('keydown',{key:'End'});assert.equal(t.win.BangyeUI.active,'visit');assert.equal(t.els['tab-visit'].focused,true);
t.els['tab-live'].emit('keydown',{key:'ArrowLeft'});assert.equal(t.win.BangyeUI.active,'visit');
t.location.hash='#live';t.win.emit('popstate');assert.equal(t.win.BangyeUI.active,'live');
const link={getAttribute:()=> '#recent'};t.doc.emit('click',{target:{closest:()=>link}});assert.equal(t.els['panel-visit'].hidden,false);assert.equal(t.els.recent.scrolled,true);
assert.equal(tabs('#tree-studio').win.BangyeUI.active,'tree');assert.equal(tabs('#recent').win.BangyeUI.active,'visit');
// The caption-to-analysis handoff explicitly reveals the destination panel first.
const studio=readFileSync('web/studio.js','utf8');assert.ok(studio.indexOf("window.BangyeUI?.open('tree');stage.scrollIntoView")>=0);
console.log('Tabs verified: visible panel, keyboard focus, URL/history, section links, initial deep links and capture handoff.');
async function camera(response){
 const ids=['cctv-video','cctv-image','cctv-message','cctv-badge','cctv-recovery','cctv-fullscreen','capture-frame','cctv-retry','camera-options','cctv-time','cctv-diagnose','cctv-diagnostic'];const els=Object.fromEntries(ids.map(id=>[id,new Element()]));const panel=new Element(),win=new Element();
 const ctx={document:{getElementById:id=>els[id],querySelector:()=>panel},window:win,fetch:async()=>({ok:response.ok,json:async()=>response}),AbortController,setTimeout:()=>1,clearTimeout:()=>{},Intl,Date,Error};
 vm.runInNewContext(readFileSync('web/cctv.js','utf8'),ctx);
 assert.equal(els['cctv-recovery'].hidden,true,'Loading does not show an error CTA');
 await new Promise(setImmediate);return {els,panel};
}
const good=await camera({ok:true,checkedAt:new Date().toISOString(),cameras:[{name:'반계IC',type:'2',format:'mp4',stream:'/test-media'}]});good.els['cctv-video'].emit('loadeddata');assert.equal(good.panel.dataset.streamState,'ready');assert.equal(good.els['cctv-recovery'].hidden,true);assert.equal(good.els['capture-frame'].disabled,false);assert.equal(good.els['cctv-fullscreen'].disabled,false);
good.els['cctv-video'].attributes.src='/test-media';good.els['cctv-video'].emit('error');assert.equal(good.els['cctv-recovery'].hidden,false);assert.equal(good.els['capture-frame'].disabled,true);
for(const response of [{ok:false,message:'ITS 연결 오류'},{ok:true,cameras:[]}]){const bad=await camera(response);assert.equal(bad.els['cctv-recovery'].hidden,false);assert.equal(bad.panel.dataset.streamState,'error');assert.equal(bad.els['cctv-retry'].disabled,false);}
console.log('CCTV toolbar verified: loading, connected playback, stream error, lookup error and no cameras.');
