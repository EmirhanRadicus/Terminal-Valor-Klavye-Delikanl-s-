/* ============================================
   BROWSER APP — In-game web browser
   ============================================ */
const BrowserApp = (function () {
  const SITE_REGISTRY = {
    'hedefbank.com.tr': { dir: 'sites/hedefbank/', title: 'HedefBank', icon: '🏦' },
    'megacorp.net': { dir: 'sites/megacorp/', title: 'MegaCorp', icon: '🏢' },
    'karanlikpazar.onion': { dir: 'sites/karanlıkpazar/', title: 'Karanlık Pazar', icon: '🧅' },
    'globalnews.com.tr': { dir: 'sites/globalnews/', title: 'Global News TR', icon: '🗞️' },
    'teknoshop.com.tr': { dir: 'sites/teknoshop/', title: 'TeknoShop', icon: '🛒' },
    'kriptoborsa.net': { dir: 'sites/kriptoborsa/', title: 'KriptoBorsa', icon: '📈' },
    'devletkapisi.gov.tr': { dir: 'sites/devletkapisi/', title: 'Devlet Kapısı', icon: '🏛️' },
    'sirket-vpn.com': { dir: 'sites/sirketvpn/', title: 'Şirket VPN', icon: '🛡️' },
  };

  let _history = [];
  let _historyIndex = -1;
  let _currentUrl = '';

  function open() {
    const contentHtml = `
      <div class="browser-app-container">
        <div class="browser-toolbar">
          <button class="browser-nav-btn btn-back disabled" id="browser-back" title="Geri">◄</button>
          <button class="browser-nav-btn btn-forward disabled" id="browser-forward" title="İleri">►</button>
          <button class="browser-nav-btn btn-refresh" id="browser-refresh" title="Yenile">↻</button>
          <input type="text" class="browser-url-bar" id="browser-url" 
                 placeholder="Adres girin... (ör: hedefbank.com.tr)" 
                 autocomplete="off" spellcheck="false">
        </div>
        <div class="browser-bookmarks">
          <div class="bookmark-item" data-url="hedefbank.com.tr">
            <span class="bm-icon">🏦</span> HedefBank
          </div>
          <div class="bookmark-item" data-url="megacorp.net">
            <span class="bm-icon">🏢</span> MegaCorp
          </div>
          <div class="bookmark-item" data-url="karanlikpazar.onion">
            <span class="bm-icon">🧅</span> Karanlık Pazar
          </div>
        </div>
        <div class="browser-loading-bar" id="browser-loading"></div>
        <div class="browser-viewport" id="browser-viewport">
          <div class="browser-home">
            <div class="home-title glitch-text" data-text="SHADOW NET">SHADOW NET</div>
            <input type="text" class="home-search" id="browser-home-search" 
                   placeholder="Hedef ara..." autocomplete="off">
            <div class="home-shortcuts">
              <div class="home-shortcut" data-url="hedefbank.com.tr">
                <span class="sc-icon">🏦</span>
                <span class="sc-label">HedefBank</span>
              </div>
              <div class="home-shortcut" data-url="megacorp.net">
                <span class="sc-icon">🏢</span>
                <span class="sc-label">MegaCorp</span>
              </div>
              <div class="home-shortcut" data-url="karanlikpazar.onion">
                <span class="sc-icon">🧅</span>
                <span class="sc-label">Karanlık Pazar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    WindowManager.open('browser', 'Tarayıcı', '🌐', contentHtml, {
      width: 900,
      height: 600,
      onInit: bindEvents,
    });
  }

  function bindEvents($window) {
    // URL bar
    $window.find('#browser-url').on('keydown', function (e) {
      if (e.key === 'Enter') {
        const url = $(this).val().trim();
        if (url) navigate(url);
      }
    });

    // Navigation buttons
    $window.find('#browser-back').on('click', goBack);
    $window.find('#browser-forward').on('click', goForward);
    $window.find('#browser-refresh').on('click', refresh);

    // Bookmarks
    $window.find('.bookmark-item').on('click', function () {
      navigate($(this).data('url'));
    });

    // Home shortcuts
    $window.find('.home-shortcut').on('click', function () {
      navigate($(this).data('url'));
    });

    // Home search
    $window.find('#browser-home-search').on('keydown', function (e) {
      if (e.key === 'Enter') {
        const url = $(this).val().trim();
        if (url) navigate(url);
      }
    });
  }

  function navigate(url) {
    // Clean URL
    url = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // IDS Trap: Dark Forum on Standard Browser
    if (url.includes('karanlikpazar.onion')) {
      WindowManager.close('browser');
      if (typeof IdsTrap !== 'undefined') {
        IdsTrap.trigger();
      }
      return;
    }

    // Find matching site
    const domain = Object.keys(SITE_REGISTRY).find(function (d) {
      return url.startsWith(d);
    });

    if (!domain) {
      showError(url);
      return;
    }

    const site = SITE_REGISTRY[domain];
    const subPath = url.replace(domain, '').replace(/^\//, '') || 'index.html';
    const fullPath = site.dir + (subPath.includes('.html') ? subPath : subPath + '/index.html');

    // Update URL bar
    $('#browser-url').val(url);
    _currentUrl = url;

    // Add to history
    if (_historyIndex < _history.length - 1) {
      _history = _history.slice(0, _historyIndex + 1);
    }
    _history.push(url);
    _historyIndex = _history.length - 1;
    updateNavButtons();

    // Show loading
    showLoading(true);

    // Load site via iframe
    loadSite(fullPath, site);
  }

  function loadSite(path, siteInfo) {
    const viewport = document.getElementById('browser-viewport');
    if (!viewport) return;

    // Clear viewport
    viewport.innerHTML = '';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = path;
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.background = '#ffffff';

    iframe.onload = function () {
      showLoading(false);
      // Intercept links inside iframe for site navigation
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        $(iframeDoc).on('click', 'a[href]', function (e) {
          const href = $(this).attr('href');
          if (href && !href.startsWith('http') && !href.startsWith('#')) {
            e.preventDefault();
            // Resolve relative URL
            const baseDomain = _currentUrl.split('/')[0];
            const resolvedUrl = baseDomain + '/' + href.replace(/^\.\//, '');
            navigate(resolvedUrl);
          }
        });

        // Pass game events into iframe for interactive sites
        iframe.contentWindow.GameBridge = {
          getState: function () { return GameState.get(); },
          getMoney: function () { return GameState.get('money'); },
          addMoney: function (amt) { GameState.addMoney(amt); },
          notify: function (t, b) { Taskbar.showNotification(t, b); },
        };
      } catch (err) {
        // Cross-origin, silently ignore
      }
    };

    iframe.onerror = function () {
      showLoading(false);
      showError(_currentUrl);
    };

    viewport.appendChild(iframe);
  }

  function showError(url) {
    const viewport = document.getElementById('browser-viewport');
    if (!viewport) return;

    showLoading(false);
    viewport.innerHTML = `
      <div class="browser-error">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Sunucu Bulunamadı</div>
        <div class="error-msg">
          <strong>${url || 'bilinmeyen adres'}</strong> adresine ulaşılamadı.<br><br>
          Bilinen adresler:<br>
          • hedefbank.com.tr<br>
          • megacorp.net<br>
          • karanlikpazar.onion
        </div>
      </div>
    `;
  }

  function showLoading(show) {
    const $bar = $('#browser-loading');
    if (show) {
      $bar.addClass('loading');
    } else {
      $bar.removeClass('loading');
    }
  }

  function goBack() {
    if (_historyIndex > 0) {
      _historyIndex--;
      const url = _history[_historyIndex];
      _currentUrl = url;
      $('#browser-url').val(url);

      const domain = Object.keys(SITE_REGISTRY).find(d => url.startsWith(d));
      if (domain) {
        const site = SITE_REGISTRY[domain];
        const subPath = url.replace(domain, '').replace(/^\//, '') || 'index.html';
        const fullPath = site.dir + (subPath.includes('.html') ? subPath : subPath + '/index.html');
        showLoading(true);
        loadSite(fullPath, site);
      }
      updateNavButtons();
    }
  }

  function goForward() {
    if (_historyIndex < _history.length - 1) {
      _historyIndex++;
      const url = _history[_historyIndex];
      _currentUrl = url;
      $('#browser-url').val(url);

      const domain = Object.keys(SITE_REGISTRY).find(d => url.startsWith(d));
      if (domain) {
        const site = SITE_REGISTRY[domain];
        const subPath = url.replace(domain, '').replace(/^\//, '') || 'index.html';
        const fullPath = site.dir + (subPath.includes('.html') ? subPath : subPath + '/index.html');
        showLoading(true);
        loadSite(fullPath, site);
      }
      updateNavButtons();
    }
  }

  function refresh() {
    if (_currentUrl) {
      navigate(_currentUrl);
    }
  }

  function updateNavButtons() {
    if (_historyIndex > 0) {
      $('#browser-back').removeClass('disabled');
    } else {
      $('#browser-back').addClass('disabled');
    }
    if (_historyIndex < _history.length - 1) {
      $('#browser-forward').removeClass('disabled');
    } else {
      $('#browser-forward').addClass('disabled');
    }
  }

  return {
    open,
    navigate,
    SITE_REGISTRY,
  };
})();
