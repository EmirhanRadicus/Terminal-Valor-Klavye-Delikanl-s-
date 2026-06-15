const TerminalApp = (function () {
  let _cmdHistory = [];
  let _cmdHistoryIndex = -1;
  let _acSelectedIndex = -1;
  let _acItems = [];
  let _$terminalWindow = null;
  const BANNER = [
    '╔═══════════════════════════════════════════╗',
    '║    ██╗  ██╗ █████╗  ██████╗██╗  ██╗      ║',
    '║    ██║  ██║██╔══██╗██╔════╝██║ ██╔╝      ║',
    '║    ███████║███████║██║     █████╔╝        ║',
    '║    ██╔══██║██╔══██║██║     ██╔═██╗        ║',
    '║    ██║  ██║██║  ██║╚██████╗██║  ██╗       ║',
    '║    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝    ║',
    '╠═══════════════════════════════════════════╣',
    '║  ShadowOS v3.1.7 — Komut satırı arayüzü  ║',
    '║  "help" yazarak komutları listeleyin.      ║',
    '╚═══════════════════════════════════════════╝',
    '',
  ].join('\n');
  function getCommandDefs() {
    const targets = Object.keys(BrowserApp.SITE_REGISTRY);
    const defs = [
      { cmd: 'help', desc: 'Komutları listele', type: 'sistem' },
      { cmd: 'clear', desc: 'Ekranı temizle', type: 'sistem' },
      { cmd: 'status', desc: 'Durum bilgisi', type: 'sistem' },
      { cmd: 'balance', desc: 'Bakiye göster', type: 'sistem' },
      { cmd: 'targets', desc: 'Hedef listesi', type: 'sistem' },
      { cmd: 'skills', desc: 'Yetenek listesi', type: 'sistem' },
      { cmd: 'history', desc: 'Saldırı geçmişi', type: 'sistem' },
      { cmd: 'date', desc: 'Tarih ve saat', type: 'sistem' },
      { cmd: 'whoami', desc: 'Kullanıcı bilgisi', type: 'sistem' },
      { cmd: 'pwd', desc: 'Dizin yolu', type: 'sistem' },
      { cmd: 'ls', desc: 'Dosyaları listele', type: 'sistem' },
      { cmd: 'sleep', desc: 'Uyu (gün geç)', type: 'aksiyon' },
      { cmd: 'wipe-logs', desc: 'Logları sil (şüphe azalt)', type: 'aksiyon' },
      { cmd: 'settings', desc: 'Ayarlar', type: 'sistem' },
    ];
    defs.push({ cmd: 'goto cafe', desc: 'Kafeye git', type: 'konum' });
    defs.push({ cmd: 'goto home', desc: 'Eve dön', type: 'konum' });
    targets.forEach(function (t) {
      defs.push({ cmd: 'scan ' + t, desc: 'Hedefi tara', type: 'saldırı' });
      defs.push({ cmd: 'connect ' + t, desc: 'Hedefe bağlan', type: 'saldırı' });
    });
    var attacks = HackEngine.ATTACKS;
    Object.keys(attacks).forEach(function (aId) {
      var atk = attacks[aId];
      var missingSkills = atk.requiredSkills.filter(function (s) { return !GameState.hasSkill(s); });
      if (missingSkills.length === 0) {
        targets.forEach(function (t) {
          defs.push({ cmd: 'exploit ' + aId + ' ' + t, desc: atk.name + ' saldırısı', type: 'saldırı' });
        });
      }
    });
    defs.push({ cmd: 'wallpaper', desc: 'Arkaplan değiştir', type: 'sistem' });
    return defs;
  }
  function open() {
    const contentHtml = `
      <div class="terminal-container">
        <div class="terminal-output" id="terminal-output"></div>
        <div class="terminal-input-line">
          <div class="term-autocomplete" id="term-autocomplete"></div>
          <span class="term-prompt">
            <span class="prompt-user">root</span><span class="prompt-at">@</span><span class="prompt-host">shadow</span><span class="prompt-colon">:</span><span class="prompt-path">~</span><span class="prompt-symbol">$ </span>
          </span>
          <input type="text" id="terminal-input" placeholder="komut girin..." autocomplete="off" spellcheck="false">
        </div>
      </div>
    `;
    WindowManager.open('terminal', 'Terminal', '💻', contentHtml, {
      width: 750,
      height: 480,
      onInit: function ($window) {
        _$terminalWindow = $window;
        bindEvents($window);
        printBanner();
      },
    });
  }
  function bindEvents($window) {
    $window.find('#terminal-input').on('keydown', function (e) {
      if (typeof HackPhases !== 'undefined' && HackPhases.isActive()) {
        if (e.key === 'Enter') {
          const val = $(this).val();
          $(this).val('');
          HackPhases.handleInput(val);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
        }
        return;
      }
      if (typeof HackEngine !== 'undefined' && HackEngine.isInteractiveActive()) {
        if (e.key === 'Enter') {
          const val = $(this).val();
          $(this).val('');
          HackEngine.handleInteractiveInput(val);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
        }
        return;
      }
      var $ac = $('#term-autocomplete');
      var isAcVisible = $ac.hasClass('visible');
      if (e.key === 'Enter') {
        if (isAcVisible && _acSelectedIndex >= 0 && _acItems[_acSelectedIndex]) {
          $(this).val(_acItems[_acSelectedIndex].cmd + ' ');
          hideAutocomplete();
          e.preventDefault();
          return;
        }
        hideAutocomplete();
        const cmd = $(this).val().trim();
        $(this).val('');
        if (cmd) {
          _cmdHistory.push(cmd);
          _cmdHistoryIndex = _cmdHistory.length;
          processCommand(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        if (isAcVisible) {
          e.preventDefault();
          _acSelectedIndex = Math.max(0, _acSelectedIndex - 1);
          highlightAcItem();
          return;
        }
        e.preventDefault();
        if (_cmdHistoryIndex > 0) {
          _cmdHistoryIndex--;
          $(this).val(_cmdHistory[_cmdHistoryIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        if (isAcVisible) {
          e.preventDefault();
          _acSelectedIndex = Math.min(_acItems.length - 1, _acSelectedIndex + 1);
          highlightAcItem();
          return;
        }
        e.preventDefault();
        if (_cmdHistoryIndex < _cmdHistory.length - 1) {
          _cmdHistoryIndex++;
          $(this).val(_cmdHistory[_cmdHistoryIndex]);
        } else {
          _cmdHistoryIndex = _cmdHistory.length;
          $(this).val('');
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (isAcVisible && _acItems.length > 0) {
          var idx = _acSelectedIndex >= 0 ? _acSelectedIndex : 0;
          $(this).val(_acItems[idx].cmd + ' ');
          hideAutocomplete();
        }
      } else if (e.key === 'Escape') {
        hideAutocomplete();
      }
    });
    $window.find('#terminal-input').on('input', function () {
      if (typeof HackPhases !== 'undefined' && HackPhases.isActive()) {
        return;
      }
      if (typeof HackEngine !== 'undefined' && HackEngine.isInteractiveActive()) {
        return;
      }
      var val = $(this).val().trim().toLowerCase();
      if (val.length < 1) { hideAutocomplete(); return; }
      showAutocomplete(val);
    });
    $window.find('.terminal-container').on('click', function () {
      $window.find('#terminal-input').focus();
    });
    $(document).off('click.termAc').on('click.termAc', '.term-ac-item', function () {
      var cmd = $(this).data('cmd');
      $('#terminal-input').val(cmd + ' ').focus();
      hideAutocomplete();
    });
  }
  function showAutocomplete(val) {
    var defs = getCommandDefs();
    var matches = defs.filter(function (d) {
      return d.cmd.startsWith(val) && d.cmd !== val;
    });
    matches = matches.slice(0, 8);
    _acItems = matches;
    if (matches.length === 0) { hideAutocomplete(); return; }
    var html = '';
    matches.forEach(function (m, i) {
      var highlighted = '<span class="ac-match">' + m.cmd.substring(0, val.length) + '</span>' + m.cmd.substring(val.length);
      html += '<div class="term-ac-item' + (i === _acSelectedIndex ? ' selected' : '') + '" data-cmd="' + m.cmd + '" data-index="' + i + '">' +
        '<span class="ac-cmd">' + highlighted + '</span>' +
        '<span class="ac-desc">' + m.desc + '</span>' +
        '<span class="ac-type">' + m.type + '</span>' +
        '</div>';
    });
    var $ac = $('#term-autocomplete');
    $ac.html(html).addClass('visible');
    _acSelectedIndex = -1;
  }
  function hideAutocomplete() {
    $('#term-autocomplete').removeClass('visible').empty();
    _acItems = [];
    _acSelectedIndex = -1;
  }
  function highlightAcItem() {
    var $items = $('#term-autocomplete .term-ac-item');
    $items.removeClass('selected');
    if (_acSelectedIndex >= 0 && _acSelectedIndex < $items.length) {
      $items.eq(_acSelectedIndex).addClass('selected');
    }
  }
  function printBanner() {
    printOutput(BANNER, 'cmd-system');
  }
  function processCommand(cmd) {
    printInput(cmd);
    const parts = cmd.toLowerCase().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    switch (command) {
      case 'help': cmdHelp(); break;
      case 'clear': cmdClear(); break;
      case 'status': cmdStatus(); break;
      case 'scan': cmdScan(args); break;
      case 'exploit': cmdExploit(args); break;
      case 'nmap': cmdScan(args); break;
      case 'connect': cmdConnect(args); break;
      case 'sleep': cmdSleep(); break;
      case 'goto': cmdGoto(args); break;
      case 'wipe-logs': case 'wipelogs': cmdWipeLogs(); break;
      case 'whoami': printOutput('root', 'cmd-success'); break;
      case 'pwd': printOutput('/root/shadow', 'cmd-output'); break;
      case 'ls': printOutput('exploit/  payloads/  logs/  targets.db  notes.txt', 'cmd-output'); break;
      case 'date': printOutput(GameState.getTimeString() + ' — Gün ' + GameState.get('day'), 'cmd-output'); break;
      case 'balance': case 'cüzdan': printOutput('Bakiye: ₿' + GameState.get('money'), 'cmd-info'); break;
      case 'skills': cmdSkills(); break;
      case 'targets': cmdTargets(); break;
      case 'history': cmdHistory(); break;
      case 'wallpaper': cmdWallpaper(args); break;
      case 'settings': SettingsApp.open(); break;
      default: printOutput('Bilinmeyen komut: ' + command + '. "help" yazın.', 'cmd-error');
    }
  }
  function cmdHelp() {
    const helpText = [
      '<span class="cmd-info">═══ KOMUT LİSTESİ ═══</span>',
      '',
      '<span class="cmd-success">Temel Komutlar:</span>',
      '  help          Komutları listele',
      '  clear         Ekranı temizle',
      '  status        Durum bilgisini göster',
      '  balance       Bakiye göster',
      '  targets       Hedef listesi',
      '  skills        Yetenek listesi',
      '  history       Saldırı geçmişi',
      '  date          Tarih ve saat',
      '',
      '<span class="cmd-success">Saldırı Komutları:</span>',
      '  scan &lt;hedef&gt;  Hedefi tara (ör: scan hedefbank.com.tr)',
      '  exploit &lt;tür&gt; &lt;hedef&gt;  Saldırı başlat',
      '      Türler: sqli, xss, rddos, credential-stuffing,',
      '              db-ransom, cve, phishing, bola, dir-traversal,',
      '              dependency-confusion, double-extortion,',
      '              supply-chain, zero-day, apt, kernel-rootkit',
      '',
      '<span class="cmd-success">Sistem Komutları:</span>',
      '  sleep         Uyu (gün geç)',
      '  goto &lt;konum&gt;  Konum değiştir (cafe / home)',
      '  wipe-logs     Logları sil (şüphe azalt)',
      '  connect &lt;ip&gt;  Hedefe bağlan',
      '  wallpaper &lt;url&gt; Masaüstü arkaplanını değiştir',
      '  settings      Ayarlar penceresini aç',
      '',
    ].join('\n');
    printOutput(helpText, '', true);
  }
  function cmdClear() { $('#terminal-output').empty(); }
  function cmdStatus() {
    const s = GameState.get();
    const lines = [
      '<span class="cmd-info">═══ DURUM BİLGİSİ ═══</span>',
      '',
      '  Saat:      ' + GameState.getTimeString(),
      '  Gün:       ' + s.day + ' (' + s.dayName + ')',
      '  Konum:     ' + (s.location === 'home' ? '🏠 Ev' : '☕ Kafe'),
      '  Bakiye:    ₿' + s.money,
      '  Şüphe:     <span class="' + getSuspicionClass(s.suspicion) + '">' + s.suspicion + '%</span>',
      '  Yetenekler: ' + s.skills.length + ' açık',
      '  Görevler:  ' + s.completedMissions.length + ' tamamlandı',
      '',
    ].join('\n');
    printOutput(lines, '', true);
  }
  function cmdScan(args) {
    if (!args.length) {
      printOutput('Kullanım: scan <hedef>', 'cmd-error');
      printOutput('Örnek: scan hedefbank.com.tr', 'cmd-output');
      return;
    }
    const target = args[0];
    const site = Object.keys(BrowserApp.SITE_REGISTRY).find(d => target.includes(d));
    if (!site) { printOutput('Hedef bulunamadı: ' + target, 'cmd-error'); return; }
    TimeSystem.advanceTime(15);
    printOutput('[*] Hedef taranıyor: ' + target + '...', 'cmd-warning');
    const profile = HackEngine.SITE_PROFILES[site] || { firewall: 'Low', vulnerabilities: ['sqli', 'rddos', 'xss'] };
    const scanSteps = [
      { text: '[+] Port tarama başlatıldı...', delay: 400 },
      { text: '    22/tcp   open  ssh', delay: 200 },
      { text: '    80/tcp   open  http', delay: 200 },
      { text: '    443/tcp  open  https', delay: 200 },
      { text: '    3306/tcp open  mysql', delay: 200 },
      { text: '    8080/tcp open  http-proxy', delay: 200 },
      { text: '[+] Güvenlik Duvarı Derecesi: ' + profile.firewall, delay: 400 },
      { text: '[!] Potansiyel zafiyet vektörleri tespit edildi:', delay: 500 }
    ];
    profile.vulnerabilities.forEach(function (v) {
      const atk = HackEngine.getAttack(v);
      if (atk) {
        scanSteps.push({ text: '    • ' + atk.id.toUpperCase() + ': ' + atk.description, delay: 200 });
      }
    });
    scanSteps.push({ text: '', delay: 100 });
    scanSteps.push({ text: '[✓] Tarama başarıyla tamamlandı. Hedef zafiyet profili kaydedildi. 15 dakika geçti.', delay: 0, cls: 'cmd-success' });
    let totalDelay = 600;
    scanSteps.forEach(function (step) {
      totalDelay += step.delay;
      setTimeout(function () { printOutput(step.text, step.cls || 'cmd-output'); }, totalDelay);
    });
    setTimeout(function () {
      const scanned = GameState.get('scannedTargets') || {};
      scanned[site] = true;
      GameState.set('scannedTargets', scanned);
    }, totalDelay);
  }
  function cmdExploit(args) {
    if (args.length < 2) {
      printOutput('Kullanım: exploit <tür> <hedef>', 'cmd-error');
      printOutput('Örnek: exploit sqli hedefbank.com.tr', 'cmd-output');
      return;
    }
    HackEngine.executeAttack(args[0], args[1]);
  }
  function cmdConnect(args) {
    if (!args.length) { printOutput('Kullanım: connect <hedef>', 'cmd-error'); return; }
    const target = args[0];
    const site = Object.keys(BrowserApp.SITE_REGISTRY).find(d => target.includes(d));
    if (!site) { printOutput('Bağlantı başarısız: ' + target + ' — hedef bulunamadı.', 'cmd-error'); return; }
    printOutput('[*] ' + target + ' hedefine bağlanılıyor...', 'cmd-warning');
    setTimeout(function () {
      printOutput('[✓] Bağlantı kuruldu. Tarayıcıda açılıyor...', 'cmd-success');
      BrowserApp.open();
      setTimeout(() => BrowserApp.navigate(target), 300);
    }, 800);
  }
  function cmdSleep() {
    printOutput('[*] Uykuya geçiliyor...', 'cmd-system');
    setTimeout(function () { $(document).trigger('game:requestSleep'); }, 500);
  }
  function cmdGoto(args) {
    if (!args.length) {
      printOutput('Kullanım: goto <konum>', 'cmd-error');
      printOutput('Konumlar: home (ev), cafe (kafe)', 'cmd-output');
      return;
    }
    const target = args[0];
    let result;
    if (target === 'cafe' || target === 'kafe') { result = LocationSystem.switchLocation('cafe'); }
    else if (target === 'home' || target === 'ev') { result = LocationSystem.switchLocation('home'); }
    else { printOutput('Bilinmeyen konum: ' + target, 'cmd-error'); return; }
    if (result.success) { printOutput('[*] ' + result.message, 'cmd-warning'); }
    else { printOutput('[!] ' + result.message, 'cmd-error'); }
  }
  function cmdWipeLogs() {
    if (GameState.hasSkill('log-wiper')) {
      startLogWiperMiniGame();
    } else {
      printOutput('[*] Loglar siliniyor...', 'cmd-warning');
      TimeSystem.advanceTime(10);
      setTimeout(function () {
        const reduction = 8;
        SuspicionSystem.reduceSuspicion(reduction);
        printOutput('[✓] Loglar silindi. Şüphe -' + reduction + '%. (10 dakika geçti)', 'cmd-success');
      }, 1200);
    }
  }
  function startLogWiperMiniGame() {
    const commands = [
      'rm -rf /var/log/auth.log',
      'shred -u /var/log/syslog',
      'echo "" > /var/log/access.log',
      'history -c && history -w',
    ];
    const targetCmd = commands[Math.floor(Math.random() * commands.length)];
    printOutput('', '');
    printOutput('╔═══════════════════════════════════════╗', 'cmd-warning');
    printOutput('║    LOG SİLME — 10 SANİYE SÜRENİZ VAR  ║', 'cmd-warning');
    printOutput('╠═══════════════════════════════════════╣', 'cmd-warning');
    printOutput('║  Aşağıdaki komutu tam olarak yazın:    ║', 'cmd-warning');
    printOutput('╚═══════════════════════════════════════╝', 'cmd-warning');
    printOutput('', '');
    printOutput('  → ' + targetCmd, 'cmd-info');
    printOutput('', '');
    window._logWiperTarget = targetCmd;
    window._logWiperTimeout = setTimeout(function () {
      window._logWiperTarget = null;
      printOutput('[✗] Süre doldu! Log silme başarısız.', 'cmd-error');
      printOutput('[!] Şüphe arttı!', 'cmd-error');
      GameState.addSuspicion(5);
    }, 10000);
    const $input = $('#terminal-input');
    $input.off('keydown').on('keydown', function (e) {
      if (e.key === 'Enter') {
        const typed = $(this).val().trim();
        $(this).val('');
        clearTimeout(window._logWiperTimeout);
        if (typed === window._logWiperTarget) {
          printOutput('[✓] Loglar başarıyla silindi! Şüphe -15%', 'cmd-success');
          SuspicionSystem.reduceSuspicion(15);
        } else {
          printOutput('[✗] Yanlış komut! Log silme başarısız.', 'cmd-error');
          GameState.addSuspicion(3);
        }
        window._logWiperTarget = null;
        $input.off('keydown');
        if (_$terminalWindow && _$terminalWindow.length) {
          bindEvents(_$terminalWindow);
        } else {
          bindEvents($('#window-terminal'));
        }
      }
    });
  }
  function cmdSkills() {
    const skills = GameState.get('skills');
    if (skills.length === 0) {
      printOutput('Hiçbir yetenek açılmamış. Yetenek ağacını kontrol edin.', 'cmd-output');
    } else {
      printOutput('<span class="cmd-info">Açık Yetenekler:</span>', '', true);
      skills.forEach(function (s) { printOutput('  ✓ ' + s, 'cmd-success'); });
    }
    printOutput('  Yetenek Puanı: ' + GameState.get('skillPoints'), 'cmd-info');
  }
  function cmdTargets() {
    printOutput('<span class="cmd-info">═══ HEDEF LİSTESİ ═══</span>', '', true);
    Object.keys(BrowserApp.SITE_REGISTRY).forEach(function (domain) {
      const site = BrowserApp.SITE_REGISTRY[domain];
      printOutput('  ' + site.icon + ' ' + domain + ' — ' + site.title, 'cmd-output');
    });
  }
  function cmdHistory() {
    const history = GameState.get('hackHistory');
    if (history.length === 0) { printOutput('Henüz saldırı geçmişi yok.', 'cmd-output'); return; }
    printOutput('<span class="cmd-info">═══ SALDIRI GEÇMİŞİ ═══</span>', '', true);
    history.forEach(function (h) {
      const statusIcon = h.success ? '✓' : '✗';
      const statusCls = h.success ? 'cmd-success' : 'cmd-error';
      printOutput('  [' + statusIcon + '] ' + h.type + ' → ' + h.target + ' (Gün ' + h.day + ')', statusCls);
    });
  }
  function cmdWallpaper(args) {
    if (!args.length) {
      const current = GameState.get('desktopWallpaper') || 'yok';
      printOutput('<span class="cmd-info">Masaüstü Arkaplanı</span>', '', true);
      printOutput('  Mevcut: ' + current, 'cmd-output');
      printOutput('  Kullanım: wallpaper <url>', 'cmd-output');
      printOutput('  Sıfırla:  wallpaper reset', 'cmd-output');
      return;
    }
    const input = args.join(' ');
    if (input === 'reset' || input === 'sıfırla') {
      SettingsApp.applyWallpaper('https://placekitten.com/1920/1080');
      printOutput('[✓] Arkaplan varsayılana sıfırlandı.', 'cmd-success');
    } else {
      SettingsApp.applyWallpaper(input);
      printOutput('[✓] Arkaplan güncellendi: ' + input, 'cmd-success');
    }
  }
  function printOutput(text, cls, isHtml) {
    const $output = $('#terminal-output');
    if (!$output.length) return;
    const $line = $('<div>').addClass('term-line');
    if (cls) $line.addClass(cls);
    if (isHtml) { $line.html(text); } else { $line.text(text); }
    $output.append($line);
    $output.scrollTop($output[0].scrollHeight);
  }
  function printInput(cmd) {
    const $output = $('#terminal-output');
    if (!$output.length) return;
    const $line = $('<div>').addClass('term-line cmd-input');
    $line.html(
      '<span class="term-prompt">' +
      '<span class="prompt-user">root</span>' +
      '<span class="prompt-at">@</span>' +
      '<span class="prompt-host">shadow</span>' +
      '<span class="prompt-colon">:</span>' +
      '<span class="prompt-path">~</span>' +
      '<span class="prompt-symbol">$ </span>' +
      '</span>' + escapeHtml(cmd)
    );
    $output.append($line);
    $output.scrollTop($output[0].scrollHeight);
  }
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function getSuspicionClass(val) {
    if (val >= 75) return 'cmd-error';
    if (val >= 50) return 'cmd-warning';
    return 'cmd-success';
  }
  return {
    open,
    printOutput,
    printInput,
  };
})();
