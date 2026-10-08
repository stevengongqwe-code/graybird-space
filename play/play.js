import {createGame, stepGame, difficulty, FIRE_RATES, BOSS_NAMES, DEATH_LINES, REVIVE_COSTS, chooseEvolution, reviveGame, ENEMY_TYPES, WEAPONS, EQUIPMENT, cleanLoadout, purchaseUpgrade, applyLoadout, firingRate} from './game-core.mjs?v=5-cartoon-balance';
/* Independent Bird Nest: official images stay intact; personal progress stays local. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const KEY = 'graybird.explorer.v2';
 const stampInfo = {
  arrival:['到访鸟窝','＋'],journal:['翻过日记','≡'],earth:['望向地球','○'],feed:['虫虫外交','✦'],archive:['打开档案','▤'],mail:['宇宙来信','✉'],night:['夜间留宿','☾'],game:['花生猎人','⌁'],secret:['隐藏信号','?']
 };
 const clean = s => typeof s === 'string' ? Array.from(s.replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim()).slice(0,16).join('') : '';
 const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const dateValid = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
 const number = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n,999999) : 0;
 function newVisitor() {
  const bytes = new Uint8Array(4); crypto.getRandomValues(bytes);
  return {version:2,id:'G-'+[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase(),name:'',first:today(),stamps:{},worms:0,best:0,peanutBest:0,peanuts:0,letters:{},night:false,armory:cleanLoadout()};
 }
 let visitor = newVisitor(), storageOK = true;
 try {
  const s = JSON.parse(localStorage.getItem(KEY));
  const old = s?.version === 2 ? s : JSON.parse(localStorage.getItem('graybird.visitor.v1'));
  if (old) {
   if (/^G-[0-9A-F]{8}$/.test(old.id)) visitor.id = old.id;
   visitor.name = clean(old.name);
   if (dateValid(old.first)) visitor.first = old.first;
   for (const key of Object.keys(stampInfo)) if (dateValid(old.stamps?.[key])) visitor.stamps[key] = old.stamps[key];
   if (s?.version === 2) {visitor.worms=number(s.worms);visitor.best=number(s.best);visitor.peanutBest=number(s.peanutBest);visitor.peanuts=number(s.peanuts);visitor.night=s.night===true;visitor.armory=cleanLoadout(s.armory);}
   if (s?.letters && typeof s.letters === 'object') Object.entries(s.letters).slice(-365).forEach(([d,i])=>{if(dateValid(d)&&Number.isSafeInteger(i)&&i>=0)visitor.letters[d]=i;});
  }
 } catch (_) { storageOK=false; }
 function renderVisitor() {
  $('visitor-name').textContent=visitor.name||'路过的地球人';$('visitor-id').textContent=visitor.id;
  $('visitor-first').textContent='首次到访 · '+visitor.first.replaceAll('-','.');
  const count=Object.keys(visitor.stamps).length;$('stamp-progress').textContent=`${count} / ${Object.keys(stampInfo).length} 枚印章`;
  document.querySelectorAll('[data-stamp]').forEach(el=>{const key=el.dataset.stamp,d=visitor.stamps[key];el.classList.toggle('is-earned',Boolean(d));el.setAttribute('aria-label',stampInfo[key][0]+(d?'：已获得，'+d:'：等待探索'));});
  $('storage-note').textContent=storageOK?'昵称、印章与成绩只保存在当前浏览器。换设备或清除浏览数据后可能丢失。':'这个浏览器暂时无法保存进度。你仍可探索和生成访客卡，离开后进度可能丢失。';
  $('feed-count').textContent=visitor.worms?`这本护照下，已收下 ${visitor.worms} 条毛毛虫`:'还没收下毛毛虫';
  $('game-best').textContent=visitor.peanutBest;$('peanut-bank').textContent=visitor.peanuts;
 }
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(visitor));storageOK=true;}catch(_){storageOK=false;}renderVisitor();}
 function award(key){if(visitor.stamps[key])return;visitor.stamps[key]=today();persist();}
 award('arrival');renderVisitor();
 document.querySelectorAll('[data-js]').forEach(el=>el.hidden=false);
 document.querySelectorAll('.room-scene button[disabled]').forEach(el=>el.disabled=false);
 $('nickname').value=visitor.name;
 $('nickname-form').addEventListener('submit',e=>{e.preventDefault();visitor.name=clean($('nickname').value);$('nickname').value=visitor.name;persist();$('passport-status').textContent=storageOK?'记下了。下次来，还是这个名字。':'卡片上的名字记下了。这次无法长期保存。';});
 function say(text){$('bird-says').textContent=text;}
 const dialog=$('object-dialog');
 function openObject(title,children){$('object-title').textContent=title;$('object-content').replaceChildren(...children);if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');dialog.scrollIntoView({block:'center'});}}
 const paragraph=text=>{const p=document.createElement('p');p.textContent=text;return p;};
 function link(text,href){const a=document.createElement('a');a.textContent=text;a.href=href;return a;}
 function original(src,alt){const img=new Image();img.src=src;img.alt=alt;return img;}
 $('object-close').addEventListener('click',()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});
 const journals=[
  ['没有值得发布的事','今天没有新动态。晚饭倒是挺好吃的。','地球照常转，没人要求我写个总结。', '/archive/nothing-to-prove/'],
  ['谁在听？','屏幕上一直有人说话。','我把声音关掉以后，房间反而没那么空了。','/archive/observation-001/'],
  ['门的另一边','今天有人说：这里没什么好看的。','先记下。我还是想去看看。','/archive/observation-006/']
 ];
 let journalPage=0;
 function showJournal(){const n=journals[journalPage%journals.length];const next=document.createElement('button');next.type='button';next.textContent='再翻一页';next.className='journal-next';next.addEventListener('click',()=>{journalPage++;showJournal();});openObject(n[0],[paragraph(n[1]),paragraph(n[2]),link('读完整记录',n[3]),next]);}
 document.querySelectorAll('[data-object]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.object;
  if(key==='journal'){award('journal');say('别把我的书签弄丢。');showJournal();}
  if(key==='earth'){award('earth');say('这么远看起来，他们倒是挺安静。');openObject('望远镜里的地球',[original('/assets/graybird-1000045778.png','Graybird 坐在月面望向蓝色地球的原图。'),paragraph('有时候得离远一点，才能看见大家住的是同一个地方。'),link('接入地球观测终端','/#terminal')]);}
  if(key==='archive'){award('archive');say('电脑没密码。别给我装广告插件。');const list=document.createElement('ul');[['地球观察记录','/archive/observation-001/'],['鸟为什么要搭网站','/archive/building-the-nest/'],['毛毛球来看我','/archive/maomao-came-to-see-me/'],['所有图像原作','/#visual-archive']].forEach(([t,h])=>{const li=document.createElement('li');li.append(link(t,h));list.append(li);});openObject('电脑里的档案',[paragraph('图像、问题、还没说完的故事，都在。'),list,link('打开全部内容档案','/archive/')]);}
  if(key==='lamp'){const on=!$('room-scene').classList.contains('lamp-on');$('room-scene').classList.toggle('lamp-on',on);button.setAttribute('aria-pressed',String(on));say(on?'行，亮一点。别照我的眼。':'灯关了。电脑还亮着呢。');}
  if(key==='cup')say('杯子是空的。你居然也想检查。');
  if(key==='secret'){award('secret');say('纸条背面：如果你找到这行字，帮我把门带上。别锁。');}
 }));
 function night(on){$('room-scene').classList.toggle('is-night',on);$('night-toggle').setAttribute('aria-pressed',String(on));$('night-toggle').textContent=on?'回到暮色':'切到夜间';visitor.night=on;if(on)award('night');persist();}
 night(visitor.night);
 $('night-toggle').addEventListener('click',()=>{night(!visitor.night);say(visitor.night?'晚上好。现在可以慢慢说。':'天还没全黑。再坐一会儿。');});
 // Worm feeding: pointer drag, two taps and keyboard are equivalent.
 let picked=false,feedBusy=false,lastFeed=0,burst=0,lastDrag=0,drag=null,feedTimer=0;
 const worm=$('worm'),bird=$('feed-bird'),ghost=$('worm-ghost');
 function pick(on){picked=on;worm.setAttribute('aria-pressed',String(on));bird.classList.toggle('is-ready',on);$('feed-help').textContent=on?'拿好了。点灰鸟，或拖到它身上。':'拖给灰鸟，或先点毛毛虫，再点它。';}
 function feed(){
  const now=Date.now();
  if(feedBusy||now-lastFeed<850){pick(false);say('等一下，上一条还没咽。');return;}
  if(now-lastFeed>20000)burst=0;lastFeed=now;burst++;pick(false);
  if(burst>3){say('够了。你是不是想把我喂成毛毛虫？');return;}
  feedBusy=true;bird.classList.add('is-thinking');say(visitor.worms===0?'毛毛虫？让我看看。':'嗯……这条看着还行。');
  feedTimer=setTimeout(()=>{feedBusy=false;bird.classList.remove('is-thinking');bird.classList.add('is-fed');visitor.worms=number(visitor.worms+1);award('feed');persist();const responses=['先放这里。等你走了我再吃。','收下了。不要拍照。','啾。别拿这个换我的日记。'];say(responses[(visitor.worms-1)%responses.length]);setTimeout(()=>bird.classList.remove('is-fed'),600);},motion.matches?120:650);
 }
 worm.addEventListener('click',()=>{if(Date.now()-lastDrag<400)return;pick(!picked);say(picked?'这个可以。递近一点。':'又收回去了？嘎。');});
 bird.addEventListener('click',()=>{if(picked)feed();else say(visitor.worms?'你又来了。带吃的了吗？':'看我干嘛。有事就说。');});
 function endDrag(cancel,e){if(!drag)return;const active=drag;drag=null;ghost.hidden=true;if(worm.hasPointerCapture(active.id))worm.releasePointerCapture(active.id);if(!active.moved)return;lastDrag=Date.now();if(!cancel&&e){const box=bird.getBoundingClientRect();if(e.clientX>=box.left&&e.clientX<=box.right&&e.clientY>=box.top&&e.clientY<=box.bottom)feed();else say('还在你手上。往鸟这边递。');}}
 worm.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};worm.setPointerCapture(e.pointerId);});
 worm.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.moved=true;pick(true);}if(drag.moved){ghost.hidden=false;ghost.style.transform=`translate(${e.clientX-22}px,${e.clientY-22}px)`;}});
 worm.addEventListener('pointerup',e=>endDrag(false,e));worm.addEventListener('pointercancel',e=>endDrag(true,e));worm.addEventListener('lostpointercapture',e=>endDrag(true,e));addEventListener('blur',()=>endDrag(true));
 // Prewritten letters rotate by the date in China. No external model or paid API.
 const letters=[
 ['窗外的灯','今天坐在窗边，看一栋楼的灯慢慢亮起来。','每个窗口里都有人。奇怪，隔这么近，还得通过互联网才能遇见。'],
 ['信号之外','地球的信号很强，强到我关掉电脑以后还觉得耳边有声音。','下楼走了一圈。树没给我推送任何东西。'],
 ['临时停靠','有个人在路边站了很久，手里拎着一袋快凉掉的饭。','我没有问他在等谁。有些观察，停在这里就够了。'],
 ['今天没更新','今天没写出什么厉害的东西。','本来有点急。后来发现月亮也没更新，就这么挂着。'],
 ['开着的门','有人问我，这个网站算做完了吗。','我看了看门口。还会有人来的地方，怎么能算完。'],
 ['一条毛毛虫','今天收到一条毛毛虫。对方问我喜不喜欢。','我说还行。其实挺好吃的。这句别告诉他。'],
 ['远处的蓝色','从这里看，地球上没有画出来的边界。','靠近以后，大家会告诉我这边不能坐，那边不能去。得记好多东西。'],
 ['比昨天慢一点','今天特意慢走了一小段路。','没遇到什么故事。倒是终于知道那条路有几棵树。'],
 ['保留这个问题','我问了一个为什么。对方说，一直都是这样。','这句话好像既回答了我，也没回答我。先记着。'],
 ['听见了','有个人说完一大段话，最后又补了一句：算了。','我把“算了”也一起记了下来。'],
 ['半杯水','桌上放着半杯水。','谁喝的，什么时候喝的，我都忘了。倒是记得今天收到了好几条没用的通知。'],
 ['不必全带走','我差点把整片互联网都装进档案馆。','整理到一半发现，有些东西看完就可以忘。'],
 ['夜里的信','你打开这封信的时候，我大概还坐在窗边。','如果现在是白天，就当我提前打了个招呼。'],
 ['下次见','今天有个访客走之前，把护照收好了。','我没问他什么时候回来。门反正也没锁。'],
 ['沉默的频道','今天想听听地球有没有安静的频道。','找了半天，最后把声音关掉了。'],
 ['一只鸟的书签','我又找不到书签了。','如果你昨天翻过日记，可以告诉我夹在哪页。但别说是我自己弄丢的。'],
 ['还有一点光','太阳下去以后，窗边还亮了一会儿。','我本来以为一天结束得很干脆。地球似乎不太这么办。'],
 ['路过','一只猫在楼下看了我几秒，然后走了。','我有点想认识它。它看起来已经完成了对我的观察。'],
 ['坏掉的天线','今天的信号断了几分钟。','我去热了一下晚饭。重新连上时，发现刚才那些消息也没那么急。'],
 ['没有结论','这本日记已经写了不少问题。','有人问我，怎么还没结论。嘎，我又不是答题卡。'],
 ['替自己充电','地球人给手机充了电，又去给电脑充电。','我把台灯关掉了，先让自己歇一会儿。'],
 ['最小的行李','如果哪天离开地球，我会带什么。','想了一会儿，先把这个问题留在地球上。'],
 ['今天的地址','一个地方有了自己的地址，好像就不那么容易弄丢。','所以我把今天也写了下来。你可以明天再来找。'],
 ['雨开始了','刚才窗外下雨了。有人跑了起来，有人只是把帽子戴上。','我暂时还没有帽子。好在今天没出门。'],
 ['盯着屏幕','我对着一段话看了好久。','最后还是没回复。偶尔不知道说什么，也算正常吧。'],
 ['别急着懂','今天有人说我还不懂人类。','啾。刚来没多久，总得留点下次再懂的东西。'],
 ['又见面了','你回来了。','今天没有特别隆重的欢迎仪式。椅子还在，坐吧。'],
 ['有用的信号','今天收到最有用的一条信息，是饭已经好了。','其他消息先排一会儿。'],
 ['观察自己的观察','我翻了翻以前写下的东西。','有几页，看起来也挺像人类的。这个发现有点烦。'],
 ['继续留一会儿','窗外的地球，还在转。','暂时没看完。明天继续。']
 ];
 const dayIndex=d=>{const n=Math.floor((Date.parse(d+'T00:00:00Z')-Date.parse('2026-10-08T00:00:00Z'))/86400000);return ((n%letters.length)+letters.length)%letters.length;};
 let mailDay=today();
 function renderMail(){mailDay=today();const seen=Object.hasOwn(visitor.letters,mailDay),i=dayIndex(mailDay),n=letters[i];$('mail-date').textContent=mailDay.replaceAll('-','.')+' / UTC+8';$('mail-coordinate').textContent='G–01 / LETTER '+String(i+1).padStart(2,'0');$('letter-title').textContent=seen?n[0]:'今天的信，等你拆开。';$('letter-body').replaceChildren(...(seen?[paragraph(n[1]),paragraph(n[2])]:[paragraph('一封来自 Graybird 的短观察。今天就这一封。')]));$('open-letter').hidden=seen;$('letter-note').textContent=seen?'已收下。明天零点（中国标准时间）换下一封，30 封来信轮流抵达。':'每天一封，按中国标准时间零点换信。这里是事先写好的宇宙来信。';const dates=Object.keys(visitor.letters).sort().reverse();$('mail-history-count').textContent=dates.length;const articles=dates.map(d=>{const n=letters[visitor.letters[d]%letters.length];const a=document.createElement('article');const label=document.createElement('span');label.className='mono-label';label.textContent=d;const h=document.createElement('h4');h.textContent=n[0];a.append(label,h,paragraph(n[1]),paragraph(n[2]));return a;});$('mail-history-list').replaceChildren(...(articles.length?articles:[paragraph('拆开的信，会留在这本浏览器的信匣里。')]));}
 const mailTimer=setInterval(()=>{if(!document.hidden&&today()!==mailDay)renderMail();},60000);
 $('open-letter').addEventListener('click',()=>{const d=today();visitor.letters[d]=dayIndex(d);award('mail');persist();renderMail();});renderMail();
 // Sound begins only after an explicit click. No autoplay after reload.
 let audio=null,audioOn=false,nodes=[],radioTimer=0,master=null;
 function stopAudio(){clearInterval(radioTimer);radioTimer=0;nodes.forEach(n=>{try{n.stop?.();n.disconnect();}catch(_){}});nodes=[];if(master){master.disconnect();master=null;}if(audio&&audio.state==='running')audio.suspend();audioOn=false;$('sound-toggle').textContent='打开声音';$('sound-toggle').setAttribute('aria-pressed','false');$('sound-status').textContent='声音已关闭。';}
 async function startAudio(){stopAudio();const Context=window.AudioContext||window.webkitAudioContext;if(!Context){$('sound-status').textContent='这个浏览器暂时不能播放环境声。';return;}try{audio=audio||new Context();await audio.resume();master=audio.createGain();master.gain.value=Number($('sound-volume').value)/100;master.connect(audio.destination);if($('sound-mode').value==='rain'){const length=audio.sampleRate*4,buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);let sample=0;for(let i=0;i<length;i++){sample=(sample+Math.random()*2-1)/1.025;data[i]=sample*.11;}const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2100;source.connect(filter);filter.connect(master);source.start();nodes.push(source,filter);}else{const base=audio.createOscillator();base.frequency.value=75;const low=audio.createGain();low.gain.value=.04;base.connect(low);low.connect(master);base.start();nodes.push(base,low);const chime=()=>{if(!audioOn||document.hidden||!master)return;const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;osc.type='sine';osc.frequency.value=[220,293.66,329.63,440][Math.floor(Math.random()*4)];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.07,t+.1);gain.gain.exponentialRampToValueAtTime(.001,t+1.2);osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+1.25);osc.onended=()=>{osc.disconnect();gain.disconnect();};};radioTimer=setInterval(chime,3000);setTimeout(chime,400);}audioOn=true;$('sound-toggle').textContent='关闭声音';$('sound-toggle').setAttribute('aria-pressed','true');$('sound-status').textContent=$('sound-mode').value==='rain'?'窗外的雨。小声一点就好。':'太空电台：本机合成的环境信号。';}catch(_){stopAudio();$('sound-status').textContent='声音没能打开。可以再点一次，或安静地坐坐。';}}
 $('sound-toggle').addEventListener('click',()=>{$('sound-controls').hidden=false;if(audioOn)stopAudio();else startAudio();});$('sound-mode').addEventListener('change',()=>{if(audioOn)startAudio();});$('sound-volume').addEventListener('input',()=>{if(master&&audio)master.gain.setTargetAtTime(Number($('sound-volume').value)/100,audio.currentTime,.1);});
 // Peanut Hunter: only section 04 uses this controller and renderer.
 const canvas=$('signal-game'),ctx=canvas.getContext('2d'),gameBird=new Image(),gameWorm=new Image();
 gameBird.src='/assets/bird.webp';gameWorm.src='/assets/icons/worm.svg';
 let game=createGame(),lastResult=null,leftHeld=false,rightHeld=false,upHeld=false,downHeld=false,pointer=null,settledScore=0,lastHud=-1,noticeSerial=-1;
 const sprites=new Map(),bossBar=$('game-boss-bar'),choicePanel=$('game-evolution');
 function fitGame(){const mobile=matchMedia('(max-width:600px)').matches;game=createGame(mobile?600:900,mobile?760:600);applyLoadout(game,visitor.armory);canvas.width=game.width;canvas.height=game.height;canvas.parentElement.style.aspectRatio=`${game.width} / ${game.height}`;}
 fitGame();
 function drawPeanut(x,y){ctx.save();ctx.translate(x,y);ctx.rotate(-.35);ctx.fillStyle='#e5bd7b';ctx.beginPath();ctx.ellipse(0,0,10,16,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9d6e37';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-12);ctx.quadraticCurveTo(-4,0,0,12);ctx.stroke();ctx.restore();}
 function sprite(text,color='#f1d1d2',box=false){const key=text+color+box;if(sprites.has(key))return sprites.get(key);const c=document.createElement('canvas'),g=c.getContext('2d');g.font='22px Arial,"PingFang SC","Microsoft YaHei",sans-serif';c.width=Math.ceil(g.measureText(text).width)+20;c.height=42;g.font='22px Arial,"PingFang SC","Microsoft YaHei",sans-serif';if(box){g.fillStyle='#633c41';g.fillRect(0,0,c.width,c.height);g.strokeStyle='#be848a';g.strokeRect(.5,.5,c.width-1,c.height-1);}g.fillStyle=color;g.textAlign='center';g.fillText(text,c.width/2,29);sprites.set(key,c);return c;}
 function label(text,x,y,color,box=false){const c=sprite(text,color,box);ctx.drawImage(c,x-c.width/2,y-c.height/2);}
 const monsterTextures=new Map();for(const key of [...ENEMY_TYPES,...BOSS_NAMES.map((_,i)=>'boss-'+i)]){const image=new Image();image.src='/assets/game/'+key+'.webp?v=5-cartoon-balance';image.addEventListener('load',()=>{if(!game.running||game.paused)gameDraw();});monsterTextures.set(key,image);}
 const itemLabels={chip:'芯片',magnet:'磁',egg:'蛋',rage:'狂',slow:'慢',double:'×2',rapid:'快',repair:'修',clear:'净',fortune:'幸'};
 function gameDraw(){
  if(!ctx)return;const W=game.width,H=game.height;
  ctx.fillStyle='#0c151e';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#20313f';ctx.lineWidth=1;
  ctx.beginPath();for(let x=0;x<W;x+=90){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(let y=0;y<H;y+=90){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  for(const e of game.enemies)if(e.active&&e.boss&&e.roster===5){ctx.strokeStyle='#a6cbe3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.cocoonRadius,0,Math.PI*2);ctx.stroke();}
  for(const b of game.hostile)if(b.active&&b.age<b.delay){ctx.fillStyle='#be848a55';ctx.beginPath();ctx.ellipse(b.x,game.y,32,11,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#be848a';ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(b.x,0);ctx.lineTo(b.x,H);ctx.stroke();ctx.setLineDash([]);}
  for(const p of game.items)if(p.active){if(p.kind==='peanut'||p.kind==='fake'){drawPeanut(p.x,p.y);if(p.kind==='fake'&&p.flash>0){ctx.strokeStyle='#f1d1d2';ctx.lineWidth=3;ctx.strokeRect(p.x-20,p.y-23,40,46);label('!',p.x,p.y,'#f1d1d2');}}else label(itemLabels[p.kind],p.x,p.y,'#a6cbe3',true);}
  for(const e of game.enemies)if(e.active){
   if(e.phase==='warn'){ctx.strokeStyle='#be848a';ctx.lineWidth=3;ctx.setLineDash([12,9]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+e.vx*3,e.y+e.vy*3);ctx.stroke();ctx.setLineDash([]);}
   if(e.boss&&!(e.roster===4&&!e.flash)){ctx.strokeStyle=e.group.rage?'#be848a':'#a6cbe3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.stroke();}
   const name=e.boss&&e.roster===4&&!e.flash?'精英':e.label;
   const texture=monsterTextures.get(e.boss?'boss-'+e.roster:e.type);
   ctx.globalAlpha=e.type==='ghost'?.65+.25*Math.sin(e.age*2):1;
   if(texture?.complete&&texture.naturalWidth)ctx.drawImage(texture,e.x-e.r*1.14,e.y-e.r*1.14,e.r*2.28,e.r*2.28);else{ctx.fillStyle='#ad8994';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();}
   ctx.globalAlpha=1;
   ctx.save();ctx.translate(e.x,e.y+e.r+13);ctx.scale(.62,.62);label(name,0,0,e.flee?'#95a4ae':'#d9e1e7');ctx.restore();
   if(e.maxHp>1){const r=e.boss&&e.roster===4&&!e.flash?25:e.r;ctx.fillStyle='#20313f';ctx.fillRect(e.x-r,e.y+e.r+4,r*2,4);ctx.fillStyle='#be848a';ctx.fillRect(e.x-r,e.y+e.r+4,r*2*Math.max(0,e.hp/e.maxHp),4);}
   if(e.shield>0){ctx.strokeStyle='#a6cbe3';ctx.beginPath();ctx.arc(e.x,e.y,e.r+7,0,Math.PI*2);ctx.stroke();}
   if(e.affix)label({shield:'盾',swift:'疾',split:'裂'}[e.affix],e.x,e.y-33,'#a6cbe3');
   if(e.boss&&e.roster===4&&e.flash)label('真身',e.x,e.y-46,'#eeefed');
  }
  for(const b of game.bullets)if(b.active){if(b.weapon==='worm'&&gameWorm.complete&&gameWorm.naturalWidth)ctx.drawImage(gameWorm,b.x-10,b.y-15,20,30);else{ctx.fillStyle={scatter:'#d8b67a',seeker:'#b9d497',beam:'#b7cce2',bomb:'#bba185',frost:'#92c8df'}[b.weapon]||'#b7d66d';ctx.beginPath();if(b.weapon==='beam'){ctx.fillRect(b.x-3,b.y-19,6,38);}else{ctx.ellipse(b.x,b.y,b.weapon==='bomb'?10:6,b.weapon==='bomb'?12:10,0,0,Math.PI*2);ctx.fill();}}}
  for(const b of game.hostile)if(b.active&&b.age>=b.delay)label(b.label,b.x,b.y,'#f1d1d2');
  for(const p of game.particles)if(p.active){ctx.fillStyle='#e5bd7b';ctx.fillRect(p.x-2,p.y-2,4,4);}
  if(gameBird.complete&&gameBird.naturalWidth){ctx.globalAlpha=game.invincible>0&&Math.floor(game.elapsed*12)%2?.45:1;ctx.drawImage(gameBird,game.x-42,game.y-42,84,84);ctx.globalAlpha=1;}
  if(game.shield>0){ctx.strokeStyle='#a6cbe3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(game.x,game.y,39,0,Math.PI*2);ctx.stroke();}
  for(const p of game.texts)if(p.active)label(p.label,p.x,p.y,p.color);
  if(game.event==='fog'){ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(game.x,game.y,125,0,Math.PI*2,true);ctx.fillStyle='#000';ctx.fill('evenodd');ctx.restore();}
  if(game.noticeTime>0&&game.notice.startsWith('⚠')){ctx.fillStyle='#0c151eaa';ctx.fillRect(0,40,W,64);ctx.font='24px Arial,"PingFang SC","Microsoft YaHei",sans-serif';ctx.fillStyle='#f1d1d2';ctx.textAlign='center';ctx.fillText(game.notice,W/2,80,W-30);ctx.textAlign='left';}
  else if(game.noticeTime>0){const lines=game.notice.split('\n');if(game.event&&game.noticeTime>2.1){ctx.fillStyle='#0c151e88';ctx.fillRect(0,0,W,H);}ctx.fillStyle='#0c151ee8';ctx.fillRect(0,40,W,lines.length*34+20);ctx.fillStyle='#d5e8f3';ctx.font='22px Arial,"PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign='center';lines.forEach((line,i)=>ctx.fillText(line,W/2,72+i*34,W-28));ctx.textAlign='left';}
 }
 function hud(force=false){
  if(!force&&game.elapsed-lastHud<.1)return;lastHud=game.elapsed;
  $('game-time').textContent=Math.floor(game.elapsed);$('game-score').textContent=game.score;$('game-rate').textContent=Number(firingRate(game).toFixed(1));$('game-level').textContent=difficulty(game.elapsed).level;
  $('game-weapon').textContent=(WEAPONS.find(w=>w.id===game.weapon)?.name||'毛毛虫机炮')+' Lv.'+game.weaponLevel;$('game-kills').textContent=game.kills;$('game-combo').textContent=game.combo;$('game-shield').textContent=game.shield;
  $('game-build').textContent=`↟ 穿 ${game.build.pierce}/3 · ⋔ 散 ${game.build.spread}/3 · ⌖ 追 ${game.build.track}/3`;
  const effects=[];for(const key in game.effects)if(game.effects[key]>0)effects.push({magnet:'磁铁',rage:'狂暴',slow:'慢动作',double:'双倍',rapid:'装填',fortune:'幸运'}[key]+' '+Math.ceil(game.effects[key])+'s');$('game-effects').textContent=effects.join(' · ');
  let hp=0,max=0,names=[];for(const e of game.enemies)if(e.active&&e.boss){hp+=Math.max(0,e.hp);max+=e.maxHp;if(!names.includes(BOSS_NAMES[e.roster]))names.push(BOSS_NAMES[e.roster]);}
  bossBar.hidden=!max;$('game-boss-name').textContent=names.join(' / ');$('game-boss-health').max=max||1;$('game-boss-health').value=hp;$('game-boss-hp').textContent=`${Math.ceil(hp)} / ${Math.ceil(max)}`;
  if(noticeSerial!==game.noticeSerial){noticeSerial=game.noticeSerial;$('game-announcement').textContent=game.notice;}
 }
 function settle(){const reward=Math.max(0,game.score-settledScore);visitor.peanutBest=Math.max(visitor.peanutBest,game.score);visitor.peanuts=number(visitor.peanuts+reward);settledScore=game.score;award('game');persist();return reward;}
 function reviveCost(){return REVIVE_COSTS[Math.min(game.revives,REVIVE_COSTS.length-1)];}
 function finish(){
  if(lastResult)return;cancelAnimationFrame(game.frame);game.frame=0;game.running=false;game.paused=false;leftHeld=rightHeld=upHeld=downHeld=false;pointer=null;
  const reward=settle();lastResult={score:game.score,bonus:0,reward:game.score,kills:game.kills,gun:game.gun,seconds:Math.floor(game.elapsed),date:today(),finished:false,cause:game.cause};
  $('game-overlay').hidden=false;choicePanel.hidden=true;$('game-message').textContent=DEATH_LINES[Math.floor(Math.random()*DEATH_LINES.length)]+'（'+game.cause+'）';
  $('game-start').textContent='重新开始';$('game-pause').disabled=true;$('game-pause').textContent='暂停';$('game-result').hidden=false;
  $('game-result-text').textContent=`存活 ${lastResult.seconds} 秒 · 花生 ${game.score} 粒 · 击杀 ${game.kills} · 最高连击 ${game.maxCombo} · Boss ${game.bossesDefeated} · 擦弹 ${game.grazes} 次。此次入库 ${reward} 粒。`;
  const cost=reviveCost();$('game-revive').hidden=false;$('game-revive').disabled=visitor.peanuts<cost;$('game-revive').textContent=`花生买命 · ${cost} 粒${visitor.peanuts<cost?'（粮仓不足）':''}`;
  renderShop();hud(true);gameDraw();
 }
 function evolution(){
  cancelAnimationFrame(game.frame);game.frame=0;$('game-overlay').hidden=true;choicePanel.hidden=false;$('game-pause').disabled=true;
  document.querySelectorAll('#game-evolution [data-evolution]').forEach(b=>{const k=b.dataset.evolution;b.disabled=game.build[k]>=3;b.querySelector('b').textContent=game.build[k]>=3?'已满级':`升至 ${game.build[k]+1} 级`;});
  choicePanel.querySelector('button:not([disabled])')?.focus({preventScroll:true});hud(true);
 }
 function tick(time){
  if(!game.running||game.paused||game.choice)return;const dt=Math.max(0,(time-game.last)/1000||0);game.last=time;
  if(dt>.3){pauseGame(true);$('game-message').textContent='刚才卡了一下。准备好再继续。';return;}
  const reverse=game.event==='reverse'?-1:1;if(leftHeld)game.target-=520*game.moveSpeed*dt*reverse;if(rightHeld)game.target+=520*game.moveSpeed*dt*reverse;if(upHeld)game.targetY-=440*game.moveSpeed*dt;if(downHeld)game.targetY+=440*game.moveSpeed*dt;
  const result=stepGame(game,dt);hud();gameDraw();if(result==='hit'){finish();return;}if(result==='choice'){evolution();return;}game.frame=requestAnimationFrame(tick);
 }
 function resumeFrame(){game.last=performance.now();game.frame=requestAnimationFrame(tick);}
 function startGame(){if(!ctx)return;cancelAnimationFrame(game.frame);fitGame();game.running=true;settledScore=0;lastHud=-1;leftHeld=rightHeld=upHeld=downHeld=false;pointer=null;lastResult=null;$('game-overlay').hidden=true;choicePanel.hidden=true;$('game-result').hidden=true;$('game-revive').hidden=true;$('score-export').hidden=true;$('game-pause').disabled=false;$('game-pause').textContent='暂停';$('game-shop').open=false;renderShop();canvas.focus({preventScroll:true});hud(true);gameDraw();resumeFrame();}
 function pauseGame(on){if(!game.running||game.choice)return;game.paused=on;cancelAnimationFrame(game.frame);game.frame=0;$('game-pause').textContent=on?'继续':'暂停';leftHeld=rightHeld=upHeld=downHeld=false;pointer=null;if(on){$('game-overlay').hidden=false;$('game-message').textContent='先停一下。花生等你回来。';$('game-start').textContent='继续这轮';}else{$('game-overlay').hidden=true;resumeFrame();}}
 $('game-start').disabled=!ctx;$('game-start').addEventListener('click',()=>{if(game.running&&game.paused)pauseGame(false);else startGame();});$('game-pause').addEventListener('click',()=>pauseGame(!game.paused));
 $('game-revive').addEventListener('click',()=>{const cost=reviveCost();if(game.running||!lastResult||visitor.peanuts<cost)return;visitor.peanuts-=cost;persist();reviveGame(game);lastResult=null;$('game-overlay').hidden=true;$('game-result').hidden=true;$('game-revive').hidden=true;$('game-pause').disabled=false;hud(true);canvas.focus({preventScroll:true});resumeFrame();});
 document.querySelectorAll('#game-evolution [data-evolution]').forEach(b=>b.addEventListener('click',()=>{if(!chooseEvolution(game,b.dataset.evolution))return;if(game.choice){evolution();return;}choicePanel.hidden=true;$('game-pause').disabled=false;hud(true);if(document.hidden){game.paused=false;pauseGame(true);}else{canvas.focus({preventScroll:true});resumeFrame();}}));
 function key(e,on){if(e.key.startsWith('Arrow')){e.preventDefault();if(e.key==='ArrowLeft')leftHeld=on;if(e.key==='ArrowRight')rightHeld=on;if(e.key==='ArrowUp')upHeld=on;if(e.key==='ArrowDown')downHeld=on;}}
 canvas.addEventListener('keydown',e=>{key(e,true);if(e.code==='Space'&&game.running){e.preventDefault();pauseGame(!game.paused);}});canvas.addEventListener('keyup',e=>key(e,false));canvas.addEventListener('blur',()=>{leftHeld=rightHeld=upHeld=downHeld=false;});
 function point(e){const b=canvas.getBoundingClientRect(),x=clampGame((e.clientX-b.left)/b.width*game.width,30,game.width-30);game.target=game.event==='reverse'?game.width-x:x;game.targetY=clampGame((e.clientY-b.top)/b.height*game.height,45,game.height-35);}
 function clampGame(n,a,b){return Math.max(a,Math.min(b,n));}
 canvas.addEventListener('pointerdown',e=>{if(!game.running||game.paused||game.choice)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);point(e);});canvas.addEventListener('pointermove',e=>{if(game.running&&!game.paused&&!game.choice&&e.pointerId===pointer)point(e);});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);
 [['game-left','left'],['game-right','right']].forEach(([id,d])=>{const b=$(id);const set=on=>{if(d==='left')leftHeld=on;else rightHeld=on;};b.addEventListener('pointerdown',e=>{set(true);b.setPointerCapture(e.pointerId);});b.addEventListener('pointerup',()=>set(false));b.addEventListener('pointercancel',()=>set(false));b.addEventListener('lostpointercapture',()=>set(false));b.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();set(true);}});b.addEventListener('keyup',()=>set(false));});
 gameBird.addEventListener('load',gameDraw);gameWorm.addEventListener('load',gameDraw);hud(true);gameDraw();
 // Permanent local armory: spending only settled peanuts, never the run's score.
 function renderShop(){
  if(lastResult&&!game.running){const cost=reviveCost();$('game-revive').disabled=visitor.peanuts<cost;$('game-revive').textContent=`花生买命 · ${cost} 粒${visitor.peanuts<cost?'（粮仓不足）':''}`;}
  for(const [id,items] of [['shop-weapons',WEAPONS],['shop-equipment',EQUIPMENT]]){
   const list=$(id);list.replaceChildren();
   for(const item of items){
    const level=visitor.armory.levels[item.id],price=item.prices[level],article=document.createElement('article');article.className='shop-item';
    const h=document.createElement('h4');h.textContent=item.name+' · '+(level?'Lv.'+level:'未解锁');
    const p=document.createElement('p');p.textContent=item.description;
    const actions=document.createElement('div');actions.className='shop-item-actions';
    const buy=document.createElement('button');buy.type='button';buy.dataset.shopBuy=item.id;
    buy.textContent=price===undefined?'已满级':(level?'升级':'解锁')+' · '+price+' 粒';buy.disabled=price===undefined||visitor.peanuts<price||(game.running&&!game.paused)||game.choice;
    buy.addEventListener('click',()=>{
     if((game.running&&!game.paused)||game.choice)return;
     const result=purchaseUpgrade(visitor.armory,visitor.peanuts,item.id);if(!result.ok)return;
     visitor.armory=result.loadout;visitor.peanuts=result.balance;persist();renderShop();$('shop-status').textContent=item.name+'已升级，下一轮生效。';
    });actions.append(buy);
    if(id==='shop-weapons'){
     const equip=document.createElement('button');equip.type='button';equip.dataset.shopEquip=item.id;equip.textContent=visitor.armory.selected===item.id?'已装备':'装备';equip.setAttribute('aria-pressed',String(visitor.armory.selected===item.id));equip.disabled=!level||(game.running&&!game.paused)||game.choice;
     equip.addEventListener('click',()=>{if(!level||(game.running&&!game.paused)||game.choice)return;visitor.armory.selected=item.id;persist();renderShop();$('shop-status').textContent=item.name+'已装备，下一轮使用。';});actions.append(equip);
    }
    article.append(h,p,actions);list.append(article);
   }
  }
 }
 $('game-shop').addEventListener('toggle',()=>{if($('game-shop').open&&game.running&&!game.paused&&!game.choice)pauseGame(true);renderShop();});renderShop();
 // Canvas is used for exact personal cards, never to redraw the bird.
 const exports=new Map();let passportFile=null;
 function cardBase(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');if(!g)throw Error('canvas');g.fillStyle='#dbe1dd';g.fillRect(0,0,width,height);g.strokeStyle='#728c97';g.lineWidth=2;g.strokeRect(30,30,width-60,height-60);g.fillStyle='#283e4a';g.font='30px monospace';g.fillText('GRAYBIRD',70,100);return [c,g];}
 const font='Arial,"PingFang SC","Microsoft YaHei",sans-serif';
 function wrap(g,text,x,y,width,lineHeight,maxLines=3){let line='',lines=0;for(const ch of Array.from(text)){if(g.measureText(line+ch).width>width&&line){g.fillText(line,x,y+lines*lineHeight);line=ch;lines++;if(lines>=maxLines)return;}else line+=ch;}if(line)g.fillText(line,x,y+lines*lineHeight);}
 async function exportPNG(c,key,imageId,previewId,downloadId,filename){const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw Error('export');if(exports.has(key))URL.revokeObjectURL(exports.get(key));const url=URL.createObjectURL(blob);exports.set(key,url);$(imageId).src=url;$(previewId).hidden=false;$(downloadId).href=url;$(downloadId).download=filename;return new File([blob],filename,{type:'image/png'});}
 $('save-passport').addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;$('passport-status').textContent='盖章中。';try{await gameBird.decode();const [c,g]=cardBase(1000,1320);g.font='22px monospace';g.fillText('EARTH VISITOR PASSPORT',70,145);g.strokeStyle='#93a5ac';g.beginPath();g.moveTo(70,180);g.lineTo(930,180);g.stroke();g.font=`22px ${font}`;g.fillStyle='#5c7582';g.fillText('访客 / VISITOR',70,235);g.fillStyle='#283e4a';g.font=`bold 46px ${font}`;wrap(g,visitor.name||'路过的地球人',70,310,550,60);g.font='22px monospace';g.fillText(visitor.id,70,425);g.drawImage(gameBird,700,225,210,210);g.font=`24px ${font}`;g.fillText('探索记录 / '+Object.keys(visitor.stamps).length+' OF 9',70,510);Object.entries(stampInfo).forEach(([key,[label,symbol]],i)=>{const x=70+i%3*290,y=550+Math.floor(i/3)*185,earned=Boolean(visitor.stamps[key]);g.strokeStyle=earned?'#4f778a':'#9aaeb4';g.lineWidth=earned?3:1;g.setLineDash(earned?[]:[7,6]);g.strokeRect(x,y,260,160);g.setLineDash([]);g.fillStyle=earned?'#335a70':'#8d9fa7';g.textAlign='center';g.font='42px monospace';g.fillText(symbol,x+130,y+53);g.font=`22px ${font}`;g.fillText(label,x+130,y+98);g.font=`16px ${font}`;g.fillText(visitor.stamps[key]||'等你探索',x+130,y+132);g.textAlign='left';});g.fillStyle='#506f7e';g.font=`22px ${font}`;g.fillText('首次到访 · '+visitor.first,70,1150);g.fillText('门没锁。下次再来。',70,1210);g.font='20px monospace';g.fillText('graybird.space/play/',70,1265);passportFile=await exportPNG(c,'passport','passport-image','passport-export','passport-download','Graybird-Visitor-'+visitor.id+'.png');$('share-passport').hidden=false;$('passport-status').textContent='卡片好了。点下载，或者长按图片保存。';}catch(_){$('passport-status').textContent='图片暂时没生成成功，可以先截图保存护照。';}finally{b.disabled=false;}});
 $('share-passport').addEventListener('click',async()=>{try{if(passportFile&&navigator.canShare?.({files:[passportFile]})){await navigator.share({files:[passportFile],title:'Graybird 地球访客卡'});return;}if(navigator.share){await navigator.share({title:'来 Graybird 鸟窝坐坐',url:'https://graybird.space/play/'});return;}await navigator.clipboard.writeText('https://graybird.space/play/');$('passport-status').textContent='鸟窝链接已复制。图片可以单独保存分享。';}catch(e){if(e.name!=='AbortError')$('passport-status').textContent='可以长按图片保存，再分享给朋友。';}});
 $('save-score').addEventListener('click',async e=>{if(!lastResult)return;const b=e.currentTarget;b.disabled=true;try{await gameBird.decode();const r=lastResult,[c,g]=cardBase(1000,1100);g.font='22px monospace';g.fillText('PEANUT HUNTER / SURVIVAL',70,150);g.drawImage(gameBird,670,205,250,250);g.font=`28px ${font}`;g.fillText('本轮花生奖励',70,260);g.font='bold 130px monospace';g.fillText(String(r.reward),65,415);g.font=`28px ${font}`;g.fillText(visitor.name||'路过的地球人',70,545);g.font=`24px ${font}`;g.fillText('存活时间 · '+r.seconds+' 秒',70,625);g.fillText('捡到 '+r.score+' 粒 · 最高连击 '+game.maxCombo,70,685);g.fillText('撞到'+r.cause+'，下次再来。',70,745);g.font=`22px ${font}`;g.fillText('打掉 '+r.kills+' 个干扰 · 射速 '+FIRE_RATES[r.gun-1]+' 发/秒',70,880);g.fillText('地球日期 · '+r.date,70,950);g.font='22px monospace';g.fillText('graybird.space/play/',70,1025);await exportPNG(c,'score','score-image','score-export','score-download','Graybird-Peanuts-'+r.date+'.png');}catch(_){$('game-result-text').textContent+=' 成绩卡暂时无法生成，可以截图保存。';}finally{b.disabled=false;}});
 // Real giscus is enabled only after the repository and app grant are ready.
 let wallConfig=null,wallLoaded=false,wallTimeout=0;
 fetch('/data/giscus.json?v=1').then(r=>{if(!r.ok)throw Error('config');return r.json();}).then(c=>{if(c.enabled===true&&typeof c.repo==='string'&&/^[\w.-]+\/[\w.-]+$/.test(c.repo)&&c.repoId&&c.categoryId){wallConfig=c;$('wall-status').textContent='留言墙已开放。点下方加载真实留言。';$('wall-load').hidden=false;}}).catch(()=>{$('wall-status').textContent='留言服务暂时无法连接。其他区域照常开放。';});
 $('wall-load').addEventListener('click',()=>{if(wallLoaded||!wallConfig)return;wallLoaded=true;$('wall-load').disabled=true;$('wall-load').textContent='连接留言墙…';const s=document.createElement('script');s.src='https://giscus.app/client.js';s.async=true;s.crossOrigin='anonymous';const attributes={repo:wallConfig.repo,'repo-id':wallConfig.repoId,category:wallConfig.category,'category-id':wallConfig.categoryId,mapping:'specific',term:wallConfig.term||'Graybird 鸟友留言墙',strict:'1','reactions-enabled':'1','emit-metadata':'1','input-position':'top',theme:visitor.night?'transparent_dark':'dark',lang:'zh-CN'};Object.entries(attributes).forEach(([k,v])=>s.setAttribute('data-'+k,v));s.onerror=()=>{$('wall-status').textContent='留言服务暂时没连上。请稍后重试。';$('wall-load').textContent='重试连接';$('wall-load').disabled=false;wallLoaded=false;s.remove();};$('giscus-container').replaceChildren(s);wallTimeout=setTimeout(()=>{$('wall-status').textContent='连接用时较长。留言由 Giscus 提供，可能需要稍后再试。';},15000);});
 addEventListener('message',e=>{if(e.origin!=='https://giscus.app'||!e.data?.giscus)return;const d=e.data.giscus;if(d.error){clearTimeout(wallTimeout);$('wall-status').textContent='留言墙连接出了问题。请稍后再试。';}else if(d.discussion||d.resizeHeight){clearTimeout(wallTimeout);$('wall-status').textContent='留言已连接。登录 GitHub 后即可发言。';$('wall-load').hidden=true;}});
 if ('IntersectionObserver' in window) new IntersectionObserver(entries=>entries.forEach(e=>$('room-scene').classList.toggle('is-offscreen',!e.isIntersecting))).observe($('room-scene'));
 document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('page-asleep',document.hidden);if(document.hidden){endDrag(true);if(game.running&&!game.paused)pauseGame(true);if(audio&&audioOn)audio.suspend();}else{if(today()!==mailDay)renderMail();if(audio&&audioOn)audio.resume().catch(()=>stopAudio());}});
 addEventListener('pagehide',e=>{if(game.running&&!game.paused)pauseGame(true);cancelAnimationFrame(game.frame);clearTimeout(feedTimer);feedBusy=false;bird.classList.remove('is-thinking');clearTimeout(wallTimeout);stopAudio();if(!e.persisted){clearInterval(mailTimer);exports.forEach(url=>URL.revokeObjectURL(url));}});
})();
