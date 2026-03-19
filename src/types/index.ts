export interface SourceUrl {
  quality: string;
  url: string;
}

export interface SongMediaItem {
  id: string;
  name: string;
  title: string;
  type: string;
  url: string;
  images: SourceUrl[];
  description?: string;
  language?: string;
}

export interface Artist extends SongMediaItem {
  position?: number;
}

export interface Artists {
  primary?: Artist[];
  featured?: Artist[];
  all?: Artist[];
}

export interface Contributors extends Artists {}

export interface Song extends SongMediaItem {
  album?: string;
  primaryArtists?: string;
  singers?: string;
}

export interface SongDetail extends Song {
  year?: string;
  releaseDate?: string;
  duration?: string;
  label?: string;
  albumName?: string;
  explicitContent?: boolean;
  downloadUrls?: SourceUrl[];
  contributors?: Contributors;
}

export interface Playlist extends SongMediaItem {
  songCount?: number;
  explicitContent?: boolean;
  songs?: SongDetail[];
  artists?: Artists;
}

export interface Album extends SongMediaItem {
  artist?: string;
  year?: string;
  songIds?: string[];
  songs?: SongDetail[];
  label?: string;
  explicitContent?: boolean;
  artists?: Artists;
  downloadUrls?: SourceUrl[];
}

export interface SearchResult<T> {
  total: number;
  results: T[];
}

export interface GlobalSearch {
  songs: SearchResult<Song>;
  albums: SearchResult<Album>;
  artists: SearchResult<Artist>;
  playlists: SearchResult<Playlist>;
}

export interface ArtistDetails extends Artist {
  followerCount?: number;
  fanCount?: number;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: string[];
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  availableLanguages?: string[];
  isRadioPresent?: boolean;
  topSongs?: SongDetail[];
  topAlbums?: Album[];
  singles?: Album[];
  similarArtists?: Artist[];
}

export interface SearchPlaylistsResponse {
  total: number;
  start: number;
  results: Playlist[];
}

export interface SearchArtistsResponse {
  total: number;
  start: number;
  results: Artist[];
}

export interface LastQueueData {
  songs: SongDetail[];
  currentIndex: number;
}
