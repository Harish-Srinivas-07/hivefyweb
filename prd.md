# Product Requirements Document (PRD)

# Hivefy (Next.js Version)

## 1. Overview

Hivefy is the browser-based evolution of the existing Hivefy Flutter Android application.

The goal is to rebuild Hivefy as a high-performance, responsive, and scalable web application using **Next.js**, while preserving:

- Ad-free experience
- FOSS philosophy
- Offline-first architecture
- Privacy-respecting design
- Spotify-inspired modern UI

Hivefy will extend reach beyond Android and enable cross-platform usage across desktop and mobile browsers.

---

## 2. Objectives

### Primary Goals

1. Deliver a fully functional web music streaming application.
2. Maintain feature parity with the Flutter Android app.
3. Ensure high performance and smooth playback.
4. Support offline caching via browser storage.
5. Preserve brand identity and UI philosophy.

### Secondary Goals

- Prepare architecture for future PWA packaging.
- Enable future cloud profile sync.
- Allow future desktop packaging (Electron / Tauri).

---

## 3. Target Users

### Primary Users

- Existing Hivefy Android users
- Users who prefer web-based streaming
- Privacy-conscious music listeners

### Secondary Users

- Desktop listeners
- Linux/macOS users without Android
- Developers and open-source contributors

---

## 4. Platform Scope

### Supported Environments

- Modern Chromium browsers
- Firefox
- Safari (with limitations)
- Mobile browsers

### Future Scope

- Progressive Web App (PWA)
- Desktop wrapper
- Cross-device sync

---

## 5. Core Feature Requirements

## 5.1 Authentication

Phase 1:

- No mandatory login
- Anonymous usage

Phase 2:

- Optional cloud profile
- Playlist sync
- Cross-device restore

---

## 5.2 Home Experience

### Requirements

- Trending charts
- Albums
- Playlists
- Multi-language content
- Dynamic content sections

### UX Goals

- Spotify-inspired layout
- Responsive grid system
- Smooth hover states (desktop)
- Touch-friendly gestures (mobile)

---

## 5.3 Search

### Functional Requirements

- Unified search:
  - Songs
  - Albums
  - Artists
  - Playlists

- Debounced API requests
- Infinite scroll results
- Keyboard navigation

---

## 5.4 Player System

### Core Requirements

- HTML5 Audio-based playback
- Background playback support
- Queue system
- Shuffle
- Repeat modes
- Seek bar with real-time update
- Volume control
- Playback speed (optional)

### Advanced Requirements

- Mini player
- Expandable full player
- Smooth animation transitions
- Media Session API integration
- Lock screen metadata support

---

## 5.5 Offline-First Capability

### Requirements

- Download songs for offline use
- IndexedDB storage
- Cache management
- Storage usage display
- Manual file cleanup
- Download progress tracking

### Constraints

- Browser storage limits vary
- Safari restrictions apply

---

## 5.6 Library

### Requirements

- Saved songs
- Saved albums
- Saved playlists
- Recently played
- Persistent storage

### Storage Layer

- IndexedDB
- LocalStorage (lightweight data)
- Service Worker caching

---

## 5.7 Settings

### Required Settings

- Theme toggle (Light / Dark / System)
- Server selector (Main / Backup / Mirror)
- Cache cleanup
- Clear library
- Download manager
- App version display

---

## 6. Technical Architecture

## 6.1 Frontend Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Zustand or Redux (state management)
- React Query (data fetching)

---

## 6.2 Audio Architecture

- HTML5 Audio API
- Web Audio API (optional enhancements)
- Media Session API
- Background playback support
- Queue manager abstraction

---

## 6.3 API Layer

Uses the unofficial JioSaavn API (existing backend logic ported from Flutter).

### Requirements

- Server abstraction layer
- Failover support
- Error fallback
- Rate limit handling
- Mirror endpoint support

---

## 6.4 Storage Layer

| Data Type | Storage        |
| --------- | -------------- |
| Downloads | IndexedDB      |
| Settings  | LocalStorage   |
| Library   | IndexedDB      |
| Cache     | Service Worker |

---

## 6.5 Performance Requirements

- First load < 2.5s (cold)
- Lazy load images
- Audio prefetching
- Debounced search
- Code splitting
- Route-level streaming

---

## 7. Non-Functional Requirements

### Security

- No user tracking
- No analytics by default
- Sanitized API responses
- XSS-safe rendering

### Privacy

- No third-party trackers
- Local-only storage
- Optional cloud sync

### Reliability

- Server fallback logic
- Graceful offline handling
- API error resilience

---

## 8. UI/UX Design Requirements

### Design Philosophy

- Spotify-inspired layout
- Material You adaptation
- Clean typography
- Subtle gradients
- Smooth transitions

### Animations

- Mini-player expand animation
- Page transitions
- Hover elevation
- Skeleton loading states

---

## 9. Migration Strategy

### Phase 1 – Core Web MVP

- Playback
- Search
- Home
- Library
- Downloads

### Phase 2 – Feature Parity

- Server switching
- Cache manager
- Enhanced animations
- Media session integration

### Phase 3 – Enhancement

- Lyrics
- AI recommendations
- Profile sync
- Playlist sharing

---

## 10. Risks & Constraints

### API Risk

- Unofficial JioSaavn API instability
- Endpoint changes
- Rate limits

### Browser Constraints

- IndexedDB quota limits
- Safari background restrictions
- Service Worker edge cases

### Legal

- Educational/research purpose usage
- No copyrighted media hosting

---

## 11. Success Metrics

- Monthly active users
- Retention rate
- Average session duration
- Download feature adoption
- GitHub contributions

---

## 12. Future Vision

- Cross-platform identity
- Desktop support
- iOS wrapper
- Community-driven plugins
- Fully open music ecosystem

---

# Summary

Hivefy aims to evolve the Android-only Flutter application into a scalable, high-performance, browser-based streaming platform while preserving its:

- Open-source values
- Offline-first architecture
- Ad-free experience
- Privacy-respecting philosophy

The system must remain technically robust, modular, and future-proof.

---

End of PRD.
