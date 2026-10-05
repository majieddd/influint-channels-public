"""Package the complete 125-image gallery with its prompts and manifests."""
import hashlib
import json
import zipfile
from pathlib import Path

asset = Path(__file__).resolve().parent.parent
original = json.loads((asset / 'thumbnail-manifest.json').read_text(encoding='utf8'))
solo = json.loads((asset / 'solo-thumbnail-manifest.json').read_text(encoding='utf8'))
files = {}
for item in original['items']:
    files[item['image']] = item['sha256']
    files[item['prompt']] = item['prompt_sha256']
for item in solo['items']:
    files[item['generated_image']] = item['generated_image_sha256']
    files[item['prompt_path']] = item['prompt_sha256']
assert len(files) == 250, 'Expected 125 distinct JPEGs and 125 prompts'

archive = asset / 'nizarisaqtirl-125-thumbnails.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
    for name, expected in files.items():
        data = (asset / name).read_bytes()
        assert hashlib.sha256(data).hexdigest() == expected, name
        bundle.writestr(name, data)
    for name in ['thumbnail-manifest.json', 'solo-thumbnail-manifest.json']:
        bundle.writestr(name, (asset / name).read_bytes())
    bundle.writestr('README.txt', 'Nizarisaqt IRL: all 125 thumbnail concepts\n\n'
                    'Includes the 100 original ideas and 25 Niz-only ideas, '
                    'their exact generation prompts and both source manifests.\n'
                    'These are generated concepts. Model identity was unverified; '
                    'GPT Image 2.5 Flare was not confirmed.\n')

with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    assert len([name for name in bundle.namelist() if name.endswith('.jpg')]) == 125
    for name, expected in files.items():
        assert hashlib.sha256(bundle.read(name)).hexdigest() == expected, name
print(f'Packaged 125 JPEGs and 125 verified prompts: {archive.name}')
