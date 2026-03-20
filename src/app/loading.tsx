"use client";

import React from 'react';

const SkeletonRow = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-8 w-48 bg-white/5 rounded-md" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-square w-full bg-white/5 rounded-lg" />
          <div className="h-4 w-3/4 bg-white/5 rounded" />
          <div className="h-3 w-1/2 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-16 flex items-center bg-white/5 rounded-md overflow-hidden">
        <div className="w-16 h-16 bg-white/10" />
        <div className="ml-4 h-4 w-24 bg-white/10 rounded" />
      </div>
    ))}
  </div>
);

export default function Loading() {
  return (
<div className="flex flex-col gap-10 p-6 pt-2 pb-32 mt-10">
       <GridSkeleton />
       
       <SkeletonRow />
       <SkeletonRow />
       <SkeletonRow />
    </div>
  );
}
