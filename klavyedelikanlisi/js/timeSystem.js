/* ============================================
   TIME SYSTEM — Chronometer & sleep logic
   ============================================ */
const TimeSystem = (function () {
  let _tickInterval = null;
  const TICK_MS = 1000; // 1 real second = 1 game minute
  const START_HOUR = 11;
  const SLEEP_DEFAULT = { hours: 1, minutes: 0 }; // 01:00
  const SLEEP_MAX = { hours: 4, minutes: 0 }; // 04:00
  const HARD_LIMIT = { hours: 4, minutes: 0 }; // 04:00

  function init() {
    $(document).on('game:requestSleep', handleSleep);
    $(document).on('game:gameOver', stop);
    $(document).on('state:loaded', function () {
      updateNightOverlay();
    });
  }

  function start() {
    if (_tickInterval) return;
    _tickInterval = setInterval(tick, TICK_MS);
  }

  function stop() {
    clearInterval(_tickInterval);
    _tickInterval = null;
  }

  function pause() {
    GameState.set('isPaused', true);
  }

  function resume() {
    GameState.set('isPaused', false);
  }

  function tick() {
    if (GameState.get('isPaused') || GameState.get('isSleeping') || GameState.get('gameOver')) return;

    const time = GameState.get('time');
    let h = time.hours;
    let m = time.minutes;

    m += 1;
    if (m >= 60) {
      m = 0;
      h += 1;
      // Cafe cost: 1₿ per hour
      if (GameState.get('location') === 'cafe') {
        GameState.addMoney(-1);
        $(document).trigger('game:cafeCost');
      }
    }

    // Handle day wrap (past midnight)
    if (h >= 24) {
      h = h - 24;
    }

    GameState.set('time', { hours: h, minutes: m });
    $(document).trigger('game:tick', { hours: h, minutes: m });

    // Check hard limit: 04:00 = pass out
    if (h === 4 && m === 0) {
      handlePassOut();
      return;
    }

    // Cafe closes at 20:00
    if (h === 20 && m === 0 && GameState.get('location') === 'cafe') {
      $(document).trigger('game:cafeClosing');
      LocationSystem.switchLocation('home', true);
    }

    updateNightOverlay();
  }

  function advanceTime(minutes) {
    const time = GameState.get('time');
    let totalMinutes = time.hours * 60 + time.minutes + minutes;

    // Check if we'd pass 04:00 (= 28:00 in next-day terms or 4*60 = 240)
    let h = Math.floor(totalMinutes / 60);
    let m = totalMinutes % 60;

    if (h >= 24) h -= 24;

    GameState.set('time', { hours: h, minutes: m });
    $(document).trigger('game:tick', { hours: h, minutes: m });

    // Check pass-out
    if ((h >= 4 && h < 11) && !GameState.get('isSleeping')) {
      handlePassOut();
      return;
    }

    updateNightOverlay();
  }

  function handleSleep() {
    const time = GameState.get('time');
    const h = time.hours;

    GameState.set('isSleeping', true);

    let wakeHour;
    // If sleep before or at 02:00 (i.e. h >= 20 or h <= 2 treating midnight crossing)
    const isBeforeTwo = (h >= 11 && h <= 23) || (h >= 0 && h < 2);
    const isBetweenTwoAndFour = (h >= 2 && h < 4);

    if (isBeforeTwo) {
      // Sleep before 02:00 → wake at 12:00
      wakeHour = 12;
    } else if (isBetweenTwoAndFour) {
      // Sleep between 02:00-04:00 → wake at 15:00
      wakeHour = 15;
    } else {
      wakeHour = 12;
    }

    // Show sleep overlay
    showSleepOverlay('Uykunuz geldi... Zzzz', function () {
      GameState.set('time', { hours: wakeHour, minutes: 0 });
      GameState.advanceDay();

      // Daily suspicion decay
      const currentSuspicion = GameState.get('suspicion');
      if (currentSuspicion > 0) {
        GameState.addSuspicion(-5);
      }

      // If at cafe, wake at home (cafe is closed at night)
      if (GameState.get('location') === 'cafe') {
        GameState.set('location', 'home');
        $(document).trigger('game:locationChanged', { location: 'home' });
      }

      GameState.set('isSleeping', false);
      updateNightOverlay();
      $(document).trigger('game:wokeUp', { wakeHour });
    });
  }

  function handlePassOut() {
    GameState.set('isSleeping', true);

    showSleepOverlay('Bayıldınız! Çok geç kaldınız...', function () {
      GameState.set('time', { hours: 17, minutes: 0 });
      GameState.advanceDay();

      // Higher suspicion penalty for passing out
      GameState.addSuspicion(3);

      if (GameState.get('location') === 'cafe') {
        GameState.set('location', 'home');
        $(document).trigger('game:locationChanged', { location: 'home' });
      }

      GameState.set('isSleeping', false);
      updateNightOverlay();
      $(document).trigger('game:wokeUp', { wakeHour: 17, passedOut: true });
    });
  }

  function showSleepOverlay(text, callback) {
    const $overlay = $('#sleep-overlay');
    $overlay.find('.sleep-text').text(text);
    $overlay.addClass('active');

    setTimeout(function () {
      $overlay.removeClass('active');
      if (callback) callback();
    }, 3000);
  }

  function updateNightOverlay() {
    const time = GameState.get('time');
    const h = time.hours;
    const $nightOverlay = $('#night-overlay');

    $nightOverlay.removeClass('late-night very-late');

    // After midnight until 04:00
    if (h >= 0 && h < 4) {
      $nightOverlay.addClass('very-late');
    }
    // Late evening
    else if (h >= 22 || h === 23) {
      $nightOverlay.addClass('late-night');
    }
  }

  function isNightTime() {
    const h = GameState.get('time').hours;
    return h >= 22 || (h >= 0 && h < 4);
  }

  return {
    init,
    start,
    stop,
    pause,
    resume,
    tick,
    advanceTime,
    isNightTime,
    TICK_MS,
  };
})();
