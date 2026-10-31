(()=>{
const st=document.createElement("style");
st.textContent=`.gmodal{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:12px;animation:fin .2s}
.gbox{background:var(--card);color:var(--ink);border-radius:24px;width:min(580px,100%);max-height:calc(100dvh - 24px);overflow:auto;padding:18px;box-shadow:var(--sh)}
.gh{display:flex;align-items:center;justify-content:space-between;gap:8px}.gh h2{margin:0}
.gtabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--soft);padding:4px;border-radius:12px;margin:12px 0}
.gtab{background:transparent;color:var(--mut);border:0;box-shadow:none}.gtab.on{background:var(--card);color:var(--ink);box-shadow:var(--sh)}
.gs{position:relative;height:250px;border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--red) 14%,var(--soft)),color-mix(in srgb,var(--acc2) 14%,var(--soft)));display:grid;place-items:center;overflow:hidden;touch-action:pan-y}
.gt{margin:14px 0 4px;font-size:1.15rem}.gd{margin:0;color:var(--mut)}
.gnav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px}.gdots{display:flex;gap:6px}.gdots i{width:8px;height:8px;border-radius:50%;background:var(--line);cursor:pointer;transition:.2s}.gdots i.on{background:var(--red);width:20px;border-radius:4px}
.gs [data-at]{opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s}.gs [data-at].on{opacity:1;transform:none}.gs .off{opacity:0!important;pointer-events:none}
.ph{position:relative;width:min(280px,82%);height:222px;background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--sh);padding:12px;overflow:hidden;font-size:11px;line-height:1.35;text-align:left}
.scr{position:absolute;inset:12px;transition:opacity .35s}
.mh{font-weight:800;font-size:11px;color:var(--mut);margin-bottom:6px}
.mta{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px;font-family:var(--hz);min-height:64px}
.mb{display:inline-block;padding:5px 10px;border-radius:8px;background:var(--red);color:var(--onacc);font-weight:800;transition:transform .2s,box-shadow .2s}.mb.r{background:var(--bad);color:#fff}.mb.ok2{background:var(--ok);color:#fff}.mb.g{background:transparent;color:var(--ink);border:1px solid var(--line)}
.tg{position:relative}
.fgr{position:absolute;right:-6px;bottom:-18px;font-size:22px;pointer-events:none;z-index:6;font-style:normal;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
.fgr.tap:before{content:"";position:absolute;left:3px;top:0;width:18px;height:18px;border-radius:50%;border:2px solid var(--red);animation:rip .55s ease-out}
@keyframes rip{from{transform:scale(.3);opacity:1}to{transform:scale(1.8);opacity:0}}
.mcard{display:flex;justify-content:space-between;gap:8px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:6px 8px;margin-top:6px;background:var(--card)}
.ck{color:var(--ok)}.tagm{font-size:9px;font-weight:800;background:var(--soft);color:var(--mut);border-radius:5px;padding:1px 5px;margin-left:4px}
.mtiles{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.mt6{height:50px;border-radius:10px;border:1px solid var(--line);border-left:4px solid var(--c);display:grid;place-items:center;font:800 18px var(--hz);color:var(--c);transition:box-shadow .3s,transform .3s}.mt6.on{box-shadow:0 0 0 3px var(--c);transform:scale(1.06)}
.mchips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.mchip{border:2px solid var(--line);border-radius:10px;padding:5px 10px;font-weight:800;transition:.3s}.mchip.on{border-color:var(--red);background:var(--soft)}
.mo{border:2px solid var(--line);border-radius:9px;padding:6px 8px;margin-top:5px;font-weight:700;transition:border-color .3s,background .3s}.mo.on{border-color:var(--red);background:var(--soft)}
.mbox{width:122px;height:122px;margin:6px auto;border:2px solid var(--red);border-radius:4px;background:repeating-linear-gradient(to bottom,var(--line) 0 5px,transparent 5px 10px) center/1px 100% no-repeat,repeating-linear-gradient(to right,var(--line) 0 5px,transparent 5px 10px) center/100% 1px no-repeat}
.mbox svg{width:100%;height:100%}.stroke{fill:none;stroke:var(--ink);stroke-width:7;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .7s}.stroke.on{stroke-dashoffset:0}
.mpill{display:inline-block;border:1px dashed var(--line);border-radius:10px;padding:3px 10px;font-weight:800;margin:2px}
.mrow3{position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;justify-content:center}.mrow3 .mb{flex:1;text-align:center}
.mpop{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) scale(.6);background:var(--card);border-radius:16px;padding:12px 20px;text-align:center;box-shadow:var(--sh);border:1px solid var(--line);z-index:5;transition:opacity .3s,transform .4s cubic-bezier(.2,1.5,.4,1)}
.gs .mpop[data-at]{opacity:0;transform:translate(-50%,-50%) scale(.6)}.gs .mpop.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.mpop b{display:block;font:800 30px/1 var(--ui)}.mpop.okp b{color:var(--ok)}
.cw{position:absolute;left:14%;right:14%;top:30px;height:104px}.sw{position:absolute;inset:0;transition:transform .7s,opacity .7s}.sw.on{transform:translateX(140%) rotate(18deg);opacity:0}.sw.l.on{transform:translateX(-140%) rotate(-18deg)}
.cf{position:absolute;inset:0;transition:transform .6s;transform-style:preserve-3d}.cf.on{transform:rotateY(180deg)}
.face2{position:absolute;inset:0;border:1px solid var(--line);border-top:4px solid var(--acc2);border-radius:14px;background:var(--card);display:grid;place-items:center;backface-visibility:hidden;-webkit-backface-visibility:hidden;font:800 32px var(--hz);box-shadow:var(--sh);text-align:center}.face2.bk{transform:rotateY(180deg);font:700 13px var(--ui);border-top-color:var(--red)}
.stm{position:absolute;top:6px;padding:1px 8px;border:2px solid;border-radius:8px;font-weight:800;z-index:3}
.hzs{text-align:center;font:800 34px/1.2 var(--hz);margin:6px 0}
.mline{border-bottom:2px solid var(--line);min-height:30px;display:flex;gap:5px;margin:8px 0;padding-bottom:4px}.mchips2{display:flex;gap:5px;flex-wrap:wrap}.mch{border:1px solid var(--line);border-radius:8px;padding:4px 9px;font:800 14px var(--hz);transition:opacity .3s}.mch.on{opacity:.2}
.code3{font:800 24px var(--hz);letter-spacing:.18em;color:var(--red);text-align:center}.mqr{display:grid;grid-template-columns:repeat(5,7px);gap:1px;padding:4px;background:#fff;border-radius:6px;margin:4px auto;width:fit-content}.mqr i{width:7px;height:7px;background:#111}.mqr i.o{background:transparent}
.mav{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;color:#fff;font-weight:800;margin:2px}
.mpod{display:flex;align-items:flex-end;justify-content:center;gap:6px;height:112px;margin-top:6px}.mpc{width:52px;border-radius:8px 8px 3px 3px;height:0;transition:height .9s cubic-bezier(.2,.9,.3,1.1);display:grid;place-items:start center;font:800 15px var(--hz);padding-top:4px;color:#3b2a00}.mpc.on{height:var(--h)}
.mbar2{height:7px;background:var(--soft);border-radius:4px;overflow:hidden;flex:1}.mbar2 i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--red),var(--acc2));transition:width 1.1s ease-out}.mbar2 i.on{width:var(--w)}
.mrw{display:flex;align-items:center;gap:6px;margin:6px 0}.mrw span:first-child{width:62px}.dots{display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;width:0;transition:width 1.3s steps(8)}.dots.on{width:8.5ch}
.mfl{font-size:34px;text-align:center;transition:transform .4s cubic-bezier(.2,1.6,.4,1)}.gs .mfl[data-at]{transform:scale(.3)}.gs .mfl.on{transform:scale(1)}
.helpb{width:38px;height:38px;border-radius:50%;padding:0;background:var(--soft);color:var(--ink);border:1px solid var(--line);box-shadow:none;font-weight:800;min-height:0}
@media(prefers-reduced-motion:reduce){.gs *{transition:none!important}}`;
document.head.append(st);

const TM=[];const stop=()=>{TM.splice(0).forEach(clearTimeout)};
function play(sc){
  stop();const els=[...sc.querySelectorAll("[data-at],[data-fx],[data-off],[data-tap]")],total=+sc.dataset.total||8000;
  const cycle=()=>{
    els.forEach(e=>e.classList.remove("on","off","tap"));
    els.forEach(e=>{
      const a=e.dataset.at||e.dataset.fx;
      if(a)TM.push(setTimeout(()=>e.classList.add("on"),+a));
      if(e.dataset.off)TM.push(setTimeout(()=>e.classList.add("off"),+e.dataset.off));
      if(e.dataset.tap)e.dataset.tap.split(",").forEach(ms=>TM.push(setTimeout(()=>{e.classList.remove("tap");void e.offsetWidth;e.classList.add("tap")},+ms)));
    });
    TM.push(setTimeout(cycle,total));
  };
  cycle();
}
const F=(ms)=>`<i class="fgr" data-tap="${ms}">👆</i>`;
const av=(c,l,at)=>`<span class="mav" style="background:${c}" data-at="${at}">${l}</span>`;
const QR="1110110101101010111011101".split("").map(x=>`<i class="${x=="1"?"":"o"}"></i>`).join("");
const bars=(rows)=>rows.map(([l,w,at,txt])=>`<div class="mrw"><span>${l}</span><div class="mbar2"><i data-fx="${at}" style="--w:${w}%"></i></div><b>${txt||w+"%"}</b></div>`).join("");

const SC=[
{tab:"f",title:"Add your words",desc:"Paste your vocabulary or open a TXT file, then tap Load words. Your lessons appear, and older lists move to the Archive.",total:7000,html:()=>`<div class="ph"><div class="mh">${t("Your word list")}</div>
 <div class="mta"><div data-at="300">你好 | nǐ hǎo | hello</div><div data-at="900">谢谢 | xièxie | thanks</div><div data-at="1500">再见 | zàijiàn | bye</div></div>
 <div style="margin-top:10px"><span class="mb tg" data-at="2100">${t("Load words")}${F("2800")}</span></div>
 <div class="mcard" data-at="3700"><b>Lesson 1</b><span class="ck">✓ 3</span></div>
 <div class="mcard" data-at="4600"><b>${t("Archive")}</b><span>📦</span></div></div>`},
{tab:"f",title:"Choose how to learn",desc:"Pick a mode, choose your decks (imported or archived), then how many words. Tap Start.",total:9400,html:()=>`<div class="ph">
 <div class="scr" data-off="3000"><div class="mh">${t("Practise")}</div><div class="mtiles">${[["听","#f59e0b"],["写","#f43f5e"],["选","#0ea5e9"],["忆","#10b981"],["猜","#ec4899"],["排","#8b5cf6"]].map(([g,c],i)=>`<div class="mt6 tg" style="--c:${c}"${i==3?' data-fx="1400"':""}>${g}${i==3?F("1500"):""}</div>`).join("")}</div></div>
 <div class="scr" data-at="3000" data-off="6200"><div class="mh">${t("Choose decks")}</div>
  <div class="mcard"><span>Lesson 1</span><b class="ck" data-at="3500">✓</b></div><div class="mcard"><span>HSK 4</span><b class="ck" data-at="4000">✓</b></div><div class="mcard"><span>Bab 5 <em class="tagm">${t("Archive")}</em></span><b class="ck" data-at="4500">✓</b></div>
  <div style="margin-top:10px"><span class="mb tg">${t("Next")}${F("5400")}</span></div></div>
 <div class="scr" data-at="6200"><div class="mh">${t("How many do you want to practise?")}</div><div class="mchips"><span class="mchip">${t("All")}</span><span class="mchip">${t("Half")}</span><span class="mchip" data-fx="6900">10</span><span class="mchip">20</span></div>
  <div style="margin-top:16px"><span class="mb tg">${t("Start")}${F("8100")}</span></div></div></div>`},
{tab:"f",title:"Write on screen",desc:"Draw each stroke. Up to 5 wrong strokes still count. Unlock the lock and drag ⇅ to move the writing box, then lock it again.",total:8400,html:()=>`<div class="ph"><div class="mh">hǎo</div>
 <div class="mbox"><svg viewBox="0 0 100 100"><path class="stroke" data-fx="1200" pathLength="1" d="M18 38 H82"/><path class="stroke" data-fx="2200" pathLength="1" d="M50 14 C50 50 36 74 16 90"/><path class="stroke" data-fx="3200" pathLength="1" d="M52 44 C60 64 74 80 88 90"/></svg></div>
 <div style="text-align:center"><span class="mpill" data-at="500">🔒 ⇅</span><span class="mpill" data-at="1500">🔓 ⇅</span></div>
 <div class="mpop okp" data-at="4600" data-off="7600"><b>✓</b>3 / 3</div></div>`},
{tab:"f",title:"Quiz and Listen & guess",desc:"Pick an answer and confirm. You see right or wrong at once and the next question starts by itself. In Listen & guess, tap to hear first.",total:10000,html:()=>`<div class="ph"><div style="text-align:center;margin-top:2px"><span class="mb tg">🔊 ${t("Tap to listen")}${F("700")}</span></div>
 <div data-at="1400"><div class="mo">客气</div><div class="mo tg" data-fx="2400">结束${F("2500")}</div><div class="mo">太阳</div></div>
 <div style="text-align:center;margin-top:8px"><span class="mb tg" data-at="2700">${t("Confirm answer")}${F("3400")}</span></div>
 <div class="mpop okp" data-at="3700" data-off="6600"><b>✓</b><span class="hz-s">结束</span> jiéshù</div></div>`},
{tab:"f",title:"Flashcards",desc:"Tap to flip. Swipe right if you know it, left if not. Cards you missed come back in a review round.",total:10600,html:()=>`<div class="ph"><div class="mh">${t("Flashcards")}</div>
 <div class="cw"><div class="sw" data-fx="3800"><div class="cf" data-fx="1500"><div class="face2">房间</div><div class="face2 bk">fángjiān<br>room</div></div><span class="stm" style="right:8px;color:var(--ok);border-color:var(--ok)" data-at="3500">✓</span><i class="fgr" data-tap="1400,3700" style="bottom:-6px">👆</i></div></div>
 <div class="cw" data-at="5400"><div class="sw l" data-fx="7800"><div class="cf"><div class="face2">谢谢</div></div><span class="stm" style="left:8px;color:var(--bad);border-color:var(--bad)" data-at="7500">✗</span><i class="fgr" data-tap="7700" style="bottom:-6px">👆</i></div></div>
 <div class="mrow3"><span class="mb r">${t("Not memorized yet")}</span><span class="mb ok2">${t("Memorized")}</span></div></div>`},
{tab:"f",title:"Dictation and Arrange",desc:"Write on paper, reveal the answer, and mark yourself. In Arrange, tap the words in the right order.",total:10600,html:()=>`<div class="ph">
 <div class="scr" data-off="5300"><div class="mh">${t("Dictation")}</div><div style="text-align:center"><b>xièxie</b> · thanks ✍️</div><div class="hzs" data-at="2200">谢谢</div>
  <div class="mrow3"><span class="mb tg" data-off="2100">${t("Reveal answer")}${F("1700")}</span></div>
  <div class="mrow3" data-at="2600"><span class="mb r">✗</span><span class="mb ok2 tg">✓${F("4100")}</span></div></div>
 <div class="scr" data-at="5300"><div class="mh">${t("Arrange sentence")}</div><div style="text-align:center">I like Chinese</div>
  <div class="mline"><span class="mch" data-at="6100">我</span><span class="mch" data-at="6700">喜欢</span><span class="mch" data-at="7300">学</span><span class="mch" data-at="7900">中文</span></div>
  <div class="mchips2"><span class="mch" data-fx="6100">我</span><span class="mch" data-fx="6700">喜欢</span><span class="mch" data-fx="7300">学</span><span class="mch" data-fx="7900">中文</span></div>
  <div class="mpop okp" data-at="8800" data-off="10200"><b>✓</b></div></div></div>`},
{tab:"f",title:"Play with classmates",desc:"A host creates a room and shares the code or QR. Everyone answers fast and right to climb the podium.",total:12600,html:()=>`<div class="ph">
 <div class="scr" data-off="4800"><div class="mh">${t("Room code")}</div><div class="code3">482915</div><div class="mqr">${QR}</div>
  <div style="text-align:center">${av("#7c3aed","A",1400)}${av("#0891b2","B",2000)}${av("#d97706","C",2600)}</div><div style="text-align:center;margin-top:4px"><span class="mb tg">${t("Start game")}${F("4000")}</span></div></div>
 <div class="scr" data-at="4800" data-off="8200"><div class="mh">1 / 10</div><div class="mbar2" style="margin:4px 0 8px"><i data-fx="4900" style="--w:100%;transition-duration:.1s"></i></div><div class="hzs">客气</div><div class="mo">polite</div><div class="mo on">sun</div>
  <div style="text-align:center;margin-top:6px"><span class="mpill" data-at="7000">+815</span></div></div>
 <div class="scr" data-at="8200"><div class="mh">${t("Final scores")}</div><div class="mpod"><div class="mpc" data-fx="8700" style="--h:56px;background:linear-gradient(#fdba74,#b45309);color:#fff">3</div><div class="mpc" data-fx="8400" style="--h:96px;background:linear-gradient(#fde68a,#f59e0b)">1</div><div class="mpc" data-fx="8550" style="--h:74px;background:linear-gradient(#f3f4f6,#9ca3af)">2</div></div></div></div>`},
{tab:"f",title:"Goal, streak and review",desc:"Finish your daily goal to grow your streak. Review due words by writing or with a quiz.",total:10000,html:()=>`<div class="ph">
 <div class="scr" data-off="5300"><div class="mh">${t("Today")}</div><div class="mfl" data-at="1800">🔥 5</div><div class="mrw" style="margin-top:10px"><span>${t("Daily goal")}</span><div class="mbar2"><i data-fx="800" style="--w:78%"></i></div><b>78%</b></div>
  <div style="margin-top:14px;text-align:center"><span class="mb tg">${t("Review due words")}${F("4300")}</span></div></div>
 <div class="scr" data-at="5300"><div class="mh">${t("How do you want to review?")}</div><div class="mcard"><span>✍️ ${t("Write on screen")}</span></div><div class="mcard"><span>✔ ${t("Meaning quiz")}</span></div></div></div>`},
{tab:"c",title:"Become a laoshi",desc:"In Learn, enter the laoshi password. A class is created with a secret code only you can see. You can create more classes or delete one.",total:11000,html:()=>`<div class="ph">
 <div class="scr" data-off="3900"><div class="mh">${t("Classroom")}</div><div class="mta" style="min-height:0;padding:7px"><span class="dots" data-fx="900">••••••••</span></div><div style="margin-top:10px"><span class="mb tg">${t("Become a laoshi")}${F("2900")}</span></div></div>
 <div class="scr" data-at="3900"><div class="mcard" style="margin-top:0"><b>Class 王法毅</b><span class="mb" style="padding:2px 6px;font-size:9px">${LANG=="zh"?"老师":t("Teacher")+" 老师"}</span></div>
  <div style="margin-top:10px" data-at="4800"><div class="mh">${t("Your class code")}</div><div class="code3">K6EHVT</div><div style="text-align:center;color:var(--mut)">🔒</div></div>
  <div style="margin-top:8px;text-align:center" data-at="6800"><span class="mb g">${t("Create class")}</span> <span class="mb g">🗑</span></div></div></div>`},
{tab:"c",title:"Add decks to your class",desc:"Choose decks from your word list or archive and add them. Students get them automatically.",total:9600,html:()=>`<div class="ph">
 <div class="scr" data-off="3500"><div class="mh">${t("Choose decks")}</div><div class="mcard"><span>HSK 4</span><b class="ck" data-at="900">✓</b></div><div class="mcard"><span>Bab 5 <em class="tagm">${t("Archive")}</em></span><b class="ck" data-at="1500">✓</b></div><div class="mcard"><span>Lesson 3</span></div>
  <div style="margin-top:10px"><span class="mb tg">${t("Add selected decks")}${F("2700")}</span></div></div>
 <div class="scr" data-at="3500"><div class="mh">${t("Class decks")}</div><div class="mcard" data-at="4000"><b>HSK 4</b><span>50</span></div><div class="mcard" data-at="4700"><b>Bab 5</b><span>27</span></div><div style="text-align:center;margin-top:12px;font-size:13px" data-at="6000">→ 🧑‍🎓 🧑‍🎓 🧑‍🎓</div></div></div>`},
{tab:"c",title:"Join as a student",desc:"Enter the class code. The class decks appear in your decks, tagged Class, and work with every study mode.",total:11600,html:()=>`<div class="ph">
 <div class="scr" data-off="5200"><div class="mh">${t("Join a class")}</div><div class="mta" style="min-height:0;padding:7px;letter-spacing:.2em"><span class="dots" style="width:0" data-fx="800">K6EHVT</span></div><div style="margin-top:8px"><span class="mb tg">${t("Join")}${F("2400")}</span></div>
  <div class="mcard" data-at="3200"><b>Class 王法毅</b><span class="mb g" style="padding:2px 6px;font-size:9px">${LANG=="zh"?"学生":t("Student")+" 学生"}</span></div></div>
 <div class="scr" data-at="5200"><div class="mh">${t("Choose decks")}</div><div class="mcard"><span>HSK 4 <em class="tagm" data-at="5700">${t("Class")}</em></span><b class="ck" data-at="6300">✓</b></div>
  <div class="mtiles" style="margin-top:8px" data-at="6900"><div class="mt6" style="--c:#f59e0b">听</div><div class="mt6" style="--c:#f43f5e">写</div><div class="mt6" style="--c:#0ea5e9">选</div></div>
  <div class="mrw" style="margin-top:10px" data-at="8000"><span>${t("Mastered")}</span><div class="mbar2"><i data-fx="8300" style="--w:36%"></i></div><b>36%</b></div></div></div>`},
{tab:"c",title:"Follow your students",desc:"See last active, streak and accuracy. Tap a student to open class progress and the study methods they use.",total:12000,html:()=>`<div class="ph">
 <div class="scr" data-off="4200"><div class="mh">${t("Students")}</div>
  ${[["#7c3aed","A","Anonim",500,"29m · 🔥6 · 77%"],["#0891b2","B","Budi",1100,"2h · 🔥3 · 64%"],["#d97706","C","Citra",1700,"1d · 🔥1 · 90%"]].map(([c,l,n,at,s],i)=>`<div class="mcard tg" data-at="${at}"><span>${av(c,l,0).replace(' data-at="0"',"")} <b>${n}</b></span><span class="hint">${s}</span>${i==1?F("3300"):""}</div>`).join("")}</div>
 <div class="scr" data-at="4200"><div class="mh">${t("Class decks")}</div>${bars([["HSK 4",62,4600],["Bab 5",40,5000]])}
  <div class="mh" style="margin-top:8px">${t("Study methods")}</div>${bars([[t("Write on screen"),50,5800],[t("Meaning quiz"),30,6300],[t("Flashcards"),20,6800]])}</div></div>`}
];

let GS=null;
const slides=()=>SC.filter(s=>s.tab==GS.tab);
function close(){stop();const o=$("#guide");if(o)o.remove();try{localStorage.setItem("zw-guide-seen","1")}catch(e){}if(typeof TAB!="undefined"&&TAB=="home")home()}
function go(d){const n=GS.i+d,L=slides();if(n<0)return;if(n>=L.length){close();return}GS.i=n;render()}
function render(){
  stop();let o=$("#guide");
  if(!o){o=document.createElement("div");o.id="guide";o.className="gmodal";o.onclick=e=>{if(e.target===o)close()};document.body.append(o)}
  const L=slides(),s=L[GS.i];
  o.innerHTML=`<div class="gbox" role="dialog" aria-modal="true"><div class="gh"><h2>${t("Guide")}</h2><button class="ghost sm" id="gx" aria-label="${t("Close")}">✕</button></div>
  <div class="gtabs"><button class="gtab${GS.tab=="f"?" on":""}" data-gt="f">${t("Features")}</button><button class="gtab${GS.tab=="c"?" on":""}" data-gt="c">${t("Classroom")}</button></div>
  <div class="gs" id="gsc" data-total="${s.total}">${s.html()}</div><h3 class="gt">${t(s.title)}</h3><p class="gd">${t(s.desc)}</p>
  <div class="gnav"><button class="ghost" id="gpv" ${GS.i?"":"disabled"}>${t("Back")}</button><div class="gdots">${L.map((_,i)=>`<i class="${i==GS.i?"on":""}" data-gi="${i}"></i>`).join("")}</div><button id="gnx">${GS.i<L.length-1?t("Next"):t("Close")}</button></div></div>`;
  $("#gx").onclick=close;$("#gpv").onclick=()=>go(-1);$("#gnx").onclick=()=>go(1);
  o.querySelectorAll("[data-gt]").forEach(b=>b.onclick=()=>{GS={tab:b.dataset.gt,i:0};render()});
  o.querySelectorAll("[data-gi]").forEach(d=>d.onclick=()=>{GS.i=+d.dataset.gi;render()});
  const sc=$("#gsc");let x0=null;
  sc.onpointerdown=ev=>{x0=ev.clientX};
  sc.onpointerup=ev=>{if(x0==null)return;const dx=ev.clientX-x0;x0=null;if(Math.abs(dx)>50)go(dx<0?1:-1)};
  play(sc);
}
window.showGuide=tab=>{GS={tab:tab==="c"?"c":"f",i:0};render()};
document.addEventListener("keydown",e=>{if(!$("#guide"))return;if(e.key=="Escape")close();else if(e.key=="ArrowRight")go(1);else if(e.key=="ArrowLeft")go(-1)});
window.guideHome=()=>{let seen=false;try{seen=!!localStorage.getItem("zw-guide-seen")}catch(e){}
  return seen?"":`<section class="card nudge"><span class="flame">🎓</span><div>${t("New here? Take a quick tour of the app.")}</div><div class="row" style="margin:0;flex:none"><button id="gst">${t("Start the tour")}</button><button class="ghost sm" id="gnn">${t("Not now")}</button></div></section>`};
window.guideBind=()=>{
  const a=$("#gst");if(a)a.onclick=()=>showGuide();
  const b=$("#gnn");if(b)b.onclick=()=>{try{localStorage.setItem("zw-guide-seen","1")}catch(e){}home()};
  app.querySelectorAll("[data-guide]").forEach(x=>x.onclick=()=>showGuide(x.dataset.guide));
  const g=$("#gd");if(g)g.onclick=()=>showGuide();
};
})();
