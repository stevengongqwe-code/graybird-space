'use strict';
// Original website field notes. These are not fetched posts or live X data.
const observations = [
 {subject:'internet',label:'INTERNET',title:'大家都在说话。\n谁在听？',body:'在这里，发出声音很容易。难的是，一句话离开熟人的评论区之后，还有人愿意把它带走。',aside:'先记下来。再观察一会儿。'},
 {subject:'humans',label:'HUMANS',title:'人类会为一句话，\n想一整晚。',body:'我看见一个人反复打开聊天窗口。没有新消息。他又打开了一次。地球上有些等待，大概不能用时钟来量。',aside:'这条暂时没有结论。'},
 {subject:'ai',label:'ARTIFICIAL INTELLIGENCE',title:'答案越来越快。\n问题是谁的？',body:'人类把问题交给机器，再把机器的回答发给另一个人。我还在想：这中间，哪一步才是他自己的判断？',aside:'这只鸟也在使用工具。也得问自己。'},
 {subject:'life',label:'LIFE',title:'今天没发生大事。\n天还是暗下来了。',body:'有人认真记下了晚饭、路边的猫和一片云。没有什么道理要讲。我看了很久。',aside:'也许不用每一天都证明点什么。'},
 {subject:'technology',label:'TECHNOLOGY',title:'省下来的时间，\n去哪里了？',body:'这个设备替人类省了十分钟。人类用这十分钟，看了另一个能省时间的设备。观察到这里，我有点饿了。',aside:'工具很好。接下来做什么，还得自己决定。'},
 {subject:'curiosity',label:'CURIOSITY',title:'你说“本来就这样”。\n我还想问为什么。',body:'初来地球，有个好处：不懂的事可以直接问。待久了以后，会不会也开始不好意思？这件事得留意。',aside:'先保留这个问号。'}
];
// The V2 records stay intact. Every channel now contains a second field note.
observations.push(
 {subject:'internet',label:'INTERNET',title:'一个窗口关了。\n另一个还亮着。',body:'他们说要离开互联网。然后认真挑选一个平台，宣布这件事。也许出口也是这里的一部分。',aside:'离线不必先发通知。'},
 {subject:'humans',label:'HUMANS',title:'没有人知道。\n大家看起来都知道。',body:'我在一间很安静的房间里，看见每个人都等着别人先问。后来，问题和会议一起结束了。',aside:'问号有时候比答案勇敢。'},
 {subject:'ai',label:'ARTIFICIAL INTELLIGENCE',title:'它说“我理解”。\n你停顿了一下。',body:'机器的回复很完整。人类却把手机放下了。我还没分清：被回答，和被听见，是不是同一件事。',aside:'先把这个停顿留下。'},
 {subject:'life',label:'LIFE',title:'这片云，\n没有通知任何人。',body:'它慢慢经过楼顶。没有提醒，没有更新，也没有要求我看。我还是看了。',aside:'地球偶尔也很安静。'},
 {subject:'technology',label:'TECHNOLOGY',title:'连接越来越稳定。\n人却断开了。',body:'两个人坐在同一张桌子边。所有设备的信号都很好。只有他们之间，还没有建立连接。',aside:'距离不是全部的参数。'},
 {subject:'curiosity',label:'CURIOSITY',title:'地图已经画完。\n我想看背面。',body:'他们告诉我这里没有什么可看的。我往前走了几步，发现一只蚂蚁搬着比自己大的东西。',aside:'“没有什么”也值得再看一眼。'}
);

const $ = selector => document.querySelector(selector);
const buttons = [...document.querySelectorAll('[data-subject]')];
const terminal = $('.terminal');
const record = $('#record');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');
let current = 0;
let pending = 0;
let scanTimer = 0;
let scanGeneration = 0;
const unfiled = {subject:'unfiled',label:'UNFILED',title:'观测对象，\n正在观察我。',body:'我以为这条线路只通向地球。刚才另一端传来一个很轻的动作。现在，我们都不太确定谁是观察者。',aside:'这条记录暂时不归档。'};
let syncArtwork = () => {};

