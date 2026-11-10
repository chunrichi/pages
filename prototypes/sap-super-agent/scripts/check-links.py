#!/usr/bin/env python3
"""Fail if any local HTML/Markdown asset or link is missing."""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

FILES = ["index.html", "app.html", "vscode.html", "README.md"]
FILES += [os.path.join("docs", f) for f in os.listdir("docs") if f.endswith(".md")]

patterns = [
    re.compile(r'(?:src|href)="([^"]+)"'),
    re.compile(r'!?\[[^\]]*\]\(([^)]+)\)'),
]

missing = []
for rel in FILES:
    text = open(rel, encoding="utf-8").read()
    for pattern in patterns:
        for match in pattern.finditer(text):
            target = match.group(1).strip()
            target = target.split("#")[0].split("?")[0]
            if not target or target.startswith(("http://", "https://", "mailto:", "data:", "javascript:")):
                continue
            path = os.path.normpath(os.path.join(os.path.dirname(rel), target))
            if not os.path.exists(path):
                missing.append((rel, target))

if missing:
    print("Missing local links/assets:")
    for rel, target in missing:
        print(f"  {rel} -> {target}")
    sys.exit(1)

print(f"Links OK ({len(FILES)} files checked)")
