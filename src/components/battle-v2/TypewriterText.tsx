'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // 1文字あたりの表示速度（ミリ秒）
  className?: string;
  onComplete?: () => void; // 表示完了時のコールバック
  startDelay?: number; // 表示開始までの遅延（ミリ秒）
}

export function TypewriterText({ text, speed = 30, className = '', onComplete, startDelay = 0 }: TypewriterTextProps) {
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

  return <div className={className}>{displayedText}</div>;
}