function renderRecord(index) {
 const note = index < 0 ? unfiled : observations[index];
 current = pending = index;
 buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.subject === note.subject)));
 $('#record-id').textContent = index < 0 ? 'OBSERVATION —' : `OBSERVATION ${String(index + 1).padStart(3, '0')}`;
 $('#record-subject').textContent = `SUBJECT: ${note.label}`;
 const title = $('#record-title');
 title.replaceChildren();
 note.title.split('\n').forEach((line, i) => { if (i) title.append(document.createElement('br')); title.append(document.createTextNode(line)); });
 $('#record-body').textContent = note.body;
 $('#record-aside').textContent = note.aside;
 const channel = observations.filter(item => item.subject === note.subject);
 const position = channel.indexOf(note) + 1;
 $('#record-count').textContent = index < 0 ? 'UNFILED / SIGNAL FOUND' : `${String(position).padStart(2, '0')} / ${String(channel.length).padStart(2, '0')} · ${note.subject.toUpperCase()}`;
 terminal.classList.remove('is-scanning');
 record.setAttribute('aria-busy', 'false');
 $('#request-status').textContent = 'SIGNAL READ / 已读取';
 syncArtwork(note.subject);
}

function selectRecord(index, updateUrl = true, scan = true) {
 if (index < -1 || index >= observations.length) return;
 clearTimeout(scanTimer);
 const generation = ++scanGeneration;
 pending = index;
 const note = index < 0 ? unfiled : observations[index];
 buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.subject === note.subject)));
 if (updateUrl) {
  const hash = index < 0 ? '#observation-unfiled' : `#observation-${String(index + 1).padStart(3, '0')}`;
  if (location.hash !== hash) history.pushState(null, '', hash);
 }
 $('#record-link').hidden = true;
 $('#share-record').textContent = '复制记录链接 ↗';
 if (!scan || motion.matches || document.hidden) { renderRecord(index); return; }
 terminal.classList.add('is-scanning');
 record.setAttribute('aria-busy', 'true');
 $('#request-status').textContent = 'READING SIGNAL / 读取中';
 scanTimer = setTimeout(() => { if (generation === scanGeneration) renderRecord(index); }, 140);
}

buttons.forEach(button => {
 button.setAttribute('aria-controls', 'record');
 button.addEventListener('click', () => selectRecord(observations.findIndex(note => note.subject === button.dataset.subject)));
 button.addEventListener('keydown', event => {
  const index = buttons.indexOf(button);
  let next;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = buttons.length - 1;
  if (next !== undefined) { event.preventDefault(); buttons[next].focus(); buttons[next].click(); }
 });
});
$('#next-record').addEventListener('click', () => {
 if (pending < 0) { selectRecord(0); return; }
 const channel = observations.map((note, index) => note.subject === observations[pending].subject ? index : -1).filter(index => index >= 0);
 selectRecord(channel[(channel.indexOf(pending) + 1) % channel.length]);
});

function readHash(scroll = true) {
 const hash = location.hash;
 let index = observations.findIndex((note, i) => hash === `#observation-${String(i + 1).padStart(3, '0')}`);
 if (index < 0) index = observations.findIndex(note => hash === `#observation-${note.subject}`);
 if (hash === '#observation-unfiled') index = -1;
 else if (index < 0) return;
 selectRecord(index, false, false);
 if (scroll) $('#terminal').scrollIntoView({behavior: 'instant'});
}
window.addEventListener('hashchange', () => readHash());
window.addEventListener('popstate', () => readHash());
$('#share-record').hidden = false;
$('#share-record').addEventListener('click', async () => {
 const hash = current < 0 ? '#observation-unfiled' : `#observation-${String(current + 1).padStart(3, '0')}`;
 const url = new URL(hash, location.href).href;
 try {
  if (!navigator.clipboard) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(url);
  $('#share-record').textContent = '链接已复制';
 } catch {
  const input = $('#record-link'); input.hidden = false; input.value = url; input.focus(); input.select();
  $('#share-record').textContent = '选中链接后复制';
 }
});
readHash();

