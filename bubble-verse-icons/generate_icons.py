#!/usr/bin/env python3
"""
Bubble Verse Icon Generator
Generates all required platform icon sizes from the master SVG,
using Pillow to render a programmatic version of the design.
"""

import os
import math
import struct
import zlib
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = "/home/user/bubble-verse-icons"

# ──────────────────────────────────────────────
# COLOR PALETTE
# ──────────────────────────────────────────────
BG_TOP    = (13,  10,  30)
BG_MID    = (30,  10,  60)
BG_BOT    = (10,  22,  40)
PURPLE    = (124, 58, 237)
PURPLE2   = (147, 51, 234)
PINK      = (219, 39, 119)
PINK2     = (244, 114, 182)
TEAL      = ( 20, 184, 166)
GOLD      = (252, 211,  77)
LAVENDER  = (196, 181, 253)
WHITE     = (255, 255, 255)


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────
def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def lerp3_color(c1, c2, c3, t):
    if t < 0.5:
        return lerp_color(c1, c2, t * 2)
    return lerp_color(c2, c3, (t - 0.5) * 2)

def lerp_scalar(a, b, t):
    return int(a + (b - a) * t)

def radial_grad(draw, cx, cy, r, color_in, color_out, alpha_in=255, alpha_out=0, steps=60):
    for i in range(steps, 0, -1):
        ratio = i / steps
        t = 1 - ratio
        c = lerp_color(color_in, color_out, t)
        a = lerp_scalar(alpha_in, alpha_out, t)
        ri = int(r * ratio)
        draw.ellipse([(cx - ri, cy - ri), (cx + ri, cy + ri)],
                     fill=(*c, a))

def draw_star(draw, cx, cy, r, color, alpha=255):
    pts = []
    for i in range(8):
        angle = math.radians(i * 45 - 90)
        ri = r if i % 2 == 0 else r * 0.38
        pts.append((cx + ri * math.cos(angle), cy + ri * math.sin(angle)))
    draw.polygon(pts, fill=(*color, alpha))

def rounded_rect_mask(size, radius):
    """Return an RGBA image that is a rounded-rect mask."""
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=255)
    return mask


