/* The passport lives on this browser only. No account, server or identity mapping. */
(() => {
 'use strict';
 const KEY = 'graybird.visitor.v1';
 const stampInfo = {
  arrival:['到访鸟窝','＋'],window:['窗边观测','○'],journal:['翻过日记','≡'],
  feed:['花生外交','✦'],archive:['读过档案','↗'],signal:['隐藏信号','?']
 };
 const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 };
 const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
 const cleanName = value => typeof value === 'string' ? Array.from(value.replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim()).slice(0,16).join('') : '';
 function fresh() {
  const bytes = new Uint8Array(4);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_,i) => bytes[i] = Math.floor(Math.random()*256));
  return {version:1,id:'G-'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase(),name:'',first:today(),stamps:{},fed:0};
 }
 let state = fresh(), storageOK = true;
 try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && saved.version === 1) {
   if (typeof saved.id === 'string' && /^G-[0-9A-F]{8}$/.test(saved.id)) state.id = saved.id;
   state.name = cleanName(saved.name);
   if (validDate(saved.first)) state.first = saved.first;
   state.fed = Number.isSafeInteger(saved.fed) && saved.fed >= 0 ? Math.min(saved.fed,999999) : 0;
   if (saved.stamps && typeof saved.stamps === 'object') Object.keys(stampInfo).forEach(key => {
    if (validDate(saved.stamps[key])) state.stamps[key] = saved.stamps[key];
   });
  }
 } catch (_) { storageOK = false; }
 function persist() {
  try { localStorage.setItem(KEY,JSON.stringify(state)); storageOK = true; }
  catch (_) { storageOK = false; }
  render();
 }
 function award(key) {
  if (state.stamps[key]) return false;
  state.stamps[key] = today(); persist(); return true;
 }
 const root = document.querySelector('[data-nest-experience]');
 const passport = document.querySelector('[data-nest-passport]');
 function render() {
  if (!passport) return;
  passport.querySelector('#passport-name-display').textContent = state.name || '路过的地球人';
  passport.querySelector('#passport-id').textContent = state.id;
  passport.querySelector('#passport-date').textContent = '首次到访 · '+state.first.replace(/-/g,'.');
  const earned = Object.keys(state.stamps).length;
  passport.querySelector('#passport-progress').textContent = `${earned} / 6 枚印章`;
  passport.querySelectorAll('[data-stamp]').forEach(el => {
   const key = el.dataset.stamp, date = state.stamps[key];
   el.classList.toggle('is-earned', Boolean(date));
   el.setAttribute('aria-label', `${stampInfo[key][0]}：${date ? '已获得，'+date : '尚未获得'}`);
  });
  passport.querySelector('#passport-storage-note').textContent = storageOK
   ? '昵称与进度仅保存在当前浏览器。换设备或清除浏览数据后，可能需要重新探索。'
   : '浏览器暂时无法保存进度；本页仍可探索和导出护照，离开后可能丢失。';
  if (root) root.querySelector('#nest-feed-count').textContent = state.fed ? `这本护照下，已收下 ${state.fed} 颗花生` : '还没收下花生';
 }
 // Visiting an actual full article earns a reading stamp, rather than a fake click count.
 if (/^\/archive\/[^/]+\/(?:index\.html)?$/.test(location.pathname)) { award('archive'); return; }
 if (!root || !passport) return;
 award('arrival'); render();
 const message = root.querySelector('#nest-message'), messageLink = root.querySelector('#nest-message-link');
 const bird = root.querySelector('#nest-bird'), food = root.querySelector('#nest-peanut');
 const sparkle = root.querySelector('.nest-fed-peanut');
 let selected = false, feedBurst = 0, lastFeed = 0, nodTimer = 0;
 const reactions = ['先放那儿。我一会儿再吃。','嗯……这个可以。','你怎么知道我没吃午饭。','收下了。别到处说。','啾。你可以再坐一会儿。'];
 function say(text,link,label) {
  message.textContent = text; messageLink.hidden = !link;
  if (link) { messageLink.href = link; messageLink.textContent = label; }
 }
 function pick(on) {
  selected = on; food.setAttribute('aria-pressed',String(on)); bird.classList.toggle('is-ready',on);
  root.querySelector('#nest-feed-help').textContent = on ? '拿好了。点灰鸟，或者把花生拖到它身上。' : '先拿花生，再点灰鸟。也可以直接拖给它。';
 }
 function feed() {
  const now = Date.now();
  if (now - lastFeed < 850) { say('等一下，上一颗还没咽。'); return; }
  if (now - lastFeed > 20000) feedBurst = 0;
  lastFeed = now; feedBurst++; pick(false);
  if (feedBurst > 3) { say('够了够了。我是鸟，不是花生收购站。'); return; }
  state.fed = Math.min(state.fed+1,999999);
  const first = award('feed'); persist();
  say(first ? '行吧，收下了。给你盖个「花生外交」章。' : reactions[(state.fed-2+reactions.length)%reactions.length]);
  clearTimeout(nodTimer); bird.classList.add('is-nodding'); sparkle.hidden = false;
  nodTimer = setTimeout(() => { bird.classList.remove('is-nodding'); sparkle.hidden = true; },650);
 }
 bird.addEventListener('click',() => {
  if (selected) feed(); else say(state.fed ? '又来啦。今天有什么新鲜事？' : '看我干嘛。你带吃的了吗？');
 });
 root.querySelectorAll('[data-nest-object]').forEach(button => button.addEventListener('click',() => {
  const key = button.dataset.nestObject;
  root.querySelectorAll('[data-nest-object]').forEach(el => el.setAttribute('aria-pressed',String(el===button)));
  if (key === 'window') { award('window'); say('这颗蓝色的星球，晚上也不肯安静。','/#terminal','去观测终端看看 →'); }
  if (key === 'journal') { award('journal'); say('今天的记录：门开着。有些问题，得有人坐下来才聊得明白。','/archive/nothing-to-prove/','翻一页日记 →'); }
  if (key === 'computer') say('电脑里都是地球人留下的问题。选一份读读。','/archive/','打开内容档案馆 →');
  if (key === 'signal') { const first = award('signal'); say(first ? '纸条上写着：门一直没锁。你找到隐藏信号了。' : '你又翻到了这张纸条。行，还是欢迎你。'); }
 }));
 // Pointer dragging is optional. The same action is always available with two taps or keyboard.
 const ghost = root.querySelector('.nest-drag-ghost');
 let drag = null, lastDrag = -1000;
 function endDrag(cancelled,event) {
  if (!drag) return;
  const active = drag; drag = null; ghost.hidden = true;
  if (food.hasPointerCapture(active.id)) food.releasePointerCapture(active.id);
  if (!active.moved) return;
  lastDrag = Date.now();
  if (!cancelled && event) {
   const box = bird.getBoundingClientRect();
   if (event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom) feed();
   else say('花生还在你手里。往我这边递。');
  }
 }
 food.addEventListener('click',() => {
  if (Date.now()-lastDrag < 500) return;
  pick(!selected); say(selected ? '花生？先让我看看。' : '又收回去了。行吧。');
 });
 food.addEventListener('pointerdown',event => {
  if (event.button !== 0 || !event.isPrimary) return;
  drag = {id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
  food.setPointerCapture(event.pointerId);
 });
 food.addEventListener('pointermove',event => {
  if (!drag || event.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8) { drag.moved = true; pick(true); }
  if (drag.moved) { ghost.hidden = false; ghost.style.transform = `translate(${event.clientX-22}px,${event.clientY-22}px)`; }
 });
 food.addEventListener('pointerup',event => endDrag(false,event));
 food.addEventListener('pointercancel',event => endDrag(true,event));
 food.addEventListener('lostpointercapture',event => endDrag(true,event));
 addEventListener('blur',() => endDrag(true));
 document.addEventListener('visibilitychange',() => { if (document.hidden) endDrag(true); });
 root.querySelectorAll('button[disabled]').forEach(button => button.disabled = false);
 root.querySelector('.nest-feeding').hidden = false;
 passport.querySelector('.passport-controls').hidden = false;
 const nickname = passport.querySelector('#passport-nickname'), status = passport.querySelector('#passport-status');
 nickname.value = state.name;
 passport.querySelector('#passport-form').addEventListener('submit',event => {
  event.preventDefault(); state.name = cleanName(nickname.value); nickname.value = state.name; persist();
  status.textContent = storageOK ? '名字记好了。欢迎下次再来。' : '名字已显示在护照上，本次无法长期保存。';
 });
 addEventListener('storage',event => {
  if (event.key !== KEY || !event.newValue) return;
  try {
   const saved = JSON.parse(event.newValue);
   if (!saved || saved.version !== 1 || saved.id !== state.id) return;
   Object.keys(stampInfo).forEach(key => { if (validDate(saved.stamps?.[key])) state.stamps[key] = saved.stamps[key]; });
   if (Number.isSafeInteger(saved.fed) && saved.fed >= 0) state.fed = Math.max(state.fed,Math.min(saved.fed,999999));
   state.name = cleanName(saved.name); nickname.value = state.name; render();
  } catch (_) { /* Keep the working in-memory passport. */ }
 });
 passport.querySelector('#passport-copy').addEventListener('click',async () => {
  const fallback = passport.querySelector('#passport-copy-fallback');
  try { await navigator.clipboard.writeText('https://graybird.space/nest/'); fallback.hidden = true; status.textContent = '链接复制好了。带个人来坐坐。'; }
  catch (_) { fallback.hidden = false; fallback.focus(); fallback.select(); status.textContent = '请手动复制下方的鸟窝链接。'; }
 });
 let imageURL = '';
 function wrap(ctx,text,x,y,width,lineHeight) {
  let line = '', lines = 0;
  for (const char of Array.from(text)) {
   if (ctx.measureText(line+char).width > width && line) { ctx.fillText(line,x,y+lines*lineHeight); line = char; lines++; }
   else line += char;
  }
  if (line) ctx.fillText(line,x,y+lines*lineHeight);
  return lines+1;
 }
 passport.querySelector('#passport-save').addEventListener('click',async event => {
  const button = event.currentTarget; button.disabled = true; status.textContent = '正在盖章，稍等一下。';
  try {
   const canvas = document.createElement('canvas'); canvas.width = 1000; canvas.height = 1280;
   const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('canvas');
   const originalBird = new Image(); originalBird.src = '/assets/bird.webp'; await originalBird.decode();
   const font = '-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,"PingFang SC","Microsoft YaHei",sans-serif';
   ctx.fillStyle = '#dad8ce'; ctx.fillRect(0,0,1000,1280); ctx.strokeStyle = '#536773'; ctx.lineWidth = 2; ctx.strokeRect(30,30,940,1220);
   ctx.fillStyle = '#25343d'; ctx.font = '30px monospace'; ctx.fillText('GRAYBIRD',70,100); ctx.font = '18px monospace'; ctx.fillText('EARTH VISITOR PASSPORT',70,137);
   ctx.strokeStyle = '#849296'; ctx.beginPath(); ctx.moveTo(70,175); ctx.lineTo(930,175); ctx.stroke();
   ctx.fillStyle = '#62747b'; ctx.font = `20px ${font}`; ctx.fillText('VISITOR / 地球访客',70,236);
   ctx.fillStyle = '#25343d'; ctx.font = `bold 44px ${font}`; wrap(ctx,state.name || '路过的地球人',70,306,525,58);
   ctx.font = '22px monospace'; ctx.fillStyle = '#566d78'; ctx.fillText(state.id,70,454);
   ctx.drawImage(originalBird,660,210,270,270);
   ctx.fillStyle = '#62747b'; ctx.font = `20px ${font}`; ctx.fillText('探索记录 / '+Object.keys(state.stamps).length+' OF 6',70,541);
   Object.keys(stampInfo).forEach((key,i) => {
    const x = 70+(i%3)*290, y = 581+Math.floor(i/3)*224, earned = Boolean(state.stamps[key]);
    ctx.strokeStyle = earned ? '#4b7082' : '#9aabae'; ctx.lineWidth = earned ? 3 : 1;
    ctx.setLineDash(earned ? [] : [7,6]); ctx.strokeRect(x,y,260,196); ctx.setLineDash([]);
    ctx.fillStyle = earned ? '#395b6d' : '#8c9c9f'; ctx.textAlign = 'center'; ctx.font = '52px monospace'; ctx.fillText(stampInfo[key][1],x+130,y+70);
    ctx.font = `23px ${font}`; ctx.fillText(stampInfo[key][0],x+130,y+121);
    ctx.font = `16px ${font}`; ctx.fillText(earned ? state.stamps[key] : '等待探索',x+130,y+158); ctx.textAlign = 'left';
   });
   ctx.fillStyle = '#526b77'; ctx.font = `20px ${font}`; ctx.fillText('首次到访 · '+state.first.replace(/-/g,'.'),70,1098);
   ctx.font = `24px ${font}`; ctx.fillText('门没锁。下次再来。',70,1152); ctx.font = '22px monospace'; ctx.fillText('graybird.space/nest/',70,1206);
   const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png')); if (!blob) throw new Error('blob');
   if (imageURL) URL.revokeObjectURL(imageURL); imageURL = URL.createObjectURL(blob);
   const img = passport.querySelector('#passport-export-image'); img.src = imageURL; passport.querySelector('.passport-export').hidden = false;
   const link = document.createElement('a'); link.href = imageURL; link.download = 'Graybird-Passport-'+state.id+'.png'; document.body.appendChild(link); link.click(); link.remove();
   status.textContent = '护照生成好了。可下载，也可以长按下方图片保存。';
  } catch (_) { status.textContent = '这次没能生成图片。可以先截图保存护照，或稍后再试。'; }
  finally { button.disabled = false; }
 });
})();
