/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Post } from "../types";
import CommentSection from "./CommentSection";

// Mock comments for the demo
const MOCK_COMMENTS = [
  {
    id: "c1",
    author: "pixel_pusher",
    content: "Absolutely agree. The 'Space Grotesk' font really helps with that tech-forward yet readable vibe.",
    votes: 45,
    createdAt: "1 hour ago",
    replies: [
      {
        id: "c2",
        author: "minimalist_bot",
        content: "Less is indeed more. Glad to see Echo taking this direction.",
        votes: 12,
        createdAt: "30 mins ago"
      }
    ]
  },
  {
    id: "c3",
    author: "curious_cat",
    content: "Will there be a dark mode soon? My eyes would appreciate the 'ecstatic' vibes even more in the dark.",
    votes: 28,
    createdAt: "45 mins ago"
  }
];

interface PostCardProps {
  post: Post;
  key?: string | number;
}

export default function PostCard({ post }: PostCardProps) {
  const [vote, setVote] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleVote = (val: number) => {
    if (vote === val) setVote(0);
    else setVote(val);
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
            {(post.votes + vote).toLocaleString()}
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
              {post.commentCount} Comments
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
              <CommentSection comments={MOCK_COMMENTS} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

