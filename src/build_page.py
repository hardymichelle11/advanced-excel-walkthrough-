"""Assemble index.html from shell.html, content.js and app.js. Run from the repo root: python src/build_page.py"""
from pathlib import Path
src = Path(__file__).parent
body = (src / "shell.html").read_text() + "\n<script>\n" + (src / "content.js").read_text() + "\n</script>\n<script>\n" + (src / "app.js").read_text() + "\n</script>\n"
head = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n'
(src.parent / "index.html").write_text(head + body + "</body></html>\n")
print("index.html written")
