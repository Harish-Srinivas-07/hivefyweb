import {
  SearchPlaylistsResponse,
  SearchArtistsResponse,
  SongDetail,
  ArtistDetails,
  Playlist,
  GlobalSearch,
  Album
} from '@/types';

import { cacheService } from './cache';

const BASE_URL = "https://jiosaavn-c451wwyru-sumit-kolhes-projects-94a4846a.vercel.app";

const HEADERS = {
  "Accept": "application/json",
};

export const decodeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'");
};

const mapMediaItem = (item: any) => {
  if (!item) return item;
  const mapped = { ...item };
  if (item.name && !item.title) mapped.title = item.name;
  if (!item.name && item.title) mapped.name = item.title;
  
  // Handle artists mapping for singular artist field (used by UI components)
  if (item.artists && typeof item.artists === 'object' && !item.artist) {
    const primary = item.artists.primary;
    if (Array.isArray(primary) && primary.length > 0) {
      mapped.artist = primary[0].name || primary[0].title;
    }
  }

  // Recursive mapping for nested songs/albums
  if (Array.isArray(item.songs)) {
    item.songs = item.songs.map(mapMediaItem);
  }
  if (Array.isArray(item.topSongs)) {
    item.topSongs = item.topSongs.map(mapMediaItem);
  }
  if (Array.isArray(item.topAlbums)) {
    item.topAlbums = item.topAlbums.map(mapMediaItem);
  }
  
  return mapped;
};

const mapSearchResult = (data: any) => {
  if (!data) return data;
  const mapped = { ...data };
  if (Array.isArray(data.results)) {
    mapped.results = data.results.map(mapMediaItem);
  }
  return mapped;
};

export class SaavnAPI {
  
