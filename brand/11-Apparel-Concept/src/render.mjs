import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const sourcePath = new URL('render.html', import.meta.url);
const source = await readFile(sourcePath, 'utf8');
const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error('Inline render source not found');

function buildSvg(search) {
  const document = {
    body: { innerHTML: '' },
    documentElement: { style: { setProperty() {} } }
  };
  const location = { search };
  const run = new Function('document', 'location', 'URLSearchParams', `${script}\nreturn document.body.innerHTML;`);
  const svg = run(document, location, URLSearchParams);
  if (!svg.startsWith('<svg')) throw new Error(`Render failed for ${search}`);
  return svg;
}

const frontSvg = buildSvg('?view=front');
const wordmarkSvg = buildSvg('?view=wordmark&bg=transparent');
const exportDir = new URL('exports/', root);
await mkdir(exportDir, { recursive: true });

await Promise.all([
  writeFile(new URL('src/lumen-labs-front-mockup.svg', root), frontSvg),
  writeFile(new URL('src/lumen-labs-wordmark-transparent.svg', root), wordmarkSvg),
  sharp(Buffer.from(frontSvg))
    .png({ compressionLevel: 9, palette: false, effort: 10 })
    .withMetadata({ density: 144 })
    .toFile(new URL('lumen-labs-front-mockup.png', exportDir).pathname),
  sharp(Buffer.from(wordmarkSvg))
    .ensureAlpha()
    .png({ compressionLevel: 9, palette: false, effort: 10 })
    .withMetadata({ density: 144 })
    .toFile(new URL('lumen-labs-wordmark-transparent.png', exportDir).pathname)
]);

console.log('Rendered 2400×3000 front mockup and 2400×560 transparent wordmark.');
