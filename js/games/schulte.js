// 舒尔特方格 - 注意力 / 视觉搜索训练
// 按 1→N 顺序点击所有数字，越快越好
(function () {
  const CONFIG = {
    easy:   { size: 3, label: '3×3 · 入门' },
    medium: { size: 4, label: '4×4 · 进阶' },
    hard:   { size: 5, label: '5×5 · 挑战' },
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
    const size = CONFIG[difficulty].size;
    const total = size * size;
    const nums = shuffle(Array.from({ length: total }, (_, i) => i + 1));

    state = { size, total, next: 1, cb };

    canvas.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'schulte-board';
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    nums.forEach((n) => {
      const cell = document.createElement('div');
      cell.className = 'schulte-cell';
      cell.textContent = n;
      cell.dataset.val = n;
      if (n === 1) cell.classList.add('current');
      cell.addEventListener('click', () => handleClick(cell, n, cb));
      board.appendChild(cell);
    });

    canvas.appendChild(board);
  }

  function handleClick(cell, n, cb) {
    if (state.next !== n) {
      // 点错：抖动提示，不计惩罚但需点正确数字
      cell.classList.remove('wrong');
      void cell.offsetWidth;
      cell.classList.add('wrong');
      return;
    }
    cell.classList.add('done');
    cell.classList.remove('current');
    state.next++;
    cb.onProgress(state.next - 1, state.total);

    if (state.next > state.total) {
      cb.onComplete();
      return;
    }
    // 高亮下一个目标
    const nextCell = canvas_queryNext(state.next);
    if (nextCell) nextCell.classList.add('current');
  }

  function canvas_queryNext(val) {
    return document.querySelector(`.schulte-cell[data-val="${val}"]`);
  }

  window.Games = window.Games || {};
  window.Games.schulte = {
    name: '舒尔特方格',
    desc: '按顺序从 1 点到最大数字，训练注意力和眼手协调',
    config: CONFIG,
    start,
  };
})();
