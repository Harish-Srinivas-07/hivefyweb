"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-180px)]">
      <div className="spotify-spinner"></div>
      <style jsx>{`
        .spotify-spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #1DB954;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
