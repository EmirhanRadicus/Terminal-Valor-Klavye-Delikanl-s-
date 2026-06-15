const SkillTree = (function () {
  const BRANCHES = {
    osint: {
      id: 'osint',
      name: 'OSINT',
      icon: '🔍',
      nodes: [
        {
          id: 'topology',
          name: 'Topoloji',
          icon: '🗺️',
          cost: 3,
          description: 'Metin terminali görsel ağ haritasına yükselir. Güvenlik duvarlarını zayıf e-posta sunucuları üzerinden aş.',
          effects: ['+5% başarı oranı tüm saldırılarda', 'Ağ haritası görselleştirmesi'],
          prerequisite: null,
        },
        {
          id: 'pwned-db',
          name: 'Pwned-DB',
          icon: '🔐',
          cost: 4,
          description: 'Çalışan e-postalarını veri sızıntısı araçlarında ara. Tekrar kullanılan parolaları bul.',
          effects: ['+20% başarı oranı credential stuffing', 'Parola arama komutu'],
          prerequisite: 'topology',
        },
      ],
    },
    stealth: {
      id: 'stealth',
      name: 'GİZLİLİK',
      icon: '🥷',
      nodes: [
        {
          id: 'proxy-chaining',
          name: 'Proxy Zincirleme',
          icon: '🌐',
          cost: 3,
          description: 'Dünya haritasında 3 ülke üzerinden bağlantı yönlendir. +İz gecikme, -İndirme hızı.',
          effects: ['-30% şüphe artışı', '+5% başarı oranı', 'Dünya haritası'],
          prerequisite: null,
        },
        {
          id: 'log-wiper',
          name: 'Log Silici',
          icon: '🧹',
          cost: 4,
          description: 'Log silme mini-oyunu. 10 saniyede komutu yaz, izleri sil.',
          effects: ['Log silme mini-oyunu', 'Başarılı silme: -15% şüphe', 'Başarısız: +5% şüphe'],
          prerequisite: 'proxy-chaining',
        },
      ],
    },
    exploitation: {
      id: 'exploitation',
      name: 'İSTİSMAR',
      icon: '💣',
      nodes: [
        {
          id: 'payload-builder',
          name: 'Payload Oluşturucu',
          icon: '🔧',
          cost: 4,
          description: 'Hedef OS/AV yapılandırmasına uygun zararlı yazılım oluştur. Yanlış yapılandırma anında alarm tetikler.',
          effects: ['+10% başarı oranı Tier 3 saldırılar', 'Yeni saldırı türleri: Supply Chain, Dependency Confusion'],
          prerequisite: null,
        },
        {
          id: 'zero-day-hunter',
          name: 'Zero-Day Avcısı',
          icon: '🎯',
          cost: 6,
          description: 'Yazılımları tersine mühendislik ile analiz et ve global exploit bul.',
          effects: ['Zero-Day saldırısı', 'Kernel Rootkit saldırısı', 'En düşük şüphe çarpanı'],
          prerequisite: 'payload-builder',
        },
      ],
    },
    social: {
      id: 'social',
      name: 'SOSYAL MÜH.',
      icon: '🎭',
      nodes: [
        {
          id: 'deepfake-voice',
          name: 'Deepfake Ses',
          icon: '🎙️',
          cost: 4,
          description: 'Yönetici ses kayıtlarını topla, sentezleyici ile IT parolalarını telefonla sıfırlat.',
          effects: ['Ses klonlama komutu', '+15% başarı oranı sosyal saldırılar'],
          prerequisite: null,
        },
        {
          id: 'custom-phishing',
          name: 'Özel Phishing',
          icon: '🎣',
          cost: 5,
          description: 'Sosyal medyayı analiz edip hedefli PDF payload oluştur. (ör: "Hasta Kedi")',
          effects: ['Spear Phishing saldırısı', 'Hedefli payload oluşturma', '+25% phishing başarı oranı'],
          prerequisite: 'deepfake-voice',
        },
      ],
    },
    operations: {
      id: 'operations',
      name: 'OPERASYON',
      icon: '⚙️',
      nodes: [
        {
          id: 'c2-ransomware',
          name: 'C2 Fidye Yazılımı',
          icon: '🏴‍☠️',
          cost: 5,
          description: 'Veritabanı kontrol paneli. Seçenekler: Sızdır, Kilitle veya Sessiz Vergi. Özel fidye miktarı gir.',
          effects: [
            'Double Extortion saldırısı',
            'Fidye kontrol paneli',
            'Talep > Tolerans ise hedef polisi arar!',
          ],
          prerequisite: null,
        },
        {
          id: 'apt-toolkit',
          name: 'APT Araç Seti',
          icon: '🛠️',
          cost: 6,
          description: 'Gelişmiş kalıcı tehdit araçları. Ağ haritalama, yedek silme, payload dağıtım.',
          effects: ['APT saldırısı', 'Kernel Rootkit desteği', 'Tam ağ kontrolü'],
          prerequisite: 'c2-ransomware',
        },
      ],
    },
  };
  function show() {
    let branchesHtml = '';
    Object.values(BRANCHES).forEach(function (branch) {
      let nodesHtml = '';
      branch.nodes.forEach(function (node, index) {
        const state = getNodeState(node);
        const stateClass = state;
        nodesHtml += `
          <div class="skill-node ${stateClass}" data-node="${node.id}" data-branch="${branch.id}">
            <div class="node-icon">${node.icon}</div>
            <div class="node-name">${node.name}</div>
            <div class="node-desc">${node.description.substring(0, 60)}...</div>
            <div class="node-cost">${state === 'unlocked' ? 'AÇIK' : node.cost + ' puan'}</div>
          </div>
        `;
        if (index < branch.nodes.length - 1) {
          const nextNode = branch.nodes[index + 1];
          const connectorActive = GameState.hasSkill(node.id) ? 'active' : '';
          nodesHtml += `<div class="node-connector ${connectorActive}"></div>`;
        }
      });
      branchesHtml += `
        <div class="skill-branch" data-branch="${branch.id}">
          <div class="branch-icon">${branch.icon}</div>
          <div class="branch-title">${branch.name}</div>
          ${nodesHtml}
        </div>
      `;
    });
    const overlayHtml = `
      <div class="skilltree-container">
        <div class="skilltree-header">
          <div class="st-title">YETENEK AĞACI</div>
          <div class="st-points">Yetenek Puanı: <span id="st-points-value">${GameState.get('skillPoints')}</span></div>
          <button class="st-close" id="st-close">✕</button>
        </div>
        <div class="skilltree-branches">
          ${branchesHtml}
        </div>
      </div>
    `;
    let $overlay = $('.skilltree-overlay');
    if (!$overlay.length) {
      $overlay = $('<div class="skilltree-overlay"></div>');
      $('body').append($overlay);
    }
    $overlay.html(overlayHtml);
    $overlay.addClass('visible');
    $overlay.find('#st-close').on('click', hide);
    $overlay.find('.skill-node').on('click', function () {
      const nodeId = $(this).data('node');
      const branchId = $(this).data('branch');
      attemptUnlock(nodeId, branchId);
    });
    $(document).on('keydown.skilltree', function (e) {
      if (e.key === 'Escape') hide();
    });
    $overlay.find('.skill-node').on('mouseenter', function (e) {
      const nodeId = $(this).data('node');
      showTooltip(nodeId, e);
    }).on('mouseleave', function () {
      hideTooltip();
    });
  }
  function hide() {
    $('.skilltree-overlay').removeClass('visible');
    $(document).off('keydown.skilltree');
    hideTooltip();
  }
  function getNodeState(node) {
    if (GameState.hasSkill(node.id)) return 'unlocked';
    if (node.prerequisite && !GameState.hasSkill(node.prerequisite)) return 'locked';
    if (GameState.get('skillPoints') >= node.cost) return 'available';
    return 'locked';
  }
  function attemptUnlock(nodeId, branchId) {
    const branch = BRANCHES[branchId];
    const node = branch.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const state = getNodeState(node);
    if (state === 'unlocked') {
      Taskbar.showNotification('ℹ️ Bilgi', node.name + ' zaten açık.');
      return;
    }
    if (state === 'locked') {
      if (node.prerequisite && !GameState.hasSkill(node.prerequisite)) {
        Taskbar.showNotification('🔒 Kilitli', 'Önce "' + node.prerequisite + '" açılmalı.');
      } else {
        Taskbar.showNotification('🔒 Kilitli', 'Yeterli yetenek puanı yok. (Gerekli: ' + node.cost + ')');
      }
      return;
    }
    if (state === 'available') {
      const points = GameState.get('skillPoints');
      GameState.set('skillPoints', points - node.cost);
      GameState.unlockSkill(nodeId);
      Taskbar.showNotification('⭐ Yetenek Açıldı!', node.name + ' — ' + node.description.substring(0, 50) + '...');
      show();
    }
  }
  function showTooltip(nodeId, e) {
    let node = null;
    Object.values(BRANCHES).forEach(function (branch) {
      branch.nodes.forEach(function (n) {
        if (n.id === nodeId) node = n;
      });
    });
    if (!node) return;
    let effectsHtml = '';
    node.effects.forEach(function (eff) {
      effectsHtml += '<li>' + eff + '</li>';
    });
    const state = getNodeState(node);
    const stateText = state === 'unlocked' ? '✓ Açık' :
      state === 'available' ? '● Mevcut (' + node.cost + ' puan)' :
      '🔒 Kilitli';
    const html = `
      <div class="tt-name">${node.icon} ${node.name}</div>
      <div class="tt-desc">${node.description}</div>
      <div class="tt-effects"><ul>${effectsHtml}</ul></div>
      <div style="margin-top:8px;font-size:11px;color:#6a6e74;">${stateText}</div>
    `;
    let $tooltip = $('.skill-tooltip');
    if (!$tooltip.length) {
      $tooltip = $('<div class="skill-tooltip"></div>');
      $('body').append($tooltip);
    }
    $tooltip.html(html);
    $tooltip.addClass('visible');
    const x = Math.min(e.clientX + 16, window.innerWidth - 270);
    const y = Math.min(e.clientY + 16, window.innerHeight - 200);
    $tooltip.css({ left: x, top: y });
  }
  function hideTooltip() {
    $('.skill-tooltip').removeClass('visible');
  }
  return {
    show,
    hide,
    BRANCHES,
  };
})();
