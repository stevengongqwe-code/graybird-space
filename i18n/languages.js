/* Additive locale pages only. Never redirect the original homepage. */
(() => {
 'use strict';
 const picker = document.querySelector('.language-picker');
 if (!picker) return;
 const links = [...picker.querySelectorAll('[data-language]')];
 const current = document.documentElement.lang;
 const key = 'graybird-home-language';
 let saved = null;
 try { saved = localStorage.getItem(key); } catch (_) { /* Storage is optional. */ }
 const preferred = saved || (navigator.languages || [navigator.language]).map(language => language.split('-')[0]).find(language => ['zh','en','ja'].includes(language));
 if (preferred && preferred !== current) {
  const recommendation = picker.querySelector('.language-recommendation');
  const target = links.find(link => link.dataset.language === preferred);
  if (target) {
   recommendation.hidden = false;
   recommendation.append(current === 'ja' ? 'おすすめ: ' : 'Suggested: ', target.cloneNode(true));
  }
 }
 picker.addEventListener('click', event => {
  const link = event.target.closest('[data-language]');
  if (link) { try { localStorage.setItem(key,link.dataset.language); } catch (_) {} }
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && picker.open) { picker.open=false; picker.querySelector('summary').focus(); }
 });
 document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open=false; });
})();
