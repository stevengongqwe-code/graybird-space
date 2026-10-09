/* Fixed event names only: no nicknames, scores or saved progress are transmitted. */
(() => {
  const names = {
    'home-game-click': 'Homepage: enter game', 'home-about-click': 'Homepage: meet Graybird',
    'game-start': 'Game: new run', 'game-end': 'Game: run ended',
    'game-revive': 'Game: revive', 'score-card': 'Game: score card generated',
    'share-attempt': 'Game: share opened', 'share-success': 'Game: share completed',
    'share-copy': 'Game: challenge link copied'
  };
  const pending = [];
  function flush() {
    if (typeof window.goatcounter?.count !== 'function') return;
    while (pending.length) {
      const name = pending.shift();
      try { window.goatcounter.count({path: name, title: names[name], event: true, no_session: true}); } catch (_) {}
    }
  }
  window.graybirdTrack = name => {
    if (!Object.hasOwn(names, name)) return;
    if (pending.length < 20) pending.push(name);
    flush();
  };
  document.querySelector('script[data-goatcounter]')?.addEventListener('load', flush);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (['/', '/en/', '/ja/'].includes(location.pathname)) {
      if (url.pathname === '/play/' && url.hash === '#game') window.graybirdTrack('home-game-click');
      if (url.pathname === '/about/') window.graybirdTrack('home-about-click');
    }
  });
  flush();
})();
