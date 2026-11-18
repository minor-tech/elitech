import React from 'react';
import {C, fontFamily} from '../theme';

export const Clock: React.FC<{time: string; x?: number; y?: number; scale?: number}> = ({
  time,
  x = 800,
  y = 170, // below the TikTok/Reels top tab bar
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={0} y={0} width={230} height={100} rx={26} fill={C.ink} stroke={C.toothOutline} strokeWidth={8} />
    <rect x={24} y={100} width={30} height={14} rx={6} fill={C.ink} stroke={C.toothOutline} strokeWidth={6} />
    <rect x={176} y={100} width={30} height={14} rx={6} fill={C.ink} stroke={C.toothOutline} strokeWidth={6} />
    <text
      x={115}
      y={54}
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily={fontFamily}
      fontWeight={700}
      fontSize={54}
      fill={C.redSoft}
    >
      {time}
    </text>
  </g>
);