  static async searchPlaylists(query: string, page = 0, limit = 10): Promise<SearchPlaylistsResponse | null> {
    if (!query) return null;
    const cacheKey = `searchPlaylists_${query}_${page}_${limit}`;
    const cached = await cacheService.getCache<SearchPlaylistsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/api/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mappedData = mapSearchResult(json.data);
        await cacheService.setCache(cacheKey, mappedData);
        return mappedData as SearchPlaylistsResponse;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error fetching playlists for query "${query}":`, e.message || e);
    }
    return null;
  }

  static async searchArtists(query: string, page = 0, limit = 10): Promise<SearchArtistsResponse | null> {
    if (!query) return null;
    const cacheKey = `searchArtists_${query}_${page}_${limit}`;
    const cached = await cacheService.getCache<SearchArtistsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/api/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
         const mappedData = mapSearchResult(json.data);
         await cacheService.setCache(cacheKey, mappedData);
         return mappedData as SearchArtistsResponse;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in searchArtists for query "${query}":`, e.message || e);
    }
    return null;
  }

  static async searchSongs(query: string, page = 0, limit = 50): Promise<SongDetail[]> {
    if (!query) return [];
    const cacheKey = `searchSongs_${query}_${page}_${limit}`;
    const cached = await cacheService.getCache<SongDetail[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data && json.data.results) {
        const mappedResults = json.data.results.map(mapMediaItem);
        await cacheService.setCache(cacheKey, mappedResults);
        return mappedResults as SongDetail[];
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in searchSongs for query "${query}":`, e.message || e);
    }
    return [];
  }

  static async getSongDetails(ids?: string[], link?: string): Promise<SongDetail[]> {
    if ((!ids || ids.length === 0) && !link) {
      console.warn("getSongDetails: Either ids or link must be provided");
      return [];
    }
    
    const params = new URLSearchParams();
    if (ids && ids.length > 0) params.append('ids', ids.join(','));
    if (link) params.append('link', link);
    
    const cacheKey = `songDetails_${params.toString()}`;
    const cached = await cacheService.getCache<SongDetail[]>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/api/songs?${params.toString()}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mappedData = Array.isArray(json.data) ? json.data.map(mapMediaItem) : mapMediaItem(json.data);
        await cacheService.setCache(cacheKey, mappedData);
        return mappedData as SongDetail[];
      }
    } catch (e: any) {
      console.warn("[SaavnAPI] Error in getSongDetails:", e.message || e);
    }
    return [];
  }

  static async fetchArtistDetailsById(artistId: string, page = 0, songCount = 10, albumCount = 10, sortBy = "popularity", sortOrder = "desc"): Promise<ArtistDetails | null> {
    const cacheKey = `artist_${artistId}_${page}_${songCount}_${albumCount}_${sortBy}_${sortOrder}`;
    const cached = await cacheService.getCache<ArtistDetails>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/api/artists/${artistId}?page=${page}&songCount=${songCount}&albumCount=${albumCount}&sortBy=${sortBy}&sortOrder=${sortOrder}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mappedData = mapMediaItem(json.data);
        await cacheService.setCache(cacheKey, mappedData);
        return mappedData as ArtistDetails;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in fetchArtistDetailsById for ID ${artistId}:`, e.message || e);
    }
    return null;
  }

  static async fetchPlaylistById(playlistId?: string, link?: string, page = 0, limit = 10, sortBy = "popularity", sortOrder = "desc"): Promise<Playlist | null> {
    if (!playlistId && !link) {
      console.warn("fetchPlaylist: Need at least one of playlistId or link");
      return null;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });
    if (playlistId) params.append('id', playlistId);
    if (link) params.append('link', link);

    const cacheKey = `playlist_${params.toString()}`;
    const cached = await cacheService.getCache<Playlist>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${BASE_URL}/api/playlists?${params.toString()}`;
      console.log(`[SaavnAPI] Fetching Playlist: ${url}`);
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      console.log(`[SaavnAPI] Playlist response success: ${json.success}`);
      if (json.success && json.data) {
        const mappedData = mapMediaItem(json.data);
        await cacheService.setCache(cacheKey, mappedData);
        return mappedData as Playlist;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in fetchPlaylist for ID ${playlistId || link}:`, e.message || e);
    }
    return null;
  }

  static async globalSearch(query: string): Promise<GlobalSearch | null> {
    if (!query) return null;
    
    const cacheKey = `globalSearch_${query}`;
    const cached = await cacheService.getCache<GlobalSearch>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent(query)}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mappedData = {
          songs: mapSearchResult(json.data.songs),
          albums: mapSearchResult(json.data.albums),
          artists: mapSearchResult(json.data.artists),
          playlists: mapSearchResult(json.data.playlists),
        };
        await cacheService.setCache(cacheKey, mappedData);
        return mappedData as GlobalSearch;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in global search for query "${query}":`, e.message || e);
    }
    return null;
  }

  static async fetchAlbumById(albumId?: string, link?: string, page = 0, limit = 10): Promise<Album | null> {
    if (!albumId && !link) {
      console.warn("fetchAlbumById: Need either albumId or link");
      return null;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (albumId) params.append('id', albumId);
    if (link) params.append('link', link);
    
    const cacheKey = `album_${params.toString()}`;
    const cached = await cacheService.getCache<Album>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${BASE_URL}/api/albums?${params.toString()}`;
      console.log(`[SaavnAPI] Fetching Album: ${url}`);
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      console.log(`[SaavnAPI] Album response success: ${json.success}`);
      if (json.success && json.data) {
        const mappedData = mapMediaItem(json.data);
        await cacheService.setCache(cacheKey, mappedData);
        return mappedData as Album;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in fetchAlbumById for ID ${albumId || link}:`, e.message || e);
    }
    return null;
  }

  static async getSearchBoxSuggestions(query: string): Promise<string[]> {
    if (!query) return [];
    
    const cacheKey = `suggest_${query}`;
    const cached = await cacheService.getCache<string[]>(cacheKey);
    if (cached) return cached;

    const isClient = typeof window !== 'undefined';
    const url = isClient 
      ? `/api/suggestions?q=${encodeURIComponent(query)}`
      : `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;

    try {
      const fetchOptions: RequestInit = isClient ? { headers: { "Accept": "application/json" } } : { 
        headers: { 
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        } 
      };
      
      const res = await fetch(url, fetchOptions);
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const json = await res.json();
      
      // Proxy returns the list directly, Google returns [q, [list]]
      const results = isClient ? json : (Array.isArray(json) && Array.isArray(json[1]) ? json[1] : []);

      if (Array.isArray(results)) {
        const unescaped = (results as string[]).map(s => 
          s.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
        );
        await cacheService.setCache(cacheKey, unescaped, 3600);
        return unescaped;
      }
    } catch (e: any) {
      console.warn(`[SaavnAPI] Error in getSearchBoxSuggestions for query "${query}":`, e.message || e);
    }
    return [];
  }
}

