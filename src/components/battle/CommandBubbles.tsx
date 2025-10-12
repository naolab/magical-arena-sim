import clsx from 'clsx';
import type { AudienceCommand } from '@/types';

type BubblePhase = 'announcing' | 'selecting' | 'resolving' | 'ended';

interface CommandBubbleData {
  id: string;
  command: AudienceCommand;
  top: string;
  left: string;
  isPrimary: boolean;
}

interface CommandBubblesProps {
  bubbles: CommandBubbleData[];
  phase: BubblePhase;
}

export function CommandBubbles({ bubbles, phase }: CommandBubblesProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={clsx(
            'absolute max-w-xs -translate-x-1/2 -translate-y-1/2 transition-all duration-500',
            phase === 'announcing' || phase === 'selecting'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90'
          )}
          style={{ top: bubble.top, left: bubble.left }}
        >
          <div className="relative rounded-3xl border border-black/10 bg-white px-5 py-4 text-black shadow-[0_12px_28px_rgba(12,8,36,0.35)]">
            <p className="text-lg font-bold tracking-wide">{bubble.command.message}</p>

            <span className="absolute left-1/2 bottom-0 h-6 w-6 -translate-x-1/2 translate-y-full">
              <svg viewBox="0 0 24 24" className="h-full w-full text-white">
                <path d="M12 0C8 6 3 10 0 12h24c-3-2-8-6-12-12Z" fill="#ffffff" />
                <path d="M12 1c-3 4-7 7-10 9h20c-3-2-7-5-10-9Z" fill="#e5e7eb" />
              </svg>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
