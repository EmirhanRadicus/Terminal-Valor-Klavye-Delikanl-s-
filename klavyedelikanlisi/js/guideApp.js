/* ============================================
   GUIDE APP — "Sıfırdan Hacker" Tutorial Book
   Progressive unlock based on player level
   ============================================ */
const GuideApp = (function () {

  // Level requirements: number of successful hacks needed
  function getPlayerLevel() {
    const history = GameState.get('hackHistory').filter(h => h.success);
    if (history.length >= 12) return 4;
    if (history.length >= 7) return 3;
    if (history.length >= 3) return 2;
    return 1;
  }

  const SECTIONS = [
    {
      level: 1,
      id: 'sqli',
      title: '💉 SQL Injection (SQLi)',
      icon: '💉',
      content: `
        <div class="guide-section-content">
          <h2>SQL Injection — Veritabanına Doğrudan Sızma</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: SQL Nedir?</div>
            <p>
              <strong>SQL (Structured Query Language)</strong>, Microsoft, Oracle veya Amazon gibi dev şirketlerin veritabanlarını yönetmek için kullandığı bir dildir. Bir SQL veritabanını, içinde milyonlarca satır müşteri bilgisi, şifre ve kredi kartı olan devasa, dinamik bir Excel tablosu gibi düşünün.
            </p>
            <p>
              Bir web sitesi, bu "Excel tablosundan" veri çekerken düzgün filtreleme yapmazsa, arama çubuğuna yazacağımız özel bir komut dizisi ile o tabloya doğrudan sızabiliriz.
            </p>
            <p>
              Normal bir giriş formu arka planda şöyle bir sorgu çalıştırır:
            </p>
            <pre><code>SELECT * FROM kullanıcılar WHERE email='admin@site.com' AND sifre='12345'</code></pre>
            <p>
              Eğer site bu girdiyi filtremezse, şifre yerine şunu yazarak veritabanını kandırabiliriz:
            </p>
            <pre><code>' OR '1'='1' --</code></pre>
            <p>
              Bu, sorguyu şuna çevirir:
            </p>
            <pre><code>SELECT * FROM kullanıcılar WHERE email='admin@site.com' AND sifre='' OR '1'='1' --'</code></pre>
            <p>
              <code>'1'='1'</code> her zaman doğrudur, yani veritabanı bizi doğru şifreye sahipmişiz gibi içeri alır. <code>--</code> ise sorgunun geri kalanını yorum satırına çevirir.
            </p>
          </div>

          <div class="guide-block exploit">
            <div class="guide-block-title">🔓 Exploit: Nasıl Sızılır?</div>
            <p>
              SQL açığı olan bir site bulduğunuzda, saldırı iki aşamada gerçekleşir:
            </p>
            <ol>
              <li><strong>Keşif:</strong> Hedef siteyi tarayarak hangi portların açık olduğunu ve hangi veritabanı yazılımını kullandığını öğrenin.</li>
              <li><strong>Sızma:</strong> SQL injection payload'unu kullanarak veritabanına yetkisiz erişim sağlayın.</li>
            </ol>
            <p>
              Gerçek dünyada bu saldırı, <strong>UNION SELECT</strong> ve <strong>error-based injection</strong> gibi ileri tekniklerle birleştirilerek kullanıcı tabloları, şifreler ve hatta admin paneline erişim sağlamak için genişletilebilir.
            </p>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <p>Terminali açın ve şu komutları sırasıyla girerek sunucuya sanki yetkili bir admin'mişsiniz gibi bağlanın:</p>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>scan hedefbank.com.tr</code>
                <span>Hedefin portlarını, işletim sistemini ve zafiyetlerini tara</span>
              </div>
              <div class="guide-cmd">
                <code>exploit sqli hedefbank.com.tr</code>
                <span>SQL Injection saldırısı başlat — login formuna payload enjekte et</span>
              </div>
              <div class="guide-cmd">
                <code>wipe-logs</code>
                <span>Saldırı sonrası logları sil — şüphe seviyeni düşür</span>
              </div>
            </div>
            <div class="guide-tip">
              <strong>💡 İpucu:</strong> Saldırı başarılı olursa ₿ kazanırsın ve yetenek puanı alırsın. Ama şüphe seviyesi de artar — logları silmeyi unutma!
            </div>
          </div>
        </div>
      `,
    },
    {
      level: 1,
      id: 'xss',
      title: '🎭 Cross-Site Scripting (XSS)',
      icon: '🎭',
      content: `
        <div class="guide-section-content">
          <h2>XSS — Kullanıcıların Tarayıcısında Kod Çalıştırma</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: XSS Nedir?</div>
            <p>
              Cross-Site Scripting (XSS), bir web sitesinin kullanıcı girdilerini düzgün temizlemediği durumlarda ortaya çıkan bir güvenlik açığıdır. Saldırgan, hedef siteye zararlı JavaScript kodu enjekte eder ve bu kod, siteyi ziyaret eden diğer kullanıcıların tarayıcısında çalışır.
            </p>
            <p>
              Örneğin bir arama çubuğunda şunu ararsanız:
            </p>
            <pre><code>&lt;script&gt;alert('Hacklendi!')&lt;/script&gt;</code></pre>
            <p>
              Eğer site bu girdiyi filtrelemeden sayfaya yansıtırsa, bu JavaScript kodu tüm ziyaretçilerin tarayıcısında çalışır. Bu şekilde çerezler çalınabilir, oturumlar ele geçirilebilir ve hatta sahte giriş formları oluşturulabilir.
            </p>
          </div>

          <div class="guide-block exploit">
            <div class="guide-block-title">🔓 Exploit: Reflected XSS Saldırısı</div>
            <p>En yaygın XSS türü <strong>Reflected XSS</strong>'tir:</p>
            <ol>
              <li>Hedef sitede bir arama kutusu veya URL parametresi bulun</li>
              <li>JavaScript payload'u yerleştirin: <code>&lt;img src=x onerror=alert(document.cookie)&gt;</code></li>
              <li>Kurbanın bu linke tıklamasını sağlayın (sosyal mühendislik)</li>
              <li>Kurbanın çerezleri ve oturum bilgileri size iletilir</li>
            </ol>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>scan megacorp.net</code>
                <span>Hedefi tara — XSS açıkları tespit et</span>
              </div>
              <div class="guide-cmd">
                <code>exploit xss megacorp.net</code>
                <span>XSS payload'u enjekte et ve oturum çerezlerini ele geçir</span>
              </div>
            </div>
            <div class="guide-tip">
              <strong>💡 İpucu:</strong> XSS sessiz bir saldırıdır — düşük şüphe cezası alırsın ama kazanç da düşüktür.
            </div>
          </div>
        </div>
      `,
    },
    {
      level: 2,
      id: 'credential',
      title: '🔑 Credential Stuffing',
      icon: '🔑',
      content: `
        <div class="guide-section-content">
          <h2>Credential Stuffing — Çalıntı Şifrelerle Toplu Giriş</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: İnsanlar Neden Aynı Şifreyi Kullanır?</div>
            <p>
              İnternetteki kullanıcıların %65'inden fazlası birden fazla sitede aynı şifreyi kullanır. Dark web'de satılan milyonlarca e-posta/şifre kombinasyonu, bu alışkanlığı bir silaha dönüştürür.
            </p>
            <p>
              Credential Stuffing saldırısı, önceden sızdırılmış veri tabanlarından alınan kullanıcı adı/şifre çiftlerini otomatik olarak hedef siteye deneyen bir brute-force varyantıdır. Fark şu ki: rastgele şifre denemek yerine <strong>gerçek, daha önce çalınmış şifreleri</strong> kullanırız.
            </p>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>exploit credential-stuffing hedefbank.com.tr</code>
                <span>Sızdırılmış veritabanından şifreleri hedef siteye otomatik dene</span>
              </div>
            </div>
            <div class="guide-tip">
              <strong>⚠️ Dikkat:</strong> Bu saldırı yüksek seviyede iz bırakır. VPN'siz deneme!
            </div>
          </div>
        </div>
      `,
    },
    {
      level: 2,
      id: 'cve',
      title: '🐛 CVE Exploit (Bilinen Zafiyet)',
      icon: '🐛',
      content: `
        <div class="guide-section-content">
          <h2>CVE Exploit — Yayınlanmış Güvenlik Açıklarını Kullanma</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: CVE Nedir?</div>
            <p>
              <strong>CVE (Common Vulnerabilities and Exposures)</strong>, keşfedilen güvenlik açıklarına verilen standart numaralardır. Örneğin <code>CVE-2021-44228</code> (Log4Shell), Java'nın Log4j kütüphanesindeki kritik bir açıktır.
            </p>
            <p>
              Bu açıklar kamuya açıklandıktan sonra, yamayı henüz uygulamamış sistemler savunmasız kalır. Saldırgan, bu CVE numarasını arar, hazır exploit kodunu bulur ve güncellenmemiş sunuculara uygular.
            </p>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>scan hedefbank.com.tr</code>
                <span>CVE zafiyetleri için hedefi tara</span>
              </div>
              <div class="guide-cmd">
                <code>exploit cve hedefbank.com.tr</code>
                <span>Bilinen CVE açığını kullanarak uzaktan kod çalıştır</span>
              </div>
            </div>
          </div>
        </div>
      `,
    },
    {
      level: 3,
      id: 'phishing',
      title: '🎣 Phishing (Oltalama)',
      icon: '🎣',
      content: `
        <div class="guide-section-content">
          <h2>Phishing — Sosyal Mühendislik ile Kimlik Avı</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: İnsanı Hacklemek</div>
            <p>
              En güçlü güvenlik duvarı bile insan hatasına karşı çaresizdir. Phishing, teknik bir saldırıdan çok bir <strong>sosyal mühendislik operasyonudur</strong>. Kurbanı sahte bir giriş sayfasına yönlendirerek şifresini kendi elleriyle girmesini sağlarsınız.
            </p>
            <p>
              Başarılı bir phishing saldırısı için:
            </p>
            <ol>
              <li>Hedef sitenin birebir kopyasını oluşturun (clone site)</li>
              <li>Benzer bir domain adı alın (ör: hedefbank-guvenlik.com)</li>
              <li>Kurbanı bu siteye yönlendirecek bir e-posta hazırlayın</li>
              <li>Girilen bilgileri kaydedin ve gerçek siteye yönlendirin</li>
            </ol>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>exploit phishing megacorp.net</code>
                <span>Oltalama sayfası oluştur ve çalışanlara hedefli e-posta gönder</span>
              </div>
            </div>
            <div class="guide-tip">
              <strong>💡 İpucu:</strong> Phishing düşük şüphe cezası alır ama "social-engineering" yeteneğini açmanız gerekir.
            </div>
          </div>
        </div>
      `,
    },
    {
      level: 3,
      id: 'supply-chain',
      title: '🔗 Supply Chain Attack',
      icon: '🔗',
      content: `
        <div class="guide-section-content">
          <h2>Supply Chain Attack — Tedarik Zinciri Saldırısı</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: Zayıf Halka Prensibi</div>
            <p>
              Bir şirketin kendi güvenliği mükemmel olabilir, ama kullandığı üçüncü parti yazılımlardaki (<em>dependency</em>) bir açık, tüm sistemi çökertebilir. SolarWinds (2020) saldırısı, 18.000+ kuruluşu bu şekilde etkiledi.
            </p>
            <p>
              Saldırgan, hedefin kullandığı bir açık kaynak kütüphanesine zararlı kod enjekte eder. Hedef şirket bu kütüphaneyi güncellediğinde, zararlı kod otomatik olarak sistemlerine girer.
            </p>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>exploit supply-chain megacorp.net</code>
                <span>Hedefin bağımlılıklarını analiz et ve zararlı güncelleme yayınla</span>
              </div>
            </div>
            <div class="guide-tip">
              <strong>⚠️ Dikkat:</strong> Tier 3 saldırı — çok yüksek ödül, çok yüksek risk. "advanced-persistence" yeteneği gerektirir.
            </div>
          </div>
        </div>
      `,
    },
    {
      level: 4,
      id: 'zeroday',
      title: '☠️ Zero-Day Exploit',
      icon: '☠️',
      content: `
        <div class="guide-section-content">
          <h2>Zero-Day — Kimsenin Bilmediği Silah</h2>

          <div class="guide-block theory">
            <div class="guide-block-title">📘 Teori: Sıfırıncı Gün Nedir?</div>
            <p>
              Zero-day, yazılım üreticisinin henüz haberi olmadığı ve bu nedenle yaması bulunmayan bir güvenlik açığıdır. "Sıfırıncı gün" ifadesi, üreticinin açığı öğrendiği günden itibaren yaması yayınlamak için <strong>sıfır gün</strong> süresinin olduğunu belirtir.
            </p>
            <p>
              Zero-day exploit'ler karaborsa'da yüz binlerce — hatta milyonlarca dolar değerindedir. Devlet destekli hacker grupları (APT) bu tür exploit'leri stratejik hedefler için saklar.
            </p>
          </div>

          <div class="guide-block commands">
            <div class="guide-block-title">⌨️ Terminal Komutları</div>
            <div class="guide-cmd-list">
              <div class="guide-cmd">
                <code>exploit zero-day hedefbank.com.tr</code>
                <span>Sıfırıncı gün açığını kullan — savunma imkansız</span>
              </div>
            </div>
            <div class="guide-tip">
              <strong>☠️ Son seviye:</strong> Bu saldırıyı kullanmak için "Sıfırıncı Gün" NPC'sinden exploit satın almanız ve "zero-day-hunter" yeteneğini açmanız gerekir.
            </div>
          </div>
        </div>
      `,
    },
  ];

  let _activeSection = null;

  function open() {
    const level = getPlayerLevel();
    const navHtml = SECTIONS.map(function (s) {
      const locked = s.level > level;
      const lockCls = locked ? ' locked' : '';
      const lockIcon = locked ? '<span class="guide-lock">🔒</span>' : '';
      return `
        <div class="guide-nav-item${lockCls}${_activeSection === s.id ? ' active' : ''}" data-section="${s.id}" data-level="${s.level}">
          <span class="guide-nav-icon">${s.icon}</span>
          <span class="guide-nav-title">${s.title}</span>
          ${lockIcon}
          <span class="guide-nav-level">Lv.${s.level}</span>
        </div>
      `;
    }).join('');

    const contentHtml = `
      <div class="guide-container">
        <div class="guide-sidebar">
          <div class="guide-sidebar-header">
            <div class="guide-sidebar-title">📖 SIFIRDAN HACKER</div>
            <div class="guide-sidebar-level">Seviye: ${level} / 4</div>
          </div>
          <div class="guide-nav" id="guide-nav">
            ${navHtml}
          </div>
        </div>
        <div class="guide-content" id="guide-content">
          <div class="guide-welcome">
            <div class="guide-welcome-icon">📖</div>
            <h2>Sıfırdan Hacker Rehberi</h2>
            <p>Sol taraftan bir konu seçerek öğrenmeye başla.</p>
            <p>Başarılı saldırılar yaparak yeni konuların kilidini aç.</p>
            <div class="guide-level-info">
              <div class="guide-level-bar">
                <div class="guide-level-fill" style="width:${(level / 4) * 100}%"></div>
              </div>
              <span>Seviye ${level} — ${getPlayerLevel() >= 4 ? 'Uzman' : getPlayerLevel() >= 3 ? 'İleri' : getPlayerLevel() >= 2 ? 'Orta' : 'Çaylak'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    WindowManager.open('guide', 'Sıfırdan Hacker', '📖', contentHtml, {
      width: 880,
      height: 560,
      onInit: bindEvents,
    });
  }

  function bindEvents($window) {
    $window.on('click', '.guide-nav-item:not(.locked)', function () {
      const sectionId = $(this).data('section');
      _activeSection = sectionId;

      // Mark active
      $window.find('.guide-nav-item').removeClass('active');
      $(this).addClass('active');

      // Load content
      const section = SECTIONS.find(s => s.id === sectionId);
      if (section) {
        $window.find('#guide-content').html(section.content);
      }
    });

    // Locked section click feedback
    $window.on('click', '.guide-nav-item.locked', function () {
      const reqLevel = $(this).data('level');
      Taskbar.showNotification('🔒 Kilitli', 'Bu konu için Seviye ' + reqLevel + ' gerekli. Daha fazla saldırı yap!');
    });
  }

  return {
    open,
  };
})();
