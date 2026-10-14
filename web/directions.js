(()=>{'use strict';
// Destination coordinates from Wonju Tourism (resrceNo=4712), checked 2026-10-12.
// https://www.wonju.go.kr/tour/viewTnResrceDataT.do?key=5477&resrceNo=4712
const destination={name:'반계리 은행나무',lat:37.29420615216428,lng:127.78839901238739};
const $=id=>document.getElementById(id),naver=$('route-naver'),kakao=$('route-kakao'),status=$('route-status'),manual=$('route-manual');
const to=encodeURIComponent(destination.name)+','+destination.lat+','+destination.lng;
const fallback='https://map.kakao.com/link/to/'+to;
manual.href=fallback;
const appName=location.protocol==='https:'?location.origin+location.pathname:'https://bangye-ginkgo-watch.bzbone.chatgpt.site/';
const params=new URLSearchParams({dlat:String(destination.lat),dlng:String(destination.lng),dname:destination.name,appname:appName}).toString().replaceAll('+','%20');
const android=/Android/i.test(navigator.userAgent),ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(android){
 naver.href='intent://route/car?'+params+'#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;end';
}else if(ios){naver.href='nmap://route/car?'+params;}else{naver.hidden=true;$('route-app-help').hidden=true;}
// Omitting the start coordinates tells Naver Maps to use its own current location.
naver.addEventListener('click',()=>{status.textContent='네이버 지도에서 현재 위치 → 반계리 은행나무 자동차 경로를 엽니다.';});
let locating=false;
kakao.addEventListener('click',()=>{
 if(locating)return;
 if(!window.isSecureContext||!navigator.geolocation){
  status.textContent='현재 위치를 확인할 수 없는 브라우저입니다. 아래 링크를 열어 출발지를 직접 선택해 주세요.';manual.hidden=false;return;
 }
 locating=true;kakao.disabled=true;kakao.setAttribute('aria-busy','true');status.textContent='현재 위치를 확인하고 있습니다. 위치 접근을 허용해 주세요.';
 function finish(){locating=false;kakao.disabled=false;kakao.removeAttribute('aria-busy');}
 navigator.geolocation.getCurrentPosition(position=>{
  finish();const {latitude,longitude,accuracy}=position.coords;
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){
   status.textContent='위치를 정확히 읽지 못했습니다. 출발지를 직접 선택해 주세요.';manual.hidden=false;return;
  }
  // Only the selected map receives the position; no API request, storage or tracking.
  const origin=encodeURIComponent('현재 위치')+','+latitude+','+longitude;
  const url='https://map.kakao.com/link/by/car/'+origin+'/'+to;
  status.textContent=accuracy>1000?'위치 오차가 큽니다. 카카오맵에서 출발지를 확인해 주세요.':'카카오맵에서 현재 위치 출발 경로를 엽니다.';
  location.assign(url);
 },error=>{
  finish();manual.hidden=false;
  status.textContent=error.code===1?'위치 접근이 허용되지 않았습니다. 네이버 지도 앱에서 현재 위치를 사용하거나 아래 링크에서 출발지를 선택해 주세요.':error.code===3?'위치 확인 시간이 초과됐습니다. 다시 시도하거나 출발지를 직접 선택해 주세요.':'현재 위치를 찾지 못했습니다. 다시 시도하거나 출발지를 직접 선택해 주세요.';
 },{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
});
})();
