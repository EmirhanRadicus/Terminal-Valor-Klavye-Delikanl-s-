/* ============================================
   IDS TRAP — Dark Forum standard browser penalty
   ============================================ */
const IdsTrap = (function () {
  let _active = false;
  let _timer = 30;
  let _timerInterval;
  let _animFrame;
  let _matrixFrame;

  // Snake game vars
  let ctx;
  let width, height;
  let playerX, playerY, enemyX, enemyY;
  let dx = 0, dy = 0; // player velocity
  let pxSize = 3; // Player size
  let eSize = 4; // Enemy size

  // Matrix vars
  let mCtx;
  let mWidth, mHeight;
  let columns;
  let drops;

  function initMatrix() {
    const canvas = document.getElementById('ids-matrix-canvas');
    if (!canvas) return;
    
    mCtx = canvas.getContext('2d');
    
    // Set exact dimensions based on window size
    canvas.width = window.innerWidth * 0.4;
    canvas.height = window.innerHeight;
    mWidth = canvas.width;
    mHeight = canvas.height;

    const fontSize = 16;
    columns = Math.floor(mWidth / fontSize);
    drops = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // Start offscreen
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()+-=";

    function drawMatrix() {
      if (!_active) return;
      mCtx.fillStyle = "rgba(0, 0, 0, 0.05)";
      mCtx.fillRect(0, 0, mWidth, mHeight);
      
      mCtx.fillStyle = "#0F0";
      mCtx.font = fontSize + "px 'JetBrains Mono', monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        // Draw character
        if (drops[i] * fontSize > 0) {
          mCtx.fillText(text, i * fontSize, drops[i] * fontSize);
        }
        
        // Reset randomly to create continuous stream
        if (drops[i] * fontSize > mHeight && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      _matrixFrame = requestAnimationFrame(drawMatrix);
    }
    
    _matrixFrame = requestAnimationFrame(drawMatrix);
  }

  function initSnake() {
    const canvas = document.getElementById('ids-snake-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;

    // Start positions
    playerX = width / 2;
    playerY = height / 2;
    enemyX = 20;
    enemyY = 20;
    dx = 0;
    dy = 0;

    // Key bindings
    $(document).off('keydown.ids').on('keydown.ids', function (e) {
      if (!_active) return;
      const key = e.key.toLowerCase();
      const speed = 2.5;
      
      if (key === 'arrowup' || key === 'w') { dx = 0; dy = -speed; }
      else if (key === 'arrowdown' || key === 's') { dx = 0; dy = speed; }
      else if (key === 'arrowleft' || key === 'a') { dx = -speed; dy = 0; }
      else if (key === 'arrowright' || key === 'd') { dx = speed; dy = 0; }
    });

    function drawGame() {
      if (!_active) return;

      // Clear
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);

      // Move player
      playerX += dx;
      playerY += dy;

      // Wall collision bounds
      if (playerX < 0) playerX = 0;
      if (playerX > width - pxSize) playerX = width - pxSize;
      if (playerY < 0) playerY = 0;
      if (playerY > height - pxSize) playerY = height - pxSize;

      // Move enemy (chase logic)
      const exDx = playerX - enemyX;
      const exDy = playerY - enemyY;
      const dist = Math.sqrt(exDx * exDx + exDy * exDy);
      
      // Enemy speed ramps up as timer goes down (from 1.5 to 3.0)
      let eSpeed = 1.5 + ((30 - _timer) / 20); 
      
      if (dist > 0) {
        enemyX += (exDx / dist) * eSpeed;
        enemyY += (exDy / dist) * eSpeed;
      }

      // Draw player (green)
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(playerX, playerY, pxSize, pxSize);

      // Draw enemy (red)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemyX, enemyY, eSize, eSize);

      // Collision detection (AABB)
      if (
        playerX < enemyX + eSize &&
        playerX + pxSize > enemyX &&
        playerY < enemyY + eSize &&
        playerY + pxSize > enemyY
      ) {
        failTrap();
        return;
      }

      _animFrame = requestAnimationFrame(drawGame);
    }

    _animFrame = requestAnimationFrame(drawGame);
  }

  function trigger() {
    if (_active) return;
    
    _active = true;
    _timer = 30;
    
    // Play sound
    try {
      const audio = new Audio('assets/error.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => {});
    } catch(e) {}

    $('#ids-overlay').addClass('active');
    $('#ids-timer').text(_timer);

    initMatrix();
    initSnake();

    _timerInterval = setInterval(function () {
      _timer--;
      $('#ids-timer').text(_timer);
      if (_timer <= 0) {
        successTrap();
      }
    }, 1000);
  }

  function failTrap() {
    stopTrap();
    
    // Penalty calculation: S_new = S_current + ((100 - S_current) * 0.50)
    let s = GameState.get('suspicion');
    let penalty = (100 - s) * 0.50;
    
    GameState.addSuspicion(penalty);
    
    Taskbar.showNotification('❌ İhlal', 'Ağa takıldın! Şüphe seviyesi büyük oranda arttı.');
  }

  function successTrap() {
    stopTrap();
    Taskbar.showNotification('✅ Başarılı', 'İzini kaybettirdin.');

    // Fetch Real IP & City
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const ip = data.ip || '127.0.0.1';
        const city = data.city || 'Bilinmeyen Konum';
        
        // Use a slight delay to let the UI settle before sending message
        setTimeout(() => {
          MessengerApp.forceReceiveMessage('Bilinmeyen', 'Şimdilik kaçabilirsin ancak elbet bir gün oltamıza düşeceksin.');
          setTimeout(() => {
            MessengerApp.forceReceiveMessage('Bilinmeyen', 'Kendini çok gizli sanma. IP Adresin: ' + ip + ', Yaşadığın Şehir: ' + city);
          }, 2000);
        }, 1000);
      })
      .catch(err => {
        setTimeout(() => {
          MessengerApp.forceReceiveMessage('Bilinmeyen', 'Şimdilik kaçabilirsin ancak elbet bir gün oltamıza düşeceksin.');
          setTimeout(() => {
            MessengerApp.forceReceiveMessage('Bilinmeyen', 'Seni bulacağız.');
          }, 2000);
        }, 1000);
      });
  }

  function stopTrap() {
    _active = false;
    clearInterval(_timerInterval);
    cancelAnimationFrame(_animFrame);
    cancelAnimationFrame(_matrixFrame);
    $(document).off('keydown.ids');
    $('#ids-overlay').removeClass('active');
  }

  return {
    trigger
  };
})();
