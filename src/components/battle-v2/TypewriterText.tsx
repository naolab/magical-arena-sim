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
  'あなた': '#ec4899', // ピンク
  '敵': '#22d3ee', // 水色
  'Rage': '#ef4444', // 赤
  'Terror': '#22c55e', // 緑
  'Grief': '#3b82f6', // 青
  'Ecstasy': '#eab308', // 黄色
  'バーストレイジ': '#ef4444',
  'パーセントスマイト': '#ef4444',
  'ディミニッシュテラー': '#22c55e',
  'ヴェノムナイトメア': '#22c55e',
  'ソウルドレイン': '#3b82f6',
  'ラストリメディ': '#3b82f6',
  'トランスブースト': '#eab308',
  'クリムゾンコンバータ': '#eab308',
};

export function TypewriterText({ text, speed = 30, className = '', onComplete, startDelay = 0, enableColors = true }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(startDelay === 0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // HTMLタグを含むテキストから、表示用の文字列とHTML構造を分離
  const parseTextWithHtml = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return {
      plainText: temp.textContent || '',
      htmlTemplate: html,
    };
  };

  const { plainText, htmlTemplate } = parseTextWithHtml(text);

  useEffect(() => {
    // テキストが変わったらリセット
    setDisplayedText('');
    setCurrentIndex(0);
    setIsStarted(startDelay === 0);
    setHasCompleted(false);

    if (startDelay > 0) {
      const delayTimer = setTimeout(() => {
        setIsStarted(true);
      }, startDelay);
      return () => clearTimeout(delayTimer);
    }
  }, [text, startDelay]);

  useEffect(() => {
    if (!isStarted) return;

    if (currentIndex < plainText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(plainText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === plainText.length && !hasCompleted && onComplete) {
      // 表示完了（一度だけ呼ぶ）
      setHasCompleted(true);
      onComplete();
    }
  }, [currentIndex, plainText, speed, onComplete, isStarted, hasCompleted]);

  // HTMLテンプレートから表示用のHTMLを生成
  const getDisplayedHtml = () => {
    if (!enableColors) {
      return displayedText;
    }

    // HTMLタグを含む場合はそのまま使用し、プレーンテキストのみを制限
    let charCount = 0;
    let result = '';
    let inTag = false;

    for (let i = 0; i < htmlTemplate.length; i++) {
      const char = htmlTemplate[i];

      if (char === '<') {
        inTag = true;
        result += char;
      } else if (char === '>') {
        inTag = false;
        result += char;
      } else if (inTag) {
        result += char;
      } else {
        if (charCount < displayedText.length) {
          result += char;
          charCount++;
        } else {
          break;
        }
      }
    }

    // 開きタグが閉じられていない場合は閉じる
    const openTags: string[] = [];
    const tagRegex = /<\/?([a-z]+)[^>]*>/gi;
    let match;

    while ((match = tagRegex.exec(result)) !== null) {
      const isClosing = match[0].startsWith('</');
      const tagName = match[1];

      if (!isClosing) {
        openTags.push(tagName);
      } else {
        openTags.pop();
      }
    }

    // 未閉鎖タグを閉じる
    for (let i = openTags.length - 1; i >= 0; i--) {
      result += `</${openTags[i]}>`;
    }

    return result;
  };

  return <div className={className} dangerouslySetInnerHTML={{ __html: getDisplayedHtml() }} />;
}
