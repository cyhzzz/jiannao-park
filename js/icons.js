// 健脑乐园 · 统一 SVG 图标系统（v2 · 柔润软陶）
// 视觉哲学见 icon-design-philosophy.md（Soft Geometry 柔和几何 + 柔润材质）
// 全部图标收纳于 64×64 网格，圆角、圆头描边、浅色柔角底板 + 内部柔光 + 底部暖影，适合长辈辨识。
(function () {
  const wrap = (inner) =>
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">${inner}</svg>`;

  // 浅色柔角底板（同色系低饱和背景），不做边缘高亮条（遵守视觉规范）
  const tile = (tint) =>
    `<rect x="6" y="6" width="52" height="52" rx="15" fill="${tint}"/>`;

  // 内部柔光点（白色低透明椭圆，置于主体左上，非边缘高亮条）
  const hl = (cx, cy, rx, ry, rot = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff" opacity="0.32"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;

  // ====== 首页 5 个游戏图标 ======
  const home = {
    // 舒尔特方格：3×3 网格，中心格高亮为"下一个待点"
    schulte: wrap(`
      <g fill="none" stroke="#4a90d9" stroke-width="3" stroke-linejoin="round">
        <rect x="10" y="10" width="13" height="13" rx="4"/>
        <rect x="25.5" y="10" width="13" height="13" rx="4"/>
        <rect x="41" y="10" width="13" height="13" rx="4"/>
        <rect x="10" y="25.5" width="13" height="13" rx="4"/>
        <rect x="25.5" y="25.5" width="13" height="13" rx="4" fill="#4a90d9" stroke="none"/>
        <rect x="41" y="25.5" width="13" height="13" rx="4"/>
        <rect x="10" y="41" width="13" height="13" rx="4"/>
        <rect x="25.5" y="41" width="13" height="13" rx="4"/>
        <rect x="41" y="41" width="13" height="13" rx="4"/>
      </g>
      <circle cx="30" cy="29" r="2.6" fill="#ffffff" opacity="0.85"/>`),

    // 数字划消：柔角方块内数字 5，珊瑚红斜线划掉
    cancellation: wrap(`
      <rect x="12" y="12" width="40" height="40" rx="11" fill="#e9f2fc"/>
      <text x="32" y="43" font-size="30" font-weight="700" text-anchor="middle"
            fill="#4a90d9" font-family="'PingFang SC','Microsoft YaHei',sans-serif">5</text>
      <line x1="18" y1="45" x2="46" y2="19" stroke="#e86f6f" stroke-width="4.5" stroke-linecap="round"/>`),

    // 翻牌配对：两张卡重叠，一张翻开露出金星
    memory: wrap(`
      <rect x="9" y="18" width="25" height="32" rx="6" fill="#4a90d9" transform="rotate(-9 21 34)"/>
      <rect x="27" y="14" width="25" height="32" rx="6" fill="#ffffff" stroke="#4a90d9" stroke-width="3" transform="rotate(9 39 30)"/>
      <path d="M39 22 l2.6 5.4 5.9 0.9 -4.3 4.2 1 5.9 -5.2 -2.8 -5.2 2.8 1 -5.9 -4.3 -4.2 5.9 -0.9 z"
            fill="#f4c542" stroke="#d3a52b" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="37.5" cy="25" r="1.6" fill="#ffffff" opacity="0.8"/>`),

    // 连线游戏：四个彩色圆点按序相连
    trail: wrap(`
      <polyline points="14,48 30,18 46,40 50,15" fill="none" stroke="#4a90d9"
                stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="14" cy="48" r="6.5" fill="#4a90d9"/>
      <circle cx="30" cy="18" r="6.5" fill="#4caf72"/>
      <circle cx="46" cy="40" r="6.5" fill="#f0a04b"/>
      <circle cx="50" cy="15" r="6.5" fill="#e86f6f"/>
      <circle cx="12" cy="46" r="2" fill="#ffffff" opacity="0.7"/>`),

    // 找不同：放大镜
    difference: wrap(`
      <circle cx="27" cy="27" r="15" fill="none" stroke="#4a90d9" stroke-width="4.5"/>
      <line x1="38" y1="38" x2="52" y2="52" stroke="#4a90d9" stroke-width="6" stroke-linecap="round"/>
      <path d="M20 27 a7 7 0 0 1 14 0" fill="none" stroke="#4caf72" stroke-width="3.5" stroke-linecap="round"/>`),
  };

  // ====== 头部 / 弹窗 / 页脚 图标 ======
  const brain = wrap(`
    <path d="M27 12c-6.5 0-11.5 4.4-11.5 10.6 0 1-.1 2 .2 3C11.5 27.2 9 32 11 36.2c-1.2 4 1 8 5.2 9 1 4.2 5.2 7 10.8 5.8 2.2 3 7.2 4 11.2 1.8 4.2 1.8 9-.3 10-4.4 4-1 6.2-5.2 5-9.4 3-3.2 4-8.2 1-11.4 1-4.2-1-8.2-5.2-9.4 0-6.4-5.2-10.6-11.7-10.6-1 0-2 .1-3 .3z"
          fill="#4a90d9"/>
    <path d="M32 17v30" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>
    <path d="M24 23c3 2 5 4.5 5 8.5M40 23c-3 2-5 4.5-5 8.5M24 41c3-2 5-3.5 5-7M40 41c-3-2-5-3.5-5-7"
          stroke="#ffffff" stroke-width="2.1" fill="none" stroke-linecap="round" opacity="0.85"/>
    <circle cx="26" cy="19" r="2.4" fill="#ffffff" opacity="0.5"/>`);

  const celebrate = wrap(`
    <path d="M22 13h20v11c0 6.2-4.5 10.5-10 10.5S22 30.2 22 24z" fill="#f4c542" stroke="#d3a52b" stroke-width="1.5"/>
    <path d="M22 15h-7c.4 6.5 4.6 9.5 9 9.5M42 15h7c-.4 6.5-4.6 9.5-9 9.5" fill="none" stroke="#f4c542" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="28.5" y="34.5" width="7" height="8" rx="1.5" fill="#f0a04b"/>
    <rect x="21" y="42.5" width="22" height="6.5" rx="3" fill="#f0a04b"/>
    <rect x="18" y="49" width="28" height="5.5" rx="2.7" fill="#e08e2e"/>
    <ellipse cx="28" cy="19" rx="3.2" ry="4.5" fill="#ffffff" opacity="0.4"/>`);

  const heart = wrap(`
    <path d="M32 53C13 39 9 27 17.5 19.5 22.5 14.5 30 16.5 32 23c2-6.5 9.5-8.5 14.5-3.5C55 27 51 39 32 53z"
          fill="#e86f6f"/>
    <ellipse cx="24" cy="25" rx="4.5" ry="6" fill="#ffffff" opacity="0.35"/>`);

  // 我的记录（柱状图 + 奖牌感）
  const records = wrap(`
    ${tile('#e9f2fc')}
    <g fill="#4a90d9">
      <rect x="15" y="34" width="8" height="18" rx="3"/>
      <rect x="28" y="26" width="8" height="26" rx="3" fill="#5aa0e0"/>
      <rect x="41" y="18" width="8" height="34" rx="3" fill="#3a7cc4"/>
    </g>
    <path d="M14 20l4-6 4 6zM42 14l4-6 4 6z" fill="#f4c542"/>
    ${hl(23, 22, 3, 4, -12)}`);

  // ====== 翻牌配对 16 个 SVG 配对符号（浅色底板 + 柔光 + 暖影）======
  // 每个符号形状与配色均不同，便于长辈分辨（不依赖颜色辨识）
  const G = {
    apple: `${tile('#fdeaea')}
      <path d="M32 20c-2-6-9-7-12-3-4 5-3 16 4 22 3 2 7 2 8 0 1 2 5 2 8 0 7-6 8-17 4-22-3-4-10-3-12 3z" fill="#e86f6f"/>
      ${hl(26, 29, 4, 6)}
      <rect x="30.5" y="12" width="3" height="9" rx="1.5" fill="#8a5a2b"/>
      <path d="M33 15c4-3 8-2 9 1-4 1-7 0-9-1z" fill="#4caf72"/>`,

    flower: `${tile('#f2ebfc')}
      <g fill="#a06fe0"><circle cx="32" cy="20" r="6"/><circle cx="44" cy="28" r="6"/><circle cx="40" cy="42" r="6"/><circle cx="24" cy="42" r="6"/><circle cx="20" cy="28" r="6"/></g>
      <circle cx="32" cy="32" r="7" fill="#f4c542"/>
      ${hl(29.5, 29.5, 2.4, 3.4)}`,

    star: `${tile('#fdf3da')}
      <path d="M32 12l6.5 14.3 15.5 1.7-11.6 10.6 3.3 15.4L32 49.4 18.3 54.6l3.3-15.4L10 28.4l15.5-1.7z" fill="#f4c542" stroke="#d3a52b" stroke-width="1.5" stroke-linejoin="round"/>
      ${hl(27, 22, 3, 4.5)}`,

    cat: `${tile('#fdf0e2')}
      <g fill="#f0a04b"><path d="M18 22l4-10 6 8z"/><path d="M46 22l-4-10-6 8z"/></g>
      <circle cx="32" cy="34" r="16" fill="#f0a04b"/>
      ${hl(24, 25, 4, 5.5)}
      <circle cx="25" cy="31" r="2.4" fill="#3a2a12"/><circle cx="39" cy="31" r="2.4" fill="#3a2a12"/>
      <path d="M32 36v4M32 40l-3 2M32 40l3 2" stroke="#3a2a12" stroke-width="1.6" stroke-linecap="round"/>`,

    rainbow: `${tile('#eef3fb')}
      <g fill="none" stroke-width="4" stroke-linecap="round"><path d="M12 46a20 20 0 0 1 40 0" stroke="#e86f6f"/><path d="M18 46a14 14 0 0 1 28 0" stroke="#f4c542"/><path d="M24 46a8 8 0 0 1 16 0" stroke="#4caf72"/></g>`,

    watermelon: `${tile('#e9f5ec')}
      <path d="M10 30a22 22 0 0 0 44 0z" fill="#4caf72"/>
      <path d="M14 30a18 18 0 0 0 36 0z" fill="#e86f6f"/>
      ${hl(24, 34, 4, 3, -15)}
      <g fill="#3a2a12"><circle cx="26" cy="36" r="1.8"/><circle cx="34" cy="40" r="1.8"/><circle cx="40" cy="35" r="1.8"/><circle cx="32" cy="33" r="1.8"/></g>`,

    fish: `${tile('#e7f4f7')}
      <path d="M12 32c8-12 24-12 30 0-6 12-22 12-30 0z" fill="#4ab3c9"/>
      <path d="M42 32l10-8v16z" fill="#4ab3c9"/>
      ${hl(21, 26, 3.5, 3, -20)}
      <circle cx="22" cy="29" r="2.6" fill="#ffffff"/><circle cx="22" cy="29" r="1.3" fill="#234"/>`,

    sunflower: `${tile('#fdf3da')}
      <g fill="#f4c542"><circle cx="32" cy="16" r="6"/><circle cx="32" cy="48" r="6"/><circle cx="16" cy="32" r="6"/><circle cx="48" cy="32" r="6"/><circle cx="21" cy="21" r="5"/><circle cx="43" cy="21" r="5"/><circle cx="21" cy="43" r="5"/><circle cx="43" cy="43" r="5"/></g>
      <circle cx="32" cy="32" r="9" fill="#8a5a2b"/>
      ${hl(28.5, 28.5, 2.6, 3.6)}`,

    rocket: `${tile('#e9f2fc')}
      <path d="M32 10c8 6 10 16 8 26l-8 8-8-8c-2-10 0-20 8-26z" fill="#4a90d9"/>
      ${hl(28, 22, 3, 5, -15)}
      <circle cx="32" cy="26" r="4" fill="#e9f2fc"/>
      <path d="M24 40l-6 8 8-3zM40 40l6 8-8-3z" fill="#f0a04b"/>
      <path d="M28 50h8l-4 8z" fill="#e86f6f"/>`,

    strawberry: `${tile('#fdeaea')}
      <path d="M32 22c-9 4-14 12-12 20 2 7 9 9 12 9s10-2 12-9c2-8-3-16-12-20z" fill="#e86f6f"/>
      ${hl(26, 30, 4, 6, -12)}
      <path d="M26 16l6 6 6-6-2 8h-8z" fill="#4caf72"/>
      <g fill="#ffffff"><circle cx="27" cy="36" r="1.6"/><circle cx="36" cy="34" r="1.6"/><circle cx="32" cy="42" r="1.6"/><circle cx="38" cy="42" r="1.6"/><circle cx="26" cy="44" r="1.6"/></g>`,

    rabbit: `${tile('#fdf0e2')}
      <g fill="#f0a04b"><ellipse cx="24" cy="18" rx="4.5" ry="13"/><ellipse cx="40" cy="18" rx="4.5" ry="13"/></g>
      <circle cx="32" cy="38" r="15" fill="#f0a04b"/>
      ${hl(24, 30, 4, 5.5, -12)}
      <circle cx="26" cy="36" r="2.4" fill="#3a2a12"/><circle cx="38" cy="36" r="2.4" fill="#3a2a12"/>
      <circle cx="32" cy="41" r="2.6" fill="#e86f6f"/>`,

    orange: `${tile('#fdf0e2')}
      <circle cx="32" cy="34" r="18" fill="#f0a04b"/>
      ${hl(24, 27, 4.5, 6, -15)}
      <path d="M32 16c0-4 3-6 6-5-1 3-3 5-6 5z" fill="#4caf72"/>
      <g stroke="#d5853a" stroke-width="1.6"><path d="M32 18v32M16 34h32M21 23l22 22M43 23l-22 22"/></g>`,

    turtle: `${tile('#e9f5ec')}
      <path d="M14 34a18 12 0 0 1 36 0 18 12 0 0 1-36 0z" fill="#4caf72"/>
      <circle cx="50" cy="34" r="5" fill="#4caf72"/>
      ${hl(26, 30, 5, 4, -15)}
      <g fill="#3c9459"><rect x="18" y="44" width="5" height="6" rx="2"/><rect x="41" y="44" width="5" height="6" rx="2"/><rect x="22" y="22" width="5" height="5" rx="2"/><rect x="37" y="22" width="5" height="5" rx="2"/></g>
      <path d="M26 34h12M32 26v16" stroke="#2f6b46" stroke-width="2"/>`,

    moon: `${tile('#f2ebfc')}
      <path d="M42 12a24 24 0 1 0 0 40 19 19 0 0 1 0-40z" fill="#a06fe0"/>
      ${hl(28, 26, 4, 5.5, -18)}`,

    grape: `${tile('#f2ebfc')}
      <g fill="#a06fe0"><circle cx="32" cy="20" r="5"/><circle cx="24" cy="28" r="5"/><circle cx="40" cy="28" r="5"/><circle cx="28" cy="36" r="5"/><circle cx="36" cy="36" r="5"/><circle cx="32" cy="44" r="5"/></g>
      ${hl(29, 19, 2.4, 3.2, -15)}
      <path d="M32 14c5-4 11-3 13 1-5 1-9 0-13-1z" fill="#4caf72"/>`,

    bell: `${tile('#e9f2fc')}
      <path d="M32 12c9 0 14 7 14 16 0 9 3 12 3 16H15c0-4 3-7 3-16 0-9 5-16 14-16z" fill="#4a90d9"/>
      <circle cx="32" cy="52" r="4.5" fill="#4a90d9"/>
      ${hl(26, 22, 3.5, 6, -12)}
      <path d="M27 16a5 5 0 0 1 10 0" fill="none" stroke="#2f6bb0" stroke-width="2"/>`,
  };

  const memorySet = Object.keys(G); // 16 个名称

  function memoryGlyph(name) {
    return wrap(G[name] || G.star);
  }

  window.Icons = {
    home,
    brain,
    celebrate,
    heart,
    records,
    memorySet,
    memoryGlyph,
    get(name) { return home[name] || ''; },
  };
})();
