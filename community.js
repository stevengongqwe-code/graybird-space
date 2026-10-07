/* Search and filters enhance static records; no API, account or comment database. */
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
 const search = scope.querySelector('.record-search');
 const input = search.querySelector('input');
 const empty = scope.querySelector('.search-empty');
 const corpus = new Map(cards.map(card => [card, (card.querySelector('h3').textContent + ' ' + card.querySelector('.topic-content>p').textContent).normalize('NFKC').toLocaleLowerCase()]));
 let current = 'all', timer = 0;
 function select(value, updateURL = false, replaceURL = false) {
  if (!valid.includes(value)) value = 'all';
  current = value;
  const query = input.value.trim().normalize('NFKC').toLocaleLowerCase();
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
  let count = 0;
  cards.forEach(card => {
   card.hidden = (value !== 'all' && card.dataset[mode] !== value) || !corpus.get(card).includes(query);
   if (!card.hidden) count++;
  });
  groups.forEach(group => {
   const matchesCategory = value === 'all' || group.dataset.filterGroup === value;
   group.hidden = !matchesCategory || (Boolean(query) && !group.querySelector('.topic-card:not([hidden])'));
  });
  const label = buttons.find(button => button.dataset.filter === value).textContent;
  summary.textContent = `${count} 条记录 / ${label}${query ? ' / 搜索：' + input.value.trim() : ''}`;
  const existingRoomEmpty = !query && mode === 'room' && groups.some(group => !group.hidden && group.querySelector('.community-empty'));
  empty.hidden = count > 0 || existingRoomEmpty;
  if (updateURL) {
   const url = new URL(location.href);
   url.hash = value === 'all' ? '' : mode === 'room' ? `room-${value}` : value;
   if (query) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
   history[replaceURL ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash);
  }
 }
 function readURL() {
  clearTimeout(timer);
  input.value = (new URL(location.href).searchParams.get('q') || '').slice(0,80);
  const value = location.hash.slice(1).replace(mode === 'room' ? /^room-/ : /^$/, '');
  select(value || 'all');
 }
 buttons.forEach((button, i) => {
  button.addEventListener('click', () => { clearTimeout(timer); select(button.dataset.filter, true); });
  button.addEventListener('keydown', event => {
   let next;
   if (event.key === 'ArrowRight') next = (i + 1) % buttons.length;
   if (event.key === 'ArrowLeft') next = (i + buttons.length - 1) % buttons.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = buttons.length - 1;
   if (next !== undefined) { event.preventDefault(); buttons[next].focus(); buttons[next].click(); }
  });
 });
 function searchInput() { clearTimeout(timer); timer = setTimeout(() => select(current, true, true), 120); }
 input.addEventListener('input', event => { if (!event.isComposing) searchInput(); });
 input.addEventListener('compositionend', searchInput);
 search.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); select(current, true, true); });
 search.querySelector('[data-clear-search]').addEventListener('click', () => {
  clearTimeout(timer); input.value = ''; select(current, true, true); input.focus();
 });
 empty.querySelector('[data-reset-results]').addEventListener('click', () => {
  clearTimeout(timer); input.value = ''; select('all', true); input.focus();
 });
 document.querySelectorAll('[data-room-link]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); clearTimeout(timer); input.value = '';
  select(link.dataset.roomLink, true);
  document.getElementById(`room-${link.dataset.roomLink}`).scrollIntoView({block:'start'});
 }));
 addEventListener('popstate', readURL);
 addEventListener('hashchange', readURL);
 readURL();
 bar.hidden = false; search.hidden = false;
})();
