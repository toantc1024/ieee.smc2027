#!/usr/bin/env python3
"""
Bản vẽ Kỹ thuật & Quy chuẩn Thiết kế Banner Hero Carousel (Tiếng Việt)
Kích thước: 2800 x 1600 px (Độ phân giải cao)
Tập trung vào Metrics (Thông số kỹ thuật) và Chữ đơn giản không chồng chéo.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Kích thước Canvas Poster: 2800 x 1600
W, H = 2800, 1600
img = Image.new("RGB", (W, H), (7, 19, 41))
draw = ImageDraw.Draw(img, "RGBA")

# Bảng màu kỹ thuật Blueprint
BG_COLOR = (7, 19, 41)          # Xanh dương đậm Blueprint
GRID_COLOR = (15, 38, 77)        # Đường lưới
ACCENT_CYAN = (0, 229, 255)      # Xanh Cyan công nghệ
SAFE_GREEN = (16, 185, 129)      # Xanh lá an toàn
BLEED_AMBER = (245, 158, 11)     # Vàng cam vùng biên
TEXT_WHITE = (255, 255, 255)     # Trắng
TEXT_MUTED = (148, 163, 184)     # Xám nhạt
PANEL_BG = (10, 26, 56)          # Nền khung
PANEL_BORDER = (30, 58, 110)     # Viền khung

# 1. Vẽ đường lưới kỹ thuật nền (Lưới 40px và 200px)
for x in range(0, W, 40):
    color = (25, 55, 105) if x % 200 == 0 else (12, 30, 62)
    width = 2 if x % 200 == 0 else 1
    draw.line([(x, 0), (x, H)], fill=color, width=width)

for y in range(0, H, 40):
    color = (25, 55, 105) if y % 200 == 0 else (12, 30, 62)
    width = 2 if y % 200 == 0 else 1
    draw.line([(0, y), (W, y)], fill=color, width=width)

# Tải font Arial hỗ trợ tiếng Việt
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 38)
    font_subtitle = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 19)
    font_heading = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
    font_subheading = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 17)
    font_body = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 14)
    font_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
    font_code = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 13)
    font_tag = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 12)
except Exception:
    font_title = font_subtitle = font_heading = font_subheading = font_body = font_bold = font_code = font_tag = ImageFont.load_default()

def draw_arrow_h(d, x1, x2, y, color=(0, 229, 255), width=2):
    """Vẽ đường kích thước nằm ngang với 2 mũi tên"""
    d.line([(x1, y), (x2, y)], fill=color, width=width)
    # Mũi tên trái
    d.polygon([(x1, y), (x1 + 10, y - 5), (x1 + 10, y + 5)], fill=color)
    # Mũi tên phải
    d.polygon([(x2, y), (x2 - 10, y - 5), (x2 - 10, y + 5)], fill=color)

def draw_arrow_v(d, y1, y2, x, color=(0, 229, 255), width=2):
    """Vẽ đường kích thước thẳng đứng với 2 mũi tên"""
    d.line([(x, y1), (x, y2)], fill=color, width=width)
    # Mũi tên trên
    d.polygon([(x, y1), (x - 5, y1 + 10), (x + 5, y1 + 10)], fill=color)
    # Mũi tên dưới
    d.polygon([(x, y2), (x - 5, y2 - 10), (x + 5, y2 - 10)], fill=color)

# ══════════════════════════════════════════════════════════════════
# HEADER: TIÊU ĐỀ BẢN VẼ
# ══════════════════════════════════════════════════════════════════
draw.rectangle([(60, 40), (W - 60, 150)], fill=(10, 25, 54), outline=ACCENT_CYAN, width=2)
for cx_pt, cy_pt in [(60, 40), (W - 60, 40), (60, 150), (W - 60, 150)]:
    draw.rectangle([(cx_pt-6, cy_pt-6), (cx_pt+6, cy_pt+6)], fill=ACCENT_CYAN)

draw.text((100, 56), "IEEE SMC 2027 • BẢN VẼ THIẾT KẾ BANNER HERO CAROUSEL", fill=TEXT_WHITE, font=font_title)
draw.text((100, 110), "Quy chuẩn Safe-Area Contract: Tỉ lệ 2.4 : 1 (Desktop) và 3 : 4 (Mobile) — 100% Không crop chữ", fill=ACCENT_CYAN, font=font_subtitle)
draw.text((W - 400, 72), "PHIÊN BẢN 2.0 (METRICS CHUẨN)\nKIẾN TRÚC GIAO DIỆN", fill=TEXT_MUTED, font=font_bold)

# ══════════════════════════════════════════════════════════════════
# PHẦN TRÁI: BẢN VẼ BANNER DESKTOP (2400 × 1000 px, Tỉ lệ 2.4:1)
# ══════════════════════════════════════════════════════════════════
d_left = 60
d_top = 180
d_w = 1600
d_h = 1060

draw.rectangle([(d_left, d_top), (d_left + d_w, d_top + d_h)], fill=(9, 22, 48), outline=PANEL_BORDER, width=2)
draw.rectangle([(d_left, d_top), (d_left + d_w, d_top + 55)], fill=(14, 32, 70))
draw.text((d_left + 24, d_top + 15), "1. BẢN VẼ BANNER MÁY TÍNH (DESKTOP) — 2400 × 1000 px (Tỉ lệ 2.4 : 1)", fill=ACCENT_CYAN, font=font_heading)

# Tỷ lệ thu nhỏ mô hình Desktop: 1440 x 600 px (0.6x)
cw = 1440
ch = 600
cx = d_left + 100
cy = d_top + 130

# Thước đo kích thước Desktop Canvas
draw_arrow_h(draw, cx, cx + cw, cy - 35, color=ACCENT_CYAN, width=2)
draw.rectangle([(cx + cw // 2 - 160, cy - 55), (cx + cw // 2 + 160, cy - 15)], fill=(6, 20, 45), outline=ACCENT_CYAN)
draw.text((cx + cw // 2 - 140, cy - 47), "CHIỀU RỘNG CANVAS = 2400 px", fill=ACCENT_CYAN, font=font_bold)

draw_arrow_v(draw, cy, cy + ch, cx - 45, color=ACCENT_CYAN, width=2)
draw.rectangle([(cx - 95, cy + ch // 2 - 20), (cx - 5, cy + ch // 2 + 20)], fill=(6, 20, 45), outline=ACCENT_CYAN)
draw.text((cx - 85, cy + ch // 2 - 10), "1000 px", fill=ACCENT_CYAN, font=font_bold)

# Khung Canvas Desktop
draw.rectangle([(cx, cy), (cx + cw, cy + ch)], fill=(4, 15, 36), outline=(0, 229, 255), width=2)

# Vùng lề dự phòng (Bleed): Trên 140px, Dưới 140px, Trái/Phải 260px (thu nhỏ 0.6x)
top_bleed = int(140 * 0.6)  # 84px
bot_bleed = int(140 * 0.6)  # 84px
side_bleed = int(260 * 0.6) # 156px

draw.rectangle([(cx, cy), (cx + cw, cy + top_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(cx, cy + ch - bot_bleed), (cx + cw, cy + ch)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(cx, cy + top_bleed), (cx + side_bleed, cy + ch - bot_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(cx + cw - side_bleed, cy + top_bleed), (cx + cw, cy + ch - bot_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)

# Nhãn lề trên / dưới
draw.text((cx + cw // 2 - 170, cy + 30), "▲ LỀ BIÊN TRÊN = 140 px (Vùng đệm an toàn, không để chữ)", fill=BLEED_AMBER, font=font_bold)
draw.text((cx + cw // 2 - 170, cy + ch - bot_bleed + 30), "▼ LỀ BIÊN DƯỚI = 140 px (Đệm tránh che cụm nút chuyển slide)", fill=BLEED_AMBER, font=font_bold)

# VÙNG AN TOÀN TRỌNG TÂM (1880 x 720 px thu nhỏ = 1128 x 432)
sx = cx + side_bleed
sy = cy + top_bleed
sw = cw - (2 * side_bleed)
sh = ch - top_bleed - bot_bleed

draw.rectangle([(sx, sy), (sx + sw, sy + sh)], fill=(16, 185, 129, 25), outline=SAFE_GREEN, width=3)

# 1. Khu vực Logo (Góc trên trái)
draw.rectangle([(sx + 25, sy + 20), (sx + 450, sy + 85)], fill=(18, 45, 80), outline=(0, 229, 255), width=1)
draw.text((sx + 40, sy + 32), "CỤM LOGO (HCM-UTE • IEEE • SMC)", fill=(0, 229, 255), font=font_bold)
draw.text((sx + 40, sy + 58), "Cách mép trên canvas > 140px (An toàn)", fill=TEXT_MUTED, font=font_code)

# 2. Khu vực Tiêu đề 3D & Thông điệp
draw.rectangle([(sx + 25, sy + 100), (sx + 580, sy + 215)], fill=(20, 52, 95), outline=TEXT_WHITE, width=2)
draw.text((sx + 40, sy + 115), "TIÊU ĐỀ: IEEE SMC 2027", fill=TEXT_WHITE, font=font_heading)
draw.text((sx + 40, sy + 152), "Human-AI Symbiosis: Engineering...", fill=(103, 232, 249), font=font_subheading)
draw.text((sx + 40, sy + 180), "Thông điệp & Chủ đề Hội nghị", fill=TEXT_MUTED, font=font_body)

# 3. Khu vực 3 Trụ cột nghiên cứu
draw.rectangle([(sx + 25, sy + 230), (sx + 580, sy + 300)], fill=(16, 42, 75), outline=(52, 211, 153), width=1)
draw.text((sx + 40, sy + 242), "3 TRỤ CỘT: Systems • Cybernetics • Human-Machine", fill=(52, 211, 153), font=font_bold)
draw.text((sx + 40, sy + 268), "68 Chủ đề nghiên cứu • Xuất bản IEEE Xplore®", fill=TEXT_MUTED, font=font_body)

# 4. Khu vực Ngày tháng & Địa điểm
draw.rectangle([(sx + 25, sy + 315), (sx + 520, sy + 375)], fill=(18, 45, 80), outline=ACCENT_CYAN, width=1)
draw.text((sx + 40, sy + 328), "THỜI GIAN: 06–10/10/2027 • TP. Hồ Chí Minh", fill=TEXT_WHITE, font=font_bold)
draw.text((sx + 40, sy + 350), "Sheraton Saigon Grand Opera Hotel", fill=ACCENT_CYAN, font=font_code)

# 5. Phía Phải: Khu vực Artwork 3D & Skyline TP.HCM
draw.rectangle([(sx + 605, sy + 20), (sx + sw - 25, sy + sh - 25)], fill=(22, 40, 78), outline=(0, 229, 255), width=2)
draw.text((sx + 630, sy + 45), "KHU VỰC ARTWORK 3D & SKYLINE HOÀNG HÔN", fill=ACCENT_CYAN, font=font_heading)
draw.text((sx + 630, sy + 88), "• Toàn cảnh TP. Hồ Chí Minh lúc hoàng hôn\n• Quả cầu điều khiển học & mạng nơ-ron số\n• Bàn tay người & bàn tay robot 3D\n• Khách sạn Sheraton Saigon & dải lụa ánh sáng", fill=TEXT_MUTED, font=font_body)
draw.text((sx + 630, sy + 205), "Artwork trải dài mượt mà ra sát mép phải", fill=(103, 232, 249), font=font_code)

# Thẻ chú giải dưới sơ đồ Desktop
draw.rectangle([(d_left + 80, d_top + 770), (d_left + 740, d_top + 850)], fill=(16, 185, 129, 30), outline=SAFE_GREEN, width=2)
draw.text((d_left + 100, d_top + 782), "VÙNG AN TOÀN (1880 × 720 px): 100% HIỂN THỊ TRỌN VẸN", fill=SAFE_GREEN, font=font_bold)
draw.text((d_left + 100, d_top + 812), "Logo, tiêu đề, ngày tháng, nút bấm bắt buộc phải nằm trong khung này.", fill=TEXT_WHITE, font=font_body)

draw.rectangle([(d_left + 780, d_top + 770), (d_left + 1520, d_top + 850)], fill=(245, 158, 11, 30), outline=BLEED_AMBER, width=2)
draw.text((d_left + 800, d_top + 782), "VÙNG BIÊN DỰ PHÒNG: Trên/Dưới 140px, Trái/Phải 260px", fill=BLEED_AMBER, font=font_bold)
draw.text((d_left + 800, d_top + 812), "Chỉ dùng để nối dài nền xanh & ánh sáng hoàng hôn, tuyệt đối không để chữ!", fill=TEXT_WHITE, font=font_body)

# Ghi chú kỹ thuật cho Desktop
tech_notes_d = (
    "QUY TẮC XUẤT FILE CHO DESKTOP:\n"
    "• Kích thước xuất file: ĐÚNG 2400 × 1000 px — Tỉ lệ 2.4 : 1 (JPG 85-90%)\n"
    "• Vùng an toàn 1880 × 720 px: Tọa độ X: 260..2140 px, Y: 140..860 px\n"
    "• Khung CSS: .hero-carousel-height có aspect-ratio: 2.4 / 1 trong src/app/globals.css"
)
draw.rectangle([(d_left + 80, d_top + 875), (d_left + d_w - 80, d_top + 1025)], fill=(12, 28, 56), outline=PANEL_BORDER)
draw.text((d_left + 110, d_top + 895), tech_notes_d, fill=TEXT_WHITE, font=font_body)

# ══════════════════════════════════════════════════════════════════
# PHẦN PHẢI: BẢN VẼ BANNER DI ĐỘNG (MOBILE: 896 × 1200 px, Tỉ lệ 3:4)
# ══════════════════════════════════════════════════════════════════
m_left = 1700
m_top = 180
m_w = 1040
m_h = 1060

draw.rectangle([(m_left, m_top), (m_left + m_w, m_top + m_h)], fill=(9, 22, 48), outline=PANEL_BORDER, width=2)
draw.rectangle([(m_left, m_top), (m_left + m_w, m_top + 55)], fill=(14, 32, 70))
draw.text((m_left + 24, m_top + 15), "2. BẢN VẼ BANNER DI ĐỘNG (MOBILE) — 896 × 1200 px (Tỉ lệ 3 : 4)", fill=(52, 211, 153), font=font_heading)

mcw = 448
mch = 600
mcx = m_left + (m_w - mcw) // 2
mcy = d_top + 130

# Thước đo kích thước Mobile
draw_arrow_h(draw, mcx, mcx + mcw, mcy - 35, color=(52, 211, 153), width=2)
draw.rectangle([(mcx + mcw // 2 - 120, mcy - 55), (mcx + mcw // 2 + 120, mcy - 15)], fill=(6, 20, 45), outline=(52, 211, 153))
draw.text((mcx + mcw // 2 - 100, mcy - 47), "CHIỀU RỘNG = 896 px", fill=(52, 211, 153), font=font_bold)

draw_arrow_v(draw, mcy, mcy + mch, mcx - 45, color=(52, 211, 153), width=2)
draw.rectangle([(mcx - 95, mcy + mch // 2 - 20), (mcx - 5, mcy + mch // 2 + 20)], fill=(6, 20, 45), outline=(52, 211, 153))
draw.text((mcx - 85, mcy + mch // 2 - 10), "1200 px", fill=(52, 211, 153), font=font_bold)

# Khung Canvas Mobile
draw.rectangle([(mcx, mcy), (mcx + mcw, mcy + mch)], fill=(4, 15, 36), outline=(52, 211, 153), width=2)

m_top_bleed = int(70 * 0.5)   # 35px
m_bot_bleed = int(80 * 0.5)   # 40px
m_side_bleed = int(48 * 0.5)  # 24px

draw.rectangle([(mcx, mcy), (mcx + mcw, mcy + m_top_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(mcx, mcy + mch - m_bot_bleed), (mcx + mcw, mcy + mch)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)

msx = mcx + m_side_bleed
msy = mcy + m_top_bleed
msw = mcw - (2 * m_side_bleed)
msh = mch - m_top_bleed - m_bot_bleed

draw.rectangle([(msx, msy), (msx + msw, msy + msh)], fill=(16, 185, 129, 25), outline=SAFE_GREEN, width=3)

# 1. Logo Mobile
draw.rectangle([(msx + 12, msy + 12), (msx + msw - 12, msy + 60)], fill=(18, 45, 80), outline=(0, 229, 255))
draw.text((msx + 35, msy + 20), "LOGOS: HCM-UTE • IEEE • SMC", fill=(0, 229, 255), font=font_bold)
draw.text((msx + 50, msy + 38), "Đệm lề trên > 70px (Tránh che tai thỏ)", fill=TEXT_MUTED, font=font_tag)

# 2. Tiêu đề 3D Mobile
draw.rectangle([(msx + 12, msy + 70), (msx + msw - 12, msy + 170)], fill=(20, 52, 95), outline=TEXT_WHITE)
draw.text((msx + 30, msy + 82), "TIÊU ĐỀ: IEEE SMC 2027", fill=TEXT_WHITE, font=font_heading)
draw.text((msx + 15, msy + 118), "Human-AI Symbiosis: Engineering...", fill=(103, 232, 249), font=font_bold)
draw.text((msx + 50, msy + 144), "Căn giữa theo trục dọc", fill=TEXT_MUTED, font=font_tag)

# 3. 3 Trụ cột Mobile
draw.rectangle([(msx + 12, msy + 180), (msx + msw - 12, msy + 250)], fill=(16, 42, 75), outline=(52, 211, 153))
draw.text((msx + 35, msy + 190), "3 TRỤ CỘT NGHIÊN CỨU", fill=(52, 211, 153), font=font_bold)
draw.text((msx + 15, msy + 212), "Systems • Cybernetics • Human-Machine", fill=TEXT_WHITE, font=font_tag)
draw.text((msx + 45, msy + 230), "68 Chủ đề • Xuất bản IEEE Xplore®", fill=TEXT_MUTED, font=font_tag)

# 4. Ngày tháng Mobile
draw.rectangle([(msx + 12, msy + 260), (msx + msw - 12, msy + 305)], fill=(18, 45, 80), outline=ACCENT_CYAN)
draw.text((msx + 30, msy + 273), "06–10/10/2027 • TP. Hồ Chí Minh", fill=TEXT_WHITE, font=font_bold)

# 5. Artwork 3D Mobile
draw.rectangle([(msx + 12, msy + 315), (msx + msw - 12, msy + msh - 12)], fill=(22, 40, 78), outline=(0, 229, 255))
draw.text((msx + 35, msy + 335), "ARTWORK 3D TP.HCM & CYBERNETICS", fill=ACCENT_CYAN, font=font_bold)
draw.text((msx + 35, msy + 370), "• Toàn cảnh TP.HCM hoàng hôn\n• Dòng dữ liệu điều khiển học\n• Quả cầu năng lượng số\n• Ven sông Sài Gòn lung linh", fill=TEXT_MUTED, font=font_tag)

draw.rectangle([(m_left + 60, m_top + 770), (m_left + m_w - 60, m_top + 850)], fill=(16, 185, 129, 30), outline=SAFE_GREEN, width=2)
draw.text((m_left + 80, m_top + 782), "VÙNG AN TOÀN (800 × 1050 px): 100% HIỂN THỊ TRÊN ĐIỆN THOẠI", fill=SAFE_GREEN, font=font_bold)
draw.text((m_left + 80, m_top + 812), "Không bị che bởi thanh điều hướng trình duyệt hay phần khoét màn hình.", fill=TEXT_WHITE, font=font_body)

tech_notes_m = (
    "QUY TẮC XUẤT FILE CHO DI ĐỘNG (MOBILE):\n"
    "• Kích thước xuất file: ĐÚNG 896 × 1200 px — Tỉ lệ dọc 3 : 4 (JPG 85-90%)\n"
    "• Vùng an toàn 800 × 1050 px: Tọa độ X: 48..848 px, Y: 70..1120 px\n"
    "• Khung CSS: aspect-ratio: 3 / 4 trong src/app/globals.css"
)
draw.rectangle([(m_left + 60, m_top + 875), (m_left + m_w - 60, m_top + 1025)], fill=(12, 28, 56), outline=PANEL_BORDER)
draw.text((m_left + 85, m_top + 895), tech_notes_m, fill=TEXT_WHITE, font=font_body)

# ══════════════════════════════════════════════════════════════════
# THANH TỔNG HỢP NGUYÊN TẮC THIẾT KẾ PHÍA DƯỚI CÙNG
# ══════════════════════════════════════════════════════════════════
foot_top = 1270
foot_h = 280
draw.rectangle([(60, foot_top), (W - 60, foot_top + foot_h)], fill=(10, 24, 52), outline=ACCENT_CYAN, width=2)

draw.text((100, foot_top + 25), "TỔNG HỢP QUY CHUẨN THIẾT KẾ HERO BANNER IEEE SMC 2027", fill=ACCENT_CYAN, font=font_heading)

rule_1 = (
    "1. TỈ LỆ VÀNG CHUẨN MỰC:\n"
    "• Desktop: 2400 × 1000 px (2.4 : 1)\n"
    "• Mobile:  896 × 1200 px (3 : 4)"
)
rule_2 = (
    "2. KÍCH THƯỚC VÙNG AN TOÀN:\n"
    "• Desktop: 1880 × 720 px (y = 140..860)\n"
    "• Mobile:  800 × 1050 px (y = 70..1120)"
)
rule_3 = (
    "3. NGUYÊN NHÂN TỪNG BỊ CẮT CHỮ:\n"
    "• Khung CSS từng có min-height: 520px\n"
    "• Đã gỡ bỏ min-height hoàn toàn\n"
    "• Banner co giãn mượt mà 100% 0% crop"
)
rule_4 = (
    "4. BẢNG MÀU CHÍNH HỘI NGHỊ:\n"
    "• Nền: Xanh đêm #021b3b & #071329\n"
    "• Xanh chủ đạo: #115eff (HCM-UTE Blue)\n"
    "• Điểm nhấn: Cyan #00e5ff & Lime #4ade80"
)

draw.text((100, foot_top + 80), rule_1, fill=TEXT_WHITE, font=font_body)
draw.text((680, foot_top + 80), rule_2, fill=SAFE_GREEN, font=font_body)
draw.text((1340, foot_top + 80), rule_3, fill=BLEED_AMBER, font=font_body)
draw.text((2040, foot_top + 80), rule_4, fill=(103, 232, 249), font=font_body)

# Lưu file ảnh blueprint chất lượng cao
out_dir = 'public/carousel/safe-area'
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'carousel-design-blueprint.png')
img.save(out_path, quality=95)
print(f"Đã xuất file Blueprint tiếng Việt thành công: {out_path} ({img.size})")
