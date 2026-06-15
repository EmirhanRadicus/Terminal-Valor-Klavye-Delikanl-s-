const DarkForum = (function () {
  const MISSION_TYPES = [
    { type: 'sqli', title: 'Veritabanı Sızması', site: 'globalnews.com.tr', reward: 15, xP: 5 },
    { type: 'sqli', title: 'Şifre Çalma', site: 'teknoshop.com.tr', reward: 25, xP: 10 },
    { type: 'xss', title: 'Oturum Ele Geçirme', site: 'megacorp.net', reward: 10, xP: 5 },
    { type: 'cve', title: 'Eski Sunucu Hack', site: 'devletkapisi.gov.tr', reward: 50, xP: 20 },
    { type: 'sqli', title: 'Müşteri Verisi İndirme', site: 'kriptoborsa.net', reward: 40, xP: 15 },
  ];
  function getAvailableMissions() {
    const shuffled = [...MISSION_TYPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((m, i) => {
      return {
        id: 'job_' + Date.now() + '_' + i,
        ...m
      };
    });
  }
  function acceptMission(missionObj) {
    if (!GameState.get('activeMissions')) {
      GameState.set('activeMissions', []);
    }
    const missions = GameState.get('activeMissions');
    if (missions.length >= 1) {
      Taskbar.showNotification('❌ Hata', 'Aynı anda sadece bir görev alabilirsin.');
      return false;
    }
    missionObj.status = 'accepted';
    missions.push(missionObj);
    GameState.set('activeMissions', missions);
    Taskbar.showNotification('📜 Görev Alındı', missionObj.title + " görevi kabul edildi. Broker'a mesaj atabileceksin.");
    if (typeof MessengerApp.renderQuickReplies === 'function') {
      const active = $('#messenger-chat:visible').length > 0;
      if(active) {
        MessengerApp.openChat('broker'); 
      }
    }
    if (typeof MissionsApp !== 'undefined') {
      MissionsApp.refreshUI();
    }
    return true;
  }
  function completeActiveMission() {
    const missions = GameState.get('activeMissions');
    if (!missions || missions.length === 0) return;
    const mission = missions[0];
    const history = GameState.get('hackHistory') || [];
    const hack = history.find(h => h.target === mission.site && h.type === mission.type && h.success);
    if (hack || true) { 
      GameState.addMoney(mission.reward);
      GameState.set('activeMissions', []); 
      MessengerApp.forceReceiveMessage('Broker', 'İyi iş. Paranı hesabına aktardım. (+' + mission.reward + ' ₿)');
      if (typeof MissionsApp !== 'undefined') {
         MissionsApp.refreshUI();
      }
      return true;
    } else {
      MessengerApp.forceReceiveMessage('Broker', 'Bana palavrayla gelme. Hedefi henüz hacklemedin.');
      return false;
    }
  }
  return {
    getAvailableMissions,
    acceptMission,
    completeActiveMission,
  };
})();
