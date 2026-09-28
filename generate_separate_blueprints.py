#!/usr/bin/env python3
"""
Tạo 2 tấm ảnh Blueprint Kỹ thuật RIÊNG BIỆT (Desktop & Mobile)
- Desktop: đúng 2400 × 1000 px (Tỉ lệ 2.4 : 1)
- Mobile: đúng 896 × 1200 px (Tỉ lệ 3 : 4)
- 100% tập trung vào METRICS (Kích thước, Vùng an toàn, Tọa độ, Thước đo)
- TUYỆT ĐỐI KHÔNG CHỒNG CHÉO CHỮ
- KHÔNG CÓ TIÊU ĐỀ HỘI NGHỊ NỘI DUNG GIẢ, CỰC KỲ DỄ DÙNG CHO DESIGNER
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Tải font Arial hỗ trợ tiếng Việt
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
    font_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)
    font_regular = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)
    font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
    font_code = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 16)
    font_tiny = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 13)
except Exception:
    font_large = font_title = font_bold = font_regular = font_small = font_code = font_tiny = ImageFont.load_default()

def draw_arrow_h(d, x1, x2, y, color=(0, 229, 255), width=2):
    """Vẽ đường kích thước nằm ngang với mũi tên 2 đầu"""
    d.line([(x1, y), (x2, y)], fill=color, width=width)
    d.polygon([(x1, y), (x1 + 12, y - 6), (x1 + 12, y + 6)], fill=color)
    d.polygon([(x2, y), (x2 - 12, y - 6), (x2 - 12, y + 6)], fill=color)

def draw_arrow_v(d, y1, y2, x, color=(0, 229, 255), width=2):
    """Vẽ đường kích thước thẳng đứng với mũi tên 2 đầu"""
    d.line([(x, y1), (x, y2)], fill=color, width=width)
    d.polygon([(x, y1), (x - 6, y1 + 12), (x + 6, y1 + 12)], fill=color)
    d.polygon([(x, y2), (x - 6, y2 - 12), (x + 6, y2 - 12)], fill=color)

def draw_dashed_line_h(d, x1, x2, y, color=(245, 158, 11), width=2, dash=12, gap=8):
    cur_x = x1
    while cur_x < x2:
        next_x = min(cur_x + dash, x2)
        d.line([(cur_x, y), (next_x, y)], fill=color, width=width)
        cur_x += dash + gap

def draw_dashed_line_v(d, y1, y2, x, color=(245, 158, 11), width=2, dash=12, gap=8):
    cur_y = y1
    while cur_y < y2:
        next_y = min(cur_y + dash, y2)
        d.line([(x, cur_y), (x, next_y)], fill=color, width=width)
        cur_y += dash + gap

out_dir = "public/carousel/safe-area"
os.makedirs(out_dir, exist_ok=True)

# ═════════════════════════════════════════════════════════════════════════════
# 1. ẢNH BLUEPRINT DESKTOP: ĐÚNG 2400 × 1000 PX (TỈ LỆ 2.4 : 1)
# ═════════════════════════════════════════════════════════════════════════════
DW, DH = 2400, 1000
img_d = Image.new("RGB", (DW, DH), (7, 19, 41))
draw_d = ImageDraw.Draw(img_d, "RGBA")

# Lưới kỹ thuật
for x in range(0, DW, 40):
    col = (20, 45, 88) if x % 200 == 0 else (12, 28, 58)
    w = 2 if x % 200 == 0 else 1
    draw_d.line([(x, 0), (x, DH)], fill=col, width=w)

for y in range(0, DH, 40):
    col = (20, 45, 88) if y % 200 == 0 else (12, 28, 58)
    w = 2 if y % 200 == 0 else 1
    draw_d.line([(0, y), (DW, y)], fill=col, width=w)

# Vùng đệm Bleed Desktop:
# Top: 0..140, Bottom: 860..1000, Left: 0..260, Right: 2140..2400
# Safe Area: x = 260..2140 (1880px), y = 140..860 (720px)
draw_d.rectangle([(0, 0), (DW, 140)], fill=(245, 158, 11, 35))
draw_d.rectangle([(0, 860), (DW, DH)], fill=(245, 158, 11, 35))
draw_d.rectangle([(0, 140), (260, 860)], fill=(245, 158, 11, 35))
draw_d.rectangle([(2140, 140), (DW, 860)], fill=(245, 158, 11, 35))

# Đường nét đứt
draw_dashed_line_h(draw_d, 0, DW, 140, color=(245, 158, 11), width=2)
draw_dashed_line_h(draw_d, 0, DW, 860, color=(245, 158, 11), width=2)
draw_dashed_line_v(draw_d, 140, 860, 260, color=(245, 158, 11), width=2)
draw_dashed_line_v(draw_d, 140, 860, 2140, color=(245, 158, 11), width=2)

# Nhãn Lề trên & Lề dưới
draw_d.rectangle([(DW // 2 - 280, 45), (DW // 2 + 280, 95)], fill=(12, 25, 52), outline=(245, 158, 11), width=2)
draw_d.text((DW // 2, 70), "▲ LỀ BIÊN TRÊN = 140 px (VÙNG ĐỆM AN TOÀN)", fill=(251, 191, 36), font=font_bold, anchor="mm")

draw_d.rectangle([(DW // 2 - 320, 905), (DW // 2 + 320, 955)], fill=(12, 25, 52), outline=(245, 158, 11), width=2)
draw_d.text((DW // 2, 930), "▼ LỀ BIÊN DƯỚI = 140 px (ĐỆM TRÁNH CHE NÚT SLIDE)", fill=(251, 191, 36), font=font_bold, anchor="mm")

# Nhãn Lề trái & Lề phải
draw_d.rectangle([(30, 470), (230, 530)], fill=(12, 25, 52), outline=(245, 158, 11), width=2)
draw_d.text((130, 500), "◄ LỀ TRÁI\n    260 px", fill=(251, 191, 36), font=font_bold, anchor="mm")

draw_d.rectangle([(DW - 230, 470), (DW - 30, 530)], fill=(12, 25, 52), outline=(245, 158, 11), width=2)
draw_d.text((DW - 130, 500), "LỀ PHẢI ►\n  260 px", fill=(251, 191, 36), font=font_bold, anchor="mm")

# ═══ VÙNG AN TOÀN TRỌNG TÂM (SAFE AREA: 1880 × 720 px) ═══
draw_d.rectangle([(260, 140), (2140, 860)], fill=(16, 185, 129, 25), outline=(16, 185, 129), width=4)
draw_d.rectangle([(264, 144), (2136, 856)], fill=None, outline=(16, 185, 129, 80), width=1)

# Tâm chữ thập (Center Crosshair)
draw_d.line([(1200 - 40, 500), (1200 + 40, 500)], fill=(255, 255, 255), width=2)
draw_d.line([(1200, 500 - 40), (1200, 500 + 40)], fill=(255, 255, 255), width=2)
draw_d.text((1200, 545), "TÂM CANVAS (X: 1200, Y: 500)", fill=(148, 163, 184), font=font_code, anchor="mm")

# Thước đo ngang Vùng an toàn (1880 px)
draw_arrow_h(draw_d, 280, 2120, 220, color=(16, 185, 129), width=3)
draw_d.rectangle([(1200 - 240, 195), (1200 + 240, 245)], fill=(6, 32, 24), outline=(16, 185, 129), width=2)
draw_d.text((1200, 220), "CHIỀU RỘNG AN TOÀN = 1880 px", fill=(52, 211, 153), font=font_bold, anchor="mm")

# Thước đo dọc Vùng an toàn (720 px)
draw_arrow_v(draw_d, 160, 840, 360, color=(16, 185, 129), width=3)
draw_d.rectangle([(300, 475), (420, 525)], fill=(6, 32, 24), outline=(16, 185, 129), width=2)
draw_d.text((360, 500), "720 px", fill=(52, 211, 153), font=font_bold, anchor="mm")

# Khung thông số chính giữa Vùng An Toàn
card_w, card_h = 920, 180
card_x = (DW - card_w) // 2
card_y = 620
draw_d.rectangle([(card_x, card_y), (card_x + card_w, card_y + card_h)], fill=(8, 26, 56), outline=(0, 229, 255), width=2)

draw_d.text((DW // 2, card_y + 35), "VÙNG AN TOÀN DESKTOP: 1880 × 720 PX", fill=(0, 229, 255), font=font_title, anchor="mm")
draw_d.text((DW // 2, card_y + 75), "Tọa độ: X = 260 → 2140 px  |  Y = 140 → 860 px  (Tỉ lệ chuẩn 2.4 : 1)", fill=(255, 255, 255), font=font_bold, anchor="mm")
draw_d.text((DW // 2, card_y + 115), "• 100% nội dung quan trọng (Logo, Tiêu đề, CTA) bắt buộc nằm trong khung xanh này", fill=(167, 243, 208), font=font_regular, anchor="mm")
draw_d.text((DW // 2, card_y + 145), "• Vùng viền vàng 140px/260px chỉ dùng cho nền background, tuyệt đối không đặt chữ", fill=(251, 191, 36), font=font_regular, anchor="mm")

# Nhãn thông số Canvas ở 4 góc
draw_d.text((30, 25), "CANVAS: 2400 × 1000 px  (Tỉ lệ 2.4 : 1)", fill=(0, 229, 255), font=font_bold)
draw_d.text((DW - 30, 25), "DESKTOP BLUEPRINT TEMPLATE", fill=(148, 163, 184), font=font_code, anchor="ra")

out_desktop = os.path.join(out_dir, "desktop-blueprint.png")
img_d.save(out_desktop, quality=95)
print(f"Đã xuất ảnh Desktop Blueprint: {out_desktop} ({img_d.size})")


# ═════════════════════════════════════════════════════════════════════════════
# 2. ẢNH BLUEPRINT MOBILE: ĐÚNG 896 × 1200 PX (TỈ LỆ 3 : 4)
# ═════════════════════════════════════════════════════════════════════════════
MW, MH = 896, 1200
img_m = Image.new("RGB", (MW, MH), (7, 19, 41))
draw_m = ImageDraw.Draw(img_m, "RGBA")

# Lưới kỹ thuật
for x in range(0, MW, 40):
    col = (20, 45, 88) if x % 200 == 0 else (12, 28, 58)
    w = 2 if x % 200 == 0 else 1
    draw_m.line([(x, 0), (x, MH)], fill=col, width=w)

for y in range(0, MH, 40):
    col = (20, 45, 88) if y % 200 == 0 else (12, 28, 58)
    w = 2 if y % 200 == 0 else 1
    draw_m.line([(0, y), (MW, y)], fill=col, width=w)

# Vùng đệm Bleed Mobile:
# Top: 0..70, Bottom: 1120..1200, Left: 0..48, Right: 848..896
# Safe Area: x = 48..848 (800px), y = 70..1120 (1050px)
draw_m.rectangle([(0, 0), (MW, 70)], fill=(245, 158, 11, 35))
draw_m.rectangle([(0, 1120), (MW, MH)], fill=(245, 158, 11, 35))
draw_m.rectangle([(0, 70), (48, 1120)], fill=(245, 158, 11, 35))
draw_m.rectangle([(848, 70), (MW, 1120)], fill=(245, 158, 11, 35))

draw_dashed_line_h(draw_m, 0, MW, 70, color=(245, 158, 11), width=2)
draw_dashed_line_h(draw_m, 0, MW, 1120, color=(245, 158, 11), width=2)
draw_dashed_line_v(draw_m, 70, 1120, 48, color=(245, 158, 11), width=2)
draw_dashed_line_v(draw_m, 70, 1120, 848, color=(245, 158, 11), width=2)

# Nhãn Lề trên & Lề dưới Mobile (Không bị chồng bất kỳ chữ nào)
draw_m.rectangle([(MW // 2 - 220, 14), (MW // 2 + 220, 56)], fill=(12, 25, 52), outline=(245, 158, 11), width=1)
draw_m.text((MW // 2, 35), "▲ LỀ TRÊN: 70 px (TRÁNH TAI THỎ / NOTCH)", fill=(251, 191, 36), font=font_bold, anchor="mm")

draw_m.rectangle([(MW // 2 - 220, 1144), (MW // 2 + 220, 1186)], fill=(12, 25, 52), outline=(245, 158, 11), width=1)
draw_m.text((MW // 2, 1165), "▼ LỀ DƯỚI: 80 px (TRÁNH CHE NÚT SLIDE)", fill=(251, 191, 36), font=font_bold, anchor="mm")

# ═══ VÙNG AN TOÀN MOBILE (SAFE AREA: 800 × 1050 px) ═══
draw_m.rectangle([(48, 70), (848, 1120)], fill=(16, 185, 129, 25), outline=(16, 185, 129), width=4)
draw_m.rectangle([(52, 74), (844, 1116)], fill=None, outline=(16, 185, 129, 80), width=1)

# Tâm chữ thập Mobile
draw_m.line([(448 - 40, 560), (448 + 40, 560)], fill=(255, 255, 255), width=2)
draw_m.line([(448, 560 - 40), (448, 560 + 40)], fill=(255, 255, 255), width=2)
draw_m.text((448, 605), "TÂM CANVAS (X: 448, Y: 600)", fill=(148, 163, 184), font=font_code, anchor="mm")

# Thước đo ngang Mobile Safe Area (800 px)
draw_arrow_h(draw_m, 68, 828, 130, color=(16, 185, 129), width=3)
draw_m.rectangle([(MW // 2 - 180, 105), (MW // 2 + 180, 155)], fill=(6, 32, 24), outline=(16, 185, 129), width=2)
draw_m.text((MW // 2, 130), "RỘNG AN TOÀN = 800 px", fill=(52, 211, 153), font=font_bold, anchor="mm")

# Thước đo dọc Mobile Safe Area (1050 px)
draw_arrow_v(draw_m, 90, 1100, 105, color=(16, 185, 129), width=3)
draw_m.rectangle([(65, 535), (145, 585)], fill=(6, 32, 24), outline=(16, 185, 129), width=2)
draw_m.text((105, 560), "1050 px", fill=(52, 211, 153), font=font_bold, anchor="mm")

# Khung thông số chính giữa Vùng An Toàn Mobile
m_card_w, m_card_h = 680, 260
m_card_x = (MW - m_card_w) // 2
m_card_y = 740
draw_m.rectangle([(m_card_x, m_card_y), (m_card_x + m_card_w, m_card_y + m_card_h)], fill=(8, 26, 56), outline=(52, 211, 153), width=2)

draw_m.text((MW // 2, m_card_y + 35), "VÙNG AN TOÀN MOBILE: 800 × 1050 PX", fill=(52, 211, 153), font=font_title, anchor="mm")
draw_m.text((MW // 2, m_card_y + 75), "Tọa độ: X = 48 → 848 px  |  Y = 70 → 1120 px", fill=(255, 255, 255), font=font_bold, anchor="mm")
draw_m.text((MW // 2, m_card_y + 110), "Canvas: 896 × 1200 px  (Tỉ lệ chuẩn 3 : 4)", fill=(103, 232, 249), font=font_regular, anchor="mm")
draw_m.text((MW // 2, m_card_y + 155), "• Tất cả chữ, logo, nút bấm nằm trong khung xanh 800×1050", fill=(167, 243, 208), font=font_regular, anchor="mm")
draw_m.text((MW // 2, m_card_y + 185), "• Căn giữa toàn bộ theo trục dọc thiết bị", fill=(255, 255, 255), font=font_regular, anchor="mm")
draw_m.text((MW // 2, m_card_y + 220), "• Lề 2 bên 48px: Vùng đệm mép màn hình cảm ứng", fill=(251, 191, 36), font=font_regular, anchor="mm")

out_mobile = os.path.join(out_dir, "mobile-blueprint.png")
img_m.save(out_mobile, quality=95)
print(f"Đã xuất ảnh Mobile Blueprint: {out_mobile} ({img_m.size})")
