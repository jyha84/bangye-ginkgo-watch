import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
class Element {
 constructor(value=''){this.value=value;this.listeners=new Map();this.hidden=false;this.style={values:{},setProperty:(k,v)=>this.style.values[k]=v};this.classList={toggle:()=>{}};this.captures=new Set();}
 addEventListener(name,fn){const list=this.listeners.get(name)||[];list.push(fn);this.listeners.set(name,list);}
 emit(name,data={}){const event={type:name,pointerType:'touch',button:0,pointerId:1,clientX:0,clientY:0,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...data};for(const fn of this.listeners.get(name)||[]){fn(event);if(event.stopped)break;}return event;}
 getBoundingClientRect(){return {left:0,top:0,width:this.width||400,height:this.height||250,bottom:this.height||250};}
 hasPointerCapture(id){return this.captures.has(id);}
 setPointerCapture(id){this.captures.add(id);}
}
const elements=Object.fromEntries(['cctv-video','cctv-image','video-zoom','video-pan-x','video-pan-y','video-zoom-value','video-zoom-reset'].map(id=>[id,new Element()]));
const frame=new Element(),document=new Element(),window=new Element();
Object.assign(elements['cctv-video'],{offsetWidth:400,offsetHeight:250,videoWidth:1920,videoHeight:1080});
elements['cctv-image'].hidden=true;
Object.assign(document,{querySelector:()=>frame,getElementById:id=>elements[id]});
vm.runInNewContext(readFileSync('web/cctv-zoom.js','utf8'),{document,window,MutationObserver:class{observe(){}}});
const property=key=>parseFloat(frame.style.values[key]);
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.01,`${actual} != ${expected}`);
const finger=(name,id,x,y=125)=>frame.emit(name,{pointerId:id,clientX:x,clientY:y});
const zoom=elements['video-zoom'],panX=elements['video-pan-x'],panY=elements['video-pan-y'];
// Off-centre pinch: the source pixel under the two-finger midpoint stays anchored.
finger('pointerdown',1,250);finger('pointerdown',2,350);
finger('pointermove',1,200);finger('pointermove',2,400);
near(property('--video-zoom'),2);near(property('--video-offset-x'),-100);
assert.equal(zoom.value,'2.0');assert.equal(elements['video-zoom-value'].textContent,'2.0배');
// Lifting one finger smoothly continues as a drag without jumping.
finger('pointerup',2,400);finger('pointermove',1,250);
near(property('--video-offset-x'),-50);finger('pointerup',1,250);
assert.equal(frame.emit('click').prevented,true);
// A fresh tap is not swallowed after a drag (native playback controls stay usable).
finger('pointerdown',3,200);finger('pointerup',3,200);
assert.equal(frame.emit('click').prevented,undefined);
// Zoom caps at 4x; dragging cannot expose space beyond the image.
finger('pointerdown',4,190);finger('pointerdown',5,210);
finger('pointermove',4,-1000);finger('pointermove',5,1400);
near(property('--video-zoom'),4);
finger('pointerup',5,1400);finger('pointermove',4,10000,10000);
near(property('--video-offset-x'),600);near(property('--video-offset-y'),325);
finger('pointercancel',4,10000);const cancelledX=property('--video-offset-x');
finger('pointermove',4,-10000);near(property('--video-offset-x'),cancelledX);
// The same state is controlled by sliders, and reset restores 1x / centre.
zoom.value='2';panX.value='100';panY.value='0';zoom.emit('input');
near(property('--video-zoom'),2);near(property('--video-offset-x'),-200);near(property('--video-offset-y'),100);
elements['video-zoom-reset'].emit('click');near(property('--video-zoom'),1);near(property('--video-offset-x'),0);near(property('--video-offset-y'),0);assert.equal(panX.disabled,true);
// Pinching inward never flips/overshrinks; fullscreen geometry updates bounds.
finger('pointerdown',6,100);finger('pointerdown',7,300);finger('pointermove',6,199);finger('pointermove',7,201);near(property('--video-zoom'),1);finger('pointerup',6,199);finger('pointerup',7,201);
zoom.value='4';panX.value='100';panY.value='50';zoom.emit('input');
frame.width=800;frame.height=500;elements['cctv-video'].offsetWidth=800;elements['cctv-video'].offsetHeight=500;document.emit('fullscreenchange');near(property('--video-offset-x'),-1200);
console.log('CCTV gestures verified: anchor, pinch limits, pinch-to-pan, cancellation, native taps, sliders, reset and resize.');
