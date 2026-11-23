from pathlib import Path
import hashlib
import json
import re

PATTERN = re.compile(r'(<script\b([^>]*)>)([\s\S]*?)(</script\s*>)', re.I)
SOURCE_BLOB = '67352cb0ee79e7c7f2107dc4aa45b89ee523175d'
LABELS = 'core food-actions goals-ui diary-entry-ui retired-ai-report diary-goal-colors diary-entry-design diary-week-chart report-period-navigation diary-day-ai sports-profile water-goal-ui today-mode ui-refinements combined-reports diary-today-layout remove-today training-week-bottom goals-page goals-daily-targets settings-icons workout-navigation standalone-workouts-navigation'.split()

def sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def split_inline(html):
    outputs, entries = {}, []
    def replace(match):
        if re.search(r'\bsrc\s*=', match[2], re.I):
            return match[0]
        n = len(entries)
        assert n < len(LABELS)
        assert not re.search(r'\b(async|defer|type)\s*(?:=|$)', match[2])
        path = f'legacy/js/{n + 1:02d}-{LABELS[n]}.js'
        body = match[3]
        assert 'document.currentScript' not in body and 'document.write(' not in body
        outputs[path] = body
        entries.append({'path': path, 'sha256': sha(body), 'open': match[1], 'close': match[4]})
        return match[1][:-1] + f' src="{path}">' + match[4]
    updated = PATTERN.sub(replace, html)
    assert len(entries) == 23
    mapping = {entry['path']: entry for entry in entries}
    def restore(match):
        source = re.search(r'\bsrc="(legacy/js/[^\"]+)"', match[2])
        if not source:
            return match[0]
        entry = mapping[source[1]]
        return entry['open'] + outputs[entry['path']] + entry['close']
    assert PATTERN.sub(restore, updated) == html
    manifest = {'source_sha256': sha(html), 'entries': entries}
    return updated, outputs, manifest

def replace_once(text, old, new):
    assert text.count(old) == 1, 'Adapter source changed: ' + old
    return text.replace(old, new, 1)

def main():
    root = Path('.')
    source = (root / 'index.html').read_bytes()
    blob = hashlib.sha1(b'blob ' + str(len(source)).encode() + b'\0' + source).hexdigest()
    assert blob == SOURCE_BLOB, 'Unexpected index.html; stop for review'
    assert not (root / 'legacy').exists(), 'legacy already exists; stop for review'
    updated, outputs, manifest = split_inline(source.decode('utf-8'))
    publish_path = '.github/workflows/publish-emerald-pages.yml'
    publish = (root / publish_path).read_text(encoding='utf-8')
    anchor = "          files += [p for folder in ('sports','workouts','design') for pattern in ('*.css','*.js') for p in Path(folder).glob(pattern)]"
    outputs[publish_path] = replace_once(publish, anchor, anchor + "\n          files += sorted(Path('legacy/js').glob('*.js'))")
    backend = (root / 'backend/main.py').read_text(encoding='utf-8')
    backend = replace_once(backend, "('assets', ('*.webp'", "('legacy/js', ('*.js',)), ('assets', ('*.webp'")
    backend = replace_once(backend, "if 'MEAL_ESTIMATE_API' not in html:", "if 'MEAL_ESTIMATE_API' not in html and 'src=\"legacy/js/' not in html:")
    outputs['backend/main.py'] = backend
    tests = (root / 'tests/restore-data.test.cjs').read_text(encoding='utf-8')
    outputs['tests/restore-data.test.cjs'] = replace_once(tests, "const html = fs.readFileSync('index.html', 'utf8');", "const html = require('../scripts/read-legacy-html.cjs').readLegacyHtml('index.html');")
    outputs['legacy/manifest.json'] = json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'
    outputs['index.html'] = updated
    for name, content in outputs.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content.encode('utf-8'))

if __name__ == '__main__':
    main()
