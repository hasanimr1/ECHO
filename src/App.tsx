/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import PostCard from "./components/PostCard";
import Sidebar from "./components/Sidebar";
import { Post, User as UserType } from "./types";
import { fetchPosts, createPost, fetchNotifications, fetchUnreadCount, markAllNotificationsRead, EchoNotification, updateUserDetails } from "./store";
import { API_BASE } from "./api";
import { useSignalR } from "./useSignalR";
import { Search, Palette, Activity, Lock, User as UserIcon, Shield, Bell, MessageSquare, Eye, EyeOff, CheckCircle2, ArrowUp, ArrowDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import SplashScreen from "./components/SplashScreen";

const THEME_COLORS = [
  { name: 'Cyan', value: '#00F5FF' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Orange', value: '#F97316' },
];

const FEED_FILTERS = ['Feed', 'Popular', 'New', 'Top'] as const;
type FeedFilter = typeof FEED_FILTERS[number];

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const connection = useSignalR();

  // Feed state
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('Feed');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(activeFilter, activeCategory || undefined).then(setPosts).catch(console.error);
  }, [activeFilter, activeCategory]);

  useEffect(() => {
    if (connection) {
      connection.on('NewPost', (post: Post) => {
        setPosts(prev => {
          if (prev.find(p => p.id === post.id)) return prev;
          if (activeCategory && post.category !== activeCategory) return prev;
          return [post, ...prev];
        });
      });
      connection.on('VoteUpdate', (data: { postId: string, voteScore: number }) => {
        setPosts(prev => prev.map(p => p.id === data.postId ? { ...p, votes: data.voteScore } : p));
      });
      connection.on('CommentCountUpdate', (data: { postId: string, commentCount: number }) => {
        setPosts(prev => prev.map(p => p.id === data.postId ? { ...p, commentCount: data.commentCount } : p));
      });
    }
  }, [connection, activeCategory]);
  const [activeOverlay, setActiveOverlay] = useState<'search' | 'newPost' | 'settings' | 'auth' | 'notifications' | 'messages' | 'profile' | null>(null);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('echo_user'));
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('echo_theme') || '#00F5FF');
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('echo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', displayName: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile update state
  const [profileForm, setProfileForm] = useState({ displayName: '', username: '' });
  
  // Feed state
  // (moved up)

  // Notification state
  const [notifications, setNotifications] = useState<EchoNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications when user changes or overlay changes
  useEffect(() => {
    if (user) {
      fetchNotifications().then(setNotifications).catch(console.error);
      fetchUnreadCount().then(setUnreadCount).catch(console.error);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, activeOverlay]);

  useEffect(() => {
    if (activeOverlay === 'profile' && user) {
      setProfileForm({ displayName: user.displayName, username: user.username });
    }
  }, [activeOverlay, user]);

  // Mark notifications as read when opening the overlay
  useEffect(() => {
    if (activeOverlay === 'notifications' && user) {
      markAllNotificationsRead().catch(console.error);
      setUnreadCount(0);
    }
  }, [activeOverlay, user]);

  // New post form state
  const [newPostForm, setNewPostForm] = useState({ title: '', content: '', category: '' });

  // Apply brand color to CSS variable
  useEffect(() => {
    localStorage.setItem('echo_theme', brandColor);
    document.documentElement.style.setProperty('--brand-color', brandColor);
  }, [brandColor]);

  // Filtered + sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Category filter from sidebar
    if (activeCategory) {
      result = result.filter(p => p.category.toLowerCase() === activeCategory);
    }

    // Feed filter sorting
    if (activeFilter === 'Popular' || activeFilter === 'Top') {
      result = result.sort((a, b) => b.votes - a.votes);
    } else if (activeFilter === 'New') {
      // Newest first — user-created posts with 'just now' will bubble up
      result = result.sort((a, b) => {
        if (a.createdAt === 'just now') return -1;
        if (b.createdAt === 'just now') return 1;
        return 0;
      });
    }

    return result;
  }, [posts, activeFilter, activeCategory]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    try {
      const endpoint = authMode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/signup`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (data.success) {
        if (authMode === 'signup') {
          // Don't auto-login — redirect to login with success message
          setAuthSuccess('Identity created! Please log in to enter the void.');
          setAuthMode('login');
          setAuthForm({ username: authForm.username, password: '', displayName: '' });
          setShowPassword(false);
        } else {
          // Login — set user, store JWT token, and enter app
          setUser(data.user);
          localStorage.setItem('echo_user', JSON.stringify(data.user));
          localStorage.setItem('echo_token_data', JSON.stringify({ token: data.token }));
          setActiveOverlay(null);
          setAuthForm({ username: '', password: '', displayName: '' });
        }
      } else {
        setAuthError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Connection to the void failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('echo_user');
    localStorage.removeItem('echo_token_data');
    setShowSplash(true);
    setActiveOverlay(null);
  };

  const handleProfileUpdate = () => {
    if (!user) return;
    const updatedUser = { ...user, ...profileForm };
    setUser(updatedUser);
    updateUserDetails(updatedUser);
    // Note: in a real app, you'd also need to update author references in posts/comments
    setActiveOverlay(null);
  };

  const handleNewPost = async () => {
    if (!newPostForm.title.trim() || !newPostForm.content.trim()) return;
    try {
      await createPost(newPostForm.title.trim(), newPostForm.content.trim(), newPostForm.category.trim() || 'general');
      setNewPostForm({ title: '', content: '', category: '' });
      setActiveOverlay(null);
    } catch (e) {
      console.error("Failed to post", e);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-brand/30 overflow-x-hidden">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed inset-0 z-[300]"
          >
            <SplashScreen 
              brandColor={brandColor}
              onEnter={(mode) => {
                setAuthMode(mode);
                setActiveOverlay('auth');
                setShowSplash(false);
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation stays sharp */}
      <Navbar 
        onSearchOpen={() => setActiveOverlay('search')} 
        onNewPostOpen={() => {
          if (!user) {
            setAuthMode('login');
            setActiveOverlay('auth');
          } else {
            setActiveOverlay('newPost');
          }
        }} 
        onSettingsOpen={() => setActiveOverlay('settings')}
        onAuthOpen={() => {
          setAuthMode('login');
          setActiveOverlay('auth');
        }}
        onProfileOpen={() => setActiveOverlay('profile')}
        onNotificationsOpen={() => setActiveOverlay('notifications')}
        onMessagesOpen={() => setActiveOverlay('messages')}
        unreadCount={unreadCount}
        userStatus={userStatus}
        user={user}
      />
      
      {/* Main content blurs when overlay is active — and hidden if not logged in */}
      {user ? (
        <div className={`flex-1 flex flex-col transition-all duration-700 ease-in-out ${activeOverlay ? 'blur-xl brightness-50 pointer-events-none scale-[0.98]' : ''}`}>
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-8">
            {/* Feed Section */}
            <section className="flex flex-col gap-6">
            
            {/* Feed Filter Pills */}
            <div className="flex items-center gap-3 mb-2 overflow-x-auto pb-2 no-scrollbar">
              {FEED_FILTERS.map((filter, i) => (
                <motion.button
                  key={filter}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                    activeFilter === filter
                    ? 'bg-[#121212] text-brand border border-brand' 
                    : 'text-muted border border-border hover:text-text-primary hover:border-muted bg-transparent'
                  }`}
                >
                  {filter === 'Feed' && <span className="text-lg leading-none">◇</span>}
                  {filter === 'Popular' && <span className="text-lg leading-none">◈</span>}
                  {filter === 'New' && <span className="text-lg leading-none">✨</span>}
                  {filter === 'Top' && <span className="text-lg leading-none">▲</span>}
                  {filter}
                </motion.button>
              ))}
              {activeCategory && (
                <span className="ml-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest bg-brand/10 text-brand border border-brand/30">
                  #{activeCategory}
                </span>
              )}
            </div>

            {/* Post Feed */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUsername={user?.username || null}
                    onNotificationCreated={() => {
                      if (user) {
                        fetchNotifications().then(setNotifications).catch(console.error);
                        fetchUnreadCount().then(setUnreadCount).catch(console.error);
                      }
                    }}
                  />
                )) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 border border-border rounded-xl flex flex-col items-center justify-center text-center px-8"
                  >
                    <p className="text-muted text-xs uppercase tracking-widest">No echoes in this frequency.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* End of Feed Message */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="py-12 border border-[#1F1F1F] bg-[#070707] rounded-xl flex flex-col items-center justify-center text-center px-8"
            >
              <div className="w-16 h-16 border border-brand/20 rounded-full mb-6 flex items-center justify-center text-brand/50">
                <div className="w-8 h-8 border border-brand/40 rotate-45" />
              </div>
              <h3 className="font-serif font-light text-2xl text-white italic mb-3">You've reached the end of the void</h3>
              <p className="text-muted max-w-xs text-xs uppercase tracking-widest leading-relaxed mb-8">
                Echo is an anonymous space. Contribute to the silence.
              </p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-primary">Return to Top</button>
            </motion.div>
          </section>

          {/* Sidebar Section */}
            <Sidebar activeCategory={activeCategory} onCategorySelect={setActiveCategory} />
          </main>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#070707] relative overflow-hidden">
          {/* Abstract locked background background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[120px] animate-pulse delay-700" />
          </div>
          <div className="relative z-10 text-center">
            <Lock className="w-12 h-12 text-brand/20 mx-auto mb-4" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold">Access Restricted</p>
          </div>
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {activeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              // Prevent closing the auth screen if user is not authenticated
              if (user || activeOverlay !== 'auth') {
                setActiveOverlay(null);
              }
            }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* SEARCH */}
              {activeOverlay === 'search' && (
                <div className="p-2">
                  <div className="flex items-center gap-4 p-4 border-b border-border">
                    <Search className="text-brand" size={24} />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Transcending the void..."
                      className="flex-1 bg-transparent border-none text-xl text-white outline-none placeholder-[#444] font-serif italic"
                    />
                    <button onClick={() => setActiveOverlay(null)} className="text-muted hover:text-white transition-colors">ESC</button>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted mb-4 font-bold">Suggested Echoes</p>
                    <div className="flex flex-col gap-2">
                      {['minimalism', 'webdev', 'antigravity', 'void'].map(tag => (
                        <button key={tag} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-sm text-text-secondary hover:text-brand transition-colors text-left">
                          <span className="text-muted">#</span> {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NEW POST */}
              {activeOverlay === 'newPost' && (
                <div className="p-6">
                  <h2 className="text-2xl font-serif italic text-white mb-6">Contribute to the Void</h2>
                  <div className="flex flex-col gap-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Echo Title"
                      value={newPostForm.title}
                      onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                      className="bg-[#121212] border border-border rounded-lg px-4 py-3 text-lg text-white outline-none focus:border-brand transition-colors"
                    />
                    <textarea 
                      placeholder="Speak your mind..."
                      value={newPostForm.content}
                      onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                      className="bg-[#121212] border border-border rounded-lg px-4 py-3 h-36 text-white outline-none focus:border-brand transition-colors resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Category (e.g. webdev, minimalism)"
                      value={newPostForm.category}
                      onChange={(e) => setNewPostForm({ ...newPostForm, category: e.target.value })}
                      className="bg-[#121212] border border-border rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-brand transition-colors"
                    />
                    <div className="flex justify-end gap-3 mt-2">
                      <button onClick={() => setActiveOverlay(null)} className="px-6 py-2 text-muted hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
                        Cancel
                      </button>
                      <button
                        onClick={handleNewPost}
                        disabled={!newPostForm.title.trim() || !newPostForm.content.trim()}
                        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Post Echo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeOverlay === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-2xl font-serif italic text-white mb-6">Notifications</h2>
                  
                  {notifications.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                      {notifications.map(notif => (
                        <div key={notif.id} className="bg-[#121212] border border-border p-4 rounded-lg flex items-start gap-4">
                          <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0 text-brand">
                            <MessageSquare size={18} />
                          </div>
                          <div>
                            <p className="text-sm text-text-primary mb-1">
                              <span className="font-bold text-white">u/{notif.commenterUsername}</span> 
                              {notif.type === 'comment' && ' commented on your echo: '}
                              {notif.type === 'upvote' && ' upvoted your echo: '}
                              {notif.type === 'downvote' && ' downvoted your echo: '}
                              <span className="font-serif italic">"{notif.postTitle}"</span>
                            </p>
                            <p className="text-[10px] text-muted uppercase tracking-widest">{notif.createdAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bell size={40} className="text-brand/30 mb-4" />
                      <p className="text-muted text-xs uppercase tracking-widest">The void is silent.</p>
                      <p className="text-muted/50 text-[10px] uppercase tracking-widest mt-1">No notifications yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* MESSAGES */}
              {activeOverlay === 'messages' && (
                <div className="p-6">
                  <h2 className="text-2xl font-serif italic text-white mb-6">Messages</h2>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare size={40} className="text-brand/30 mb-4" />
                    <p className="text-muted text-xs uppercase tracking-widest">No messages in the void.</p>
                    <p className="text-muted/50 text-[10px] uppercase tracking-widest mt-1">Direct messaging coming soon.</p>
                  </div>
                </div>
              )}

              {/* SETTINGS */}
              {activeOverlay === 'settings' && (
                <div className="p-6">
                  <h2 className="text-2xl font-serif italic text-white mb-8">System Settings</h2>
                  <div className="space-y-8">
                    {/* Color Picker */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                        <Palette size={14} className="text-brand" />
                        Accent Palette
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {THEME_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setBrandColor(color.value)}
                            className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                              brandColor === color.value 
                              ? 'bg-brand/5 border-brand ring-1 ring-brand' 
                              : 'bg-[#121212] border-border hover:border-muted'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: color.value }} />
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${brandColor === color.value ? 'text-brand' : 'text-muted'}`}>
                              {color.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="pt-8 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                          <Activity size={14} className="text-brand" />
                          Sub-Space Visibility
                        </div>
                        <div className="flex items-center gap-1 bg-border/50 p-1 rounded-lg">
                          <button
                            onClick={() => setUserStatus('active')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                              userStatus === 'active' 
                              ? 'bg-brand text-background shadow-lg' 
                              : 'text-muted hover:text-white'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            onClick={() => setUserStatus('inactive')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                              userStatus === 'inactive' 
                              ? 'bg-[#121212] text-white border border-border shadow-lg' 
                              : 'text-muted hover:text-white'
                            }`}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] text-muted leading-relaxed italic">
                        When inactive, your profile will appear offline to other observers in the void.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button onClick={() => setActiveOverlay(null)} className="btn-primary">
                        Commit Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE */}
              {activeOverlay === 'profile' && user && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                    <h2 className="text-2xl font-serif italic text-white">Your Profile</h2>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Edit Details */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-4">Edit Details</h3>
                      <div className="space-y-4">
                        <div className="relative group">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                          <input 
                            type="text" 
                            placeholder="Display Name"
                            value={profileForm.displayName}
                            onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                            className="w-full bg-[#121212] border border-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono text-sm"
                          />
                        </div>
                        <div className="relative group">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                          <input 
                            type="text" 
                            placeholder="Username"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            className="w-full bg-[#121212] border border-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono text-sm"
                          />
                        </div>
                        <button 
                          onClick={handleProfileUpdate}
                          disabled={!profileForm.displayName.trim() || !profileForm.username.trim()}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>

                    {/* Your Echos */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted mb-4">Your Echos</h3>
                      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                        {posts.filter(p => p.author === user.username).length > 0 ? (
                          posts.filter(p => p.author === user.username).map(post => (
                            <div key={post.id} className="bg-[#121212] border border-border p-3 rounded-lg text-sm text-white">
                              <p className="font-serif italic text-lg mb-1">{post.title}</p>
                              <div className="flex items-center gap-3 text-[10px] uppercase text-muted font-bold tracking-widest">
                                <span>{post.category}</span>
                                <span>{post.votes} Votes</span>
                                <span>{post.commentCount} Comments</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-muted text-xs uppercase tracking-widest">
                            No echos posted yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AUTH */}
              {activeOverlay === 'auth' && (
                <div className="p-8">
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mb-4">
                      <Shield className="text-brand" size={32} />
                    </div>
                    <h2 className="text-3xl font-serif italic text-white text-center">
                      {authMode === 'login' ? 'Login to the Void' : 'Join the Silence'}
                    </h2>
                    <p className="text-muted text-xs uppercase tracking-[0.2em] mt-2">
                      Authentication Required
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                        {authError}
                      </div>
                    )}
                    {authSuccess && (
                      <div className="bg-brand/10 border border-brand/20 p-3 rounded-lg text-brand text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <CheckCircle2 size={14} />
                        {authSuccess}
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {authMode === 'signup' && (
                        <div className="relative group">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                          <input 
                            required
                            type="text" 
                            placeholder="Display Name"
                            value={authForm.displayName}
                            onChange={(e) => setAuthForm({ ...authForm, displayName: e.target.value })}
                            className="w-full bg-[#121212] border border-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono text-sm"
                          />
                        </div>
                      )}
                      
                      <div className="relative group">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                        <input 
                          required
                          type="text" 
                          placeholder="Username"
                          value={authForm.username}
                          onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                          className="w-full bg-[#121212] border border-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono text-sm"
                        />
                      </div>

                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                        <input 
                          required
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Password"
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          className="w-full bg-[#121212] border border-border rounded-lg pl-10 pr-12 py-3 text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full btn-primary !py-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="group-hover:translate-x-1 transition-transform">
                            {authMode === 'login' ? 'Initiate Session' : 'Create Identity'}
                          </span>
                          <span className="opacity-50">→</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
                    <p className="text-muted text-[10px] uppercase tracking-widest">
                      {authMode === 'login' ? "No identity yet?" : "Already part of the void?"}
                    </p>
                    <button 
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'signup' : 'login');
                        setAuthError('');
                        setAuthSuccess('');
                        setShowPassword(false);
                      }}
                      className="text-brand hover:text-white text-xs font-bold uppercase tracking-widest transition-colors underline underline-offset-4 decoration-brand/30"
                    >
                      {authMode === 'login' ? 'Register New Ghost' : 'Back to Login'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
