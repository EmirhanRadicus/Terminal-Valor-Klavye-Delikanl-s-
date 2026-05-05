/* ============================================
   WINDOW MANAGER — Draggable, minimizable windows
   ============================================ */
const WindowManager = (function () {
  let _windows = {};
  let _zIndexCounter = 100;
  let _dragState = null;
  let _resizeState = null;

  function init() {
    // Global mouse handlers for drag & resize
    $(document).on('mousemove', handleMouseMove);
    $(document).on('mouseup', handleMouseUp);
  }

  function open(appId, title, icon, contentHtml, options) {
    options = options || {};

    // If already open, just focus
    if (_windows[appId]) {
      if (_windows[appId].minimized) {
        restore(appId);
      }
      focus(appId);
      return _windows[appId];
    }

    const windowId = 'window-' + appId;
    const width = options.width || 800;
    const height = options.height || 520;
    const top = options.top || 60 + Object.keys(_windows).length * 30;
    const left = options.left || 100 + Object.keys(_windows).length * 30;

    // Clamp position
    const clampedTop = Math.min(top, window.innerHeight - 100);
    const clampedLeft = Math.min(left, window.innerWidth - 200);

    const windowHtml = `
      <div id="${windowId}" class="app-window focused" data-app="${appId}"
           style="width:${width}px;height:${height}px;top:${clampedTop}px;left:${clampedLeft}px;z-index:${++_zIndexCounter}">
        <div class="window-titlebar">
          <span class="title-icon">${icon}</span>
          <span class="title-text">${title}</span>
          <div class="window-controls">
            <button class="win-ctrl-btn btn-minimize" data-app="${appId}" title="Simge durumuna küçült">─</button>
            <button class="win-ctrl-btn btn-maximize" data-app="${appId}" title="Ekranı kapla">☐</button>
            <button class="win-ctrl-btn btn-close" data-app="${appId}" title="Kapat">✕</button>
          </div>
        </div>
        <div class="window-content" id="content-${appId}">
          ${contentHtml}
        </div>
        <div class="window-resize-handle" data-app="${appId}"></div>
      </div>
    `;

    $('#desktop').append(windowHtml);

    const $window = $('#' + windowId);

    // Register
    _windows[appId] = {
      id: windowId,
      appId: appId,
      title: title,
      icon: icon,
      $element: $window,
      minimized: false,
      maximized: false,
      prevBounds: null,
    };

    // Bind events
    $window.find('.window-titlebar').on('mousedown', function (e) {
      if ($(e.target).hasClass('win-ctrl-btn')) return;
      startDrag(appId, e);
    });

    $window.find('.window-resize-handle').on('mousedown', function (e) {
      startResize(appId, e);
    });

    $window.on('mousedown', function () {
      focus(appId);
    });

    $window.find('.btn-minimize').on('click', function () {
      minimize(appId);
    });

    $window.find('.btn-maximize').on('click', function () {
      toggleMaximize(appId);
    });

    $window.find('.btn-close').on('click', function () {
      close(appId);
    });

    // Add to taskbar
    Taskbar.addAppButton(appId, title, icon);

    // Focus & unfocus others
    focus(appId);

    // Trigger event
    $(document).trigger('window:opened', { appId });

    // Run init callback
    if (options.onInit) {
      setTimeout(() => options.onInit($window), 50);
    }

    return _windows[appId];
  }

  function close(appId) {
    const win = _windows[appId];
    if (!win) return;

    win.$element.css('animation', 'windowOpen 0.15s ease reverse');
    setTimeout(function () {
      win.$element.remove();
      delete _windows[appId];
      Taskbar.removeAppButton(appId);
      $(document).trigger('window:closed', { appId });
    }, 140);
  }

  function minimize(appId) {
    const win = _windows[appId];
    if (!win || win.minimized) return;

    win.minimized = true;
    win.$element.addClass('minimized');
    win.$element.removeClass('focused');
    Taskbar.setButtonState(appId, 'minimized');

    // Focus next window
    const nextId = getTopWindow();
    if (nextId) focus(nextId);

    $(document).trigger('window:minimized', { appId });
  }

  function restore(appId) {
    const win = _windows[appId];
    if (!win || !win.minimized) return;

    win.minimized = false;
    win.$element.removeClass('minimized');
    win.$element.css('animation', 'windowRestore 0.25s ease');

    focus(appId);
    Taskbar.setButtonState(appId, 'active');

    $(document).trigger('window:restored', { appId });
  }

  function toggleMaximize(appId) {
    const win = _windows[appId];
    if (!win) return;

    if (win.maximized) {
      // Un-maximize
      win.maximized = false;
      win.$element.removeClass('maximized');
      if (win.prevBounds) {
        win.$element.css(win.prevBounds);
      }
      win.$element.find('.btn-maximize').text('☐');
    } else {
      // Maximize
      win.prevBounds = {
        top: win.$element.css('top'),
        left: win.$element.css('left'),
        width: win.$element.css('width'),
        height: win.$element.css('height'),
      };
      win.maximized = true;
      win.$element.addClass('maximized');
      win.$element.find('.btn-maximize').text('❐');
    }
  }

  function focus(appId) {
    const win = _windows[appId];
    if (!win) return;

    // Remove focus from all
    $('.app-window').removeClass('focused');

    // Add focus
    win.$element.addClass('focused');
    win.$element.css('z-index', ++_zIndexCounter);

    // Update taskbar
    Object.keys(_windows).forEach(function (id) {
      if (id !== appId) {
        Taskbar.setButtonState(id, _windows[id].minimized ? 'minimized' : 'inactive');
      }
    });
    Taskbar.setButtonState(appId, 'active');
  }

  function getTopWindow() {
    let topZ = 0;
    let topId = null;
    Object.keys(_windows).forEach(function (id) {
      const win = _windows[id];
      if (!win.minimized) {
        const z = parseInt(win.$element.css('z-index')) || 0;
        if (z > topZ) {
          topZ = z;
          topId = id;
        }
      }
    });
    return topId;
  }

  // --- Drag Logic ---
  function startDrag(appId, e) {
    const win = _windows[appId];
    if (!win || win.maximized) return;

    e.preventDefault();
    _dragState = {
      appId: appId,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: parseInt(win.$element.css('left')),
      origTop: parseInt(win.$element.css('top')),
    };

    win.$element.addClass('dragging');
    $('body').addClass('window-dragging');
    focus(appId);
  }

  function startResize(appId, e) {
    const win = _windows[appId];
    if (!win || win.maximized) return;

    e.preventDefault();
    e.stopPropagation();

    _resizeState = {
      appId: appId,
      startX: e.clientX,
      startY: e.clientY,
      origW: win.$element.outerWidth(),
      origH: win.$element.outerHeight(),
    };

    $('body').addClass('window-resizing');
    focus(appId);
  }

  function handleMouseMove(e) {
    if (_dragState) {
      const win = _windows[_dragState.appId];
      if (!win) { _dragState = null; return; }

      const dx = e.clientX - _dragState.startX;
      const dy = e.clientY - _dragState.startY;

      let newLeft = _dragState.origLeft + dx;
      let newTop = _dragState.origTop + dy;

      // Keep title bar visible
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - 44));
      newLeft = Math.max(-win.$element.outerWidth() + 100, Math.min(newLeft, window.innerWidth - 100));

      win.$element.css({ left: newLeft, top: newTop });
    }

    if (_resizeState) {
      const win = _windows[_resizeState.appId];
      if (!win) { _resizeState = null; return; }

      const dx = e.clientX - _resizeState.startX;
      const dy = e.clientY - _resizeState.startY;

      const newW = Math.max(320, _resizeState.origW + dx);
      const newH = Math.max(220, _resizeState.origH + dy);

      win.$element.css({ width: newW, height: newH });
    }
  }

  function handleMouseUp() {
    if (_dragState) {
      const win = _windows[_dragState.appId];
      if (win) win.$element.removeClass('dragging');
      _dragState = null;
      $('body').removeClass('window-dragging');
    }

    if (_resizeState) {
      _resizeState = null;
      $('body').removeClass('window-resizing');
    }
  }

  function isOpen(appId) {
    return !!_windows[appId];
  }

  function getWindow(appId) {
    return _windows[appId];
  }

  return {
    init,
    open,
    close,
    minimize,
    restore,
    toggleMaximize,
    focus,
    isOpen,
    getWindow,
  };
})();
