import React from 'react';
import Image from 'next/image';

const MobileAppBanner = () => {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#050505] via-[#121212] to-[#1ed760]/10 p-8 md:p-12 border border-white/5 shadow-2xl flex flex-col gap-8 group my-12 font-spotify">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Top Section: Branding */}
      <div className="relative z-10 flex flex-col items-center md:items-start gap-4 text-center md:text-left">
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transform transition-transform group-hover:scale-105">
           <Image src="/assets/icons/logo.png" alt="Hivefy" width={64} height={64} className="object-contain transition-all" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Hivefy for Android</h2>
          <p className="text-text-subdued text-sm md:text-base font-bold leading-relaxed max-w-2xl">
            <span className="text-[#1ed760]">Join 1,000+ music lovers.</span> <br className="hidden md:block" /> A FOSS, Flutter-powered, Spotify-style, ad-free music app built to prove that great design and open code can coexist beautifully.
          </p>
        </div>
      </div>

      {/* Grid: What makes it special */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 px-2">
         <FeatureItem emoji="🎨" text="Spotify-level UI/UX — dynamic, fluid, and designed to feel alive" />
         <FeatureItem emoji="🎧" text="Powerful player — swipe controls, transitions, and background playback" />
         <FeatureItem emoji="💾" text="Offline-First — play songs, albums & playlists anytime, anywhere" />
         <FeatureItem emoji="📦" text="Download Manager — save tracks for offline listening" />
         <FeatureItem emoji="🔍" text="Unified Search — find albums, artists & playlists with smart filters" />
         <FeatureItem emoji="🔄" text="Daily Fresh Fetches — trending songs & charts updated daily" />
      </div>

      <div className="relative z-10 flex flex-col items-center md:items-start gap-6 mt-4">
        <a 
          href="https://github.com/Harish-Srinivas-07/hivefy/releases" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-12 py-4 bg-[#1ed760] text-black rounded-full font-black text-sm md:text-[15px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_8px_32px_rgba(30,215,96,0.3)]"
        >
          Get the app
        </a>

        <div className="flex flex-col gap-1 items-center md:items-start opacity-60">
           <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">It&apos;s not just a music player</p>
           <p className="text-[10px] text-text-subdued max-w-md text-center md:text-left leading-relaxed font-bold">
              Recreating that Spotify feeling for the Flutter community. No ads. No clutter. Just pure, beautiful music. 🎶
           </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ emoji, text }: { emoji: string; text: string }) => (
  <div className="flex items-start gap-3">
    <span className="text-base leading-none pt-0.5">{emoji}</span>
    <span className="text-[12px] font-bold text-text-subdued leading-tight opacity-70 group-hover:opacity-100 transition-opacity">
      {text}
    </span>
  </div>
);

export default MobileAppBanner;
