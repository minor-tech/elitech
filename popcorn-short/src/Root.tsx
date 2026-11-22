import {Composition, Still} from 'remotion';
import {PopcornShort} from './PopcornShort';
import {EnamelShort} from './enamel/EnamelShort';
import {EnamelShortV2} from './enamelv2/EnamelShortV2';
import {EnamelShortV3} from './enamelv3/EnamelShortV3';
import {GAP_FRAMES, GapShort} from './gap/GapShort';
import {GAP3_FRAMES, GapShortV3} from './gap3/GapShortV3';
import {QUIET_FRAMES, QuietShort, QuietThumb} from './quiet/QuietShort';
import {SODA_FRAMES, SodaShort} from './soda/SodaShort';
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
    {/* Video #3: "The Gap" - extraction, the neighbours move in (45 s) */}
    <Composition id="GapShort" component={GapShort} durationInFrames={GAP_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="GapShortV3" component={GapShortV3} durationInFrames={GAP3_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="QuietShort" component={QuietShort} durationInFrames={QUIET_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="QuietThumb" component={QuietThumb} width={WIDTH} height={HEIGHT} />
    {/* Video #4: "Your Teeth When You Sip Soda All Day" */}
    <Composition id="SodaShort" component={SodaShort} durationInFrames={SODA_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
