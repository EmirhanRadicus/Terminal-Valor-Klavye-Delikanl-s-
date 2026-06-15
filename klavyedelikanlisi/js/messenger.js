const MessengerApp = (function () {
  const CONTACTS = {
    annem: {
      id: 'annem',
      name: 'Annem ❤️',
      avatar: '👩',
      status: 'Çevrimiçi',
      online: true,
      preview: 'Yemeğini yedin mi?',
      visible: true,
    },
    broker: {
      id: 'broker',
      name: 'Broker',
      avatar: '🕴️',
      status: 'Bilinmeyen',
      online: false,
      preview: '',
      visible: false,
    },
    sifirinci: {
      id: 'sifirinci',
      name: 'Sıfırıncı Gün',
      avatar: '💀',
      status: 'Son görülme: bilinmiyor',
      online: false,
      preview: '',
      visible: false,
    },
    paranoyak: {
      id: 'paranoyak',
      name: 'Paranoyak',
      avatar: '👁️',
      status: 'Çevrimiçi',
      online: true,
      preview: '',
      visible: false,
    },
  };
  let _activeContact = null;
  let _messageQueue = [];
  let _unreadCounts = { annem: 0, broker: 0, sifirinci: 0, paranoyak: 0 };
  const MOM_HISTORY = [
    { type: 'received', text: 'Oğlum günaydın, kahvaltını yaptın mı?', senderName: 'Annem ❤️', time: '08:15' },
    { type: 'sent', text: 'Günaydın anne, yaptım yaptım merak etme', time: '08:32' },
    { type: 'received', text: 'Aferin benim oğluma. Bugün ne yapacaksın?', senderName: 'Annem ❤️', time: '08:33' },
    { type: 'sent', text: 'Biraz bilgisayarla uğraşacağım', time: '08:45' },
    { type: 'received', text: 'Hep o bilgisayar... Gözlerini yorma sakın', senderName: 'Annem ❤️', time: '08:46' },
    { type: 'sent', text: 'Tamam anne 😅', time: '08:47' },
    { type: 'received', text: 'Akşam yemeğe gel, karnıyarık yapıyorum', senderName: 'Annem ❤️', time: '12:30' },
    { type: 'sent', text: 'Süpersin anne geliyorum akşam', time: '12:45' },
    { type: 'received', text: 'Para sıkıntın var mı oğlum? Baban sordu', senderName: 'Annem ❤️', time: '14:00' },
    { type: 'sent', text: 'Yok anne hallettim ben sağ olun', time: '14:10' },
    { type: 'received', text: 'Tamam canım. Kendine dikkat et ❤️', senderName: 'Annem ❤️', time: '14:11' },
    { type: 'received', text: 'Bu arada marketten ekmek al gelirken', senderName: 'Annem ❤️', time: '16:20' },
    { type: 'sent', text: 'Tamam alırım', time: '16:25' },
    { type: 'received', text: 'Yemeğini yedin mi?', senderName: 'Annem ❤️', time: '19:00' },
  ];
  let _brokerStoryBranch = null; 
  const STORY_MESSAGES = {
    brokerFirstContact: {
      contact: 'broker',
      messages: [
        { sender: 'broker', text: 'Hey.', delay: 500 },
        { sender: 'broker', text: 'Benim parkımda oynuyorsun.', delay: 2500 },
        { sender: 'broker', text: 'Benden izinsiz bu işlere girme.', delay: 5000 },
        { sender: 'broker', text: 'İllaha gireceksen, işleri ben sana veririm.', delay: 7500 },
      ],
      afterMessages: function () {
        setTimeout(function () {
          showBrokerFirstChoices();
        }, 9000);
      },
    },
    paranoyakVpnWarning: {
      contact: 'paranoyak',
      messages: [
        { sender: 'paranoyak', text: 'Ulan hadi kafede hack yapıyorsun bari VPN aç. Ben karşı kafedeyim ama yine de seni görüyorum.', delay: 500 },
        { sender: 'paranoyak', text: 'Sana VPN erişimi açtım. Görev çubuğundaki VPN düğmesini kullan. Yoksa %80 fazla iz bırakırsın.', delay: 3500 },
      ],
    },
    highSuspicion: {
      contact: 'paranoyak',
      messages: [
        { sender: 'paranoyak', text: 'Dostum, dikkat et. Ağda garip hareketler var.', delay: 0 },
        { sender: 'paranoyak', text: 'Sanırım biri seni izliyor. Logları sil. HEMEN.', delay: 1500 },
        { sender: 'paranoyak', text: '"wipe-logs" komutunu çalıştır terminal\'den.', delay: 3000 },
      ],
    },
    zeroDayAvailable: {
      contact: 'sifirinci',
      messages: [
        { sender: 'sifirinci', text: '...', delay: 0 },
        { sender: 'sifirinci', text: 'Yeni bir şey var. İlgini çeker mi?', delay: 2000 },
        { sender: 'sifirinci', text: 'Zero-day exploit. Henüz kimse bilmiyor. ₿100.', delay: 4000 },
      ],
    },
    momWorry: {
      contact: 'annem',
      messages: [
        { sender: 'annem', text: 'Oğlum hala bilgisayarın başında mısın? Geç oldu artık yat.', delay: 0 },
      ],
    },
    momMorning: {
      contact: 'annem',
      messages: [
        { sender: 'annem', text: 'Günaydın canım oğlum ☀️ Bugün de güzel bir gün olsun', delay: 0 },
      ],
    },
  };
  let _triggeredMessages = [];
  function open() {
    const contentHtml = `
      <div class="messenger-container">
        <div class="messenger-contacts">
          <div class="messenger-contacts-header">
            <span class="lock-icon">🔒</span> ŞİFRELİ MESAJLAR
          </div>
          <div class="contact-list" id="contact-list">
            ${buildContactList()}
          </div>
        </div>
        <div class="messenger-chat" id="messenger-chat">
          <div class="no-chat-selected">
            <div class="ncs-icon">💬</div>
            <div class="ncs-text">Bir kişi seçin</div>
          </div>
        </div>
      </div>
    `;
    WindowManager.open('messenger', 'Mesajlar', '💬', contentHtml, {
      width: 750,
      height: 500,
      onInit: function ($window) {
        bindEvents($window);
      },
    });
  }
  function buildContactList() {
    let html = '';
    Object.values(CONTACTS).forEach(function (c) {
      if (!c.visible) return; 
      const badge = _unreadCounts[c.id] > 0
        ? '<span class="contact-badge">' + _unreadCounts[c.id] + '</span>'
        : '';
      html += `
        <div class="contact-item${_activeContact === c.id ? ' active' : ''}" data-contact="${c.id}">
          <div class="contact-avatar">${c.avatar}</div>
          <div class="contact-info">
            <div class="contact-name">${c.name}</div>
            <div class="contact-preview">${c.preview || 'Mesaj yok'}</div>
          </div>
          ${badge}
        </div>
      `;
    });
    return html;
  }
  function bindEvents($window) {
    $window.on('click', '.contact-item', function () {
      const contactId = $(this).data('contact');
      openChat(contactId);
    });
    $window.on('click', '.chat-send-btn', function () {
      sendPlayerMessage();
    });
    $window.on('keydown', '.chat-input', function (e) {
      if (e.key === 'Enter') sendPlayerMessage();
    });
    $window.on('click', '.msg-choice-btn', function () {
      const choiceText = $(this).text();
      const choiceAction = $(this).data('action');
      $(this).closest('.msg-choices').remove();
      addMessageToChat(_activeContact, 'sent', choiceText);
      if (choiceAction) handleChoice(choiceAction);
    });
  }
  function openChat(contactId) {
    _activeContact = contactId;
    const contact = CONTACTS[contactId];
    _unreadCounts[contactId] = 0;
    updateContactList();
    const chatHtml = `
      <div class="chat-header">
        <div>
          <div class="chat-contact-name">${contact.avatar} ${contact.name}</div>
          <div class="chat-contact-status ${contact.online ? 'online' : ''}">
            ${contact.online ? '● Çevrimiçi' : contact.status}
          </div>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${buildMessages(contactId)}
        <div class="typing-indicator" id="typing-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      <div class="chat-quick-replies" id="chat-quick-replies"></div>
    `;
    $('#messenger-chat').html(chatHtml);
    const $msgs = $('#chat-messages');
    $msgs.scrollTop($msgs[0].scrollHeight);
    renderQuickReplies(contactId);
    if (contactId === 'broker' && window._pendingBrokerChoices) {
      window._pendingBrokerChoices = false;
      setTimeout(function () {
        showChoices('broker', [
          { text: 'Karşında çocuk mu var reis? Park seninse toprağı benim aslanım 😎', action: 'broker_rebel' },
          { text: 'Peki reis, şimdilik öyle olsun.', action: 'broker_obey' },
        ]);
      }, 600);
    }
  }
  function renderQuickReplies(contactId) {
    const $qr = $('#chat-quick-replies');
    $qr.empty();
    let replies = [];
    if (contactId === 'annem') {
      replies.push({ text: 'Tamam anne ❤️', action: 'mom_ok' });
      replies.push({ text: 'Merak etme iyiyim', action: 'mom_fine' });
    } else if (contactId === 'broker') {
      const missions = GameState.get('activeMissions');
      const hasJob = missions && missions.length > 0;
      if (hasJob) {
        replies.push({ text: 'İş tamamlandı.', action: 'finish_mission' });
      }
    } else {
      replies.push({ text: 'Anlaşıldı.', action: 'ack' });
    }
    if (replies.length === 0) {
      $qr.html('<div class="no-replies">Kullanılabilir cevap yok.</div>');
      return;
    }
    replies.forEach(function (r) {
      const $btn = $('<button class="qr-btn"></button>').text(r.text).data('action', r.action);
      $qr.append($btn);
    });
  }
  $(document).on('click', '.qr-btn', function () {
    const text = $(this).text();
    const action = $(this).data('action');
    addMessageToChat(_activeContact, 'sent', text);
    if (action === 'finish_mission') {
      if (typeof DarkForum !== 'undefined') DarkForum.completeActiveMission();
    } else if (action === 'mom_ok' || action === 'mom_fine') {
      setTimeout(function () {
        var responses = [
          'Tamam canım, kendine iyi bak 😘',
          'Aferin benim oğluma',
          'Seni seviyorum oğlum ❤️',
          'İyi o zaman, bir şeye ihtiyacın olursa söyle',
        ];
        var r = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat('annem', 'received', r, 'Annem ❤️');
      }, 1500);
    }
    renderQuickReplies(_activeContact);
  });
  function buildMessages(contactId) {
    const messages = GameState.get('conversations')[contactId] || [];
    let html = '';
    messages.forEach(function (msg) { html += buildMessageBubble(msg); });
    return html;
  }
  function buildMessageBubble(msg) {
    const cls = msg.type === 'sent' ? 'sent' : 'received';
    const timeStr = msg.time || '';
    const safeText = escapeHtml(msg.text || '');
    const senderHtml = msg.senderName
      ? '<div class="msg-sender">' + escapeHtml(msg.senderName) + '</div>'
      : '';
    return `
      <div class="chat-msg ${cls}">
        ${senderHtml}
        ${safeText}
        <div class="msg-time">${timeStr}</div>
      </div>
    `;
  }
  function addMessageToChat(contactId, type, text, senderName) {
    const msg = {
      type: type,
      text: text,
      senderName: senderName || null,
      time: GameState.getTimeString(),
    };
    const conversations = GameState.get('conversations');
    if (!conversations[contactId]) conversations[contactId] = [];
    conversations[contactId].push(msg);
    GameState.set('conversations', conversations);
    CONTACTS[contactId].preview = text.substring(0, 30) + (text.length > 30 ? '...' : '');
    if (_activeContact === contactId && WindowManager.isOpen('messenger')) {
      const $msgs = $('#chat-messages');
      const $indicator = $('#typing-indicator');
      $indicator.before(buildMessageBubble(msg));
      $msgs.scrollTop($msgs[0].scrollHeight);
    }
  }
  function forceReceiveMessage(senderName, text) {
    let contactId = 'broker';
    if (senderName === 'Broker') contactId = 'broker';
    else if (senderName === 'Paranoyak') contactId = 'paranoyak';
    else if (senderName === 'Annem ❤️' || senderName === 'Annem') contactId = 'annem';
    else {
      if (!CONTACTS[senderName.toLowerCase()]) {
        CONTACTS[senderName.toLowerCase()] = {
          id: senderName.toLowerCase(), name: senderName, avatar: '👤',
          status: 'Bilinmeyen', online: false, visible: true, preview: '',
        };
        _unreadCounts[senderName.toLowerCase()] = 0;
      }
      contactId = senderName.toLowerCase();
    }
    if (CONTACTS[contactId]) CONTACTS[contactId].visible = true;
    addMessageToChat(contactId, 'received', text, senderName);
    if (_activeContact !== contactId) {
      _unreadCounts[contactId] = (_unreadCounts[contactId] || 0) + 1;
      updateContactList();
      Taskbar.showNotification('💬 ' + senderName, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
    } else if (WindowManager.isOpen('messenger')) {
      const $msgs = $('#chat-messages');
      $msgs.scrollTop($msgs[0].scrollHeight);
    }
  }
  function makeContactVisible(contactId) {
    if (CONTACTS[contactId]) {
      CONTACTS[contactId].visible = true;
      CONTACTS[contactId].online = true;
      updateContactList();
    }
  }
  function triggerStoryEvent(eventId) {
    if (_triggeredMessages.includes(eventId)) return;
    _triggeredMessages.push(eventId);
    const story = STORY_MESSAGES[eventId];
    if (!story) return;
    makeContactVisible(story.contact);
    story.messages.forEach(function (msg) {
      setTimeout(function () {
        if (_activeContact === story.contact && WindowManager.isOpen('messenger')) {
          $('#typing-indicator').addClass('visible');
        }
        setTimeout(function () {
          if (_activeContact === story.contact && WindowManager.isOpen('messenger')) {
            $('#typing-indicator').removeClass('visible');
          }
          addMessageToChat(story.contact, 'received', msg.text, CONTACTS[story.contact].name);
          if (_activeContact !== story.contact || !WindowManager.isOpen('messenger')) {
            _unreadCounts[story.contact]++;
            updateContactList();
            Taskbar.showNotification('💬 ' + CONTACTS[story.contact].name, msg.text.substring(0, 50));
          }
        }, 1200);
      }, msg.delay);
    });
    if (story.afterMessages) {
      story.afterMessages();
    }
  }
  function showBrokerFirstChoices() {
    if (_activeContact === 'broker' && WindowManager.isOpen('messenger')) {
      showChoices('broker', [
        { text: 'Karşında çocuk mu var reis? Park seninse toprağı benim aslanım 😎', action: 'broker_rebel' },
        { text: 'Peki reis, şimdilik öyle olsun.', action: 'broker_obey' },
      ]);
    } else {
      window._pendingBrokerChoices = true;
    }
  }
  function showChoices(contactId, choices) {
    if (_activeContact !== contactId || !WindowManager.isOpen('messenger')) return;
    let html = '<div class="msg-choices">';
    choices.forEach(function (choice) {
      html += '<button class="msg-choice-btn" data-action="' + (choice.action || '') + '">' + choice.text + '</button>';
    });
    html += '</div>';
    const $msgs = $('#chat-messages');
    const $indicator = $('#typing-indicator');
    $indicator.before(html);
    $msgs.scrollTop($msgs[0].scrollHeight);
  }
  function handleChoice(action) {
    switch (action) {
      case 'broker_rebel':
        _brokerStoryBranch = 'rebel';
        GameState.set('brokerStoryBranch', 'rebel');
        setTimeout(function () {
          addMessageToChat('broker', 'received', '😂 Ağzına sağlık.', 'Broker');
        }, 1000);
        setTimeout(function () {
          addMessageToChat('broker', 'received', 'Toprağı senin mi? O toprak altında kalanları gördüm ben...', 'Broker');
        }, 3000);
        setTimeout(function () {
          addMessageToChat('broker', 'received', 'Ama cesaretini beğendim. Korkak hackerlardan nefret ederim.', 'Broker');
        }, 5000);
        setTimeout(function () {
          addMessageToChat('broker', 'received', 'Gel bakalım, sana iş vereyim. Ama benim kurallarımla oynarsın. Görev listemi açtım. Başlat menüsünden "Görevler" kısmına bak.', 'Broker');
          GameState.set('missionsUnlocked', true);
        }, 7500);
        break;
      case 'broker_obey':
        _brokerStoryBranch = 'obey';
        GameState.set('brokerStoryBranch', 'obey');
        setTimeout(function () {
          addMessageToChat('broker', 'received', 'Akıllı çocuk.', 'Broker');
        }, 1000);
        setTimeout(function () {
          addMessageToChat('broker', 'received', 'Bak şimdi, bu dünyada kurallar basit: Ben söylerim, sen yaparsın. Karşılığında iyi para kazanırsın.', 'Broker');
        }, 3000);
        setTimeout(function () {
          addMessageToChat('broker', 'received', 'Görev listemi açtım sana. Başlat menüsünden "Görevler" kısmına bak. İlk görevinle kendini kanıtla.', 'Broker');
          GameState.set('missionsUnlocked', true);
        }, 5500);
        break;
      case 'accept_mission':
        TerminalApp.printOutput('[!] Yeni görev kabul edildi. Terminal\'den detayları kontrol edin.', 'cmd-warning');
        break;
      case 'buy_zeroday':
        if (GameState.get('money') >= 100) {
          GameState.addMoney(-100);
          GameState.unlockSkill('zero-day-hunter');
          addMessageToChat('sifirinci', 'received', 'Teslim edildi. İyi kullan.', 'Sıfırıncı Gün');
        } else {
          addMessageToChat('sifirinci', 'received', 'Paran yetmiyor. Gel daha sonra.', 'Sıfırıncı Gün');
        }
        break;
    }
  }
  function updateContactList() {
    if (WindowManager.isOpen('messenger')) {
      $('#contact-list').html(buildContactList());
    }
  }
  function onGameStart() {
    const conversations = GameState.get('conversations');
    if (!conversations['annem'] || conversations['annem'].length === 0) {
      conversations['annem'] = MOM_HISTORY.slice();
      GameState.set('conversations', conversations);
    }
    $(document).on('game:newDay', function () {
      if (!_triggeredMessages.includes('momMorning_' + GameState.get('day'))) {
        _triggeredMessages.push('momMorning_' + GameState.get('day'));
        setTimeout(function () {
          makeContactVisible('annem');
          var mornings = [
            'Günaydın oğlum ☀️ Bugün de güzel bir gün olsun',
            'Günaydın canım, kahvaltını unutma!',
            'Oğlum kalktın mı? Günaydın 🌸',
          ];
          var msg = mornings[Math.floor(Math.random() * mornings.length)];
          addMessageToChat('annem', 'received', msg, 'Annem ❤️');
          if (_activeContact !== 'annem') {
            _unreadCounts['annem']++;
            updateContactList();
            Taskbar.showNotification('💬 Annem ❤️', msg);
          }
        }, 3000);
      }
    });
    $(document).on('game:tick', function (e, data) {
      if (data.hours === 23 && data.minutes === 0) {
        if (!_triggeredMessages.includes('momWorry_' + GameState.get('day'))) {
          _triggeredMessages.push('momWorry_' + GameState.get('day'));
          var worries = [
            'Oğlum hala uyumadın mı? Geç oldu artık yat! 😟',
            'Yat artık oğlum, yarın erken kalkacaksın',
            'Gece gece bilgisayarın başında ne yapıyorsun... Uyu artık!',
          ];
          var msg = worries[Math.floor(Math.random() * worries.length)];
          addMessageToChat('annem', 'received', msg, 'Annem ❤️');
          if (_activeContact !== 'annem') {
            _unreadCounts['annem']++;
            updateContactList();
            Taskbar.showNotification('💬 Annem ❤️', msg);
          }
        }
      }
    });
  }
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  return {
    open,
    triggerStoryEvent,
    showChoices,
    onGameStart,
    addMessageToChat,
    forceReceiveMessage,
    openChat,
    renderQuickReplies,
    makeContactVisible,
  };
})();
