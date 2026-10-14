(()=>{'use strict';
const frame=document.querySelector('.video-frame'),video=document.getElementById('cctv-video'),image=document.getElementById('cctv-image');
const zoom=document.getElementById('video-zoom'),panX=document.getElementById('video-pan-x'),panY=document.getElementById('video-pan-y'),output=document.getElementById('video-zoom-value');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let scale=1,x=0,y=0,gesture=null,suppressClick=false;
const pointers=new Map();
function geometry(){
 const rect=frame.getBoundingClientRect(),media=!image.hidden?image:video;
 const width=media.offsetWidth||rect.width,height=media.offsetHeight||rect.height;
 const naturalWidth=media.videoWidth||media.naturalWidth,naturalHeight=media.videoHeight||media.naturalHeight;
 const fit=naturalWidth&&naturalHeight?Math.min(width/naturalWidth,height/naturalHeight):0;
 return {rect,width:fit?naturalWidth*fit:width,height:fit?naturalHeight*fit:height};
}
function limits(){const g=geometry();return {x:Math.max(0,(g.width*scale-g.rect.width)/2),y:Math.max(0,(g.height*scale-g.rect.height)/2)};}
function render(){
 const bounds=limits();x=clamp(x,-bounds.x,bounds.x);y=clamp(y,-bounds.y,bounds.y);
 frame.style.setProperty('--video-zoom',scale);
 frame.style.setProperty('--video-offset-x',x+'px');frame.style.setProperty('--video-offset-y',y+'px');
 frame.classList.toggle('is-zoomed',scale>1.01);
 zoom.value=scale.toFixed(1);output.textContent=scale.toFixed(1)+'배';
 panX.value=bounds.x?Math.round(50-x/bounds.x*50):50;panY.value=bounds.y?Math.round(50-y/bounds.y*50):50;
 panX.disabled=!bounds.x;panY.disabled=!bounds.y;
}
function fromSliders(){
 const px=Number(panX.value),py=Number(panY.value);scale=Number(zoom.value);
 const bounds=limits();x=(50-px)/50*bounds.x;y=(50-py)/50*bounds.y;render();
}
for(const input of [zoom,panX,panY])input.addEventListener('input',()=>{gesture=null;fromSliders();});
document.getElementById('video-zoom-reset').addEventListener('click',()=>{pointers.clear();gesture=null;scale=1;x=y=0;render();});
function midpoint(a,b){return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function startGesture(){
 const entries=[...pointers.entries()];
 if(entries.length>=2){
  const [[aId,a],[bId,b]]=entries,g=geometry();
  gesture={type:'pinch',ids:[aId,bId],mid:midpoint(a,b),distance:Math.max(1,distance(a,b)),scale,x,y,cx:g.rect.left+g.rect.width/2,cy:g.rect.top+g.rect.height/2};
 }else if(entries.length===1&&scale>1.01&&entries[0][1].canPan){
  const [id,p]=entries[0];gesture={type:'pan',ids:[id],point:p,x,y};
 }else gesture=null;
}
function capture(){for(const id of gesture.ids){try{if(!frame.hasPointerCapture(id))frame.setPointerCapture(id);}catch{}}}
frame.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0||video.hidden&&image.hidden)return;
 const rect=frame.getBoundingClientRect();
 // Leave a single tap on the native player controls alone at the original size.
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,canPan:scale>1.01||e.clientY<rect.bottom-52});
 startGesture();if(gesture?.type==='pinch'){e.preventDefault();suppressClick=true;capture();}
},{capture:true});
frame.addEventListener('pointermove',e=>{
 const previous=pointers.get(e.pointerId);if(!previous)return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,canPan:previous.canPan});
 if(!gesture)startGesture();if(!gesture)return;
 if(gesture.type==='pinch'){
  const a=pointers.get(gesture.ids[0]),b=pointers.get(gesture.ids[1]);if(!a||!b)return;
  const mid=midpoint(a,b);scale=clamp(gesture.scale*distance(a,b)/gesture.distance,1,4);
  const ratio=scale/gesture.scale;
  x=mid.x-gesture.cx-ratio*(gesture.mid.x-gesture.cx-gesture.x);
  y=mid.y-gesture.cy-ratio*(gesture.mid.y-gesture.cy-gesture.y);
 }else{
  const p=pointers.get(gesture.ids[0]);if(!p)return;
  const dx=p.x-gesture.point.x,dy=p.y-gesture.point.y;
  if(Math.hypot(dx,dy)<4)return;x=gesture.x+dx;y=gesture.y+dy;
 }
 e.preventDefault();suppressClick=true;capture();render();
},{capture:true});
function end(e){
 if(!pointers.delete(e.pointerId))return;
 // A cancelled gesture must not leave a stuck finger or a stale zoom anchor.
 if(e.type==='pointercancel'){pointers.clear();gesture=null;}else startGesture();
}
for(const name of ['pointerup','pointercancel','lostpointercapture'])frame.addEventListener(name,end,{capture:true});
frame.addEventListener('pointerleave',e=>{if(!frame.hasPointerCapture(e.pointerId))end(e);});
frame.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},{capture:true});
// Do not let a previous drag swallow a later, separate tap on playback controls.
frame.addEventListener('pointerdown',()=>{if(pointers.size<=1)suppressClick=false;});
function resized(){gesture=null;fromSliders();}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(resized).observe(frame);
window.addEventListener('resize',resized);document.addEventListener('fullscreenchange',resized);
video.addEventListener('loadedmetadata',resized);image.addEventListener('load',resized);
new MutationObserver(()=>{pointers.clear();gesture=null;scale=1;x=y=0;render();}).observe(frame,{subtree:true,attributes:true,attributeFilter:['hidden']});
render();
})();
