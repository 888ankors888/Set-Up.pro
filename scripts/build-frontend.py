from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import html as html_module
import json
import os
import re
import shutil

ROOT_PATTERNS = ('*.html', '*.css', '*.js', '*.webp')
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.avif', '.woff', '.woff2'}
CONFIG_PATH = 'scripts/frontend-assets.json'

def version_url(url, revision):
    parts = urlsplit(url)
    if parts.scheme or parts.netloc or not parts.path.lower().endswith(('.css', '.js')):
        return url
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key != 'v']
    query.append(('v', revision))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

def render_tag(entry):
    assert entry['tag'] in ('script', 'link')
    attrs = []
    for key, value in entry.items():
        if key == 'tag' or value is False:
            continue
        assert key in ('src', 'href', 'rel', 'defer')
        attrs.append(key if value is True else key + '="' + html_module.escape(str(value), quote=True) + '"')
    opening = '<' + entry['tag'] + ' ' + ' '.join(attrs) + '>'
    return opening + ('</script>' if entry['tag'] == 'script' else '')

def prepare_html(text, filename, config, revision):
    assert text.count('</head>') == 1 and text.count('</body>') == 1, filename
    head = ''.join(render_tag(entry) for entry in config['head'])
    text = text.replace('</head>', head + '\n</head>', 1)
    if filename == 'index.html':
        pattern = r"<script\b[^>]*\bsrc\s*=\s*(['\"])(?:\./|/)?diary-energy\.js(?:[?#][^'\"]*)?\1[^>]*>\s*</script>"
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        body = ''.join(render_tag(entry) for entry in config['index_body'])
        text = text.replace('</body>', body + '\n</body>', 1)
        assert len(re.findall(pattern, text, flags=re.IGNORECASE)) == 1
    def version_attribute(match):
        return match[1] + match[2] + version_url(match[3], revision) + match[2]
    return re.sub(r"(\b(?:href|src)\s*=\s*)(['\"])([^'\"]+)\2", version_attribute, text, flags=re.IGNORECASE)

def build(root):
    root = Path(root).resolve()
    config = json.loads((root / CONFIG_PATH).read_text(encoding='utf-8'))
    assert config['version'] == 1
    out = root / '_site'
    assert not out.is_symlink(), 'Refuse symlink output'
    files = set()
    for pattern in ROOT_PATTERNS:
        files.update(root.glob(pattern))
    files.add(root / 'wellness-background.jpg')
    for folder in ('sports', 'workouts', 'design', 'legacy/js'):
        directory = root / folder
        assert not directory.is_symlink(), folder
        for pattern in ('*.css', '*.js'):
            files.update(directory.glob(pattern))
    assert not (root / 'assets').is_symlink()
    files.update(p for p in (root / 'assets').rglob('*') if p.suffix.lower() in IMAGE_EXTENSIONS)
    for entries in (config['head'], config['index_body']):
        for entry in entries:
            asset = root / entry.get('src', entry.get('href', ''))
            assert asset.is_file() and asset in files, 'Missing injected asset: ' + str(asset)
    background = root / 'wellness-background.jpg'
    assert background.is_file() and background.stat().st_size > 0, 'Missing wellness background'
    for path in files:
        assert not path.is_symlink() and path.resolve().is_relative_to(root), str(path)
    if out.exists():
        assert out.is_dir()
        shutil.rmtree(out)
    out.mkdir()
    for path in sorted(files):
        if path.is_file():
            destination = out / path.relative_to(root)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, destination)
    revision = os.environ.get('GITHUB_SHA', 'local')
    for path in out.glob('*.html'):
        path.write_text(prepare_html(path.read_text(encoding='utf-8'), path.name, config, revision), encoding='utf-8')
    (out / '.nojekyll').touch()
    (out / 'deployment-info.json').write_text(json.dumps({'branch': os.environ.get('GITHUB_REF_NAME', 'local'), 'commit': revision}) + '\n', encoding='utf-8')
    return out

if __name__ == '__main__':
    build(Path(__file__).resolve().parent.parent)