const whispers = [
 '他们给所有东西充电。除了自己。',
 '这里的夜晚很亮。有些人却说，什么也看不清。',
 '一个人说自己没空，然后向屏幕解释了很久。',
 '机器学会了回答。人类还在练习提问。',
 '今天没有新发现。月亮还是很安静。',
 '他们把沉默也做成了一个按钮。'
];
let contactCount = 0;
let previousWhisper = -1;
let reactionTimer = 0;
const hero = $('.hero');
const portrait = $('.portrait-contact');
function contactBird(source) {
 contactCount++;
 let index = Math.floor(Math.random() * whispers.length);
 if (index === previousWhisper) index = (index + 1) % whispers.length;
 previousWhisper = index;
 let line = whispers[index];
 if (contactCount >= 4 && contactCount < 8) line = '嗯。我看见你了。可以不用反复确认。';
 if (contactCount >= 8) line = '这边也有一只需要安静的鸟。';
 const output = source === 'portrait' ? $('#portrait-message') : $('#bird-message');
 output.textContent = line;
 hero.classList.add('is-observed'); portrait.classList.add('is-observed');
 clearTimeout(reactionTimer);
 reactionTimer = setTimeout(() => { hero.classList.remove('is-observed'); portrait.classList.remove('is-observed'); }, 600);
 if (contactCount === 11) { selectRecord(-1); $('#terminal').scrollIntoView({behavior: motion.matches ? 'instant' : 'smooth'}); }
}
$('#scene-bird').addEventListener('click', () => contactBird('scene'));
portrait.disabled = false;
portrait.addEventListener('click', () => contactBird('portrait'));
$('#bird-note').addEventListener('click', () => {
 const line = $('#aside-message'); line.textContent = line.textContent.trim() ? '' : '线路还在。你也还在。';
});

function updateClock() { $('#clock').textContent = `EARTH TIME / ${new Date().toISOString().slice(11, 16)} UTC`; }
let clockTimer = 0;
function resumeClock() { clearInterval(clockTimer); if (!document.hidden) { updateClock(); clockTimer = setInterval(updateClock, 60000); } }
resumeClock();

// One scheduled frame per input event, no continuous JS animation loop.
let frame = 0;
let heroVisible = true;
let px = 0;
let py = 0;
let heroTop = 0;
let heroHeight = 1;
let scrolling = 0;
const picture = $('.hero-art');
const sceneImage = picture.querySelector('img');
let layers = [];
function scheduleScene() {
 if (heroVisible && !frame && !document.hidden && !motion.matches) frame = requestAnimationFrame(drawScene);
}
function drawScene() {
 frame = 0;
 if (!heroVisible || motion.matches || document.hidden) return;
 const progress = Math.max(0, Math.min(1, (scrollY - heroTop) / heroHeight));
 const strength = coarse.matches ? 0.45 : 1;
 hero.style.setProperty('--camera-x', `${px * 5 * strength}px`);
 hero.style.setProperty('--camera-y', `${py * 3 * strength + progress * 24 * strength}px`);
 hero.style.setProperty('--camera-scale', String(1 + progress * (coarse.matches ? 0.012 : 0.035)));
 hero.style.setProperty('--star-x', `${px * -8 * strength}px`);
 hero.style.setProperty('--star-y', `${py * -5 * strength + progress * -18 * strength}px`);
 hero.style.setProperty('--bird-x', `${px * 3 * strength}px`);
 hero.style.setProperty('--bird-y', `${py * 2 * strength}px`);
 hero.style.setProperty('--title-y', `${progress * -65}px`);
 hero.style.setProperty('--title-opacity', String(Math.max(0, 1 - progress * 1.8)));
}

function measureScene() {
 const box = hero.getBoundingClientRect();
 heroTop = box.top + scrollY; heroHeight = box.height;
 const mobile = matchMedia('(max-width:600px)').matches;
 const iw = mobile ? 960 : 1536; const ih = mobile ? 720 : 576;
 const scale = Math.max(box.width / iw, box.height / ih);
 const posX = mobile ? 0.2 : 0.5;
 const posY = mobile ? 1 : box.width >= 1800 ? 0.62 : 0.65;
 const ox = (box.width - iw * scale) * posX; const oy = (box.height - ih * scale) * posY;
 const bird = mobile ? [130, 340, 220, 270] : [400, 260, 190, 220];
 const x = bird[0] * scale + ox; const y = bird[1] * scale + oy;
 const target = $('#scene-bird');
 const width = Math.max(44, Math.min(bird[2] * scale, box.width - Math.max(8, x) - 8));
 target.style.left = `${Math.max(8, x)}px`; target.style.top = `${Math.max(8, y)}px`;
 target.style.width = `${width}px`; target.style.height = `${Math.max(44, bird[3] * scale)}px`;
 target.hidden = false;
 hero.style.setProperty('--bird-center-x', `${x + bird[2] * scale / 2}px`);
 hero.style.setProperty('--bird-center-y', `${y + bird[3] * scale / 2}px`);
 hero.style.setProperty('--bird-radius-x', `${bird[2] * scale * 0.65}px`);
 hero.style.setProperty('--bird-radius-y', `${bird[3] * scale * 0.65}px`);
 scheduleScene();
}
if (CSS.supports('mask-image', 'radial-gradient(black, transparent)')) {
 for (const name of ['bird', 'foreground']) {
  const clone = picture.cloneNode(true); clone.className = `scene-layer scene-${name}`;
  clone.setAttribute('aria-hidden', 'true'); clone.querySelector('img').alt = '';
  clone.querySelector('img').removeAttribute('fetchpriority'); hero.prepend(clone); layers.push(clone);
 }
}
sceneImage.addEventListener('load', measureScene);
measureScene();
document.documentElement.classList.add('system-connected');
hero.addEventListener('pointermove', event => {
 if (motion.matches || !heroVisible) return;
 if (event.pointerType === 'touch') return;
 const box = hero.getBoundingClientRect();
 px = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
 py = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1)); scheduleScene();
});
hero.addEventListener('pointerleave', () => { px = py = 0; scheduleScene(); });
hero.addEventListener('touchstart', event => {
 if (motion.matches) return;
 px = (event.touches[0].clientX / innerWidth - 0.5) * 0.6; scheduleScene();
}, {passive: true});
hero.addEventListener('touchend', () => { px = py = 0; scheduleScene(); }, {passive: true});
window.addEventListener('scroll', () => { scheduleScene(); }, {passive: true});
window.addEventListener('resize', () => { cancelAnimationFrame(scrolling); scrolling = requestAnimationFrame(measureScene); }, {passive: true});

