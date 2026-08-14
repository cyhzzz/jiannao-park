# 生成健脑乐园启动图标 LOGO.png (1024x1024) — v2 柔润软陶
# 设计：柔和渐变圆角底 + 清晰白色脑形（左右脑叶+中缝+柔褶皱）+ 顶部绿芽 + 柔光 + 软投影
# 采用 4x 超采样 + 高斯模糊做柔光/投影，边缘平滑
from PIL import Image, ImageDraw, ImageFilter
import math

S = 4
W = 1024 * S  # 4096 工作分辨率
cx = W // 2
cy = int(W * 0.52)

# ---------- 背景：竖直柔和渐变（天蓝 → 信任蓝）----------
bg = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(bg)
top = (128, 190, 240)   # 更清透的天蓝
bot = (60, 128, 202)    # 信任蓝
for y in range(W):
    t = y / (W - 1)
    r = int(top[0] + (bot[0] - top[0]) * t)
    g = int(top[1] + (bot[1] - top[1]) * t)
    b = int(top[2] + (bot[2] - top[2]) * t)
    d.line([(0, y), (W, y)], fill=(r, g, b, 255))

# 顶部柔光晕（径向高光，增加通透感）
glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([cx - 1500, cy - 1700, cx + 1500, cy - 200],
                             fill=(255, 255, 255, 60))
glow = glow.filter(ImageFilter.GaussianBlur(220))
bg = Image.alpha_composite(bg, glow)

# （蒙版在输出阶段统一施加，以便同时产出 方形全幅 / 圆角 / 圆形 三种变体）

# ---------- 脑形软投影（脑下方的柔和暗影，提升立体与层级）----------
shadow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
ImageDraw.Draw(shadow).ellipse([cx - 980, cy + 360, cx + 980, cy + 780],
                               fill=(30, 70, 130, 90))
shadow = shadow.filter(ImageFilter.GaussianBlur(120))
bg = Image.alpha_composite(bg, shadow)

# ---------- 脑形（白色，横向脑叶 + 顶部凸起，营造柔软大脑轮廓）----------
brain = Image.new("RGBA", (W, W), (0, 0, 0, 0))
bd = ImageDraw.Draw(brain)
WHITE = (255, 255, 255, 255)
# 主体横向椭圆（脑比云更扁宽）
bd.ellipse([cx - 900, cy - 620, cx + 900, cy + 620], fill=WHITE)
# 顶部与两侧凸起（脑叶的圆润起伏）
bumps = [
    (cx - 600, cy - 560, 330), (cx - 220, cy - 660, 350), (cx + 220, cy - 660, 350), (cx + 600, cy - 560, 330),
    (cx - 850, cy - 120, 300), (cx + 850, cy - 120, 300),
    (cx - 520, cy + 500, 320), (cx + 520, cy + 500, 320), (cx, cy + 580, 350),
]
for (x, y, r) in bumps:
    bd.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)

# 脑形左上的柔光（白的高光，软陶质感）
bh = Image.new("RGBA", (W, W), (0, 0, 0, 0))
ImageDraw.Draw(bh).ellipse([cx - 560, cy - 620, cx + 40, cy - 180],
                           fill=(255, 255, 255, 70))
bh = bh.filter(ImageFilter.GaussianBlur(80))
brain = Image.alpha_composite(brain, bh)

# ---------- 脑沟：密集波浪褶皱（脑回纹理），避免"树"感 ----------
FOLD = (70, 120, 180, 135)
fd = ImageDraw.Draw(brain)

def wave(sign, yc, reach, amp, waves, width):
    # 从靠近中缝向外延伸的横向波浪，bulge 向外
    pts = []
    n = 44
    for i in range(n + 1):
        t = i / n
        x = cx + sign * (90 + reach * t)
        y = yc + amp * math.sin(t * math.pi * waves)
        pts.append((x, y))
    fd.line(pts, fill=FOLD, width=width, joint="curve")

# 每侧四条横向波浪褶皱（上→下），密集且外鼓，读作脑回
for sign in (-1, 1):
    wave(sign, cy - 380, 520, 55, 1.4, 17)
    wave(sign, cy - 200, 600, 65, 1.5, 17)
    wave(sign, cy - 10, 640, 70, 1.5, 17)
    wave(sign, cy + 190, 540, 60, 1.5, 17)

# 中央纵向中缝（短、柔和、弱化，避免"树干"感）
mid = []
for i in range(31):
    t = i / 30
    mid.append((cx + 24 * math.sin(t * math.pi * 2), (cy - 460) + t * 900))
fd.line(mid, fill=FOLD, width=18, joint="curve")

bg = Image.alpha_composite(bg, brain)

# ---------- 萌芽（绿色，象征乐园/成长，更醒目）----------
sprout = Image.new("RGBA", (W, W), (0, 0, 0, 0))
sd = ImageDraw.Draw(sprout)
GREEN = (70, 175, 112, 255)
GREEN2 = (110, 200, 140, 255)  # 亮绿高光
# 茎
sd.line([(cx, cy - 620), (cx, cy - 940)], fill=GREEN, width=34)
# 两片叶（一大一小，角度自然）
for sign, ang, wgt, hg, col in ((-1, 30, 470, 260, GREEN), (1, -34, 400, 220, GREEN2)):
    leaf = Image.new("RGBA", (wgt, hg), (0, 0, 0, 0))
    ImageDraw.Draw(leaf).ellipse([0, 0, wgt - 1, int(hg * 0.82)], fill=col)
    leaf = leaf.rotate(ang, expand=True)
    ox = cx - 240 if sign < 0 else cx - 160
    sprout.alpha_composite(leaf, (ox, cy - 980))
bg = Image.alpha_composite(bg, sprout)

# ---------- 输出三种变体 ----------
icon_dir = r"D:\AIproject\阿兹海默\icon"

# 方形全幅（ic_launcher.png：Android 启动器会自行套 squircle/圆形蒙版，故全幅铺满最稳妥）
square = bg.resize((1024, 1024), Image.LANCZOS)
square.save(icon_dir + r"\LOGO_square.png", "PNG")

# 圆角方形（预览 LOGO.png，22.5% 半径）
rounded = bg.copy()
m_round = Image.new("L", (W, W), 0)
ImageDraw.Draw(m_round).rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 0.225), fill=255)
rounded.putalpha(m_round)
rounded.resize((1024, 1024), Image.LANCZOS).save(icon_dir + r"\LOGO.png", "PNG")

# 圆形（ic_launcher_round.png：圆形启动器直接展示，需透明圆角）
circ = bg.copy()
m_circ = Image.new("L", (W, W), 0)
ImageDraw.Draw(m_circ).ellipse([0, 0, W - 1, W - 1], fill=255)
circ.putalpha(m_circ)
circ.resize((1024, 1024), Image.LANCZOS).save(icon_dir + r"\LOGO_round.png", "PNG")

print("LOGO.png / LOGO_square.png / LOGO_round.png generated:", square.size)
