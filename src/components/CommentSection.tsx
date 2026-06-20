/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CornerDownRight } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { Comment } from "../types";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUsername: string | null;
  onNewComment: (text: string) => void;
}

const CommentSection = React.memo(({ postId, comments, currentUsername, onNewComment }: CommentSectionProps) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || !currentUsername) return;
    onNewComment(trimmed);
    setText('');
  };

  return (
    <div className="flex flex-col gap-6 pl-4 border-l-2 border-border ml-2 mt-4 animate-in fade-in slide-in-from-top-1">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}

      {/* Add Comment Input */}
      <div className="mt-4 flex gap-3">
        <div className="w-8 h-8 bg-border rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-muted">
          {currentUsername ? currentUsername.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={currentUsername ? "Add a comment..." : "Log in to comment"}
            disabled={!currentUsername}
            className="w-full bg-[#121212] border border-border rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-brand transition-all min-h-[80px] text-text-primary placeholder-[#444] disabled:opacity-40 disabled:cursor-not-allowed resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={!currentUsername || !text.trim()}
              className="btn-primary text-[10px] py-1.5 h-auto disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CommentSection;

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = React.memo(({ comment }: CommentItemProps) => {
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
});