export class LatestSaavnFetcher {
  static baseUrl = 'https://www.jiosaavn.com';

  private static capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /// ---------------- PLAYLIST FETCHER ----------------
  static async getLatestPlaylists(
    lang: string, 
    playlistLimit = 30, 
    perPlaylistSongCount = 50
  ): Promise<Playlist[]> {
    const cacheKey = `latest_${lang}_playlists`;
    const cached = await cacheService.getCache<Playlist[]>(cacheKey);
    if (cached) return cached;

    const urls = await this._fetchPlaylistUrls(lang);
    const selectedUrls = urls.slice(0, playlistLimit);
    const playlists: Playlist[] = [];

    for (const url of selectedUrls) {
      const playlist = await SaavnAPI.fetchPlaylistById(undefined, url, 0, perPlaylistSongCount);
      if (playlist && playlist.songs && playlist.songs.length > 0) {
        playlists.push(playlist);
      }
    }

    if (playlists.length > 0) {
      // Cache for 24h
      await cacheService.setCache(cacheKey, playlists, 24 * 60 * 60);
    }
    
    return playlists;
  }

  private static async _fetchPlaylistUrls(lang: string): Promise<string[]> {
    const url = `${this.baseUrl}/featured-playlists/${lang}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
      if (!res.ok) {
        console.warn(`Failed to fetch playlists for ${lang}`);
        return [];
      }
      const html = await res.text();
      const searchStr = `${this.capitalize(lang)} Music Playlists`;
      const startIndex = html.indexOf(searchStr);
      if (startIndex === -1) return [];

      const section = html.substring(startIndex);
      const regex = /href="(\/featured\/[^"]+)"/g;
      const matches = Array.from(section.matchAll(regex));
      
      const uniqueUrls = new Set(matches.map(m => `${this.baseUrl}${m[1]}`));
      return Array.from(uniqueUrls);
    } catch (e) {
      console.warn(`Error fetching playlist URLs for ${lang}`, e);
      return [];
    }
  }

  /// ---------------- ALBUM FETCHER ----------------
  static async getLatestAlbums(
    lang: string, 
    albumLimit = 30, 
    perAlbumSongCount = 50
  ): Promise<Album[]> {
    const cacheKey = `latest_${lang}_albums`;
    const cached = await cacheService.getCache<Album[]>(cacheKey);
    if (cached) return cached;

    const urls = await this._fetchAlbumUrls(lang);
    const selectedUrls = urls.slice(0, albumLimit);
    const albums: Album[] = [];

    for (const url of selectedUrls) {
      const album = await SaavnAPI.fetchAlbumById(undefined, url, 0, perAlbumSongCount);
      if (album && album.songs && album.songs.length > 0) {
        albums.push(album);
      }
    }

    if (albums.length > 0) {
      // Cache for 24h
      await cacheService.setCache(cacheKey, albums, 24 * 60 * 60);
    }

    return albums;
  }

  private static async _fetchAlbumUrls(lang: string): Promise<string[]> {
    const url = `${this.baseUrl}/new-releases/${lang}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } });
      if (!res.ok) {
        console.warn(`Failed to fetch albums for ${lang}`);
        return [];
      }
      const html = await res.text();
      const searchStr = `New ${this.capitalize(lang)} Songs`;
      const startIndex = html.indexOf(searchStr);
      if (startIndex === -1) return [];

      const section = html.substring(startIndex);
      const regex = /href="(\/album\/[^"]+)"/g;
      const matches = Array.from(section.matchAll(regex));
      
      const uniqueUrls = new Set(matches.map(m => `${this.baseUrl}${m[1]}`));
      return Array.from(uniqueUrls);
    } catch (e) {
      console.warn(`Error fetching album URLs for ${lang}`, e);
      return [];
    }
  }
}
