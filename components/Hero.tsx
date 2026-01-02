
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { 
  ArrowDown, Instagram, Linkedin, Facebook, Send, ArrowRight, 
  FileText, Twitter, Github, Mail, Dribbble, Youtube, Globe, Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Profile, HeroConfig } from '../types';

// Enhanced Icon Map
const iconMap: Record<string, React.ComponentType<any>> = {
  Instagram,
  Linkedin,
  Facebook,
  Telegram: Send,
  Twitter,
  Github,
  Mail,
  Dribbble,
  Youtube,
  Vimeo: Video,
  Globe,
  Behance: Globe,
  ArtStation: Globe,
  TikTok: Globe
};

interface HeroProps {
  profile: Profile;
  uiText: Record<string, string>;
  heroConfig?: HeroConfig;
}

// --- NEW STAGGERED ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const charVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: "0%",
    transition: {
      duration: 1,
      ease: [0.2, 1, 0.2, 1] // Luxurious ease curve
    }
  }
};

// Component to split text into characters for animation
const StaggeredText = ({ text, className = "", italic = false }: { text: string, className?: string, italic?: boolean }) => {
  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {text.split("").map((char, index) => (
        <motion.span 
          key={index} 
          variants={charVariants} 
          className={`inline-block ${char === " " ? "w-[0.3em]" : ""} ${italic ? "font-serif italic font-light text-neutral-300" : ""}`}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const Hero: React.FC<HeroProps> = ({ profile, uiText, heroConfig }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]); // Subtle zoom out

  const handleScrollDown = () => {
    document.getElementById('intro-manifesto')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMedia = (url: string, className: string) => {
    if (!url) return null;
    const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || (url.includes('cloudinary') && url.includes('/video/'));
    
    if (isVideo) {
      return (
        <video 
          src={url} 
          autoPlay 
          muted 
          loop 
          playsInline 
          className={`${className} object-cover`} 
        />
      );
    }
    return (
      <img 
        src={url} 
        alt="Hero Background" 
        className={`${className} object-cover`} 
      />
    );
  };

  const desktopUrl = heroConfig?.desktopUrl;
  const mobileUrl = heroConfig?.mobileUrl || desktopUrl;
  const overlayOpacity = heroConfig?.overlayOpacity ?? 0.6;

  return (
    <div className="flex flex-col w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
      <section ref={containerRef} id="home" className="relative h-screen w-full flex items-end pb-24 md:pb-32 2xl:pb-40 overflow-hidden bg-neutral-950">
        
        {/* Parallax Background Visuals */}
        <motion.div style={{ y: parallaxY, scale }} className="absolute inset-0 z-0">
          <div className="hidden md:block w-full h-full opacity-60" style={{ opacity: 1 - overlayOpacity }}>
             {desktopUrl && renderMedia(desktopUrl, "w-full h-full")}
          </div>
          <div className="block md:hidden w-full h-full opacity-60" style={{ opacity: 1 - overlayOpacity }}>
             {mobileUrl && renderMedia(mobileUrl, "w-full h-full")}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
        </motion.div>

        {/* Grid Aligned Content */}
        <div className="relative z-20 w-full px-4 md:px-12 2xl:px-24 4xl:px-32 mx-auto">
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 items-end">
            
            {/* Column 1-9: Main Title with Staggered Reveal */}
            <div className="col-span-6 md:col-span-9 4xl:col-span-8">
                <div className="flex flex-col gap-0 md:gap-2">
                    <div className="flex items-center gap-4 mb-6 md:mb-10 overflow-hidden">
                        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
                             <span className="inline-block py-1.5 px-4 border border-white/20 rounded-full bg-white/5 backdrop-blur-md text-[10px] md:text-xs 3xl:text-sm font-mono text-neutral-300 tracking-[0.2em] uppercase">
                                {profile.role}
                            </span>
                        </motion.div>
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 1.2 }} className="h-px w-24 bg-white/20 hidden md:block origin-left"></motion.div>
                    </div>
                    
                    {/* Typography: Staggered Character Reveal */}
                    <motion.h1 
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-[15vw] md:text-[11vw] 3xl:text-[160px] 4xl:text-[200px] leading-[0.85] font-bold text-white tracking-tighter flex flex-col items-start select-none mix-blend-screen"
                    >
                       {/* First Line: Digital */}
                       <div className="overflow-hidden pb-1 -mb-1">
                          <StaggeredText text="Digital" />
                       </div>
                       
                       {/* Second Line: Artisan (Indented) */}
                       <div className="overflow-hidden pb-1 -mb-1 ml-[10%]">
                           <StaggeredText text="Artisan" italic={true} />
                       </div>
                    </motion.h1>
                </div>
            </div>

            {/* Column 10-12: Meta Info & Actions */}
            <div className="col-span-6 md:col-span-3 4xl:col-span-4 flex flex-col items-start md:items-end justify-end h-full pb-2 md:pb-4 gap-8">
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.8, delay: 1.8 }}
                    className="flex flex-col items-start md:items-end gap-6"
                 >
                     <p className="text-neutral-400 text-sm md:text-base 3xl:text-lg max-w-xs 3xl:max-w-md text-left md:text-right leading-relaxed hidden md:block font-light tracking-wide">
                        Crafting immersive digital experiences at the intersection of technology, art, and human emotion.
                     </p>

                    <div className="flex flex-wrap gap-4 md:gap-6 items-center">
                        <div className="flex gap-4">
                            {profile.socials.map((social, idx) => {
                            const Icon = iconMap[social.iconName] || Globe;
                            return (
                                <a key={idx} href={social.url} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white transition-all p-2 border border-white/10 rounded-full hover:bg-white/10" title={social.platform}>
                                <Icon size={18} className="3xl:w-6 3xl:h-6" />
                                </a>
                            );
                            })}
                        </div>
                        <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-xs 3xl:text-sm font-bold uppercase tracking-wider hover:bg-emerald-300 transition-all">
                            <FileText size={14} className="3xl:w-5 3xl:h-5"/> Resume
                        </a>
                    </div>
                 </motion.div>
            </div>

          </div>
        </div>

        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer text-white/30 hover:text-white transition-colors" 
            onClick={handleScrollDown}
        >
           <ArrowDown size={24} className="animate-bounce 3xl:w-8 3xl:h-8" />
        </motion.div>
      </section>

      {/* Manifesto Section */}
      <section id="intro-manifesto" className="py-24 md:py-40 2xl:py-52 px-4 md:px-12 2xl:px-24 4xl:px-32 w-full mx-auto">
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 items-start">
             
             {/* Col 1-3: Sticky Label */}
             <div className="col-span-6 md:col-span-3">
                <div className="sticky top-32">
                    <span className="flex items-center gap-3 text-xs 3xl:text-sm font-mono uppercase tracking-[0.2em] text-neutral-500 mb-8">
                        <span className="w-8 h-px bg-neutral-400 dark:bg-neutral-600"></span>
                        {uiText.hero_about_me}
                    </span>
                     <div className="hidden md:flex flex-col gap-2 text-[10px] 3xl:text-xs font-mono text-neutral-400 uppercase tracking-wider">
                        <p>Based: Hanoi, VN</p>
                        <p>Exp: 8+ Years</p>
                    </div>
                </div>
             </div>

             {/* Col 4-12: Content */}
             <div className="col-span-6 md:col-span-9 3xl:col-span-8">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                    <h2 className="text-3xl md:text-5xl lg:text-7xl 3xl:text-8xl font-medium leading-[1.1] text-neutral-900 dark:text-white mb-16 tracking-tight font-serif max-w-5xl">
                       {profile.tagline}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-neutral-300 dark:border-neutral-800 pt-12">
                        <div className="text-neutral-700 dark:text-neutral-400 text-lg md:text-xl 3xl:text-2xl leading-relaxed font-light">
                            <p className="mb-8 max-w-2xl">{profile.bio}</p>
                            <div className="flex flex-wrap gap-2">
                                {['Blender', 'Houdini', 'React', 'TypeScript', 'WebGL', 'Figma'].map(tech => (
                                    <span key={tech} className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-full text-xs 3xl:text-sm font-mono text-neutral-500 uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-default">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col justify-between items-start h-full gap-8 pl-0 md:pl-12 md:border-l border-neutral-200 dark:border-neutral-800">
                             <p className="text-neutral-500 text-2xl 3xl:text-3xl font-serif italic max-w-md">"{uiText.hero_manifesto_quote}"</p>
                             <button onClick={() => navigate('/work')} className="group flex items-center gap-6 text-xl md:text-2xl 3xl:text-3xl font-light text-neutral-900 dark:text-white mt-auto">
                                <span className="border-b border-neutral-300 dark:border-neutral-700 pb-1 group-hover:border-black dark:group-hover:border-white transition-colors">{uiText.hero_view_all}</span>
                                <ArrowRight className="w-6 h-6 3xl:w-8 3xl:h-8 group-hover:translate-x-2 transition-transform" />
                             </button>
                        </div>
                    </div>
                </motion.div>
             </div>
          </div>
      </section>
    </div>
  );
};

export default Hero;
