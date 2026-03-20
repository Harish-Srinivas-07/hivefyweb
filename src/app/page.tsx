import MainContent from "@/components/MainContent";
import { SaavnAPI, LatestSaavnFetcher } from "@/services/api";
import { cookies } from "next/headers";
import { MusicLanguage } from "@/store/languageStore";

export default async function Home() {
  const cookieStore = await cookies();
  const language = (cookieStore.get('music-language')?.value as MusicLanguage) || 'tamil';

  // Fetch required data directly in the server component
  const [
    latestPlaylists,
    albums,
    loveRes,
    partyRes,
    artistSearchRes
  ] = await Promise.all([
    LatestSaavnFetcher.getLatestPlaylists(language, 30, 50).catch(() => []),
    LatestSaavnFetcher.getLatestAlbums(language, 30, 50).catch(() => []),
    SaavnAPI.searchPlaylists(`love ${language}`, 0, 20).catch(() => null),
    SaavnAPI.searchPlaylists(`party ${language}`, 0, 20).catch(() => null),
    SaavnAPI.searchArtists(`latest ${language} artists`, 0, 20).catch(() => null),
  ]);

  const lovePlaylists = loveRes?.results || [];
  const partyPlaylists = partyRes?.results || [];
  const artists = (artistSearchRes as any)?.results || [];
 
  const midPlaylist = Math.floor(latestPlaylists.length / 2);
  const topLatest = latestPlaylists.slice(0, midPlaylist).sort(() => 0.5 - Math.random());
  const fresh = latestPlaylists.slice(midPlaylist).sort(() => 0.5 - Math.random());
  
  const midAlbum = Math.floor(albums.length / 2);
  const topLatestAlbum = albums.slice(0, midAlbum).sort(() => 0.5 - Math.random());
  const freshAlbum = albums.slice(midAlbum).sort(() => 0.5 - Math.random());

  const partyShuffled = [...partyPlaylists].sort(() => 0.5 - Math.random());
  const loveShuffled = [...lovePlaylists].sort(() => 0.5 - Math.random());
  const freqRecentPlaylists = [...topLatest, ...fresh].sort(() => 0.5 - Math.random()).slice(0, 8);

  return (
    <MainContent 
      gridPlaylists={freqRecentPlaylists}
      topLatest={topLatest}
      topLatestAlbum={topLatestAlbum}
      fresh={fresh}
      freshAlbum={freshAlbum}
      party={partyShuffled}
      love={loveShuffled}
      artists={artists}
    />
  );
}
