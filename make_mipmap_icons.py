# 用 Python Pillow 直接生成所有 Android mipmap 图标（绕过 System.Drawing 文件锁问题）
# v2：启动器直接用 PNG（无自适应 anydpi-v26），故：
#   ic_launcher.png       = 方形全幅（启动器自行套 squircle 蒙版）
#   ic_launcher_round.png = 圆形（圆形启动器直接展示，透明圆角）
#   ic_launcher_foreground = 前景（备用，若日后启用自适应图标）
from PIL import Image
import os

icon_dir = r"D:\AIproject\阿兹海默\icon"
square = Image.open(os.path.join(icon_dir, "LOGO_square.png")).convert("RGBA")
round_ = Image.open(os.path.join(icon_dir, "LOGO_round.png")).convert("RGBA")
fg_src = Image.open(os.path.join(icon_dir, "LOGO.png")).convert("RGBA")
res_dir = r"D:\AIproject\阿兹海默\android\android\app\src\main\res"

# 传统图标（ic_launcher 方形全幅 / ic_launcher_round 圆形）
launcher_sizes = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}
for folder, size in launcher_sizes.items():
    d = os.path.join(res_dir, folder)
    os.makedirs(d, exist_ok=True)
    # 方形：全幅铺满，无透明角
    square.resize((size, size), Image.LANCZOS).convert("RGB").save(os.path.join(d, "ic_launcher.png"), "PNG")
    # 圆形：透明圆角
    round_.resize((size, size), Image.LANCZOS).save(os.path.join(d, "ic_launcher_round.png"), "PNG")

# 自适应前景（备用）：脑形主体居中占 60%，透明背景
fg_sizes = {
    "mipmap-mdpi":    108,
    "mipmap-hdpi":    162,
    "mipmap-xhdpi":   216,
    "mipmap-xxhdpi":  324,
    "mipmap-xxxhdpi": 432,
}
for folder, canvas_size in fg_sizes.items():
    out = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw_size = int(canvas_size * 0.6)
    offset = (canvas_size - draw_size) // 2
    logo = fg_src.resize((draw_size, draw_size), Image.LANCZOS)
    out.paste(logo, (offset, offset), logo)
    d = os.path.join(res_dir, folder)
    os.makedirs(d, exist_ok=True)
    out.save(os.path.join(d, "ic_launcher_foreground.png"), "PNG")

print(f"All mipmap icons regenerated ({len(launcher_sizes)*2 + len(fg_sizes)} files)")
