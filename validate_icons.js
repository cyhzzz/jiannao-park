// 校验 icons.js 生成的 SVG 是否结构完整（能被解析、有子元素）
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = 'D:/AIproject/阿兹海默';
const code = fs.readFileSync(path.join(root, 'js/icons.js'), 'utf8');
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
new window.Function(code).call(window);

let bad = 0;
function check(label, svgStr) {
  if (typeof svgStr !== 'string' || !svgStr.startsWith('<svg') || !svgStr.includes('</svg>')) {
    console.log('  ✗ NOT SVG:', label); bad++; return;
  }
  const div = window.document.createElement('div');
  div.innerHTML = svgStr;
  const svg = div.querySelector('svg');
  const kids = svg ? svg.querySelectorAll('*').length : 0;
  const okShape = !!svg && kids > 0;
  if (!okShape) { console.log('  ✗ EMPTY/BROKEN:', label); bad++; }
  else console.log(`  ✓ ${label} (elements: ${kids})`);
}

console.log('=== home icons ===');
['schulte', 'cancellation', 'memory', 'trail', 'difference'].forEach((k) => check('home.' + k, window.Icons.home[k]));
console.log('=== header/modal/footer ===');
check('brain', window.Icons.brain);
check('celebrate', window.Icons.celebrate);
check('heart', window.Icons.heart);
console.log('=== memory glyphs (' + window.Icons.memorySet.length + ') ===');
window.Icons.memorySet.forEach((n) => check('glyph.' + n, window.Icons.memoryGlyph(n)));
console.log('\n=== RESULT: ' + (bad === 0 ? 'ALL OK' : bad + ' BROKEN') + ' ===');
process.exit(bad === 0 ? 0 : 1);
