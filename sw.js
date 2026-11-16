self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));

self.addEventListener("push",e=>{
  let d={};try{d=e.data.json()}catch(x){}
  e.waitUntil((async()=>{
    await self.registration.showNotification(d.title||"Zhongwenfy",{
      body:d.body||"",
      icon:"icon-192.png",
      tag:d.tag,
      data:{class_id:d.class_id||null}
    });
    try{if(self.navigator.setAppBadge)await self.navigator.setAppBadge()}catch(x){}
  })());
});

self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil((async()=>{
    const all=await clients.matchAll({type:"window",includeUncontrolled:true});
    for(const c of all){if("focus" in c){await c.focus();c.postMessage({type:"open-inbox"});return}}
    await clients.openWindow("./?inbox=1");
  })());
});
