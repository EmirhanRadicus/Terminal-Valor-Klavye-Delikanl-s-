/* ============================================
   TUTORIAL — First-Time User Experience (FTUE)
   Guided by AI assistant "RAI FEU"
   ============================================ */
const Tutorial = (function () {
  let _currentStep = 0;
  let _$overlay = null;
  let _$tooltip = null;
  let _$ring = null;

  // Tutorial steps — all text in Turkish
  const STEPS = [
    {
      // Step 0: Welcome
      target: null,
      position: 'center',
      title: 'Hoş Geldin, Operatör.',
      body: 'Ben <strong>RAI FEU</strong> — senin yapay zeka rehberin. '
        + 'Bu karanlık dünyada hayatta kalmayı ve sistemlere sızmayı sana öğreteceğim.'
        + '<div class="tut-highlight-box">⚠️ Bu eğitim sadece bir kez gösterilir. Dikkatli dinle.</div>',
    },
    {
      // Step 1: Desktop & Taskbar
      target: '#taskbar',
      position: 'above',
      title: '📌 Görev Çubuğu ve Masaüstü',
      body: 'Alt kısımda <strong>Görev Çubuğu</strong> var. '
        + 'Burada açık uygulamaları, saati, konumunu ve <strong>şüphe seviyeni</strong> görebilirsin.<br><br>'
        + 'Masaüstündeki ikonlara <strong>çift tıklayarak</strong> uygulamaları açabilirsin. '
        + '<strong>⚡ Başlat</strong> düğmesi ile de menüye ulaşabilirsin.',
    },
    {
      // Step 2: Start Menu
      target: '#start-button',
      position: 'above-right',
      title: '⚡ Başlat Menüsü',
      body: 'Bu düğmeye tıklayarak <strong>Başlat Menüsü</strong>nü açabilirsin. '
        + 'İçinden Terminal, Tarayıcı, Not Defteri, Mesajlar ve diğer araçlara ulaşırsın.<br><br>'
        + '<strong>Kaydet</strong> ve <strong>Uyu</strong> seçenekleri de burada.',
    },
    {
      // Step 3: Clock & Time
      target: '#tray-clock',
      position: 'above-left',
      title: '⏰ Zaman Sistemi — HAYATİ ÖNEM',
      body: 'Oyun saati <strong>11:00</strong>\'da başlar. '
        + 'Her gerçek saniye = 1 dakika oyun zamanı.<br><br>'
        + '<em>Saat 01:00</em>\'den önce uyursan → 12:00\'de uyanırsın.<br>'
        + '<em>Saat 02:00-04:00</em> arası uyursan → 15:00\'te uyanırsın.<br>'
        + '<strong>Saat 04:00</strong>\'te hâlâ uyanıksan → <em>BAYILIRSIN</em> ve 17:00\'de uyanırsın!'
        + '<div class="tut-highlight-box">💡 "sleep" komutu veya Başlat → Uyu ile uyuyabilirsin.</div>',
    },
    {
      // Step 4: Suspicion
      target: '#tray-suspicion',
      position: 'above-left',
      title: '🔍 Şüphe Seviyesi',
      body: 'Her saldırıda <strong>şüphe seviyesi</strong> artar. '
        + 'Seviye yükseldikçe ekranın kenarları <em>kırmızı yanıp söner</em>.<br><br>'
        + 'Şüphe <strong>%100</strong>\'e ulaşırsa polis baskınına uğrarsın ve oyun biter!'
        + '<div class="tut-highlight-box">🧹 Terminal\'den "wipe-logs" komutu ile şüpheyi azaltabilirsin.</div>',
    },
    {
      // Step 5: Skill Tree
      target: null,
      position: 'center',
      title: '🌳 Yetenek Ağacı',
      body: 'Başlat Menüsünden <strong>Yetenek Ağacı</strong>\'na erişebilirsin. '
        + '5 dal var: OSINT, Gizlilik, İstismar, Sosyal Mühendislik ve Operasyon.<br><br>'
        + 'Yeni saldırı türleri açmak için <strong>yetenek puanı</strong> harcaman gerekir. '
        + 'Puanları başarılı saldırılar ve görevlerle kazanırsın.'
        + '<div class="tut-highlight-box">🔒 Tier 2 ve Tier 3 saldırılar sadece yetenek açıldıktan sonra kullanılabilir.</div>',
    },
    {
      // Step 6: First Action
      target: null,
      position: 'center',
      title: '🚀 İlk Adımın',
      body: 'Şimdi seni bırakıyorum. İlk görevin şu:<br><br>'
        + '1️⃣ <strong>Terminal</strong>\'i aç (masaüstü ikonu veya Başlat Menüsü)<br>'
        + '2️⃣ <strong>scan hedefbank.com.tr</strong> komutunu çalıştır<br>'
        + '3️⃣ <strong>exploit sqli hedefbank.com.tr</strong> ile saldırı başlat<br><br>'
        + '<strong>Broker</strong> sana Mesajlar\'dan görevler verecek. İyi şanslar, operatör.'
        + '<div class="tut-highlight-box">💬 Mesajlar uygulamasını takip et — Broker görev detaylarını orada paylaşır.</div>',
    },
  ];

  function shouldStart() {
    // Story henüz bitmemişse tutorial başlamasın
    if (!localStorage.getItem('story_done')) return false;
    // Zaten overlay açıksa tekrar başlatma
    if (_$overlay) return false;
    return !GameState.get('tutorialComplete') && !SaveSystem.hasSave();
  }

  function start() {
    if (!shouldStart()) return;

    // Pause the game clock during tutorial
    TimeSystem.pause();

    // Create overlay elements
    _$overlay = $('<div id="tutorial-overlay" class="active"></div>');
    const $dim = $('<div id="tutorial-dim"></div>');
    _$ring = $('<div class="tutorial-highlight-ring" style="display:none;"></div>');
    _$tooltip = $('<div id="tutorial-tooltip"></div>');

    _$overlay.append($dim, _$ring, _$tooltip);
    $('body').append(_$overlay);

    _currentStep = 0;
    renderStep();
  }

  function renderStep() {
    if (_currentStep >= STEPS.length) {
      finish();
      return;
    }

    const step = STEPS[_currentStep];

    // Build tooltip HTML
    const isLast = _currentStep === STEPS.length - 1;
    const tooltipHtml = `
      <div class="tutorial-avatar">
        <div class="avatar-icon">🤖</div>
        <div>
          <div class="avatar-name">RAI FEU</div>
          <div class="avatar-subtitle">YAPAY ZEKA REHBERİ</div>
        </div>
      </div>
      <div class="tutorial-content">
        <div class="tut-title">${step.title}</div>
        <div class="tut-body">${step.body}</div>
      </div>
      <div class="tutorial-nav">
        <span class="tut-step-count">${_currentStep + 1} / ${STEPS.length}</span>
        <div class="tut-buttons">
          <button class="tut-btn tut-btn-skip" id="tut-skip">Atla</button>
          <button class="tut-btn tut-btn-next" id="tut-next">${isLast ? 'Başla!' : 'Devam →'}</button>
        </div>
      </div>
    `;

    _$tooltip.html(tooltipHtml);

    // Bind button events
    _$tooltip.find('#tut-next').on('click', function () {
      _currentStep++;
      renderStep();
    });

    _$tooltip.find('#tut-skip').on('click', function () {
      finish();
    });

    // Position tooltip and highlight target
    if (step.target) {
      const $target = $(step.target);
      if ($target.length) {
        highlightElement($target, step.position);
      } else {
        positionCenter();
        hideHighlight();
      }
    } else {
      positionCenter();
      hideHighlight();
    }
  }

  function highlightElement($target, position) {
    const rect = $target[0].getBoundingClientRect();
    const padding = 6;

    // Position the highlight ring
    _$ring.css({
      display: 'block',
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Create clip-path to cut out the target area from the dimming layer
    const insetTop = rect.top - padding;
    const insetLeft = rect.left - padding;
    const insetBottom = window.innerHeight - rect.bottom - padding;
    const insetRight = window.innerWidth - rect.right - padding;

    // Using polygon cutout for the dim layer is complex, so we use a simpler approach:
    // Just lower the opacity near the target and rely on the ring to draw attention
    $('#tutorial-dim').css('background', 'rgba(0, 0, 0, 0.7)');

    // Position tooltip relative to target
    const tooltipW = 380;
    const tooltipH = _$tooltip.outerHeight() || 300;
    let top, left;

    switch (position) {
      case 'above':
        top = rect.top - tooltipH - 20;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      case 'above-right':
        top = rect.top - tooltipH - 20;
        left = rect.left;
        break;
      case 'above-left':
        top = rect.top - tooltipH - 20;
        left = rect.right - tooltipW;
        break;
      case 'below':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - tooltipW / 2;
        break;
      default:
        top = rect.top - tooltipH - 20;
        left = rect.left + rect.width / 2 - tooltipW / 2;
    }

    // Viewport içinde tut — tooltip ekran dışına taşmasın
    const tooltipH2 = _$tooltip.outerHeight() || 300;
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipH2 - 10));
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipW - 10));
    // Sol kenardan çıkmasını engelle
    if (left < 10) left = 10;

    _$tooltip.css({
      top: top,
      left: left,
      animation: 'none',
    });

    // Re-trigger animation
    requestAnimationFrame(function () {
      _$tooltip.css('animation', 'tutorialIn 0.35s ease');
    });
  }

  function positionCenter() {
    const tooltipW = 380;

    _$tooltip.css({
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      animation: 'none',
    });

    requestAnimationFrame(function () {
      _$tooltip.css('animation', 'tutorialIn 0.35s ease');
    });
  }

  function hideHighlight() {
    _$ring.css('display', 'none');
    $('#tutorial-dim').css('background', 'rgba(0, 0, 0, 0.7)');
  }

  function finish() {
    // Mark tutorial as complete
    GameState.set('tutorialComplete', true);

    // Resume game clock
    TimeSystem.resume();

    // Remove overlay with fade
    if (_$overlay) {
      _$overlay.css('transition', 'opacity 0.3s ease');
      _$overlay.css('opacity', '0');
      setTimeout(function () {
        _$overlay.remove();
        _$overlay = null;
        _$tooltip = null;
        _$ring = null;
      }, 300);
    }

    // Show welcome notification
    Taskbar.showNotification('🤖 RAI FEU', 'Eğitim tamamlandı. İyi şanslar, operatör.');
  }

  return {
    start,
    shouldStart,
  };
})();
