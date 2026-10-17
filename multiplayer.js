(()=>{
const st=document.createElement("style");
st.textContent=`.code{font:700 3.2rem var(--hz);letter-spacing:.18em;margin:4px 0}.pl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}.chip{border:1px solid var(--line);border-radius:20px;padding:4px 12px}input:not([type]),input[type=number]{font:inherit;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)}`;
document.head.append(st);

let G=null;
const rid=()=>{try{let i=sessionStorage.getItem("hz-id");if(!i){i=Math.random().toString(36).slice(2,10);sessionStorage.setItem("hz-id",i)}return i}catch(e){return Math.random().toString(36).slice(2,10)}};
const send=p=>G.ch.send({type:"broadcast",event:"m",payload:p});
const players=()=>Object.entries(G.ch.presenceState()).map(([id,v])=>({id,name:v[0].name,host:!!v[0].host}));
const bd=b=>`<ol class="miss">${b.map((x,i)=>`<li>${i+1}. ${esc(x.name)} <span class="hint">${x.score}</span></li>`).join("")}</ol>`;
const speed=(ms,lim)=>Math.max(0,1-ms/(lim*1000));

window.mpCard=()=>`<section class="card"><h2>Play with classmates</h2>
<div class="row">${deck.length||sents.length?'<button id="mh">Host a game</button>':'<span class="hint">Load a word list to host a game.</span>'}</div>
<div class="row"><input id="mc" inputmode="numeric" maxlength="6" placeholder="Room code" style="width:120px"><input id="mn" maxlength="14" placeholder="Nickname" style="width:150px"><button class="ghost" id="mj">Join</button></div>
<div id="me" class="hint" aria-live="polite"></div></section>`;
window.mpBind=()=>{
  const h=$("#mh");if(h)h.onclick=hostSetup;
  $("#mj").onclick=()=>{const c=$("#mc").value.trim(),n=$("#mn").value.trim();
    if(!/^\d{6}$/.test(c)||!n){$("#me").textContent="Enter the 6-digit room code and a nickname.";return}
    connect(c,n,false)};
};

function hostSetup(){
  const ws=deck.filter(w=>sel.has(w.l)),ss=sents.filter(w=>sel.has(w.l));
  const row=(id,label,sec,ok,why)=>`<label class="ls"><input type="checkbox" id="t${id}" ${ok?"checked":"disabled"}> ${label}, seconds <input type="number" id="l${id}" value="${sec}" min="5" max="300" style="width:70px"> ${ok?"":`<span class="hint">${why}</span>`}</label>`;
  app.innerHTML=`<section class="card"><h2>Game settings</h2>
  <label class="ls">Questions <input type="number" id="gn" value="10" min="1" max="50" style="width:70px"></label>
  <p class="hint">Tick one type for a single-type game, or several to mix them.</p>
  ${row("q","Meaning quiz",15,deck.length>=4&&ws.length>0,"Needs at least 4 words in your list")}
  ${row("w","Write on screen",45,ws.length>0,"No words in the selected lessons")}
  ${row("a","Arrange sentence",30,ss.length>0,"Add [S] sentence lines to your file")}
  <p class="hint">Selected lessons have ${ws.length} words and ${ss.length} sentences.</p>
  <div class="row"><button id="go">Create room</button><button class="ghost" id="bk">Back</button></div></section>`;
  $("#bk").onclick=home;
  $("#go").onclick=()=>{
    const on=id=>{const e=$("#t"+id);return !!e&&e.checked};
    const s={n:+$("#gn").value||10,tq:on("q"),tw:on("w"),ta:on("a"),lq:+$("#lq").value||15,lw:+$("#lw").value||45,la:+$("#la").value||30,ws,ss};
    if(!(s.tq||s.tw||s.ta)){alert("Tick at least one question type.");return}
    const name=(prompt("Your nickname","Host")||"Host").slice(0,14);
    connect(String(100000+Math.floor(Math.random()*900000)),name,true,s);
  };
}

function connect(code,name,host,s){
  if(typeof supabase=="undefined"){alert("The connection library did not load. Check your internet connection.");return}
  if(G)leave(true);
  G={code,name,host,s,id:rid(),miss:[],score:{}};
  G.sb=supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseKey);
  G.ch=G.sb.channel("hz-"+code,{config:{broadcast:{self:true},presence:{key:G.id}}});
  G.ch.on("broadcast",{event:"m"},({payload})=>onMsg(payload)).on("presence",{event:"sync"},sync)
    .subscribe(status=>{
      if(status==="SUBSCRIBED"){G.ch.track({name,host});lobby();
        if(!host)setTimeout(()=>{if(G&&!G.on&&!players().some(p=>p.host)){leave(true);home();alert("Room not found. Check the code and try again.")}},3000)}
      else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"){if(G){leave(true);home();alert("Could not connect to the game server. Try again.")}}
    });
}
function leave(quiet){
  if(G){try{G.ch.unsubscribe();G.sb.removeAllChannels()}catch(e){}clearTimeout(G.tm);clearInterval(G.iv);G=null}
  if(!quiet)home();
}
function sync(){
  if(!G)return;
  if(G.on&&!G.ended&&!G.host&&!players().some(p=>p.host)){leave(true);home();alert("The host left the game.");return}
  lobby();
}
function lobby(){
  if(!G||G.on)return;
  const ps=players();
  app.innerHTML=`<section class="card q"><p class="hint">Room code</p><div class="code">${G.code}</div>
  <p class="hint">${G.host?"Share this code with your classmates, then start.":"Waiting for the host to start."}</p>
  <div class="pl">${ps.map(p=>`<span class="chip">${esc(p.name)}</span>`).join("")}</div>
  <div class="row">${G.host?'<button id="gs">Start game</button>':""}<button class="ghost" id="lv">Leave</button></div></section>`;
  $("#lv").onclick=()=>leave();
  if(G.host)$("#gs").onclick=hostRun;
}

async function hostRun(){
  const s=G.s,types=[s.tq&&"quiz",s.tw&&"write",s.ta&&"arrange"].filter(Boolean),wp=shuf(s.ws),sp=shuf(s.ss),qs=[];
  for(let i=0;i<s.n;i++){
    const av=types.filter(t=>t=="arrange"?sp.length:wp.length);
    if(!av.length)break;
    const type=av[Math.random()*av.length|0];
    qs.push({type,w:type=="arrange"?sp.pop():wp.pop()});
  }
  for(let i=0;i<qs.length;i++){
    const{type,w}=qs[i],lim={quiz:s.lq,write:s.lw,arrange:s.la}[type];
    let opts,ci,toks;
    if(type=="quiz"){const o=shuf([w,...shuf(deck.filter(x=>x.m!==w.m)).slice(0,3)]);opts=o.map(x=>x.m);ci=o.indexOf(w)}
    if(type=="arrange")toks=shuf(w.t);
    G.cur={i,ans:{}};
    send({t:"q",i,n:qs.length,type,lim,w:{h:w.h,p:w.p,m:w.m},opts,toks});
    await new Promise(r=>{G.done=r;G.tm=setTimeout(r,(lim+3)*1000)});
    if(!G)return;
    const ps=players();
    ps.forEach(p=>{
      const a=G.cur.ans[p.id];let pts=0,ok=false;
      if(a){
        if(type=="quiz"){ok=a.pick===ci;if(ok)pts=Math.round(500+500*speed(a.ms,lim))}
        else if(type=="arrange"){ok=Array.isArray(a.ord)&&a.ord.length==toks.length&&a.ord.map(k=>toks[k]).join("")==w.t.join("");if(ok)pts=Math.round(500+500*speed(a.ms,lim))}
        else{ok=!!a.ok;const f=a.total>0?Math.min(1,a.done/a.total):0;
          pts=Math.max(0,Math.round(700*f)+(ok?Math.round(300*speed(a.ms,lim)):0)-15*(a.miss||0))}
      }
      G.score[p.id]=(G.score[p.id]||0)+pts;G.cur.ans[p.id]={ok,pts};
    });
    const board=ps.map(p=>({id:p.id,name:p.name,score:G.score[p.id]||0,pts:G.cur.ans[p.id].pts,ok:G.cur.ans[p.id].ok})).sort((a,b)=>b.score-a.score);
    const last=i==qs.length-1;
    send({t:last?"end":"r",board,right:type=="quiz"?opts[ci]:type=="arrange"?w.t.join(" "):w.h});
    if(last)return;
    await new Promise(r=>setTimeout(r,5000));
    if(!G)return;
  }
}

function onMsg(m){
  if(!G)return;
  if(m.t=="a"){
    if(G.host&&G.cur&&m.i===G.cur.i&&!G.cur.ans[m.id]){G.cur.ans[m.id]=m;
      if(Object.keys(G.cur.ans).length>=players().length){clearTimeout(G.tm);G.done&&G.done()}}
  }else if(m.t=="q"){G.on=true;G.q=m;G.sent=false;gq(m)}
  else if(m.t=="r"||m.t=="end"){
    clearInterval(G.iv);G.on=true;
    const me=m.board.find(b=>b.id==G.id);if(me&&!me.ok&&G.q)G.miss.push({...G.q.w,s:G.q.type=="arrange"});
    if(m.t=="end"){G.ended=true;fin(m)}else res(m);
  }
}

function submit(a){
  if(!G||G.sent)return;
  G.sent=true;clearInterval(G.iv);
  send({t:"a",id:G.id,i:G.q.i,...a});
  const c=$(".q");if(c)c.innerHTML=`<p class="py">Answer sent</p><p class="hint">Waiting for the other players.</p>`;
}
function gframe(m,inner,onTimeout){
  app.innerHTML=`<div class="bar"><span>${m.i+1} / ${m.n}</span><div class="prog"><i id="tb" style="width:100%"></i></div><span id="tt">${m.lim}</span></div><section class="card q">${inner}</section>`;
  const t0=Date.now();clearInterval(G.iv);
  G.iv=setInterval(()=>{
    const left=Math.max(0,m.lim-(Date.now()-t0)/1000),b=$("#tb");
    if(b){b.style.width=left/m.lim*100+"%";$("#tt").textContent=Math.ceil(left)}
    if(left<=0)onTimeout();
  },200);
  return t0;
}
function gq(m){
  if(m.type=="quiz"){
    let pick=-1;
    const t0=gframe(m,`<div class="hz">${esc(m.w.h)}</div><p class="py">${esc(m.w.p)}</p><div class="opts">${m.opts.map((x,i)=>`<button class="opt" data-i="${i}">${esc(x)}</button>`).join("")}</div><div class="row"><button id="cf" disabled>Confirm answer</button></div>`,
      ()=>submit({pick,ms:m.lim*1000}));
    const bs=[...app.querySelectorAll(".opt")];
    bs.forEach(b=>b.onclick=()=>{pick=+b.dataset.i;bs.forEach(x=>x.classList.toggle("on",x==b));$("#cf").disabled=false});
    $("#cf").onclick=()=>submit({pick,ms:Date.now()-t0});
    return;
  }
  if(m.type=="arrange"){
    const ord=[];
    const t0=gframe(m,`<p class="mn">${esc(m.w.m)}</p><p class="py">${esc(m.w.p)}</p><div class="pl" id="ar" style="min-height:56px;border-bottom:2px solid var(--line)"></div><div class="pl" id="pool"></div><div class="row"><button id="cf" disabled>Confirm answer</button></div>`,
      ()=>submit({ord,ms:m.lim*1000}));
    const draw=()=>{
      $("#ar").innerHTML=ord.map((k,j)=>`<button class="ghost hz-s" data-r="${j}">${esc(m.toks[k])}</button>`).join("");
      $("#pool").innerHTML=m.toks.map((x,k)=>ord.includes(k)?"":`<button class="ghost hz-s" data-k="${k}">${esc(x)}</button>`).join("");
      $("#cf").disabled=ord.length!=m.toks.length;
      app.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{ord.splice(+b.dataset.r,1);draw()});
      app.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{ord.push(+b.dataset.k);draw()});
    };
    draw();
    $("#cf").onclick=()=>submit({ord,ms:Date.now()-t0});
    return;
  }
  const P={done:0,total:0,miss:0};
  const t0=gframe(m,`<p class="py">${esc(m.w.p)}</p><p class="mn">${esc(m.w.m)}</p><div class="boxes" id="bx"></div><p id="st2" class="hint">Loading characters</p>`,
    ()=>submit({ok:false,done:P.done,total:P.total,miss:P.miss,ms:m.lim*1000}));
  const chars=[...m.w.h].filter(c=>CJK.test(c));
  if(typeof HanziWriter=="undefined"||!chars.length)return submit({ok:false,done:0,total:0,miss:0,ms:0});
  Promise.all(chars.map(c=>HanziWriter.loadCharacterData(c))).then(ds=>{
    if(!G||G.sent||G.q!==m)return;
    P.total=ds.reduce((a,d)=>a+d.strokes.length,0);const max=2*P.total,W=[];
    const ink=getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(),sz=chars.length>2?160:220;
    const info=()=>{const e=$("#st2");if(e)e.textContent=`Strokes done: ${P.done} of ${P.total}. Wrong strokes: ${P.miss} of ${max} allowed`};info();
    chars.forEach(c=>{const d=document.createElement("div");d.className="tzg";$("#bx").append(d);
      W.push(HanziWriter.create(d,c,{width:sz,height:sz,padding:12,showCharacter:false,showOutline:false,strokeColor:ink,drawingColor:ink,highlightColor:"#c0222f",leniency:1.3}))});
    const fail=()=>{W.forEach(x=>x.cancelQuiz());submit({ok:false,done:P.done,total:P.total,miss:P.miss,ms:Date.now()-t0})};
    const go=k=>W[k].quiz({
      onCorrectStroke:()=>{if(!G||G.sent)return;P.done++;info()},
      onMistake:()=>{if(!G||G.sent)return;P.miss++;info();if(P.miss>max)fail()},
      onComplete:()=>{if(!G||G.sent)return;if(k+1<W.length)return go(k+1);submit({ok:true,done:P.done,total:P.total,miss:P.miss,ms:Date.now()-t0})}});
    go(0);
  }).catch(()=>submit({ok:false,done:0,total:0,miss:0,ms:0}));
}

function res(m){
  const me=m.board.find(b=>b.id==G.id)||{};
  app.innerHTML=`<section class="card"><h2>${me.ok?"Correct":me.pts?"Partly done":"Not this time"}${me.pts?" +"+me.pts:""}</h2><p class="hint">Answer: <b>${esc(m.right)}</b></p>${bd(m.board.slice(0,5))}<p class="hint">The next question starts soon.</p></section>`;
}
function fin(m){
  const ms=G.miss.filter(w=>!w.s).map(w=>({...w,l:"Missed"})),all=G.miss;
  app.innerHTML=`<section class="card"><h2>Final scores</h2>${bd(m.board)}
  ${all.length?`<h3>Your missed words</h3><ul class="miss">${all.map(w=>`<li><span class="hz-s">${esc(w.h)}</span><span>${esc(w.p)}</span><span class="hint">${esc(w.m)}</span></li>`).join("")}</ul>`:"<p>You answered everything correctly.</p>"}
  <div class="row">${ms.length?'<button id="pm">Practise missed words</button>':""}<button class="ghost" id="hm2">Back to start</button></div></section>`;
  if(ms.length)$("#pm").onclick=()=>{leave(true);run("write",shuf(ms))};
  $("#hm2").onclick=()=>leave();
}
})();
