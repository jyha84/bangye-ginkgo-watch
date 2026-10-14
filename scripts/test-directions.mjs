import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('web/directions.js','utf8');
function setup({agent='Android',secure=true,geo=true,protocol='https:'}={}){
 const elements=Object.fromEntries(['route-naver','route-kakao','route-status','route-manual','route-app-help'].map(id=>[id,{hidden:['route-manual'].includes(id),listeners:{},attributes:{},addEventListener(name,fn){this.listeners[name]=fn;},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}}]));
 let request=null,navigated=null,calls=0;
 const location={protocol,origin:'https://bangye-ginkgo-watch.bzbone.chatgpt.site',pathname:'/',assign(url){navigated=url;}};
 const navigator={userAgent:agent,platform:'',maxTouchPoints:0};
 if(geo)navigator.geolocation={getCurrentPosition(success,error,options){calls++;request={success,error,options};}};
 vm.runInNewContext(source,{document:{getElementById:id=>elements[id]},navigator,location,window:{isSecureContext:secure},URLSearchParams,encodeURIComponent});
 return {elements,get request(){return request;},get navigated(){return navigated;},get calls(){return calls;},click(id){elements[id].listeners.click();}};
}
const a=setup();assert.equal(a.calls,0,'No location access before a user clicks');
const naver=a.elements['route-naver'].href;
assert.ok(naver.startsWith('intent://route/car?'));assert.ok(naver.includes('package=com.nhn.android.nmap;end'));
const query=new URLSearchParams(naver.split('?')[1].split('#')[0]);
assert.equal(query.get('dname'),'반계리 은행나무');assert.equal(query.get('dlat'),'37.29420615216428');assert.equal(query.get('dlng'),'127.78839901238739');assert.equal(query.has('slat'),false);assert.equal(query.has('slng'),false);
assert.equal(query.get('appname'),'https://bangye-ginkgo-watch.bzbone.chatgpt.site/');
a.click('route-kakao');assert.equal(a.elements['route-kakao'].disabled,true);a.click('route-kakao');assert.equal(a.calls,1,'Deduplicate while waiting for location');
assert.equal(a.request.options.timeout,12000);assert.equal(a.request.options.maximumAge,30000);
a.request.success({coords:{latitude:37.5,longitude:126.9,accuracy:10}});
assert.equal(decodeURIComponent(a.navigated),'https://map.kakao.com/link/by/car/현재 위치,37.5,126.9/반계리 은행나무,37.29420615216428,127.78839901238739');assert.equal(a.elements['route-kakao'].disabled,false);
for(const code of [1,2,3]){const x=setup();x.click('route-kakao');x.request.error({code});assert.equal(x.navigated,null);assert.equal(x.elements['route-manual'].hidden,false);assert.equal(x.elements['route-kakao'].disabled,false);}
for(const config of [{secure:false},{geo:false}]){const x=setup(config);x.click('route-kakao');assert.equal(x.calls,0);assert.equal(x.navigated,null);assert.equal(x.elements['route-manual'].hidden,false);}
const invalid=setup();invalid.click('route-kakao');invalid.request.success({coords:{latitude:NaN,longitude:127}});assert.equal(invalid.navigated,null);
const ios=setup({agent:'iPhone',protocol:'file:'});assert.ok(ios.elements['route-naver'].href.startsWith('nmap://route/car?'));assert.ok(!ios.elements['route-naver'].href.includes('+'));assert.ok(!ios.elements['route-naver'].href.includes('file%3A'));
const desktop=setup({agent:'Mozilla Firefox Linux'});assert.equal(desktop.elements['route-naver'].hidden,true);assert.equal(desktop.elements['route-app-help'].hidden,true);
console.log('Directions verified: destination, current-location Naver links, Kakao routing, permission/timeout failures, invalid coordinates, desktop and standalone fallback.');
