// 本地成绩记录库（真 SQLite，由 sql.js / WASM 引擎在 WebView 内运行）
// 设计要点：
//  1. 用 sql.js（SQLite 的 WASM 移植）在 WebView 内跑真正的 SQLite，DB 文件以 base64 存进
//     app 沙盒存储（Capacitor WebView 的 localStorage 即设备本地、重启不丢、清应用数据才清）。
//  2. 若 wasm 因故加载失败，自动降级为同接口的纯 JSON 存储，保证成绩记录功能永不中断。
//  3. 所有写操作在就绪前会进入队列，就绪后自动回放，调用方无需关心初始化时序。
(function () {
  'use strict';

  var DB_KEY = 'jiannao_sqlite_db_v1';
  var SCHEMA = [
    'CREATE TABLE IF NOT EXISTS records (',
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,',
    '  game TEXT NOT NULL,',
    '  difficulty TEXT NOT NULL,',
    '  time_ms INTEGER NOT NULL,',
    '  played_at TEXT NOT NULL',
    ');',
    'CREATE INDEX IF NOT EXISTS idx_records_game ON records(game, difficulty);'
  ].join('\n');

  var sql = null;     // sql.js 命名空间
  var db = null;      // 当前 Database 实例
  var ready = false;
  var fallback = false;
  var fdata = { records: [] };   // 降级用 JSON 数据
  var queue = [];

  // ---------- base64 互转（兼容大数组） ----------
  function bytesToBase64(bytes) {
    var CHUNK = 0x8000;
    var s = '';
    for (var i = 0; i < bytes.length; i += CHUNK) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(s);
  }
  function base64ToBytes(b64) {
    var s = atob(b64);
    var bytes = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    return bytes;
  }
  function loadB64() { try { return window.localStorage.getItem(DB_KEY); } catch (e) { return null; } }
  function saveB64(b64) { try { window.localStorage.setItem(DB_KEY, b64); } catch (e) {} }

  // ---------- 降级 JSON 存储 ----------
  function loadFallback() {
    try {
      var raw = window.localStorage.getItem(DB_KEY + '_json');
      if (raw) fdata = JSON.parse(raw);
      if (!fdata || !Array.isArray(fdata.records)) fdata = { records: [] };
    } catch (e) { fdata = { records: [] }; }
  }
  function saveFallback() {
    try { window.localStorage.setItem(DB_KEY + '_json', JSON.stringify(fdata)); } catch (e) {}
  }

  // ---------- 初始化 ----------
  function init() {
    if (ready || window.__dbInitStarted) return Promise.resolve();
    window.__dbInitStarted = true;
    return Promise.resolve()
      .then(function () {
        if (typeof window.initSqlJs !== 'function') throw new Error('sql.js not loaded');
        return window.initSqlJs({ locateFile: function (f) { return 'js/lib/' + f; } });
      })
      .then(function (SQL) {
        sql = SQL;
        var saved = loadB64();
        if (saved) {
          try { db = new SQL.Database(base64ToBytes(saved)); }
          catch (e) { db = new SQL.Database(); }
        } else {
          db = new SQL.Database();
        }
        db.run(SCHEMA);
        persist();
        ready = true;
        flush();
      })
      .catch(function (e) {
        console.warn('[DB] sql.js 初始化失败，降级为 JSON 存储：', e && e.message);
        fallback = true;
        loadFallback();
        ready = true;
        flush();
      });
  }

  function flush() {
    var q = queue; queue = [];
    q.forEach(function (fn) { try { fn(); } catch (e) { console.error('[DB] queued op failed', e); } });
  }
  function whenReady(fn) {
    if (ready) fn();
    else queue.push(fn);
  }
  function persist() {
    if (fallback) { saveFallback(); return; }
    try { saveB64(bytesToBase64(db.export())); } catch (e) { console.warn('[DB] persist failed', e); }
  }

  // ---------- 写入一条记录 ----------
  function recordGame(game, difficulty, timeMs) {
    var row = {
      game: game,
      difficulty: difficulty,
      timeMs: timeMs,
      played_at: new Date().toISOString()
    };
    whenReady(function () {
      if (fallback) {
        fdata.records.push(row);
        saveFallback();
        return;
      }
      db.run(
        'INSERT INTO records (game, difficulty, time_ms, played_at) VALUES (?, ?, ?, ?)',
        [row.game, row.difficulty, row.timeMs, row.played_at]
      );
      persist();
    });
    return Promise.resolve(row);
  }

  // ---------- 读取 ----------
  function getBest(game, difficulty) {
    if (!ready) return null;
    if (fallback) {
      var best = null;
      fdata.records.forEach(function (r) {
        if (r.game === game && r.difficulty === difficulty) {
          if (best === null || r.timeMs < best) best = r.timeMs;
        }
      });
      return best;
    }
    var res = db.exec(
      'SELECT MIN(time_ms) AS b FROM records WHERE game=? AND difficulty=?',
      [game, difficulty]
    );
    if (!res.length || !res[0].values.length) return null;
    return res[0].values[0][0];
  }

  function getHistory(limit) {
    limit = limit || 50;
    if (!ready) return [];
    if (fallback) {
      return fdata.records.slice(-limit).reverse();
    }
    var res = db.exec(
      'SELECT game, difficulty, time_ms, played_at FROM records ORDER BY id DESC LIMIT ?',
      [limit]
    );
    if (!res.length) return [];
    return res[0].values.map(function (v) {
      return { game: v[0], difficulty: v[1], timeMs: v[2], played_at: v[3] };
    });
  }

  // 统计：总次数、活跃天数、各游戏最佳
  function getStats() {
    if (!ready) return { total: 0, days: 0, perGameBest: {} };
    if (fallback) {
      var days = {};
      var pg = {};
      fdata.records.forEach(function (r) {
        days[r.played_at.slice(0, 10)] = 1;
        var key = r.game + '|' + r.difficulty;
        if (!pg[key] || r.timeMs < pg[key]) pg[key] = r.timeMs;
      });
      return { total: fdata.records.length, days: Object.keys(days).length, perGameBest: pg };
    }
    var total = db.exec('SELECT COUNT(*) FROM records');
    var dayRows = db.exec('SELECT DISTINCT substr(played_at,1,10) FROM records');
    var bestRows = db.exec(
      'SELECT game, difficulty, MIN(time_ms) FROM records GROUP BY game, difficulty'
    );
    var pg = {};
    if (bestRows.length) {
      bestRows[0].values.forEach(function (v) { pg[v[0] + '|' + v[1]] = v[2]; });
    }
    return {
      total: total.length ? total[0].values[0][0] : 0,
      days: dayRows.length ? dayRows[0].values.length : 0,
      perGameBest: pg
    };
  }

  // 个人排行：每个游戏取最佳成绩（按用时升序）
  function getLeaderboard() {
    if (!ready) return [];
    if (fallback) {
      var map = {};
      fdata.records.forEach(function (r) {
        var k = r.game + '|' + r.difficulty;
        if (!map[k] || r.timeMs < map[k].timeMs) {
          map[k] = { game: r.game, difficulty: r.difficulty, timeMs: r.timeMs };
        }
      });
      return Object.keys(map).map(function (k) { return map[k]; })
        .sort(function (a, b) { return a.timeMs - b.timeMs; });
    }
    var res = db.exec(
      'SELECT game, difficulty, MIN(time_ms) AS b FROM records GROUP BY game, difficulty ORDER BY b ASC'
    );
    if (!res.length) return [];
    return res[0].values.map(function (v) {
      return { game: v[0], difficulty: v[1], timeMs: v[2] };
    });
  }

  window.DB = {
    init: init,
    recordGame: recordGame,
    getBest: getBest,
    getHistory: getHistory,
    getStats: getStats,
    getLeaderboard: getLeaderboard,
    isFallback: function () { return fallback; }
  };
})();
