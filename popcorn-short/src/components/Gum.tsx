import React from 'react';
import {C, GAP, GUM_Y, HEIGHT} from '../theme';

export const Gum: React.FC<{dim?: number}> = ({dim = 0}) => {
  const y = GUM_Y;
  const d =
    `M -40 ${y + 30} ` +
    `C 60 ${y - 10}, 150 ${y + 20}, 220 ${y + 10} ` +
    `C 330 ${y - 5}, 480 ${y + 30}, ${GAP.x - 30} ${y - 20} ` +
    `Q ${GAP.x} ${y - 70}, ${GAP.x + 30} ${y - 20} ` +
    `C 700 ${y + 20}, 820 ${y - 10}, 900 ${y + 15} ` +
    `C 980 ${y + 30}, 1040 ${y}, 1120 ${y + 20} ` +
    `L 1120 ${HEIGHT + 40} L -40 ${HEIGHT + 40} Z`;
  return (
    <g>
      <path d={d} fill={C.gum} stroke={C.gumDark} strokeWidth={12} strokeLinejoin="round" />
      {/* simple flat highlight band */}
      <path d={`M 60 ${y + 90} Q 540 ${y + 60} 1020 ${y + 90}`} stroke="#F8B4C3" strokeWidth={26} fill="none" strokeLinecap="round" />
      {dim > 0 && <path d={d} fill="#000" opacity={dim} />}
    </g>
  );
};
