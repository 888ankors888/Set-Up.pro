from pathlib import Path
import hashlib

p = Path('index.html')
raw = p.read_bytes()
blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
replacement = Path('patches/restore-data.js').read_text(encoding='utf-8').rstrip()
html = raw.decode('utf-8')
start_marker = 'async function restoreData(input)'
end_marker = '\nconst originalProfile='
assert html.count(start_marker) == 1, 'Unexpected restoreData definitions'
start = html.index(start_marker)
end = html.index(end_marker, start)
if html[start:end] == replacement:
    raise SystemExit(0)
assert blob == '495096ed6ba6d6982a1c08e4fe7645dd0f5f8bb1', 'Source changed; stop for review'
assert replacement.startswith(start_marker) and '</script' not in replacement.lower()
updated = html[:start] + replacement + html[end:]
p.write_bytes(updated.encode('utf-8'))
