import React from 'react';
import { SaavnAPI } from '@/services/api';
import MediaDetailView from '@/components/MediaDetailView';

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`[AlbumPage] Fetching album details for ID: ${id}`);
  
  let album = await SaavnAPI.fetchAlbumById(id);
  
  const detectedCount = album?.songCount || album?.songIds?.length || 0;
  if (album && detectedCount > (album.songs?.length || 0)) {
    album = await SaavnAPI.fetchAlbumById(id, undefined, 0, Number(detectedCount));
  }
  
  if (!album) {
    console.warn(`[AlbumPage] Album with ID ${id} NOT FOUND`);
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Album not found</h2>
          <p>We couldn't find the album you're looking for.</p>
        </div>
      </div>
    );
  }

  return <MediaDetailView data={album} type="album" />;
}
