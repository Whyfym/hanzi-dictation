(()=>{
// GANTI dengan VAPID public key milikmu (hasil: npx web-push generate-vapid-keys)
const VAPID_PUBLIC="BO12G547OHdFC0X59q0mW_MLkPREeBtm6iZ4ngQtOWoIIClxaOCCA-ULM_80HPsLdQ4ne0m3wBQCT8UlPxiB9Is";

/* terjemahan (self-contained, i18n.js tidak perlu diubah) */
const TR={
id:{"Notifications":"Notifikasi","No notifications yet.":"Belum ada notifikasi.","New deck added":"Dek baru ditambahkan","Message from your teacher":"Pesan dari laoshi","Enable device notifications":"Aktifkan notifikasi perangkat","Device notifications are on":"Notifikasi perangkat aktif","Turn off":"Matikan","Device notifications are blocked. Allow them in your browser settings.":"Notifikasi perangkat diblokir. Izinkan lewat pengaturan browser.","Not supported here. On iPhone, add the app to your Home Screen first.":"Tidak didukung di sini. Di iPhone, tambahkan aplikasi ke Layar Utama dulu.","Send alert":"Kirim peringatan","Title (optional)":"Judul (opsional)","Message":"Pesan","Send":"Kirim","Choose students and write a message.":"Pilih murid dan tulis pesan.","Sent to {0} students":"Terkirim ke {0} murid","Delete all":"Hapus semua","Delete all notifications?":"Hapus semua notifikasi?"},
vi:{"Notifications":"Thông báo","No notifications yet.":"Chưa có thông báo.","New deck added":"Đã thêm bộ từ mới","Message from your teacher":"Tin nhắn từ laoshi","Enable device notifications":"Bật thông báo trên thiết bị","Device notifications are on":"Thông báo trên thiết bị đang bật","Turn off":"Tắt","Device notifications are blocked. Allow them in your browser settings.":"Thông báo trên thiết bị đang bị chặn. Hãy cho phép trong cài đặt trình duyệt.","Not supported here. On iPhone, add the app to your Home Screen first.":"Không được hỗ trợ ở đây. Trên iPhone, hãy thêm ứng dụng vào Màn hình chính trước.","Send alert":"Gửi thông báo","Title (optional)":"Tiêu đề (không bắt buộc)","Message":"Nội dung","Send":"Gửi","Choose students and write a message.":"Hãy chọn học sinh và viết nội dung.","Sent to {0} students":"Đã gửi cho {0} học sinh","Delete all":"Xóa tất cả","Delete all notifications?":"Xóa tất cả thông báo?"},
ru:{"Notifications":"Уведомления","No notifications yet.":"Уведомлений пока нет.","New deck added":"Добавлена новая колода","Message from your teacher":"Сообщение от учителя","Enable device notifications":"Включить уведомления на устройстве","Device notifications are on":"Уведомления на устройстве включены","Turn off":"Выключить","Device notifications are blocked. Allow them in your browser settings.":"Уведомления на устройстве заблокированы. Разрешите их в настройках браузера.","Not supported here. On iPhone, add the app to your Home Screen first.":"Здесь не поддерживается. На iPhone сначала добавьте приложение на экран «Домой».","Send alert":"Отправить уведомление","Title (optional)":"Заголовок (необязательно)","Message":"Сообщение","Send":"Отправить","Choose students and write a message.":"Выберите учеников и напишите сообщение.","Sent to {0} students":"Отправлено ученикам: {0}","Delete all":"Удалить все","Delete all notifications?":"Удалить все уведомления?"},
zh:{"Notifications":"通知","No notifications yet.":"暂无通知。","New deck added":"新增了词库","Message from your teacher":"来自老师的消息","Enable device notifications":"开启设备通知","Device notifications are on":"设备通知已开启","Turn off":"关闭","Device notifications are blocked. Allow them in your browser settings.":"设备通知已被阻止，请在浏览器设置中允许。","Not supported here. On iPhone, add the app to your Home Screen first.":"此处不支持。在 iPhone 上请先把应用添加到主屏幕。","Send alert":"发送提醒","Title (optional)":"标题（可选）","Message":"消息","Send":"发送","Choose students and write a message.":"请选择学生并输入消息。","Sent to {0} students":"已发送给 {0} 位学生","Delete all":"全部删除","Delete all notifications?":"要删除所有通知吗？"}
};
if(typeof I18N!="undefined")Object.keys(TR).forEach(l=>{I18N[l]=Object.assign(I18N[l]||{},TR[l])});

const S={uid:null,list:[],ch:null,open:false,hooked:false,fresh:new Set()};
const st=document.createElement("style");
st.textContent=`.ntb{position:relative}.ntb svg{display:block;margin:auto}
.ntd{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--red);color:var(--onacc);font:800 11px/18px var(--ui);text-align:center}
.nti{display:flex;gap:8px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--soft);cursor:pointer}.nti:last-child{border-bottom:0}
.nti .ntc{flex:1;min-width:0}.nti b{display:block}.nti p{margin:2px 0 0}.nti.un{border-left:4px solid var(--red);padding-left:10px}
.ntdel{flex:none;background:transparent;color:var(--mut);border:0;box-shadow:none;min-height:0;padding:4px 10px;font-size:16px;line-height:1.2}.ntdel:hover{color:var(--bad)}`;
document.head.append(st);

const ok=()=>typeof user!="undefined"&&user&&SB;
const supported=()=>"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
const ready=()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,j)=>setTimeout(j,2500))]);
const b64=s=>{const r=(s+"=".repeat((4-s.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(r),c=>c.charCodeAt(0))};
const unread=()=>S.list.filter(n=>!n.read_at).length;
const when=ts=>new Date(ts).toLocaleString(LANG=="zh"?"zh-CN":LANG,{dateStyle:"medium",timeStyle:"short"});
const view=n=>{const p=n.payload||{};return n.kind=="alert"
  ?{h:n.title||t("Message from your teacher"),b:n.body||"",s:p.class||""}
  :{h:t("New deck added"),b:(p.decks||[]).join(", "),s:p.class||""}};

const BELL=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`;
window.ntBell=()=>{if(!ok())return "";const n=unread();return `<button class="helpb ntb" id="nb" aria-label="${t("Notifications")}">${BELL}${n?`<span class="ntd">${n>9?"9+":n}</span>`:""}</button>`};

function refreshBadge(){
  const n=unread();
  try{const p=n?navigator.setAppBadge&&navigator.setAppBadge(n):navigator.clearAppBadge&&navigator.clearAppBadge();if(p&&p.catch)p.catch(()=>{})}catch(e){}
  const b=$("#nb");if(!b)return;
  let d=b.querySelector(".ntd");
  if(!n){if(d)d.remove();return}
  if(!d){d=document.createElement("span");d.className="ntd";b.append(d)}
  d.textContent=n>9?"9+":n;
}
function markRead(ids){
  if(!ids.length)return;const now=new Date().toISOString();
  S.list.forEach(n=>{if(ids.includes(n.id))n.read_at=now});refreshBadge();
  SB.from("notifications").update({read_at:now}).in("id",ids).then(()=>{},()=>{});
}
function pop(n){
  const v=view(n),e=document.createElement("div");e.className="toast";e.style.cursor="pointer";
  e.textContent=(v.h+(v.b?": "+v.b:"")).slice(0,90);e.onclick=()=>{e.remove();openInbox()};
  document.body.append(e);setTimeout(()=>e.remove(),4500);
}

async function load(){
  const{data,error}=await SB.from("notifications").select("*").order("created_at",{ascending:false}).limit(40);
  if(!error)S.list=data||[];
  refreshBadge();
}
function listen(){
  if(S.ch)return;
  S.ch=SB.channel("nt-"+user.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:"user_id=eq."+user.id},p=>{
    const n=p.new;if(!n||S.list.some(x=>x.id===n.id))return;
    S.list.unshift(n);refreshBadge();pop(n);
    if(n.kind=="deck"&&window.clsReload)clsReload();
    if(S.open){S.fresh.add(n.id);markRead([n.id]);renderPanel()}
  }).subscribe();
}
function reset(){
  if(S.ch){try{SB.removeChannel(S.ch)}catch(e){}}
  S.ch=null;S.list=[];S.uid=null;S.fresh=new Set();refreshBadge();
}
async function init(){
  if(!ok()||S.uid===user.id)return;
  reset();S.uid=user.id;
  if(!S.hooked){S.hooked=true;SB.auth.onAuthStateChange(ev=>{if(ev=="SIGNED_OUT")reset()})}
  await load();listen();
  try{if(!getJ("zw-pushoff"))await sub()}catch(e){}
  if(location.search.includes("inbox=1")){history.replaceState(null,"",location.pathname);openInbox()}
}

async function sub(){
  if(!ok()||!supported()||Notification.permission!="granted")return;
  const reg=await ready();
  let s=await reg.pushManager.getSubscription();
  if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(VAPID_PUBLIC)});
  const j=s.toJSON();
  await SB.rpc("save_push_sub",{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_lang:LANG});
}
async function enable(){
  try{
    if(Notification.permission!="granted"){const p=await Notification.requestPermission();if(p!="granted"){renderPanel();return}}
    setJ("zw-pushoff",null);await sub();
  }catch(e){}
  renderPanel();
}
async function off(){
  setJ("zw-pushoff",1);
  try{const reg=await ready(),s=await reg.pushManager.getSubscription();if(s)await SB.from("push_subscriptions").delete().eq("endpoint",s.endpoint)}catch(e){}
  renderPanel();
}

function db(q){q.then(r=>{if(r.error)load().then(()=>{if(S.open)renderPanel()})},()=>{})}
function del(id){
  S.list=S.list.filter(n=>n.id!==id);refreshBadge();renderPanel();
  db(SB.from("notifications").delete().eq("id",id));
}
function delAll(){
  if(!S.list.length||!confirm(t("Delete all notifications?")))return;
  S.list=[];refreshBadge();renderPanel();
  db(SB.from("notifications").delete().eq("user_id",user.id));
}

function pushCard(){
  if(!supported())return `<p class="hint">${t("Not supported here. On iPhone, add the app to your Home Screen first.")}</p>`;
  const p=Notification.permission,o=!!getJ("zw-pushoff");
  if(p=="denied")return `<p class="hint">${t("Device notifications are blocked. Allow them in your browser settings.")}</p>`;
  if(p=="granted"&&!o)return `<div class="row" style="margin:0"><span class="hint">${t("Device notifications are on")}</span><button class="ghost sm" id="nto">${t("Turn off")}</button></div>`;
  return `<button id="nte" style="width:100%">${t("Enable device notifications")}</button>`;
}
function renderPanel(){
  const o=$("#ntm");if(!o)return;
  o.innerHTML=`<div class="gbox" role="dialog" aria-modal="true"><div class="gh"><h2>${t("Notifications")}</h2><button class="ghost sm" id="ntx" aria-label="${t("Close")}">✕</button></div>
  <div style="margin:12px 0">${pushCard()}</div>
  ${S.list.length?`<div class="row" style="margin:0 0 4px;justify-content:flex-end"><button class="ghost sm" id="ntclr">${t("Delete all")}</button></div>`:""}
  ${S.list.length?S.list.map((n,i)=>{const v=view(n);return `<div class="nti${S.fresh.has(n.id)?" un":""}" data-ni="${i}"><div class="ntc"><b>${esc(v.h)}</b>${v.b?`<p>${esc(v.b)}</p>`:""}<p class="hint">${v.s?esc(v.s)+" · ":""}${esc(when(n.created_at))}</p></div><button class="ntdel" data-nd="${i}" aria-label="${t("Delete")}">✕</button></div>`}).join(""):`<p class="hint">${t("No notifications yet.")}</p>`}</div>`;
  $("#ntx").onclick=closeInbox;
  o.querySelectorAll("[data-ni]").forEach(el=>el.onclick=()=>{
    const n=S.list[+el.dataset.ni],cid=n&&n.payload&&n.payload.class_id;
    if(cid&&window.clsOpen){closeInbox();clsOpen(cid)}});
  o.querySelectorAll("[data-nd]").forEach(b=>b.onclick=ev=>{ev.stopPropagation();const n=S.list[+b.dataset.nd];if(n)del(n.id)});
  const ca=$("#ntclr");if(ca)ca.onclick=delAll;
  const e=$("#nte");if(e)e.onclick=enable;
  const f=$("#nto");if(f)f.onclick=off;
}
function openInbox(){
  if(!ok())return;
  S.open=true;S.fresh=new Set(S.list.filter(n=>!n.read_at).map(n=>n.id));
  let o=$("#ntm");
  if(!o){o=document.createElement("div");o.id="ntm";o.className="gmodal";o.onclick=e=>{if(e.target===o)closeInbox()};document.body.append(o)}
  renderPanel();markRead([...S.fresh]);
}
function closeInbox(){S.open=false;const o=$("#ntm");if(o)o.remove()}
document.addEventListener("keydown",e=>{if(e.key=="Escape"&&S.open)closeInbox()});

window.ntTop=()=>{if(!ok())return;init().catch(()=>{});const b=$("#nb");if(b)b.onclick=openInbox};
window.ntOut=async()=>{   // dipanggil SEBELUM signOut
  try{if(supported()&&ok()){const reg=await ready(),s=await reg.pushManager.getSubscription();if(s)await SB.from("push_subscriptions").delete().eq("endpoint",s.endpoint)}}catch(e){}
  reset();
};

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").catch(()=>{});
  navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.type=="open-inbox")openInbox()});
}
})();
