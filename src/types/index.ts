export interface SourceUrl {
  quality: string;
  url: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  image: SourceUrl[];
  label?: string;
  description?: string;
  language?: string;
  year?: string | number | null;
  explicitContent?: boolean;
  playCount?: number | string | null;
}

export interface ArtistMini {
  id: string;
  name: string;
  role: string;
  type: string;
  image: SourceUrl[];
  url: string;
}

export interface ArtistsGroup {
  primary: ArtistMini[];
  featured: ArtistMini[];
  all: ArtistMini[];
}

export interface SongDetail extends MediaItem {
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: ArtistsGroup;
  duration: number | null;
  releaseDate: string | null;
  hasLyrics: boolean;
  lyricsId: string | null;
  copyright: string | null;
  downloadUrl: SourceUrl[];
  title?: string;
  images?: SourceUrl[];
  downloadUrls?: SourceUrl[];
  artist?: string;
  albumName?: string;
}

export interface Album extends MediaItem {
  artists: ArtistsGroup;
  songCount?: number;
  songIds?: string[] | string;
  songs?: SongDetail[];
  title?: string;
  images?: SourceUrl[];
}

export interface Playlist extends MediaItem {
  songCount: number | null;
  songs?: SongDetail[];
  artists?: ArtistMini[];
  songIds?: string[] | string;
  title?: string;
  images?: SourceUrl[];
}

export interface ArtistDetails extends MediaItem {
  role?: string;
  followerCount?: number;
  fanCount?: number;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: { text: string; title: string }[];
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  availableLanguages?: string[];
  isRadioPresent?: boolean;
  topSongs?: SongDetail[];
  topAlbums?: Album[];
  singles?: Album[];
  similarArtists?: ArtistMini[];
  title?: string;
  images?: SourceUrl[];
}

export interface SearchResult<T> {
  total: number;
  start: number;
  results: T[];
}

export interface GlobalSearch {
  songs: SearchResult<any>;
  albums: SearchResult<any>;
  artists: SearchResult<any>;
  playlists: SearchResult<any>;
  topQuery: SearchResult<any>;
}

export interface LastQueueData {
  songs: SongDetail[];
  currentIndex: number;
}

export type SearchPlaylistsResponse = SearchResult<Playlist>;
export type SearchArtistsResponse = SearchResult<ArtistMini>;
export type Artist = ArtistMini;
