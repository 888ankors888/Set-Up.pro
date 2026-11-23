const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
function readLegacyHtml(filename) {
  const root = path.dirname(path.resolve(filename));
  const html = fs.readFileSync(filename, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'legacy/manifest.json'), 'utf8'));
  const entries = new Map(manifest.entries.map(e => [e.path, e]));
  const seen = new Set();
  const restored = html.replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script\s*>)/gi, (whole, open, attrs) => {
    const match = attrs.match(/\bsrc="(legacy\/js\/[^"?]+)(?:\?[^\"]*)?"/);
    if (!match) return whole;
    const name = match[1], entry = entries.get(name);
    if (!entry || !/^legacy\/js\/\d{2}-[a-z-]+\.js$/.test(name) || seen.has(name)) throw Error('Invalid legacy reference');
    const body = fs.readFileSync(path.join(root, name), 'utf8');
    if (sha(body) !== entry.sha256) throw Error('Legacy script changed: ' + name);
    seen.add(name);
    return entry.open + body + entry.close;
  });
  if (seen.size !== entries.size || sha(restored) !== manifest.source_sha256) throw Error('Extraction roundtrip mismatch');
  return restored;
}
module.exports = {readLegacyHtml};
