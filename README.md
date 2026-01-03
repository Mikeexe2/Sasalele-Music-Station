# <p align="center"><img src="assets/sasalele_logo-removebg.webp" style="width: 40px;"> Sasalele Music Station</p>

This website project aims to collect all public radio links in the world which stream Japanese music, including genres like J-Pop, J-Rock, Anime OST, Vocaloid..... However, you may also find Korean, Chinese and English speaking radios inside this website. This repository contains the source code for the website. Pull requests are welcomed!
* [日本語](README-JP.md)
* [中文](README-CN.md)
* [한국어](README-KR.md)

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

### 📝 Project Changelog

#### 📅 2025-12-13

* **Added:** MediaSession API integration to display the currently playing track/station in notification and update the page title accordingly.
* **Changed:** Expanded the recently played list capacity to store up to 300 station/track names.
* **Added:** New chatroom in chat to better classify the messages.
* **Changed:** Upgraded Firebase JavaScript SDK to the modular.
* **Changed:** Improved the Google Drive Music Player UI and playback logic.
* **Changed:** Improved the random play logic to be faster.
* **Changed:** All date display logic will now use YYYY/MM/DD.
* **Fixed:** Icecast streams does not stop properly which caused the previous metadata element continue to show up.

#### 📅 2025-11-13

* **Added:** Error and status notifications for both video and audio players.
* **Added:** Comment sections on every webpage.
* **Added:** Dismissable search container.
* **Added:** Clickable links and message timestamps in chat.
* **Added:**  Expanded playlist with additional songs with lrc.
* **Added:** Redesigned curated website display.
* **Added:** "Stop streaming" function for the M3U8 video player.
* **Added:** Beat pattern simulation added to the animation feature.
* **Changed:** Switched Zeno streams to use the Icecast player for better compatibility.
* **Changed:** Improved playback logic for M3U8 and direct streams.
* **Changed:** Migrated data management from JSON files to a database, simplifying updates and maintenance.
* **Changed:** Enhanced player with more functionalities.
* **Fixed:** Issue where the genre filter input did not persist when searching for stations.
* **Fixed:** Audio playback bug when switching from Icecast streams to other stream types.
* **Fixed:** Corrected fallback behavior of the Icecast player, especially for stations loaded via RadioBrowser API.
* **Fixed:** M3U8 file download issues for stations sourced from RadioBrowser API.

#### 📅 2025-08-29

* **Added:** New player style, now all streams (including hls streams) will use one single player to play (with metadata support).
* **Added:** Dark themed website.
* **Changed:** Used "Artist - Title" convention when displaying the song info instead of "Title - Artist".
* **Fixed:**  [issue 21](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/21). Metadata for icecast streams now displayed immediately once station is loaded.
* **Fixed:**  [issue 23](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/23). Fixed the audio control logic to prevent pausing issues.
* **Fixed:** Google Drive public share link loading issue.

#### 📅 2024-09-16
* **Added:**  New player style.
* **Added:**  New radio station display style [issue 12](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/12).
* **Added:**  Search input focus.
* **Changed:** Use official countries list provided by RadioBrowser API.
* **Added:** Search limit to the API's request URL to increase search speed.
* **Fixed:** Low volume issues (preset 0.3 -> 1.0).
* **Fixed:** Right-click and paste content into chat input.

#### 📅 2024-08-28
* **Added:** New site (https://basic.pp.ua/assets/hirakataroma.html).
* **Added:** Load MP3 files from dropdown list of public Google Drive Shared folders.
* **Added:** Paste and load public google drive folder link function [issue 4](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/4).
* **Added:** YouTube Live Streams in video page.

#### 📅 2024-08-10
* **Added:** Download function for Google drive music file.
* **Changed:** UI enhancement.
* **Fixed:** Fontawesome icon display issues.

#### 📅 2024-08-01
* **Changed:** Rewrite firebase chat function.
* **Fixed:** Change M3U8 video play logic to fix mixed-content issues and add handling for streams that cannot be played directly on the webpage.

#### 📅 2024-07-20

* **Added:** Metadata fetching for supported streams [issue 10](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/10).
* **Added:** Store and display recently played tracks.
* **Added:** Copy stream title function.
* **Added:** Attempt to add a 0x40 hues animation.
* **Fixed:** Fix playback issues with better metadata fetching approach.
* **Changed:** Use an animation button to control the "0x40 Hues" animation.

#### 📅 2024-07-14

* **Added:** Added icecast metadata fetching for supported radios.
* **Added:** Attempt to add a 0x40 hues animation.
* **Changed:** Enhance search by APIs.
* **Changed:** Use Javascript to load and display curated website list in order to ease maintenance.

#### 📅 2024-06-30

* **Added:** Function to download M3U8/ radio station stream link in .m3u/ .m3u8 file [issue 16](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/16).
* **Changed:** M3U8 Radio stream rework, display in a genre-separated list with dynamic loading.
* **Changed:** Attempt to solve CORS issues in playing stream by using a proxy.

#### 📅 2024-06-16

* **Added:** New M3U8 video stream playing function by pasting the M3U8 link or selecting from a dropdown menu.
* **Added:** Privacy policy for Google Drive Music Player has been implemented.

#### 📅 2024-01-16

* **Added:** Real-time chat function using Firebase has been integrated.

#### 📅 2023-11-10

* **Added:** Player with random play and play pause functionality.
* **Added:** Station's playlist using Aplayer (with lrc support).

#### 📅 2023-11-04

* **Changed:** Use json file to store stations instead of using m3u file.
* **Added:** Google drive music player.
* **Added:** Homepage link for radio stations [issues 9](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/9).

#### 📅 2023-10-25

* **Changed:** Use json file to store stations instead of using m3u file.
* **Added:** Use LastFM API and YouTube API for search function
* **Added:** Homepage link for radio stations [issues 9](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/9).

#### 📅 2023-10-02

* **Added:** Try to use mobile responsive design.
* **Added:** Search by site function.

## Discussion & Latest Update:

[![Telegram Badge](https://img.shields.io/badge/telegram-❤️-252850?style=plastic&logo=telegram)](https://t.me/sasalelemusic)

## Acknowledgements

A huge thank you to all the radio station owners and all video stream provider—without you, none of this would be possible!

### Open Source Contributions
This project is built upon the foundation and hard work of the following essential open-source libraries:
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
