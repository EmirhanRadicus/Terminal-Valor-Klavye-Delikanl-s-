const LocationSystem = (function () {
  const TRAVEL_TIME = 30; 
  const CAFE_CLOSE_HOUR = 20;
  const CAFE_SUSPICION_MOD = -0.15; 
  const CAFE_COST_PER_HOUR = 1; 
  let _locationMenuOpen = false;
  function init() {
    $(document).on('game:cafeClosing', function () {
      Taskbar.showNotification('☕ Kafe', 'Kafe kapandı! Eve dönüyorsunuz...');
    });
    $(document).on('game:tick', function (e, data) {
      if (data.minutes === 0 && GameState.get('location') === 'cafe') {
        handleCoffeeTax();
      }
    });
    $('#tray-location').on('click', function (e) {
      e.stopPropagation();
      toggleLocationMenu();
    });
    $('#location-menu').on('click', '.loc-menu-item', function (e) {
      e.stopPropagation();
      const target = $(this).data('loc');
      closeLocationMenu();
      const result = switchLocation(target);
      if (!result.success) {
        Taskbar.showNotification('📍 Konum', result.message);
      }
    });
    $(document).on('click', function () {
      closeLocationMenu();
    });
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
    $cafeItem.toggleClass('disabled', currentLocation === 'cafe');
    $homeItem.toggleClass('disabled', currentLocation === 'home');
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
    if (targetLocation === 'cafe') {
      if (time.hours >= CAFE_CLOSE_HOUR || (time.hours >= 0 && time.hours < 8)) {
        return { success: false, message: 'Kafe kapalı. (08:00 - 20:00 arası açık)' };
      }
      const coffeePrice = GameState.get('coffeePrice') || 3;
      if (GameState.get('money') < coffeePrice) {
        return { success: false, message: 'Kahve parası yok! En az ₿' + coffeePrice + ' gerekli.' };
      }
    }
    const locationName = targetLocation === 'home' ? 'Ev' : 'Kafe';
    if (!forced) {
      const $overlay = $('#travel-overlay');
      $overlay.addClass('active');
      setTimeout(function() {
        TimeSystem.advanceTime(TRAVEL_TIME);
        GameState.set('location', targetLocation);
        $(document).trigger('game:locationChanged', { location: targetLocation });
        updateDesktopForLocation(targetLocation);
      }, 1000);
      setTimeout(function() {
        $overlay.removeClass('active');
        Taskbar.showNotification('📍 Konum', locationName + "'e ulaştınız. (" + TRAVEL_TIME + " dakika geçti)");
      }, 2500);
    } else {
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
