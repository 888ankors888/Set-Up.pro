from pathlib import Path
root = Path(__file__).resolve().parent
css = root / 'design/desktop-brand.css'
asset = root / 'assets/set-up-header.webp'
if not css.is_file() or not asset.is_file():
    raise SystemExit('Extract the ZIP into the Set-Up.pro repository root first.')
rule = '\n/* Transparent Set-Up header artwork */\nhtml:root:root:root:root body:has(#nav) :is(.brand:not(.big), main > .setup-home) img {\n  content: url("../assets/set-up-header.webp") !important;\n}\n'
text = css.read_text(encoding='utf-8')
if rule not in text:
    css.write_text(text.rstrip() + '\n' + rule, encoding='utf-8')
print('Updated design/desktop-brand.css')
