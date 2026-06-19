/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Bell, Plus, User, MessageSquare, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Dock, { DockItemData } from "./Dock";
import { User as UserType } from "../types";

interface NavbarProps {
  onSearchOpen: () => void;
  onNewPostOpen: () => void;
  onSettingsOpen: () => void;
  onAuthOpen: () => void;
  onProfileOpen: () => void;
  onNotificationsOpen: () => void;
  onMessagesOpen: () => void;
  unreadCount: number;
  userStatus: 'active' | 'inactive';
  user: UserType | null;
}

export default function Navbar({ onSearchOpen, onNewPostOpen, onSettingsOpen, onAuthOpen, onProfileOpen, onNotificationsOpen, onMessagesOpen, unreadCount, userStatus, user }: NavbarProps) {
  const dockItems: DockItemData[] = [
    { 
      icon: <Search size={18} />, 
      label: 'Search', 
      onClick: onSearchOpen 
    },
    { 
      icon: (
        <div className="relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      ), 
      label: 'Notifications', 
      onClick: onNotificationsOpen 
    },
    { 
      icon: <MessageSquare size={18} />, 
      label: 'Messages', 
      onClick: onMessagesOpen 
    },
    { 
      icon: <Plus size={18} />, 
      label: 'New Post', 
      onClick: onNewPostOpen 
    },
    { 
      icon: <Settings size={18} />, 
      label: 'Settings', 
      onClick: onSettingsOpen 
    },
    { 
      icon: <User size={18} className={user ? "text-brand" : ""} />, 
      label: user ? 'Profile' : 'Login', 
      onClick: user ? onProfileOpen : onAuthOpen 
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm h-16">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 15 }}
            className="w-8 h-8 bg-brand rounded-sm flex items-center justify-center text-background"
          >
            <div className="w-4 h-4 border-2 border-background rotate-45"></div>
          </motion.div>
          <span className="text-xl font-bold tracking-tighter text-white hidden sm:block">
            ECHO
          </span>
        </div>

        {/* Dynamic Dock */}
        <div className="flex-1 flex justify-center max-w-xl">
          <Dock 
            items={dockItems}
            panelHeight={44}
            baseItemSize={36}
            magnification={54}
            distance={100}
          />
        </div>

        {/* User Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase transition-colors">
            <span className={`${userStatus === 'active' ? 'text-brand' : 'text-muted'}`}>
              ● {userStatus === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <motion.div 
            whileHover={user ? { scale: 1.1 } : {}}
            className="w-8 h-8 rounded-full bg-border border border-[#333] flex items-center justify-center text-xs text-muted overflow-hidden"
          >
            {user ? (
              <span className="text-brand font-bold">{user.avatar}</span>
            ) : (
              "?"
            )}
          </motion.div>
          {user && (
            <div className="hidden md:block">
              <div className="text-[10px] font-bold text-white leading-none uppercase tracking-widest">{user.displayName}</div>
              <div className="text-[8px] text-muted leading-none mt-1">@{user.username}</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

