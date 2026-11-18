import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from '../theme';

/** A scene: `world` is shaken, `overlay` (text/clock) stays rock-steady. */
export const Stage: React.FC<{
  bg: string;
  shakeXY?: [number, number];
  world: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({bg, shakeXY = [0, 0], world, overlay}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <AbsoluteFill style={{transform: `translate(${shakeXY[0]}px, ${shakeXY[1]}px) scale(${shakeXY[0] || shakeXY[1] ? 1.02 : 1})`}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {world}
      </svg>
    </AbsoluteFill>
    {overlay && (
      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {overlay}
        </svg>
      </AbsoluteFill>
    )}
  </AbsoluteFill>
);
