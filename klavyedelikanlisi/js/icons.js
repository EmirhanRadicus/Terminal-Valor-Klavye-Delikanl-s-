const AppIcons = {
  start: `<svg viewBox="0 0 24 24" width="18" height="18" style="display:block;"><path fill="#ffffff" d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zm0 10.5H24v11.55l-13.2-1.95V12.45z"/></svg>`,
  terminal: `<svg viewBox="0 0 48 48" width="100%" height="100%"><rect width="40" height="32" x="4" y="8" rx="4" fill="url(#term-bg-grad)"/><path d="M10 17l5 3-5 3M17 23h9" stroke="#00ff88" stroke-width="3.5" stroke-linecap="round" fill="none"/><defs><linearGradient id="term-bg-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1e2f"/><stop offset="100%" stop-color="#0f0f15"/></linearGradient></defs></svg>`,
  browser: `<svg viewBox="0 0 48 48" width="100%" height="100%"><circle cx="24" cy="24" r="20" fill="url(#globe-bg)"/><path d="M24 4c5 0 9 9 9 20s-4 20-9 20-9-9-9-20 4-20 9-20z" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/><path d="M4 24h40M7 14h34M7 34h34" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/><defs><radialGradient id="globe-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#00c6ff"/><stop offset="100%" stop-color="#0072ff"/></radialGradient></defs></svg>`,
  notepad: `<svg viewBox="0 0 48 48" width="100%" height="100%"><rect width="32" height="40" x="8" y="4" rx="4" fill="url(#note-bg)"/><rect width="20" height="3" x="14" y="14" rx="1.5" fill="#a0a5b5"/><rect width="20" height="3" x="14" y="22" rx="1.5" fill="#a0a5b5"/><rect width="14" height="3" x="14" y="30" rx="1.5" fill="#a0a5b5"/><path d="M30 4h6l4 4v6" fill="none" stroke="#606575" stroke-width="2"/><defs><linearGradient id="note-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fdfdfd"/><stop offset="100%" stop-color="#e0e0e5"/></linearGradient></defs></svg>`,
  messenger: `<svg viewBox="0 0 48 48" width="100%" height="100%"><path d="M24 6C13 6 4 13.2 4 22c0 5 3 9.4 7.6 12.2l-1.8 6.2 6.8-3.4c2.3.7 4.8 1 7.4 1 11 0 20-7.2 20-16S35 6 24 6z" fill="url(#chat-bg)"/><circle cx="16" cy="22" r="2.5" fill="#fff"/><circle cx="24" cy="22" r="2.5" fill="#fff"/><circle cx="32" cy="22" r="2.5" fill="#fff"/><defs><linearGradient id="chat-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4e54c8"/><stop offset="100%" stop-color="#8f94fb"/></linearGradient></defs></svg>`,
  guide: `<svg viewBox="0 0 48 48" width="100%" height="100%"><rect width="30" height="38" x="9" y="5" rx="3" fill="url(#book-bg)"/><path d="M14 5v38M14 12h18M14 20h18M14 28h18" stroke="rgba(255,255,255,0.2)" stroke-width="3"/><path d="M24 16v16m-8-8h16" stroke="#00ff88" stroke-width="4" stroke-linecap="round" fill="none"/><defs><linearGradient id="book-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f4068"/><stop offset="100%" stop-color="#162447"/></linearGradient></defs></svg>`,
  tor: `<svg viewBox="0 0 48 48" width="100%" height="100%"><path d="M24 4C14 4 6 12 6 22c0 12 18 22 18 22s18-10 18-22C42 12 34 4 24 4zm0 6c8 0 14 6 14 12 0 8-14 16-14 16S10 30 10 22c0-6 6-12 14-12zm0 6c4 0 8 4 8 8 0 4-8 10-8 10s-8-6-8-8c0-4 4-8 8-8z" fill="url(#tor-bg)"/><defs><linearGradient id="tor-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7b2cbf"/><stop offset="100%" stop-color="#3c096c"/></linearGradient></defs></svg>`,
  skilltree: `<svg viewBox="0 0 48 48" width="20" height="20" style="display:block;"><path d="M24 4L12 18h8v16h8V18h8L24 4z" fill="url(#tree-bg)"/><circle cx="12" cy="18" r="4" fill="#00ff88"/><circle cx="36" cy="18" r="4" fill="#00ff88"/><circle cx="24" cy="4" r="4" fill="#00ff88"/><circle cx="20" cy="34" r="4" fill="#00ff88"/><circle cx="28" cy="34" r="4" fill="#00ff88"/><defs><linearGradient id="tree-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00b0ff"/><stop offset="100%" stop-color="#00e5ff"/></linearGradient></defs></svg>`,
  settings: `<svg viewBox="0 0 48 48" width="20" height="20" style="display:block;"><path d="M40 24a3 3 0 0 0-1.8-2.7l-1-.4a13 13 0 0 0-.8-2l.5-1A3 3 0 0 0 36 14l-2.8-2.8a3 3 0 0 0-4.2.1l-1 .7a13 13 0 0 0-2-.8l-.4-1A3 3 0 0 0 23 8h-4a3 3 0 0 0-2.7 1.8l-.4 1a13 13 0 0 0-2 .8l-1-.7a3 3 0 0 0-4.2-.1L6 14a3 3 0 0 0-.1 4.2l.7 1a13 13 0 0 0-.8 2l-1 .4A3 3 0 0 0 3 24v4a3 3 0 0 0 1.8 2.7l1 .4a13 13 0 0 0 .8 2l-.7 1a3 3 0 0 0 .1 4.2l2.8 2.8a3 3 0 0 0 4.2-.1l1-.7a13 13 0 0 0 2 .8l.4 1A3 3 0 0 0 21 40h4a3 3 0 0 0 2.7-1.8l.4-1a13 13 0 0 0 2-.8l1 .7a3 3 0 0 0 4.2.1l2.8-2.8a3 3 0 0 0 .1-4.2l-.7-1a13 13 0 0 0 .8-2l1-.4A3 3 0 0 0 41 28v-4z" fill="url(#gear-bg)"/><circle cx="22" cy="24" r="6" fill="#fff"/><defs><linearGradient id="gear-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#8a95a5"/><stop offset="100%" stop-color="#4a525d"/></linearGradient></defs></svg>`,
  missions: `<svg viewBox="0 0 48 48" width="20" height="20" style="display:block;"><rect width="28" height="36" x="10" y="8" rx="3" fill="#3b3b4f" stroke="#5a5a75" stroke-width="2"/><rect width="16" height="6" x="16" y="4" rx="2" fill="url(#clip-bg)"/><path d="M16 18h16M16 26h16M16 34h10" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round"/><defs><linearGradient id="clip-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9f43"/><stop offset="100%" stop-color="#ee5253"/></linearGradient></defs></svg>`,
  save: `<svg viewBox="0 0 48 48" width="20" height="20" style="display:block;"><path d="M6 6h30l6 6v30H6V6z" fill="#007acc"/><rect width="22" height="16" x="13" y="26" fill="#f0f0f5"/><rect width="18" height="10" x="15" y="6" fill="#2d2d30"/><rect width="4" height="6" x="27" y="8" fill="#007acc"/></svg>`,
  sleep: `<svg viewBox="0 0 48 48" width="20" height="20" style="display:block;"><path d="M24 4a2 2 0 0 1 2 2v14a2 2 0 0 1-4 0V6a2 2 0 0 1 2-2zm-9.2 4.8a2 2 0 0 1 .4 2.8 16 16 0 1 0 17.6 0 2 2 0 0 1 .4-2.8 2 2 0 0 1 2.8.4 20 20 0 1 1-24 0 2 2 0 0 1 2.8-.4z" fill="#ff4d4d"/></svg>`
};
function getAppIcon(appId) {
  return AppIcons[appId] || `📁`;
}
function _tryLoadIconPath(app, exts, idx, $container, small, svgFallback) {
  if (idx >= exts.length) {
    if (svgFallback) $container.html(getAppIcon(app));
    return;
  }
  const path = 'icons/' + app + '.' + exts[idx];
  const img = new Image();
  img.onload = function () {
    const cls = 'icon-custom-img' + (small ? ' icon-custom-small' : '');
    $container.html('<img src="' + path + '" class="' + cls + '" alt="' + app + '" draggable="false">');
  };
  img.onerror = function () {
    _tryLoadIconPath(app, exts, idx + 1, $container, small, svgFallback);
  };
  img.src = path;
}
function initPngIcons() {
  const EXTS = ['png', 'jpg', 'jpeg', 'webp'];
  $('.desktop-icon').each(function () {
    const app = $(this).data('app');
    if (!app) return;
    _tryLoadIconPath(app, EXTS, 0, $(this).find('.icon-img'), false, false);
  });
  $('.start-menu-item').each(function () {
    const app = $(this).data('app');
    if (!app) return;
    _tryLoadIconPath(app, EXTS, 0, $(this).find('.menu-icon'), true, false);
  });
}
