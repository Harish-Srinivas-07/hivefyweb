import { NextResponse } from 'next/server';
import { SaavnAPI } from '@/services/api';

// Securely redirects to the direct JioSaavn CDN URL instead of server render
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get('id');

  if (!songId) {
    return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
  }

  try {
    const songs = await SaavnAPI.getSongDetails([songId]);
    if (!songs || songs.length === 0 || !songs[0].downloadUrls || songs[0].downloadUrls.length === 0) {
      return NextResponse.json({ error: 'Song not found or no audio available' }, { status: 404 });
    }

    const audioUrl = songs[0].downloadUrls[songs[0].downloadUrls.length - 1].url;

    // Redirect to cdn 302
    return NextResponse.redirect(audioUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error(`[AudioStreamProxy Error]`, error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
