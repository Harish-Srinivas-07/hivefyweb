"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type MusicLanguage = 
  | 'tamil' |'hindi' | 'telugu' | 'english' | 'punjabi' 
  | 'marathi' | 'gujarati' | 'bengali' | 'kannada' 
  | 'bhojpuri' | 'malayalam' | 'sanskrit' | 'haryanvi' 
  | 'rajasthani' | 'odia' | 'assamese';

interface LanguageState {
  language: MusicLanguage;
  setLanguage: (lang: MusicLanguage) => void;
  availableLanguages: MusicLanguage[];
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'tamil', // Default based on user edits
      setLanguage: (lang) => set({ language: lang }),
      availableLanguages: [
        'tamil',
        'hindi',
        'telugu',
        'english',
        'punjabi',
        'marathi',
        'gujarati',
        'bengali',
        'kannada',
        'bhojpuri',
        'malayalam',
        'sanskrit',
        'haryanvi',
        'rajasthani',
        'odia',
        'assamese',
      ],
    }),
    {
      name: 'hivefy-language-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
