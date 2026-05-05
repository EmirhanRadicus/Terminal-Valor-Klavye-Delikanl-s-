/* ============================================
   SAVE SYSTEM — LocalStorage save/load
   ============================================ */
const SaveSystem = (function () {
  const SAVE_KEY = 'klavyedelikanlisi_save';
  const AUTO_SAVE_INTERVAL = 60000; // 60 seconds
  let _autoSaveTimer = null;

  function init() {
    // Start auto-save
    _autoSaveTimer = setInterval(autoSave, AUTO_SAVE_INTERVAL);
  }

  function save() {
    try {
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        state: GameState.toJSON(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('[SaveSystem] Game saved successfully.');
      return true;
    } catch (err) {
      console.error('[SaveSystem] Save failed:', err);
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const saveData = JSON.parse(raw);
      if (!saveData.state) return false;

      GameState.fromJSON(saveData.state);
      console.log('[SaveSystem] Game loaded from save (', new Date(saveData.timestamp).toLocaleString(), ')');
      return true;
    } catch (err) {
      console.error('[SaveSystem] Load failed:', err);
      return false;
    }
  }

  function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  function autoSave() {
    if (GameState.get('gameOver')) return;
    save();
  }

  function exportSave() {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return;

    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'klavyedelikanlisi_save.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSave(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        load();
        Taskbar.showNotification('📂 Yükleme', 'Kayıt dosyası yüklendi. Sayfa yenileniyor...');
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        Taskbar.showNotification('❌ Hata', 'Kayıt dosyası geçersiz.');
      }
    };
    reader.readAsText(file);
  }

  return {
    init,
    save,
    load,
    hasSave,
    deleteSave,
    exportSave,
    importSave,
  };
})();
