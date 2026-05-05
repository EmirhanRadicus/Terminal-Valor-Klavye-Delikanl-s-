/* ============================================
   SETTINGS APP — Desktop wallpaper customization
   ============================================ */
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
              <div class="settings-preset" data-url="https://placekitten.com/1920/1080">
                <img src="https://placekitten.com/200/120" alt="Kedi">
                <span>Kedicik</span>
              </div>
              <div class="settings-preset" data-url="https://picsum.photos/id/1025/1920/1080">
                <img src="https://picsum.photos/id/1025/200/120" alt="Köpek">
                <span>Doğa</span>
              </div>
              <div class="settings-preset" data-url="https://picsum.photos/id/984/1920/1080">
                <img src="https://picsum.photos/id/984/200/120" alt="Uzay">
                <span>Gece</span>
              </div>
              <div class="settings-preset" data-url="">
                <div style="width:100%;height:60px;background:#0a0a12;border-radius:4px;"></div>
                <span>Karanlık</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    WindowManager.open('settings', 'Ayarlar', '⚙️', contentHtml, {
      width: 500,
      height: 520,
      onInit: bindEvents,
    });
  }

  function bindEvents($window) {
    // Apply wallpaper
    $window.find('#settings-wp-apply').on('click', function () {
      const url = $window.find('#settings-wp-url').val().trim();
      applyWallpaper(url);
      Taskbar.showNotification('🖼️ Arkaplan', 'Masaüstü arkaplanı güncellendi.');
    });

    // Reset to default
    $window.find('#settings-wp-reset').on('click', function () {
      const defaultUrl = 'https://placekitten.com/1920/1080';
      $window.find('#settings-wp-url').val(defaultUrl);
      applyWallpaper(defaultUrl);
      updatePreview($window, defaultUrl);
      Taskbar.showNotification('🖼️ Arkaplan', 'Varsayılan arkaplan geri yüklendi.');
    });

    // Preset clicks
    $window.find('.settings-preset').on('click', function () {
      const url = $(this).data('url');
      $window.find('#settings-wp-url').val(url);
      applyWallpaper(url);
      updatePreview($window, url);
    });

    // URL input live preview
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

  // Called at game init to apply saved wallpaper
  function initWallpaper() {
    const url = GameState.get('desktopWallpaper');
    if (url) {
      applyWallpaper(url);
    }
  }

  return {
    open,
    applyWallpaper,
    initWallpaper,
  };
})();
