/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, MessageSquare, Shield, Zap } from 'lucide-react';
import Dither from './Dither';

const CARDS = [
  {
    id: 1,
    title: "Anonymous Threads",
    description: "Speak your mind without the baggage of a permanent record. Echo is about the content, not the actor.",
    icon: Shield,
    color: "text-brand"
  },
  {
    id: 2,
    title: "Instant Connection",
    description: "Join the flow of ideas in real-time. Upvote what matters, ignore the noise.",
    icon: Zap,
    color: "text-amber-500"
  },
  {
    id: 3,
    title: "Ecstatic Design",
    description: "Experience social media in a minimalist, high-contrast environment designed for focus.",
    icon: Sparkles,
    color: "text-purple-500"
  }
];

interface SplashScreenProps {
  onEnter: (mode: 'login' | 'signup') => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [index, setIndex] = useState(0);

  const nextCard = () => setIndex((prev) => (prev + 1) % CARDS.length);
  const prevCard = () => setIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Dither 
          waveColor={[0.1, 0.5, 0.6]}
          waveAmplitude={0.15}
          waveFrequency={1.5}
          pixelSize={2}
          waveSpeed={0.03}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
        {/* Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-10 h-10 bg-brand rounded-sm flex items-center justify-center text-background">
            <div className="w-5 h-5 border-2 border-background rotate-45" />
          </div>
          <span className="text-3xl font-bold tracking-tighter text-white">ECHO</span>
        </motion.div>

        {/* Swipeable Cards Container */}
        <div className="relative w-full max-w-sm flex items-center mb-8">
          {/* Desktop Navigation Buttons */}
          <button 
            onClick={prevCard}
            className="absolute -left-16 hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-border bg-card/50 text-muted hover:text-brand hover:border-brand transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={nextCard}
            className="absolute -right-16 hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-border bg-card/50 text-muted hover:text-brand hover:border-brand transition-all"
          >
            <ChevronRight size={20} />
          </button>

          <div className="relative w-full aspect-[4/5] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={CARDS[index].id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) nextCard();
                  if (info.offset.x > 50) prevCard();
                }}
                className="absolute inset-0 bg-[#0F0F0F] border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl cursor-grab active:cursor-grabbing"
              >
                {(() => {
                  const Icon = CARDS[index].icon;
                  return (
                    <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 ${CARDS[index].color}`}>
                      <Icon size={32} />
                    </div>
                  );
                })()}
                <h3 className="text-2xl font-serif italic text-white mb-4">{CARDS[index].title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed uppercase tracking-widest text-[11px]">
                  {CARDS[index].description}
                </p>
                
                <div className="mt-auto flex gap-1.5">
                  {CARDS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-brand' : 'w-2 bg-border'}`} 
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={() => onEnter('signup')}
            className="btn-primary w-full !py-4"
          >
            Join the Silence
          </button>
          <button 
            onClick={() => onEnter('login')}
            className="w-full py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted hover:text-white transition-colors"
          >
            Already an observer
          </button>
        </div>

        <p className="mt-8 text-[9px] text-muted uppercase tracking-widest text-center">
          By entering the void, you agree to the laws of entropy.
        </p>
      </div>
    </div>
  );
}
