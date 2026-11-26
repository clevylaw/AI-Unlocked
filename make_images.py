#!/usr/bin/env python3
"""Make the link preview picture (assets/og-image.png) and phone icon (assets/apple-touch-icon.png).

Usage: python3 make_images.py   (needs Google Chrome; edit src/images/*.html to change the designs)
"""
import os, subprocess
ROOT = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for src, out, size in (("og.html", "og-image.png", "1200,630"), ("touch-icon.html", "apple-touch-icon.png", "180,180")):
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    f"--window-size={size}", "--virtual-time-budget=4000", f"--screenshot={os.path.join(ROOT, 'assets', out)}",
                    "file://" + os.path.join(ROOT, "src", "images", src)], check=True, capture_output=True)
    print("made assets/" + out)
