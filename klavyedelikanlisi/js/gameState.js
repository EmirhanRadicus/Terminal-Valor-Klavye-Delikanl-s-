/* ============================================
   GAME STATE — Central state store
   ============================================ */
const GameState = (function () {
  const _state = {
    // Time
    time: { hours: 11, minutes: 0 },
    day: 1,
    dayName: 'Pazartesi',
    isPaused: false,
    isSleeping: false,

    // Location
    location: 'home', // 'home' | 'cafe'

    // Economy
    money: 50, // starting balance in ₿ (bitcoin units)

    // Suspicion
    suspicion: 0, // 0-100

    // Skills — unlocked node IDs
    skills: [],
    skillPoints: 0,

    // Missions
    missions: [],
    activeMission: null,
    completedMissions: [],

    // Notes (notepad files)
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

    // Hack history
    hackHistory: [],

    // Messenger
    conversations: {},
    unreadMessages: {},

    // Game flags
    gameOver: false,
    gameOverReason: '',
    bootComplete: false,
    tutorialComplete: false,
    desktopWallpaper: 'https://placekitten.com/1920/1080',

    // VPN & Security
    vpnUnlocked: false,
    vpnActive: false,

    // Event triggers
    missionsUnlocked: false,
    firstSqlHackDone: false,
    firstHackDone: false,
    firstCafeHackDone: false,
    brokerStoryBranch: null, // 'rebel' or 'obey'

    // Active missions from dark forum
    activeMissions: [],

    // Economy
    coffeePrice: 3, // ₿ per hour at cafe
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

    // Emit change event
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
