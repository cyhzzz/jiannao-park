// 验证 db.js 在 sql.js 不可用时的 JSON 降级路径：API 一致、不崩溃
const { JSDOM } = require('C:/Users/cyhzz/.workbuddy/binaries/node/workspace/node_modules/jsdom');
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/AIproject/阿兹海默';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: 'outside-only', url: 'https://localhost/' });
const { window } = dom;
global.window = window;
['js/db.js', 'js/science.js'].forEach((f) => {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  new window.Function(code).call(window);
});

window.DB.init().then(() => {
  window.DB.recordGame('schulte', 'easy', 12000);
  window.DB.recordGame('schulte', 'easy', 10000);
  window.DB.recordGame('memory', 'medium', 30000);
  const stats = window.DB.getStats();
  const lb = window.DB.getLeaderboard();
  const hist = window.DB.getHistory(30);
  console.log('fallback mode =', window.DB.isFallback());
  console.log('stats =', JSON.stringify(stats));
  console.log('leaderboard =', JSON.stringify(lb));
  console.log('history count =', hist.length);
  console.log('SCIENCE schulte.trains =', window.SCIENCE.schulte.trains);
  console.log('=== DB FALLBACK CHECK PASSED ===');
}).catch((e) => { console.error('ERR', e); process.exit(1); });
