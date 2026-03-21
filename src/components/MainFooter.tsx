import React from 'react';
import Image from 'next/image';

const MainFooter = () => {
  return (
    <footer className="mt-20 px-4 md:px-8 pb-4 border-t border-white/5 pt-12 font-spotify">
      <div className="max-w-7xl mx-auto mb-10">
        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-subdued opacity-60">Credits</h2>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-2">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Harish Srinivas <span className="text-primary text-lg">👋</span>
          </h2>
          <p className="text-[12px] font-bold text-text-subdued tracking-[0.2em] uppercase">Software Developer</p>
          
          <div className="flex items-center gap-8 mt-5">
            <SocialLink href="https://harishsrinivas.netlify.app" icon="/assets/icons/logo.png" label="Portfolio" />
            <SocialLink href="https://linkedin.com/in/harishsrinivas-sr" icon="/assets/icons/linkedin.png" label="LinkedIn" />
            <SocialLink href="https://github.com/Harish-Srinivas-07" icon="/assets/icons/github.png" label="GitHub" />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-5 text-center md:text-right">
          <div className="flex flex-col items-center md:items-end gap-2">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Support Hivefy</h3>
            <p className="text-[10px] text-text-subdued font-bold mb-1 opacity-70">If you like this project, consider giving it a star on GitHub!</p>
            <a 
              href="https://github.com/Harish-Srinivas-07/hivefyweb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-2.5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl hover:shadow-[#1db954]/20"
            >
              <Image src="/assets/icons/github.png" alt="" width={20} height={20} className="group-hover:rotate-[360deg] transition-transform duration-700" />
              <span>Star on GitHub</span>
              <span className="text-sm leading-none pt-0.5">★</span>
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-subdued pt-2 opacity-80">
            <div className="flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} Hivefy</span>
              <span className="w-1 h-1 rounded-full bg-white/10"></span>
              <span className="flex items-center gap-1.5 pt-0.5">
                Made with <Image src="/assets/icons/heart.png" alt="" width={14} height={14} className="brightness-110" /> in India
              </span>
            </div>
            <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default">
              <span>Next.js</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>Tailwind</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <a 
                href="https://github.com/sumitkolhe/jiosaavn-api" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors cursor-pointer"
              >
                JioSaavn API
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="group flex items-center gap-2 opacity-50 hover:opacity-100 transition-all duration-300 transform"
    title={label}
  >
    <Image src={icon} alt={label} width={36} height={36} className="invert brightness-200" />
  </a>
);

export default MainFooter;
