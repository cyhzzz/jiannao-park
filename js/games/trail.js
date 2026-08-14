// 连线游戏 (Trail Making) - 执行功能 / 顺序规划训练
// 按 1→N 顺序连接所有圆点，训练顺序思维和手眼协调
(function () {
  const CONFIG = {
    easy:   { count: 8 },
    medium: { count: 12 },
    hard:   { count: 18 },
  };

  let state = null;

  function start(canvas, difficulty, cb) {
    const count = CONFIG[difficulty].count;
    state = { count, next: 1, cb, svg: null, positions: [] };

    canvas.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'trail-wrap';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'trail-canvas');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    wrap.appendChild(svg);
    state.svg = svg;

    // 随机但不重叠地放置节点
    const positions = placeNodes(count);
    state.positions = positions;

    positions.forEach((p, i) => {
      const node = document.createElement('div');
      node.className = 'trail-node';
      node.style.left = p.x + '%';
      node.style.top = p.y + '%';
      node.textContent = i + 1;
      node.dataset.idx = i + 1;
      if (i === 0) node.classList.add('next');
      node.addEventListener('click', () => handleClick(node, i + 1, cb));
      wrap.appendChild(node);
    });

    canvas.appendChild(wrap);
  }

  function placeNodes(count) {
    const pts = [];
    let attempts = 0;
    while (pts.length < count && attempts < 2000) {
      attempts++;
      const x = 12 + Math.random() * 76;
      const y = 12 + Math.random() * 76;
      let ok = true;
      for (const p of pts) {
        if (Math.hypot(p.x - x, p.y - y) < 16) { ok = false; break; }
      }
      if (ok) pts.push({ x, y });
    }
    // 若重叠未排满，直接补位
    while (pts.length < count) {
      pts.push({ x: 12 + Math.random() * 76, y: 12 + Math.random() * 76 });
    }
    return pts;
  }

  function handleClick(node, idx, cb) {
    if (state.next !== idx) {
      node.classList.remove('wrong');
      void node.offsetWidth;
      node.classList.add('wrong');
      return;
    }
    node.classList.add('done');
    node.classList.remove('next');
    state.next++;

    // 画连线：连接第 (idx-1) 个节点到第 idx 个节点（首节点无需连线）
    if (idx > 1) {
      const prev = state.positions[idx - 2];
      const cur = state.positions[idx - 1];
      drawLine(prev, cur);
    }

    cb.onProgress(state.next - 1, state.count);
    if (state.next > state.count) { cb.onComplete(); return; }

    const nextNode = document.querySelector(`.trail-node[data-idx="${state.next}"]`);
    if (nextNode) nextNode.classList.add('next');
  }

  function drawLine(a, b) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('stroke', '#4a90d9');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    state.svg.appendChild(line);
  }

  window.Games = window.Games || {};
  window.Games.trail = {
    name: '连线游戏',
    desc: '按数字顺序连接圆点，锻炼顺序思维和大脑灵活性',
    config: CONFIG,
    start,
  };
})();
