'use client';

import { RulesContent } from '@/components/battle-v2/RulesContent';
import { Button } from './ui/Button';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="relative max-h-[85vh] w-[min(800px,90vw)] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/70 to-black/90 p-8 shadow-[0_45px_75px_rgba(10,6,30,0.75)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
        </div>

        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">ルール</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="max-h-[calc(85vh-140px)] overflow-y-auto pr-2">
            <RulesContent />
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              variant="primary"
              size="lg"
              className="w-full rounded-full bg-gradient-to-br from-white/20 to-white/10 text-white border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition hover:from-white/30 hover:to-white/20 hover:border-white/40"
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
