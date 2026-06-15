$(document).ready(function () {
  let hasSave = false;
  try { hasSave = SaveSystem.hasSave(); } catch(e) {}
  const isFirstPlay = !hasSave && !localStorage.getItem('story_done');
  if (isFirstPlay) {
    $('#boot-screen').hide();
    StoryIntro.start(function () {
      localStorage.setItem('story_done', '1');
      $('#boot-screen').show();
      showBootScreen();
    });
  } else {
    showBootScreen();
  }
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
  setTimeout(addBootLine, 500);
}
function initGame() {
  try {
    if (SaveSystem.hasSave()) {
      SaveSystem.load();
    }
    WindowManager.init();
    Taskbar.init();
    TimeSystem.init();
    LocationSystem.init();
    SuspicionSystem.init();
    MissionSystem.init();
    SaveSystem.init();
    ContextMenu.init();
    TimeSystem.start();
    Taskbar.updateClock();
    Taskbar.updateLocationDisplay();
    Taskbar.updateMoneyDisplay();
    GameState.set('bootComplete', true);
    SettingsApp.initWallpaper();
    $('.desktop-icon').each(function () {
      const app = $(this).data('app');
      $(this).find('.icon-img').html(getAppIcon(app));
    });
    $('.start-menu-item').each(function () {
      const app = $(this).data('app');
      $(this).find('.menu-icon').html(getAppIcon(app));
    });
    $('#start-button').html(AppIcons.start);
    initPngIcons();
    bindDesktopIcons();
    MessengerApp.onGameStart();
    bindGameEvents();
    setTimeout(function () {
      Tutorial.start();
    }, 3000);
  } catch (err) {
    var errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a0000;color:#f66;font-family:monospace;font-size:13px;padding:12px;z-index:99999;white-space:pre-wrap;border-top:2px solid #f00;';
    errDiv.textContent = '⛔ initGame HATA: ' + err.message + '\n' + err.stack;
    document.body.appendChild(errDiv);
  }
}
function bindDesktopIcons() {
  $(document).on('click', '.desktop-icon', function (e) {
    e.stopPropagation();
    const $icon = $(this);
    const app = $icon.data('app');
    if (!app) return;
    $('.desktop-icon').removeClass('selected');
    $icon.addClass('selected');
    Taskbar.openApp(app);
  });
  $('#desktop-icons').on('click', function (e) {
    if (!$(e.target).closest('.desktop-icon').length) {
      $('.desktop-icon').removeClass('selected');
    }
  });
}
function bindGameEvents() {
  $(document).on('game:locationChanged', function (e, data) {
    Taskbar.updateLocationDisplay();
    if (data.location === 'cafe') {
      MessengerApp.triggerStoryEvent('cafeVisit');
    }
  });
  $(document).on('state:money', function () {
    Taskbar.updateMoneyDisplay();
  });
  $(document).on('game:wokeUp', function (e, data) {
    Taskbar.updateClock();
    if (data.passedOut) {
      Taskbar.showNotification('😵 Bayılma', 'Saat 04:00\'te bayıldınız! Saat 17:00\'de uyandınız.');
    } else {
      const wakeTime = String(data.wakeHour).padStart(2, '0') + ':00';
      Taskbar.showNotification('☀️ Günaydın', 'Gün ' + GameState.get('day') + ' — Saat ' + wakeTime);
    }
  });
  $(document).on('state:skillPoints', function () {
    const points = GameState.get('skillPoints');
    if (points > 0) {
      Taskbar.showNotification('⭐ Yetenek Puanı', points + ' yetenek puanınız var. Yetenek ağacını kontrol edin.');
    }
  });
  $(document).on('game:newDay', function (e, data) {
    if (data.day >= 3 && !GameState.hasSkill('zero-day-hunter')) {
      if (Math.random() < 0.3) {
        MessengerApp.triggerStoryEvent('zeroDayAvailable');
      }
    }
  });
}
