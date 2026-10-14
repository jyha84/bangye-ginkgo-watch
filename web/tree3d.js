import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const host=document.getElementById('tree-view'),loading=document.getElementById('model-loading');
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(39,1,.1,180);camera.position.set(27,7,66);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','반계리 은행나무 형태를 근사한 3D 모델. 드래그로 회전하고 휠 또는 두 손가락으로 확대하세요.');
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,16,0);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=25;controls.maxDistance=115;controls.maxPolarAngle=Math.PI*.57;controls.update();
scene.add(new THREE.HemisphereLight(0xfff9e3,0x68715d,1.35));
const sun=new THREE.DirectionalLight(0xffedc2,2.1);sun.position.set(-24,45,30);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:30,bottom:-25,near:1,far:100});sun.shadow.bias=-.002;scene.add(sun);
const fill=new THREE.DirectionalLight(0xe2edff,.7);fill.position.set(25,18,-20);scene.add(fill);
let seed=2941;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const bark=new THREE.MeshStandardMaterial({color:0x665b48,roughness:1});
bark.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 barkPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nbarkPoint=position;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 barkPoint;').replace('#include <color_fragment>','#include <color_fragment>\nfloat groove=sin(barkPoint.x*31.0+barkPoint.z*17.0+sin(barkPoint.y*2.0)); diffuseColor.rgb*=0.82+0.18*groove;');};
function limb(points,start,end){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 const segments=start>.7?28:12,sides=start>.7?13:7;
 const geometry=new THREE.TubeGeometry(curve,segments,1,sides,false),pos=geometry.attributes.position;
 for(let i=0;i<=segments;i++){const t=i/segments,p=curve.getPointAt(t),radius=start*Math.pow(1-t,.8)+end*t;for(let j=0;j<=sides;j++){const idx=i*(sides+1)+j,a=j/sides*Math.PI*2,ridge=1+.065*Math.sin(a*7+t*4)+.045*Math.cos(a*11-t*2);const v=new THREE.Vector3().fromBufferAttribute(pos,idx).sub(p).multiplyScalar(radius*ridge).add(p);pos.setXYZ(idx,v.x,v.y,v.z);}}
 geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,bark);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
}
// Form reference: Wonju tourism dimensions, autumn front and aerial photographs.
// Seven fused stems, broad irregular crown and low cascading lateral foliage.
limb([[0,0,0],[.15,1.7,.1],[-.1,3.6,0]],2.45,2.15);
for(let i=0;i<11;i++){const a=i/11*Math.PI*2+.2,r=5+rnd()*2;limb([[Math.cos(a)*r,.06,Math.sin(a)*r*.8],[Math.cos(a)*3.4,.3,Math.sin(a)*2.8],[Math.cos(a)*1.65,1.4,Math.sin(a)*1.3]],.15+rnd()*.1,.85);}
for(let i=0;i<7;i++){
 const a=i/7*Math.PI*2+.35,b=a+.18*Math.sin(i*2),reach=7+rnd()*3,h=22+rnd()*5;
 const x=Math.cos(b)*reach,z=Math.sin(b)*reach*.83;
 limb([[Math.cos(a)*1.1,.5,Math.sin(a)],[Math.cos(a)*1.8,5,Math.sin(a)*1.5],[x*.5,12,z*.5],[x,h,z]],1.32-rnd()*.18,.18);
 for(let j=0;j<4;j++){
  const ba=a+(j-1.5)*.31,r=13+rnd()*3,y=9+j*3.3+rnd()*2;
  const ex=Math.cos(ba)*r,ez=Math.sin(ba)*r*.81;
  limb([[x*.16,4.8+j*2,z*.16],[ex*.52,y*.88,ez*.52],[ex*.84,y+1.2,ez*.84],[ex,y-1.7,ez]],.66-j*.095,.06);
  for(let k=0;k<3;k++){const ta=ba+(k-1)*.12,tx=Math.cos(ta)*(r+.6),tz=Math.sin(ta)*(r+.6)*.81;limb([[ex*.74,y+.4,ez*.74],[tx,y+.8+(k-1)*.5,tz],[tx*1.025,Math.max(3.5,y-3.5-rnd()*2),tz*1.025]],.12,.018);}
 }
}
const ground=new THREE.Mesh(new THREE.CircleGeometry(29,80),new THREE.MeshStandardMaterial({color:0xb7ba8d,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.05;ground.receiveShadow=true;scene.add(ground);
// Concentric translucent disks form a soft contact shade without a hard edge.
for(let i=0;i<10;i++){const shade=new THREE.Mesh(new THREE.CircleGeometry(7+i*1.4,64),new THREE.MeshBasicMaterial({color:0x3d4932,transparent:true,opacity:.014,depthWrite:false}));shade.rotation.x=-Math.PI/2;shade.position.y=.004+i*.0002;scene.add(shade);}
// An explicitly labelled 1.7 m height reference gives the huge tree a scale.
const scaleMaterial=new THREE.MeshStandardMaterial({color:0x59656a,roughness:1});
const person=new THREE.Group();const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.17,.46,3,7),scaleMaterial);torso.position.y=1.07;person.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.12,10,7),scaleMaterial);head.position.y=1.58;person.add(head);
for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.062,.57,3,6),scaleMaterial);leg.position.set(side*.1,.36,0);person.add(leg);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.048,.43,3,6),scaleMaterial);arm.position.set(side*.23,1.04,0);arm.rotation.z=side*.15;person.add(arm);}
person.position.set(9,0,20);scene.add(person);
const profile=[[2.8,.56],[5,.78],[10,.95],[17,1],[23,.92],[28,.72],[32,.34],[34.3,0]];
function widthAt(y){for(let i=1;i<profile.length;i++){if(y<=profile[i][0]){const [ya,wa]=profile[i-1],[yb,wb]=profile[i];const t=Math.max(0,(y-ya)/(yb-ya));return wa+(wb-wa)*t;}}return 0;}
const clusters=[];
for(let i=0;i<380;i++){
 const a=rnd()*Math.PI*2,y=4.2+rnd()*27.7,band=widthAt(y),r=(i%5===0?.3+rnd()*.45:.76+rnd()*.22);
 const edge=1+.035*Math.sin(a*7+y*.3)+.025*Math.cos(a*11-y*.6);
 clusters.push({x:Math.cos(a)*18.05*band*r*edge,y,z:Math.sin(a)*14.6*band*r*edge,rx:1.15+rnd()*.85,ry:1.55+rnd()*1.5,rz:1.1+rnd()*.7,shade:.72+r*.24});
}
// Uneven upward shoots and long, drooping sprays break up the crown outline.
for(let i=0;i<42;i++){const a=i/42*Math.PI*2,r=10+rnd()*5.5,y=6+rnd()*15;clusters.push({x:Math.cos(a)*r,y,z:Math.sin(a)*r*.81,rx:.8+rnd()*.5,ry:2.5+rnd()*1.8,rz:.7+rnd()*.5,shade:.9});}
const texture=await new THREE.TextureLoader().loadAsync(window.BANGYE_LEAF_URL||'./ginkgo-leaf.png');texture.colorSpace=THREE.SRGBColorSpace;
const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.36,side:THREE.DoubleSide,roughness:.92});
material.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
 vec4 sampledDiffuseColor=texture2D(map,vMapUv);
 float leafLight=dot(sampledDiffuseColor.rgb,vec3(0.2126,0.7152,0.0722));
 diffuseColor*=vec4(vec3(0.56+leafLight*0.68),sampledDiffuseColor.a);
 #endif`);};
