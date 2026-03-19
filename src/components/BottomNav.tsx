"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden h-[64px] bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-[2000] pb-safe w-full">
      <NavItem href="/" icon="/assets/icons/home.png" label="Home" active={isCurrent('/')} />
      <NavItem href="/search" icon="/assets/icons/search.png" label="Search" active={isCurrent('/search')} />
      <NavItem href="/library" icon="/assets/icons/playlist.png" label="Library" active={isCurrent('/library')} />
    </div>
  );
}

const NavItem = ({ href, icon, label, active }: any) => (
  <Link href={href} className="flex flex-col items-center gap-1 group">
    <div className="relative">
      <Image 
        src={icon} 
        alt={label} 
        width={24} 
        height={24} 
        className={`transition-all duration-300 ${active ? 'invert brightness-125 opacity-100 scale-110' : 'invert opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`} 
      />
      {active && label !== 'Premium' && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </div>
    <span className={`text-[10px] font-bold transition-all duration-300 ${active ? 'text-white' : 'text-text-subdued group-hover:text-white'}`}>
      {label}
    </span>
  </Link>
);
