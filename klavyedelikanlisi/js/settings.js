const DEFAULT_WALLPAPER = 'https://wallpapercave.com/wp/wp5493583.jpg';
const SettingsApp = (function () {
  function open() {
    const currentWp = GameState.get('desktopWallpaper') || '';
    const contentHtml = `
      <div class="settings-container">
        <div class="settings-header">
          <span class="settings-header-icon">⚙️</span>
          <h2>Sistem Ayarları</h2>
        </div>
        <div class="settings-section">
          <div class="settings-section-title">🖼️ Masaüstü Arkaplanı</div>
          <div class="settings-wp-preview" id="settings-wp-preview">
            <img src="${currentWp}" alt="Arkaplan" onerror="this.style.display='none'">
            <div class="settings-wp-placeholder" style="${currentWp ? 'display:none' : ''}">Önizleme yok</div>
          </div>
          <div class="settings-form-group">
            <label>Resim URL'si:</label>
            <input type="text" id="settings-wp-url" class="settings-input" 
                   value="${currentWp}" 
                   placeholder="https://... resim adresi girin" spellcheck="false">
          </div>
          <div class="settings-actions">
            <button class="settings-btn settings-btn-primary" id="settings-wp-apply">Uygula</button>
            <button class="settings-btn" id="settings-wp-reset">Varsayılana Sıfırla</button>
          </div>
          <div class="settings-presets">
            <div class="settings-section-title" style="margin-top:16px;">Hazır Arkaplanlar</div>
            <div class="settings-preset-grid">
              <div class="settings-preset" data-url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920">
                <div style="width:100%;height:60px;background:linear-gradient(135deg, #4b134f, #c94b4b);border-radius:4px;"></div>
                <span>Windows 11 Bloom</span>
              </div>
              <div class="settings-preset" data-url="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920">
                <div style="width:100%;height:60px;background:linear-gradient(135deg, #00c6ff, #0072ff);border-radius:4px;"></div>
                <span>Premium Fluid</span>
              </div>
              <div class="settings-preset" data-url="https://images.unsplash.com/photo-1618005198143-d866a1579624?q=80&w=1920">
                <div style="width:100%;height:60px;background:linear-gradient(135deg, #134e5e, #71b280);border-radius:4px;"></div>
                <span>Modern Cyan</span>
              </div>
              <div class="settings-preset" data-url="${DEFAULT_WALLPAPER}">
                <div style="width:100%;height:60px;background:linear-gradient(135deg, #1a1a2e, #16213e);border-radius:4px;"></div>
                <span>Varsayılan</span>
              </div>
              <div class="settings-preset" data-url="">
                <div style="width:100%;height:60px;background:#0a0a12;border-radius:4px;"></div>
                <span>Karanlık</span>
              </div>
            </div>
          </div>
        </div>
        <div class="settings-section" style="margin-top:16px;border-top:1px solid rgba(255,60,60,0.15);padding-top:16px;">
          <div class="settings-section-title" style="color:#ff4444;">⚠️ Tehlike Bölgesi</div>
          <div style="font-size:12px;color:#888;margin:8px 0 12px;">Tüm oyun ilerlemesi, para, beceriler ve ayarlar silinir. Bu işlem geri alınamaz.</div>
          <button class="settings-btn" id="settings-hard-reset" style="background:rgba(255,50,50,0.12);border:1px solid rgba(255,50,50,0.3);color:#ff4444;width:100%;">
            🗑️ Hard Reset — Sıfırdan Başla
          </button>
        </div>
      </div>
    `;
    WindowManager.open('settings', 'Ayarlar', '⚙️', contentHtml, {
      width: 500,
      height: 660,
      onInit: bindEvents,
    });
  }
  function bindEvents($window) {
    $window.find('#settings-hard-reset').on('click', function () {
      const confirmed = window.confirm(
        '⚠️ HARD RESET\n\nTüm ilerleme, para, beceriler ve ayarlar silinecek.\nBu işlem geri alınamaz!\n\nDevam etmek istiyor musun?'
      );
      if (confirmed) {
        SaveSystem.deleteSave();
        location.reload();
      }
    });
    $window.find('#settings-wp-apply').on('click', function () {
      const url = $window.find('#settings-wp-url').val().trim();
      applyWallpaper(url);
      Taskbar.showNotification('🖼️ Arkaplan', 'Masaüstü arkaplanı güncellendi.');
    });
    $window.find('#settings-wp-reset').on('click', function () {
      const defaultUrl = DEFAULT_WALLPAPER;
      $window.find('#settings-wp-url').val(defaultUrl);
      applyWallpaper(defaultUrl);
      updatePreview($window, defaultUrl);
      Taskbar.showNotification('🖼️ Arkaplan', 'Varsayılan arkaplan geri yüklendi.');
    });
    $window.find('.settings-preset').on('click', function () {
      const url = $(this).data('url');
      $window.find('#settings-wp-url').val(url);
      applyWallpaper(url);
      updatePreview($window, url);
    });
    $window.find('#settings-wp-url').on('change', function () {
      const url = $(this).val().trim();
      updatePreview($window, url);
    });
  }
  function applyWallpaper(url) {
    GameState.set('desktopWallpaper', url);
    const $desktop = $('#desktop');
    if (url) {
      $desktop.css({
        'background-image': 'url(' + url + ')',
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
      });
    } else {
      $desktop.css({
        'background-image': 'none',
      });
    }
  }
  function updatePreview($window, url) {
    const $preview = $window.find('#settings-wp-preview');
    if (url) {
      $preview.find('img').attr('src', url).show();
      $preview.find('.settings-wp-placeholder').hide();
    } else {
      $preview.find('img').hide();
      $preview.find('.settings-wp-placeholder').show();
    }
  }
  function initWallpaper() {
    const saved = GameState.get('desktopWallpaper');
    const url = saved || DEFAULT_WALLPAPER;
    if (!saved) GameState.set('desktopWallpaper', DEFAULT_WALLPAPER);
    applyWallpaper(url);
  }
  return {
    open,
    applyWallpaper,
    initWallpaper,
  };
})();
