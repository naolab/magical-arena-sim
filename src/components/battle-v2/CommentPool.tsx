'use client';

import { Comment } from '@/lib/battle-v2/types';
import { CommentItem } from './CommentItem';
import { MAX_COMMENT_POOL_SIZE } from '@/lib/battle-v2/commentSystem';

interface CommentPoolProps {
  comments: Comment[];
  recentCommentIds?: string[]; // 直近で追加されたコメントID（アニメーション用）
  highlightEmotion?: string | null; // ハイライトする感情
}

export function CommentPool({ comments, recentCommentIds = [], highlightEmotion = null }: CommentPoolProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gradient-to-b from-black/60 to-black/80 p-2 backdrop-blur-sm h-full">
      {/* コメントリスト */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-hide px-3 py-2">
        {comments.length === 0 ? (
          <div className="py-4 text-center text-sm text-white/40">
            コメントがありません
          </div>
        ) : (
          comments.map((comment) => {
            const newCommentIndex = recentCommentIds.indexOf(comment.id);
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                isNew={newCommentIndex !== -1}
                animationDelay={newCommentIndex !== -1 ? newCommentIndex * 300 : 0}
                isHighlighted={highlightEmotion ? comment.emotion === highlightEmotion : false}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
