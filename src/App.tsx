/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import PostCard from "./components/PostCard";
import Sidebar from "./components/Sidebar";
import { MOCK_POSTS } from "./mockData";
import { Post, User as UserType } from "./types";
import { Image, Link2, Layout, Search, Palette, Activity, Lock, User as UserIcon, Shield } from "lucide-react";
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

export default function App() {
  const [posts] = useState<Post[]>(MOCK_POSTS);
  const [activeOverlay, setActiveOverlay] = useState<'search' | 'newPost' | 'settings' | 'auth' | null>(null);
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('echo_user'));
  const [brandColor, setBrandColor] = useState('#00F5FF');
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');
  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('echo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', displayName: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Apply brand color to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', brandColor);
  }, [brandColor]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('echo_user', JSON.stringify(data.user));
        setActiveOverlay(null);
        setAuthForm({ username: '', password: '', displayName: '' });
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
        onLogout={handleLogout}
        userStatus={userStatus}
        user={user}
      />
      
      {/* Main content blurs when overlay is active */}
      <div className={`flex-1 flex flex-col transition-all duration-700 ease-in-out ${activeOverlay ? 'blur-xl brightness-50 pointer-events-none scale-[0.98]' : ''}`}>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-8">
          {/* Feed Section */}
          <section className="flex flex-col gap-6">
            
            {/* Feed Filter (Catchy Pills) */}
            <div className="flex items-center gap-3 mb-2 overflow-x-auto pb-2 no-scrollbar">
              {['Feed', 'Popular', 'New', 'Top'].map((filter, i) => (
                <motion.button
                  key={filter}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                    i === 0 
                    ? 'bg-[#121212] text-brand border border-brand' 
                    : 'text-muted border border-border hover:text-text-primary hover:border-muted bg-transparent'
                  }`}
                >
                  {filter === 'Feed' && <span className="text-lg leading-none">◇</span>}
                  {filter === 'Popular' && <span className="text-lg leading-none">◈</span>}
                  {filter === 'New' && <span className="text-lg leading-none">✨</span>}
                  {filter}
                </motion.button>
              ))}
            </div>

            {/* Post Feed */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </AnimatePresence>
            </div>

            {/* Initial Experience Message */}
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
              <button className="btn-primary">Return to Top</button>
            </motion.div>
          </section>

          {/* Sidebar Section */}
          <Sidebar />
        </main>
      </div>

      {/* Dynamic Island Overlays - Outside the blurred content */}
      <AnimatePresence>
        {activeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveOverlay(null)}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
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
                    <button 
                      onClick={() => setActiveOverlay(null)}
                      className="text-muted hover:text-white transition-colors"
                    >
                      ESC
                    </button>
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

              {activeOverlay === 'newPost' && (
                <div className="p-6">
                  <h2 className="text-2xl font-serif italic text-white mb-6">Contribute to the Void</h2>
                  <div className="flex flex-col gap-4">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Echo Title"
                      className="bg-[#121212] border border-border rounded-lg px-4 py-3 text-lg text-white outline-none focus:border-brand transition-colors"
                    />
                    <textarea 
                      placeholder="Speak your mind..."
                      className="bg-[#121212] border border-border rounded-lg px-4 py-3 h-48 text-white outline-none focus:border-brand transition-colors resize-none"
                    />
                    <div className="flex justify-end gap-3 mt-2">
                      <button 
                        onClick={() => setActiveOverlay(null)}
                        className="px-6 py-2 text-muted hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                      >
                        Cancel
                      </button>
                      <button className="btn-primary">
                        Post Echo
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                            <div 
                              className="w-8 h-8 rounded-full shadow-lg" 
                              style={{ backgroundColor: color.value }}
                            />
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                              brandColor === color.value ? 'text-brand' : 'text-muted'
                            }`}>
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
                      <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed italic text-muted">
                        When inactive, your profile will appear offline to other observers in the void.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        onClick={() => setActiveOverlay(null)}
                        className="btn-primary"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                          type="password" 
                          placeholder="Password"
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          className="w-full bg-[#121212] border border-border rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all font-mono text-sm"
                        />
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