const sections = [...document.querySelectorAll('main > section')];
const phases = ['01 / ARRIVAL', '02 / OBSERVATION', '03 / DATABASE', '04 / TRANSMISSION', '05 / PROJECT'];
const distances = ['SURFACE LINK / 月面信号', 'OBSERVER G–01 / 观察者在线', 'ARCHIVE ACCESS / 数据库接入', 'OPEN CHANNEL / 地球来信', 'HORIZON UNKNOWN / 远方未定'];
let sectionFrame = 0;
let lastPhase = -1;
function updatePhase() {
 sectionFrame = 0;
 let index = 0;
 sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= innerHeight * 0.5) index = i; });
 if (index === lastPhase) return;
 lastPhase = index;
 $('#system-phase').textContent = phases[index]; $('#system-distance').textContent = distances[index];
 document.body.dataset.phase = String(index + 1);
 document.documentElement.style.setProperty('--system-progress', String((index + 1) / sections.length));
}
window.addEventListener('scroll', () => {
 if (!sectionFrame && !document.hidden) sectionFrame = requestAnimationFrame(updatePhase);
}, {passive: true});
updatePhase();
if ('IntersectionObserver' in window) {
 const sceneObserver = new IntersectionObserver(entries => {
  heroVisible = entries[0].isIntersecting;
  hero.classList.toggle('scene-active', heroVisible && !document.hidden && !motion.matches);
  if (heroVisible) scheduleScene();
 }, {threshold: 0});
 sceneObserver.observe(hero);
 const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('is-entered'); revealObserver.unobserve(entry.target); }
  });
 }, {threshold: 0.06});
 sections.slice(1).forEach(section => { section.classList.add('system-depth'); revealObserver.observe(section); });
} else hero.classList.add('scene-active');

function pauseOrResume() {
 document.documentElement.classList.toggle('system-paused', document.hidden);
 hero.classList.toggle('scene-active', heroVisible && !document.hidden && !motion.matches);
 resumeClock();
 if (document.hidden || motion.matches) {
  cancelAnimationFrame(frame); frame = 0;
  cancelAnimationFrame(sectionFrame); sectionFrame = 0;
  clearTimeout(scanTimer); if (record.getAttribute('aria-busy') === 'true') renderRecord(pending);
 } else { scheduleScene(); updatePhase(); }
 if (motion.matches) {
  ['--camera-x', '--camera-y', '--camera-scale', '--star-x', '--star-y', '--bird-x', '--bird-y', '--title-y', '--title-opacity'].forEach(name => hero.style.removeProperty(name));
 }
}
document.addEventListener('visibilitychange', pauseOrResume);
if (motion.addEventListener) motion.addEventListener('change', pauseOrResume);
else if (motion.addListener) motion.addListener(pauseOrResume);

