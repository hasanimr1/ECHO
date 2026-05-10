/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowBigUp, ArrowBigDown, CornerDownRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Comment } from "../types";

interface CommentSectionProps {
  comments: Comment[];
  key?: string | number;
}

export default function CommentSection({ comments }: CommentSectionProps) {
  return (
    <div className="flex flex-col gap-6 pl-4 border-l-2 border-border ml-2 mt-4 animate-in fade-in slide-in-from-top-1">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      
      {/* Add Comment Input */}
      <div className="mt-4 flex gap-3">
        <div className="w-8 h-8 bg-border rounded-full flex-shrink-0" />
        <div className="flex-1">
          <textarea 
            placeholder="Add a comment..."
            className="w-full bg-[#121212] border border-border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-brand transition-all min-h-[80px] text-text-primary placeholder-[#444]"
          />
          <div className="flex justify-end mt-2">
            <button className="btn-primary text-[10px] py-1.5 h-auto">Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  key?: string | number;
}

function CommentItem({ comment }: CommentItemProps) {
  const [vote, setVote] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted font-bold">
        <span className="text-white">u/{comment.author}</span>
        <span>•</span>
        <span>{comment.createdAt}</span>
      </div>
      
      <p className="text-sm text-text-secondary leading-relaxed">
        {comment.content}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#121212] border border-border rounded-md px-1.5 py-0.5">
          <button 
            onClick={() => setVote(vote === 1 ? 0 : 1)}
            className={`font-bold transition-colors ${vote === 1 ? 'text-brand' : 'text-muted hover:text-brand'}`}
          >
            ▲
          </button>
          <span className="text-[10px] font-mono font-bold min-w-[20px] text-center text-text-primary">
            {comment.votes + vote}
          </span>
          <button 
            onClick={() => setVote(vote === -1 ? 0 : -1)}
            className={`font-bold transition-colors ${vote === -1 ? 'text-accent-red' : 'text-muted hover:text-accent-red'}`}
          >
            ▼
          </button>
        </div>
        
        <button className="flex items-center gap-1 text-[10px] font-bold text-muted hover:text-brand transition-colors uppercase tracking-widest">
          <CornerDownRight size={14} />
          Reply
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 border-l border-border pl-4 mt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
