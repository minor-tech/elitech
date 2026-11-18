import React from 'react';
import {C, GAP, GUM_Y, HEIGHT} from '../theme';

export const Gum: React.FC<{dim?: number; papillae?: number[]}> = ({dim = 0, papillae = [GAP.x]}) => {
  const y = GUM_Y;
  // gentle wave across the width, with a pointed papilla between each pair of teeth
  const pts: string[] = [`M -40 ${y + 20}`];
  let x = -40;
  for (const px of [...papillae].sort((a, b) => a - b)) {
    pts.push(`C ${(x + px) / 2 - 60} ${y - 10}, ${(x + px) / 2 + 60} ${y + 30}, ${px - 30} ${y - 18}`);
    pts.push(`Q ${px} ${y - 70}, ${px + 30} ${y - 18}`);
    x = px + 30;
  }
  pts.push(`C ${(x + 1120) / 2 - 60} ${y + 30}, ${(x + 1120) / 2 + 60} ${y - 10}, 1120 ${y + 20}`);
  pts.push(`L 1120 ${HEIGHT + 40} L -40 ${HEIGHT + 40} Z`);
  const d = pts.join(' ');
  return (
    <g>
      <path d={d} fill={C.gum} stroke={C.gumDark} strokeWidth={12} strokeLinejoin="round" />
      <path d={`M 60 ${y + 90} Q 540 ${y + 60} 1020 ${y + 90}`} stroke="#F8B4C3" strokeWidth={26} fill="none" strokeLinecap="round" />
      {dim > 0 && <path d={d} fill="#000" opacity={dim} />}
    </g>
  );
};
