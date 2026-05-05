/* ============================================
   SUSPICION SYSTEM — Trace logic & raid
   ============================================ */
const SuspicionSystem = (function () {
  const BASE_PENALTY = 5; // 5% per mistake
  const THRESHOLDS = {
    warning: 50,
    danger: 75,
    critical: 90,
    gameOver: 100,
  };

  let _lastThreshold = null;

  function init() {
    $(document).on('state:suspicion', function (e, data) {
      updateVisuals(data.value);
      checkThresholds(data.value);
    });

    $(document).on('game:gameOver', function (e, data) {
      if (data.reason === 'raid') {
        triggerRaid();
      }
    });
  }

  function addSuspicionFromHack(hackMultiplier) {
    let penalty = BASE_PENALTY * hackMultiplier;

    // Cafe modifier
    const locationMod = LocationSystem.getSuspicionModifier();
    if (locationMod !== 0) {
      penalty = penalty * (1 + locationMod);
    }

    // Stealth skill modifiers
    if (GameState.hasSkill('proxy-chaining')) {
      penalty *= 0.7; // 30% reduction
    }

    penalty = Math.max(1, Math.round(penalty));
    GameState.addSuspicion(penalty);

    return penalty;
  }

  function reduceSuspicion(amount) {
    GameState.addSuspicion(-Math.abs(amount));
  }

  function updateVisuals(suspicion) {
    // Update suspicion bar
    const $fill = $('#suspicion-bar-fill');
    const $value = $('#suspicion-value');
    $fill.css('width', suspicion + '%');
    $value.text(suspicion + '%');

    // Color the value
    if (suspicion >= THRESHOLDS.critical) {
      $value.css('color', '#ff1a1a');
    } else if (suspicion >= THRESHOLDS.danger) {
      $value.css('color', '#ff4444');
    } else if (suspicion >= THRESHOLDS.warning) {
      $value.css('color', '#ffaa44');
    } else {
      $value.css('color', '#8a8e94');
    }

    // Pulse overlay
    const $pulse = $('#suspicion-pulse');
    $pulse.removeClass('warning danger critical');

    if (suspicion >= THRESHOLDS.critical) {
      $pulse.addClass('critical');
    } else if (suspicion >= THRESHOLDS.danger) {
      $pulse.addClass('danger');
    } else if (suspicion >= THRESHOLDS.warning) {
      $pulse.addClass('warning');
    }
  }

  function checkThresholds(suspicion) {
    let currentThreshold = null;

    if (suspicion >= THRESHOLDS.critical) currentThreshold = 'critical';
    else if (suspicion >= THRESHOLDS.danger) currentThreshold = 'danger';
    else if (suspicion >= THRESHOLDS.warning) currentThreshold = 'warning';

    if (currentThreshold && currentThreshold !== _lastThreshold) {
      _lastThreshold = currentThreshold;

      if (currentThreshold === 'warning') {
        Taskbar.showNotification('⚠️ Uyarı', 'Şüphe seviyesi yükseliyor! Dikkatli ol.');
      } else if (currentThreshold === 'danger') {
        Taskbar.showNotification('🔴 Tehlike', 'Polis izini sürüyor! Logları sil veya dur.');
        $('#desktop').addClass('screen-shake');
        setTimeout(() => $('#desktop').removeClass('screen-shake'), 500);
      } else if (currentThreshold === 'critical') {
        Taskbar.showNotification('🚨 KRİTİK', 'Yakalanmak üzeresin! HEMEN logları sil!');
      }
    }

    if (suspicion < THRESHOLDS.warning) {
      _lastThreshold = null;
    }
  }

  function triggerRaid() {
    GameState.set('gameOver', true);
    GameState.set('gameOverReason', 'raid');
    TimeSystem.stop();

    // Screen shake
    const $desktop = $('#desktop');
    $desktop.addClass('screen-shake');

    setTimeout(function () {
      $desktop.removeClass('screen-shake');
      const $raid = $('#raid-overlay');
      $raid.addClass('active');
      $raid.find('.raid-text').text('POLİS BASKINI');
      $raid.find('.raid-subtext').text('Şüphe seviyesi %100 — Yakalandınız!');

      // Show restart button after delay
      setTimeout(function () {
        $raid.append(
          '<button class="raid-restart-btn" onclick="location.reload()" ' +
          'style="margin-top:40px;padding:12px 32px;background:rgba(255,26,26,0.15);' +
          'border:1px solid rgba(255,26,26,0.3);border-radius:8px;color:#ff6666;' +
          'font-size:14px;cursor:pointer;letter-spacing:2px;">TEKRAR DENE</button>'
        );
      }, 2000);
    }, 500);
  }

  return {
    init,
    addSuspicionFromHack,
    reduceSuspicion,
    BASE_PENALTY,
    THRESHOLDS,
  };
})();
