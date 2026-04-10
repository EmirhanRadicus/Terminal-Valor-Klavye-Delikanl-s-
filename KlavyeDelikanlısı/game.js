
$(document).ready(function () {


    // Site Listesi

    const siteKayitlari = {
        'kiymetlibankasi.com': 'sites/1.Site/index.html',
        'ozyigitticaret.com': 'sites/2.Site/index.html',
        'aybank.com': 'sites/3.Sitte/index.html',

    };

    $('#btn-basla').click(function () {
        var zamanCizelgesi = gsap.timeline();

        zamanCizelgesi.to('#baslangic-ekrani', {
            opacity: 0, duration: 1, onComplete: function () {
                $('#baslangic-ekrani').addClass('d-none');
                $('#giris-ekrani').removeClass('d-none');
                $('#giris-ekrani').css('display', 'flex');
            }
        });

        zamanCizelgesi.to('.hikaye-metni', { opacity: 1, duration: 2, ease: "power1.inOut" });
        zamanCizelgesi.to('.hikaye-metni', { opacity: 1, duration: 2 });

        zamanCizelgesi.to('#giris-ekrani', {
            opacity: 0, duration: 1.5, onComplete: function () {
                $('#giris-ekrani').addClass('d-none');
                $('#masaustu-ortami').removeClass('d-none');
                gsap.fromTo('#masaustu-ortami', { opacity: 0 }, { opacity: 1, duration: 1.5 });
                sistemiBaslat();
            }
        });
    });


    // Arayüz Ve Görev çubuğu

    function sistemiBaslat() {
        saatiGuncelle();
        setInterval(saatiGuncelle, 60000);
    }

    function saatiGuncelle() {
        const simdi = new Date();
        const saat = String(simdi.getHours()).padStart(2, '0');
        const dakika = String(simdi.getMinutes()).padStart(2, '0');
        const gun = String(simdi.getDate()).padStart(2, '0');
        const ay = String(simdi.getMonth() + 1).padStart(2, '0');
        const yil = simdi.getFullYear();

        $('#saat-gostergesi').text(`${saat}:${dakika} | ${gun}.${ay}.${yil}`);
    }

    // ==========================================
    // 4. PENCERE YÖNETİMİ
    // ==========================================
    let zIndeksSayaci = 20;

    $('.ikon-ogesi').click(function () {
        const uygulamaAdi = $(this).data('app');
        const pencereId = '#pencere-' + uygulamaAdi;
        if ($(pencereId).length) {
            $(pencereId).removeClass('d-none');
            pencereyeOdaklan($(pencereId));

            if (uygulamaAdi === 'terminal') {
                setTimeout(() => $('#terminal-girdisi').focus(), 100);
            }
        }
    });

    $('.btn-pencere-kapat').click(function () {
        const pencere = $(this).closest('.isletim-sistemi-penceresi');
        pencere.addClass('d-none');
        // Kapatılırken tam ekransa tam ekranı da kapat
        pencere.removeClass('tam-ekran-pencere');
    });

    $('.isletim-sistemi-penceresi').mousedown(function () {
        pencereyeOdaklan($(this));
    });

    function pencereyeOdaklan(pencereElemani) {
        $('.isletim-sistemi-penceresi').removeClass('aktif-pencere');
        pencereElemani.addClass('aktif-pencere');
        zIndeksSayaci++;
        pencereElemani.css('z-index', zIndeksSayaci);
    }

    let surukleniyorMu = false;
    let $guncelPencere = null;
    let uzaklik = { x: 0, y: 0 };

    $('.pencere-basligi').mousedown(function (e) {
        if ($(e.target).hasClass('btn-pencere-kapat')) return;

        surukleniyorMu = true;
        $guncelPencere = $(this).closest('.isletim-sistemi-penceresi');
        pencereyeOdaklan($guncelPencere);

        const pencerePozisyonu = $guncelPencere.position();
        uzaklik.x = e.clientX - pencerePozisyonu.left;
        uzaklik.y = e.clientY - pencerePozisyonu.top;
    });

    $(document).mousemove(function (e) {
        if (surukleniyorMu && $guncelPencere) {
            $guncelPencere.css({
                left: e.clientX - uzaklik.x + 'px',
                top: e.clientY - uzaklik.y + 'px'
            });
        }
    });

    $(document).mouseup(function () {
        surukleniyorMu = false;
        $guncelPencere = null;
    });

    // ==========================================
    // 5. TERMİNAL SİSTEMİ
    // ==========================================
    const $terminalGirdisi = $('#terminal-girdisi');
    const $terminalCiktisi = $('#terminal-ciktisi');

    $terminalGirdisi.keypress(function (e) {
        if (e.which === 13) {
            const komut = $(this).val().trim().toLowerCase();
            $(this).val('');

            terminalCiktisiYazdir(`<span style="color:#aaa;">root@kd:~#</span> ${komut}`);

            if (komut !== "") komutuIsle(komut);
        }
    });

    function komutuIsle(komut) {
        if (komut === 'site-tara') {
            terminalSistemYazdir("Ağ taraması başlatılıyor...");

            setTimeout(() => {
                const domainler = Object.keys(siteKayitlari);
                terminalCiktisiYazdir("Bulunan aktif domainler:");
                domainler.forEach(domain => {
                    terminalCiktisiYazdir(` -> <strong style="color: #fff;">${domain}</strong>`);
                });
            }, 1000);

        } else if (komut === 'clear') {
            $terminalCiktisi.empty();
        } else {
            terminalCiktisiYazdir(`<span style="color:red;">Hata: Geçersiz komut '${komut}'</span>`);
        }
    }

    function terminalCiktisiYazdir(htmlIcerigi) {
        $terminalCiktisi.append(`<div>${htmlIcerigi}</div>`);
        terminalAshaKaydir();
    }

    function terminalSistemYazdir(mesaj) {
        const id = 'sistem-komutu-' + Date.now();
        $terminalCiktisi.append(`<div id="${id}" style="color: #0ff;"></div>`);

        new Typed(`#${id}`, {
            strings: [`[SİSTEM]: ${mesaj}`],
            typeSpeed: 20,
            showCursor: false,
            onComplete: () => terminalAshaKaydir()
        });
    }

    function terminalAshaKaydir() {
        const govde = $('.terminal-govdesi')[0];
        govde.scrollTop = govde.scrollHeight;
    }

    // ==========================================
    // 6. TARAYICI SİSTEMİ & TAM EKRAN
    // ==========================================
    $('#tarayici-git').click(webSitesiYukle);
    $('#tarayici-adresi').keypress(function (e) {
        if (e.which === 13) webSitesiYukle();
    });

    // Tarayıcı Tam Ekran Butonu Logic
    $('#btn-tarayici-tam-ekran').click(function () {
        const tarayiciPenceresi = $('#pencere-tarayici');
        tarayiciPenceresi.toggleClass('tam-ekran-pencere');

        // Odaklan
        pencereyeOdaklan(tarayiciPenceresi);
    });

    function webSitesiYukle() {
        let domain = $('#tarayici-adresi').val().trim().toLowerCase();

        if (domain === "") return;

        const yol = siteKayitlari[domain];

        if (yol) {
            $('#tarayici-gorunumu').html(`<iframe src="${yol}"></iframe>`);
        } else {
            $('#tarayici-gorunumu').html(`
                <div class="text-center mt-5 text-muted">
                    <i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i>
                    <h4>404 - Domain Bulunamadı</h4>
                    <p>${domain} sunucusuna ulaşılamıyor.</p>
                </div>
            `);
        }
    }

    // ==========================================
    // 7. NOTLAR UYGULAMASI (Kalıcı Hafıza)
    // ==========================================
    const $notlarAlani = $('#uygulama-notlar-alani');
    const YEREL_HAFIZA_ANAHTARI = 'kd_notlar_verisi';

    // Sayfa yüklendiğinde eski notları getir veya varsayılan listeyi yaz
    const kaydedilenNotlar = localStorage.getItem(YEREL_HAFIZA_ANAHTARI);
    if (kaydedilenNotlar) {
        $notlarAlani.val(kaydedilenNotlar);
    } else {
        $notlarAlani.val("--- TEMEL KOMUTLAR ---\n1. site-tara : Ağdaki gizli hedefleri bulur.\n2. clear     : Terminal ekranını temizler.\n----------------------\n\nNot: Notlarınız otomatik olarak kaydedilir.");
    }

    // Kullanıcı yazdıkça otomatik kaydet
    let kaydetmeZamani;
    $notlarAlani.on('input', function () {
        clearTimeout(kaydetmeZamani);
        // Yazmayı bıraktıktan yarım saniye sonra kaydet (Performans için)
        kaydetmeZamani = setTimeout(() => {
            localStorage.setItem(YEREL_HAFIZA_ANAHTARI, $notlarAlani.val());
        }, 500);
    });

});
