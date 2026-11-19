// Loudness-matches a render to the reference short (~-14.5 LUFS, typical for TikTok/Reels).
// Two-pass loudnorm: measure first, then correct precisely.  usage: node scripts/finalize-audio.mjs in.mp4 out.mp4
import {execFileSync, spawnSync} from 'node:child_process';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('usage: finalize-audio.mjs in.mp4 out.mp4');
const ff = (args, opts = {}) =>
  spawnSync('ffmpeg', ['-version']).status === 0
    ? spawnSync('ffmpeg', args, {encoding: 'utf8', ...opts})
    : spawnSync('npx', ['remotion', 'ffmpeg', ...args], {encoding: 'utf8', shell: process.platform === 'win32', ...opts});
const target = 'I=-14.5:TP=-1:LRA=11';
const probe = ff(['-hide_banner', '-i', input, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']);
const m = JSON.parse(probe.stderr.slice(probe.stderr.lastIndexOf('{'), probe.stderr.lastIndexOf('}') + 1));
const second = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
const res = ff(['-y', '-loglevel', 'error', '-i', input, '-c:v', 'copy', '-af', second, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', output], {stdio: 'inherit'});
if (res.status !== 0) throw new Error('ffmpeg failed');
console.log(`wrote ${output} (was ${m.input_i} LUFS)`);
