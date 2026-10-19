(()=>{'use strict';
const names=['live','tree','visit'],tabs=names.map(name=>document.getElementById('tab-'+name)),panels=names.map(name=>document.getElementById('panel-'+name));
let active='live';
function fromHash(){const hash=location.hash.slice(1);return ['tree','tree-studio'].includes(hash)?'tree':['visit','recent','forecast'].includes(hash)?'visit':'live';}
function loadTree(){if(active==='tree')window.BangyeLoadTree?.();}
function open(name,{updateHash=true,focus=false}={}){
 if(!names.includes(name))return;
 active=name;
 names.forEach((value,i)=>{const selected=value===name;tabs[i].setAttribute('aria-selected',String(selected));tabs[i].tabIndex=selected?0:-1;panels[i].hidden=!selected;});
 if(updateHash&&location.hash!=='#'+name)history.pushState(null,'','#'+name);
 if(focus)tabs[names.indexOf(name)].focus();
 loadTree();
}
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>open(names[i]));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowRight')next=(i+1)%names.length;
  if(event.key==='ArrowLeft')next=(i+names.length-1)%names.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=names.length-1;
  if(next!==undefined){event.preventDefault();open(names[next],{focus:true});}
 });
});
function restore(){open(fromHash(),{updateHash:false});}
window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);
window.addEventListener('bangye-tree-loader-ready',loadTree);
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a[href^="#"]');if(!link)return;
 const hash=link.getAttribute('href');const name=['#tree','#tree-studio'].includes(hash)?'tree':['#visit','#recent','#forecast'].includes(hash)?'visit':hash==='#live'?'live':null;
 if(!name)return;event.preventDefault();open(name);
 const target=document.getElementById(hash.slice(1));
 if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
});
window.BangyeUI={open,get active(){return active;}};
restore();
if(['#recent','#tree-studio','#forecast'].includes(location.hash))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'}));
})();
