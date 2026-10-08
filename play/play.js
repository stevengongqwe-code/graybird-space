/* Independent Bird Nest: official images stay intact; personal progress stays local. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const KEY = 'graybird.explorer.v2';
 const stampInfo = {
  arrival:['到访鸟窝','＋'],journal:['翻过日记','≡'],earth:['望向地球','○'],feed:['虫虫外交','✦'],archive:['打开档案','▤'],mail:['宇宙来信','✉'],night:['夜间留宿','☾'],game:['信号猎人','⌁'],secret:['隐藏信号','?']
 };
 const clean = s => typeof s === 'string' ? Array.from(s.replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim()).slice(0,16).join('') : '';
 const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const dateValid = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
 const number = n => Number.isSafeInteger(n) && n >= 0 ? Math.min(n,999999) : 0;
 function newVisitor() {
  const bytes = new Uint8Array(4); crypto.getRandomValues(bytes);
  return {version:2,id:'G-'+[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase(),name:'',first:today(),stamps:{},worms:0,best:0,letters:{},night:false};
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
   if (s?.version === 2) {visitor.worms=number(s.worms);visitor.best=number(s.best);visitor.night=s.night===true;}
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
  $('game-best').textContent=visitor.best;
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
 // A real 30-second game. The official bird is drawn from its unchanged asset.
 const canvas=$('signal-game'),ctx=canvas.getContext('2d'),gameBird=new Image();gameBird.src='/assets/bird.webp';
 let game={running:false,paused:false,score:0,hits:0,lives:3,elapsed:0,x:450,target:450,items:[],spawn:0,frame:0,last:0,invincible:0},lastResult=null;
 let leftHeld=false,rightHeld=false,pointer=null;
 const W=900,H=600,birdY=H-78;
 function gameDraw(){if(!ctx)return;ctx.fillStyle='#0c151e';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#20313f';ctx.lineWidth=1;for(let x=0;x<W;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=90){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}for(const item of game.items){if(item.good){ctx.fillStyle='#afdef9';ctx.fillRect(item.x-20,item.y-20,40,40);ctx.fillStyle='#123349';ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText('＋',item.x,item.y+8);}else{ctx.fillStyle='#633c41';ctx.fillRect(item.x-60,item.y-24,120,48);ctx.strokeStyle='#be848a';ctx.strokeRect(item.x-60,item.y-24,120,48);ctx.fillStyle='#f1d1d2';ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText(item.label,item.x,item.y+8);}}ctx.globalAlpha=game.invincible>0&&!motion.matches?.5:1;if(gameBird.complete&&gameBird.naturalWidth)ctx.drawImage(gameBird,game.x-38,birdY-38,76,76);ctx.globalAlpha=1;ctx.textAlign='left';}
 function hud(){$('game-time').textContent=Math.max(0,Math.ceil(30-game.elapsed));$('game-score').textContent=game.score;$('game-lives').textContent=game.lives;}
 function finish(){cancelAnimationFrame(game.frame);game.frame=0;game.running=false;game.paused=false;leftHeld=rightHeld=false;pointer=null;lastResult={score:game.score,hits:game.hits,lives:game.lives,seconds:Math.min(30,Math.floor(game.elapsed)),date:today(),finished:game.elapsed>=30};visitor.best=Math.max(visitor.best,game.score);award('game');persist();$('game-overlay').hidden=false;$('game-message').textContent=game.lives?`收下 ${game.score} 个信号。剩下的，不看了。`:'广告太多。鸟先下线了。';$('game-start').textContent='再来 30 秒';$('game-pause').disabled=true;$('game-pause').textContent='暂停';$('game-result').hidden=false;$('game-result-text').textContent=`本轮 ${lastResult.seconds} 秒 · ${game.score} 个有用信号 · 撞到 ${game.hits} 次干扰。${lastResult.finished?'完成观测。':'耐心耗尽，本轮结束。'}`;gameDraw();}
 function tick(time){if(!game.running||game.paused)return;const rawDelta=Math.max(0,(time-game.last)/1000||0),dt=Math.min(.06,rawDelta);game.last=time;game.elapsed+=rawDelta;game.spawn+=dt;game.invincible=Math.max(0,game.invincible-dt);if(leftHeld)game.target-=520*dt;if(rightHeld)game.target+=520*dt;game.target=Math.max(38,Math.min(W-38,game.target));game.x+=(game.target-game.x)*Math.min(1,dt*20);if(game.spawn>=.52){game.spawn=0;const good=Math.random()<.42;game.items.push({x:good?40+Math.random()*(W-80):75+Math.random()*(W-150),y:-40,good,label:['广告','弹窗','无效信息'][Math.floor(Math.random()*3)],speed:good?200:175+Math.random()*65});}for(const item of game.items){item.y+=item.speed*dt;const half=item.good?20:60;if(Math.abs(item.x-game.x)<half+25&&Math.abs(item.y-birdY)<40){if(item.good){game.score++;item.dead=true;}else if(game.invincible===0){game.hits++;game.lives--;game.invincible=.9;item.dead=true;}}}game.items=game.items.filter(i=>!i.dead&&i.y<H+60);hud();gameDraw();if(game.elapsed>=30||game.lives<=0){finish();return;}game.frame=requestAnimationFrame(tick);}
 function startGame(){if(!ctx)return;cancelAnimationFrame(game.frame);game={running:true,paused:false,score:0,hits:0,lives:3,elapsed:0,x:450,target:450,items:[],spawn:0,frame:0,last:performance.now(),invincible:0};leftHeld=rightHeld=false;lastResult=null;$('game-overlay').hidden=true;$('game-result').hidden=true;$('score-export').hidden=true;$('game-pause').disabled=false;$('game-pause').textContent='暂停';canvas.focus({preventScroll:true});hud();gameDraw();game.frame=requestAnimationFrame(tick);}
 function pauseGame(on){if(!game.running)return;game.paused=on;cancelAnimationFrame(game.frame);game.frame=0;$('game-pause').textContent=on?'继续':'暂停';leftHeld=rightHeld=false;if(on){$('game-overlay').hidden=false;$('game-message').textContent='先停一下。信号等你回来。';$('game-start').textContent='继续这轮';}else{$('game-overlay').hidden=true;game.last=performance.now();game.frame=requestAnimationFrame(tick);}}
 $('game-start').disabled=!ctx;$('game-start').addEventListener('click',()=>{if(game.running&&game.paused)pauseGame(false);else startGame();});$('game-pause').addEventListener('click',()=>pauseGame(!game.paused));
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();if(e.key==='ArrowLeft')leftHeld=true;else rightHeld=true;}if(e.code==='Space'&&game.running){e.preventDefault();pauseGame(!game.paused);}});canvas.addEventListener('keyup',e=>{if(e.key==='ArrowLeft')leftHeld=false;if(e.key==='ArrowRight')rightHeld=false;});canvas.addEventListener('blur',()=>{leftHeld=rightHeld=false;});
 function point(e){const b=canvas.getBoundingClientRect();game.target=Math.max(38,Math.min(W-38,(e.clientX-b.left)/b.width*W));}
 canvas.addEventListener('pointerdown',e=>{if(!game.running||game.paused)return;pointer=e.pointerId;canvas.setPointerCapture(pointer);point(e);});canvas.addEventListener('pointermove',e=>{if(game.running&&!game.paused&&(e.pointerType==='mouse'||e.pointerId===pointer))point(e);});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);
 [['game-left','left'],['game-right','right']].forEach(([id,d])=>{const b=$(id);const set=on=>{if(d==='left')leftHeld=on;else rightHeld=on;};b.addEventListener('pointerdown',e=>{set(true);b.setPointerCapture(e.pointerId);});b.addEventListener('pointerup',()=>set(false));b.addEventListener('pointercancel',()=>set(false));b.addEventListener('lostpointercapture',()=>set(false));b.addEventListener('keydown',e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();set(true);}});b.addEventListener('keyup',()=>set(false));});
 gameBird.addEventListener('load',gameDraw);gameDraw();
 // Canvas is used for exact personal cards, never to redraw the bird.
 const exports=new Map();let passportFile=null;
 function cardBase(width,height){const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');if(!g)throw Error('canvas');g.fillStyle='#dbe1dd';g.fillRect(0,0,width,height);g.strokeStyle='#728c97';g.lineWidth=2;g.strokeRect(30,30,width-60,height-60);g.fillStyle='#283e4a';g.font='30px monospace';g.fillText('GRAYBIRD',70,100);return [c,g];}
 const font='Arial,"PingFang SC","Microsoft YaHei",sans-serif';
 function wrap(g,text,x,y,width,lineHeight,maxLines=3){let line='',lines=0;for(const ch of Array.from(text)){if(g.measureText(line+ch).width>width&&line){g.fillText(line,x,y+lines*lineHeight);line=ch;lines++;if(lines>=maxLines)return;}else line+=ch;}if(line)g.fillText(line,x,y+lines*lineHeight);}
 async function exportPNG(c,key,imageId,previewId,downloadId,filename){const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw Error('export');if(exports.has(key))URL.revokeObjectURL(exports.get(key));const url=URL.createObjectURL(blob);exports.set(key,url);$(imageId).src=url;$(previewId).hidden=false;$(downloadId).href=url;$(downloadId).download=filename;return new File([blob],filename,{type:'image/png'});}
 $('save-passport').addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;$('passport-status').textContent='盖章中。';try{await gameBird.decode();const [c,g]=cardBase(1000,1320);g.font='22px monospace';g.fillText('EARTH VISITOR PASSPORT',70,145);g.strokeStyle='#93a5ac';g.beginPath();g.moveTo(70,180);g.lineTo(930,180);g.stroke();g.font=`22px ${font}`;g.fillStyle='#5c7582';g.fillText('访客 / VISITOR',70,235);g.fillStyle='#283e4a';g.font=`bold 46px ${font}`;wrap(g,visitor.name||'路过的地球人',70,310,550,60);g.font='22px monospace';g.fillText(visitor.id,70,425);g.drawImage(gameBird,700,225,210,210);g.font=`24px ${font}`;g.fillText('探索记录 / '+Object.keys(visitor.stamps).length+' OF 9',70,510);Object.entries(stampInfo).forEach(([key,[label,symbol]],i)=>{const x=70+i%3*290,y=550+Math.floor(i/3)*185,earned=Boolean(visitor.stamps[key]);g.strokeStyle=earned?'#4f778a':'#9aaeb4';g.lineWidth=earned?3:1;g.setLineDash(earned?[]:[7,6]);g.strokeRect(x,y,260,160);g.setLineDash([]);g.fillStyle=earned?'#335a70':'#8d9fa7';g.textAlign='center';g.font='42px monospace';g.fillText(symbol,x+130,y+53);g.font=`22px ${font}`;g.fillText(label,x+130,y+98);g.font=`16px ${font}`;g.fillText(visitor.stamps[key]||'等你探索',x+130,y+132);g.textAlign='left';});g.fillStyle='#506f7e';g.font=`22px ${font}`;g.fillText('首次到访 · '+visitor.first,70,1150);g.fillText('门没锁。下次再来。',70,1210);g.font='20px monospace';g.fillText('graybird.space/play/',70,1265);passportFile=await exportPNG(c,'passport','passport-image','passport-export','passport-download','Graybird-Visitor-'+visitor.id+'.png');$('share-passport').hidden=false;$('passport-status').textContent='卡片好了。点下载，或者长按图片保存。';}catch(_){$('passport-status').textContent='图片暂时没生成成功，可以先截图保存护照。';}finally{b.disabled=false;}});
 $('share-passport').addEventListener('click',async()=>{try{if(passportFile&&navigator.canShare?.({files:[passportFile]})){await navigator.share({files:[passportFile],title:'Graybird 地球访客卡'});return;}if(navigator.share){await navigator.share({title:'来 Graybird 鸟窝坐坐',url:'https://graybird.space/play/'});return;}await navigator.clipboard.writeText('https://graybird.space/play/');$('passport-status').textContent='鸟窝链接已复制。图片可以单独保存分享。';}catch(e){if(e.name!=='AbortError')$('passport-status').textContent='可以长按图片保存，再分享给朋友。';}});
 $('save-score').addEventListener('click',async e=>{if(!lastResult)return;const b=e.currentTarget;b.disabled=true;try{await gameBird.decode();const r=lastResult,[c,g]=cardBase(1000,1100);g.font='22px monospace';g.fillText('SIGNAL HUNTER / 30 SECONDS',70,150);g.drawImage(gameBird,670,205,250,250);g.font=`28px ${font}`;g.fillText('有用的信号',70,260);g.font='bold 130px monospace';g.fillText(String(r.score),65,415);g.font=`28px ${font}`;g.fillText(visitor.name||'路过的地球人',70,545);g.font=`24px ${font}`;g.fillText('实际观测 · '+r.seconds+' 秒',70,625);g.fillText('撞到干扰 · '+r.hits+' 次',70,685);g.fillText(r.finished?'完成这一轮。':'鸟的耐心耗尽了。',70,745);g.font=`22px ${font}`;g.fillText(r.score>5?'这些，够用了。':'只要有用的。别什么都捡。',70,880);g.fillText('地球日期 · '+r.date,70,950);g.font='22px monospace';g.fillText('graybird.space/play/',70,1025);await exportPNG(c,'score','score-image','score-export','score-download','Graybird-Signal-'+r.date+'.png');}catch(_){$('game-result-text').textContent+=' 成绩卡暂时无法生成，可以截图保存。';}finally{b.disabled=false;}});
 // Real giscus is enabled only after the repository and app grant are ready.
 let wallConfig=null,wallLoaded=false,wallTimeout=0;
 fetch('/data/giscus.json?v=1').then(r=>{if(!r.ok)throw Error('config');return r.json();}).then(c=>{if(c.enabled===true&&typeof c.repo==='string'&&/^[\w.-]+\/[\w.-]+$/.test(c.repo)&&c.repoId&&c.categoryId){wallConfig=c;$('wall-status').textContent='留言墙已开放。点下方加载真实留言。';$('wall-load').hidden=false;}}).catch(()=>{$('wall-status').textContent='留言服务暂时无法连接。其他区域照常开放。';});
 $('wall-load').addEventListener('click',()=>{if(wallLoaded||!wallConfig)return;wallLoaded=true;$('wall-load').disabled=true;$('wall-load').textContent='连接留言墙…';const s=document.createElement('script');s.src='https://giscus.app/client.js';s.async=true;s.crossOrigin='anonymous';const attributes={repo:wallConfig.repo,'repo-id':wallConfig.repoId,category:wallConfig.category,'category-id':wallConfig.categoryId,mapping:'specific',term:wallConfig.term||'Graybird 鸟友留言墙',strict:'1','reactions-enabled':'1','emit-metadata':'1','input-position':'top',theme:visitor.night?'transparent_dark':'dark',lang:'zh-CN'};Object.entries(attributes).forEach(([k,v])=>s.setAttribute('data-'+k,v));s.onerror=()=>{$('wall-status').textContent='留言服务暂时没连上。请稍后重试。';$('wall-load').textContent='重试连接';$('wall-load').disabled=false;wallLoaded=false;s.remove();};$('giscus-container').replaceChildren(s);wallTimeout=setTimeout(()=>{$('wall-status').textContent='连接用时较长。留言由 Giscus 提供，可能需要稍后再试。';},15000);});
 addEventListener('message',e=>{if(e.origin!=='https://giscus.app'||!e.data?.giscus)return;const d=e.data.giscus;if(d.error){clearTimeout(wallTimeout);$('wall-status').textContent='留言墙连接出了问题。请稍后再试。';}else if(d.discussion||d.resizeHeight){clearTimeout(wallTimeout);$('wall-status').textContent='留言已连接。登录 GitHub 后即可发言。';$('wall-load').hidden=true;}});
 if ('IntersectionObserver' in window) new IntersectionObserver(entries=>entries.forEach(e=>$('room-scene').classList.toggle('is-offscreen',!e.isIntersecting))).observe($('room-scene'));
 document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('page-asleep',document.hidden);if(document.hidden){endDrag(true);if(game.running&&!game.paused)pauseGame(true);if(audio&&audioOn)audio.suspend();}else{if(today()!==mailDay)renderMail();if(audio&&audioOn)audio.resume().catch(()=>stopAudio());}});
 addEventListener('pagehide',e=>{if(game.running&&!game.paused)pauseGame(true);cancelAnimationFrame(game.frame);clearTimeout(feedTimer);feedBusy=false;bird.classList.remove('is-thinking');clearTimeout(wallTimeout);stopAudio();if(!e.persisted){clearInterval(mailTimer);exports.forEach(url=>URL.revokeObjectURL(url));}});
})();
