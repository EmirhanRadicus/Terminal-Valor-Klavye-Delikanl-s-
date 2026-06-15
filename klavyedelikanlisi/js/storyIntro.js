const StoryIntro = (function () {
  let _onComplete = null;
  let _cur = 0;
  let _canAdvance = true;
  let _pacmanStop = null;
  const SCENES = [
    { id:'s0',  type:'scene',  img:'story_alarm.png', sp:'', text:'Sabah 07:30. Telefon alarm çalıyor.' },
    { id:'s1',  type:'choice', img:'story_alarm.png', sp:'NE YAPIYORSUN?', text:'',
      choices:[
        { label:'5 dakika daha uyu.', jump:'sleep1' },
        { label:'Kalk. Geç kalma.',   jump:'wake1'  },
      ]
    },
    { id:'sleep1', type:'scene', img:'story_alarm.png', imgF:'brightness(0.25)', sp:'', text:'5 dakika... 10... 30...' },
    { id:'sleep2', type:'scene', img:'story_alarm.png', imgF:'brightness(0.25)', sp:'', text:'Uyandığında saat 10:15\'ti. Okul çoktan başlamıştı.' },
    { id:'sleep3', type:'scene', img:'story_alarm.png', imgF:'brightness(0.25)', sp:'', text:'Bugün matematik sınavı vardı. Öğretmen yoklama aldığında adın geçti — ama sen yoktun.', next:'drama0' },
    { id:'wake1',  type:'scene',  img:'story_school.png', sp:'', text:'Okula yetiştin. Sınıf doluydu. Bir süreliğine her şey normaldi.' },
    { id:'wake2',  type:'math' },
    { id:'wake3',  type:'scene',  img:'story_school.png', sp:'', text:'Zil çaldı. Kağıtlar toplandı. "Yeter ki geçeyim," diye düşündün.' },
    { id:'wake4',  type:'chapter', title:'ÖĞLEDEN SONRA' },
    { id:'wake5',  type:'scene',  img:'story_drama.png',  sp:'', text:'Eve dönerken aklından sınav geçiyordu. Merdivenleri çıkarken içeriden sesler geldi.' , next:'drama1' },
    { id:'drama0', type:'scene',  img:'story_drama.png', sp:'', text:'Öğleden sonra oturma odasına geçtin. Babandan sesler geliyordu. Yabancı bir sesle konuşuyordu.' },
    { id:'drama1', type:'scene',  img:'story_drama.png', sp:'', text:'Kapı aralıktı. İçeride baban ve yabancı bir kadın vardı.' },
    { id:'drama2', type:'scene',  img:'story_drama.png', sp:'BABA', text:'"Git odana. Annenle konuşacağız."' },
    { id:'drama3', type:'scene',  img:'story_drama.png', sp:'', text:'Gitmedin. Merdivenden izledin. Her şeyi gördün.' },
    { id:'drama4', type:'scene',  img:'story_drama.png', sp:'ANNE', text:'"Çık bu evden! Bir daha bu kapıdan içeri girme!"' },
    { id:'drama5', type:'scene',  img:'story_drama.png', sp:'BABA', text:'"Zaten gidiyorum. Para meselesine gelince — kendi başınızın çaresine bakarsınız."' },
    { id:'drama6', type:'scene',  img:'story_drama.png', sp:'', text:'Kapı kapandı. Baban bavulunu alıp gitti. Annen yere çöktü. Sen de öyle kaldın.' },
    { id:'drama7', type:'chapter', title:'3 GÜN SONRA' },
    { id:'drama8', type:'scene',  img:'story_drama.png', imgF:'brightness(0.22) saturate(0.4)', sp:'ANNE', text:'"Kirayı ödeyemiyoruz. Buzdolabında neredeyse hiçbir şey kalmadı."' },
    { id:'drama9', type:'scene',  img:'story_drama.png', imgF:'brightness(0.22) saturate(0.4)', sp:'', text:'Banka hesabında 847 lira. Kira 4.200 lira.' },
    { id:'choice2', type:'choice', img:'story_drama.png', imgF:'brightness(0.22) saturate(0.4)',
      sp:'NE YAPACAKSIN?', text:'Para kazanman lazım.',
      choices:[
        { label:'Bilgisayarı aç.', jump:'pc0' },
        { label:'Dışarı çık, iş ara.', jump:'jobs0' },
      ]
    },
    { id:'jobs0', type:'pacman' },
    { id:'jobs1', type:'scene', img:'story_street.png', imgF:'brightness(0.25) saturate(0.4)', sp:'', text:'30 saniye. Onlarca iş ilanı. Hiçbiri seni tutmadı.' },
    { id:'jobs2', type:'scene', img:'story_street.png', imgF:'brightness(0.25) saturate(0.4)', sp:'', text:'Yorgun ve boş elle döndün. Kapıyı açtın. Ekranın ışığı seni karşıladı.' },
    { id:'pc0',   type:'scene',   img:'story_pc.png', sp:'', text:'Bilgisayarı açtın. Ekran karanlık odayı aydınlattı.' },
    { id:'pc1',   type:'scene',   img:'story_pc.png', sp:'', text:'"Hacking for beginners" — 3.2 milyon sonuç. Bir sayfa. Sonra bir başkası.' },
    { id:'pc2',   type:'scene',   img:'story_pc.png', sp:'', text:'Sabah 03:00\'tü. Ama bir şeyler öğrenmiştin.' },
    { id:'pc3',   type:'scene',   img:'story_pc.png', sp:'BEN', text:'"Eğer bunu yapabilsem... para kazanabilirim."' },
    { id:'pc4',   type:'chapter', title:'BAŞLANGICIN SONU' },
    { id:'end',   type:'end' },
  ];
  const ID_MAP = {};
  SCENES.forEach(function(s, i){ if(s.id) ID_MAP[s.id] = i; });
  function jumpTo(id) {
    const idx = ID_MAP[id];
    if (idx !== undefined) { _cur = idx; showScene(idx); }
    else showScene(_cur + 1);
  }
  function $s(id){ return document.getElementById(id); }
  function buildHTML(){
    const el = document.createElement('div');
    el.id = 'story-overlay';
    el.innerHTML =
      '<div id="story-blackout"></div>' +
      '<div id="story-chapter-screen" style="display:none;position:absolute;inset:0;background:#000;z-index:5;display:none;flex-direction:column;align-items:center;justify-content:center;">' +
        '<div id="sch-label" style="font-size:11px;letter-spacing:5px;color:#444;text-transform:uppercase;margin-bottom:14px;"></div>' +
        '<div id="sch-name" style="font-size:30px;font-weight:700;color:#ddd;letter-spacing:2px;"></div>' +
      '</div>' +
      '<div id="story-img"></div>' +
      '<div id="story-bottom">' +
        '<div id="story-speaker"></div>' +
        '<div id="story-text"></div>' +
        '<div id="story-choices"></div>' +
        '<div id="story-continue">devam etmek için tıkla</div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', onClick);
  }
  function onClick(e){
    const t = e.target;
    if (t.classList.contains('story-choice')) return;
    if (t.classList.contains('math-opt')) return;
    if ($s('story-math-wrap')) return;
    if ($s('story-pacman-wrap')) return;
    if (!_canAdvance) return;
    if ($s('story-choices') && $s('story-choices').children.length) return;
    _canAdvance = false;
    setTimeout(function(){ _canAdvance = true; }, 450);
    showScene(_cur + 1);
  }
  function setImg(src, filter){
    const el = $s('story-img');
    el.style.backgroundImage = src ? "url('" + src + "')" : 'none';
    el.style.filter = filter || '';
    el.style.flex   = src ? '1' : '0';
    el.style.display = src ? 'block' : 'none';
  }
  function setSp(name){
    const el = $s('story-speaker');
    el.textContent = name || '';
    el.className = name ? 'has-name' : '';
  }
  function blackout(on, cb){
    const el = $s('story-blackout');
    if(!el){ if(cb) cb(); return; }
    if(on){ el.classList.add('active'); setTimeout(cb||function(){}, 560); }
    else  { setTimeout(function(){ el.classList.remove('active'); if(cb) cb(); }, 40); }
  }
  function clearExtras(){
    ['story-math-wrap','story-pacman-wrap'].forEach(function(id){
      const e = $s(id); if(e) e.remove();
    });
  }
  function showScene(idx){
    if(idx >= SCENES.length){ finish(); return; }
    const s = SCENES[idx];
    _cur = idx;
    if(s.type === 'end')     { finish(); return; }
    if(s.type === 'chapter') { showChapter(s.title, function(){ showScene(idx+1); }); return; }
    if(s.type === 'math')    { showMath(function(){ showScene(idx+1); }); return; }
    if(s.type === 'pacman')  { showPacman(function(){ showScene(idx+1); }); return; }
    blackout(true, function(){
      clearExtras();
      setImg(s.img, s.imgF);
      setSp(s.sp);
      $s('story-text').textContent = s.text || '';
      $s('story-choices').innerHTML = '';
      const hasCh = s.type === 'choice' && s.choices;
      $s('story-continue').style.display = hasCh ? 'none' : 'block';
      if(hasCh){
        s.choices.forEach(function(ch, i){
          const btn = document.createElement('button');
          btn.className = 'story-choice';
          btn.innerHTML = '<span class="choice-key">' + (i+1) + '</span>' + ch.label;
          btn.onclick = function(){ $s('story-choices').innerHTML=''; jumpTo(ch.jump); };
          $s('story-choices').appendChild(btn);
        });
      }
      blackout(false);
    });
  }
  function showChapter(title, cb){
    blackout(true, function(){
      clearExtras();
      setImg(null); setSp('');
      $s('story-text').textContent = '';
      $s('story-choices').innerHTML = '';
      $s('story-continue').style.display = 'none';
      const sc = $s('story-chapter-screen');
      $s('sch-label').textContent = '— BÖLÜM —';
      $s('sch-name').textContent  = title;
      sc.style.display = 'flex';
      sc.style.opacity = '0';
      sc.style.transition = 'opacity 0.4s';
      setTimeout(function(){ sc.style.opacity = '1'; }, 50);
      blackout(false);
      setTimeout(function(){
        sc.style.opacity = '0';
        setTimeout(function(){ sc.style.display = 'none'; cb(); }, 450);
      }, 2000);
    });
  }
  const MQS = [
    { q:'12 × 8 = ?',      opts:[{v:84,l:'A'},{v:96,l:'B'},{v:100,l:'C'},{v:88,l:'D'}],  ans:96  },
    { q:'144 ÷ 12 = ?',    opts:[{v:11,l:'A'},{v:14,l:'B'},{v:12,l:'C'},{v:13,l:'D'}],   ans:12  },
    { q:'(7+5) × 4 = ?',   opts:[{v:44,l:'A'},{v:52,l:'B'},{v:56,l:'C'},{v:48,l:'D'}],   ans:48  },
  ];
  function showMath(onDone){
    blackout(true, function(){
      clearExtras();
      setImg('story_school.png','brightness(0.45) saturate(0.6)');
      setSp('ÖĞRETMEN');
      $s('story-text').textContent = 'Adınızı yazın ve başlayın.';
      $s('story-choices').innerHTML = '';
      $s('story-continue').style.display = 'none';
      const wrap = document.createElement('div');
      wrap.id = 'story-math-wrap';
      wrap.innerHTML =
        '<div id="story-math-paper">' +
          '<div class="math-paper-header">T.C. MİLLÎ EĞİTİM BAKANLIĞI &nbsp;|&nbsp; <span>MATEMATİK SINAVI</span></div>' +
          '<div class="math-q-label">SORU 1/3</div>' +
          '<div class="math-question-text"></div>' +
          '<div class="math-opts"></div>' +
          '<div id="math-progress"></div>' +
        '</div>';
      const choices = $s('story-choices');
      choices.parentNode.insertBefore(wrap, choices);
      blackout(false, function(){
        let qi = 0, score = 0;
        function render(){
          if(qi >= MQS.length){
            setTimeout(function(){
              if($s('story-math-wrap')) $s('story-math-wrap').remove();
              setSp('');
              $s('story-text').textContent = score===3
                ? 'Zil çaldı. '+score+'/3 doğru. Fena değildi.'
                : 'Zil çaldı. '+score+'/3 doğru. Daha çok çalışman lazım.';
              $s('story-continue').style.display = 'block';
              onDone();
            }, 600);
            return;
          }
          const q = MQS[qi];
          const paper = $s('story-math-paper');
          paper.querySelector('.math-q-label').textContent = 'SORU '+(qi+1)+'/3';
          paper.querySelector('.math-question-text').textContent = q.q;
          paper.querySelector('#math-progress').textContent = '';
          const od = paper.querySelector('.math-opts');
          od.innerHTML = '';
          q.opts.forEach(function(opt){
            const btn = document.createElement('button');
            btn.className = 'math-opt';
            btn.textContent = opt.l + ')  ' + opt.v;
            btn.onclick = function(){
              const ok = opt.v === q.ans;
              btn.classList.add(ok ? 'correct':'wrong');
              if(ok) score++;
              else {
                od.querySelectorAll('.math-opt').forEach(function(b){
                  if(parseInt(b.textContent.split(')')[1]) === q.ans) b.classList.add('correct');
                });
              }
              od.querySelectorAll('.math-opt').forEach(function(b){ b.onclick=null; });
              qi++;
              setTimeout(render, 850);
            };
            od.appendChild(btn);
          });
        }
        render();
      });
    });
  }
  function showPacman(onDone){
    blackout(true, function(){
      clearExtras();
      setImg('story_street.png','brightness(0.35) saturate(0.5)');
      setSp('');
      $s('story-text').textContent = 'İş ilanları duvarlarda, vitrinlerde, her yerde. Ama hiçbiri seni beklemiyor.';
      $s('story-choices').innerHTML = '';
      $s('story-continue').style.display = 'none';
      const wrap = document.createElement('div');
      wrap.id = 'story-pacman-wrap';
      wrap.innerHTML =
        '<div id="story-pacman-header">Süre: <span id="story-pacman-timer">30</span>s</div>' +
        '<canvas id="story-pacman-canvas"></canvas>' +
        '<div id="story-pacman-score" style="color:#444;font-size:11px;margin-top:6px;font-family:monospace;">Yön tuşları ile hareket et — İş formlarını yakala!</div>';
      const choices = $s('story-choices');
      choices.parentNode.insertBefore(wrap, choices);
      blackout(false, function(){ startPacman(onDone); });
    });
  }
  function startPacman(onDone){
    const canvas = $s('story-pacman-canvas');
    if(!canvas) return;
    const M = [
      "11111111111111111111111111",
      "10000000001100000000000001",
      "10110111101101101110110101",
      "10110000001100000001100101",
      "10000110111101111011000001",
      "11100110000000001101100111",
      "10000000111001110000000001",
      "10111101100001001101111001",
      "10000001100001001100000001",
      "10110111111001111110110001",
      "10110000000000000000110001",
      "10000110111001110110000001",
      "10111110000000000011111001",
      "10000000110001100000000001",
      "10110111110001111101100001",
      "10110000000000000001100111",
      "10000110111001110110000001",
      "10111110100001001011111001",
      "10000000000000000000000001",
      "11111111111111111111111111",
    ];
    const ROWS = M.length, COLS = M[0].length;
    const CELL = 16;
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;
    const ctx = canvas.getContext('2d');
    const maze = M.map(function(row){ return row.split('').map(Number); });
    function ok(r,c){ return r>=0&&r<ROWS&&c>=0&&c<COLS&&maze[r][c]===0; }
    const P = {
      r:1, c:1,
      dir:{r:0,c:1}, nextDir:{r:0,c:1},
      tick:0, SPEED:8,
      mouth:0.08, mDir:1
    };
    const ghosts = [
      {r:9,c:12, color:'#f9ca24', dir:{r:0,c:1},  tick:0, SPEED:14},
      {r:9,c:3,  color:'#6ab04c', dir:{r:1,c:0},  tick:0, SPEED:16},
      {r:9,c:22, color:'#eb4d4b', dir:{r:-1,c:0}, tick:0, SPEED:18},
    ];
    let timeLeft = 30, running = true, raf;
    const onKey = function(e){
      const map = {'ArrowUp':{r:-1,c:0},'ArrowDown':{r:1,c:0},'ArrowLeft':{r:0,c:-1},'ArrowRight':{r:0,c:1}};
      if(map[e.key]){ P.nextDir = map[e.key]; e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    const timer = setInterval(function(){
      if(!running) return;
      timeLeft--;
      const el = $s('story-pacman-timer');
      if(el) el.textContent = timeLeft;
      if(timeLeft <= 0){ stop(); }
    }, 1000);
    function stop(){
      if(!running) return;
      running = false;
      clearInterval(timer);
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      _pacmanStop = null; 
      const wrap = $s('story-pacman-wrap');
      if(wrap) wrap.remove();
      onDone();
    }
    function updateP(){
      P.tick++;
      if(P.tick < P.SPEED) return;
      P.tick = 0;
      if(ok(P.r+P.nextDir.r, P.c+P.nextDir.c)) P.dir = P.nextDir;
      const nr=P.r+P.dir.r, nc=P.c+P.dir.c;
      if(ok(nr,nc)){ P.r=nr; P.c=nc; }
    }
    function updateGhosts(){
      ghosts.forEach(function(g){
        g.tick++;
        if(g.tick < g.SPEED) return;
        g.tick = 0;
        const dirs = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];
        const possible = dirs.filter(function(d){ return ok(g.r+d.r, g.c+d.c); });
        if(!possible.length) return;
        possible.sort(function(a,b){
          const da = Math.abs(g.r+a.r-P.r)+Math.abs(g.c+a.c-P.c);
          const db = Math.abs(g.r+b.r-P.r)+Math.abs(g.c+b.c-P.c);
          return db-da; 
        });
        const move = Math.random()<0.8 ? possible[0] : possible[Math.floor(Math.random()*possible.length)];
        g.r += move.r; g.c += move.c; g.dir = move;
      });
    }
    function draw(){
      ctx.fillStyle='#080808';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
        if(maze[r][c]===1){
          ctx.fillStyle='#162616';
          ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
          ctx.strokeStyle='#0c1f0c';
          ctx.lineWidth=1;
          ctx.strokeRect(c*CELL+0.5,r*CELL+0.5,CELL-1,CELL-1);
        }
      }
      P.mouth += 0.1*P.mDir;
      if(P.mouth>0.3||P.mouth<0.02) P.mDir*=-1;
      const angle = Math.atan2(P.dir.r,P.dir.c);
      const px=P.c*CELL+CELL/2, py=P.r*CELL+CELL/2, pr=CELL/2-1;
      ctx.fillStyle='#f9ca24';
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.arc(px,py,pr,angle+P.mouth,angle+Math.PI*2-P.mouth);
      ctx.closePath();
      ctx.fill();
      ghosts.forEach(function(g){
        const gx=g.c*CELL+CELL/2, gy=g.r*CELL+CELL/2, gr=CELL/2-1;
        ctx.fillStyle=g.color;
        ctx.beginPath();
        ctx.arc(gx,gy,gr,Math.PI,0);
        const bot=gy+gr;
        ctx.lineTo(gx+gr,bot);
        for(let i=3;i>=0;i--){
          const wx=gx-gr+(i*gr*2/3);
          ctx.quadraticCurveTo(wx+gr/3,bot-(i%2===0?gr*0.45:0),wx,bot-(i%2!==0?gr*0.45:0));
        }
        ctx.lineTo(gx-gr,bot);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle='#fff';
        ctx.beginPath();
        ctx.arc(gx-gr*0.3,gy-gr*0.05,gr*0.28,0,Math.PI*2);
        ctx.arc(gx+gr*0.3,gy-gr*0.05,gr*0.28,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#00f';
        ctx.beginPath();
        ctx.arc(gx-gr*0.3+gr*0.12*g.dir.c,gy-gr*0.05+gr*0.12*g.dir.r,gr*0.14,0,Math.PI*2);
        ctx.arc(gx+gr*0.3+gr*0.12*g.dir.c,gy-gr*0.05+gr*0.12*g.dir.r,gr*0.14,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle=g.color;
        ctx.font='bold 7px monospace';
        ctx.textAlign='center';
        ctx.fillText('İŞ FORMU',gx,gy-gr-3);
      });
    }
    function loop(){
      if(!running) return;
      updateP();
      updateGhosts();
      draw();
      raf = requestAnimationFrame(loop);
    }
    loop();
    _pacmanStop = stop;
  }
  function finish(){
    if (_pacmanStop) {
      _pacmanStop();
    }
    const el = $s('story-overlay');
    if(el){
      el.classList.add('fade-out');
      setTimeout(function(){ el.remove(); if(_onComplete) _onComplete(); }, 850);
    } else { if(_onComplete) _onComplete(); }
  }
  function start(cb){
    _onComplete = cb;
    _cur = 0;
    _canAdvance = true;
    buildHTML();
    setTimeout(function(){ showScene(0); }, 300);
  }
  return { start };
})();
