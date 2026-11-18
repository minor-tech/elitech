// Renders QA keyframes as PNGs: node scripts/render-stills.mjs [frame ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const compId = args[0] && isNaN(Number(args[0])) ? args.shift() : 'PopcornShort';
const frames = args.map(Number);
const list = frames.length ? frames : [0, 150, 400, 700];
const outDir = join(root, 'out', compId === 'PopcornShort' ? 'stills' : `stills-${compId}`);
mkdirSync(outDir, {recursive: true});

const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: join(root, 'src', 'index.ts')});
const composition = await selectComposition({serveUrl, id: compId, browserExecutable});
for (const frame of list) {
  const output = join(outDir, `frame-${String(frame).padStart(3, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable});
  console.log('wrote', output);
}