# ──────────────────────────────────────────────
# MASTER ICON RENDERER
# ──────────────────────────────────────────────
def render_icon(size: int, shape: str = "rounded") -> Image.Image:
    """
    shape: 'rounded' (iOS/Android/Windows), 'circle', 'square'
    """
    S = size
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    sc = S / 1024  # scale factor

    # ── Background gradient (diagonal) ──
    bg = Image.new("RGBA", (S, S), (0, 0, 0, 255))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(S):
        t = y / (S - 1)
        c = lerp3_color(BG_TOP, BG_MID, BG_BOT, t)
        bg_draw.line([(0, y), (S, y)], fill=(*c, 255))
    img.paste(bg, (0, 0))

    draw = ImageDraw.Draw(img)

    # ── Star field ──
    stars = [
        (140, 120, 2.5, LAVENDER, 0.5),
        (280,  80, 1.5, LAVENDER, 0.4),
        (820, 100, 2.0, PINK2,    0.5),
        (900, 200, 1.5, TEAL,     0.4),
        (920, 820, 2.5, LAVENDER, 0.45),
        (100, 880, 1.5, LAVENDER, 0.35),
        (200, 760, 2.0, PINK2,    0.4),
        (840, 930, 2.0, TEAL,     0.35),
        (460,  60, 1.8, LAVENDER, 0.4),
        (600, 940, 1.8, LAVENDER, 0.4),
        ( 80, 450, 1.5, PINK2,    0.3),
        (950, 550, 1.5, TEAL,     0.3),
        (660, 148, 4.0, GOLD,     0.7),
        (380, 830, 3.0, LAVENDER, 0.6),
        (842, 608, 3.5, PINK2,    0.65),
        (174, 588, 2.5, TEAL,     0.5),
    ]
    for sx, sy, sr, sc2, sa in stars:
        x, y, r = int(sx * sc), int(sy * sc), max(1, sr * sc)
        a = int(sa * 255)
        draw.ellipse([(x - r, y - r), (x + r, y + r)], fill=(*sc2, a))

    # ── Ambient glow behind bubble ──
    cx, cy = int(512 * sc), int(490 * sc)
    glow_r = int(340 * sc)
    glow_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    radial_grad(glow_draw, cx, cy, glow_r, PURPLE, PURPLE, 100, 0, 50)
    blurred_glow = glow_img.filter(ImageFilter.GaussianBlur(radius=max(2, int(30 * sc))))
    img.alpha_composite(blurred_glow)

    draw = ImageDraw.Draw(img)

    # ── Orbit planet (teal dot on outer ring) ──
    # Planet position based on tilted ellipse
    planet_x = int(162 * sc)
    planet_y = int(445 * sc)
    planet_r  = max(3, int(14 * sc))
    draw.ellipse([(planet_x - planet_r, planet_y - planet_r),
                  (planet_x + planet_r, planet_y + planet_r)],
                 fill=(*TEAL, 220))
    pr2 = max(1, int(7 * sc))
    draw.ellipse([(planet_x - pr2, planet_y - pr2),
                  (planet_x + pr2, planet_y + pr2)],
                 fill=(*WHITE, 200))

    # ── Small floating bubbles ──
    def paint_bubble(bx, by, br, col1, col2, alpha=224):
        bx, by, br = int(bx * sc), int(by * sc), max(2, int(br * sc))
        # shadow
        sha = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        sha_d = ImageDraw.Draw(sha)
        radial_grad(sha_d, bx + int(4 * sc), by + int(4 * sc),
                    br, (0, 0, 0), (0, 0, 0), 120, 0, 30)
        img.alpha_composite(sha)
        # gradient fill
        for i in range(br, 0, -1):
            t = 1 - i / br
            c = lerp_color(col1, col2, t)
            a = int(alpha * (i / br) ** 0.4)
            d2 = ImageDraw.Draw(img)
            d2.ellipse([(bx - i, by - i), (bx + i, by + i)], fill=(*c, a))
        # highlight
        hl_r = max(1, int(br * 0.3))
        hl_x = bx - int(br * 0.25)
        hl_y = by - int(br * 0.28)
        hla = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        hla_d = ImageDraw.Draw(hla)
        radial_grad(hla_d, hl_x, hl_y, hl_r, WHITE, WHITE, 70, 0, 20)
        img.alpha_composite(hla)

    paint_bubble(238, 248, 58, TEAL, PURPLE)       # top-left teal
    paint_bubble(786, 268, 38, PINK2, PINK)         # top-right pink
    paint_bubble(808, 768, 28, TEAL, PURPLE, 184)   # bottom-right teal
    paint_bubble(218, 796, 18, PURPLE2, PURPLE, 153)# bottom-left tiny

    # ── Main bubble ──
    mbx, mby, mbr = int(512 * sc), int(494 * sc), int(236 * sc)

    # Shadow
    sha2 = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sha2_d = ImageDraw.Draw(sha2)
    radial_grad(sha2_d, mbx + int(6 * sc), mby + int(14 * sc),
                mbr, (0, 0, 0), (0, 0, 0), 110, 0, 40)
    sha2 = sha2.filter(ImageFilter.GaussianBlur(radius=max(2, int(20 * sc))))
    img.alpha_composite(sha2)

    # Gradient fill
    main_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    main_draw = ImageDraw.Draw(main_img)
    for i in range(mbr, 0, -1):
        t = 1 - i / mbr
        c = lerp3_color(PURPLE2, PURPLE, PINK, t)
        a = min(255, int(235 * (i / mbr) ** 0.25))
        main_draw.ellipse([(mbx - i, mby - i), (mbx + i, mby + i)], fill=(*c, a))
    img.alpha_composite(main_img)

    draw = ImageDraw.Draw(img)

    # Bubble tail (speech bubble pointer)
    tail_pts = [
        (int(570 * sc), int(710 * sc)),
        (int(700 * sc), int(790 * sc)),
        (int(625 * sc), int(694 * sc)),
    ]
    draw.polygon(tail_pts, fill=(*lerp_color(PURPLE, PINK, 0.6), 220))

    # Inner highlight (glass effect)
    hl2_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    hl2_d = ImageDraw.Draw(hl2_img)
    hl2_cx = mbx - int(mbr * 0.18)
    hl2_cy = mby - int(mbr * 0.28)
    radial_grad(hl2_d, hl2_cx, hl2_cy, int(mbr * 0.7), WHITE, WHITE, 85, 0, 40)
    hl2_img = hl2_img.filter(ImageFilter.GaussianBlur(radius=max(1, int(12 * sc))))
    img.alpha_composite(hl2_img)

    draw = ImageDraw.Draw(img)

    # ── Letter "B" inside bubble ──
    # Spine
    spine_x = mbx - int(58 * sc)
    spine_y = mby - int(115 * sc)
    spine_w = max(1, int(30 * sc))
    spine_h = int(228 * sc)
    spine_r = max(1, int(15 * sc))
    draw.rounded_rectangle(
        [(spine_x, spine_y), (spine_x + spine_w, spine_y + spine_h)],
        radius=spine_r, fill=(*WHITE, 242)
    )

    # B bumps (two arcs using overlapping circles)
    bump_stroke = max(1, int(26 * sc))
    bump_color = (*WHITE, 242)

    def draw_b_bump(arc_cx, arc_cy, arc_r):
        # Draw arc as a thick ring clipped to right half
        inner = arc_r - bump_stroke // 2
        outer = arc_r + bump_stroke // 2
        # Clipping: draw full ring then mask left half
        ring_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        ring_draw = ImageDraw.Draw(ring_img)
        for r_off in range(outer, inner, -1):
            ring_draw.ellipse([
                (arc_cx - r_off, arc_cy - r_off),
                (arc_cx + r_off, arc_cy + r_off)
            ], outline=(*WHITE, 0))  # transparent first
        # Use arc approximation
        ring_draw.ellipse([
            (arc_cx - outer, arc_cy - outer),
            (arc_cx + outer, arc_cy + outer)
        ], fill=(*WHITE, 0))
        ring_draw.ellipse([
            (arc_cx - inner, arc_cy - inner),
            (arc_cx + inner, arc_cy + inner)
        ], fill=(0, 0, 0, 0))
        # Mask: only show right half (x >= spine_x + spine_w - 4)
        mask_img = Image.new("L", (S, S), 0)
        mask_d = ImageDraw.Draw(mask_img)
        clip_x = spine_x + spine_w - max(1, int(4 * sc))
        mask_d.rectangle([(clip_x, 0), (S, S)], fill=255)
        # Apply mask
        ring_img.putalpha(mask_img)
        img.alpha_composite(ring_img)

    # Top bump of B
    b_top_cx = mbx + int(20 * sc)
    b_top_cy = mby - int(55 * sc)
    b_top_r  = max(4, int(62 * sc))
    draw_b_bump(b_top_cx, b_top_cy, b_top_r)

    # Bottom bump of B (slightly wider)
    b_bot_cx = mbx + int(22 * sc)
    b_bot_cy = mby + int(58 * sc)
    b_bot_r  = max(4, int(72 * sc))
    draw_b_bump(b_bot_cx, b_bot_cy, b_bot_r)

    draw = ImageDraw.Draw(img)

    # ── Sparkle stars ──
    def paint_star(sx, sy, sr, col, sa):
        x, y, r = int(sx * sc), int(sy * sc), max(1, int(sr * sc))
        a = int(sa * 255)
        draw_star(draw, x, y, r, col, a)

    paint_star(730, 198, 18, GOLD,     0.95)
    paint_star(292, 778, 12, LAVENDER, 0.85)
    paint_star(130, 390,  8, TEAL,     0.80)

    # ── "V" chevron mark near bubble tail ──
    vx, vy = int(642 * sc), int(682 * sc)
    v_size  = max(3, int(14 * sc))
    v_thick = max(1, int(8 * sc))
    draw.line([(vx - v_size, vy - v_size // 1.4),
               (vx,           vy + v_size)],
              fill=(*PINK2, 217), width=v_thick)
    draw.line([(vx,           vy + v_size),
               (vx + v_size, vy - v_size // 1.4)],
              fill=(*PINK2, 217), width=v_thick)

    # ── Apply shape mask ──
    if shape == "rounded":
        radius = int(S * 0.22)  # ≈ iOS ratio
        mask = rounded_rect_mask(S, radius)
        img.putalpha(mask)
    elif shape == "circle":
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).ellipse([(0, 0), (S - 1, S - 1)], fill=255)
        img.putalpha(mask)
    # 'square': no mask, keep full rectangle

    return img


# ──────────────────────────────────────────────
# PLATFORM SPEC TABLES
# ──────────────────────────────────────────────
IOS_ICONS = [
    # (filename, size, scale_note)
    ("AppIcon-20@2x.png",   40,  "iPhone Notification @2x"),
    ("AppIcon-20@3x.png",   60,  "iPhone Notification @3x"),
    ("AppIcon-29@2x.png",   58,  "iPhone Settings @2x"),
    ("AppIcon-29@3x.png",   87,  "iPhone Settings @3x"),
    ("AppIcon-40@2x.png",   80,  "iPhone Spotlight @2x"),
    ("AppIcon-40@3x.png",  120,  "iPhone Spotlight @3x"),
    ("AppIcon-60@2x.png",  120,  "iPhone App @2x"),
    ("AppIcon-60@3x.png",  180,  "iPhone App @3x"),
    ("AppIcon-76.png",      76,  "iPad App @1x"),
    ("AppIcon-76@2x.png",  152,  "iPad App @2x"),
    ("AppIcon-83.5@2x.png",167,  "iPad Pro App @2x"),
    ("AppIcon-1024.png",  1024,  "App Store"),
]

ANDROID_ICONS = [
    ("mipmap-mdpi/ic_launcher.png",       48,  "mdpi"),
    ("mipmap-hdpi/ic_launcher.png",       72,  "hdpi"),
    ("mipmap-xhdpi/ic_launcher.png",      96,  "xhdpi"),
    ("mipmap-xxhdpi/ic_launcher.png",    144,  "xxhdpi"),
    ("mipmap-xxxhdpi/ic_launcher.png",   192,  "xxxhdpi"),
    ("playstore/ic_launcher_512.png",    512,  "Play Store"),
]

WINDOWS_SIZES = [16, 32, 48, 256]

WEB_ICONS = [
    ("favicon-16.png",   16),
    ("favicon-32.png",   32),
    ("favicon-48.png",   48),
    ("icon-192.png",    192),
    ("icon-512.png",    512),
    ("icon-1024.png",  1024),
]


# ──────────────────────────────────────────────
# GENERATE ALL ICONS
# ──────────────────────────────────────────────
def main():
    print("Rendering icons...")

    # Cache rendered sizes to avoid re-rendering the same size twice
    cache = {}

    def get(size, shape="rounded"):
        key = (size, shape)
        if key not in cache:
            cache[key] = render_icon(size, shape)
        return cache[key]

    # iOS
    print("  iOS...")
    for fname, sz, note in IOS_ICONS:
        out = os.path.join(OUTPUT_DIR, "ios", fname)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        img = get(sz, "rounded")
        # iOS icons must be saved as RGB PNG (no transparency) for App Store
        if sz == 1024:
            rgb = Image.new("RGB", (sz, sz), BG_TOP)
            rgb.paste(render_icon(sz, "square"), mask=render_icon(sz, "square").split()[3])
            rgb.save(out, "PNG", optimize=True)
        else:
            img.save(out, "PNG", optimize=True)
        print(f"    {fname} ({sz}×{sz}) — {note}")

    # Android
    print("  Android...")
    for fname, sz, note in ANDROID_ICONS:
        out = os.path.join(OUTPUT_DIR, "android", fname)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        img = get(sz, "rounded")
        img.save(out, "PNG", optimize=True)
        print(f"    android/{fname} ({sz}×{sz}) — {note}")

    # Android adaptive icon (foreground layer)
    print("  Android adaptive icon foreground...")
    fg_dir = os.path.join(OUTPUT_DIR, "android", "mipmap-xxxhdpi")
    os.makedirs(fg_dir, exist_ok=True)
    fg = render_icon(432, "square")  # 108dp × 4 = 432px; safe zone is 72dp centre
    fg.save(os.path.join(fg_dir, "ic_launcher_foreground.png"), "PNG")

    # Windows ICO
    print("  Windows ICO...")
    ico_imgs = [get(sz, "square").convert("RGBA") for sz in WINDOWS_SIZES]
    ico_path = os.path.join(OUTPUT_DIR, "windows", "bubble-verse.ico")
    # Save as ICO using Pillow
    ico_imgs[0].save(
        ico_path,
        format="ICO",
        sizes=[(sz, sz) for sz in WINDOWS_SIZES],
        append_images=ico_imgs[1:],
    )
    print(f"    bubble-verse.ico ({', '.join(str(s) for s in WINDOWS_SIZES)}px)")

    # Individual Windows PNGs
    for sz in WINDOWS_SIZES:
        out = os.path.join(OUTPUT_DIR, "windows", f"icon-{sz}.png")
        get(sz, "square").save(out, "PNG")
        print(f"    icon-{sz}.png")

    # Web / PWA
    print("  Web / PWA...")
    for fname, sz in WEB_ICONS:
        out = os.path.join(OUTPUT_DIR, "web", fname)
        shape = "rounded" if sz >= 192 else "square"
        get(sz, shape).save(out, "PNG", optimize=True)
        print(f"    {fname} ({sz}×{sz})")

    # Favicon ICO (multi-size)
    fav_imgs = [get(sz, "square") for sz in [16, 32, 48]]
    fav_path = os.path.join(OUTPUT_DIR, "web", "favicon.ico")
    fav_imgs[0].save(
        fav_path, format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=fav_imgs[1:],
    )
    print(f"    favicon.ico (16/32/48px)")

    print("\nAll icons generated successfully!")
    print(f"Output directory: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
