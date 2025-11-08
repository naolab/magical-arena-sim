'use client';

import clsx from 'clsx';

type Version = 'v2' | 'v1';

interface VersionSelectorProps {
  selectedVersion: Version;
  onVersionChange: (version: Version) => void;
}

export function VersionSelector({
  selectedVersion,
  onVersionChange,
}: VersionSelectorProps) {
  return (
    <div className="fixed left-4 top-4 z-40 flex gap-1 rounded-lg bg-black/30 p-1 backdrop-blur-sm">
      <button
        onClick={() => onVersionChange('v2')}
        className={clsx(
          'rounded-md px-4 py-2 text-sm font-bold transition-all',
          {
            'bg-arena-player text-white': selectedVersion === 'v2',
            'text-white/60 hover:text-white/80': selectedVersion !== 'v2',
          }
        )}
      >
        v2 (新バージョン)
      </button>
      <button
        onClick={() => onVersionChange('v1')}
        className={clsx(
          'rounded-md px-4 py-2 text-sm font-bold transition-all',
          {
            'bg-arena-neutral text-arena-bg': selectedVersion === 'v1',
            'text-white/60 hover:text-white/80': selectedVersion !== 'v1',
          }
        )}
      >
        v1 (旧バージョン)
      </button>
    </div>
  );
}
