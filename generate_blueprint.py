import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions for the Blueprint Guide Poster: 2800 x 1600 (High-Res 16:9 ultra-crisp)
W, H = 2800, 1600

# Color Palette (Futuristic Technical Blueprint)
BG_COLOR = (7, 19, 41)          # Deep Navy Tech Blueprint
GRID_COLOR = (15, 38, 77)        # Blueprint Grid Lines
ACCENT_CYAN = (0, 229, 255)      # Blueprint Cyan Accent
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (148, 163, 184)
SAFE_GREEN = (16, 185, 129)      # Safe Area Green
BLEED_AMBER = (245, 158, 11)     # Bleed Warning Amber
DANGER_RED = (239, 68, 68)       # Danger/Crop Red
BOX_BG = (12, 28, 58)
PANEL_BORDER = (30, 58, 110)

img = Image.new('RGB', (W, H), BG_COLOR)
draw = ImageDraw.Draw(img)

# 1. Draw Blueprint Background Grid (40px squares + 200px major lines)
for x in range(0, W, 40):
    color = (25, 55, 105) if x % 200 == 0 else (12, 30, 62)
    width = 2 if x % 200 == 0 else 1
    draw.line([(x, 0), (x, H)], fill=color, width=width)

for y in range(0, H, 40):
    color = (25, 55, 105) if y % 200 == 0 else (12, 30, 62)
    width = 2 if y % 200 == 0 else 1
    draw.line([(0, y), (W, y)], fill=color, width=width)

# Load font if available or default
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 44)
    font_subtitle = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    font_heading = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
    font_subheading = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)
    font_body = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16)
    font_bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 17)
    font_code = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 15)
    font_tag = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 13)
except Exception:
    font_title = font_subtitle = font_heading = font_subheading = font_body = font_bold = font_code = font_tag = ImageFont.load_default()

# ══════════════════════════════════════════════════════════════════
# HEADER SECTION
# ══════════════════════════════════════════════════════════════════
draw.rectangle([(60, 40), (W - 60, 150)], fill=(10, 25, 54), outline=ACCENT_CYAN, width=2)

# Corner Tech Ticks
for cx, cy in [(60, 40), (W - 60, 40), (60, 150), (W - 60, 150)]:
    draw.rectangle([(cx-6, cy-6), (cx+6, cy+6)], fill=ACCENT_CYAN)

draw.text((100, 58), "IEEE SMC 2027 • HERO CAROUSEL DESIGN BLUEPRINT", fill=TEXT_WHITE, font=font_title)
draw.text((100, 112), "Official Safe Area Contract & Responsive Dimensional Specification for Desktop and Mobile Banners", fill=ACCENT_CYAN, font=font_subtitle)
draw.text((W - 350, 75), "SPEC VERSION 2.0\nCANVAS ARCHITECTURE", fill=TEXT_MUTED, font=font_bold)

# ══════════════════════════════════════════════════════════════════
# LEFT SECTION: DESKTOP BLUEPRINT (Canvas: 2400 x 1000, 2.4:1 ratio)
# ══════════════════════════════════════════════════════════════════
d_left = 60
d_top = 180
d_w = 1600
d_h = 1050

draw.rectangle([(d_left, d_top), (d_left + d_w, d_top + d_h)], fill=(9, 22, 48), outline=PANEL_BORDER, width=2)
# Panel Title Header
draw.rectangle([(d_left, d_top), (d_left + d_w, d_top + 60)], fill=(14, 32, 70))
draw.text((d_left + 24, d_top + 16), "DESKTOP BANNER BLUEPRINT — 2400 × 1000 px (2.4 : 1 Ratio)", fill=ACCENT_CYAN, font=font_heading)

# Desktop Scale representation:
# Let's draw an actual diagram of the 2400 x 1000 canvas inside this panel
# Box size inside panel: Width = 1440px, Height = 600px (scale = 0.6x of 2400x1000!)
cw = 1440
ch = 600
cx = d_left + (d_w - cw) // 2   # 140
cy = d_top + 120               # 300

