(()=>{
const day=(o=0)=>{const d=new Date(Date.now()+o*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
let prog=ld("zw-prog",{}),daily=ld("zw-daily",{date:"",n:0,goal:10,streak:0,last:""}),mute=ld("zw-mute",false),ts=+ld("zw-ts",0),pt;
const sv=()=>{try{localStorage.setItem("zw-prog",JSON.stringify(prog));localStorage.setItem("zw-daily",JSON.stringify(daily));localStorage.setItem("zw-mute",JSON.stringify(mute));localStorage.setItem("zw-ts",String(ts))}catch(e){}};
const st=document.createElement("style");
st.textContent=`.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 12px;text-align:center}.stats b{display:block;font:800 1.7rem var(--hz)}.stats span{font-size:12.5px;color:var(--mut)}.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:12px 18px;border-radius:12px;font-weight:700;box-shadow:var(--sh);animation:tin .3s;z-index:9}@keyframes tin{from{opacity:0;margin-bottom:-12px}}.qr{width:170px;margin:10px auto;background:#fff;padding:6px;border-radius:10px}.qr svg{width:100%;height:auto;display:block}.opt.right,.opt.wrong{animation:bump .3s}@keyframes bump{50%{transform:scale(1.03)}}`;
document.head.append(st);

const st2=document.createElement("style");
st2.textContent=`.s4{grid-template-columns:repeat(4,1fr)}.s4 b{font-size:1.4rem}.s4>div:nth-child(2) b{color:#059669}.s4>div:nth-child(3) b{color:var(--red)}.s4>div:nth-child(4) b{color:#0284c7}
.flame{display:inline-block;animation:flick .9s infinite alternate}.flame.sm{font-size:1.1rem;vertical-align:middle}
.fire{position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.5);z-index:20;animation:fin .25s}
.fire-in{position:relative;background:var(--card);color:var(--ink);padding:28px 40px;border-radius:26px;text-align:center;box-shadow:var(--sh);animation:pop3 .5s cubic-bezier(.2,1.4,.4,1)}
.fire-in .flame{font-size:5.5rem;line-height:1;filter:drop-shadow(0 0 18px #ff9f1a)}.fire-n{font:800 1.6rem var(--hz);margin-top:6px}.fire-s{color:var(--mut)}
.sp{position:absolute;left:50%;top:40%;width:8px;height:8px;border-radius:50%;background:#ffb020;opacity:0;animation:rise 1.4s ease-out forwards;animation-delay:var(--d)}
@keyframes flick{from{transform:scale(.94) rotate(-4deg)}to{transform:scale(1.08) rotate(4deg)}}@keyframes pop3{from{transform:scale(.6);opacity:0}}
@keyframes rise{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--x),-170px)}}@keyframes fin{from{opacity:0}}`;
document.head.append(st2);
let ac;
const beep=(f,d,o=0)=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const s=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime+o;s.frequency.value=f;g.gain.setValueAtTime(.12,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);s.connect(g);g.connect(ac.destination);s.start(n);s.stop(n+d)}catch(e){}};
window.xSnd=ok=>{if(mute)return;ok?(beep(660,.12),beep(880,.18,.1)):beep(170,.3)};
const toast=m=>{const e=document.createElement("div");e.className="toast";e.textContent=m;document.body.append(e);setTimeout(()=>e.remove(),2600)};

const push=()=>{
  if(typeof user=="undefined"||!user||!SB)return;
  clearTimeout(pt);
  pt=setTimeout(async()=>{try{await SB.from("user_data").upsert({user_id:user.id,data:{deck,sents,sel:[...sel],prog,daily,arch},updated_at:new Date(ts).toISOString()})}catch(e){}},1500);
};
window.xChanged=()=>{ts=Date.now();sv();push()};
window.xPull=async()=>{
  if(!user||!SB)return;
  try{
    const{data}=await SB.from("user_data").select("data,updated_at").eq("user_id",user.id).maybeSingle();
    if(data&&Date.parse(data.updated_at)>ts+1000){
      const d=data.data||{};deck=d.deck||[];sents=d.sents||[];arch=d.arch||{deck:[],sents:[]};sel=new Set(d.sel||[]);prog=d.prog||{};daily=d.daily||daily;ts=Date.parse(data.updated_at);sv();
      try{localStorage.setItem("hz-deck",JSON.stringify({deck,sents,arch,sel:[...sel]}))}catch(e){}
      if(app.querySelector(".grid"))home();
    }else if((deck.length||sents.length)&&(!data||ts>Date.parse(data.updated_at)+1000)){if(!ts)ts=Date.now();push()}
  }catch(e){}
};

window.xRec=(w,ok)=>{
  xSnd(ok);
  const k=w.h,p=prog[k]||{b:0,d:0,r:0,x:0},now=Date.now();
  if(ok){if(!p.r)p.f=now;p.b=Math.min(5,p.b+1);p.d=now+[0,1,2,4,8,16][p.b]*864e5;p.r++}else{p.b=0;p.d=now;p.x++}
  prog[k]=p;
  const td=day();if(daily.date!==td){daily.date=td;daily.n=0}
  if(daily.last!==td){daily.streak=(daily.last===day(-1)?daily.streak:0)+1;daily.last=td;setTimeout(()=>fire(daily.streak),700)}
  daily.n++;if(daily.n===daily.goal){toast(t("Daily goal reached!"));setTimeout(()=>xSnd(true),400)}
  xChanged();
};
window.xPick=(pool,n)=>{
  const now=Date.now(),wt=w=>{const p=prog[w.h];return !p?2:p.d<=now?3+(5-p.b):.3};
  return shuf(pool.map(w=>({w,k:Math.random()*wt(w)})).sort((a,b)=>b.k-a.k).slice(0,n).map(x=>x.w));
};
const due=()=>{const now=Date.now();return deck.filter(w=>sel.has(w.l)&&prog[w.h]&&prog[w.h].d<=now)};
const newCounts=()=>{
  const d=new Date();d.setHours(0,0,0,0);const a0=d.getTime(),w=new Date(d);w.setDate(w.getDate()-((w.getDay()+6)%7));
  const w0=w.getTime(),m0=new Date(d.getFullYear(),d.getMonth(),1).getTime();let all=0,dy=0,wk=0,mo=0;
  Object.values(prog).forEach(p=>{if(p.r>0)all++;if(p.f){if(p.f>=a0)dy++;if(p.f>=w0)wk++;if(p.f>=m0)mo++}});
  return{today:dy,week:wk,month:mo,all};
};
function fire(n){
  const o=document.createElement("div");o.className="fire";
  const sp=Array.from({length:16},()=>`<i class="sp" style="--x:${Math.round(Math.random()*240-120)}px;--d:${(Math.random()*.6).toFixed(2)}s"></i>`).join("");
  o.innerHTML=`<div class="fire-in">${sp}<div class="flame">🔥</div><div class="fire-n">${t("{0}-day streak!",n)}</div><div class="fire-s">${t("Keep it burning!")}</div></div>`;
  o.onclick=()=>o.remove();document.body.append(o);setTimeout(()=>o.remove(),3200);
}

window.xToday=()=>{
  const td=day(),n=daily.date===td?daily.n:0,g=daily.goal,du=due().length,sk=daily.last===td||daily.last===day(-1)?daily.streak:0;
  return `<section class="card c-today"><h2>${t("Today")}</h2>
  <div class="stats s4"><div><b>${sk?`<span class="flame sm">🔥</span> `:""}${sk}</b><span>${t("Day streak")}</span></div><div><b>${newCounts().today}</b><span>${t("New words today")}</span></div><div><b>${n}/${g}</b><span>${t("Daily goal")}</span></div><div><b>${du}</b><span>${t("Due for review")}</span></div></div>
  <div class="prog"><i style="width:${Math.min(100,n/g*100)}%"></i></div>
  <div class="row"><button id="xr" ${du?"":"disabled"}>${t("Review due words")}</button>
  <label class="hint">${t("Goal")} <input type="number" id="xg" min="1" max="200" value="${g}" style="width:64px"></label>
  <label class="hint"><input type="checkbox" id="xm" ${mute?"":"checked"}> ${t("Sound")}</label></div></section>
  <section class="card c-share"><h2>${t("Share")}</h2><div class="row"><button class="ghost" id="xs" ${deck.length||sents.length?"":"disabled"}>${t("Share selected lessons")}</button>
  <input id="xi" maxlength="6" placeholder="${t("Share code")}" style="width:150px;text-transform:uppercase"><button class="ghost" id="xo">${t("Import")}</button></div><div id="xsm" class="hint" role="status"></div></section>
  <section class="card c-board"><h2>${t("Weekly leaderboard")}</h2><div id="lb"></div><div id="lbm" class="hint"></div></section>`;
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
    o.innerHTML=top.length?xPodium(top.map(x=>({name:x.name,score:x.s}))):"";
    if(!top.length)m.textContent=t("No scores yet this week.");
  }catch(e){}
}
const st3=document.createElement("style");
st3.textContent=`.podwrap{position:relative;overflow:hidden;padding-top:4px}
.podium{display:flex;align-items:flex-end;justify-content:center;gap:10px;min-height:250px;margin:10px 0 14px}
.pcol{flex:1;max-width:118px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0}
.r1{--dl:1s}.r2{--dl:.6s}.r3{--dl:.2s}
.pname{font-weight:800;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;opacity:0;animation:fup .5s ease-out forwards;animation-delay:calc(var(--dl) + .55s)}
.pscore{font:800 1.15rem var(--hz);margin:2px 0 6px;opacity:0;animation:fup .5s ease-out forwards;animation-delay:calc(var(--dl) + .6s)}
.crown{display:block;font-size:1.7rem;line-height:1;animation:bob 1.2s ease-in-out infinite}
.pbar{width:100%;height:var(--h);border-radius:14px 14px 4px 4px;display:flex;justify-content:center;padding-top:8px;font:800 1.7rem var(--hz);color:#3b2a00;transform-origin:bottom;animation:rise2 .8s cubic-bezier(.2,.9,.3,1.15) var(--dl) both}
.r1 .pbar{background:linear-gradient(#fde68a,#f59e0b);box-shadow:0 0 28px -6px #f59e0b}.r2 .pbar{background:linear-gradient(#f3f4f6,#9ca3af)}.r3 .pbar{background:linear-gradient(#fdba74,#b45309);color:#fff}
.me .pbar{outline:3px solid var(--red);outline-offset:2px}.me .pname{color:var(--red)}
.bars{display:grid;gap:8px}.prow{display:grid;grid-template-columns:26px minmax(60px,1fr) minmax(60px,1.4fr) auto;gap:10px;align-items:center;opacity:0;animation:fup .4s ease-out forwards;animation-delay:calc(var(--base,.1s) + var(--i)*.12s)}
.podwrap .prow{--base:1.6s}.prow .rk{font-weight:800;color:var(--mut);text-align:center}.prow .pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.prow b{font-variant-numeric:tabular-nums}
.pb2{height:12px;background:var(--soft);border-radius:6px;overflow:hidden}.pb2 i{display:block;height:100%;width:var(--w);border-radius:6px;background:linear-gradient(90deg,var(--red),var(--acc2));transform-origin:left;animation:grow .8s ease-out both;animation-delay:calc(var(--base,.1s) + var(--i)*.12s + .15s)}
.prow.me .pn{color:var(--red)}
.cf{position:absolute;top:-12px;left:var(--l);width:8px;height:12px;border-radius:2px;background:var(--c);opacity:0;animation:fall 2.8s linear var(--d) forwards;pointer-events:none}
.cd{display:flex;flex-direction:column;align-items:center;gap:2px;margin-top:14px}.cd b{font:800 3.4rem/1.1 var(--hz);color:var(--red);min-height:1.1em}.cd b.big{font-size:6rem}.cd b.tick{animation:tick .6s}
@keyframes rise2{from{height:0}to{height:var(--h)}}@keyframes fup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes grow{from{transform:scaleX(0)}}@keyframes bob{50%{transform:translateY(-5px) rotate(6deg)}}
@keyframes fall{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(340px) rotate(540deg)}}@keyframes tick{from{transform:scale(1.7);opacity:.2}}
@media(prefers-reduced-motion:reduce){.pbar,.pb2 i,.cf,.crown,.pname,.pscore,.prow{animation:none!important;opacity:1}.cf{display:none}}`;
document.head.append(st3);
window.xBars=(items,start=1,top)=>{
  top=top||Math.max(1,...items.map(x=>x.score));
  return `<div class="bars">${items.map((x,i)=>`<div class="prow${x.me?" me":""}" style="--i:${i}"><span class="rk">${start+i}</span><span class="pn">${esc(x.name)}</span><div class="pb2"><i style="--w:${Math.max(4,x.score/top*100)}%"></i></div><b>${x.score}</b></div>`).join("")}</div>`;
};
window.xPodium=(items,conf)=>{
  if(!items.length)return "";
  const H=[150,115,85],order=[1,0,2].filter(i=>items[i]),top=Math.max(1,items[0].score);
  const col=i=>{const x=items[i];return `<div class="pcol r${i+1}${x.me?" me":""}"><div class="pname">${i==0?`<span class="crown">👑</span>`:""}${esc(x.name)}</div><div class="pscore">${x.score}</div><div class="pbar" style="--h:${H[i]}px"><span>${i+1}</span></div></div>`};
  const cf=conf?Array.from({length:28},(_,k)=>`<i class="cf" style="--l:${Math.round(Math.random()*100)}%;--d:${(Math.random()*1.8).toFixed(2)}s;--c:${["#f59e0b","#f43f5e","#0ea5e9","#10b981","#8b5cf6"][k%5]}"></i>`).join(""):"";
  return `<div class="podwrap">${cf}<div class="podium">${order.map(col).join("")}</div>${items.length>3?xBars(items.slice(3),4,top):""}</div>`;
};
window.xScore=async p=>{if(!user||!SB||!p)return;try{await SB.from("scores").insert({name:displayName()||"?",points:p})}catch(e){}};
window.xStats=()=>{const v=Object.values(prog),r=v.reduce((a,p)=>a+p.r,0),x=v.reduce((a,p)=>a+p.x,0),td=day();return{streak:daily.last===td||daily.last===day(-1)?daily.streak:0,goal:daily.goal,today:daily.date===td?daily.n:0,nw:newCounts(),mastered:v.filter(p=>p.b>=5).length,acc:r+x?Math.round(r/(r+x)*100):0,total:r+x,due:due().length}};
window.xWeek=async()=>{if(!user||!SB)return 0;const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));try{const{data}=await SB.from("scores").select("points").eq("user_id",user.id).gte("created_at",d.toISOString());return(data||[]).reduce((a,r)=>a+r.points,0)}catch(e){return 0}};
})();
