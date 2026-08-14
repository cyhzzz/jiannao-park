// 翻牌配对 - 工作记忆训练
// 翻开两张相同的牌即配对成功，全部配对完成即过关
(function () {
  // 符号集延迟到 start() 时解析，避免依赖脚本加载顺序
  function getSymbols() {
    return (window.Icons && window.Icons.memorySet) ? window.Icons.memorySet : [];
  }
  function getGlyph(name) {
    return (window.Icons && window.Icons.memoryGlyph) ? window.Icons.memoryGlyph(name) : '';
  }

  const CONFIG = {
    easy:   { pairs: 4, cols: 4 },  // 2x4
    medium: { pairs: 6, cols: 4 },  // 3x4
    hard:   { pairs: 8, cols: 4 },  // 4x4
  };

  let state = null;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function start(canvas, difficulty, cb) {
    const cfg = CONFIG[difficulty];
    const symbols = getSymbols();
    const chosen = shuffle(symbols.slice()).slice(0, cfg.pairs);
    let deck = shuffle([...chosen, ...chosen]);

    state = {
      deck,
      flipped: [],
      matched: 0,
      pairs: cfg.pairs,
      lock: false,
      cb,
    };

    canvas.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'memory-board';
    board.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;

    deck.forEach((name, idx) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.idx = idx;
      card.dataset.emoji = name;
      const glyph = getGlyph(name);
      card.innerHTML = `
        <div class="face face-front"></div>
        <div class="face face-back"><div class="glyph">${glyph}</div></div>`;
      card.addEventListener('click', () => flip(card, cb));
      board.appendChild(card);
    });

    canvas.appendChild(board);
  }

  function flip(card, cb) {
    if (state.lock) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    state.flipped.push(card);

    if (state.flipped.length === 2) {
      state.lock = true;
      const [a, b] = state.flipped;
      if (a.dataset.emoji === b.dataset.emoji) {
        setTimeout(() => {
          a.classList.add('matched');
          b.classList.add('matched');
          state.matched++;
          state.flipped = [];
          state.lock = false;
          cb.onProgress(state.matched, state.pairs);
          if (state.matched >= state.pairs) cb.onComplete();
        }, 450);
      } else {
        setTimeout(() => {
          a.classList.remove('flipped');
          b.classList.remove('flipped');
          state.flipped = [];
          state.lock = false;
        }, 800);
      }
    }
  }

  window.Games = window.Games || {};
  window.Games.memory = {
    name: '翻牌配对',
    desc: '记住卡片位置，找出成对的图案，锻炼记忆力和观察力',
    config: CONFIG,
    start,
  };
})();
