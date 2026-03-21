import React from 'react';
import { SaavnAPI } from '@/services/api';
import MediaDetailView from '@/components/MediaDetailView';

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`[PlaylistPage] Fetching playlist ID: ${id}`);
  
  let playlist = await SaavnAPI.fetchPlaylistById(id);
  
  if (playlist && playlist.songCount && playlist.songCount > (playlist.songs?.length || 0)) {
    playlist = await SaavnAPI.fetchPlaylistById(id, undefined, 0, Number(playlist.songCount));
  }
  
  if (!playlist) {
    console.warn(`[PlaylistPage] Playlist ID ${id} NOT FOUND`);
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-400">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
          <p>We couldn't find the playlist you're looking for.</p>
        </div>
      </div>
    );
  }

  return <MediaDetailView data={playlist} type="playlist" />;
}
