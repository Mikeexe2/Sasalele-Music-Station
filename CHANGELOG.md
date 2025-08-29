# Changelog
All major changes to this project will be documented in this file. Minor changes (or i would say mistakes) will be documented in the commit history. You will have to clear data and cache in your browser and reload to reflect changes.
## 2025-08-29

### Added
- New player style, now all streams (including hls streams) will use one single player to play (with metadata support).
- Dark themed website.

### Changed

- Used "Artist - Title" convention when displaying the song info instead of "Title - Artist".
- Removed inactive streams.

### Fixed
- Fix [issue 21](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/21). Metadata for icecast streams now displayed immediately once station is loaded.
- Fix [issue 23](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/23). Fixed the audio control logic to prevent pausing issues.
- Fixed Google Drive public share link loading issue.


## 2024-09-16

### Added

- New player style.
- New radio station display style [issue 12](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/12).
- Search input focus.

### Changed

- Use official countries list provided by Radio Browser API.
- New site's operation time display in the footer, which shows the real-time update of how much time has passed since the first deployment of this website.
- Added search limit to the API's request URL to increase search speed.

### Fixed
- Chat input detect function; now can check right-click pasted input.
- Low volume issues (preset 0.3 -> 1.0).

## 2024-08-28

### Added

- Added YouTube Live Streams in video page.

### Fixed

- Improve animation of the images.
- Improve chat.

## 2024-08-23

### Added

- Paste and load public google drive folder link function [issue 4](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/4).
- Load MP3 files from dropdown list of public Google Drive Shared folders.
- New site (https://basic.pp.ua/assets/hirakataroma.html).

## 2024-08-10

### Added

- Download function for Google drive music file.

### Changed

- Fix fontawesome icon display issues.
- UI enhancement.

## 2024-08-01

### Changed

- Enhance search function by APIs.
- Rewrite firebase chat function.
- Change M3U8 video play logic to fix mixed-content issues and add handling for streams that cannot be played directly on the webpage.
- Remove redundant codes.

## 2024-07-20

### Added

- Added more k-music stations.
- Added metadata fetching for supported streams [issue 10](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/10).
- Store and display recently played tracks.
- Copy stream title function.


### Changed

- Fix playback issues with better metadata fetching approach.
- Use an animation button to control the "0x40 Hues (failed attempt)" animation.
- Removed unused CSS styles.

## 2024-07-14

### Added

- Added icecast metadata fetching for supported radios.
- Attempt to add a 0x40 hues animation but it does not look good.

### Changed

- Enhance search by APIs
- New method display curated website list in order to ease maintenance.

## 2024-06-30

### Added

- Added function to download M3U8/ radio station stream link in .m3u/ .m3u8 function [issue 16](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/16).

### Changed

- M3U8 Radio stream rework, display in a genre-separated list with dynamic loading.
- Attempt to solve CORS issues in playing stream by using a proxy.

## 2024-06-16

### Added

- New M3U8 video stream playing function by pasting m3u8 link or select from dropdown.
- Privacy privacy for Google Drive Music Player.

## 2024-01-16

### Added

- Chat function using firebase.

## 2023-11-10

### Added
- Player with random play and play pause functionality.
- Station's playlist using Aplayer (with lrc support).

## 2023-11-04

### Changed
- Use json file to store stations instead of using m3u file.
- Google drive music player
- Added homepage link for radio stations added [issues 9](https://github.com/Mikeexe2/Sasalele-Music-Station/issues/9).

## 2023-10-25

### Added

- Use LastFM API and YouTube API for search function

## 2023-10-02

### Added

- Added Search by site function
- Include styles for mobile responsive
