'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // 1文字あたりの表示速度（ミリ秒）
  className?: string;
  onComplete?: () => void; // 表示完了時のコールバック
  startDelay?: number; // 表示開始までの遅延（ミリ秒）
  enableColors?: boolean; // 色付けを有効化（デフォルトtrue）
}

// キーワードと色のマッピング
const COLOR_MAP: Record<string, string> = {
  'あなた': '#22d3ee', // 水色
  '敵': '#ec4899', // ピンク
  'Rage': '#ef4444', // 赤
  'Terror': '#22c55e', // 緑
  'Grief': '#3b82f6', // 青
  'Ecstasy': '#eab308', // 黄色
};

export function TypewriterText({ text, speed = 30, className = '', onComplete, startDelay = 0, enableColors = true }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(startDelay === 0);

  useEffect(() => {
    // テキストが変わったらリセット
    setDisplayedText('');
    setCurrentIndex(0);
    setIsStarted(startDelay === 0);

    if (startDelay > 0) {
      const delayTimer = setTimeout(() => {
        setIsStarted(true);
      }, startDelay);
      return () => clearTimeout(delayTimer);
    }
  }, [text, startDelay]);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      // 表示完了
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, isStarted]);

  // テキストを色付けしてレンダリング
  const renderColoredText = (text: string) => {
    if (!enableColors) {
      return text;
    }

    const parts: { text: string; color?: string }[] = [];
    let remaining = text;
    let position = 0;

    while (remaining.length > 0) {
      let matched = false;

      // 各キーワードをチェック
      for (const [keyword, color] of Object.entries(COLOR_MAP)) {
        if (remaining.startsWith(keyword)) {
          parts.push({ text: keyword, color });
          remaining = remaining.slice(keyword.length);
          position += keyword.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // マッチしない場合は1文字進める
        parts.push({ text: remaining[0] });
        remaining = remaining.slice(1);
        position += 1;
      }
    }

    return (
      <>
        {parts.map((part, index) =>
          part.color ? (
            <span key={index} style={{ color: part.color, fontWeight: 'bold' }}>
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        )}
      </>
    );
  };

  return <div className={className}>{renderColoredText(displayedText)}</div>;
}
