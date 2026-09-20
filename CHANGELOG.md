# Changelog


## 20/09/2026

### 🎉 New Features
- **M3U Playlist Import:** Upload an `.m3u`/`.m3u8` file or paste a playlist URL to dynamically load and render streams.
- **Video Stream Export:** Download individual or batch multi-selected streams as `.m3u8` playlist files for local media players.
- **Unified Favorites System:** Save favorite radio and video streams. Supports `localStorage` persistence for local sessions and cross-device cloud sync for authenticated users.
- **User Authentication:** Sign in via the real-time chat panel to sync your saved favorites across devices.

### 🛠️ Bug Fixes & Improvements
- **Shared Chat Module:** Refactored the chat app into a reusable component integrated across all pages.
- **Rendering Performance:** Improved stream list and UI rendering logic for smoother page performance.
- **Continuous Playback:** Added auto-play support to automatically transition to the next station/stream when finite media content ends.

## 05/03/2026

### 🎉 New Features

- **Custom Stream Playback:** Added a "Paste Stream" input field to directly play external, arbitrary audio streams within the player.
- **Track Search Shortcut:** Added an instant search button on the player controls to quickly look up the currently playing track.
- **Enhanced Station Categorization:** Expanded radio genre categories and added detailed, individual station tags.
- **Progressive Web App (PWA):** Added full PWA support for installability and offline caching.
- **Database Status:** Added a database timestamp to the website footer showing when station data was last updated.
- **Dynamic Backgrounds:** Added a random background wallpaper toggle.
- **MPEG-DASH Playback:** Integrated native MPEG-DASH stream playback support into the player core.
- **Google Drive Metadata Parsing:** Added automatic extraction and display of track title, artist, and synchronized lyrics (`.lrc`) inside the Google Drive Music Player (GDMP).
- **Chat Pagination:** Added initial message display limits to improve chat panel load times.

### 🛠️ Bug Fixes & Improvements

- **Build System Migration:** Migrated project build pipeline to **Vite** with ES modules, enabling tree-shaking, lazy loading, and significantly smaller production bundle sizes.
- **Repository Cleanup:** Cleaned up repository structure to track source files only.
- **Dependency Optimization:** Replaced static CDN Firebase scripts with localized, modular npm imports.
- **UI & Mobile UX:** Enhanced responsive styling for smoother navigation on mobile devices.
- **Playback & State Logic:**
* Optimized random station switching for near-instant playback.
* Expanded track search logic to deliver broader search coverage and richer metadata matches.
* Fixed an issue where stream retry logic would mistakenly resume audio playback after the user manually paused or stopped the player.


- **Visuals:** Replaced FontAwesome font icons with inline SVGs for cleaner rendering and added an option to hide UI overlays during background animations.

---

## 13/12/2025

### 🎉 New Features

- **MediaSession API:** Integrated browser `MediaSession` controls to display current track/station metadata in system notifications, lock screens, and browser tab titles.
- **Categorized Chat Rooms:** Added sub-channels/rooms within the real-time chat application for better topic organization.

### 🛠️ Bug Fixes & Improvements

- **History Tracking:** Expanded recently played history capacity to retain up to 300 tracks/stations.
- **Firebase Modernization:** Upgraded Firebase JavaScript SDK to the modular v9+ syntax.
- **GDMP & Playback:** Overhauled the Google Drive Music Player UI and improved overall stream initialization speed.
- **Icecast Cleanup:** Fixed an issue where stopping an Icecast stream failed to clear active background connections, leaving stale metadata on the UI.

---

## 13/11/2025

### 🎉 New Features

- **Player Notifications:** Added unified status and error toast alerts for both audio and video players.
- **Global Comment System:** Integrated comment sections across all application pages.
- **Search UI:** Made the search overlay container dismissable.
- **Chat Enhancements:** Enabled clickable hyperlinks and displayed message timestamps in chat rooms.
- **Visualizer Effect:** Added a beat pattern simulation mode to the visualizer animation overlay.
- **Video Controls:** Added a dedicated "Stop Streaming" action for M3U8 video players.

### 🛠️ Bug Fixes & Improvements

- **Database Migration:** Migrated station data management from static `.json` files to a backend database for easier maintenance and live updates.
- **Stream Engine Updates:** Switched Zeno streams to the Icecast player engine for improved stream stability and fixed audio driver bugs when switching between Icecast and standard streams.
- **RadioBrowser API:** Corrected fallback behavior for RadioBrowser API streams and resolved M3U8 file generation bugs for externally sourced stations.
- **Search State:** Fixed a bug where active genre filter inputs were lost during station searches.

---

## 29/08/2025

