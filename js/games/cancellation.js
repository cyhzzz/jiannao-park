// 数字划消 - 持续性注意训练
// 找出并划掉所有指定的目标数字
(function () {
  const CONFIG = {
    easy:   { rows: 5, cols: 6, digits: 4, targets: 1 },
    medium: { rows: 6, cols: 7, digits: 6, targets: 2 },
    hard:   { rows: 8, cols: 8, digits: 9, targets: 3 },
  };

  let state = null;

  function start(canvas, difficulty, cb) {
    const cfg = CONFIG[difficulty];
    // 选取目标数字
    const pool = Array.from({ length: 9 }, (_, i) => i + 1);
    shuffle(pool);
    const targets = pool.slice(0, cfg.targets).sort((a, b) => a - b);

    // 生成棋盘，保证每个目标至少出现 2 次
    const total = cfg.rows * cfg.cols;
    const cells = [];
    targets.forEach((t) => { cells.push(t, t); });
    while (cells.length < total) {
      cells.push(1 + Math.floor(Math.random() * cfg.digits));
    }
    shuffle(cells);
    // 确保末尾不会恰好都是目标造成提前完成歧义——无所谓

    state = {
      targets: new Set(targets),
      found: new Set(),
      remaining: targets.length,
      totalTargets: targets.reduce((acc, t) => {
        return acc + cells.filter((c) => c === t).length;
      }, 0),
      foundCount: 0,
      cb,
    };

    canvas.innerHTML = '';
    const targetHint = document.createElement('div');
    targetHint.className = 'cancel-target';
    targetHint.innerHTML = '请划掉所有的 ' + targets.map((t) => `<b>${t}</b>`).join('、');
    canvas.appendChild(targetHint);

    const board = document.createElement('div');
    board.className = 'cancel-board';
    board.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;

    cells.forEach((n) => {
      const cell = document.createElement('div');
      cell.className = 'cancel-cell';
      cell.textContent = n;
      cell.dataset.val = n;
      cell.addEventListener('click', () => handleClick(cell, n, cb));
      board.appendChild(cell);
    });

    canvas.appendChild(board);
  }

  function handleClick(cell, n, cb) {
    if (!state.targets.has(n)) {
      // 划错非目标：抖动提示
      cell.classList.remove('wrong');
      void cell.offsetWidth;
      cell.classList.add('wrong');
      return;
    }
    if (cell.classList.contains('marked')) return;
    cell.classList.add('marked');
    state.foundCount++;
    cb.onProgress(state.foundCount, state.totalTargets);

    if (state.foundCount >= state.totalTargets) {
      cb.onComplete();
    }
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  window.Games = window.Games || {};
  window.Games.cancellation = {
    name: '数字划消',
    desc: '在众多数字中快速找出并划掉指定数字，训练持续专注力',
    config: CONFIG,
    start,
  };
})();
