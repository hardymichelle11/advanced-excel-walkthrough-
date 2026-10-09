"""Assemble index.html from shell.html, content.js and app.js. Run from the repo root: python src/build_page.py"""
from pathlib import Path
src = Path(__file__).parent
body = (src / "shell.html").read_text() + "\n<script>\n" + (src / "content.js").read_text() + "\n</script>\n<script>\n" + (src / "app.js").read_text() + "\n</script>\n"
head = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Advanced Excel Walkthrough</title>
<meta name="description" content="A 15-topic advanced Excel study guide with worked examples, audio narration, search and explained quizzes.">
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#1b6b45">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Excel Guide">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>:root{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
"""
(src.parent / "index.html").write_text(head + body + "</body></html>\n")
print("index.html written")
