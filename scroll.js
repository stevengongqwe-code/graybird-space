/* Scroll instruments enhance the existing terminal; all artwork and records remain. */
(() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const root = document.documentElement;
 let frameId = 0;
 let geometry = [], sectionTops = [], total = 1;
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
 }
 function schedule() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(update); }
 addEventListener('scroll', schedule, {passive: true});
 addEventListener('resize', measure, {passive: true});
 if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.querySelector('main'));

 function resume() {
  if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
  else schedule();
 }
 document.addEventListener('visibilitychange', resume);
 if (reduced.addEventListener) reduced.addEventListener('change', resume);
 else reduced.addListener(resume);
 if ('IntersectionObserver' in window) {
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
 measure();
})();
