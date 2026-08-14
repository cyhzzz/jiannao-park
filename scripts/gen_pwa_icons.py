# 生成 PWA 所需图标：192 / 512 / 可遮罩 512 / apple-touch-icon
# 源：icon/LOGO_square.png (1024x1024, 全幅脑形 logo)
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICON_DIR = os.path.join(ROOT, "icon")
SRC = os.path.join(ICON_DIR, "LOGO_square.png")

BG = (238, 241, 246, 255)  # 柔和的浅灰蓝底，与 App 背景一致


def square(size):
    im = Image.open(SRC).convert("RGBA").resize((size, size), Image.LANCZOS)
    return im


def maskable(size):
    # 全幅不透明底 + logo 缩到 80% 居中，满足 maskable 安全区
    out = Image.new("RGBA", (size, size), BG)
    inner = int(size * 0.8)
    logo = Image.open(SRC).convert("RGBA").resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    out.paste(logo, (off, off), logo)
    return out


def apple(size):
    # apple-touch-icon 需不透明，浅底铺满
    out = Image.new("RGBA", (size, size), BG)
    inner = int(size * 0.82)
    logo = Image.open(SRC).convert("RGBA").resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    out.paste(logo, (off, off), logo)
    return out


files = {
    "pwa-192.png": square(192),
    "pwa-512.png": square(512),
    "pwa-maskable-512.png": maskable(512),
    "apple-touch-icon.png": apple(180),
}
for name, im in files.items():
    path = os.path.join(ICON_DIR, name)
    im.convert("RGBA").save(path, "PNG")
    print("wrote", os.path.relpath(path, ROOT), im.size)
