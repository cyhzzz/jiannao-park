// 找不同 - 视觉分辨 / 细节观察训练
// 左右两幅图有几处不同，在右图点出不同之处
(function () {
  const COLORS = ['#4a90d9', '#4caf72', '#f0a04b', '#e57373', '#9c6ade', '#46b3c9', '#f4c542'];

  const CONFIG = {
    easy:   { items: 7, diffs: 2 },
    medium: { items: 10, diffs: 3 },
    hard:   { items: 13, diffs: 4 },
  };

  let state = null;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function buildScene(count) {
    const items = [];
    let guard = 0;
    while (items.length < count && guard < 3000) {
      guard++;
      const x = rnd(14, 86), y = rnd(16, 84);
      const r = rnd(6, 10);
      let ok = true;
      for (const it of items) {
        if (Math.hypot(it.x - x, it.y - y) < 16) { ok = false; break; }
      }
      if (ok) items.push({ x, y, r, color: pick(COLORS), shape: Math.random() < 0.5 ? 'circle' : 'rect' });
    }
    return items;
  }

  function renderPanel(panel, items, isRight) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'diff-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    items.forEach((it, i) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg',
        it.shape === 'circle' ? 'circle' : 'rect');
      if (it.shape === 'circle') {
        el.setAttribute('cx', it.x); el.setAttribute('cy', it.y); el.setAttribute('r', it.r);
      } else {
        el.setAttribute('x', it.x - it.r); el.setAttribute('y', it.y - it.r);
        el.setAttribute('width', it.r * 2); el.setAttribute('height', it.r * 2);
        el.setAttribute('rx', 2);
      }
      el.setAttribute('fill', it.color);
      el.dataset.idx = i;
      svg.appendChild(el);
    });
    panel.appendChild(svg);
  }

  function start(canvas, difficulty, cb) {
    const cfg = CONFIG[difficulty];
    const left = buildScene(cfg.items);

    // 复制并制造差异
    const right = left.map((it) => ({ ...it }));
    const idxs = [];
    while (idxs.length < cfg.diffs) {
      const k = Math.floor(Math.random() * right.length);
      if (!idxs.includes(k)) idxs.push(k);
    }
    // 差异类型：变色 / 变小（缺失感）/ 变色+变小
    idxs.forEach((k) => {
      const mode = Math.floor(Math.random() * 2);
      if (mode === 0) {
        let nc = pick(COLORS);
        while (nc === right[k].color) nc = pick(COLORS);
        right[k].color = nc;
      } else {
        right[k].r = Math.max(2.5, right[k].r - 3.5); // 变小
      }
    });

    state = { diffs: cfg.diffs, found: 0, rightItems: right, cb, diffIdxs: idxs, foundIdxs: [], leftPanel: null, rightPanel: null };

    canvas.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'diff-wrap';

    const panels = document.createElement('div');
    panels.className = 'diff-panels';

    const leftPanel = document.createElement('div');
    leftPanel.className = 'diff-panel';
    renderPanel(leftPanel, left, false);

    const rightPanel = document.createElement('div');
    rightPanel.className = 'diff-panel';
    renderPanel(rightPanel, right, true);
    // 左右两幅图都可点击：差异在右边图上体现，但发现的位置左右坐标一致
    leftPanel.addEventListener('click', (e) => handleClick(e, leftPanel, cb));
    rightPanel.addEventListener('click', (e) => handleClick(e, rightPanel, cb));

    panels.appendChild(leftPanel);
    panels.appendChild(rightPanel);
    wrap.appendChild(panels);
    canvas.appendChild(wrap);

    // 面板创建完成后再绑定到 state（避免 TDZ：const 声明晚于 state 初始化）
    state.leftPanel = leftPanel;
    state.rightPanel = rightPanel;
  }

  function handleClick(e, panel, cb) {
    const rect = panel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let hitIdx = -1, hitDist = 999;
    state.rightItems.forEach((it, i) => {
      const d = Math.hypot(it.x - x, it.y - y);
      if (d < it.r + 5 && d < hitDist) { hitDist = d; hitIdx = i; }
    });

    if (hitIdx < 0) return; // 点空白

    if (state.diffIdxs.includes(hitIdx)) {
      if (state.foundIdxs.includes(hitIdx)) return; // 已找到（跨左右面板去重）
      state.foundIdxs.push(hitIdx);
      // 左右两幅图都打上标记圈，位置坐标一致
      [state.leftPanel, state.rightPanel].forEach((p) => {
        const mark = document.createElement('div');
        mark.className = 'diff-found';
        mark.dataset.idx = hitIdx;
        mark.style.left = state.rightItems[hitIdx].x + '%';
        mark.style.top = state.rightItems[hitIdx].y + '%';
        p.appendChild(mark);
      });
      state.found++;
      cb.onProgress(state.found, state.diffs);
      if (state.found >= state.diffs) cb.onComplete();
    } else {
      // 点错：抖动面板提示
      panel.style.animation = 'shake 0.3s';
      setTimeout(() => panel.style.animation = '', 300);
    }
  }

  window.Games = window.Games || {};
  window.Games.difference = {
    name: '找不同',
    desc: '找出两幅图的差异之处，锻炼观察力和细节分辨能力',
    config: CONFIG,
    start,
  };
})();
