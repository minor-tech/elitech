import React from 'react';
import {Gum} from './Gum';
import {Tooth} from './Tooth';
import {MAIN, NEIGHBOR} from '../theme';

type ToothProps = React.ComponentProps<typeof Tooth>;

/**
 * The shared "mouth" set: things behind the teeth (kernel lives in the gap),
 * the sleepy neighbour, our hero tooth, gums, then anything in front.
 */
export const Mouth: React.FC<{
  frame: number;
  hero?: Partial<ToothProps>;
  neighbor?: Partial<ToothProps>;
  glow?: React.ReactNode; // drawn behind the teeth
  behind?: React.ReactNode; // the kernel, wedged in the notch between the teeth
  front?: React.ReactNode;
}> = ({frame, hero = {}, neighbor = {}, glow, behind, front}) => (
  <g>
    {glow}
    <Tooth {...NEIGHBOR} eyes="closed" mouth="smile" frame={frame} {...neighbor} />
    <Tooth {...MAIN} frame={frame} {...hero} />
    {behind}
    <Gum />
    {front}
  </g>
);
