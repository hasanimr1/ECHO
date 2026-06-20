/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { Post, Comment } from "../types";
import CommentSection from "./CommentSection";
import { fetchComments, createComment, votePost } from "../store";
import { useSignalR } from "../useSignalR";

interface PostCardProps {
  post: Post;
  currentUsername: string | null;
  onNotificationCreated?: () => void;
}

const PostCard = React.memo(({ post, currentUsername, onNotificationCreated }: PostCardProps) => {
  const [vote, setVote] = useState(0);
  const [displayVotes, setDisplayVotes] = useState(post.votes);
  const [displayCommentCount, setDisplayCommentCount] = useState(post.commentCount);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const connection = useSignalR();

  useEffect(() => {
    setDisplayVotes(post.votes);
  }, [post.votes]);

  useEffect(() => {
    setDisplayCommentCount(post.commentCount);
  }, [post.commentCount]);

  useEffect(() => {
    if (isCommentsOpen) fetchComments(post.id).then(setComments).catch(console.error);
  }, [isCommentsOpen, post.id]);

  useEffect(() => {
    if (connection && isCommentsOpen) {
      connection.invoke('JoinPost', post.id).catch(console.error);
      const onNewComment = (comment: Comment) => setComments(prev => [comment, ...prev]);
      connection.on('NewComment', onNewComment);
      return () => {
        connection.invoke('LeavePost', post.id).catch(console.error);
        connection.off('NewComment', onNewComment);
      };
    }
  }, [connection, isCommentsOpen, post.id]);

  const handleVote = async (newVote: number) => {
    if (!currentUsername) {
      if (document.querySelector('input[placeholder="Username"]')) {
        const input = document.querySelector('input[placeholder="Username"]') as HTMLInputElement;
        input.focus();
      }
      return;
    }
    
    // Determine vote direction and optimistic update
    let dir = 0;
    if (vote === newVote) {
      // Toggle off
      dir = 0;
      setDisplayVotes(prev => prev - vote);
      setVote(0);
    } else {
      // Switch or brand new vote
      dir = newVote;
      const diff = newVote === 1 ? (vote === -1 ? 2 : 1) : (newVote === -1 ? (vote === 1 ? -2 : -1) : 0);
      setDisplayVotes(prev => prev + diff);
      setVote(newVote);
    }

    try {
      await votePost(post.id, newVote === 1 ? 'up' : 'down');
      if (dir === 1 && onNotificationCreated) onNotificationCreated();
    } catch {}
  };

  const handleNewComment = async (text: string) => {
    setDisplayCommentCount(prev => prev + 1);
    try { 
      await createComment(post.id, text); 
      if (onNotificationCreated) onNotificationCreated();
    } catch (e) {
      setDisplayCommentCount(prev => prev - 1); // Revert on failure
    }
  };

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-2xl"
    >
      <div className="flex">
        {/* Vote Column */}
        <div className="w-12 bg-[#0C0C0C] flex flex-col items-center py-4 gap-1">
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={() => handleVote(1)}
            className={`font-bold text-lg leading-none transition-colors ${vote === 1 ? 'text-brand' : 'text-muted hover:text-brand'}`}
          >
            ▲
          </motion.button>
          
          <span className={`text-xs font-mono font-bold ${vote === 1 ? 'text-brand' : vote === -1 ? 'text-accent-red' : 'text-text-primary'}`}>
            {displayVotes.toLocaleString()}
          </span>

          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={() => handleVote(-1)}
            className={`font-bold text-lg leading-none transition-colors ${vote === -1 ? 'text-accent-red' : 'text-muted hover:text-accent-red'}`}
          >
            ▼
          </motion.button>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-5 flex flex-col gap-2">
          {/* Meta */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted">
            <span className="text-brand font-bold">e/{post.category}</span>
            <span>•</span>
            <span>Posted by u/{post.author}</span>
            <span>•</span>
            <span>{post.createdAt}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-serif font-light mb-1 leading-tight text-white italic">
            {post.title}
          </h2>

          {/* Body Snippet */}
          <p className="text-text-secondary text-sm leading-relaxed mb-2 line-clamp-3">
            {post.content}
          </p>

          {/* Footer Actions */}
          <div className="flex gap-6 mt-2">
            <button 
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className={`text-[11px] font-bold uppercase flex items-center gap-2 transition-all ${
                isCommentsOpen ? 'text-brand' : 'text-[#555] hover:text-brand'
              }`}
            >
              <MessageSquare size={14} />
              {displayCommentCount} Comments
            </button>
            
            <button className="text-[11px] font-bold uppercase text-[#555] hover:text-brand flex items-center gap-2">
              <Share2 size={14} />
              Share
            </button>

            <button className="text-[#555] hover:text-brand ml-auto">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Comments Section */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#0C0C0C]/50 border-t border-border"
          >
            <div className="p-6">
              <CommentSection
                postId={post.id}
                comments={comments}
                currentUsername={currentUsername}
                onNewComment={handleNewComment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}, (prev, next) => {
  return prev.post === next.post && prev.currentUsername === next.currentUsername;
});

export default PostCard;
