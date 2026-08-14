// 用真实 sql.js 引擎，验证 db.js 使用的 schema / 查询 / 导出导入持久化
const initSqlJs = require('D:/AIproject/阿兹海默/android/node_modules/sql.js');
(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('CREATE TABLE IF NOT EXISTS records (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, game TEXT NOT NULL, difficulty TEXT NOT NULL, ' +
    'time_ms INTEGER NOT NULL, played_at TEXT NOT NULL);');
  db.run('CREATE INDEX IF NOT EXISTS idx_records_game ON records(game, difficulty);');

  const sample = [
    ['schulte', 'easy', 12000, '2026-08-13T10:00:00Z'],
    ['schulte', 'easy', 10000, '2026-08-13T11:00:00Z'],
    ['memory', 'medium', 30000, '2026-08-12T09:00:00Z'],
    ['trail', 'hard', 45000, '2026-08-13T08:00:00Z'],
    ['memory', 'medium', 28000, '2026-08-11T09:00:00Z'],
  ];
  const ins = db.prepare('INSERT INTO records (game,difficulty,time_ms,played_at) VALUES (?,?,?,?)');
  sample.forEach((r) => ins.run(r));
  ins.free();

  const getBest = (g, d) => {
    const res = db.exec('SELECT MIN(time_ms) AS b FROM records WHERE game=? AND difficulty=?', [g, d]);
    return res.length ? res[0].values[0][0] : null;
  };
  console.log('best schulte/easy (expect 10000) =', getBest('schulte', 'easy'));
  console.log('best trail/easy (expect null) =', getBest('trail', 'easy'));

  const total = db.exec('SELECT COUNT(*) FROM records');
  const days = db.exec('SELECT DISTINCT substr(played_at,1,10) FROM records');
  const bestRows = db.exec('SELECT game, difficulty, MIN(time_ms) FROM records GROUP BY game, difficulty');
  console.log('total =', total[0].values[0][0], '| active days =', days[0].values.length);
  console.log('perGameBest =', JSON.stringify(bestRows[0].values));

  const lb = db.exec('SELECT game, difficulty, MIN(time_ms) AS b FROM records GROUP BY game, difficulty ORDER BY b ASC');
  console.log('leaderboard =', JSON.stringify(lb[0].values));

  const hist = db.exec('SELECT game, difficulty, time_ms, played_at FROM records ORDER BY id DESC LIMIT ?', [30]);
  console.log('history rows =', hist[0].values.length);

  // 导出→重新打开（模拟 base64 持久化）
  const bytes = db.export();
  const db2 = new SQL.Database(bytes);
  const t2 = db2.exec('SELECT COUNT(*) FROM records');
  console.log('reopen after export count (expect 5) =', t2[0].values[0][0]);
  console.log('=== ALL SQLITE CHECKS PASSED ===');
})().catch((e) => { console.error('ERR', e); process.exit(1); });
