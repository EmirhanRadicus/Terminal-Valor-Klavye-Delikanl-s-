/* ============================================
   TASKBAR — System tray, clock, app buttons
   ============================================ */
const Taskbar = (function () {
  let _startMenuOpen = false;
  let _notifTimeout = null;

  function init() {
    // Start button
    $('#start-button').on('click', function (e) {
      e.stopPropagation();
      toggleStartMenu();
    });

    // Close start menu on click outside
    $(document).on('click', function () {
      if (_startMenuOpen) closeStartMenu();
    });

    // Prevent start menu background clicks from closing it,
    // but allow item clicks to propagate within
    $('#start-menu').on('click', function (e) {
      // Only stop propagation if clicking on the menu background, not items
      if (!$(e.target).closest('.start-menu-item').length) {
        e.stopPropagation();
      }
    });

    // Start menu items — bind directly to #start-menu for reliable delegation
    $('#start-menu').on('click', '.start-menu-item', function (e) {
      e.stopPropagation();
      const app = $(this).data('app');
      closeStartMenu();
      if (app === 'skilltree') {
        SkillTree.show();
      } else if (app === 'save') {
        SaveSystem.save();
        showNotification('💾 Kayıt', 'Oyun kaydedildi.');
      } else if (app === 'sleep') {
        $(document).trigger('game:requestSleep');
      } else if (app === 'settings') {
        SettingsApp.open();
      } else {
        openApp(app);
      }
    });

    // Taskbar button clicks
    $(document).on('click', '.taskbar-btn', function () {
      const appId = $(this).data('app');
      const win = WindowManager.getWindow(appId);
      if (win) {
        if (win.minimized) {
          WindowManager.restore(appId);
        } else {
          // If already focused, minimize
          if (win.$element.hasClass('focused')) {
            WindowManager.minimize(appId);
          } else {
            WindowManager.focus(appId);
          }
        }
      }
    });

    // Update clock every tick
    $(document).on('game:tick', updateClock);
    $(document).on('state:location', updateLocationDisplay);
    $(document).on('state:money', updateMoneyDisplay);

    // VPN toggle switch
    $('#vpn-toggle-switch').on('click', function (e) {
      e.stopPropagation();
      const isActive = GameState.get('vpnActive');
      GameState.set('vpnActive', !isActive);
      $(this).toggleClass('on', !isActive);
      if (!isActive) {
        showNotification('🛡️ VPN', 'VPN aktif. İz bırakma cezası kaldırıldı.');
      } else {
        showNotification('🛡️ VPN', 'VPN kapatıldı. Dikkatli ol!');
      }
    });

    // Restore VPN state on load
    $(document).on('state:loaded', function () {
      if (GameState.get('vpnUnlocked')) {
        $('#tray-vpn').addClass('unlocked');
      }
      if (GameState.get('vpnActive')) {
        $('#vpn-toggle-switch').addClass('on');
      }
    });

    // Initial display
    updateClock();
    updateLocationDisplay();
    updateMoneyDisplay();

    // Check if VPN was previously unlocked
    if (GameState.get('vpnUnlocked')) {
      $('#tray-vpn').addClass('unlocked');
      if (GameState.get('vpnActive')) {
        $('#vpn-toggle-switch').addClass('on');
      }
    }
  }

  function openApp(appId) {
    switch (appId) {
      case 'browser':
        BrowserApp.open();
        break;
      case 'terminal':
        TerminalApp.open();
        break;
      case 'notepad':
        NotepadApp.open();
        break;
      case 'messenger':
        MessengerApp.open();
        break;
      case 'guide':
        GuideApp.open();
        break;
      case 'tor':
        TorBrowserApp.open();
        break;
      case 'missions':
        MissionsApp.open();
        break;
    }
  }

  function toggleStartMenu() {
    if (_startMenuOpen) {
      closeStartMenu();
    } else {
      openStartMenu();
    }
  }

  function openStartMenu() {
    _startMenuOpen = true;
    $('#start-menu').addClass('visible');
    $('#start-button').addClass('active');
  }

  function closeStartMenu() {
    _startMenuOpen = false;
    $('#start-menu').removeClass('visible');
    $('#start-button').removeClass('active');
  }

  function addAppButton(appId, title, icon) {
    if ($('.taskbar-btn[data-app="' + appId + '"]').length) return;

    const html = `
      <div class="taskbar-btn active" data-app="${appId}">
        <span class="btn-icon">${icon}</span>
        <span class="btn-title">${title}</span>
      </div>
    `;
    $('#taskbar-apps').append(html);
  }

  function removeAppButton(appId) {
    $('.taskbar-btn[data-app="' + appId + '"]').remove();
  }

  function setButtonState(appId, state) {
    const $btn = $('.taskbar-btn[data-app="' + appId + '"]');
    $btn.removeClass('active minimized');
    if (state === 'active') $btn.addClass('active');
    if (state === 'minimized') $btn.addClass('minimized');
  }

  function updateClock() {
    const timeStr = GameState.getTimeString();
    const day = GameState.get('day');
    const dayName = GameState.get('dayName');
    $('#tray-clock').text(timeStr);
    $('#tray-day').text('Gün ' + day + ' — ' + dayName);
  }

  function updateLocationDisplay() {
    const location = GameState.get('location');
    const locText = location === 'home' ? '🏠 Ev' : '☕ Kafe';
    $('#tray-location .loc-text').text(locText);
  }

  function updateMoneyDisplay() {
    const money = GameState.get('money');
    $('#tray-money').text('₿' + money);
  }

  function showNotification(title, body) {
    // Play notification audio
    try {
      const audio = new Audio('assets/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(function() {});
    } catch(e) {}

    const $notif = $(`
      <div class="notification-popup">
        <div class="notif-title">${title}</div>
        <div class="notif-body">${body}</div>
      </div>
    `);

    const $stack = $('#notification-stack');
    $stack.append($notif);

    // Auto-dismiss after 4 seconds
    setTimeout(function () {
      $notif.addClass('notif-exit');
      setTimeout(function () {
        $notif.remove();
      }, 300);
    }, 4000);

    // Cap at 5 notifications max
    const $all = $stack.children('.notification-popup');
    if ($all.length > 5) {
      $all.first().remove();
    }
  }

  return {
    init,
    openApp,
    addAppButton,
    removeAppButton,
    setButtonState,
    showNotification,
    updateClock,
    updateLocationDisplay,
    updateMoneyDisplay,
  };
})();
