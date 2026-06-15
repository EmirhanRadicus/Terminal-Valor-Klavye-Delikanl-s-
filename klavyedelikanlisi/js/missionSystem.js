const MissionSystem = (function () {
  const MISSIONS = [
    {
      id: 'mission_1',
      title: 'İlk Kan',
      description: 'HedefBank\'a bir SQL injection saldırısı gerçekleştir.',
      target: 'hedefbank.com.tr',
      requiredAttack: 'sqli',
      reward: 25,
      skillPointReward: 2,
      deadline: null,
      tier: 1,
    },
    {
      id: 'mission_2',
      title: 'Parola Avcısı',
      description: 'HedefBank admin paneline credential stuffing ile gir.',
      target: 'hedefbank.com.tr',
      requiredAttack: 'credential-stuffing',
      reward: 20,
      skillPointReward: 2,
      deadline: null,
      tier: 1,
    },
    {
      id: 'mission_3',
      title: 'Sessiz Giriş',
      description: 'MegaCorp\'un API\'sinde BOLA/IDOR zafiyeti bul.',
      target: 'megacorp.net',
      requiredAttack: 'bola',
      reward: 35,
      skillPointReward: 3,
      deadline: null,
      tier: 2,
    },
    {
      id: 'mission_4',
      title: 'Dosya Hırsızı',
      description: 'MegaCorp sunucusunda directory traversal ile .env dosyasını çal.',
      target: 'megacorp.net',
      requiredAttack: 'dir-traversal',
      reward: 30,
      skillPointReward: 3,
      deadline: null,
      tier: 2,
    },
    {
      id: 'mission_5',
      title: 'Çifte Şantaj',
      description: 'HedefBank verilerini sızdır ve ağı şifrele. Double extortion uygula.',
      target: 'hedefbank.com.tr',
      requiredAttack: 'double-extortion',
      reward: 100,
      skillPointReward: 5,
      deadline: null,
      tier: 3,
    },
    {
      id: 'mission_6',
      title: 'Tedarik Zinciri',
      description: 'MegaCorp tedarikçisinin güncelleme sunucusunu ele geçir.',
      target: 'megacorp.net',
      requiredAttack: 'supply-chain',
      reward: 120,
      skillPointReward: 5,
      deadline: null,
      tier: 3,
    },
  ];
  let _currentMissionIndex = 0;
  function init() {
    $(document).on('game:hackSuccess', function (e, data) {
      checkMissionCompletion(data);
    });
    $(document).on('state:loaded', function () {
      _currentMissionIndex = GameState.get('completedMissions').length;
      if (!GameState.get('activeMission') && GameState.get('missionsUnlocked')) {
        assignNextMission();
      }
    });
    $(document).on('state:missionsUnlocked', function (e, data) {
      if (data && data.value === true) {
        setTimeout(function () {
          assignNextMission();
        }, 500);
      }
    });
    if (!SaveSystem.hasSave() && !GameState.get('activeMission')) {
      assignNextMission();
    }
  }
  function assignNextMission() {
    if (_currentMissionIndex >= MISSIONS.length) {
      return;
    }
    if (!GameState.get('missionsUnlocked')) {
      return;
    }
    if (GameState.get('activeMission')) {
      return;
    }
    const mission = MISSIONS[_currentMissionIndex];
    GameState.set('activeMission', mission);
    setTimeout(function () {
      MessengerApp.addMessageToChat('broker', 'received',
        '📋 Yeni Görev: ' + mission.title + '\n' + mission.description + '\nÖdül: ₿' + mission.reward,
        'Broker'
      );
    }, 1000);
  }
  function checkMissionCompletion(hackData) {
    const mission = GameState.get('activeMission');
    if (!mission) return;
    if (hackData.target.includes(mission.target) &&
        (mission.requiredAttack === 'any' || hackData.attackType === mission.requiredAttack)) {
      const completed = GameState.get('completedMissions');
      completed.push(mission.id);
      GameState.set('completedMissions', completed);
      GameState.addMoney(mission.reward);
      GameState.addSkillPoints(mission.skillPointReward);
      Taskbar.showNotification('🎯 Görev Tamamlandı!', mission.title + ' — ₿' + mission.reward + ' kazanıldı!');
      TerminalApp.printOutput('', '');
      TerminalApp.printOutput('══════════════════════════════════════', 'cmd-success');
      TerminalApp.printOutput('  🎯 GÖREV TAMAMLANDI: ' + mission.title, 'cmd-success');
      TerminalApp.printOutput('  💰 Ödül: ₿' + mission.reward, 'cmd-info');
      TerminalApp.printOutput('  ⭐ Yetenek Puanı: +' + mission.skillPointReward, 'cmd-info');
      TerminalApp.printOutput('══════════════════════════════════════', 'cmd-success');
      _currentMissionIndex++;
      GameState.set('activeMission', null);
      setTimeout(function () {
        assignNextMission();
      }, 3000);
    }
  }
  function getActiveMission() {
    return GameState.get('activeMission');
  }
  function getAllMissions() {
    return MISSIONS;
  }
  return {
    init,
    getActiveMission,
    getAllMissions,
  };
})();
