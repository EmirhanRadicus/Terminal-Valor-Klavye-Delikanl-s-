const TorBrowserApp = (function () {
  const HOMEPAGE = 'karanlikpazar.onion';
  const IFRAME_SRC = 'sites/karanl\u0131kpazar/index.html';
  function open() {
    const contentHtml = `
      <div class="browser-container tor-theme">
        <div class="browser-header">
          <div class="browser-nav-btns">
            <button class="nav-btn disabled" id="tb-back">◄</button>
            <button class="nav-btn disabled" id="tb-forward">►</button>
            <button class="nav-btn" id="tb-refresh">↻</button>
            <button class="nav-btn" id="tb-home" title="Ana Sayfa">⌂</button>
          </div>
          <div class="browser-url-container">
            <span class="lock-icon">🧅</span>
            <input type="text" class="browser-url-bar" id="tb-url" value="${HOMEPAGE}" readonly>
          </div>
        </div>
        <div class="browser-content" id="tb-content">
          <iframe src="${IFRAME_SRC}" class="browser-iframe" id="tb-iframe"></iframe>
        </div>
      </div>
    `;
    WindowManager.open('tor', 'Tor Browser', '🧅', contentHtml, {
      width: 960,
      height: 640,
      onInit: function ($window) {
        $window.find('#tb-refresh').on('click', function () {
          const iframe = document.getElementById('tb-iframe');
          if (iframe) { iframe.src = iframe.src; }
        });
        $window.find('#tb-home').on('click', function () {
          const iframe = document.getElementById('tb-iframe');
          if (iframe) { iframe.src = IFRAME_SRC; }
          $window.find('#tb-url').val(HOMEPAGE);
        });
      },
    });
  }
  return {
    open,
  };
})();
