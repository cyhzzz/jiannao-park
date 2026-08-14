// 主控制器：导航 / 难度 / 计时 / 最佳成绩 / 完成弹窗
(function () {
  const $ = (sel) => document.querySelector(sel);

  // 全局设置（持久化到 localStorage，默认关闭「显示下一步提示」）
  window.GameSettings = {
    KEY: 'jiannao_show_next_hint',
    showNextHint() {
      try { return localStorage.getItem(this.KEY) === '1'; } catch (e) { return false; }
    },
    setShowNextHint(v) {
      try { localStorage.setItem(this.KEY, v ? '1' : '0'); } catch (e) {}
    },
  };

  // 初始化本地 SQLite 记录库（在 WebView 内运行，失败自动降级，不阻断游戏）
  if (window.DB) window.DB.init();
  const home = $('#page-home');
  const gamePage = $('#page-game');
  const canvas = $('#game-canvas');
  const diffPanel = $('#difficulty-panel');
  const infoBar = $('#game-info-bar');
  const controls = $('#game-controls');
  const timerEl = $('#timer');
  const bestEl = $('#best-time');
  const targetHint = $('#target-hint');
  const modal = $('#complete-modal');

  let currentGame = null;
  let currentGameKey = null;
  let currentDiff = null;
  let timer = null;
  let startTime = 0;
  let elapsed = 0;
  let running = false;

  // ====== 导航 ======
  function showHome() {
    gamePage.classList.remove('active');
    recordsPage.classList.remove('active');
    home.classList.add('active');
    stopTimer();
    resetGameUI();
    modal.classList.add('hidden');   // 防弹窗残留
  }

  function openGame(gameKey) {
    currentGame = window.Games[gameKey];
    currentGameKey = gameKey;
    currentDiff = null;
    $('#game-title').textContent = currentGame.name;
    home.classList.remove('active');
    recordsPage.classList.remove('active');
    gamePage.classList.add('active');

    // 难度面板
    diffPanel.classList.remove('hidden');
    infoBar.classList.add('hidden');
    controls.classList.add('hidden');
    canvas.innerHTML = '';
    canvas.style.display = 'flex';
    document.querySelectorAll('.diff-btn').forEach((b) => b.classList.remove('selected'));
    renderScience(gameKey);
  }

  // ====== 训练科普面板（难度页下方）======
  function renderScience(gameKey) {
    const S = window.SCIENCE && window.SCIENCE[gameKey];
    const panel = $('#game-science');
    if (!S || !panel) return;
    $('#science-tag').textContent = (window.GAME_NAMES && window.GAME_NAMES[gameKey]) || '训练科普';
    $('#science-trains').textContent = S.trains || '';
    $('#science-scientist').textContent = S.scientist || '';
    $('#science-principle').textContent = S.principle || '';
  }

  // ====== 难度选择 → 直接开始 ======
  document.querySelectorAll('.diff-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentDiff = btn.dataset.diff;
      // 选定难度即开始，省去"开始训练"中间步骤（更适老）
      startGame();
    });
  });

  // ====== 计时 ======
  function startTimer() {
    startTime = Date.now();
    elapsed = 0;
    running = true;
    timerEl.textContent = '00:00';
    timer = setInterval(() => {
      elapsed = Date.now() - startTime;
      timerEl.textContent = fmt(elapsed);
    }, 200);
  }
  function stopTimer() {
    running = false;
    if (timer) clearInterval(timer);
    timer = null;
  }
  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${String(m).padStart(2, '0')}:${ss}`;
  }

  // ====== 最佳成绩（单一真相源：本地 SQLite）======
  // 弹出页与游戏内信息栏的"最佳"均直接读取 SQLite 中该游戏+难度的最小用时，
  // 不再维护独立的 localStorage 副本，确保与"我的记录"页 100% 同源、绝不分歧。
  function updateBestDisplay() {
    const b = window.DB ? window.DB.getBest(currentGameKey, currentDiff) : null;
    bestEl.textContent = (b !== null && b !== undefined) ? fmt(b) : '--:--';
  }

  // ====== 开始游戏 ======
  function startGame() {
    if (!currentDiff || !currentGame) return;
    try {
      diffPanel.classList.add('hidden');
      infoBar.classList.remove('hidden');
      controls.classList.remove('hidden');
      modal.classList.add('hidden');   // 防弹窗残留
      // 不同游戏的初始提示语
      const hintMap = {
        schulte: '按顺序从 1 点起',
        cancellation: '划掉指定数字',
        memory: '翻开卡片找相同',
        trail: '按顺序连接圆点',
        difference: '找出所有不同',
      };
      targetHint.textContent = hintMap[currentGameKey] || '开始吧';
      updateBestDisplay();
      startTimer();
      currentGame.start(canvas, currentDiff, {
        onProgress: (done, total) => {
          targetHint.textContent = `${done} / ${total}`;
        },
        onComplete: () => onComplete(),
      });
    } catch (err) {
      showError('游戏加载出现了一点问题，请返回重试');
      console.error('[startGame]', err);
    }
  }

  $('#restart-btn').addEventListener('click', () => {
    stopTimer();
    startTimer();
    currentGame.start(canvas, currentDiff, {
      onProgress: (done, total) => { targetHint.textContent = `${done} / ${total}`; },
      onComplete: () => onComplete(),
    });
  });

  function onComplete() {
    stopTimer();
    // 最佳成绩以 SQLite 为唯一真相源：先读"本局之前"的最佳，再落库
    const prevBest = window.DB ? window.DB.getBest(currentGameKey, currentDiff) : null;
    const isNewBest = (prevBest === null) || elapsed < prevBest;
    // 落库：真实本地记录（SQLite）
    if (window.DB) window.DB.recordGame(currentGameKey, currentDiff, elapsed);
    $('#modal-title').textContent = isNewBest ? '太棒了！新纪录！' : '完成得真好！';
    $('#modal-message').textContent = isNewBest
      ? '您打破了上次的最好成绩，真厉害！'
      : '您完成了这次训练，大脑又灵活了一点。';
    $('#modal-time').textContent = fmt(elapsed);
    // 弹出页的"最佳记录"= 包含本局在内的历史最小用时（即 SQLite 真实最佳）
    $('#modal-best').textContent = fmt(isNewBest ? elapsed : prevBest);
    modal.classList.remove('hidden');
  }

  // ====== 弹窗按钮 ======
  $('#modal-retry').addEventListener('click', () => {
    modal.classList.add('hidden');
    $('#restart-btn').click();
  });
  $('#modal-home').addEventListener('click', () => {
    modal.classList.add('hidden');
    showHome();
  });

  // ====== 返回 ======
  $('#back-btn').addEventListener('click', showHome);

  // ====== 我的记录（个人排行）======
  const recordsPage = $('#page-records');
  function fmt2(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function openRecords() {
    home.classList.remove('active');
    gamePage.classList.remove('active');
    recordsPage.classList.add('active');
    renderRecords();
  }
  function closeRecords() {
    recordsPage.classList.remove('active');
    home.classList.add('active');
  }
  function renderRecords() {
    if (!window.DB) return;
    const stats = window.DB.getStats();
    const best = window.DB.getLeaderboard();
    const history = window.DB.getHistory(30);
    $('#rec-total').textContent = stats.total || 0;
    $('#rec-days').textContent = stats.days || 0;

    // 个人最佳
    const bestBox = $('#records-best');
    bestBox.innerHTML = '';
    if (!best.length) {
      bestBox.innerHTML = '<p class="records-hint">还没有最佳成绩，玩一局就记下啦。</p>';
    } else {
      best.forEach((b) => {
        const row = document.createElement('div');
        row.className = 'rec-best-row';
        const name = (window.GAME_NAMES && window.GAME_NAMES[b.game]) || b.game;
        const diff = (window.DIFF_NAMES && window.DIFF_NAMES[b.difficulty]) || b.difficulty;
        row.innerHTML = `<span class="rec-best-game">${name}</span>` +
          `<span class="rec-best-diff">${diff}</span>` +
          `<span class="rec-best-time">${fmt2(b.timeMs)}</span>`;
        bestBox.appendChild(row);
      });
    }

    // 最近记录
    const list = $('#records-list');
    list.innerHTML = '';
    if (!history.length) {
      $('#records-empty').style.display = 'block';
    } else {
      $('#records-empty').style.display = 'none';
      history.forEach((r) => {
        const item = document.createElement('div');
        item.className = 'rec-item';
        const name = (window.GAME_NAMES && window.GAME_NAMES[r.game]) || r.game;
        const diff = (window.DIFF_NAMES && window.DIFF_NAMES[r.difficulty]) || r.difficulty;
        const d = new Date(r.played_at);
        const dateStr = `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        item.innerHTML = `<span class="rec-item-game">${name}</span>` +
          `<span class="rec-item-diff">${diff}</span>` +
          `<span class="rec-item-time">${fmt2(r.timeMs)}</span>` +
          `<span class="rec-item-date">${dateStr}</span>`;
        list.appendChild(item);
      });
    }
  }
  $('#records-back').addEventListener('click', closeRecords);

  // ====== 首页卡片 ======
  document.querySelectorAll('.game-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('records-card')) { openRecords(); return; }
      openGame(card.dataset.game);
    });
  });

  function resetGameUI() {
    diffPanel.classList.remove('hidden');
    infoBar.classList.add('hidden');
    controls.classList.add('hidden');
  }

  // ====== 友好错误提示（避免白屏/看似闪退）======
  let toastTimer = null;
  function showError(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = 'block';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2600);
  }
  window.addEventListener('error', (e) => {
    console.error('[global error]', e.error || e.message);
  });

  // 难度页「显示下一步提示」开关：初始化勾选状态 + 变更持久化
  const toggleHint = $('#toggle-hint');
  if (toggleHint) {
    toggleHint.checked = window.GameSettings.showNextHint();
    toggleHint.addEventListener('change', () => {
      window.GameSettings.setShowNextHint(toggleHint.checked);
    });
  }
})();
