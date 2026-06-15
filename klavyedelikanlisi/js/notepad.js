const NotepadApp = (function () {
  let _tabs = {};
  let _activeTab = null;
  function open() {
    const contentHtml = `
      <div class="notepad-container">
        <div class="notepad-tabs" id="notepad-tabs">
          <button class="notepad-tab-add" id="notepad-new-tab" title="Yeni sekme">+</button>
        </div>
        <div class="notepad-editor">
          <div class="notepad-line-numbers" id="notepad-lines"></div>
          <textarea class="notepad-textarea" id="notepad-text" 
                    placeholder="Notlarınızı buraya yazın..."></textarea>
        </div>
        <div class="notepad-statusbar">
          <div class="status-left">
            <span id="notepad-cursor-pos">Satır 1, Sütun 1</span>
            <span class="saved-indicator" id="notepad-saved" style="display:none;">✓ Kaydedildi</span>
          </div>
          <div class="status-right">
            <span id="notepad-char-count">0 karakter</span>
          </div>
        </div>
      </div>
    `;
    WindowManager.open('notepad', 'Not Defteri', '📝', contentHtml, {
      width: 640,
      height: 450,
      onInit: function ($window) {
        bindEvents($window);
        loadNotesFromState();
      },
    });
  }
  function bindEvents($window) {
    $window.find('#notepad-text').on('input', function () {
      updateLineNumbers();
      updateCharCount();
      saveCurrentTab();
      showSaved(false);
    });
    $window.find('#notepad-text').on('keyup click', function () {
      updateCursorPosition($(this));
    });
    $window.find('#notepad-text').on('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = $(this).val();
        $(this).val(value.substring(0, start) + '    ' + value.substring(end));
        this.selectionStart = this.selectionEnd = start + 4;
        $(this).trigger('input');
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveAllToState();
        showSaved(true);
      }
    });
    $window.find('#notepad-new-tab').on('click', function () {
      const name = prompt('Dosya adı:', 'yeni_not.txt') || ('not_' + Date.now() + '.txt');
      createTab(name, '');
      switchTab(name);
    });
    $(document).on('click', '.notepad-tab', function () {
      const tabName = $(this).data('tab');
      switchTab(tabName);
    });
    $(document).on('click', '.notepad-tab .tab-close', function (e) {
      e.stopPropagation();
      const tabName = $(this).parent().data('tab');
      closeTab(tabName);
    });
  }
  function loadNotesFromState() {
    const notes = GameState.get('notes');
    let firstTab = null;
    Object.keys(notes).forEach(function (name) {
      createTab(name, notes[name]);
      if (!firstTab) firstTab = name;
    });
    if (firstTab) {
      switchTab(firstTab);
    } else {
      createTab('notlar.txt', '');
      switchTab('notlar.txt');
    }
  }
  function createTab(name, content) {
    _tabs[name] = {
      name: name,
      content: content || '',
      modified: false,
    };
    const tabHtml = `
      <div class="notepad-tab" data-tab="${name}">
        <span class="tab-name">${name}</span>
        <span class="tab-close">✕</span>
      </div>
    `;
    $('#notepad-new-tab').before(tabHtml);
  }
  function switchTab(name) {
    if (!_tabs[name]) return;
    saveCurrentTab();
    _activeTab = name;
    $('.notepad-tab').removeClass('active');
    $('.notepad-tab[data-tab="' + name + '"]').addClass('active');
    $('#notepad-text').val(_tabs[name].content);
    updateLineNumbers();
    updateCharCount();
    $('#notepad-text').focus();
  }
  function closeTab(name) {
    if (Object.keys(_tabs).length <= 1) return; 
    delete _tabs[name];
    $('.notepad-tab[data-tab="' + name + '"]').remove();
    if (_activeTab === name) {
      const remaining = Object.keys(_tabs);
      if (remaining.length) switchTab(remaining[0]);
    }
  }
  function saveCurrentTab() {
    if (_activeTab && _tabs[_activeTab]) {
      _tabs[_activeTab].content = $('#notepad-text').val();
    }
  }
  function saveAllToState() {
    saveCurrentTab();
    const notes = {};
    Object.keys(_tabs).forEach(function (name) {
      notes[name] = _tabs[name].content;
    });
    GameState.set('notes', notes);
  }
  function updateLineNumbers() {
    const text = $('#notepad-text').val() || '';
    const lineCount = text.split('\n').length;
    let lineNums = '';
    for (let i = 1; i <= lineCount; i++) {
      lineNums += i + '\n';
    }
    $('#notepad-lines').text(lineNums);
  }
  function updateCharCount() {
    const text = $('#notepad-text').val() || '';
    $('#notepad-char-count').text(text.length + ' karakter');
  }
  function updateCursorPosition($textarea) {
    const val = $textarea.val();
    const pos = $textarea[0].selectionStart;
    const lines = val.substring(0, pos).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    $('#notepad-cursor-pos').text('Satır ' + line + ', Sütun ' + col);
  }
  function showSaved(saved) {
    if (saved) {
      $('#notepad-saved').fadeIn(200);
      setTimeout(() => $('#notepad-saved').fadeOut(400), 2000);
    } else {
      $('#notepad-saved').hide();
    }
  }
  function addNote(filename, content) {
    if (!GameState.get('notes')[filename]) {
      const notes = GameState.get('notes');
      notes[filename] = content;
      GameState.set('notes', notes);
    }
    if (WindowManager.isOpen('notepad')) {
      if (!_tabs[filename]) {
        createTab(filename, content);
      }
      switchTab(filename);
    }
  }
  return {
    open,
    addNote,
    saveAllToState,
  };
})();
