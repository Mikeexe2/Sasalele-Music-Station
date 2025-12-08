# <p align="center"><img src="assets/sasalele_logo-removebg.webp" style="width: 40px;"> Sasalele Music Station</p>

This website project aims to collect all public radio links in the world which stream Japanese music, including genres like J-Pop, J-Rock, Anime OST, Vocaloid..... However, you may also find Korean, Chinese and English speaking radios inside this website. This repository contains the source code for the website. Please star this repo if you like it!
[日本語](README-JP.md)
[中文](README-CN.md)
[한국어](README-KR.md)

## Features

- 🎶 Extensive radio collection categorized by genres, and listen directly in browser.
- 🆕 View the track name of the song streamed by the radio stations (for supported streams only).
- 📥 Download M3U8 files of radio stations and listen on your device with a supported player like Poweramp or VLC Media Player.
- 🔍 Use the RadioBrowser API to discover even more radio stations and quickly search for songs across LastFM, Deezer, iTunes, YouTube, and selected search engines.
- 📺 Watch over 20,000 M3U8 video streams via the [Sasalele Video Player](https://basic.pp.ua/video.html).
- 🎥 YouTube Live streams perfect for background listening.
- 📂 Log in with Google to play or download your music collection through the [Google Drive Music Player](https://basic.pp.ua/drive.html) or paste a public Google Drive folder link to access your music directly.
- 🔧 Explore a curated list of websites for downloading, editing, and managing MP3 files.
- 🎙 Discover Japanese podcasts with our [curated list of resources](https://basic.pp.ua/website.html).
- 💬 Join the conversation and share your current listenings with others.

## Changelog

##### 2025-12-08

###### Added
- Implemented MediaSession API integration to display the currently playing track/station in system notifications and update the page title dynamically
- Expanded the recently played list capacity to store up to 300 station/track names.
###### Changed
- Upgraded Firebase JavaScript SDK to the modular.
- Improved the Google Drive Music Player UI and playback logic.

##### 2025-11-13

###### Added

- Comprehensive error and status notifications for both video and audio players, improving user feedback during playback.
- Integrated comment sections on every webpage for enhanced user interaction.
- Dismissable search container for a cleaner UI experience.
- Chat enhancements: clickable links and message timestamps for better usability.
- Expanded playlist with additional songs with lrc.
- Redesigned curated website display for improved readability and reduced clutter.
- "Stop streaming" function for the M3U8 video player.
- Beat pattern simulation added to the animation feature.

###### Changed

- Switched Zeno streams to use the Icecast player for better compatibility.
- Improved playback logic for M3U8 and direct streams, increasing reliability.
- Migrated data management from JSON files to a database, simplifying updates and maintenance.
- Enhanced player with more functionalities.

###### Fixed

- Resolved issue where the genre filter input did not persist when searching for stations.
- Fixed audio playback bug when switching from Icecast streams to other stream types, ensuring proper player shutdown.
- Corrected fallback behavior of the Icecast player, especially for stations loaded via RadioBrowser API.
- Fixed M3U8 file download issues for stations sourced from RadioBrowser API.

##### 2025-08-29

###### Added

- New player style, now all streams (including hls streams) will use one single player to play (with metadata support).
- Dark themed website.

###### Changed

- Used "Artist - Title" convention when displaying the song info instead of "Title - Artist".
- Removed inactive streams.

###### Fixed

- Fix [issue 21](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/21). Metadata for icecast streams now displayed immediately once station is loaded.
- Fix [issue 23](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/23). Fixed the audio control logic to prevent pausing issues.
- Fixed Google Drive public share link loading issue.

##### 2024-09-16

###### Added

- New player style.
- New radio station display style [issue 12](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/12).
- Search input focus.

###### Changed

- Use official countries list provided by Radio Browser API.
- New site's operation time display in the footer, which shows the real-time update of how much time has passed since the first deployment of this website.
- Added search limit to the API's request URL to increase search speed.

###### Fixed

- Chat input detect function; now can check right-click pasted input.
- Low volume issues (preset 0.3 -> 1.0).

##### 2024-08-28

###### Added

- Added YouTube Live Streams in video page.
- Paste and load public google drive folder link function [issue 4](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/4).
- Load MP3 files from dropdown list of public Google Drive Shared folders.
- New site (https://basic.pp.ua/assets/hirakataroma.html).

###### Fixed

- Improve animation of the images.
- Improve chat.

##### 2024-08-10=

###### Added

- Download function for Google drive music file.

###### Changed

- Fix fontawesome icon display issues.
- UI enhancement.

##### 2024-08-01

###### Changed

- Enhance search function by APIs.
- Rewrite firebase chat function.
- Change M3U8 video play logic to fix mixed-content issues and add handling for streams that cannot be played directly on the webpage.
- Remove redundant codes.

#### 2024-07-20

###### Added

- Added more k-music stations.
- Added metadata fetching for supported streams [issue 10](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/10).
- Store and display recently played tracks.
- Copy stream title function.

###### Changed

- Fix playback issues with better metadata fetching approach.
- Use an animation button to control the "0x40 Hues (failed attempt)" animation.
- Removed unused CSS styles.

#### 2024-07-14

###### Added

- Added icecast metadata fetching for supported radios.
- Attempt to add a 0x40 hues animation but it does not look good.

###### Changed

- Enhance search by APIs
- New method display curated website list in order to ease maintenance.

#### 2024-06-30

###### Added

- Added function to download M3U8/ radio station stream link in .m3u/ .m3u8 function [issue 16](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/16).

###### Changed

- M3U8 Radio stream rework, display in a genre-separated list with dynamic loading.
- Attempt to solve CORS issues in playing stream by using a proxy.

#### 2024-06-16

###### Added

- New M3U8 video stream playing function by pasting m3u8 link or select from dropdown.
- Privacy privacy for Google Drive Music Player.

#### 2024-01-16

###### Added

- Chat function using firebase.

#### 2023-11-10

###### Added

- Player with random play and play pause functionality.
- Station's playlist using Aplayer (with lrc support).

#### 2023-11-04

###### Changed

- Use json file to store stations instead of using m3u file.
- Google drive music player
- Added homepage link for radio stations added [issues 9](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/9).

#### 2023-10-25

###### Added

- Use LastFM API and YouTube API for search function

#### 2023-10-02

###### Added

- Added Search by site function
- Include styles for mobile responsive

## Discussion & Latest Update:

[![Telegram Badge](https://img.shields.io/badge/telegram-❤️-252850?style=plastic&logo=telegram)](https://t.me/sasalelemusic)

## Acknowledgements

A huge thank you to all the radio station owners and all video stream provider—without you, none of this would be possible!

### Open Source Contributions

- **icecast-metadata-js** - [GitHub](https://github.com/eshaz/icecast-metadata-js)
- **Drive Music Player** - [GitHub](https://github.com/dandalpiaz/drive-music-player)
- **APlayer** - [GitHub](https://github.com/DIYgod/APlayer)
- **hls.js** - [GitHub](https://github.com/video-dev/hls.js)
- **Waline** - [GitHub](https://github.com/walinejs/waline)

### APIs Used

- [LastFM API](https://www.last.fm/api)
- [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html)
- [Deezer Simple API](https://developers.deezer.com/api)
- [RadioBrowser API](https://api.radio-browser.info/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Google Drive API](https://developers.google.com/drive/api/reference/rest/v3)

## Stargazers over time

[![Stargazers over time](https://starchart.cc/Mikeexe2/Sasalele-Music-Station.svg?variant=adaptive)](https://starchart.cc/Mikeexe2/Sasalele-Music-Station)
