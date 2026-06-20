/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, TrendingUp, Zap, Radio } from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  activeCategory: string | null;
  onCategorySelect: (cat: string | null) => void;
}

export default function Sidebar({ activeCategory, onCategorySelect }: SidebarProps) {
  const categories = [
    { name: "Web Dev", icon: Zap, color: "text-brand" },
    { name: "Minimalism", icon: Sparkles, color: "text-[#888]" },
    { name: "Philosophy", icon: Radio, color: "text-[#888]" },
    { name: "Setup", icon: TrendingUp, color: "text-[#888]" },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-72 h-fit sticky top-20 bg-sidebar p-2 rounded-lg">
      {/* Trending Topics */}
      <div className="p-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-4 px-2">
          Trending Topics
        </h3>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              whileHover={{ x: 5 }}
              onClick={() =>
                onCategorySelect(activeCategory === cat.name.toLowerCase() ? null : cat.name.toLowerCase())
              }
              className={`flex items-center gap-3 w-full p-2 rounded-md transition-colors text-sm font-medium ${
                activeCategory === cat.name.toLowerCase()
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "hover:bg-white/5 text-text-secondary hover:text-brand"
              }`}
            >
              <cat.icon size={16} className={activeCategory === cat.name.toLowerCase() ? "text-brand" : cat.color} />
              {cat.name}
            </motion.button>
          ))}
        </div>
        {activeCategory && (
          <button
            onClick={() => onCategorySelect(null)}
            className="mt-3 w-full text-[10px] uppercase tracking-widest font-bold text-muted hover:text-brand transition-colors px-2 text-left"
          >
            ✕ Clear filter
          </button>
        )}
      </div>

      {/* Footer Links */}
      <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase font-bold tracking-widest text-muted">
        <a href="#" onClick={e => e.preventDefault()} className="hover:text-text-primary">Privacy</a>
        <a href="#" onClick={e => e.preventDefault()} className="hover:text-text-primary">Terms</a>
        <a href="#" onClick={e => e.preventDefault()} className="hover:text-text-primary">© 2025</a>
      </div>
    </aside>
  );
}
