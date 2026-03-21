import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LikedItem {
  id: string;
  type: 'song' | 'album' | 'playlist';
  name: string;
  image: string;
  artist?: string;
  timestamp: number;
}

interface LikesState {
  likedItems: Record<string, LikedItem>; // Keyed by ID for O(1) lookups
  
  toggleLike: (item: any, type: 'song' | 'album' | 'playlist') => void;
  isLiked: (id: string) => boolean;
  getLikedSongs: () => LikedItem[];
  getLikedAlbums: () => LikedItem[];
  getLikedPlaylists: () => LikedItem[];
}

export const useLikesStore = create<LikesState>()(
  persist(
    (set, get) => ({
      likedItems: {},

      toggleLike: (item, type) => {
        const id = item.id;
        const currentLikes = { ...get().likedItems };

        if (currentLikes[id]) {
          delete currentLikes[id];
        } else {
          let name = item.title || item.name || 'Unknown';
          let image = '/assets/icons/logo.png';
          if (Array.isArray(item.images) && item.images.length > 0) {
            image = item.images[item.images.length - 1].url || item.images[item.images.length - 1].link || item.images[0].url;
          } else if (item.image) {
            if (typeof item.image === 'string') image = item.image;
            else if (Array.isArray(item.image) && item.image.length > 0) {
              image = item.image[item.image.length - 1].url || item.image[item.image.length - 1].link || item.image[0].url;
            }
          }

          let artist = '';
          if (typeof item.primaryArtists === 'string') artist = item.primaryArtists;
          else if (Array.isArray(item.primaryArtists)) artist = item.primaryArtists.map((a: any) => a.name).join(', ');
          else if (item.artist) artist = item.artist;

          currentLikes[id] = {
            id,
            type,
            name,
            image,
            artist,
            timestamp: Date.now()
          };
        }

        set({ likedItems: currentLikes });
      },

      isLiked: (id) => !!get().likedItems[id],

      getLikedSongs: () => Object.values(get().likedItems).filter(i => i.type === 'song').sort((a,b) => b.timestamp - a.timestamp),
      getLikedAlbums: () => Object.values(get().likedItems).filter(i => i.type === 'album').sort((a,b) => b.timestamp - a.timestamp),
      getLikedPlaylists: () => Object.values(get().likedItems).filter(i => i.type === 'playlist').sort((a,b) => b.timestamp - a.timestamp),
    }),
    {
      name: 'hivefy-likes-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
