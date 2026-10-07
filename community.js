/* Static content is readable without JavaScript; enhancement only filters records. */
(() => {
 'use strict';
 const scope = document.querySelector('[data-filter-scope]');
 if (!scope) return;
 const mode = scope.dataset.filterScope;
 const bar = scope.querySelector('.community-filters');
 const buttons = [...bar.querySelectorAll('[data-filter]')];
 const valid = buttons.map(button => button.dataset.filter);
 const cards = [...scope.querySelectorAll('.topic-card')];
 const groups = [...scope.querySelectorAll('[data-filter-group]')];
 const summary = scope.querySelector('.filter-summary');
 function select(value, updateURL = false) {
  if (!valid.includes(value)) value = 'all';
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
  if (mode === 'room') groups.forEach(group => { group.hidden = value !== 'all' && group.dataset.filterGroup !== value; });
  else cards.forEach(card => { card.hidden = value !== 'all' && card.dataset.kind !== value; });
  const count = cards.filter(card => value === 'all' || card.dataset[mode] === value).length;
  if (summary) summary.textContent = `${count} 条记录 / ${buttons.find(button => button.dataset.filter === value).textContent}`;
  if (updateURL) {
   const hash = value === 'all' ? '' : mode === 'room' ? `#room-${value}` : `#${value}`;
   history.pushState(null, '', `${location.pathname}${location.search}${hash}`);
  }
 }
 function readHash() {
  const value = location.hash.slice(1).replace(mode === 'room' ? /^room-/ : /^$/, '');
  select(value || 'all');
 }
 buttons.forEach((button, i) => {
  button.addEventListener('click', () => select(button.dataset.filter, true));
  button.addEventListener('keydown', event => {
   let next;
   if (event.key === 'ArrowRight') next = (i + 1) % buttons.length;
   if (event.key === 'ArrowLeft') next = (i + buttons.length - 1) % buttons.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = buttons.length - 1;
   if (next !== undefined) { event.preventDefault(); buttons[next].focus(); buttons[next].click(); }
  });
 });
 document.querySelectorAll('[data-room-link]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  select(link.dataset.roomLink, true);
  document.getElementById(`room-${link.dataset.roomLink}`).scrollIntoView({block:'start'});
 }));
 addEventListener('popstate', readHash);
 addEventListener('hashchange', readHash);
 readHash();
 bar.hidden = false;
})();
