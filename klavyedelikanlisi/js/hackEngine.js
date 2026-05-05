/* ============================================
   HACK ENGINE — Attack vector execution
   ============================================ */
const HackEngine = (function () {
  // All 15 attack types across 3 tiers
  const ATTACKS = {
    // === TIER 1: Noisy / Beginner (Multiplier = 5) ===
    'rddos': {
      id: 'rddos', name: 'RDDoS', tier: 1, multiplier: 5,
      timeCost: 30, baseSuccessRate: 70, reward: 15,
      requiredSkills: [],
      description: 'DDoS saldırısı ile fidye talep et.',
      successMsg: 'DDoS saldırısı başarılı! Hedef çöktü. Fidye notu bırakıldı:\n"Sitenin tekrar erişilebilir olmasını istiyorsan ödeme yap."',
      failMsg: 'DDoS saldırısı engellendi! CloudFlare koruması aktif.',
    },
    'db-ransom': {
      id: 'db-ransom', name: 'DB-Ransom', tier: 1, multiplier: 5,
      timeCost: 45, baseSuccessRate: 60, reward: 20,
      requiredSkills: [],
      description: 'Korumasız MongoDB/Elasticsearch bul, verileri sil, fidye bırak.',
      successMsg: 'Veritabanı ele geçirildi! Veriler silindi, fidye notu bırakıldı.',
      failMsg: 'Veritabanı korumalı. Erişim reddedildi.',
    },
    'credential-stuffing': {
      id: 'credential-stuffing', name: 'Credential Stuffing', tier: 1, multiplier: 5,
      timeCost: 40, baseSuccessRate: 55, reward: 10,
      requiredSkills: [],
      description: 'Sızdırılmış parola listesiyle admin paneline giriş dene.',
      successMsg: 'Admin paneline giriş başarılı! Site defacement uygulandı.',
      failMsg: 'Brute-force engellendi. Rate-limiting aktif.',
    },
    'sqli': {
      id: 'sqli', name: 'SQL Injection', tier: 1, multiplier: 5,
      timeCost: 35, baseSuccessRate: 65, reward: 18,
      requiredSkills: [],
      description: 'Form alanlarından SQL enjeksiyonu ile veritabanına eriş.',
      successMsg: 'SQLi başarılı! Veritabanı dump edildi.\nKVKK ihlali tehdidi ile fidye talep edildi.',
      failMsg: 'Prepared statements kullanılıyor. SQLi başarısız.',
    },
    'cve': {
      id: 'cve', name: 'CVE Exploitation', tier: 1, multiplier: 5,
      timeCost: 25, baseSuccessRate: 75, reward: 12,
      requiredSkills: [],
      description: 'Güncel olmayan CMS eklentilerindeki bilinen zafiyetleri kullan.',
      successMsg: 'CVE-2021-44228 (Log4j) exploit başarılı! Uzak kod çalıştırma sağlandı.',
      failMsg: 'Hedef güncelleme yapmış. CVE kapatılmış.',
    },

    // === TIER 2: Silent / Intermediate (Multiplier = 2) ===
    'xss': {
      id: 'xss', name: 'XSS Hijacking', tier: 2, multiplier: 2,
      timeCost: 40, baseSuccessRate: 60, reward: 25,
      requiredSkills: [],
      description: 'JavaScript enjeksiyonu ile admin cookie çal, dosyaları kilitle.',
      successMsg: 'XSS payload çalıştı! Admin session cookie ele geçirildi.\nDosyalar şifrelendi.',
      failMsg: 'CSP (Content Security Policy) engelledi. XSS başarısız.',
    },
    'phishing': {
      id: 'phishing', name: 'Spear Phishing', tier: 2, multiplier: 2,
      timeCost: 60, baseSuccessRate: 50, reward: 30,
      requiredSkills: ['custom-phishing'],
      description: 'Sosyal mühendislik ile hedefli phishing saldırısı. Firewall bypass.',
      successMsg: 'Phishing başarılı! Backdoor yerleştirildi. Dış güvenlik duvarı aşıldı.',
      failMsg: 'Hedef şüphelendi. Phishing e-postası rapor edildi!',
    },
    'bola': {
      id: 'bola', name: 'BOLA/IDOR', tier: 2, multiplier: 2,
      timeCost: 30, baseSuccessRate: 70, reward: 22,
      requiredSkills: [],
      description: 'API URL ID değerlerini değiştirerek kullanıcı verilerini topla.',
      successMsg: 'IDOR zafiyeti bulundu! 50.000 kullanıcı verisi toplandı.',
      failMsg: 'API yetkilendirmesi doğru yapılmış. IDOR yok.',
    },
    'dir-traversal': {
      id: 'dir-traversal', name: 'Directory Traversal', tier: 2, multiplier: 2,
      timeCost: 25, baseSuccessRate: 65, reward: 20,
      requiredSkills: [],
      description: 'Dizin gezinme ile .env dosyaları ve kaynak kodları çal.',
      successMsg: 'Directory traversal başarılı!\n.env dosyası bulundu: DB_PASSWORD=admin123\nKaynak kodlar indirildi.',
      failMsg: 'Dizin erişimi engellenmiş. Traversal başarısız.',
    },
    'dependency-confusion': {
      id: 'dependency-confusion', name: 'Dependency Confusion', tier: 2, multiplier: 2,
      timeCost: 50, baseSuccessRate: 45, reward: 35,
      requiredSkills: ['payload-builder'],
      description: 'İç paket deposuna zararlı paket yükle.',
      successMsg: 'Zararlı paket yüklendi! İç sistemlere erişim sağlandı.',
      failMsg: 'Paket doğrulaması başarısız. Saldırı tespit edildi.',
    },

    // === TIER 3: Destructive / Advanced (Multiplier = 1) ===
    'double-extortion': {
      id: 'double-extortion', name: 'Double Extortion', tier: 3, multiplier: 1,
      timeCost: 90, baseSuccessRate: 40, reward: 80,
      requiredSkills: ['c2-ransomware'],
      description: 'Verileri sızdır, ağı şifrele. "Para ver ya da verilerini karanlık ağda sızdırırım."',
      successMsg: 'Çifte şantaj başarılı!\nVeriler sızdırıldı, ağ şifrelendi.\n"Para ver ya da verilerini karanlık ağda sızdırırım."',
      failMsg: 'Yedeklerden kurtarma yapıldı. Fidye ödenmedi.',
    },
    'supply-chain': {
      id: 'supply-chain', name: 'Supply Chain', tier: 3, multiplier: 1,
      timeCost: 120, baseSuccessRate: 35, reward: 100,
      requiredSkills: ['payload-builder'],
      description: 'Tedarikçi güncellemelerini enfekte et. (SolarWinds tarzı) Sıfır gürültü.',
      successMsg: 'Supply chain saldırısı başarılı! Güncelleme sunucusu ele geçirildi.\nBinlerce sisteme erişim sağlandı. Sıfır alarm.',
      failMsg: 'İmza doğrulaması saldırıyı engelledi.',
    },
    'zero-day': {
      id: 'zero-day', name: 'Zero-Day', tier: 3, multiplier: 1,
      timeCost: 60, baseSuccessRate: 55, reward: 90,
      requiredSkills: ['zero-day-hunter'],
      description: 'Yamanmamış zafiyet. Alarm tetiklemez.',
      successMsg: 'Zero-day exploit çalıştı! Tam sistem erişimi sağlandı.\nHiçbir alarm tetiklenmedi.',
      failMsg: 'Exploit çalışmadı. Hedef mimarisi uyumsuz.',
    },
    'apt': {
      id: 'apt', name: 'APT (Advanced Persistent Threat)', tier: 3, multiplier: 1,
      timeCost: 180, baseSuccessRate: 30, reward: 150,
      requiredSkills: ['proxy-chaining', 'payload-builder'],
      description: 'Ağı sessizce haritala, yedekleri yok et, son payload çalıştır.',
      successMsg: 'APT operasyonu tamamlandı!\nAğ haritası çıkarıldı → Yedekler silindi → Payload çalıştırıldı.\nTam kontrol sağlandı.',
      failMsg: 'IDS anomali tespit etti. Bağlantı kesildi.',
    },
    'kernel-rootkit': {
      id: 'kernel-rootkit', name: 'Kernel Rootkit', tier: 3, multiplier: 1,
      timeCost: 150, baseSuccessRate: 25, reward: 200,
      requiredSkills: ['zero-day-hunter', 'payload-builder'],
      description: 'İşletim sistemi seviyeli ele geçirme. Antivirüs atlatma. Kalıcı kontrol.',
      successMsg: 'Kernel rootkit yerleştirildi!\nOS seviyesinde tam kontrol. Antivirüs atlatıldı.\nKalıcı erişim sağlandı.',
      failMsg: 'Secure Boot rootkit\'i engelledi. Kernel erişimi başarısız.',
    },
  };

  function executeAttack(attackType, target) {
    const attack = ATTACKS[attackType];

    if (!attack) {
      TerminalApp.printOutput('[!] Bilinmeyen saldırı türü: ' + attackType, 'cmd-error');
      TerminalApp.printOutput('    "help" yazarak mevcut türleri görebilirsiniz.', 'cmd-output');
      return;
    }

    // Check target
    const site = Object.keys(BrowserApp.SITE_REGISTRY).find(d => target && target.includes(d));
    if (!site) {
      TerminalApp.printOutput('[!] Geçersiz hedef: ' + (target || 'belirtilmedi'), 'cmd-error');
      TerminalApp.printOutput('    "targets" yazarak hedef listesini görebilirsiniz.', 'cmd-output');
      return;
    }

    // Check required skills
    const missingSkills = attack.requiredSkills.filter(s => !GameState.hasSkill(s));
    if (missingSkills.length > 0) {
      TerminalApp.printOutput('[!] Bu saldırı için gerekli yetenekler eksik:', 'cmd-error');
      missingSkills.forEach(function (s) {
        TerminalApp.printOutput('    ✗ ' + s, 'cmd-error');
      });
      TerminalApp.printOutput('    Yetenek ağacını kontrol edin.', 'cmd-output');
      return;
    }

    // Execute
    TerminalApp.printOutput('', '');
    TerminalApp.printOutput('╔═══════════════════════════════════════════╗', 'cmd-warning');
    TerminalApp.printOutput('║  SALDIRI BAŞLATILIYOR: ' + attack.name.padEnd(20) + '║', 'cmd-warning');
    TerminalApp.printOutput('╠═══════════════════════════════════════════╣', 'cmd-warning');
    TerminalApp.printOutput('║  Hedef: ' + site.padEnd(33) + '║', 'cmd-warning');
    TerminalApp.printOutput('║  Tier:  ' + attack.tier + ' | Çarpan: x' + attack.multiplier + '                       ║'.substring(0, 33 - String(attack.tier).length) + '║', 'cmd-warning');
    TerminalApp.printOutput('╚═══════════════════════════════════════════╝', 'cmd-warning');

    // Consume time
    TimeSystem.advanceTime(attack.timeCost);

    // Simulate attack steps
    const steps = generateAttackSteps(attack);
    let totalDelay = 500;

    steps.forEach(function (step, i) {
      totalDelay += step.delay;
      setTimeout(function () {
        TerminalApp.printOutput(step.text, step.cls || 'cmd-output');
      }, totalDelay);
    });

    // Calculate result
    totalDelay += 800;
    setTimeout(function () {
      const success = calculateSuccess(attack);

      TerminalApp.printOutput('', '');

      if (success) {
        TerminalApp.printOutput('[✓] SALDIRI BAŞARILI!', 'cmd-success');
        TerminalApp.printOutput('', '');
        attack.successMsg.split('\n').forEach(function (line) {
          TerminalApp.printOutput('  ' + line, 'cmd-success');
        });
        TerminalApp.printOutput('', '');
        TerminalApp.printOutput('  💰 Kazanç: ₿' + attack.reward, 'cmd-info');
        TerminalApp.printOutput('  ⏱️  Süre: ' + attack.timeCost + ' dakika', 'cmd-output');

        // Apply reward
        GameState.addMoney(attack.reward);

        // Skill points
        const sp = attack.tier;
        GameState.addSkillPoints(sp);
        TerminalApp.printOutput('  ⭐ Yetenek Puanı: +' + sp, 'cmd-info');

        // --- EVENT TRIGGER: Broker's First Contact (after first successful hack) ---
        const history = GameState.get('hackHistory');
        if (history.length === 0 && !GameState.get('firstHackDone')) {
          GameState.set('firstHackDone', true);
          setTimeout(function () {
            MessengerApp.triggerStoryEvent('brokerFirstContact');
          }, 2000);
        }

        // Add to mission progress
        $(document).trigger('game:hackSuccess', {
          attackType: attack.id,
          target: site,
          reward: attack.reward,
        });

      } else {
        TerminalApp.printOutput('[✗] SALDIRI BAŞARISIZ!', 'cmd-error');
        TerminalApp.printOutput('', '');
        attack.failMsg.split('\n').forEach(function (line) {
          TerminalApp.printOutput('  ' + line, 'cmd-error');
        });
      }

      // --- VPN PENALTY: Cafe + VPN OFF = +80% suspicion ---
      let vpnPenaltyMultiplier = 1.0;
      if (GameState.get('location') === 'cafe' && !GameState.get('vpnActive')) {
        if (GameState.get('vpnUnlocked')) {
          // Player knows about VPN but didn't turn it on — full penalty
          vpnPenaltyMultiplier = 1.8;
          TerminalApp.printOutput('  ⚠️ VPN KAPALI! Kafede hack yapmak +%80 şüphe cezası uyguladı!', 'cmd-error');
        }
      }

      // Apply suspicion (both success and fail leave traces)
      const suspicionGain = SuspicionSystem.addSuspicionFromHack(attack.multiplier * vpnPenaltyMultiplier);
      TerminalApp.printOutput('  🔍 Şüphe: +' + suspicionGain + '% (toplam: ' + GameState.get('suspicion') + '%)', 'cmd-warning');

      // --- EVENT TRIGGER 2: Paranoyak VPN Warning (first hack at cafe) ---
      if (GameState.get('location') === 'cafe' && !GameState.get('firstCafeHackDone')) {
        GameState.set('firstCafeHackDone', true);
        GameState.set('vpnUnlocked', true);
        // Show VPN toggle in tray
        $('#tray-vpn').addClass('unlocked');
        setTimeout(function () {
          MessengerApp.triggerStoryEvent('paranoyakVpnWarning');
        }, 1500);
      }

      // Record in history
      const hackHistory = GameState.get('hackHistory');
      hackHistory.push({
        type: attack.id,
        name: attack.name,
        target: site,
        success: success,
        day: GameState.get('day'),
        time: GameState.getTimeString(),
        reward: success ? attack.reward : 0,
      });
      GameState.set('hackHistory', hackHistory);

      // Check high suspicion story
      if (GameState.get('suspicion') >= 50) {
        MessengerApp.triggerStoryEvent('highSuspicion');
      }

    }, totalDelay);
  }

  function calculateSuccess(attack) {
    let successRate = attack.baseSuccessRate;

    // Skill bonuses
    if (GameState.hasSkill('topology')) successRate += 5;
    if (GameState.hasSkill('pwned-db') && attack.id === 'credential-stuffing') successRate += 20;
    if (GameState.hasSkill('proxy-chaining')) successRate += 5;
    if (GameState.hasSkill('payload-builder') && attack.tier === 3) successRate += 10;

    // Cafe bonus
    if (GameState.get('location') === 'cafe') successRate += 5;

    // Clamp
    successRate = Math.min(95, Math.max(5, successRate));

    return Math.random() * 100 < successRate;
  }

  function generateAttackSteps(attack) {
    const commonSteps = [
      { text: '▸ Bağlantı kuruluyor...', delay: 400, cls: 'cmd-output' },
      { text: '▸ Hedef analiz ediliyor...', delay: 600, cls: 'cmd-output' },
    ];

    const attackSteps = {
      'rddos': [
        { text: '▸ Botnet ağı aktif ediliyor...', delay: 400 },
        { text: '▸ Trafik yönlendiriliyor (500 Gbps)...', delay: 500 },
        { text: '▸ Hedef sunucu yanıt süresi: 45000ms...', delay: 400 },
        { text: '▸ Fidye notu gönderiliyor...', delay: 300 },
      ],
      'sqli': [
        { text: '▸ Form alanları tespit edildi...', delay: 300 },
        { text: "▸ Payload: ' OR 1=1 --", delay: 400 },
        { text: '▸ UNION SELECT ile tablo yapısı çıkarılıyor...', delay: 500 },
        { text: '▸ Veritabanı dump ediliyor...', delay: 600 },
      ],
      'xss': [
        { text: '▸ Reflected XSS noktası bulundu...', delay: 300 },
        { text: '▸ Payload enjekte ediliyor: <script>steal()</script>', delay: 500 },
        { text: '▸ Admin cookie yakalandı!', delay: 400 },
      ],
    };

    return [
      ...commonSteps,
      ...(attackSteps[attack.id] || [
        { text: '▸ Exploit hazırlanıyor...', delay: 400 },
        { text: '▸ Payload gönderiliyor...', delay: 500 },
        { text: '▸ Yanıt bekleniyor...', delay: 600 },
      ]),
    ];
  }

  function getAttack(id) {
    return ATTACKS[id] || null;
  }

  function getAttacksByTier(tier) {
    return Object.values(ATTACKS).filter(a => a.tier === tier);
  }

  return {
    executeAttack,
    getAttack,
    getAttacksByTier,
    ATTACKS,
  };
})();
