'use client';

import { Comment } from '@/lib/battle-v2/types';
import { getEmotionColor } from '@/lib/battle-v2/emotionSystem';
import { useRef, useEffect, type CSSProperties } from 'react';

interface CommentItemProps {
  comment: Comment;
  isNew?: boolean; // 新しいコメントかどうか（アニメーション用）
  animationDelay?: number; // アニメーション遅延（ミリ秒）
  isHighlighted?: boolean; // ハイライト表示するか
}

export function CommentItem({ comment, isNew = false, animationDelay = 0, isHighlighted = false }: CommentItemProps) {
  const isSuperchat = !!comment.isSuperchat;
  const color = isSuperchat ? '#f87171' : getEmotionColor(comment.emotion);
  const wasHighlightedRef = useRef(false);

  // 一度でもハイライトされたら記録
  useEffect(() => {
    if (isHighlighted) {
      wasHighlightedRef.current = true;
    }
  }, [isHighlighted]);

  // 一度でもハイライトされたコメントはアニメーションしない
  const shouldAnimate = isNew && !isHighlighted && !wasHighlightedRef.current;

  const containerStyle: CSSProperties = {
    borderLeft: `4px solid ${color}`,
    backgroundColor: isHighlighted ? `${color}80` : `${color}40`,
  };

  if (isSuperchat) {
    containerStyle.background = isHighlighted
      ? 'linear-gradient(90deg, #f472b6, #f97316, #fcd34d)'
      : 'linear-gradient(90deg, rgba(244,114,182,0.75), rgba(249,115,22,0.75), rgba(252,211,77,0.75))';
    containerStyle.borderLeft = '4px solid #fee2e2';
    containerStyle.boxShadow = '0 0 6px rgba(252,211,77,0.9), 0 0 8px rgba(244,114,182,0.7), 0 0 10px rgba(249,115,22,0.6)';
  }

  if (shouldAnimate) {
    Object.assign(containerStyle, {
      opacity: 0,
      animation: `slideIn 0.3s ease-out ${animationDelay}ms forwards`,
    });
  }

  if (isHighlighted) {
    Object.assign(containerStyle, {
      animation: 'gentlePulse 2s ease-in-out infinite',
    });
  }

  const icon = isSuperchat ? '虹' : getEmotionIcon(comment.emotion);
  const label = isSuperchat ? 'SUPERCHAT' : getEmotionName(comment.emotion);

  return (
    <div
      className={`rounded-lg p-2.5 text-white transition-all relative ${
        shouldAnimate ? 'animate-slide-in' : ''
      } ${
        isHighlighted ? 'ring-2 ring-white shadow-lg transform scale-105 z-10' : ''
      }`}
      style={containerStyle}
    >
      {/* 上部：感情アイコン */}
      <div className="mb-0.5 flex items-center gap-2">
        <div
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="text-xs font-semibold opacity-80">
          {label}
        </div>
      </div>

      {/* コメントテキスト */}
      <div className="text-sm font-medium leading-tight">{comment.text}</div>
    </div>
  );
}

/**
 * 感情のアイコンを取得
 */
function getEmotionIcon(emotion: string): string {
  switch (emotion) {
    case 'rage':
      return '怒';
    case 'terror':
      return '恐';
    case 'grief':
      return '悲';
    case 'ecstasy':
      return '喜';
    default:
      return '？';
  }
}

/**
 * 感情の名前を取得
 */
function getEmotionName(emotion: string): string {
  switch (emotion) {
    case 'rage':
      return 'RAGE';
    case 'terror':
      return 'TERROR';
    case 'grief':
      return 'GRIEF';
    case 'ecstasy':
      return 'ECSTASY';
    default:
      return 'UNKNOWN';
  }
}
