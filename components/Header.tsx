
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NAV_LINKS } from '../constants';
import { Profile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Headphones, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  profile?: Profile;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

const Header: React.FC<HeaderProps> = ({ profile, isMusicPlaying, toggleMusic }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCurrent = (href: string) => {
    if (href === 'home' || href === '/') return location.pathname === '/';
    return location.pathname.startsWith(`/${href}`);
  };

  const handleGmailClick = () => {
    const emailTo = profile?.email || "hello.thanfh@gmail.com";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailTo}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 w-full z-[90] flex items-center border-b bg-white/90 dark:bg-neutral-950/90 backdrop-blur-2xl h-[40px] md:h-[48px] 3xl:h-[90px] 4xl:h-[128px] border-neutral-200 dark:border-neutral-800 shadow-sm supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60 transition-all duration-300"
      >
        <div className="w-full px-4 md:px-12 2xl:px-24 4xl:px-40 mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link 
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 group z-50"
          >
            <span className="text-xs md:text-sm 3xl:text-3xl 4xl:text-6xl font-bold tracking-[0.1em] 4xl:tracking-[0.05em] uppercase text-neutral-900 dark:text-white group-hover:opacity-70 transition-opacity">
              {profile?.name || "PORTFOLIO"}
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 3xl:gap-16 4xl:gap-32">
            {NAV_LINKS.map((link) => {
                const isActive = isCurrent(link.href);
                const toPath = link.href === 'home' ? '/' : `/${link.href}`;

                return (
                  <Link 
                    key={link.label} 
                    to={toPath}
                    className={`relative text-[10px] 3xl:text-lg 4xl:text-3xl font-mono uppercase tracking-[0.15em] transition-colors py-1 ${
                      isActive 
                        ? 'text-neutral-900 dark:text-white font-semibold' 
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-line"
                        className="absolute -bottom-[2px] 4xl:-bottom-[6px] left-0 w-full h-[1px] 4xl:h-[3px] bg-neutral-900 dark:bg-white"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
            })}
            
            <div className="w-px h-3 3xl:h-6 4xl:h-10 bg-neutral-300 dark:bg-neutral-800 mx-2" />
            
            <div className="flex items-center gap-3 3xl:gap-8 4xl:gap-16">
                <button
                    onClick={toggleMusic}
                    className={`transition-colors flex items-center justify-center ${
                        isMusicPlaying 
                        ? 'text-neutral-900 dark:text-white' 
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                    title={isMusicPlaying ? "Pause Lofi" : "Play Lofi"}
                >
                    <Headphones size={14} className={`3xl:w-6 3xl:h-6 4xl:w-12 4xl:h-12 ${isMusicPlaying ? "animate-pulse" : ""}`} strokeWidth={isMusicPlaying ? 2 : 1.5} />
                </button>

                <button
                    onClick={handleGmailClick}
                    className="text-neutral-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                    title="Send me an email via Gmail"
                >
                    <Mail size={14} strokeWidth={1.5} className="3xl:w-6 3xl:h-6 4xl:w-12 4xl:h-12"/>
                </button>
            </div>
          </nav>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center gap-4 z-50">
            <button 
                onClick={toggleMusic} 
                className={`transition-colors ${
                    isMusicPlaying 
                    ? 'text-neutral-900 dark:text-white animate-pulse' 
                    : 'text-neutral-900 dark:text-neutral-200 opacity-60'
                }`}
            >
                <Headphones size={16} strokeWidth={1.5} />
            </button>

            <button 
                onClick={handleGmailClick} 
                className="text-neutral-900 dark:text-neutral-200 opacity-60 hover:opacity-100"
            >
                <Mail size={16} strokeWidth={1.5} />
            </button>

            <button className="text-neutral-900 dark:text-neutral-200 ml-1" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU PORTAL */}
      {createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 w-full h-full bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-xl flex flex-col items-center justify-center z-[1000]"
            >
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="absolute top-6 right-6 p-4 text-neutral-900 dark:text-white hover:rotate-90 transition-transform duration-300"
              >
                  <X size={24} strokeWidth={1} />
              </button>
              
              <motion.nav 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-8"
              >
                <Link 
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-3xl font-light uppercase tracking-widest transition-all ${location.pathname === '/' ? 'text-neutral-900 dark:text-white scale-110 font-medium' : 'text-neutral-400 dark:text-neutral-600'}`}
                >
                    Home
                </Link>

                {NAV_LINKS.map((link) => {
                    const toPath = link.href === 'home' ? '/' : `/${link.href}`;
                    const isActive = isCurrent(link.href);
                    return (
                        <Link 
                            key={link.label} 
                            to={toPath} 
                            onClick={() => setMobileMenuOpen(false)}
                            className={`text-3xl font-light uppercase tracking-widest transition-all ${isActive ? 'text-neutral-900 dark:text-white scale-110 font-medium' : 'text-neutral-400 dark:text-neutral-600'}`}
                        >
                            {link.label}
                        </Link>
                    );
                })}

                <button
                    onClick={handleGmailClick}
                    className="mt-8 px-6 py-2 border border-neutral-300 dark:border-neutral-700 rounded-full flex items-center gap-3 text-neutral-500 dark:text-neutral-400 uppercase tracking-widest text-xs"
                >
                    <Mail size={14} /> Send Mail
                </button>
              </motion.nav>

              <div className="absolute bottom-12 text-[10px] font-mono text-neutral-400 uppercase tracking-[0.2em]">
                  {profile?.name || "Portfolio"} © {new Date().getFullYear()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Header;