const mobile=matchMedia('(max-width: 680px)').matches;
const count=mobile?36000:64000;
const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,count);leaves.frustumCulled=false;
const dummy=new THREE.Object3D(),choices=new Float32Array(count),lights=new Float32Array(count);

for(let i=0;i<count;i++){
 const l=clusters[i%clusters.length],a=rnd()*Math.PI*2,v=rnd()*2-1,rad=Math.cbrt(rnd()),ring=Math.sqrt(1-v*v);
 let x=l.x+Math.cos(a)*ring*rad*l.rx,y=Math.max(2.4,l.y+v*rad*l.ry),z=l.z+Math.sin(a)*ring*rad*l.rz;
 // Keep the overall crown close to the published proportions; retain small sprays.
 y=Math.min(34.25,y);const limit=widthAt(y)+.045,q=Math.hypot(x/18.75,z/15.5);if(q>limit){x*=limit/q;z*=limit/q;}
 dummy.position.set(x,y,z);dummy.rotation.set(rnd()*Math.PI,rnd()*Math.PI*2,rnd()*Math.PI*2);
 const size=(mobile?.48:.32)+rnd()*.28;dummy.scale.set(size,size,1);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);choices[i]=rnd();lights[i]=l.shade*(.76+rnd()*.32);
}
scene.add(leaves);
let viewMode='full';
function render(){renderer.render(scene,camera);}
function fullView(){viewMode='full';const aspect=host.clientWidth/host.clientHeight,halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));const distance=Math.max(60,38/(2*halfFov*aspect)*1.09,37/(2*halfFov)*1.09);camera.position.set(distance*.34,7,distance*.941);controls.target.set(0,16,0);controls.update();render();}
function palette(items){if(!items?.length)return;const c=new THREE.Color();for(let i=0;i<count;i++){let sum=0,chosen=items.at(-1);for(const p of items){sum+=p.weight;if(choices[i]<=sum){chosen=p;break;}}c.set(chosen.color).multiplyScalar(lights[i]);leaves.setColorAt(i,c);}leaves.instanceColor.needsUpdate=true;render();window.BangyeTree3D={ready:true,leafCount:count,palette:items,dimensions:{height:34.5,width:37.5,depth:31}};}
window.addEventListener('bangye-palette',e=>palette(e.detail));palette(window.bangyePalette);
controls.addEventListener('change',render);controls.addEventListener('start',()=>viewMode='custom');
document.getElementById('model-fullscreen')?.addEventListener('click',()=>{if(document.fullscreenElement===host)document.exitFullscreen?.();else host.requestFullscreen?.().catch(()=>{});});
document.getElementById('model-low-view')?.addEventListener('click',()=>{viewMode='low';camera.position.set(14,2,47);controls.target.set(0,17,0);controls.update();render();});
document.getElementById('model-reset').addEventListener('click',fullView);
new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(viewMode==='full')fullView();else render();}).observe(host);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.hidden=false;loading.textContent='3D 표시가 중단되었습니다. 페이지를 새로고침해 주세요.';});
loading.hidden=true;render();
