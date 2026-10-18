(()=>{
const day=(o=0)=>{const d=new Date(Date.now()+o*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
let prog=ld("zw-prog",{}),daily=ld("zw-daily",{date:"",n:0,goal:10,streak:0,last:""}),mute=ld("zw-mute",false),ts=+ld("zw-ts",0),pt;
const sv=()=>{try{localStorage.setItem("zw-prog",JSON.stringify(prog));localStorage.setItem("zw-daily",JSON.stringify(daily));localStorage.setItem("zw-mute",JSON.stringify(mute));localStorage.setItem("zw-ts",String(ts))}catch(e){}};
const st=document.createElement("style");
st.textContent=`.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 12px;text-align:center}.stats b{display:block;font:800 1.7rem var(--hz)}.stats span{font-size:12.5px;color:var(--mut)}.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:12px 18px;border-radius:12px;font-weight:700;box-shadow:var(--sh);animation:tin .3s;z-index:9}@keyframes tin{from{opacity:0;margin-bottom:-12px}}.qr{width:170px;margin:10px auto;background:#fff;padding:6px;border-radius:10px}.qr svg{width:100%;height:auto;display:block}.opt.right,.opt.wrong{animation:bump .3s}@keyframes bump{50%{transform:scale(1.03)}}`;
document.head.append(st);

let ac;
const beep=(f,d,o=0)=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const s=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+o;s.frequency.value=f;g.gain.setValueAtTime(.12,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);s.connect(g);g.connect(ac.destination);s.start(n);s.stop(n+d)}catch(e){}};
window.xSnd=ok=>{if(mute)return;ok?(beep(660,.12),beep(880,.18,.1)):beep(170,.3)};
const toast=m=>{const e=document.createElement("div");e.className="toast";e.textContent=m;document.body.append(e);setTimeout(()=>e.remove(),2600)};

const push=()=>{
  if(typeof user=="undefined"||!user||!SB)return;
  clearTimeout(pt);
  pt=setTimeout(async()=>{try{await SB.from("user_data").upsert({user_id:user.id,data:{deck,sents,sel:[...sel],prog,daily},updated_at:new Date(ts).toISOString()})}catch(e){}},1500);
};
window.xChanged=()=>{ts=Date.now();sv();push()};
window.xPull=async()=>{
  if(!user||!SB)return;
  try{
    const{data}=await SB.from("user_data").select("data,updated_at").eq("user_id",user.id).maybeSingle();
    if(data&&Date.parse(data.updated_at)>ts+1000){
      const d=data.data||{};deck=d.deck||[];sents=d.sents||[];sel=new Set(d.sel||[]);prog=d.prog||{};daily=d.daily||daily;ts=Date.parse(data.updated_at);sv();
      try{localStorage.setItem("hz-deck",JSON.stringify({deck,sents,sel:[...sel]}))}catch(e){}
      if(app.querySelector(".grid"))home();
    }else if((deck.length||sents.length)&&(!data||ts>Date.parse(data.updated_at)+1000)){if(!ts)ts=Date.now();push()}
  }catch(e){}
};

window.xRec=(w,ok)=>{
  xSnd(ok);
  const k=w.h,p=prog[k]||{b:0,d:0,r:0,x:0},now=Date.now();
  if(ok){p.b=Math.min(5,p.b+1);p.d=now+[0,1,2,4,8,16][p.b]*864e5;p.r++}else{p.b=0;p.d=now;p.x++}
  prog[k]=p;
  const td=day();if(daily.date!==td){daily.date=td;daily.n=0}
  if(daily.last!==td){daily.streak=(daily.last===day(-1)?daily.streak:0)+1;daily.last=td}
  daily.n++;if(daily.n===daily.goal){toast(t("Daily goal reached!"));setTimeout(()=>xSnd(true),400)}
  xChanged();
};
window.xPick=(pool,n)=>{
  const now=Date.now(),wt=w=>{const p=prog[w.h];return !p?2:p.d<=now?3+(5-p.b):.3};
  return shuf(pool.map(w=>({w,k:Math.random()*wt(w)})).sort((a,b)=>b.k-a.k).slice(0,n).map(x=>x.w));
};
const due=()=>{const now=Date.now();return deck.filter(w=>sel.has(w.l)&&prog[w.h]&&prog[w.h].d<=now)};

window.xToday=()=>{
  const td=day(),n=daily.date===td?daily.n:0,g=daily.goal,du=due().length,sk=daily.last===td||daily.last===day(-1)?daily.streak:0;
  return `<section class="card"><h2>${t("Today")}</h2>
  <div class="stats"><div><b>${sk}</b><span>${t("Day streak")}</span></div><div><b>${n}/${g}</b><span>${t("Daily goal")}</span></div><div><b>${du}</b><span>${t("Due for review")}</span></div></div>
  <div class="prog"><i style="width:${Math.min(100,n/g*100)}%"></i></div>
  <div class="row"><button id="xr" ${du?"":"disabled"}>${t("Review due words")}</button>
  <label class="hint">${t("Goal")} <input type="number" id="xg" min="1" max="200" value="${g}" style="width:64px"></label>
  <label class="hint"><input type="checkbox" id="xm" ${mute?"":"checked"}> ${t("Sound")}</label></div></section>
  <section class="card"><h2>${t("Share")}</h2><div class="row"><button class="ghost" id="xs" ${deck.length||sents.length?"":"disabled"}>${t("Share selected lessons")}</button>
  <input id="xi" maxlength="6" placeholder="${t("Share code")}" style="width:110px;text-transform:uppercase"><button class="ghost" id="xo">${t("Import")}</button></div><div id="xsm" class="hint" role="status"></div></section>
  <section class="card"><h2>${t("Weekly leaderboard")}</h2><ol id="lb" class="miss"></ol><div id="lbm" class="hint"></div></section>`;
};
window.xBind=()=>{
  const g=$("#xg");if(!g)return;
  g.onchange=()=>{daily.goal=Math.max(1,+g.value||10);xChanged();home()};
  $("#xm").onchange=e=>{mute=!e.target.checked;sv()};
  $("#xr").onclick=()=>{const c=$("#cnt"),q=xPick(due(),c?+c.value||10:10);if(q.length)run("write",q)};
  $("#xs").onclick=share;$("#xo").onclick=imp;lb();
};

async function share(){
  const m=$("#xsm"),ws=deck.filter(w=>sel.has(w.l)),ss=sents.filter(w=>sel.has(w.l));
  if(!SB||!(ws.length||ss.length))return;
  const code=Array.from({length:6},()=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.random()*32|0]).join("");
  const{error}=await SB.from("shared_decks").insert({code,data:{deck:ws,sents:ss}});
  m.textContent=error?error.message:t("Your share code: {0}",code);
}
async function imp(){
  const m=$("#xsm"),c=$("#xi").value.trim().toUpperCase();
  if(!SB||c.length!=6)return;
  const{data}=await SB.from("shared_decks").select("data").eq("code",c).maybeSingle();
  if(!data){m.textContent=t("Code not found.");return}
  const d=data.data||{},okw=w=>w&&typeof w.h=="string"&&typeof w.p=="string"&&typeof w.m=="string"&&typeof w.l=="string";
  const A=(a,b)=>{const k=new Set(a.map(w=>w.h+"|"+w.l));b.filter(okw).forEach(w=>{if(!k.has(w.h+"|"+w.l)){a.push(w);sel.add(w.l)}});return a};
  deck=A(deck,(d.deck||[]).filter(w=>CJK.test(w.h)));
  sents=A(sents,(d.sents||[]).filter(w=>Array.isArray(w.t)&&w.t.every(x=>typeof x=="string")));
  save();home();
}
async function lb(){
  const o=$("#lb"),m=$("#lbm");if(!o)return;
  if(!user){m.textContent=t("Sign in to join the leaderboard.");return}
  const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));
  try{
    const{data}=await SB.from("scores").select("user_id,name,points").gte("created_at",d.toISOString()).limit(1000);
    const a={};(data||[]).forEach(r=>{const x=a[r.user_id]||(a[r.user_id]={name:r.name,s:0});x.s+=r.points});
    const top=Object.values(a).sort((x,y)=>y.s-x.s).slice(0,10);
    o.innerHTML=top.map((x,i)=>`<li>${i+1}. ${esc(x.name)} <span class="hint">${x.s}</span></li>`).join("");
    if(!top.length)m.textContent=t("No scores yet this week.");
  }catch(e){}
}
window.xScore=async p=>{if(!user||!SB||!p)return;try{await SB.from("scores").insert({name:displayName()||"?",points:p})}catch(e){}};
})();
