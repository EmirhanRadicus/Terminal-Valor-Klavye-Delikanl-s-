const MissionsApp = (function () {
  function open() {
    const active = GameState.get('activeMissions') || [];
    let contentHtml = `
      <div class="missions-container">
        <div class="missions-header">
          <div class="mh-icon">📋</div>
          <h2>Broker Görevleri</h2>
        </div>
        <div class="missions-body" id="missions-body">
    `;
    if (active.length === 0) {
      contentHtml += `
          <div class="no-mission">
            <div class="nm-icon">🕸️</div>
            <p>Aktif görevin yok.</p>
            <p>Tor Browser ile Karanlık Pazar'a girip yeni işler alabilirsin.</p>
          </div>
      `;
    } else {
      const m = active[0];
      contentHtml += `
          <div class="active-mission-card">
            <h3>🟢 AKTİF GÖREV</h3>
            <div class="am-detail"><strong>Hedef:</strong> <span class="am-target">${m.site}</span></div>
            <div class="am-detail"><strong>Yöntem:</strong> <span class="am-type">${m.type.toUpperCase()} Saldırısı</span></div>
            <div class="am-detail"><strong>Ödül:</strong> <span class="am-reward">₿${m.reward}</span></div>
            <div class="am-status">
              Görevi tamamladıktan sonra Messenger üzerinden Broker'a <strong>"İş tamamlandı."</strong> mesajını at.
            </div>
            <button class="am-abort-btn" onclick="MissionsApp.abortMission()">Görevi İptal Et</button>
          </div>
      `;
    }
    contentHtml += `
        </div>
      </div>
    `;
    WindowManager.open('missions', 'Broker Görevleri', '📋', contentHtml, {
      width: 480,
      height: 380
    });
  }
  function refreshUI() {
    if (WindowManager.isOpen('missions')) {
      const active = GameState.get('activeMissions') || [];
      const $body = $('#missions-body');
      if (active.length === 0) {
        $body.html(`
          <div class="no-mission">
            <div class="nm-icon">🕸️</div>
            <p>Aktif görevin yok.</p>
            <p>Tor Browser ile Karanlık Pazar'a girip yeni işler alabilirsin.</p>
          </div>
        `);
      } else {
        const m = active[0];
        $body.html(`
          <div class="active-mission-card">
            <h3>🟢 AKTİF GÖREV</h3>
            <div class="am-detail"><strong>Hedef:</strong> <span class="am-target">${m.site}</span></div>
            <div class="am-detail"><strong>Yöntem:</strong> <span class="am-type">${m.type.toUpperCase()} Saldırısı</span></div>
            <div class="am-detail"><strong>Ödül:</strong> <span class="am-reward">₿${m.reward}</span></div>
            <div class="am-status">
              Görevi tamamladıktan sonra Messenger üzerinden Broker'a <strong>"İş tamamlandı."</strong> mesajını at.
            </div>
            <button class="am-abort-btn" onclick="MissionsApp.abortMission()">Görevi İptal Et</button>
          </div>
        `);
      }
    }
  }
  function abortMission() {
    GameState.set('activeMissions', []);
    Taskbar.showNotification('📋 Görev İptal', 'Görev iptal edildi. Broker bundan pek hoşlanmayacak.');
    GameState.addSuspicion(5);
    refreshUI();
    if (WindowManager.isOpen('messenger') && typeof MessengerApp.openChat === 'function') {
      const chatContact = $('#contact-list .contact-item.active').data('contact');
      if (chatContact) MessengerApp.openChat(chatContact);
    }
  }
  return {
    open,
    refreshUI,
    abortMission
  };
})();
