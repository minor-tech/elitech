// Loudness-matches a render to the reference short (~-14.5 LUFS, like most TikTok/Reels uploads).
// usage: node scripts/finalize-audio.mjs in.mp4 out.mp4
import {execFileSync, spawnSync} from 'node:child_process';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('usage: finalize-audio.mjs in.mp4 out.mp4');
const args = ['-y', '-loglevel', 'error', '-i', input, '-c:v', 'copy', '-af', 'loudnorm=I=-14.5:TP=-1:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', output];
if (spawnSync('ffmpeg', ['-version']).status === 0) execFileSync('ffmpeg', args, {stdio: 'inherit'});
else execFileSync('npx', ['remotion', 'ffmpeg', ...args], {stdio: 'inherit', shell: process.platform === 'win32'});
console.log(`wrote ${output}`);
