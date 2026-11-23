from pathlib import Path
from tempfile import TemporaryDirectory
import importlib.util
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('frontend_build', ROOT / 'scripts/build-frontend.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
CONFIG = json.loads((ROOT / 'scripts/frontend-assets.json').read_text(encoding='utf-8'))

class BuildTests(unittest.TestCase):
    def fixture(self, root):
        (root / 'scripts').mkdir()
        (root / 'scripts/frontend-assets.json').write_text(json.dumps(CONFIG))
        (root / 'index.html').write_text('<html><head><style>.card{border-radius:24px}</style></head><body><button id="keep">Keep</button><script src="diary-energy.js?v=old"></script></body></html>')
        (root / 'workouts.html').write_text('<html><head></head><body>Workouts</body></html>')
        (root / 'wellness-background.jpg').write_bytes(b'fixture-not-a-real-image')
        for entry in CONFIG['head'] + CONFIG['index_body']:
            path = root / entry.get('src', entry.get('href'))
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text('/* fixture */')
        (root / 'backend').mkdir()
        (root / 'backend/secret.py').write_text('not for publication')
        (root / '.env').write_text('TEST=not-for-publication')

    def test_preserves_styles_and_markup(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root)
            source=(root/'index.html').read_bytes()
            text=(module.build(root)/'index.html').read_text()
            self.assertIn('<style>.card{border-radius:24px}</style>',text)
            self.assertIn('<button id="keep">Keep</button>',text)
            self.assertEqual(source,(root/'index.html').read_bytes())

    def test_injected_order_and_no_duplicate_energy(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root)
            text=(module.build(root)/'index.html').read_text()
            positions=[text.index(entry.get('src',entry.get('href'))) for entry in CONFIG['head']]
            self.assertEqual(positions,sorted(positions))
            self.assertEqual(text.count('src="diary-energy.js'),1)
            self.assertIn('defer src="design/nav-brand.js?v=',text)

    def test_reproducible_rebuild(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root)
            def snapshot():
                out=module.build(root)
                return {str(p.relative_to(out)):p.read_bytes() for p in out.rglob('*') if p.is_file()}
            first=snapshot()
            (root/'_site/stale.js').write_text('stale')
            self.assertEqual(first,snapshot())

    def test_excludes_backend_env_and_config(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root);out=module.build(root)
            self.assertFalse((out/'backend').exists())
            self.assertFalse((out/'.env').exists())
            self.assertFalse((out/'scripts').exists())

    def test_copies_legacy_if_present(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root)
            p=root/'legacy/js/01-core.js';p.parent.mkdir(parents=True);p.write_text('/* legacy */')
            self.assertEqual((module.build(root)/'legacy/js/01-core.js').read_text(),'/* legacy */')

    def test_missing_injected_asset_stops_build(self):
        with TemporaryDirectory() as tmp:
            root=Path(tmp);self.fixture(root)
            (root/'design/nav-brand.js').unlink()
            with self.assertRaises(AssertionError):module.build(root)

    def test_external_url_not_versioned(self):
        self.assertEqual(module.version_url('https://example.test/a.js?v=1','abc'),'https://example.test/a.js?v=1')

    def test_local_version_replaced(self):
        self.assertEqual(module.version_url('design/a.js?v=old&x=1#section','abc'),'design/a.js?x=1&v=abc#section')

if __name__ == '__main__':
    unittest.main()
