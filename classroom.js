(()=>{
const CL={classes:[],owned:[],isT:false,decks:{},last:0,panel:null,uid:null};
let busy=false,CID=null;
const st=document.createElement("style");
st.textContent=`.cls .clshead{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}.cls h2{margin:0}
.role{display:inline-block;font-size:11px;font-weight:800;border-radius:6px;padding:2px 8px;margin-left:8px;background:var(--soft);color:var(--mut);vertical-align:middle}.role.t{background:color-mix(in srgb,var(--red) 18%,transparent);color:var(--red)}
.cbar{height:7px;background:var(--soft);border-radius:4px;overflow:hidden;position:relative}.cbar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px}.cbar .l{background:color-mix(in srgb,var(--red) 38%,transparent)}.cbar .m{background:linear-gradient(90deg,var(--red),var(--acc2))}
.code2{font:800 2.3rem var(--hz);letter-spacing:.2em;color:var(--red);margin:4px 0}
.stu{padding:12px 0;border-bottom:1px solid var(--soft)}.stu:last-child{border-bottom:0}.stu .sh{display:flex;gap:10px;align-items:center}.stu .sn{flex:1;min-width:0;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stu summary{list-style:none;cursor:pointer}.stu summary::-webkit-details-marker{display:none}.stu summary .sh:after{content:"▾";color:var(--mut)}.stu[open] summary .sh:after{content:"▴"}.sdb{padding:6px 0 2px}.sdb h4{margin:12px 0 4px;font-size:.9rem}
.stu .ss{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--mut);margin:6px 0}.drw{margin:6px 0}.drw .dt{display:flex;justify-content:space-between;font-size:12.5px;gap:8px;margin-bottom:3px}
.mrow{display:grid;grid-template-columns:110px 1fr auto;gap:8px;align-items:center;font-size:12.5px;margin:4px 0}
@media(min-width:900px){.v-class{grid-template-columns:1fr 1fr;align-items:start}.v-class>.wide{grid-column:1/-1}}`;
document.head.append(st);

const ok=()=>typeof user!="undefined"&&user&&SB;
const ago=ts=>{if(!ts)return t("Never");const m=Math.floor((Date.now()-new Date(ts))/6e4);return m<1?t("just now"):m<60?t("{0} min ago",m):m<1440?t("{0} h ago",Math.floor(m/60)):t("{0} d ago",Math.floor(m/1440))};
const key=w=>w.h+"|"+w.l;
const strip=w=>({h:w.h,p:w.p,m:w.m,l:w.l,...(w.t?{t:w.t}:{})});
const owns=id=>CL.owned.some(c=>c.id===id);
const pct=(a,b)=>b?Math.round(a/b*100):0;

function reconcile(){
  let changed=false;
  const cids=new Set(CL.classes.map(c=>c.class_id));
  let nd=deck.filter(w=>!w.c||cids.has(w.c)),ns=sents.filter(w=>!w.c||cids.has(w.c));
  CL.classes.forEach(c=>{
    const rows=CL.decks[c.class_id]||[],want=[],wantS=[];
    rows.forEach(r=>{(r.words||[]).forEach(w=>want.push({...w,l:r.deck,c:c.class_id}));(r.sents||[]).forEach(w=>wantS.push({...w,l:r.deck,c:c.class_id}))});
    nd=nd.filter(w=>w.c!==c.class_id);ns=ns.filter(w=>w.c!==c.class_id);
    const own=new Set([...nd,...ns].map(key));
    nd=[...nd,...dedupe(want).filter(w=>!own.has(key(w)))];ns=[...ns,...dedupe(wantS).filter(w=>!own.has(key(w)))];
    const bd=arch.deck.length,bs=arch.sents.length;
    arch.deck=arch.deck.filter(w=>w.c!==c.class_id);arch.sents=arch.sents.filter(w=>w.c!==c.class_id);
    if(arch.deck.length!==bd||arch.sents.length!==bs)changed=true;
  });
  if(JSON.stringify(nd)!==JSON.stringify(deck)||JSON.stringify(ns)!==JSON.stringify(sents)){deck=nd;sents=ns;changed=true}
  if(changed)save();
  return changed;
}
async function load(force){
  if(!ok()||busy)return false;
  if(CL.uid!==user.id)Object.assign(CL,{classes:[],owned:[],isT:false,decks:{},last:0,panel:null,uid:user.id});
  if(!force&&Date.now()-CL.last<60000)return false;
  busy=true;const sig=()=>JSON.stringify([CL.owned,CL.classes,CL.decks,CL.isT]),before=sig();let changed=false;
  try{
    const[a,b,c]=await Promise.all([SB.rpc("my_classes"),SB.from("classrooms").select("id,name,code,created_at").eq("teacher_id",user.id).order("created_at"),SB.from("teachers").select("user_id").eq("user_id",user.id).maybeSingle()]);
    if(a.error||b.error)throw(a.error||b.error);
    CL.classes=a.data||[];CL.owned=b.data||[];CL.isT=!!(c&&c.data)||CL.owned.length>0;CL.decks={};
    const ids=[...CL.classes.map(x=>x.class_id),...CL.owned.map(x=>x.id)];
    if(ids.length){const{data,error}=await SB.from("class_decks").select("class_id,deck,words,sents").in("class_id",ids);if(error)throw error;
      (data||[]).forEach(d=>{(CL.decks[d.class_id]=CL.decks[d.class_id]||[]).push(d)});Object.values(CL.decks).forEach(x=>x.sort((p,q)=>p.deck.localeCompare(q.deck)))}
    CL.last=Date.now();
    changed=reconcile()||sig()!==before;
  }catch(x){console.warn("classroom:",x&&x.message||x)}
  busy=false;return changed;
}

const badge=tc=>`<span class="role${tc?" t":""}">${LANG=="zh"?(tc?"老师":"学生"):t(tc?"Teacher":"Student")+" "+(tc?"老师":"学生")}</span>`;
const card=(id,name,tc,sub)=>`<section class="card cls"><div class="clshead"><div><h2 style="display:inline">${esc(name)}</h2>${badge(tc)}<p class="hint" style="margin:4px 0 0">${sub}</p></div><button data-cls="${id}">${t("Open")}</button></div></section>`;
const rows=()=>CL.owned.map(c=>card(c.id,c.name,true,t("{0} decks",(CL.decks[c.id]||[]).length))).join("")+CL.classes.map(c=>card(c.class_id,c.name,false,`${t("Teacher")}: ${esc(c.teacher_name)} · ${t("{0} decks",(CL.decks[c.class_id]||[]).length)}`)).join("");
window.clsHome=()=>ok()?rows():"";
window.clsLearn=()=>{
  if(typeof user=="undefined"||!user)return `<section class="card cls"><h2>${t("Classroom")}</h2><p class="hint">${t("Sign in to use the classroom.")}</p></section>`;
  return `${rows()}<section class="card cls"><h2>${t("Classroom")}</h2><div class="row" style="margin-top:6px"><input id="jc" maxlength="6" placeholder="${t("Class code")}" style="width:150px;text-transform:uppercase"><button id="jb">${t("Join a class")}</button></div>${CL.isT?`<div class="row"><input id="ncn" maxlength="60" placeholder="${t("Class name")}" style="flex:1;min-width:150px"><button class="ghost" id="ncb">${t("Create class")}</button></div>`:`<div class="row"><input id="tp" type="password" placeholder="${t("Teacher password")}" style="width:190px" autocomplete="off"><button class="ghost" id="tb">${t("Become a laoshi")}</button></div>`}<div id="clm" class="hint" role="status" style="min-height:1.2em"></div></section>`;
};
window.clsData=()=>CL.classes.map(c=>({class_id:c.class_id,decks:CL.decks[c.class_id]||[]}));

async function join(){
  const m=$("#clm"),c=($("#jc").value||"").trim().toUpperCase();if(c.length!=6)return;
  const{error}=await SB.rpc("join_class",{p_code:c});
  if(error){m.textContent=/not found/i.test(error.message)?t("Class code not found."):error.message;return}
  await load(true);home();
}
async function becomeTeacher(){
  const m=$("#clm"),pw=$("#tp").value;
  const{error}=await SB.rpc("become_teacher",{pw});
  if(error){m.textContent=/wrong/i.test(error.message)?t("Wrong teacher password."):error.message;return}
  await load(true);if(CL.owned[0])openClass(CL.owned[0].id);else home();
}
async function createClass(){
  const m=$("#clm"),n=($("#ncn").value||"").trim();if(!n)return;
  const{error}=await SB.rpc("create_class",{p_name:n});
  if(error){m.textContent=error.message;return}
  await load(true);home();
}
function openClass(id){CID=id;TAB="class";window.scrollTo(0,0);CL.panel=null;home();loadPanel()}
async function loadPanel(){
  if(!CID||!ok())return;
  await load(true);
  if(owns(CID)){
    try{
      const[m,p]=await Promise.all([SB.from("class_members").select("student_id,joined_at").eq("class_id",CID),SB.from("class_progress").select("*").eq("class_id",CID)]);
      const ids=(m.data||[]).map(x=>x.student_id),prof={};
      if(ids.length){const{data}=await SB.from("profiles").select("user_id,name,avatar_v").in("user_id",ids);(data||[]).forEach(r=>{prof[r.user_id]=r})}
      CL.panel={members:m.data||[],progress:p.data||[],prof};
    }catch(x){console.warn("classroom:",x&&x.message||x)}
  }
  if(TAB=="class")home();
}

function deckRows(cid,manage){
  const rs=CL.decks[cid]||[];
  if(!rs.length)return `<p class="hint">${t("No decks yet.")}</p>`;
  return rs.map((r,i)=>{
    const ws=r.words||[],s=window.xProgStats?xProgStats(ws):{total:ws.length,learned:0,mastered:0};
    return `<div class="stu"><div class="sh"><span class="sn">${esc(r.deck)}</span><span class="hint">${t("{0} words, {1} sentences",ws.length,(r.sents||[]).length)}</span></div>
    <div class="drw"><div class="dt"><span>${t("{0} of {1} learned",s.learned,s.total)}</span><span>${t("{0}% memorized",pct(s.mastered,s.total))}</span></div><div class="cbar"><i class="l" style="width:${pct(s.learned,s.total)}%"></i><i class="m" style="width:${pct(s.mastered,s.total)}%"></i></div></div>
    <div class="row"><button class="sm" data-study="${i}">${t("Study")}</button>${manage?`<button class="ghost sm" data-rmd="${i}">${t("Remove")}</button>`:""}</div></div>`}).join("");
}
const bar=(l,m)=>`<div class="cbar"><i class="l" style="width:${l}%"></i><i class="m" style="width:${m}%"></i></div>`;
function studentsHTML(){
  const P=CL.panel;
  if(!P)return `<p class="hint">${t("Loading")}</p>`;
  if(!P.members.length)return `<p class="hint">${t("No students yet.")}</p>`;
  return P.members.map(m=>{
    const pr=P.prof[m.student_id]||{},rp=P.progress.filter(x=>x.student_id===m.student_id),sum=rp.find(x=>x.deck==="")||{};
    const last=rp.reduce((a,x)=>!a||x.updated_at>a?x.updated_at:a,null),dk=rp.filter(x=>x.deck!=="");
    const tl=dk.reduce((a,x)=>a+x.total,0),ln=dk.reduce((a,x)=>a+x.learned,0),ms=dk.reduce((a,x)=>a+x.mastered,0);
    const md=sum.modes||{},mt=Object.values(md).reduce((a,b)=>a+b,0);
    return `<details class="stu"><summary><div class="sh">${avHTML(avUrl(m.student_id,pr.avatar_v),pr.name||"?")}<span class="sn">${esc(pr.name||"?")}</span></div>
    <div class="ss"><span>${t("Last active")}: ${ago(last)}</span><span>🔥 ${sum.streak||0}</span><span>${t("This week")}: ${sum.new_week||0}</span><span>${t("Accuracy")}: ${pct(sum.correct||0,sum.answers||0)}%</span></div></summary>
    <div class="sdb"><div class="drw"><div class="dt"><b>${t("Class decks")}</b><span>${t("{0} of {1} learned",ln,tl)} · ${pct(ln,tl)}%</span></div>${bar(pct(ln,tl),pct(ms,tl))}</div>
    ${dk.map(x=>`<div class="drw"><div class="dt"><span>${esc(x.deck)}</span><span>${t("{0} of {1} learned",x.learned,x.total)}</span></div>${bar(pct(x.learned,x.total),pct(x.mastered,x.total))}</div>`).join("")}
    <h4>${t("Study methods")}</h4>${mt?Object.entries(md).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<div class="mrow"><span>${t(k=="game"?"Play":(MODE_LABEL[k]||k))}</span>${bar(pct(n,mt),pct(n,mt))}<b>${pct(n,mt)}%</b></div>`).join(""):`<p class="hint">-</p>`}
    <div class="row"><button class="ghost sm" data-rms="${m.student_id}">${t("Remove")}</button></div></div></details>`}).join("");
}
window.clsView=()=>{
  const id=CID,tc=owns(id),c=tc?CL.owned.find(x=>x.id===id):CL.classes.find(x=>x.class_id===id);
  const back=`<div class="wide"><button class="ghost sm" id="clb">${t("Back")}</button></div>`;
  if(!c)return `${back}<section class="card"><p class="hint">${t("Loading")}</p></section>`;
  if(!tc)return `${back}<section class="card cls wide"><div class="clshead"><div><h2 style="display:inline">${esc(c.name)}</h2>${badge(false)}<p class="hint" style="margin:6px 0 0;display:flex;align-items:center;gap:6px">${t("Teacher")}: ${avHTML(avUrl(c.teacher_id,c.teacher_av),c.teacher_name,"sm")}${esc(c.teacher_name)}</p></div><button class="ghost sm" id="clv">${t("Leave class")}</button></div></section>
    <section class="card cls wide"><h2>${t("Class decks")}</h2>${deckRows(id,false)}</section>`;
  return `${back}<section class="card cls"><div class="clshead"><div><h2 style="display:inline">${esc(c.name)}</h2>${badge(true)}</div><button class="ghost sm danger" id="cdl">${t("Delete class")}</button></div><h3>${t("Your class code")}</h3><div class="code2">${esc(c.code)}</div><p class="hint" style="margin:0">${t("Only you can see this code. Share it with your students.")}</p>
    <div class="row"><button class="ghost sm" id="ccp">${t("Copy")}</button><button class="ghost sm" id="cnw">${t("New code")}</button></div>
    <div class="row"><input id="cnm" value="${esc(c.name)}" maxlength="60" aria-label="${t("Class name")}" style="flex:1;min-width:160px"><button class="sm" id="csv">${t("Save")}</button></div></section>
    <section class="card cls"><div class="clshead"><h2>${t("Students")}</h2><button class="ghost sm" id="cre">${t("Refresh")}</button></div>${studentsHTML()}</section>
    <section class="card cls"><h2>${t("Class decks")}</h2>${deckRows(id,true)}</section>
    <section class="card cls"><h2>${t("Choose decks")}</h2>${deckTools()}<div class="dlist">${deckList("all",new Set(),"data-cd")}</div><div class="row"><button id="cad">${t("Add selected decks")}</button></div><div id="cadm" class="hint" role="status"></div></section>`;
};
function bindClass(){
  const id=CID,tc=owns(id);
  if($("#clb"))$("#clb").onclick=()=>{TAB="learn";home()};
  app.querySelectorAll("[data-study]").forEach(b=>b.onclick=()=>studyDeck(id,+b.dataset.study));
  if(!tc){
    if($("#clv"))$("#clv").onclick=async()=>{
      if(!confirm(t("Leave this class?")))return;
      await SB.from("class_progress").delete().eq("class_id",id).eq("student_id",user.id);
      await SB.from("class_members").delete().eq("class_id",id).eq("student_id",user.id);
      await load(true);TAB="learn";home()};
    return;
  }
  if(!$("#ccp"))return;
  const cur=CL.owned.find(x=>x.id===id);
  $("#ccp").onclick=()=>{try{navigator.clipboard.writeText(cur.code)}catch(x){}};
  $("#cnw").onclick=async()=>{if(!confirm(t("Generate a new code? The old code stops working.")))return;const{data,error}=await SB.rpc("regen_class_code",{cid:id});if(!error&&data){cur.code=data;home()}};
  $("#csv").onclick=async()=>{const n=$("#cnm").value.trim().slice(0,60);if(!n)return;const{error}=await SB.from("classrooms").update({name:n}).eq("id",id);if(!error){cur.name=n;home()}};
  $("#cdl").onclick=async()=>{
    if(!confirm(t("Delete this class? Students and their progress in it will be removed.")))return;
    const{error}=await SB.from("classrooms").delete().eq("id",id);
    if(error){alert(error.message);return}
    await load(true);TAB="learn";home()};
  $("#cre").onclick=()=>loadPanel();
  app.querySelectorAll("[data-rmd]").forEach(b=>b.onclick=async()=>{const r=(CL.decks[id]||[])[+b.dataset.rmd];if(!r)return;await SB.from("class_decks").delete().eq("class_id",id).eq("deck",r.deck);await load(true);home()});
  app.querySelectorAll("[data-rms]").forEach(b=>b.onclick=async()=>{
    if(!confirm(t("Remove")+"?"))return;const sid=b.dataset.rms;
    await SB.from("class_progress").delete().eq("class_id",id).eq("student_id",sid);
    await SB.from("class_members").delete().eq("class_id",id).eq("student_id",sid);loadPanel()});
  bindDeckTools();
  $("#cad").onclick=async()=>{
    const ns=new Set([...app.querySelectorAll("[data-cd]:checked")].map(x=>x.dataset.cd)),m=$("#cadm");
    if(!ns.size){m.textContent=t("Select at least one deck.");return}
    const recs=[...ns].map(name=>({class_id:id,deck:name,words:dedupe(allWords().filter(w=>w.l===name)).map(strip),sents:dedupe(allSents().filter(w=>w.l===name)).map(strip),updated_at:new Date().toISOString()}));
    const{error}=await SB.from("class_decks").upsert(recs);
    if(error){m.textContent=error.message;return}
    await load(true);home()};
}
const TILES=[["dict","听","Dictation","Hear it, write on paper"],["write","写","Write on screen","Draw each stroke"],["quiz","选","Meaning quiz","Pick, then confirm"],["flash","忆","Flashcards","Swipe right if you know it, left if not"],["lis","猜","Listen & guess","Hear it, then pick the answer"],["arr","排","Arrange sentence","Put words in order"]];
function studyDeck(cid,idx){
  const r=(CL.decks[cid]||[])[idx];if(!r)return;
  const mk=l=>dedupe((l||[]).map(w=>({...w,l:r.deck})));
  app.innerHTML=`<section class="card"><h2>${esc(r.deck)}</h2><div class="tiles">${TILES.map(([m,g,a,b])=>`<button class="tile" data-cm="${m}"><i>${g}</i><b>${t(a)}</b><span>${t(b)}</span></button>`).join("")}</div><div class="row"><button class="ghost" id="csb">${t("Back")}</button></div></section>${dock()}`;
  $("#csb").onclick=home;bindDock();
  app.querySelectorAll("[data-cm]").forEach(b=>b.onclick=()=>{
    const m=b.dataset.cm,pool=mk(m=="arr"?r.sents:r.words);
    if(!pool.length){alert(m=="arr"?t("Select at least one lesson that has sentences."):t("Select at least one lesson that has words."));return}
    CUR={ds:[r.deck]};pickCount(m,pool)});
}
window.clsBind=()=>{
  if(!ok())return;
  app.querySelectorAll("[data-cls]").forEach(b=>b.onclick=()=>openClass(b.dataset.cls));
  const jb=$("#jb");if(jb)jb.onclick=join;
  const tb=$("#tb");if(tb)tb.onclick=becomeTeacher;
  const nb=$("#ncb");if(nb)nb.onclick=createClass;
  if(TAB=="class")bindClass();
  load(false).then(c=>{if(c&&(TAB=="home"||TAB=="learn"||TAB=="class"))home();if(window.classSync)classSync()});
};
})();
