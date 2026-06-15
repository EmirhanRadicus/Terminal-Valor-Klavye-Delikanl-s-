const GameState = (function () {
  const _state = {
    time: { hours: 11, minutes: 0 },
    day: 1,
    dayName: 'Pazartesi',
    isPaused: false,
    isSleeping: false,
    location: 'home', 
    money: 50, 
    suspicion: 0, 
    skills: [],
    skillPoints: 0,
    missions: [],
    activeMission: null,
    completedMissions: [],
    notes: {
      'ipuçları.txt': [
        '=== KLAVYE DELİKANLISI ===',
        '',
        'Komutlar:',
        '  help        - Tüm komutları listele',
        '  scan <ip>   - Hedefi tara',
        '  exploit <tür> <hedef> - Saldırı başlat',
        '  status      - Durum bilgisi',
        '  sleep       - Uyu (gün geç)',
        '  goto cafe   - Kafeye git',
        '  goto home   - Eve dön',
        '',
        'Dikkat:',
        '  - Şüphe seviyesi %100\'e ulaşırsa YAKLANIRSIN',
        '  - Kafede yakalanma ihtimalin %15 düşer',
        '  - Saat 04:00\'te bayılırsın',
        '',
        'Hedefler:',
        '  hedefbank.com.tr  - Banka sitesi',
        '  megacorp.net      - Kurumsal şirket',
        ''
      ].join('\n'),
    },
    hackHistory: [],
    scannedTargets: {},
    siteStates: {},
    conversations: {},
    unreadMessages: {},
    gameOver: false,
    gameOverReason: '',
    bootComplete: false,
    tutorialComplete: false,
    desktopWallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920',
    vpnUnlocked: false,
    vpnActive: false,
    missionsUnlocked: false,
    firstSqlHackDone: false,
    firstHackDone: false,
    firstCafeHackDone: false,
    brokerStoryBranch: null, 
    activeMissions: [],
    coffeePrice: 3, 
  };
  const _dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  function get(key) {
    if (key) {
      return key.split('.').reduce((obj, k) => obj && obj[k], _state);
    }
    return { ..._state };
  }
  function set(key, value) {
    const keys = key.split('.');
    let obj = _state;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;
    $(document).trigger('state:changed', { key, value, oldValue });
    $(document).trigger('state:' + key, { value, oldValue });
  }
  function addMoney(amount) {
    const newAmount = _state.money + amount;
    set('money', Math.max(0, newAmount));
  }
  function addSuspicion(amount) {
    const newAmount = Math.min(100, Math.max(0, _state.suspicion + amount));
    set('suspicion', newAmount);
    if (newAmount >= 100) {
      $(document).trigger('game:gameOver', { reason: 'raid' });
    }
  }
  function addSkillPoints(amount) {
    set('skillPoints', _state.skillPoints + amount);
  }
  function unlockSkill(skillId) {
    if (!_state.skills.includes(skillId)) {
      _state.skills.push(skillId);
      $(document).trigger('state:skillUnlocked', { skillId });
    }
  }
  function hasSkill(skillId) {
    return _state.skills.includes(skillId);
  }
  function advanceDay() {
    const newDay = _state.day + 1;
    const dayIndex = (newDay - 1) % 7;
    set('day', newDay);
    set('dayName', _dayNames[dayIndex]);
    $(document).trigger('game:newDay', { day: newDay });
  }
  function getTimeString() {
    const h = String(_state.time.hours).padStart(2, '0');
    const m = String(_state.time.minutes).padStart(2, '0');
    return h + ':' + m;
  }
  function toJSON() {
    return JSON.stringify(_state);
  }
  function fromJSON(json) {
    const loaded = JSON.parse(json);
    Object.assign(_state, loaded);
    if (!_state.scannedTargets) _state.scannedTargets = {};
    if (!_state.siteStates) _state.siteStates = {};
    if (!_state.hackHistory) _state.hackHistory = [];
    if (!_state.conversations) _state.conversations = {};
    if (!_state.unreadMessages) _state.unreadMessages = {};
    if (!_state.activeMissions || !Array.isArray(_state.activeMissions)) _state.activeMissions = [];
    if (!_state.skills || !Array.isArray(_state.skills)) _state.skills = [];
    if (!_state.missions || !Array.isArray(_state.missions)) _state.missions = [];
    if (!_state.completedMissions || !Array.isArray(_state.completedMissions)) _state.completedMissions = [];
    if (!_state.notes) _state.notes = {};
    $(document).trigger('state:loaded');
  }
  return {
    get,
    set,
    addMoney,
    addSuspicion,
    addSkillPoints,
    unlockSkill,
    hasSkill,
    advanceDay,
    getTimeString,
    toJSON,
    fromJSON,
  };
})();