# Draw Desktop Outer Canvas (2400 x 1000 scale)
draw.rectangle([(cx, cy), (cx + cw, cy + ch)], fill=(4, 15, 36), outline=(0, 229, 255), width=2)

# Top & Bottom Danger Bleed (140px scaled = 140 * 0.6 = 84px)
top_bleed = int(140 * 0.6) # 84px
bot_bleed = int(140 * 0.6) # 84px
side_bleed = int(260 * 0.6) # 156px

# Fill Bleed zones with diagonal hatch / translucent amber tint
draw.rectangle([(cx, cy), (cx + cw, cy + top_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(cx, cy + ch - bot_bleed), (cx + cw, cy + ch)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(cx, cy + top_bleed), (cx + side_bleed, cy + ch - bot_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(cx + cw - side_bleed, cy + top_bleed), (cx + cw, cy + ch - bot_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)

# SAFE AREA RECTANGLE (1880 x 720 scaled = 1128 x 432)
sx = cx + side_bleed
sy = cy + top_bleed
sw = cw - (2 * side_bleed) # 1128
sh = ch - top_bleed - bot_bleed # 432

draw.rectangle([(sx, sy), (sx + sw, sy + sh)], fill=(16, 185, 129, 25), outline=SAFE_GREEN, width=3)

# Inside Safe Area: Compartments
# 1. Logo Zone (top-left)
draw.rectangle([(sx + 30, sy + 25), (sx + 450, sy + 105)], fill=(18, 45, 80), outline=(0, 229, 255), width=1)
draw.text((sx + 45, sy + 45), "LOGO ZONE (HCM-UTE • IEEE • SMC)", fill=(0, 229, 255), font=font_bold)
draw.text((sx + 45, sy + 72), "y: 150px..240px from canvas top (Safe)", fill=TEXT_MUTED, font=font_code)

# 2. Main 3D Title Zone
draw.rectangle([(sx + 30, sy + 120), (sx + 580, sy + 240)], fill=(20, 52, 95), outline=TEXT_WHITE, width=2)
draw.text((sx + 45, sy + 140), "3D TITLE: IEEE SMC 2027", fill=TEXT_WHITE, font=font_heading)
draw.text((sx + 45, sy + 180), "Human-AI Symbiosis: Engineering...", fill=(103, 232, 249), font=font_subheading)
draw.text((sx + 45, sy + 208), "Tagline & theme statement", fill=TEXT_MUTED, font=font_body)

# 3. Topic Pillars Zone
draw.rectangle([(sx + 30, sy + 255), (sx + 580, sy + 325)], fill=(16, 42, 75), outline=(52, 211, 153), width=1)
draw.text((sx + 45, sy + 270), "PILLAR PILLS: Systems • Cybernetics • Human-Machine", fill=(52, 211, 153), font=font_bold)
draw.text((sx + 45, sy + 295), "68 Technical Tracks • Indexed in IEEE Xplore®", fill=TEXT_MUTED, font=font_body)

# 4. Dates & Location Zone
draw.rectangle([(sx + 30, sy + 340), (sx + 520, sy + 405)], fill=(18, 45, 80), outline=ACCENT_CYAN, width=1)
draw.text((sx + 45, sy + 355), "DATES & LOCATION: Oct 6–10, 2027 • Ho Chi Minh City", fill=TEXT_WHITE, font=font_bold)
draw.text((sx + 45, sy + 380), "Safe above bottom margin (y: 820px)", fill=ACCENT_CYAN, font=font_code)

# 5. Right Side: 3D Artwork / Cityscape Zone
draw.rectangle([(sx + 610, sy + 25), (sx + sw - 30, sy + sh - 25)], fill=(22, 40, 78), outline=(0, 229, 255), width=2)
draw.text((sx + 640, sy + 60), "3D ARTWORK & TWILIGHT SKYLINE ZONE", fill=ACCENT_CYAN, font=font_heading)
draw.text((sx + 640, sy + 105), "• Ho Chi Minh City panoramic dusk skyline\n• Glowing cyan / amber cybernetic neural mesh\n• 3D holographic research nodes & manuscript\n• Sheraton Saigon venue & golden light ribbons", fill=TEXT_MUTED, font=font_body)
draw.text((sx + 640, sy + 220), "Artwork extends naturally across right edge", fill=(103, 232, 249), font=font_code)

# Annotations & Dimension Arrows for Desktop
draw.text((cx + cw // 2 - 120, cy - 35), "CANVAS WIDTH = 2400 px", fill=ACCENT_CYAN, font=font_bold)
draw.text((cx - 130, cy + ch // 2 - 10), "1000 px", fill=ACCENT_CYAN, font=font_bold)

# Bleed / Safe Zone Callout badges below diagram
draw.rectangle([(d_left + 80, d_top + 760), (d_left + 720, d_top + 840)], fill=(16, 185, 129, 30), outline=SAFE_GREEN, width=2)
draw.text((d_left + 100, d_top + 772), "SAFE ZONE (1880 × 720 px): 100% GUARANTEED VISIBLE", fill=SAFE_GREEN, font=font_bold)
draw.text((d_left + 100, d_top + 802), "Logos, titles, pillar badges, and dates must stay within this box.", fill=TEXT_WHITE, font=font_body)

draw.rectangle([(d_left + 760, d_top + 760), (d_left + 1520, d_top + 840)], fill=(245, 158, 11, 30), outline=BLEED_AMBER, width=2)
draw.text((d_left + 780, d_top + 772), "BLEED ZONE: Top 140px, Bottom 140px, Left/Right 260px", fill=BLEED_AMBER, font=font_bold)
draw.text((d_left + 780, d_top + 802), "Fill with seamless navy background & skyline reflections only. No text!", fill=TEXT_WHITE, font=font_body)

# Technical specifications notes
tech_notes_d = (
    "KEY RULES FOR DESKTOP IMAGE EXPORT:\n"
    "• Export Resolution: EXACTLY 2400 × 1000 px (or 1920 × 800 px) — ratio 2.4 : 1\n"
    "• Top Cushion: Minimum 140px empty space above logos to prevent crop on shorter laptop viewports\n"
    "• Bottom Cushion: Minimum 140px space below dates to clear bottom carousel controls and dots\n"
    "• CSS Container: .hero-carousel-height has aspect-ratio: 2.4 / 1 in src/app/globals.css"
)
draw.rectangle([(d_left + 80, d_top + 865), (d_left + d_w - 80, d_top + 1010)], fill=(12, 28, 56), outline=PANEL_BORDER)
draw.text((d_left + 110, d_top + 885), tech_notes_d, fill=TEXT_WHITE, font=font_body)


# ══════════════════════════════════════════════════════════════════
# RIGHT SECTION: MOBILE BLUEPRINT (Canvas: 896 x 1200, 3:4 ratio)
# ══════════════════════════════════════════════════════════════════
m_left = 1700
m_top = 180
m_w = 1040
m_h = 1050

draw.rectangle([(m_left, m_top), (m_left + m_w, m_top + m_h)], fill=(9, 22, 48), outline=PANEL_BORDER, width=2)
# Panel Title Header
draw.rectangle([(m_left, m_top), (m_left + m_w, m_top + 60)], fill=(14, 32, 70))
draw.text((m_left + 24, m_top + 16), "MOBILE BANNER BLUEPRINT — 896 × 1200 px (3 : 4 Ratio)", fill=(52, 211, 153), font=font_heading)

# Mobile Scale representation:
# Scale 896 x 1200 -> Width = 448px, Height = 600px (scale = 0.5x!)
mcw = 448
mch = 600
mcx = m_left + (m_w - mcw) // 2  # center inside panel
mcy = d_top + 120

# Draw Mobile Outer Canvas (896 x 1200 scale)
draw.rectangle([(mcx, mcy), (mcx + mcw, mcy + mch)], fill=(4, 15, 36), outline=(52, 211, 153), width=2)

# Mobile Bleeds (Top 70px scaled = 35px, Bottom 80px scaled = 40px, Side 48px scaled = 24px)
m_top_bleed = int(70 * 0.5)   # 35px
m_bot_bleed = int(80 * 0.5)   # 40px
m_side_bleed = int(48 * 0.5)  # 24px

draw.rectangle([(mcx, mcy), (mcx + mcw, mcy + m_top_bleed)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)
draw.rectangle([(mcx, mcy + mch - m_bot_bleed), (mcx + mcw, mcy + mch)], fill=(245, 158, 11, 40), outline=BLEED_AMBER, width=1)

# Mobile SAFE AREA
msx = mcx + m_side_bleed
msy = mcy + m_top_bleed
msw = mcw - (2 * m_side_bleed) # 400px
msh = mch - m_top_bleed - m_bot_bleed # 525px

draw.rectangle([(msx, msy), (msx + msw, msy + msh)], fill=(16, 185, 129, 25), outline=SAFE_GREEN, width=3)

# Inside Mobile Safe Area:
# 1. Mobile Logo Header
draw.rectangle([(msx + 15, msy + 15), (msx + msw - 15, msy + 65)], fill=(18, 45, 80), outline=(0, 229, 255))
draw.text((msx + 45, msy + 25), "LOGOS: HCM-UTE • IEEE • SMC", fill=(0, 229, 255), font=font_bold)
draw.text((msx + 60, msy + 45), "Top cushion > 50px (Safe from notch)", fill=TEXT_MUTED, font=font_tag)

# 2. Mobile 3D Title
draw.rectangle([(msx + 15, msy + 75), (msx + msw - 15, msy + 175)], fill=(20, 52, 95), outline=TEXT_WHITE)
draw.text((msx + 40, msy + 88), "3D TITLE: IEEE SMC 2027", fill=TEXT_WHITE, font=font_heading)
draw.text((msx + 25, msy + 124), "Human-AI Symbiosis: Engineering...", fill=(103, 232, 249), font=font_bold)
draw.text((msx + 55, msy + 150), "Centered vertical alignment", fill=TEXT_MUTED, font=font_tag)

# 3. Topic Pillars & Badges
draw.rectangle([(msx + 15, msy + 185), (msx + msw - 15, msy + 255)], fill=(16, 42, 75), outline=(52, 211, 153))
draw.text((msx + 35, msy + 196), "3 CORE PILLARS BADGES", fill=(52, 211, 153), font=font_bold)
draw.text((msx + 25, msy + 218), "Systems • Cybernetics • Human-Machine", fill=TEXT_WHITE, font=font_tag)
draw.text((msx + 55, msy + 236), "68 Tracks • IEEE Xplore®", fill=TEXT_MUTED, font=font_tag)

# 4. Dates & City
draw.rectangle([(msx + 15, msy + 265), (msx + msw - 15, msy + 310)], fill=(18, 45, 80), outline=ACCENT_CYAN)
draw.text((msx + 40, msy + 278), "October 6–10, 2027 • Ho Chi Minh City", fill=TEXT_WHITE, font=font_bold)

# 5. Mobile Skyline Artwork Zone
draw.rectangle([(msx + 15, msy + 320), (msx + msw - 15, msy + msh - 15)], fill=(22, 40, 78), outline=(0, 229, 255))
draw.text((msx + 45, msy + 340), "3D CITY & CYBERNETIC VISUAL", fill=ACCENT_CYAN, font=font_bold)
draw.text((msx + 45, msy + 375), "• Dusk Ho Chi Minh City skyline\n• Cybernetic data streams\n• Floating research manuscript\n• Beautiful twilight waterfront", fill=TEXT_MUTED, font=font_tag)

# Mobile Callout badges & rules
draw.text((mcx + mcw // 2 - 80, mcy - 35), "WIDTH = 896 px", fill=(52, 211, 153), font=font_bold)
draw.text((mcx - 110, mcy + mch // 2 - 10), "1200 px", fill=(52, 211, 153), font=font_bold)

draw.rectangle([(m_left + 60, m_top + 760), (m_left + m_w - 60, m_top + 840)], fill=(16, 185, 129, 30), outline=SAFE_GREEN, width=2)
draw.text((m_left + 80, m_top + 772), "SAFE ZONE (800 × 1050 px): 100% VISIBLE ON SMARTPHONES", fill=SAFE_GREEN, font=font_bold)
draw.text((m_left + 80, m_top + 802), "No text will be clipped by iOS/Android browser bars or notches.", fill=TEXT_WHITE, font=font_body)

tech_notes_m = (
    "KEY RULES FOR MOBILE IMAGE EXPORT:\n"
    "• Export Resolution: EXACTLY 896 × 1200 px — ratio 3 : 4\n"
    "• Top Padding: Keep logos at y >= 50px from top boundary\n"
    "• Bottom Padding: Keep artwork at y <= 1120px to clear bottom indicators\n"
    "• CSS Container: aspect-ratio: 3 / 4 in src/app/globals.css"
)
draw.rectangle([(m_left + 60, m_top + 865), (m_left + m_w - 60, m_top + 1010)], fill=(12, 28, 56), outline=PANEL_BORDER)
draw.text((m_left + 85, m_top + 885), tech_notes_m, fill=TEXT_WHITE, font=font_body)


# ══════════════════════════════════════════════════════════════════
# BOTTOM SUMMARY CHEAT SHEET BAR
# ══════════════════════════════════════════════════════════════════
foot_top = 1270
foot_h = 280
draw.rectangle([(60, foot_top), (W - 60, foot_top + foot_h)], fill=(10, 24, 52), outline=ACCENT_CYAN, width=2)

draw.text((100, foot_top + 25), "QUICK DESIGN CHEAT-SHEET SUMMARY", fill=ACCENT_CYAN, font=font_heading)

rule_1 = (
    "1. GOLDEN RATIOS:\n"
    "• Desktop: 2400 × 1000 px (2.4 : 1)\n"
    "• Mobile:  896 × 1200 px (3 : 4)"
)
rule_2 = (
    "2. SAFE AREA FORMULA:\n"
    "• Desktop Safe: 1880 × 720 px (y = 140..860)\n"
    "• Mobile Safe:  800 × 1050 px (y = 50..1120)"
)
rule_3 = (
    "3. WHY LOGOS WERE CROPPED PREVIOUSLY:\n"
    "• 16:9 images placed logos at y=20px\n"
    "• Viewport height caps cut 100px from top\n"
    "• Safe cushion of 140px guarantees 0% crop!"
)
rule_4 = (
    "4. COLOR & THEME PALETTE:\n"
    "• Background: Deep Navy #021b3b & #071329\n"
    "• Primary Blue: #115eff (HCM-UTE Royal)\n"
    "• Accents: Cyan #00e5ff & Lime #4ade80"
)

draw.text((100, foot_top + 80), rule_1, fill=TEXT_WHITE, font=font_body)
draw.text((680, foot_top + 80), rule_2, fill=SAFE_GREEN, font=font_body)
draw.text((1340, foot_top + 80), rule_3, fill=BLEED_AMBER, font=font_body)
draw.text((2040, foot_top + 80), rule_4, fill=(103, 232, 249), font=font_body)

# Save high-res blueprint
out_path = 'public/carousel/safe-area/carousel-design-blueprint.png'
img.save(out_path, quality=95)
print(f"Generated Blueprint Image: {out_path} ({img.size})")

