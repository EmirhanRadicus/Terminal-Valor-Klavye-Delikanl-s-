/* ============================================
   MAIN — Bootstrap & game initialization
   ============================================ */
$(document).ready(function () {
  showBootScreen();
});

function showBootScreen() {
  const bootLines = [
    '[OK] Çekirdek yükleniyor...',
    '[OK] Ağ arayüzleri yapılandırılıyor...',
    '[OK] Güvenlik duvarı devre dışı bırakılıyor...',
    '[OK] Tor ağına bağlanılıyor...',
    '[OK] VPN tüneli kuruluyor...',
    '[OK] Proxy zincirleri aktif...',
    '[OK] Şifreleme modülleri yükleniyor...',
    '[OK] Exploit veritabanı güncelleniyor...',
    '[OK] ShadowOS v3.1.7 başlatılıyor...',
    '',
    'Sistem hazır. Hoş geldin, operatör.',
  ];

  const $bootLog = $('#boot-log');
  const $progress = $('#boot-progress-fill');
  let lineIndex = 0;

  function addBootLine() {
    if (lineIndex >= bootLines.length) {
      // Boot complete — fade out
      $progress.css('width', '100%');
      setTimeout(function () {
        $('#boot-screen').addClass('fade-out');
        setTimeout(function () {
          $('#boot-screen').remove();
          initGame();
        }, 400);
      }, 600);
      return;
    }

    const line = bootLines[lineIndex];
    const $line = $('<div class="boot-line">').text(line);
    $line.css('animation-delay', '0s');
    $bootLog.append($line);

    const progress = ((lineIndex + 1) / bootLines.length) * 100;
    $progress.css('width', progress + '%');

    lineIndex++;
    setTimeout(addBootLine, 200 + Math.random() * 200);
  }

  // Start boot sequence
  setTimeout(addBootLine, 500);
}

function initGame() {
  // Check for existing save
  if (SaveSystem.hasSave()) {
    SaveSystem.load();
  }

  // Initialize all systems
  WindowManager.init();
  Taskbar.init();
  TimeSystem.init();
  LocationSystem.init();
  SuspicionSystem.init();
  MissionSystem.init();
  SaveSystem.init();
  ContextMenu.init();

  // Start game clock
  TimeSystem.start();

  // Initial UI updates
  Taskbar.updateClock();
  Taskbar.updateLocationDisplay();
  Taskbar.updateMoneyDisplay();

  // Set boot complete flag
  GameState.set('bootComplete', true);

  // Apply saved wallpaper
  SettingsApp.initWallpaper();

  // Desktop icon double-click handlers
  bindDesktopIcons();

  // Start storyline
  MessengerApp.onGameStart();

  // Listen for game events
  bindGameEvents();

  // Start FTUE tutorial (only on first play, no existing save)
  setTimeout(function () {
    Tutorial.start();
  }, 1500);
}

function bindDesktopIcons() {
  let clickTimer = null;

  $(document).on('click', '.desktop-icon', function () {
    const $icon = $(this);
    const app = $icon.data('app');

    // Single click = select
    $('.desktop-icon').removeClass('selected');
    $icon.addClass('selected');

    // Double click detection
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      // Double click — open app
      Taskbar.openApp(app);
    } else {
      clickTimer = setTimeout(function () {
        clickTimer = null;
      }, 300);
    }
  });

  // Deselect on desktop click
  $('#desktop-icons').on('click', function (e) {
    if (!$(e.target).closest('.desktop-icon').length) {
      $('.desktop-icon').removeClass('selected');
    }
  });
}

function bindGameEvents() {
  // Location change — update desktop
  $(document).on('game:locationChanged', function (e, data) {
    Taskbar.updateLocationDisplay();
    if (data.location === 'cafe') {
      MessengerApp.triggerStoryEvent('cafeVisit');
    }
  });

  // Money change
  $(document).on('state:money', function () {
    Taskbar.updateMoneyDisplay();
  });

  // Woke up
  $(document).on('game:wokeUp', function (e, data) {
    Taskbar.updateClock();
    if (data.passedOut) {
      Taskbar.showNotification('😵 Bayılma', 'Saat 04:00\'te bayıldınız! Saat 17:00\'de uyandınız.');
    } else {
      const wakeTime = String(data.wakeHour).padStart(2, '0') + ':00';
      Taskbar.showNotification('☀️ Günaydın', 'Gün ' + GameState.get('day') + ' — Saat ' + wakeTime);
    }
  });

  // Skill point changes
  $(document).on('state:skillPoints', function () {
    const points = GameState.get('skillPoints');
    if (points > 0) {
      Taskbar.showNotification('⭐ Yetenek Puanı', points + ' yetenek puanınız var. Yetenek ağacını kontrol edin.');
    }
  });

  // New day
  $(document).on('game:newDay', function (e, data) {
    // Random events on new day
    if (data.day >= 3 && !GameState.hasSkill('zero-day-hunter')) {
      if (Math.random() < 0.3) {
        MessengerApp.triggerStoryEvent('zeroDayAvailable');
      }
    }
  });
}