// The supplied artwork is kept byte-for-byte, below the fold and lazy loaded.
const archive = $('#visual-archive');
const artFrames = [...archive.querySelectorAll('.archive-frame')];
const artButtons = [...archive.querySelectorAll('[data-art-index]')];
const artDialog = $('#art-dialog');
let activeArt = 0;
let scrollArchiveMode = false;
function showArtwork(index) {
 activeArt = (index + artFrames.length) % artFrames.length;
 artFrames.forEach((figure, i) => { figure.hidden = !scrollArchiveMode && i !== activeArt; figure.classList.toggle('is-current', i === activeArt); });
 artButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === activeArt)));
 if (!scrollArchiveMode) $('#art-count').textContent = `${String(activeArt + 1).padStart(2, '0')} / ${String(artFrames.length).padStart(2, '0')}`;
}
function chooseArtwork(index) {
 showArtwork(index);
 if (scrollArchiveMode) artFrames[activeArt].scrollIntoView({block: 'center', behavior: motion.matches ? 'instant' : 'smooth'});
 const subject = artFrames[activeArt].dataset.artSubject;
 if (pending < 0 || observations[pending].subject !== subject) {
  selectRecord(observations.findIndex(note => note.subject === subject), true, false);
  showArtwork(index);
 }
}
artButtons.forEach((button, index) => {
 button.addEventListener('click', () => chooseArtwork(index));
 button.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % artButtons.length;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + artButtons.length - 1) % artButtons.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = artButtons.length - 1;
  if (next !== undefined) { event.preventDefault(); artButtons[next].focus(); chooseArtwork(next); }
 });
});
$('#previous-art').addEventListener('click', () => chooseArtwork(activeArt - 1));
$('#next-art').addEventListener('click', () => chooseArtwork(activeArt + 1));
syncArtwork = subject => {
 const mapped = subject === 'technology' ? 'internet' : subject;
 const index = artFrames.findIndex(figure => figure.dataset.artSubject === mapped);
 if (index >= 0) showArtwork(index);
};
archive.classList.add('is-interactive');
archive.querySelector('.archive-index').hidden = false;
archive.querySelector('.archive-controls').hidden = false;
showArtwork(0);
syncArtwork(current < 0 ? 'unfiled' : observations[current].subject);

artFrames.forEach(figure => {
 const link = figure.querySelector('.archive-image');
 if (typeof artDialog.showModal !== 'function') return; // Keep the original link fallback.
 link.setAttribute('aria-haspopup', 'dialog');
 link.setAttribute('aria-label', `查看${figure.querySelector('h4').textContent}完整画面`);
 link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const image = figure.querySelector('img');
  $('#art-dialog-image').src = image.getAttribute('src');
  $('#art-dialog-image').alt = image.alt;
  $('#art-dialog-image').width = image.width;
  $('#art-dialog-image').height = image.height;
  $('#art-dialog-title').textContent = figure.querySelector('.archive-coordinate').textContent;
  $('#art-dialog-note').textContent = figure.querySelector('h4').textContent;
  artDialog.showModal();
  document.body.classList.add('art-open');
 });
});
$('#close-art').addEventListener('click', () => artDialog.close());
artDialog.addEventListener('close', () => document.body.classList.remove('art-open'));
artDialog.addEventListener('click', event => {
 if (event.target !== artDialog) return;
 const box = artDialog.getBoundingClientRect();
 if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) artDialog.close();
});

// Small pointer feedback; existing text, events and scene transforms stay intact.
(() => {
 const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
 const targets = [...document.querySelectorAll('.portrait-contact,.enter')];
 let queued = 0, current = null, x = 0, y = 0;
 function reset() {
  cancelAnimationFrame(queued); queued = 0;
  targets.forEach(el => { el.style.removeProperty('--magnet-x'); el.style.removeProperty('--magnet-y'); });
  current = null;
 }
 targets.forEach(el => {
  el.addEventListener('pointermove', event => {
   if (motion.matches || !finePointer.matches || document.hidden || event.pointerType === 'touch') return;
   const box = el.getBoundingClientRect();
   current = el;
   x = Math.max(-4, Math.min(4, (event.clientX - box.left - box.width / 2) * .035));
   y = Math.max(-3, Math.min(3, (event.clientY - box.top - box.height / 2) * .035));
   if (!queued) queued = requestAnimationFrame(() => {
    queued = 0;
    if (!current) return;
    current.style.setProperty('--magnet-x', `${x}px`);
    current.style.setProperty('--magnet-y', `${y}px`);
   });
  }, {passive:true});
  el.addEventListener('pointerleave', reset);
  el.addEventListener('blur', reset);
 });
 document.addEventListener('visibilitychange', reset);
 motion.addEventListener('change', reset);
 finePointer.addEventListener('change', reset);
})();
