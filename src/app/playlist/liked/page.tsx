"use client";

import React from 'react';
import { useLikesStore } from '@/store/likesStore';
import MediaDetailView from '@/components/MediaDetailView';

export default function LikedSongsPage() {
  const { getLikedSongs } = useLikesStore();
  
  const likedSongs = getLikedSongs();

  const mockData: any = {
    id: 'liked',
    name: 'Liked Songs',
    title: 'Liked Songs',
    image: '/assets/icons/heart.png',
    images: [{ url: '/assets/icons/heart.png' }],
    songs: likedSongs.map(item => ({
      id: item.id,
      title: item.name,
      name: item.name,
      artist: item.artist,
      image: item.image,
      images: [{ url: item.image }],
      duration: 0, // We didn't store duration in LikedItem, maybe we should
      album: 'Liked collection'
    }))
  };

  return <MediaDetailView data={mockData} type="playlist" />;
}
