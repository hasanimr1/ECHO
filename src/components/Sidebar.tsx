/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, TrendingUp, Zap, Radio } from "lucide-react";
import { motion } from "motion/react";

export default function Sidebar() {
  const categories = [
    { name: "Web Dev", icon: Zap, color: "text-brand" },
    { name: "Minimalism", icon: Sparkles, color: "text-[#888]" },
    { name: "Philosophy", icon: Radio, color: "text-[#888]" },
    { name: "Setup", icon: TrendingUp, color: "text-[#888]" },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-72 h-fit sticky top-20 bg-sidebar p-2 rounded-lg">
      {/* About Community Card */}
      <div className="bg-[#121212] border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-brand">About Community</h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Welcome to the Echo Void. A place for posting, commenting, and voting without the baggage of persistent accounts. Pure content flow.
        </p>
        <div className="flex justify-between border-t border-border pt-4">
          <div>
            <p className="text-lg font-mono font-bold text-text-primary">82.4k</p>
            <p className="text-[9px] uppercase text-muted">Echoes</p>
          </div>
          <div>
            <p className="text-lg font-mono font-bold text-text-primary">1.2k</p>
            <p className="text-[9px] uppercase text-muted">In Orbit</p>
          </div>
        </div>
      </div>

      {/* Categories/Trending */}
      <div className="p-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-4 px-2">
          Trending Topics
        </h3>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-md transition-colors text-sm font-medium text-text-secondary hover:text-brand"
            >
              <cat.icon size={16} className={cat.color} />
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase font-bold tracking-widest text-muted">
        <a href="#" className="hover:text-text-primary">Privacy</a>
        <a href="#" className="hover:text-text-primary">Terms</a>
        <a href="#" className="hover:text-text-primary">© 2024</a>
      </div>
    </aside>
  );
}
