import MainContent from "@/components/MainContent";
import { SaavnAPI, LatestSaavnFetcher } from "@/services/api";
import { Suspense } from "react";
import Loading from "./loading";

async function HomeContent() {
  // Fetch required data based on Dart Dashboard logic
  const [
    latestPlaylists,
    albums,
    loveRes,
    partyRes,
    artistSearchRes
  ] = await Promise.all([
    LatestSaavnFetcher.getLatestPlaylists("tamil", 30, 50),
    LatestSaavnFetcher.getLatestAlbums("tamil", 30, 50),
    SaavnAPI.searchPlaylists("love tamil", 0, 20),
    SaavnAPI.searchPlaylists("party tamil", 0, 20),
    SaavnAPI.searchArtists("top artists tamil", 0, 20),
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

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}