### 🎉 New Features

- **Unified Player Core:** Consolidated stream engines (including HLS/M3U8) into a single playback interface with synchronized metadata extraction.
- **Dark Mode:** Introduced a global dark theme across the web application.

### 🛠️ Bug Fixes & Improvements

- **Metadata Standard:** Standardized metadata formatting across all streams to follow the `"Artist - Title"` convention.
- **Icecast Instant Metadata:** Resolved [#21](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/21) — Icecast metadata now displays immediately upon station connection.
- **Audio Controls:** Fixed [#23](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/23) — Resolved audio state bugs causing accidental playback pauses.
- **Google Drive Integration:** Fixed file fetching issues with public Google Drive share links.

---

## 16/09/2024

### 🎉 New Features

- **UI Refresh:** Redesigned primary audio player layout and station card displays ([#12](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/12)).
- **Quick Focus:** Added automatic focus handling on search inputs.

### 🛠️ Bug Fixes & Improvements

- **RadioBrowser Integration:** Updated country lists to use RadioBrowser API official standards and capped search request limits for faster query responses.
- **Volume Normalization:** Adjusted default player volume preset from `0.3` to `1.0` to resolve low default playback levels.
- **Chat Usability:** Enabled right-click paste context menu support inside chat input fields.

---

## 28/08/2024

### 🎉 New Features

- **Google Drive Playlists:** Added capability to select and stream MP3 files directly from public Google Drive folder dropdowns or pasted share links ([#4](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/4)).
- **YouTube Live:** Integrated YouTube Live video stream support on the video page.

---

## 10/08/2024

### 🎉 New Features

- **Direct Downloads:** Added a direct file download option for tracks hosted on Google Drive.

### 🛠️ Bug Fixes & Improvements

- **Icon Rendering:** Resolved FontAwesome icon rendering bugs and improved general layout alignment.

---

## 01/08/2024

### 🛠️ Bug Fixes & Improvements

- **Chat Architecture:** Refactored Firebase chat engine for improved message listener efficiency.
- **Video Player Protocol:** Updated M3U8 video stream logic to eliminate mixed-content (HTTP/HTTPS) blocking errors and added fallback handling for restricted streams.

---

## 20/07/2024

### 🎉 New Features

- **Track History:** Added recently played track recording and display capabilities.
- **Metadata Actions:** Added a one-click action to copy current track titles to clipboard.
- **Visualizer Experiment:** Introduced experimental "0x40 Hues" color animation toggles.

### 🛠️ Bug Fixes & Improvements

- **Metadata Parsing:** Improved metadata extraction reliability across problematic stream endpoints.

---

## 14/07/2024

### 🎉 New Features

- **Icecast Metadata:** Added ICY header metadata parsing for supported internet radio streams.

### 🛠️ Bug Fixes & Improvements

- **Dynamic Content:** Refactored curated station lists to load via JavaScript for streamlined maintenance.
- **API Search:** Improved API search response speeds.

---

## 30/06/2024

### 🎉 New Features

- **Playlist Export:** Added functionality to export M3U8/radio stream URLs directly as downloadable `.m3u`/`.m3u8` playlist files ([#16](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/16)).

### 🛠️ Bug Fixes & Improvements

- **Stream Proxy:** Implemented a CORS proxy layer to enable playback for restricted third-party audio streams.
- **M3U8 Organization:** Categorized M3U8 streams into genre-separated lists with dynamic lazy loading.

---

## 16/06/2024

### 🎉 New Features

- **M3U8 Video Support:** Added M3U8 video playback via custom URL input or preset dropdown selections.
- **Legal Compliance:** Added Privacy Policy page for Google Drive Music Player OAuth integration.

---

## 16/01/2024

### 🎉 New Features

- **Realtime Chat:** Integrated real-time community chat powered by Firebase Realtime Database.

---

## 10/11/2023

### 🎉 New Features

- **APlayer Integration:** Integrated APlayer engine with dynamic synchronized `.lrc` lyric support.
- **Random Play:** Implemented random station shuffle and playback controls.

---

## 04/11/2023

### 🎉 New Features

- **GDMP Launch:** Launched initial version of Google Drive Music Player.

### 🛠️ Bug Fixes & Improvements

- **Data Format:** Replaced legacy M3U playlists with structured JSON database files for station storage.

---

## 25/10/2023

### 🎉 New Features

- **Third-Party Integrations:** Added track search via Last.fm and YouTube APIs.
- **Station Metadata:** Added official station homepage link shortcuts ([#9](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/9)).

---

## 02/10/2023

### 🎉 New Features

- **Initial Release:** Initial launch featuring station search by name and baseline mobile responsive design.