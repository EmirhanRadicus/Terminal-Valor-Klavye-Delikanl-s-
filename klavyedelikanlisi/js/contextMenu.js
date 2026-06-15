const ContextMenu = (function () {
  let _$menu = null;
  function init() {
    _$menu = $(`
      <div class="context-menu" id="desktop-context-menu">
        <div class="ctx-menu-item" data-action="terminal">
          <span class="ctx-icon">💻</span>
          <span class="ctx-label">Terminal Aç</span>
        </div>
        <div class="ctx-menu-item" data-action="browser">
          <span class="ctx-icon">🌐</span>
          <span class="ctx-label">Tarayıcı Aç</span>
        </div>
        <div class="ctx-menu-item" data-action="notepad">
          <span class="ctx-icon">📝</span>
          <span class="ctx-label">Not Defteri Aç</span>
        </div>
        <div class="ctx-menu-divider"></div>
        <div class="ctx-menu-item" data-action="refresh">
          <span class="ctx-icon">🔄</span>
          <span class="ctx-label">Yenile</span>
          <span class="ctx-shortcut">F5</span>
        </div>
        <div class="ctx-menu-item" data-action="wallpaper">
          <span class="ctx-icon">🖼️</span>
          <span class="ctx-label">Arkaplanı Değiştir</span>
        </div>
        <div class="ctx-menu-divider"></div>
        <div class="ctx-menu-item" data-action="status">
          <span class="ctx-icon">📊</span>
          <span class="ctx-label">Sistem Durumu</span>
        </div>
        <div class="ctx-menu-item" data-action="skilltree">
          <span class="ctx-icon">🌳</span>
          <span class="ctx-label">Yetenek Ağacı</span>
        </div>
        <div class="ctx-menu-divider"></div>
        <div class="ctx-menu-item" data-action="save">
          <span class="ctx-icon">💾</span>
          <span class="ctx-label">Oyunu Kaydet</span>
          <span class="ctx-shortcut">Ctrl+S</span>
        </div>
        <div class="ctx-menu-item" data-action="settings">
          <span class="ctx-icon">⚙️</span>
          <span class="ctx-label">Ayarlar</span>
        </div>
      </div>
    `);
    $('body').append(_$menu);
    $('#desktop').on('contextmenu', function (e) {
      const $target = $(e.target);
      if ($target.closest('.app-window').length ||
          $target.closest('#taskbar').length ||
          $target.closest('.desktop-icon').length ||
          $target.closest('#start-menu').length ||
          $target.closest('.context-menu').length) {
        return; 
      }
      e.preventDefault();
      e.stopPropagation();
      showMenu(e.clientX, e.clientY);
    });
    $('#desktop-icons').on('contextmenu', function (e) {
      if (!$(e.target).closest('.desktop-icon').length) {
        e.preventDefault();
        e.stopPropagation();
        showMenu(e.clientX, e.clientY);
      }
    });
    $(document).on('click', function () {
      hideMenu();
    });
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') hideMenu();
    });
    _$menu.on('click', '.ctx-menu-item', function (e) {
      e.stopPropagation();
      const action = $(this).data('action');
      hideMenu();
      handleAction(action);
    });
  }
  function showMenu(x, y) {
    updateDynamicItems();
    _$menu.addClass('visible');
    const menuW = _$menu.outerWidth();
    const menuH = _$menu.outerHeight();
    if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8;
    if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;
    _$menu.css({ left: x, top: y });
  }
  function hideMenu() {
    if (_$menu) {
      _$menu.removeClass('visible');
    }
  }
  function updateDynamicItems() {
  }
  function handleAction(action) {
    switch (action) {
      case 'terminal':
        Taskbar.openApp('terminal');
        break;
      case 'browser':
        Taskbar.openApp('browser');
        break;
      case 'notepad':
        Taskbar.openApp('notepad');
        break;
      case 'refresh':
        $('#desktop').css('opacity', '0.95');
        setTimeout(function () {
          $('#desktop').css('opacity', '1');
          Taskbar.showNotification('🔄 Yenile', 'Masaüstü yenilendi.');
        }, 200);
        break;
      case 'wallpaper':
        SettingsApp.open();
        break;
      case 'status':
        Taskbar.openApp('terminal');
        setTimeout(function () {
          const $input = $('#terminal-input');
          if ($input.length) {
            $input.val('status');
            $input.trigger($.Event('keydown', { key: 'Enter' }));
          }
        }, 300);
        break;
      case 'skilltree':
        SkillTree.show();
        break;
      case 'save':
        SaveSystem.save();
        Taskbar.showNotification('💾 Kayıt', 'Oyun kaydedildi.');
        break;
      case 'settings':
        SettingsApp.open();
        break;
    }
  }
  return {
    init,
    hideMenu,
  };
})();
