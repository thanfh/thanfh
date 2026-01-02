
import React from 'react';
import { 
  Instagram, Linkedin, Facebook, Send, Mail, FileText, Twitter, Github, 
  Dribbble, Youtube, Globe, Video 
} from 'lucide-react';
import { Profile } from '../types';
import InteractiveCat from './InteractiveCat';

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

interface FooterProps {
  profile?: Profile;
  uiText?: Record<string, string>;
}

const Footer: React.FC<FooterProps> = ({ profile, uiText }) => {
  const currentYear = new Date().getFullYear();
  if (!profile) return null;

  return (
    <footer id="contact" className="bg-neutral-50 dark:bg-neutral-950 py-6 md:pt-8 md:pb-6 border-t border-neutral-300 dark:border-neutral-900 transition-colors duration-300">
      <div className="w-full px-4 md:px-12 2xl:px-24 4xl:px-32 mx-auto">
        <div className="flex flex-row justify-between items-end mb-6 md:mb-8 gap-2 md:gap-8">
          <div className="flex flex-col items-start">
            <h3 className="text-2xl md:text-5xl 3xl:text-7xl font-semibold text-neutral-900 dark:text-white mb-4 md:mb-6">
                {uiText?.footer_title || "Let's work together."}
            </h3>
            
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
              <a href={`mailto:${profile.email}`} className="text-lg md:text-xl 3xl:text-2xl text-neutral-800 dark:text-neutral-400 hover:text-black dark:hover:text-white border-b border-neutral-400 dark:border-neutral-800 pb-1">
                {profile.email}
              </a>

              <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm md:text-base 3xl:text-lg text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-mono uppercase tracking-widest">
                <FileText size={18} className="3xl:w-6 3xl:h-6" />
                Resume
              </a>

              <div className="flex gap-2">
                {profile.socials.map((social) => {
                  const Icon = iconMap[social.iconName] || Mail;
                  return (
                    <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 hover:bg-black hover:text-white transition-all" title={social.platform}>
                      <Icon size={18} className="3xl:w-6 3xl:h-6" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="relative flex-shrink-0 z-10 translate-y-[30px] md:translate-y-[44px]">
              <InteractiveCat />
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 md:pt-6 border-t border-neutral-300 dark:border-neutral-900 text-neutral-600 text-xs md:text-sm 3xl:text-base">
          <p>&copy; {currentYear} {profile.name}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
