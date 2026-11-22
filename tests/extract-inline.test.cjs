const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {readLegacyHtml} = require('../scripts/read-legacy-html.cjs');
const html = fs.readFileSync('index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('legacy/manifest.json', 'utf8'));
test('byte-exact reconstruction of original HTML', () => {
  const restored = readLegacyHtml('index.html');
  assert.equal(crypto.createHash('sha256').update(restored).digest('hex'), manifest.source_sha256);
});
test('23 extracted scripts, 36 total tags, no inline scripts', () => {
  assert.equal(manifest.entries.length, 23);
  const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert.equal(tags.length, 36);
  assert.ok(tags.every(m => /\bsrc\s*=/.test(m[1])));
});
test('all extracted scripts parse separately', () => {
  for (const entry of manifest.entries) {
    const result = spawnSync(process.execPath, ['--check', entry.path], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
  }
});
test('extracted scripts retain synchronous classic execution and order', () => {
  const tags = [...html.matchAll(/<script\b([^>]*)>/gi)].filter(m => m[1].includes('legacy/js/'));
  assert.deepEqual(tags.map(m => m[1].match(/src="([^"]+)"/)[1]), manifest.entries.map(e=>e.path));
  assert.ok(tags.every(m => !/\b(?:async|defer|type)\s*(?:=|$)/.test(m[1])));
});
