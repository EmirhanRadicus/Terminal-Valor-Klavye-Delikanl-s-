/* ============================================
   LOCATION SYSTEM — Home / Cafe + Coffee Tax
   ============================================ */
const LocationSystem = (function () {
  const TRAVEL_TIME = 30; // minutes
  const CAFE_CLOSE_HOUR = 20;
  const CAFE_SUSPICION_MOD = -0.15; // -15%
  const CAFE_COST_PER_HOUR = 1; // ₿ (seat cost, separate from coffee)

  let _locationMenuOpen = false;

  function init() {
    $(document).on('game:cafeClosing', function () {
      Taskbar.showNotification('☕ Kafe', 'Kafe kapandı! Eve dönüyorsunuz...');
    });

    // Hourly coffee tax when at cafe
    $(document).on('game:tick', function (e, data) {
      if (data.minutes === 0 && GameState.get('location') === 'cafe') {
        handleCoffeeTax();
      }
    });

    // Location tray click → toggle location menu
    $('#tray-location').on('click', function (e) {
      e.stopPropagation();
      toggleLocationMenu();
    });

    // Location menu item clicks
    $('#location-menu').on('click', '.loc-menu-item', function (e) {
      e.stopPropagation();
      const target = $(this).data('loc');
      closeLocationMenu();
      const result = switchLocation(target);
      if (!result.success) {
        Taskbar.showNotification('📍 Konum', result.message);
      }
    });

    // Close location menu on outside click
    $(document).on('click', function () {
      closeLocationMenu();
    });

    // Update location menu state when location changes
    $(document).on('game:locationChanged', function (e, data) {
      updateLocationMenuState(data.location);
    });
  }

  function toggleLocationMenu() {
    if (_locationMenuOpen) {
      closeLocationMenu();
    } else {
      openLocationMenu();
    }
  }

  function openLocationMenu() {
    _locationMenuOpen = true;
    updateLocationMenuState(GameState.get('location'));
    $('#location-menu').addClass('visible');
  }

  function closeLocationMenu() {
    _locationMenuOpen = false;
    $('#location-menu').removeClass('visible');
  }

  function updateLocationMenuState(currentLocation) {
    const $cafeItem = $('#location-menu .loc-menu-item[data-loc="cafe"]');
    const $homeItem = $('#location-menu .loc-menu-item[data-loc="home"]');

    // Disable the current location option
    $cafeItem.toggleClass('disabled', currentLocation === 'cafe');
    $homeItem.toggleClass('disabled', currentLocation === 'home');

    // Check if cafe is open
    if (!isCafeOpen()) {
      $cafeItem.addClass('disabled');
    }
  }

  function handleCoffeeTax() {
    const coffeePrice = GameState.get('coffeePrice') || 3;
    const money = GameState.get('money');

    if (money >= coffeePrice) {
      GameState.addMoney(-coffeePrice);
      Taskbar.showNotification(
        '☕ Kahve',
        'Kahvede boş oturanı sevmezler. Saatlik kahve alma zamanın geldi ve kahve satın alındı. (-₿' + coffeePrice + ')'
      );
    } else {
      // Can't afford coffee — kicked out
      Taskbar.showNotification(
        '☕ Kahve',
        'Kahve parası kalmadı! Kafeden atıldınız.'
      );
      switchLocation('home', true);
    }
  }

  function switchLocation(targetLocation, forced) {
    const current = GameState.get('location');
    if (current === targetLocation && !forced) {
      return { success: false, message: 'Zaten ' + (current === 'home' ? 'evdesiniz' : 'kafedesiniz') + '.' };
    }

    const time = GameState.get('time');

    // Check if cafe is open
    if (targetLocation === 'cafe') {
      if (time.hours >= CAFE_CLOSE_HOUR || (time.hours >= 0 && time.hours < 8)) {
        return { success: false, message: 'Kafe kapalı. (08:00 - 20:00 arası açık)' };
      }
      // Check if player has money for at least entry + one coffee
      const coffeePrice = GameState.get('coffeePrice') || 3;
      if (GameState.get('money') < coffeePrice) {
        return { success: false, message: 'Kahve parası yok! En az ₿' + coffeePrice + ' gerekli.' };
      }
    }

    const locationName = targetLocation === 'home' ? 'Ev' : 'Kafe';

    if (!forced) {
      // Play Persona-style travel animation
      const $overlay = $('#travel-overlay');
      $overlay.addClass('active');

      // Wait until screen is black (approx 1s) to change actual background
      setTimeout(function() {
        TimeSystem.advanceTime(TRAVEL_TIME);
        GameState.set('location', targetLocation);
        $(document).trigger('game:locationChanged', { location: targetLocation });
        updateDesktopForLocation(targetLocation);
      }, 1000);

      // Remove overlay after animation completes (2.5s total)
      setTimeout(function() {
        $overlay.removeClass('active');
        Taskbar.showNotification('📍 Konum', locationName + "'e ulaştınız. (" + TRAVEL_TIME + " dakika geçti)");
      }, 2500);

    } else {
      // Forced (e.g., evicted from cafe)
      GameState.set('location', targetLocation);
      $(document).trigger('game:locationChanged', { location: targetLocation });
      updateDesktopForLocation(targetLocation);
    }

    return {
      success: true,
      message: locationName + "'e gidiyorsunuz... (" + TRAVEL_TIME + " dakika)",
    };
  }

  function updateDesktopForLocation(location) {
    const $desktop = $('#desktop');
    $desktop.removeClass('location-home location-cafe');
    $desktop.addClass('location-' + location);
  }

  function getSuspicionModifier() {
    if (GameState.get('location') === 'cafe') {
      return CAFE_SUSPICION_MOD;
    }
    return 0;
  }

  function isCafeOpen() {
    const h = GameState.get('time').hours;
    return h >= 8 && h < CAFE_CLOSE_HOUR;
  }

  return {
    init,
    switchLocation,
    getSuspicionModifier,
    isCafeOpen,
    TRAVEL_TIME,
    CAFE_CLOSE_HOUR,
    CAFE_COST_PER_HOUR,
  };
})();
