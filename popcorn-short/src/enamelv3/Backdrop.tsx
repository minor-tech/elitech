import React from 'react';
import {random} from 'remotion';
import {GUM_LINE, X} from './style';

/** Dark maroon "inside the body" background with soft blobs + vignette (behind the camera layer). */
export const Cavity: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="cavityV" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor={X.bgBlob} />
        <stop offset="60%" stopColor={X.bg} />
        <stop offset="100%" stopColor={X.bgDark} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={1880} height={2720} fill="url(#cavityV)" />
    {[
      [120, 260, 170],
      [880, 180, 140],
      [960, 640, 110],
      [90, 820, 120],
      [520, 120, 90],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill={X.bgDark} opacity={0.35} />
    ))}
  </g>
);

/** Jaw bone (cut-away, spongy) - behind the teeth. */
export const Bone: React.FC = () => {
  const top = GUM_LINE + 60;
  const d = `M -400 ${top} L 1480 ${top} L 1480 ${top + 330} Q 540 ${top + 520} -400 ${top + 330} Z`;
  return (
    <g>
      <defs>
        <clipPath id="boneClip">
          <path d={d} />
        </clipPath>
        <linearGradient id="boneShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={X.bone} />
          <stop offset="100%" stopColor="#D9B386" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#boneShade)" stroke={X.line} strokeWidth={6} />
      <g clipPath="url(#boneClip)">
        {Array.from({length: 60}).map((_, i) => (
          <ellipse
            key={i}
            cx={-60 + random(`bx${i}`) * 1200}
            cy={top + 30 + random(`by${i}`) * 440}
            rx={8 + random(`br${i}`) * 16}
            ry={6 + random(`bq${i}`) * 10}
            fill={X.boneDot}
            opacity={0.7}
          />
        ))}
      </g>
    </g>
  );
};

/** Gum tissue (cut-away band hugging the tooth necks) - in front of the roots' top. */
export const GumBand: React.FC<{papillae: number[]}> = ({papillae}) => {
  const y = GUM_LINE;
  const pts: string[] = [`M -400 ${y + 20}`];
  for (const px of papillae) pts.push(`L ${px - 90} ${y + 16}`, `C ${px - 40} ${y + 10}, ${px - 22} ${y - 80}, ${px} ${y - 84}`, `C ${px + 22} ${y - 80}, ${px + 40} ${y + 10}, ${px + 90} ${y + 16}`);
  pts.push(`L 1480 ${y + 20} L 1480 ${y + 150} Q 540 ${y + 180} -400 ${y + 150} Z`);
  const d = pts.join(' ');
  return (
    <g>
      <path d={d} fill={X.gum} stroke={X.line} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -100 ${y + 60} Q 540 ${y + 90} 1180 ${y + 60}`} stroke={X.gumLight} strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

/** Upper jaw that bites down: gum band + an upside-down faceless molar handled by the caller. */
export const UpperGum: React.FC<{y: number}> = ({y}) => (
  <g>
    <path d={`M -400 -900 L 1480 -900 L 1480 ${y - 10} Q 540 ${y + 30} -400 ${y - 10} Z`} fill={X.gum} stroke={X.line} strokeWidth={6} />
    <path d={`M -100 ${y - 40} Q 540 ${y - 10} 1180 ${y - 40}`} stroke={X.gumLight} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);
