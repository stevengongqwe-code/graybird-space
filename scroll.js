/* Scroll instruments enhance the existing terminal; all artwork and records remain. */
(() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const mobile = matchMedia('(max-width: 600px)');
 const root = document.documentElement;
 const globe = document.querySelector('#earth-globe');
 const shell = globe.parentElement;
 const context = globe.getContext('2d');
 let frameId = 0, spinId = 0, visible = true, rotation = 0.3, lastDraw = 0;
 let lastScroll = scrollY, lastTime = performance.now(), boost = 0, dragX = null;
 let geometry = [], sectionTops = [], total = 1, heroSize = 1;
 const count = document.querySelector('#art-count');
 scrollArchiveMode = true;
 archive.classList.add('is-scroll-story');
 showArtwork(activeArt);
 count.replaceChildren();
 const digits = document.createElement('span');
 digits.textContent = '05'; count.append(digits, ' RECORDS');
 // Avoid live-region announcements on each animation frame.
 count.removeAttribute('aria-live'); count.setAttribute('aria-label', '05 RECORDS');
 digits.setAttribute('aria-hidden', 'true');
 function measure() {
  geometry = artFrames.map(el => { const box = el.getBoundingClientRect(); return {top: box.top + scrollY, height: box.height}; });
  sectionTops = sections.map(el => el.getBoundingClientRect().top + scrollY);
  total = Math.max(1, root.scrollHeight - innerHeight);
  heroSize = hero.offsetHeight;
  schedule();
 }
 function update() {
  frameId = 0;
  const y = scrollY, center = y + innerHeight * .5;
  root.style.setProperty('--page-progress', String(Math.min(1, Math.max(0, y / total))));
  let phase = 0;
  sectionTops.forEach((top, i) => { if (top <= center) phase = i; });
  document.querySelector('#section-position').textContent = `${String(phase + 1).padStart(2, '0')} / 05`;
  let closest = 0, distance = Infinity;
  geometry.forEach((box, i) => {
   const delta = box.top + box.height / 2 - center;
   if (Math.abs(delta) < distance) { distance = Math.abs(delta); closest = i; }
   const image = artFrames[i].querySelector('img');
   image.style.setProperty('--image-drift', reduced.matches ? '0px' : `${Math.max(-10, Math.min(10, delta * -.022))}px`);
  });
  if (geometry.length && center >= geometry[0].top && center <= geometry.at(-1).top + geometry.at(-1).height) { if (closest !== activeArt) showArtwork(closest); }
  shell.style.setProperty('--earth-drift', reduced.matches ? '0px' : `${Math.min(heroSize, y) * -.10}px`);
 }
 function schedule() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(update); }
 addEventListener('scroll', () => {
  const now = performance.now();
  boost = Math.min(1.8, Math.abs(scrollY - lastScroll) / Math.max(16, now - lastTime));
  lastScroll = scrollY; lastTime = now; schedule();
 }, {passive: true});
 addEventListener('resize', measure, {passive: true});
 if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.querySelector('main'));

 // Coarse geographic silhouettes, precomputed once. No texture, network request or WebGL.
 const polygons = [
  [[-168,70],[-130,72],[-105,55],[-60,48],[-82,20],[-100,15],[-120,35]],
  [[-82,12],[-50,5],[-35,-10],[-65,-55],[-75,-25]],
  [[-17,36],[35,32],[51,12],[35,-35],[17,-35],[-12,5]],
  [[-12,36],[-8,60],[35,72],[170,60],[145,35],[110,0],[75,8],[50,35]],
  [[112,-12],[150,-10],[155,-40],[115,-35]],
  [[-52,60],[-20,70],[-40,83],[-65,75]]
 ];
 function land(lon, lat) {
  return polygons.some(p => {
   let inside = false;
   for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [x,y] = p[i], [xx,yy] = p[j];
    if ((y > lat) !== (yy > lat) && lon < (xx-x)*(lat-y)/(yy-y)+x) inside = !inside;
   }
   return inside;
  });
 }
 const points = [];
 for (let lat = -78; lat <= 78; lat += 6) {
  const step = 6 / Math.max(.25, Math.cos(lat * Math.PI / 180));
  for (let lon = -180; lon < 180; lon += step) {
   const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
   points.push([Math.cos(a)*Math.sin(b), -Math.sin(a), Math.cos(a)*Math.cos(b), land(lon,lat)]);
  }
 }
 function paint() {
  if (!context) return;
  const size = 420, c = size / 2, radius = 171;
  context.clearRect(0,0,size,size);
  const light = context.createRadialGradient(160,140,8,c,c,radius);
  light.addColorStop(0,'#172a36'); light.addColorStop(.7,'#0a131b'); light.addColorStop(1,'#04080c');
  context.fillStyle = light; context.beginPath(); context.arc(c,c,radius,0,Math.PI*2); context.fill();
  const sin = Math.sin(rotation), cos = Math.cos(rotation);
  for (const [x,y,z,isLand] of points) {
   const xx = x*cos+z*sin, zz = z*cos-x*sin;
   if (zz <= 0) continue;
   context.globalAlpha = (.18 + zz*.65) * (isLand ? 1 : .4);
   context.fillStyle = isLand ? '#b8ccd4' : '#527889';
   context.beginPath(); context.arc(c+xx*radius,c+y*radius,isLand ? 1.5 : .85,0,Math.PI*2); context.fill();
  }
  context.globalAlpha = 1;
 }
 function spin(time) {
  spinId = 0;
  if (!visible || reduced.matches || document.hidden || !context) return;
  const elapsed = Math.min(100, time - lastDraw);
  if (elapsed >= (mobile.matches ? 50 : 33)) {
   rotation += elapsed * (.000035 + boost * .00011);
   boost *= .87; lastDraw = time; paint();
  }
  spinId = requestAnimationFrame(spin);
 }
 function resume() {
  cancelAnimationFrame(spinId); spinId = 0; lastDraw = performance.now();
  if (reduced.matches) { boost = 0; paint(); update(); }
  else if (!document.hidden && visible && context) spinId = requestAnimationFrame(spin);
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
  else schedule();
 }
 globe.addEventListener('pointerdown', event => { if (!reduced.matches) dragX = event.clientX; });
 globe.addEventListener('pointermove', event => {
  if (dragX === null || reduced.matches) return;
  rotation += (event.clientX - dragX) * .008; dragX = event.clientX; paint();
 });
 for (const name of ['pointerup','pointercancel','pointerleave']) globe.addEventListener(name, () => { dragX = null; });
 globe.addEventListener('keydown', event => {
  if (!['ArrowLeft','ArrowRight'].includes(event.key) || reduced.matches) return;
  event.preventDefault(); rotation += event.key === 'ArrowRight' ? .15 : -.15; paint();
 });
 document.addEventListener('visibilitychange', resume);
 if (reduced.addEventListener) reduced.addEventListener('change', resume);
 else reduced.addListener(resume);
 if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }).observe(hero);
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('has-arrived'); reveal.unobserve(entry.target); }
  }), {threshold: .12});
  document.querySelectorAll('.section-kicker,.bird-copy h2,.dossier > *, .future-list > *, .archive-heading').forEach((el,i) => {
   el.classList.add('scroll-reveal'); el.style.setProperty('--reveal-delay', `${i % 4 * 60}ms`); reveal.observe(el);
  });
  const typing = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('terminal-typing'); typing.unobserve(entry.target); }
  }));
  document.querySelectorAll('.terminal-bar > span:first-child,.channel-label').forEach(el => typing.observe(el));
  let counted = false;
  const counter = new IntersectionObserver(entries => {
   if (!entries[0].isIntersecting || counted) return;
   counted = true; counter.disconnect();
   if (reduced.matches) return;
   const start = performance.now();
   function tick(now) {
    const progress = Math.min(1,(now-start)/600);
    digits.textContent = String(document.hidden || reduced.matches ? 5 : Math.round(progress*5)).padStart(2,'0');
    if (progress < 1 && !document.hidden && !reduced.matches) requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  }); counter.observe(count);
 }
 paint(); measure(); resume();
})();
