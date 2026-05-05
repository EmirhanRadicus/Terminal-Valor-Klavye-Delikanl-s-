/* ============================================
   TOR BROWSER — Onion routing browser
   ============================================ */
const TorBrowserApp = (function () {
  const HOMEPAGE = 'karanlikpazar.onion';

  function open() {
    const contentHtml = `
      <div class="browser-container tor-theme">
        <div class="browser-header">
          <div class="browser-nav-btns">
            <button class="nav-btn disabled" id="tb-back">◀</button>
            <button class="nav-btn disabled" id="tb-forward">▶</button>
            <button class="nav-btn" id="tb-refresh">↻</button>
            <button class="nav-btn home-shortcut" data-url="${HOMEPAGE}">🏠</button>
          </div>
          <div class="browser-url-container">
            <span class="lock-icon tor-onion">🧅</span>
            <input type="text" class="browser-url-bar" id="tb-url" value="${HOMEPAGE}" readonly>
          </div>
        </div>
        
        <div class="browser-content" id="tb-content">
          <!-- Iframe or dynamic content goes here -->
          <iframe src="sites/karanlıkpazar/index.html" class="browser-iframe" id="tb-iframe"></iframe>
        </div>
      </div>
    `;

    WindowManager.open('tor', 'Tor Browser', '🧅', contentHtml, {
      width: 900,
      height: 600,
      onInit: function ($window) {
        $window.find('#tb-refresh').on('click', function() {
          const iframe = document.getElementById('tb-iframe');
          if (iframe) iframe.src = iframe.src;
        });
      },
      onClose: function () {
        // cleanup if needed
      }
    });
  }

  return {
    open,
  };
})();
