### Sasalele Music Station Changelog

## 28/02/2026

### 🎉 New Features:

- New Paste Stream field allowing users to play any supported external radio stream directly within the player.
- New search icon to instantly search for the currently playing track title.
- Detailed individual tags on radio stations and more categories of them.
- Progressive Web App (PWA) support.
- Show Database last updated date in the footer.
- Random wallpaper.

### 🛠️ Bug fixes & Improvements:

- Cleaned up the GitHub repository to store only source code.
- Switched to a module-bundler approach (Vite) to allow for better tree-shaking and reduced production bundle sizes.
- Use lazy loading for better initial loading speed.
- Migrated Firebase imports from static CDN URLs to localized npm package imports.
- UI enhancement on mobile devices for smoother user experience.
- Improved the random play logic to provide near-instant station switching.
- Improved the track search logic to provide more results.
- Broken stream retry logic which would trigger audio playback after a user had stopped the player.
- Use SVG icons for fontawesome element.
- Hide some elements for a better view when toggling animation.

## 13/12/2025

### 🎉 New Features:

- MediaSession API integration to display the currently playing track/station in notification and update the page title accordingly.
- New chatroom in chat to better classify the messages.

### 🛠️ Bug fixes & Improvements:

- Expanded the recently played list capacity to store up to 300 station/track names.
- Upgraded Firebase JavaScript SDK to the modular.
- Improved the Google Drive Music Player UI and playback logic.
- Improved the random play logic to be faster.
- Icecast streams does not stop properly which caused the previous metadata element continue to show up.

## 13/11/2025

### 🎉 New Features:

- Error and status notifications for both video and audio players.
- Comment sections on every webpage.
- Dismissable search container.
- Clickable links and message timestamps in chat.
- Expanded playlist with additional songs with lrc.
- "Stop streaming" function for the M3U8 video player.
- Beat pattern simulation added to the animation feature.

### 🛠️ Bug fixes & Improvements:

- Switched Zeno streams to use the Icecast player for better compatibility.
- Improved playback logic for M3U8 and direct streams.
- Migrated data management from JSON files to a database, simplifying updates and maintenance.
- Redesigned curated website display.
- Enhanced player with more functionalities.
- Issue where the genre filter input did not persist when searching for stations.
- Audio playback bug when switching from Icecast streams to other stream types.
- Corrected fallback behavior of the Icecast player, especially for stations loaded via RadioBrowser API.
- M3U8 file download issues for stations sourced from RadioBrowser API.

## 29/08/2025

### 🎉 New Features:

- New player style, now all streams (including hls streams) will use one single player to play (with metadata support).
- Dark themed website.

### 🛠️ Bug fixes & Improvements:

- Used "Artist - Title" convention when displaying the song info instead of "Title - Artist".
- [issue 21](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/21). Metadata for icecast streams now displayed immediately once station is loaded.
- [issue 23](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/23). Fixed the audio control logic to prevent pausing issues.
- Google Drive public share link loading issue.

## 16/09/2024

### 🎉 New Features:

- New player style.
- New radio station display style [issue 12](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/12).
- Search input focus.

### 🛠️ Bug fixes & Improvements:

- Use official countries list provided by RadioBrowser API.
- Search limit to the API's request URL to increase search speed.
- Low volume issues (preset 0.3 -> 1.0).
- Right-click and paste content into chat input.

## 28/08/2024

### 🎉 New Features:

- Added a new webpage featuring a document designed to study japanese romaji, hiragana and katakana (https://basic.pp.ua/assets/hirakataroma).
- Load MP3 files from dropdown list of public Google Drive Shared folders.
- Paste and load public google drive folder link function [issue 4](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/4).
- YouTube Live Streams in video page.

## 10/08/2024

### 🎉 New Features:

- Download function for Google drive music file.

### 🛠️ Bug fixes & Improvements:

- UI enhancement.
- Fontawesome icon display issues.

## 01/08/2024

### 🛠️ Bug fixes & Improvements:

- Rewrite firebase chat function.
- Change M3U8 video play logic to fix mixed-content issues and add handling for streams that cannot be played directly on the webpage.

## 20/07/2024

### 🎉 New Features:

- Metadata fetching for supported streams [issue 10](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/10).
- Store and display recently played tracks.
- Copy stream title function.
- Attempt to add a 0x40 hues animation.

### 🛠️ Bug fixes & Improvements:

- Fix playback issues with better metadata fetching approach.
- Use an animation button to control the "0x40 Hues" animation.

## 14/07/2024

### 🎉 New Features:

- Added icecast metadata fetching for supported radios.
- Attempt to add a 0x40 hues animation.

### 🛠️ Bug fixes & Improvements:

- Enhance search by APIs.
- Use Javascript to load and display curated website list in order to ease maintenance.

## 30/06/2024

### 🎉 New Features:

- Function to download M3U8/ radio station stream link in .m3u/ .m3u8 file [issue 16](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/16).

### 🛠️ Bug fixes & Improvements:

- M3U8 Radio stream rework, display in a genre-separated list with dynamic loading.
- Attempt to solve CORS issues in playing stream by using a proxy.

## 16/06/2024

### 🎉 New Features:

- New M3U8 video stream playing function by pasting the M3U8 link or selecting from a dropdown menu.
- Privacy policy for Google Drive Music Player has been implemented.

## 16/01/2024

### 🎉 New Features:

- Real-time chat function using Firebase has been integrated.

## 10/11/2023

### 🎉 New Features:

- Player with random play and play pause functionality.
- Station's playlist using Aplayer (with lrc support).

## 04/11/2023

### 🎉 New Features:

- Google drive music player.

### 🛠️ Bug fixes & Improvements:

- Use json file to store stations instead of using m3u file.

## 25/10/2023

### 🎉 New Features:

- Use LastFM API and YouTube API for search function
- Homepage link for radio stations [issues 9](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/9).

### 🛠️ Bug fixes & Improvements:

- Use json file to store stations instead of using m3u file.

## 02/10/2023

### 🎉 New Features:

- Try to use mobile responsive design.
- Search by radio name function.
