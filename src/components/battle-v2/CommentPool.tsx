'use client';

import { Comment } from '@/lib/battle-v2/types';
import { CommentItem } from './CommentItem';
import { MAX_COMMENT_POOL_SIZE } from '@/lib/battle-v2/commentSystem';

interface CommentPoolProps {
  comments: Comment[];
  recentCommentIds?: string[]; // 直近で追加されたコメントID（アニメーション用）
}

export function CommentPool({ comments, recentCommentIds = [] }: CommentPoolProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-gradient-to-b from-black/60 to-black/80 p-4 backdrop-blur-sm h-full">
      {/* コメントリスト */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-hide">
        {comments.length === 0 ? (
          <div className="py-4 text-center text-sm text-white/40">
            コメントがありません
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isNew={recentCommentIds.includes(comment.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
