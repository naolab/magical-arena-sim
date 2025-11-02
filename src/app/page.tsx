'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { VersionSelector } from '@/components/ui/VersionSelector';
import { RulesModal } from '@/components/RulesModal';
import { DifficultyModal as V1DifficultyModal } from '@/components/settings/DifficultyModal';
import { V2DifficultyInfoModal } from '@/components/settings/V2DifficultyInfoModal';

const BASE_STAGE_WIDTH = 1600;
const BASE_STAGE_HEIGHT = 900;

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState<'v2' | 'v1'>('v2');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: BASE_STAGE_WIDTH,
    height: BASE_STAGE_HEIGHT,
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') {
        return;
      }
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = useMemo(() => {
    const ratio = Math.min(
      viewportSize.width / BASE_STAGE_WIDTH,
      viewportSize.height / BASE_STAGE_HEIGHT
    );
    return Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  }, [viewportSize]);

  const stageWrapperStyle = useMemo<CSSProperties>(
    () => ({
      width: BASE_STAGE_WIDTH * scale,
      height: BASE_STAGE_HEIGHT * scale,
    }),
    [scale]
  );

  const stageStyle = useMemo<CSSProperties>(
    () => ({
      width: BASE_STAGE_WIDTH,
      height: BASE_STAGE_HEIGHT,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    }),
    [scale]
  );

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-black">
      <VersionSelector
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
      />
      <div style={stageWrapperStyle} className="pointer-events-none">
        <div
          style={stageStyle}
          className="pointer-events-auto overflow-hidden rounded-3xl bg-arena-bg shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-12 px-16 text-center">
            <div>
              <h1 className="text-6xl font-bold text-arena-text">
                Magical Arena Sim{selectedVersion === 'v2' ? ' (v2)' : ''}
              </h1>
              <p className="mt-6 text-xl text-arena-subtext">バトルシステムシミュレータ</p>
            </div>

            <div className="flex flex-col gap-4">
              <Link href={selectedVersion === 'v2' ? '/battle' : '/battle/legacy'}>
                <Button variant="primary" size="lg">
                  バトル開始
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsRulesOpen(true)}
              >
                ルール
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsDifficultyOpen(true)}
              >
                難易度設定
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        version={selectedVersion}
      />

      {selectedVersion === 'v1' ? (
        <V1DifficultyModal isOpen={isDifficultyOpen} onClose={() => setIsDifficultyOpen(false)} />
      ) : (
        <V2DifficultyInfoModal isOpen={isDifficultyOpen} onClose={() => setIsDifficultyOpen(false)} />
      )}
    </main>
  );
}
