import Entrance from '@/components/museum/Entrance';
import SculptureRoom from '@/components/museum/SculptureRoom';
import GalleryRoom from '@/components/museum/GalleryRoom';
import MediaRoom from '@/components/museum/MediaRoom';
import InteractiveRoom from '@/components/museum/InteractiveRoom';
import Visit from '@/components/museum/Visit';

/**
 * 관람 동선
 * 입구 → 01 조각실(어둠) → 02 회화실(하얀 벽) → 03 미디어실(암실) → 04 체험관 → 관람 안내
 */
export default function Home() {
  return (
    <main>
      <Entrance />
      <SculptureRoom />
      <GalleryRoom />
      <MediaRoom />
      <InteractiveRoom />
      <Visit />
    </main>
  );
}
