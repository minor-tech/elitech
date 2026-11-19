import {Composition} from 'remotion';
import {PopcornShort} from './PopcornShort';
import {EnamelShort} from './enamel/EnamelShort';
import {EnamelShortV2} from './enamelv2/EnamelShortV2';
import {EnamelShortV3} from './enamelv3/EnamelShortV3';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Video #1: popcorn kernel at 3 AM */}
    <Composition id="PopcornShort" component={PopcornShort} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Video #2: enamel is the hardest thing in your body, and it can't heal */}
    <Composition id="EnamelShort" component={EnamelShort} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Video #2 v2: dialogue + word-by-word captions + reworked pacing */}
    <Composition id="EnamelShortV2" component={EnamelShortV2} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Video #2 v3: remade in the style of the reference (cut-away anatomy, one-word captions) */}
    <Composition id="EnamelShortV3" component={EnamelShortV3} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
