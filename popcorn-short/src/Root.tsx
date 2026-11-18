import {Composition} from 'remotion';
import {PopcornShort} from './PopcornShort';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PopcornShort"
    component={PopcornShort}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
