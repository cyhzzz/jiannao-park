// 在 jsdom 中加载真实游戏文件，检查 memory / trail 渲染结果
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const root = 'D:/AIproject/阿兹海默';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <div id="game-canvas"></div>
</body></html>`, { runScripts: 'outside-only', pretendToBeVisual: true });

const { window } = dom;
const { document } = window;

// 在 window 上下文执行各游戏脚本
function runInWindow(code, name) {
  const fn = new window.Function(code);
  fn.call(window);
}

try {
  runInWindow(read('js/icons.js'), 'icons.js');
  console.log('Icons loaded?', !!window.Icons, '| memorySet len:', window.Icons && window.Icons.memorySet.length);
  runInWindow(read('js/games/memory.js'), 'memory.js');
  runInWindow(read('js/games/trail.js'), 'trail.js');
} catch (e) {
  console.log('SCRIPT LOAD ERROR:', e.message);
  process.exit(1);
}

const canvas = document.getElementById('game-canvas');
const cb = { onProgress() {}, onComplete() {} };

// ===== 测试 memory =====
console.log('\n===== MEMORY (easy) =====');
window.Games.memory.start(canvas, 'easy', cb);
const board = canvas.querySelector('.memory-board');
console.log('board exists:', !!board);
const cards = canvas.querySelectorAll('.memory-card');
console.log('card count:', cards.length, '(expect 8 for easy 4 pairs)');
if (cards[0]) {
  console.log('card0 className:', cards[0].className);
  console.log('card0 innerHTML length:', cards[0].innerHTML.length);
  console.log('card0 has glyph svg:', cards[0].innerHTML.includes('<svg'));
  console.log('card0 dataset.emoji:', cards[0].dataset.emoji);
}
canvas.innerHTML = '';

// ===== 测试 trail =====
console.log('\n===== TRAIL (easy) =====');
window.Games.trail.start(canvas, 'easy', cb);
const wrap = canvas.querySelector('.trail-wrap');
console.log('trail-wrap exists:', !!wrap);
const nodes = canvas.querySelectorAll('.trail-node');
console.log('node count:', nodes.length, '(expect 8 for easy)');
const svg = canvas.querySelector('.trail-canvas');
console.log('svg exists:', !!svg, '| viewBox:', svg && svg.getAttribute('viewBox'));
// 模拟点击节点，检查是否画线
function clickNode(idx) {
  const node = canvas.querySelector(`.trail-node[data-idx="${idx}"]`);
  if (node) node.dispatchEvent(new window.Event('click'));
}
console.log('--- simulate clicks ---');
clickNode(1);
clickNode(2);
const lines = svg ? svg.querySelectorAll('line') : [];
console.log('lines after node1+node2 click:', lines.length);
lines.forEach((l, i) => {
  console.log(`  line${i}: x1=${l.getAttribute('x1')} y1=${l.getAttribute('y1')} x2=${l.getAttribute('x2')} y2=${l.getAttribute('y2')}`);
});
console.log('\n=== DONE ===');
process.exit(0);
