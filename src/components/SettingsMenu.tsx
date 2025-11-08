'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SettingsMenuProps {
  onRestart: () => void;
}

export function SettingsMenu({ onRestart }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* 設定ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-24 w-24 items-center justify-center text-white/80 transition-colors hover:text-white"
        aria-label="設定"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* メニュー */}
      {isOpen && (
        <>
          {/* 背景クリックで閉じる */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* メニュー内容 */}
          <div className="absolute top-28 left-0 z-50 w-48 rounded-lg bg-black/95 backdrop-blur-sm border-2 border-white/20 shadow-xl">
            <div className="flex flex-col p-2 gap-2">
              {/* リトライボタン */}
              <button
                onClick={() => {
                  onRestart();
                  setIsOpen(false);
                }}
                className="px-4 py-3 text-center text-white font-bold hover:bg-white/10 rounded-md transition-colors"
              >
                リトライ
              </button>

              {/* トップに戻るボタン */}
              <Link href="/">
                <button
                  className="w-full px-4 py-3 text-center text-white font-bold hover:bg-white/10 rounded-md transition-colors"
                >
                  トップに戻る
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
