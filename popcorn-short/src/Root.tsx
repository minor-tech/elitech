import {Composition} from 'remotion';
import {PopcornShort} from './PopcornShort';
import {EnamelShort} from './enamel/EnamelShort';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Video #1: popcorn kernel at 3 AM */}
    <Composition id="PopcornShort" component={PopcornShort} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Video #2: enamel is the hardest thing in your body, and it can't heal */}
    <Composition id="EnamelShort" component={EnamelShort} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
