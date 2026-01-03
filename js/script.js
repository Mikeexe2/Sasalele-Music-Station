import { ref, set, get, onValue, query, orderByChild, push } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';

const playerContainer = document.getElementById("player");
const expandIcon = document.querySelector("#togglePlayer .fa-expand");
const minimizeIcon = document.querySelector("#togglePlayer .fa-compress");
const coverImage = document.getElementById('ip');
const nowPlaying = document.getElementById('nowPlaying');
const stationCount = document.getElementById('station-count');
const historyDisplay = document.getElementById('historyBtn');
const randomplay = document.getElementById('randomplay');
const stopBtn = document.getElementById('stopBtn');
const togglePlayerButton = document.getElementById("togglePlayer");
const copyIcon = document.getElementById('copyIcon');
const copyIconSymbol = copyIcon.querySelector('i.fas.fa-copy');
const confirmation = document.querySelector('#copyIcon .copy-confirmation');
const stationSearch = document.getElementById('sasalelesearch');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResultsWrapper = document.getElementById('searchResultsWrapper');
const dismissBtn = document.getElementById('dismissSearchResults');
const collapseIcon = document.getElementById('collapseIcon');
const searchResultsCollapse = document.getElementById('searchResultsCollapse');
const searchTermsContainer = document.getElementById('searchTerms');
const VideoDisplay = document.getElementById("YouTubeVideo");
const innerlastfm = document.getElementById('lastfmList');
const inneritunes = document.getElementById('itunesList');
const innerdeezer = document.getElementById('deezerList');
const metadataElement = document.getElementById('metadataDisplay');
const metaSource = document.getElementById('metadataSource');
const genreSelect = document.getElementById('genre-select');
const toggleButton = document.getElementById('toggleButton');
const sidePanel = document.getElementById('sidePanel');
const hideButton = document.getElementById('hideButton');
const searchNavLink = document.querySelector('.search-nav-link');
const defaultGenre = "jmusic";
const MAX_RETRIES = 3;
const playlistMenu = document.getElementById('playlistMenu');
const container = document.getElementById('hugeData');
const selectedContainer = document.getElementById("selected");

const countrySelectContainer = document.getElementById('countrySelectContainer');
const countrySelect = document.getElementById('countrySelect');
const languageSelectContainer = document.getElementById('languageSelectContainer');
const languageSelect = document.getElementById('languageSelect');
const tagSelectContainer = document.getElementById('tagSelectContainer');
const tagSelect = document.getElementById('tagSelect');
const searchOption = document.getElementById('searchOption');
const findRadioBtn = document.getElementById("radiosearch");
const searchField = document.getElementById('search-field');
const searchResultContainer = document.getElementById('radio-result-container');
const searchResultHeader = document.getElementById('radio-result-header');
const debouncedFilterStations = debounce(filterStations, 200);
const db = window.appServices.db;
const coolDown = 2000;
const mediaController = document.getElementById('media-controller');

let hlsPlayer = null;
let icecastPlayer = null;
let currentStation = null;
let isPlaying = false;
let metadataInterval = null;
let metadataEventSource = null;
let currentSearchTerm = '';
let chosenUrl = '';
let selectedPlaylist = null;
let ap = null;
let originalTitle = document.title;
let isRandomPlayRunning = false;
let debounceTimeout;
let sakuin = [];

function debounce(func, delay = 300) {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function togglePanel() {
    const toggleButton = document.getElementById('toggleButton');
    const icon = toggleButton.querySelector('i');
    sidePanel.classList.toggle('open');
    const isNowOpen = sidePanel.classList.contains('open');
    toggleButton.setAttribute('aria-expanded', isNowOpen);
    if (isNowOpen) {
        icon.classList.remove('fa-comment');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-comment');
    }
}

function updatePlayerUI(media) {
    coverImage.src = `${media.favicon ? media.favicon : 'assets/radios/Unidentified2.webp'}`;
    coverImage.classList.add('rotating');
    nowPlaying.innerHTML = `<a href="${media.homepage || media.url}" target="_blank" class="homepagelink">${media.name}</a>`;
    metaSource.textContent = `Stream type: ${media.host || 'from API'}`;
}

function displayRecentTracks() {
    const recentTracks = JSON.parse(localStorage.getItem('recentTracks')) || [];
    const recentTracksList = document.getElementById('recentTracksList');

    recentTracksList.innerHTML = '';

    if (recentTracks.length > 0) {
        recentTracks.forEach(track => {
            const listItem = document.createElement('li');
            listItem.textContent = track;
            listItem.className = 'list-group-item';
            recentTracksList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'No recent tracks found.';
        listItem.className = 'list-group-item';
        recentTracksList.appendChild(listItem);
    }
}

function updateMediaSessionMetadata(title, artist, media) {
    const favicon = media.favicon;
    const album = media.name;
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Track',
            artist: artist || album,
            album: album || 'Playing Music',
            artwork: [{
                src: favicon || 'assets/sasalele_logo-removebg.webp',
                sizes: '96x96'
            }]
        });
    }
}

function stopMediaSession() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
    }
    document.title = originalTitle;
}

function trackHistory(trackName, media) {
    let recentTracks = JSON.parse(localStorage.getItem('recentTracks')) || [];
    const latestTrack = recentTracks[0];

    const cleanTrackName = trackName.replace(/\.(mp3|m4a|ogg|wav|flac|aac|wma)$/i, '');

    let trackTitle = cleanTrackName;
    let trackArtist = '';

    const dashCount = (cleanTrackName.match(/ - /g) || []).length;

    if (dashCount === 1) {
        const parts = cleanTrackName.split(' - ', 2);
        if (parts.length === 2) {
            trackArtist = parts[0].trim();
            trackTitle = parts[1].trim();
        }
    } else {
        trackArtist = cleanTrackName;
        trackTitle = cleanTrackName;
    }

    updateMediaSessionMetadata(trackTitle, trackArtist, media);

    if (document) {
        document.title = `${cleanTrackName}`;
    }

    if (trackName !== latestTrack) {
        recentTracks = recentTracks.filter(track => track !== trackName);
        recentTracks.unshift(trackName);
        if (recentTracks.length > 300) {
            recentTracks = recentTracks.slice(0, 300);
        }
        localStorage.setItem('recentTracks', JSON.stringify(recentTracks));
    }
}

async function loadStations(genre) {
    showLoadingSpinner();
    selectedContainer.classList.add('active');
    try {
        const stationsRef = ref(db, `stations/${genre}`);
        const snapshot = await get(stationsRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const stations = Object.values(data);
            renderStations(stations);
        } else {
            console.warn(`No data available for genre: ${genre}`);
            selectedContainer.innerHTML = '<p class="no-stations">No stations available</p>';
        }
        hideLoadingSpinner();
        if (currentSearchTerm && currentSearchTerm.trim() !== "") {
            filterStations();
        }
    } catch (err) {
        console.error("Error fetching stations:", err);
        hideLoadingSpinner();
    }
}

function initializeUI() {
    loadStations(defaultGenre);
    const defaultGenreButton = genreSelect?.querySelector(`[data-genre="${defaultGenre}"]`);

    defaultGenreButton.classList.add('active');

    genreSelect.addEventListener('click', (event) => {
        searchResultHeader.style.display = "none";
        const genreButton = event.target.closest('.genre-btn');
        const genre = genreButton.getAttribute('data-genre');
        document.querySelectorAll('.genre-content').forEach(c => c.classList.remove('active'));
        loadStations(genre);
        document.querySelectorAll('.genre-btn').forEach(button => {
            button.classList.remove('active');
        });
        genreButton.classList.add('active');
    });

    searchOption.addEventListener('change', handleSearchOptionChange);

    if (hideButton) {
        hideButton.addEventListener('click', togglePanel);
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', togglePanel);
    }

    stationSearch.addEventListener('input', function () {
        currentSearchTerm = this.value;
        debouncedFilterStations();
    });

    stopBtn.addEventListener('click', () => {
        stopPlayback();
    });

    historyDisplay.addEventListener('click', function () {
        displayRecentTracks();
    });

    copyIcon.addEventListener('click', () => {
        const textContent = metadataElement.textContent.trim();
        if (!textContent) {
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = textContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyIconSymbol.style.display = 'none';
        confirmation.style.display = 'inline-flex';
        setTimeout(() => {
            confirmation.style.display = 'none';
            copyIconSymbol.style.display = 'inline';
        }, 300);
    });

    playlistMenu.addEventListener('click', e => {
        if (!e.target.matches('.dropdown-item')) return;
        e.preventDefault();
        const selectedPlaylist = e.target.getAttribute('data-playlist');
        loadPlaylist(selectedPlaylist);
    });

    dismissBtn.addEventListener('click', () => {
        searchResultsWrapper.style.display = 'none';
    });

    searchResultsCollapse.addEventListener('show.bs.collapse', () => {
        collapseIcon.querySelector('i').className = 'fas fa-chevron-down';
    });

    searchResultsCollapse.addEventListener('hide.bs.collapse', () => {
        collapseIcon.querySelector('i').className = 'fas fa-chevron-up';
    });

    findRadioBtn.addEventListener('click', radioSearch);
    searchField.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            radioSearch();
        }
    });

    const websiteButtons = document.querySelectorAll('.togglesearch');
    for (let i = 0; i < websiteButtons.length; i++) {
        websiteButtons[i].addEventListener('click', function () {
            const websiteLabel = this.querySelector('.button-label').textContent;
            const searchTerm = searchTermsContainer.textContent;
            const websiteURL = getWebsiteURL(websiteLabel, searchTerm);
            if (websiteURL !== '') {
                window.open(websiteURL, '_blank');
            }
        });
    }
}

if (searchNavLink) {
    searchNavLink.addEventListener('click', handleSearchNavClick);
}

function handleSearchNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const offset = targetElement.offsetTop - 60;
        window.scrollTo({
            top: offset,
            behavior: 'smooth'
        });
        setTimeout(() => {
            searchInput.focus();
        }, 150);
    }
}

function renderStations(stations) {
    if (stations.length === 0) {
        selectedContainer.innerHTML = '<p class="no-stations">No stations available in this genre</p>';
        sakuin = [];
        return;
    }

    const genreHTML = stations.map(station => {
        const streamTypeClass = `stream-type-${station.host}`;
        const safeData = encodeURIComponent(JSON.stringify(station));
        return `
        <li data-station="${safeData}">
            <img src="${station.favicon || 'assets/radios/Unidentified2.webp'}" alt="${station.name}">
            <div class="flex-grow-1 info">
                <h5 class="mb-1 text-truncate">${station.name}</h5>
                <small class="stream-type ${streamTypeClass}">${station.host}</small>
            </div>
            <div class="ms-3 d-flex button-group">
                <a href="${station.homepage || station.url}" target="_blank" class="btn btn-sm btn-info">
                    <i class="fas fa-external-link-alt"></i>
                </a>
                <button class="btn btn-sm btn-dark download-button">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-primary main-play-button">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        </li>`;
    }).join('');

    selectedContainer.innerHTML = genreHTML;
    if (currentStation) {
        const stationElements = selectedContainer.querySelectorAll('li');

        const currentStationData = encodeURIComponent(JSON.stringify(currentStation));
        stationElements.forEach(el => {
            if (el.dataset.station === currentStationData) {
                const playButton = el.querySelector('.main-play-button');
                const currentMediaElement = mediaController && mediaController.media;
                const isCurrentlyPlaying = currentMediaElement ? !currentMediaElement.paused : false;
                el.classList.add('active-station');
                window.currentlyActiveLi = el;
                if (isCurrentlyPlaying && playButton) {
                    playButton.innerHTML = '<i class="fas fa-pause"></i>';
                    playButton.setAttribute('data-playing', 'true');
                    playButton.title = 'Pause';
                    playButton.classList.remove('btn-primary');
                    playButton.classList.add('btn-warning');
                }
            } else {
                el.classList.remove('active-station');
            }
        });
    }
    sakuin = stations.map((_, index) => index);
    stationCount.textContent = stations.length;
}

function filterStations() {
    const searchTerm = currentSearchTerm.trim().toLowerCase();
    const activeGenre = document.querySelector('.genre-content.active');
    if (!activeGenre) return;
    const items = activeGenre.querySelectorAll('li');
    let visibleCount = 0;
    items.forEach(item => {
        try {
            const station = JSON.parse(decodeURIComponent(item.dataset.station));
            const name = (station.name || '').toLowerCase();
            const host = (station.host || '').toLowerCase();
            const homepage = (station.homepage || '').toLowerCase();
            const url = (station.url || '').toLowerCase();
            const match =
                name.includes(searchTerm) ||
                host.includes(searchTerm) ||
                homepage.includes(searchTerm) ||
                url.includes(searchTerm)
            item.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        } catch (err) {
            console.warn('[stationSearch] Failed to parse data-station for an item:', err);
            item.style.display = 'none';
        }
    });

    let noResults = activeGenre.querySelector('.no-results');

    if (visibleCount === 0 && searchTerm.length > 0 && !noResults) {
        noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No stations found matching your search';
        noResults.style.gridColumn = '1 / -1';
        noResults.style.textAlign = 'center';
        noResults.style.padding = '20px';
        noResults.style.color = 'white';
        activeGenre.appendChild(noResults);
    } else if (visibleCount > 0 && noResults) {
        noResults.remove();
    } else if (visibleCount === 0 && searchTerm.length === 0 && noResults) {
        noResults.remove();
    }
};

randomplay.addEventListener('click', async function () {
    if (isRandomPlayRunning) {
        showNotification(`Please slow down!`, 'warning');
        return;
    }
    isRandomPlayRunning = true;
    const activeGenre = document.querySelector('.genre-content.active');
    if (!activeGenre) {
        isRandomPlayRunning = false;
        return;
    }
    const visibleStations = activeGenre.querySelectorAll('li');
    if (sakuin.length === 0) {
        isRandomPlayRunning = false;
        return;
    }
    const randomIndex = Math.floor(Math.random() * sakuin.length);
    const stationIndexToPlay = sakuin[randomIndex];
    const randomStationLi = visibleStations[stationIndexToPlay];
    try {
        const stationDataString = randomStationLi.dataset.station;
        if (!stationDataString) {
            console.error("Random station selected is missing data-station attribute.");
            return;
        }
        const media = JSON.parse(decodeURIComponent(stationDataString));
        const playButton = randomStationLi.querySelector('.main-play-button');
        await playMedia(media, playButton);
    } catch (err) {
        console.error("Failed to start random playback:", err);
    } finally {
        setTimeout(() => {
            isRandomPlayRunning = false;
        }, coolDown);
    }
});

document.addEventListener('click', function (event) {
    const target = event.target.closest('.download-button, .main-play-button');
    if (!target) return;

    if (target.hasAttribute('data-processing')) return;
    target.setAttribute('data-processing', 'true');
    setTimeout(() => target.removeAttribute('data-processing'), 1000);

    if (target.classList.contains('download-button')) {
        showNotification(`Downloading...`, 'success');
        handleDownloadClick(target);
    } else if (target.classList.contains('main-play-button')) {
        handlePlayClick(target);
    }
});

function handlePlayClick(button) {
    const parentLi = button.closest('li');
    const isCurrentlyPlaying = button.getAttribute('data-playing') === 'true';
    const stationDataString = parentLi.dataset.station;

    if (!stationDataString) {
        console.error("[handlePlayClick] Missing station data on <li> element.");
        return;
    }

    let mediaData;

    try {
        mediaData = JSON.parse(decodeURIComponent(stationDataString));
    } catch (err) {
        console.error('[handlePlayClick] Failed to parse media:', err);
        return;
    }
    if (!mediaData || !mediaData.url) {
        console.error("[handlePlayClick] Parsed media object is invalid or missing URL.");
        return;
    }

    const currentMedia = mediaController.querySelector('[slot="media"]');
    const isSameStationLoaded = currentMedia && (currentMedia.src === mediaData.url);

    if (isCurrentlyPlaying) {
        if (currentMedia) {
            currentMedia.pause();
        }
    } else {
        if (isSameStationLoaded) {
            currentMedia.play();
        } else {
            playMedia(mediaData, button);
        }
    }
}

function handleDownloadClick(button) {
    const parentLi = button.closest('li');
    if (!parentLi) return;
    try {
        const media = JSON.parse(decodeURIComponent(parentLi.dataset.station));
        RadioM3UDownload(media.url, media.name);
    } catch (err) {
        console.error("[handleDownloadClick] Failed to parse media:", err);
    }
}

function RadioM3UDownload(stationURL, stationName) {
    let cleanedURL = stationURL;

    if (cleanedURL.startsWith(appServices.proxyLink)) {
        cleanedURL = cleanedURL.substring(appServices.proxyLink.length);
    }

    const patternsToRemove = [
        /;stream\.nsv&type=mp3&quot;$/,
        /;&type=mp3$/,
        /;?type=http&nocache$/,
        /jmusicid-backend\?type=http&nocache=2$/,
        /\?type=http&nocache=1$/,
        /stream&nocache=1$/,
        /\?nocache=1$/,
        /;stream\.nsv?nocache=$/,
        /\?type=http$/,
        /\?nocache$/,
        /;&type=mp3$/,
        /;stream\.nsv$/
    ];

    patternsToRemove.forEach(pattern => {
        cleanedURL = cleanedURL.replace(pattern, "");
    });

    const newStationURL = cleanedURL;
    const m3uContent = `#EXTM3U\n#EXTINF:-1,${stationName}\n${newStationURL}`;
    const blob = new Blob([m3uContent], { type: "text/plain;charset=utf-8" });

    const radioURL = URL.createObjectURL(blob);
    const downloadRad = document.createElement("a");
    downloadRad.href = radioURL;
    downloadRad.download = `${stationName}.m3u`;
    downloadRad.click();

    URL.revokeObjectURL(radioURL);
}

async function stopPlayback() {
    if (!isPlaying) return;
    console.log("[stopPlayback] called");
    if (icecastPlayer) {
        icecastPlayer.stop();
        await icecastPlayer.detachAudioElement();
        icecastPlayer = null;
    }

    if (hlsPlayer) {
        try {
            hlsPlayer.stopLoad();
            hlsPlayer.destroy();
        } catch (err) {
            console.error("[cleanupPlayers] hls cleanup error:", err);
        }
        hlsPlayer = null;
    }

    const currentMedia = mediaController.querySelector('[slot="media"]');
    if (currentMedia) {
        currentMedia.pause();
        currentMedia.removeAttribute('src');
        currentMedia.load();
        currentMedia.remove();
    }

    if (metadataInterval) {
        clearInterval(metadataInterval);
        metadataInterval = null;
    }

    if (metadataEventSource) {
        metadataEventSource.close();
        metadataEventSource = null;
    }

    clearActiveStation();

    currentStation = null;
    isPlaying = false;
    coverImage.classList.remove('rotating');
    coverImage.src = "assets/ball.svg";
    nowPlaying.innerHTML = '';
    metadataElement.textContent = '';
    metaSource.textContent = '';

    stopMediaSession();
}

function clearActiveStation() {
    if (window.currentlyActiveLi) {
        window.currentlyActiveLi.classList.remove('active-station');
        const playButton = window.currentlyActiveLi.querySelector('.main-play-button');
        if (playButton) {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.setAttribute('data-playing', 'false');
            playButton.classList.remove('btn-warning');
            playButton.classList.add('btn-primary');
        }
        window.currentlyActiveLi = null;
    }
}

function updateActiveStationPlayButton(isPlaying) {
    if (!window.currentlyActiveLi) return;

    const playButton = window.currentlyActiveLi.querySelector('.main-play-button');
    if (playButton) {
        if (isPlaying) {
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            playButton.setAttribute('data-playing', 'true');
            playButton.title = 'Pause';
            playButton.classList.remove('btn-primary');
            playButton.classList.add('btn-warning');
        } else {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            playButton.setAttribute('data-playing', 'false');
            playButton.title = 'Play';
            playButton.classList.remove('btn-warning');
            playButton.classList.add('btn-primary');
        }
    }
}

async function playMedia(media, button) {
    await stopPlayback();
    const newAudioElement = document.createElement('audio');
    newAudioElement.setAttribute('slot', 'media');
    mediaController.appendChild(newAudioElement);
    newAudioElement.addEventListener('play', () => {
        updateActiveStationPlayButton(true);
    });
    newAudioElement.addEventListener('pause', () => {
        updateActiveStationPlayButton(false);
    });

    //showNotification(`Playback started.`, 'success');

    const parentLi = button.closest('li');
    if (parentLi) {
        parentLi.classList.add('active-station');
        window.currentlyActiveLi = parentLi;

        const playButton = parentLi.querySelector('.main-play-button');
        if (playButton) {
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            playButton.setAttribute('data-playing', 'true');
            playButton.classList.remove('btn-primary');
            playButton.classList.add('btn-warning');
        }
    }

    switch (media.host) {
        case "icecast":
            playIcecastStream(newAudioElement, media);
        case "zeno":
            playIcecastStream(newAudioElement, media);
            break;
        case "lautfm":
            playLautFM(newAudioElement, media);
            break;
        case "special":
            playSpecial(newAudioElement, media);
            break;
        case "hls":
            playHlsStream(newAudioElement, media);
            break;
        case "unknown":
            playUnknownStream(newAudioElement, media);
            break;
        default:
            if (media.url_resolved.includes('.m3u8')) {
                playHlsStream(newAudioElement, media);
            }
            else {
                playIcecastStream(newAudioElement, media);
            }
            break;
    }
    currentStation = media;
    updatePlayerUI(media);
    isPlaying = true;
}

function playHlsStream(audioEl, media) {
    if (Hls.isSupported()) {
        hlsPlayer = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        let retryCount = 0;
        const maxRetries = 3;
        let currentUrl = media.url_resolved || media.url;
        let isUsingProxy = false;
        const liveTrackName = media.name + ' (Live)';

        const loadStream = () => {
            hlsPlayer.loadSource(currentUrl);
            hlsPlayer.attachMedia(audioEl);
        };

        const handleRetry = (errorType) => {
            console.error(`HLS Error: ${errorType}`);

            if (isUsingProxy && (errorType === 'NETWORK_ERROR' || errorType === 'HTTP_ERROR')) {
                retryCount++;
                if (retryCount <= maxRetries) {
                    console.log(`Retry ${retryCount}/${maxRetries}: Switching to original URL`);
                    //showNotification(`Proxy failed, retrying with original URL (${retryCount}/${maxRetries})`, 'warning');

                    currentUrl = media.url_resolved || media.url;
                    isUsingProxy = false;

                    hlsPlayer.destroy();
                    setTimeout(() => {
                        playHlsStreamWithConfig(audioEl, media, currentUrl, retryCount);
                    }, 1000);
                    return true;
                }
            }
            if (retryCount >= maxRetries) {
                showNotification(`Failed to play stream after ${maxRetries} attempts. Stopping playback.`, 'danger');
                stopPlayback();
            } else {
                showNotification('Unrecoverable stream error. Stopping playback.', 'danger');
                stopPlayback();
            }
            return false;
        };

        const originalUrl = media.url_resolved || media.url;
        chosenUrl = originalUrl;

        if (chosenUrl.startsWith('http://') && !chosenUrl.startsWith(appServices.proxyLink)) {
            if (isRawIP(chosenUrl)) {
                console.warn('Skipping proxy for: ' + chosenUrl);
                showNotification(`Allow insecure content on your browser to play this stream or download the m3u file to play it`, 'warning');
            } else {
                chosenUrl = appServices.proxyLink + chosenUrl;
                isUsingProxy = true;
            }
        }

        currentUrl = chosenUrl;
        loadStream();

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (data && data.levels && data.levels.length > 0) {
                const stationName = data.levels[0].name || "Live Stream";
                metadataElement.textContent = stationName;
                trackHistory(liveTrackName, media);
                audioEl.play();

                retryCount = 0;
            }
        });

        hlsPlayer.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
            data.samples.forEach(sample => {
                window.jsmediatags.read(new Blob([sample.data]), {
                    onSuccess: (tag) => {
                        const tags = tag.tags;
                        const artist = tags.artist || "";
                        const title = tags.title || "";
                        const album = tags.album || "";
                        const genre = tags.genre || "";
                        const comment = tags.comment ? tags.comment.text : "";

                        let displayText = "";

                        if (artist && title) {
                            displayText = `${artist} - ${title}`;
                        } else if (title) {
                            displayText = `${title}`;
                        } else if (artist) {
                            displayText = `By: ${artist}`;
                        } else if (album) {
                            displayText = `Album: ${album}`;
                        } else if (genre) {
                            displayText = `Genre: ${genre}`;
                        } else if (comment) {
                            displayText = comment;
                        } else {
                            displayText = liveTrackName;
                        }
                        metadataElement.textContent = displayText;
                        trackHistory(displayText, media);
                    },
                    onError: (error) => {
                        console.warn("ID3 parse error:", error);
                        metadataElement.textContent = "Stream is live (metadata unavailable)";
                        trackHistory(liveTrackName, media);
                    }
                });
            });
        });

        hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                            data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
                            data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
                            if (!handleRetry('NETWORK_ERROR')) {
                                showNotification('HLS: Network error - trying to recover', 'warning');
                                hlsPlayer.startLoad();
                            }
                        } else {
                            showNotification('HLS: Network error - trying to recover', 'warning');
                            hlsPlayer.startLoad();
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        showNotification('HLS: Media error - trying to recover', 'warning');
                        hlsPlayer.recoverMediaError();
                        break;
                    default:
                        if (!handleRetry('CRITICAL_ERROR')) {
                            showNotification('HLS: Unrecoverable Error, stream is not playable. Stopping...', 'warning');
                            stopPlayback();
                        }
                        break;
                }
            } else {

                if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                    data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
                    data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR) {
                    console.warn(`HLS non-fatal error: ${data.details}`);
                    if (data.response && data.response.code >= 400) {
                        setTimeout(() => {
                            if (!handleRetry('HTTP_ERROR')) {
                                console.warn('HLS: HTTP error but continuing playback attempt');
                            }
                        }, 2000);
                    }
                }
            }
        });
    } else if (audioEl.canPlayType('application/vnd.apple.mpegurl')) {
        showNotification('HLS: Using native support', 'warning');
        audioEl.src = media.url_resolved || media.url;
        audioEl.play();
    } else {
        metadataElement.textContent = 'HLS not supported in this browser';
        showNotification('HLS: Not supported', 'warning');
        isPlaying = false;
    }
}

function playHlsStreamWithConfig(audioEl, media, url, retryCount) {
    const liveTrackName = media.name + ' (Live)';
    if (Hls.isSupported()) {
        hlsPlayer = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hlsPlayer.loadSource(url);
        hlsPlayer.attachMedia(audioEl);

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (data && data.levels && data.levels.length > 0) {
                const stationName = data.levels[0].name || "Live Stream";
                metadataElement.textContent = stationName;
                trackHistory(liveTrackName, media);
                audioEl.play();
            }
        });

        hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS error (retry ${retryCount}):`, data);
            if (data.fatal) {
                showNotification(`Failed to play stream after ${retryCount} retries. Stopping playback.`, 'danger');
                stopPlayback();
            }
        });
    }
}

function playIcecastStream(audioEl, media) {
    let totalAttempts = 0;
    let originalUrl = media.url_resolved || media.url;
    let currentUrl = originalUrl;
    let fallbackTriggered = false;
    let initialUrl = originalUrl;
    if (originalUrl.startsWith('http://') && !originalUrl.startsWith(appServices.proxyLink)) {
        if (isRawIP(originalUrl)) {
            console.warn('Skipping proxy for: ' + originalUrl);
            showNotification(`Allow insecure content on your browser to play this stream or download the m3u file to play it`, 'warning');
        } else {
            currentUrl = appServices.proxyLink + originalUrl;
            initialUrl = currentUrl;
        }
    }

    const shouldRetry = (errorString) => {
        const lowerCaseError = String(errorString).toLowerCase();
        const retryConditions = [
            'securityerror',
            'notsupportederror',
            'aborterror',
            '403',
            '500',
            'network',
            'load',
            'not allowed',
            'supported source',
            'mixed content',
            'connection closed',
            'invalid chunk'
        ];
        return retryConditions.some(condition => lowerCaseError.includes(condition));
    };

    async function attemptIcecastPlayback() {
        totalAttempts++;
        //showNotification(`Attempting playback (attempt ${totalAttempts}/${MAX_RETRIES + 1})`, 'success');
        if (icecastPlayer) {
            console.log("Cleaning up previous icecast player instance.");
            icecastPlayer.stop();
            await icecastPlayer.detachAudioElement();
        }
        try {
            icecastPlayer = new IcecastMetadataPlayer(currentUrl, {
                audioElement: audioEl,
                onMetadata: (metadata) => {
                    const currentTitle = metadata.StreamTitle;
                    if (currentTitle) {
                        metadataElement.textContent = currentTitle;
                        trackHistory(currentTitle, media);
                    } else {
                        const liveTrackName = media.name + ' (Live)';
                        metadataElement.textContent = liveTrackName;
                        trackHistory(liveTrackName, media);
                    }
                },
                metadataTypes: ["icy"],
                icyDetectionTimeout: 2000,
                enableLogging: false,
                onError: (message) => {
                    console.error("Icecast player error:", message);
                    handleIcecastError(String(message));
                },
                onLoad: () => {
                    metadataElement.textContent = 'Loading...';
                }
            });
            icecastPlayer.play().catch(err => {
                console.error("Error during icecast play:", err);
                handleIcecastError(String(err.message || err));
            });
        } catch (err) {
            console.error("Icecast initialization failed:", err);
            handleIcecastError(String(err.message || err));
        }
    }

    async function handleIcecastError(error) {
        console.log(`Icecast error (attempt ${totalAttempts}/${MAX_RETRIES + 1}):`, error);
        if (icecastPlayer) {
            try {
                icecastPlayer.stop();
                await icecastPlayer.detachAudioElement();
            } catch (err) {
                console.warn("Icecast cleanup error during retry:", err);
            }
            icecastPlayer = null;
        }
        if (!shouldRetry(error)) {
            console.warn("Icecast error is not transient, forcing fallback to playUnknownStream.");
            triggerFallbackToUnknown(`Icecast encountered a non-retryable error: ${error}`, audioEl);
            return;
        }
        if (totalAttempts > MAX_RETRIES) {
            console.warn("Max Icecast attempts reached, falling back to playUnknownStream");
            triggerFallbackToUnknown(`Icecast failed after ${totalAttempts} attempts`, audioEl);
            return;
        }
        let nextUrl = currentUrl;
        let retryMessage = '';
        const isCurrentlyProxy = currentUrl.includes(appServices.proxyLink) && currentUrl !== originalUrl;
        const canSwap = initialUrl !== originalUrl;
        if (canSwap) {
            if (totalAttempts % 2 !== 0) {
                if (isCurrentlyProxy) {
                    nextUrl = originalUrl;
                    retryMessage = `Proxy failed. Retrying with original URL (${totalAttempts + 1}/${MAX_RETRIES + 1})`;
                }
            } else {
                if (!isCurrentlyProxy) {
                    nextUrl = appServices.proxyLink + originalUrl;
                    retryMessage = `Original failed. Retrying with proxy URL (${totalAttempts + 1}/${MAX_RETRIES + 1})`;
                }
            }
        }
        currentUrl = nextUrl;
        console.log(retryMessage || `Retry ${totalAttempts}/${MAX_RETRIES}: Retrying same URL`);
        //showNotification(retryMessage || `Retrying stream... (${totalAttempts}/${MAX_RETRIES})`, 'warning');
        setTimeout(() => {
            attemptIcecastPlayback();
        }, 1000);
    }

    async function triggerFallbackToUnknown(reason, audioEl) {
        if (fallbackTriggered) return;
        fallbackTriggered = true;
        console.warn("Falling back to playUnknownStream:", reason);
        //showNotification(`Icecast failed, trying alternative method...`, 'warning');
        if (icecastPlayer) {
            icecastPlayer.stop();
            await icecastPlayer.detachAudioElement();
            icecastPlayer = null;
        }
        audioEl.src = '';
        playUnknownStream(audioEl, media);
    }
    attemptIcecastPlayback();
}

function playLautFM(audioEl, media) {
    audioEl.src = media.url;
    const apiUrl = `https://api.laut.fm/station/${getSpecialID(media.url)}/current_song`;
    startMetadataUpdate(apiUrl, 'lautfm', media);
    audioEl.play();
}

function playSpecial(audioEl, media) {
    audioEl.src = media.url;
    const apiUrl = `https://scraper2.onlineradiobox.com/${media.api}`;
    startMetadataUpdate(apiUrl, 'special', media);
    audioEl.play();
}
/*
function playZeno(media) {
    mainAudio.src = media.url;
    const zenoapiUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${getSpecialID(media.url)}`;
 
    metadataEventSource = new EventSource(zenoapiUrl);
    metadataEventSource.addEventListener('message', function (event) {
        processData(event.data);
    });
 
    metadataEventSource.addEventListener('error', function (event) {
        console.error('Stream endpoint not active:', event);
        metadataElement.textContent = 'Stream endpoint not active';
    });
 
    function processData(data) {
        try {
            const parsedData = JSON.parse(data);
 
            if (parsedData.streamTitle) {
                const streamTitle = parsedData.streamTitle.trim();
                trackHistory(streamTitle);
                metadataElement.textContent = streamTitle;
            } else {
                metadataElement.textContent = 'Metadata not available';
            }
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        }
 
    }
    mainAudio.play();
}*/

function playUnknownStream(audioEl, media) {
    let totalAttempts = 0;
    const originalUrl = media.url_resolved || media.url;
    let currentUrl = originalUrl;
    let initialUrl = originalUrl;
    if (originalUrl.startsWith('http://') && !originalUrl.startsWith(appServices.proxyLink)) {
        if (isRawIP(originalUrl)) {
            console.warn('Skipping proxy for: ' + originalUrl);
            showNotification('Allow insecure content on your browser to play this stream or download the m3u file to play it', 'warning');
        } else {
            currentUrl = appServices.proxyLink + originalUrl;
            initialUrl = currentUrl;
        }
    }

    const attemptPlayback = () => {
        totalAttempts++;
        console.log(`Attempting playback of unknown stream (attempt ${totalAttempts}/${MAX_RETRIES + 1})`);
        //showNotification(`Attempting playback (attempt ${totalAttempts}/${MAX_RETRIES + 1})`, 'success');
        audioEl.src = currentUrl;
        metadataElement.textContent = "Visit radio's homepage for playing info";
        const liveTrackName = media.name + ' (Live)';
        trackHistory(liveTrackName, media);
        audioEl.play().catch(err => {
            const error = err instanceof Error ? err : new Error(String(err || 'Unknown Playback Error'));
            handlePlaybackError(error);
        });
    }

    const handlePlaybackError = (error) => {
        console.warn(`Playback error (attempt ${totalAttempts}/${MAX_RETRIES + 1}):`, error.name, error.message);
        if (totalAttempts >= MAX_RETRIES + 1) {
            showNotification(`Failed to play stream after ${MAX_RETRIES + 1} attempts. Stopping playback.`, 'danger');
            stopPlayback();
            return;
        }
        if (shouldRetry(error)) {
            retryStream(error);
        } else {
            console.error("Non-retryable error encountered, stopping:", error);
            showNotification(`Stream failed. Stopping playback.`, 'danger');
            stopPlayback();
        }
    };

    const shouldRetry = (error) => {
        const retryConditions = [
            'SecurityError',
            'NotSupportedError',
            'AbortError',
            '403',
            '500',
            'network',
            'load',
        ];
        const messageConditions = [
            'not allowed',
            'supported source',
            'mixed content'
        ];
        return retryConditions.some(condition => error.name.toLowerCase().includes(condition)) ||
            messageConditions.some(condition => error.message.toLowerCase().includes(condition));
    };

    const retryStream = (error) => {
        let nextUrl = currentUrl;
        let retryMessage = '';
        const isCurrentlyProxy = currentUrl.includes(appServices.proxyLink) && currentUrl !== originalUrl;
        if (totalAttempts % 2 !== 0 && initialUrl !== originalUrl) {
            if (isCurrentlyProxy) {
                nextUrl = originalUrl;
                retryMessage = `Proxy failed. Retrying with original URL (${totalAttempts + 1}/${MAX_RETRIES + 1})`;
            } else {
                nextUrl = appServices.proxyLink + originalUrl;
                retryMessage = `Original failed. Retrying with proxy URL (${totalAttempts + 1}/${MAX_RETRIES + 1})`;
            }
        }

        currentUrl = nextUrl;
        console.log(retryMessage || `Retry ${totalAttempts}/${MAX_RETRIES}: Retrying same URL`);
        showNotification(retryMessage || `Retrying stream... (${totalAttempts}/${MAX_RETRIES})`, 'warning');
        setTimeout(attemptPlayback, 1000);
    };
    attemptPlayback();
}

function startMetadataUpdate(apiUrl, type, media) {
    const fetchMetadata = () => {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(jsonData => {
                updateMetadata(jsonData, type, media);
            })
            .catch(error => {
                console.error('Error fetching or processing data:', error);
                metadataElement.textContent = 'Stream not active';
            });
    };
    fetchMetadata();
    metadataInterval = setInterval(fetchMetadata, 10000);
}

function getSpecialID(Url) {
    const parts = Url.split('/');
    return parts[parts.length - 1];
}

const isRawIP = (url) => {
    const ipRegex = /(?:http|https):\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
    return ipRegex.test(url);
};

function formatLautTitle(jsonData) {
    try {
        const title = jsonData.title || '';
        const artistName = (jsonData.artist && jsonData.artist.name) || '';
        const streamTitle = `${artistName} - ${title}`;
        return streamTitle;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return 'No metadata';
    }
}

function updateMetadata(jsonData, type, media) {
    switch (type) {
        case 'lautfm':
            const streamTitle = formatLautTitle(jsonData);
            metadataElement.textContent = streamTitle;
            trackHistory(streamTitle, media);
            break;
        case 'special':
            try {
                const streamTitle = jsonData.title || 'No metadata';
                metadataElement.textContent = streamTitle;
                trackHistory(streamTitle, media);
            } catch (error) {
                console.error('Failed to parse JSON:', error);
                metadataElement.textContent = 'No metadata';
            }
            break;
        default:
            break;
    }
}

togglePlayerButton.addEventListener("click", () => {
    playerContainer.classList.toggle("minimized");
    expandIcon.classList.toggle("hidden");
    minimizeIcon.classList.toggle("hidden");
});

// search station with options using Radio Browser's API
const countries = ["United States", "Germany", "Russia", "France", "Greece", "China", "United Kingdom", "Mexico", "Italy", "Australia", "Canada", "India", "Spain", "Brazil", "Poland", "Philippines", "Argentina", "Netherlands", "United Arab Emirates", "Uganda", "Switzerland", "Romania", "Colombia", "Turkey", "Indonesia", "Belgium", "Chile", "Serbia", "Austria", "Hungary", "Peru", "Ukraine", "Czechia", "Portugal", "Bulgaria", "Croatia", "Denmark", "New Zealand", "Ireland", "Ecuador", "Sweden", "Japan", "Slovakia", "Afghanistan", "Uruguay", "Malaysia", "Norway", "South Africa", "Bosnia and Herzegovina", "Gibraltar", "Venezuela", "Saudi Arabia", "Dominican Republic", "Finland", "Israel", "Slovenia", "Kenya", "Taiwan", "South Korea", "Morocco", "Thailand", "Estonia", "Bolivia", "Tunisia", "Lithuania", "Latvia", "Guatemala", "Sri Lanka", "Pakistan", "Belarus", "Hong Kong", "Nigeria", "Costa Rica", "Iran", "Algeria", "Egypt", "Montenegro", "Cuba", "Honduras", "El Salvador", "North Macedonia", "Senegal", "Paraguay", "Albania", "Kazakhstan", "Lebanon", "Singapore", "Moldova", "Cyprus", "Ethiopia", "Jamaica", "Puerto Rico", "Macau", "Luxembourg", "Vietnam", "Georgia", "Nepal", "Iraq", "Jordan", "Syria"];

function populateCountries() {
    const selectElement = document.getElementById("countrySelect");
    countries.forEach(function (country) {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        selectElement.appendChild(option);
    });
}

const languages = ["English", "Spanish", "French", "Chinese", "Hindi", "Arabic", "Bengali", "Portuguese", "Russian", "Japanese", "German", "Korean", "Turkish", "Italian", "Dutch", "Polish", "Ukrainian", "Persian", "Malay", "Thai", "Swahili", "Yoruba", "Tagalog", "Sindhi", "Slovak", "Serbian", "Greek", "Hungarian", "Finnish", "Czech", "Croatian", "Danish", "Swedish", "Norwegian", "Lithuanian", "Latvian", "Estonian", "Romanian", "Bulgarian", "Albanian", "Vietnamese", "Indonesian", "Malagasy", "Swazi", "Zulu", "Xhosa", "Tamil", "Telugu", "Marathi", "Kannada", "Gujarati", "Punjabi", "Urdu", "Oromo", "Amharic", "Tigrinya", "Pashto", "Dari", "Farsi", "Kurdish", "Hausa", "Igbo", "Somali", "Fulani", "Akan", "Kinyarwanda", "Kirundi", "Shona", "Tswana", "Kinyamwezi", "Chichewa", "Lingala", "Bemba", "Sesotho", "Wolof", "Twi", "Berber", "Fula", "Wolof", "Berber", "Sotho", "Zarma", "Dinka", "Tigre", "Afrikaans", "Oshiwambo", "Sango", "Tswana", "Setswana", "Kikuyu", "Kongo", "Bambara", "Luganda", "Susu", "Zaghawa", "Mossi", "Khoekhoe"];

function populateLanguages() {
    const selectElement = document.getElementById("languageSelect");
    languages.forEach(function (language) {
        const option = document.createElement("option");
        option.value = language;
        option.textContent = language;
        selectElement.appendChild(option);
    });
}

const tags = ["pop", "music", "news", "rock", "classical", "talk", "radio", "hits", "community radio", "dance", "electronic", "80s", "oldies", "méxico", "christian", "jazz", "classic hits", "pop music", "top 40", "90s", "adult contemporary", "country", "house", "house", "folk", "chillout", "soul", "top40", "news talk", "metal", "hiphop", "techno", "rap", "sports", "ambient", "lounge", "culture", "disco", "funk", "retro", "electro", "top hits", "world music", "edm", "latino", "international", "relax", "college radio", "catholic", "christmas music", "pop dance", "hip-hop", "00s", "love songs", "club", "various", "mix", "iheart", "bible", "piano", "tech house", "vaporwave", "dj", "anime radio", "anime", "free japan music", "japanese", "japanese music", "japanese idols", "japan", "anime openings", "animegroove"];

function populateTags() {
    const selectElement = document.getElementById("tagSelect");
    tags.forEach(function (tag) {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        selectElement.appendChild(option);
    });
}

function handleSearchOptionChange() {
    const selectedOption = searchOption.value;

    searchField.style.display = 'none';
    countrySelectContainer.style.display = 'none';
    languageSelectContainer.style.display = 'none';
    tagSelectContainer.style.display = 'none';

    switch (selectedOption) {
        case 'byname':
            searchField.style.display = 'inline-block';
            break;
        case 'bycountry':
            countrySelectContainer.style.display = 'inline-block';
            populateCountries();
            break;
        case 'bylanguage':
            languageSelectContainer.style.display = 'inline-block';
            populateLanguages();
            break;
        case 'bytag':
            tagSelectContainer.style.display = 'inline-block';
            populateTags();
            break;
        default:
            break;
    }
    clearSearchField();
}

function clearSearchField() {
    searchField.value = '';
    countrySelect.value = '';
    languageSelect.value = '';
    tagSelect.value = '';
}

function radioSearch() {
    showLoadingSpinner();
    const searchBy = searchOption.value;
    let searchValue = '';
    switch (searchBy) {
        case 'byname':
            searchValue = searchField.value.toLowerCase();
            break;
        case 'bycountry':
            searchValue = countrySelect.value.toLowerCase();
            break;
        case 'bylanguage':
            searchValue = languageSelect.value.toLowerCase();
            break;
        case 'bytag':
            searchValue = tagSelect.value.toLowerCase();
            break;
        default:
            break;
    }

    if (searchValue === '' || searchBy === 'Search by') {
        showNotification(`Please enter a search term!`, 'warning');
        hideLoadingSpinner();
        return;
    }

    fetch(`${appServices.proxyLink}https://de2.api.radio-browser.info/json/stations/${searchBy}/${searchValue}?hidebroken=true&limit=150&order=clickcount&reverse=true`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                document.querySelectorAll('.genre-content').forEach(c => c.classList.remove('active'));
                document.querySelectorAll('.genre-btn').forEach(button => {
                    button.classList.remove('active');
                });
                searchResultHeader.innerHTML = `<div class="search-terms">Top 150 Radio Search Results for: <span id="searchTerms">${searchValue}</span><div>`;
                searchResultHeader.style.display = "block";
                searchResultContainer.classList.add('active');
                searchResultContainer.innerHTML = '';

                data.forEach(radio => {
                    const radioItem = document.createElement('li');
                    const safeData = encodeURIComponent(JSON.stringify(radio));
                    radioItem.setAttribute('data-station', safeData);
                    radioItem.innerHTML = `
                    <img src="${radio.favicon || 'assets/radios/Unidentified2.webp'}">
                    <div class="flex-grow-1 info">
                        <h5 class="mb-1 text-truncate">${radio.name}</h5>
                    </div>
                    <div class="ms-3 d-flex button-group">
                        <a href="${radio.homepage || radio.url}" target="_blank" class="btn btn-sm btn-info">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        <button class="btn btn-sm btn-dark download-button">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-primary main-play-button">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    `;
                    searchResultContainer.appendChild(radioItem);
                });
                hideLoadingSpinner();
                stationCount.textContent = data.length;
            } else {
                hideLoadingSpinner();
                searchResultHeader.style.display = "block";
                searchResultHeader.textContent = 'No result found.';
            }
        })
        .catch(error => {
            hideLoadingSpinner();
            console.error('Error fetching data:', error);
        });

    clearSearchField();
}

function showSearchResults() {
    searchResultsWrapper.style.display = 'block';
    searchResultsCollapse.classList.add('show');
    collapseIcon.querySelector('i').className = 'fas fa-chevron-down';
}

function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        showSearchResults();
        searchTermsContainer.textContent = searchTerm;

        const gscInput = document.querySelector('.gsc-input input');
        const gscClearButton = document.querySelector('.gsst_a');
        if (gscInput && gscClearButton) {
            gscInput.value = '';
            gscClearButton.click();
        }
        if (gscInput) {
            gscInput.value = searchTerm;
        }

        innerdeezer.innerHTML = '';
        innerlastfm.innerHTML = '';
        VideoDisplay.src = '';
        inneritunes.innerHTML = '';

        searchAcrossApis(searchTerm);
    }
    else {
        showNotification(`Please enter a search term!`, 'warning');
    }
    searchInput.value = '';
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

async function searchAcrossApis(searchTerm) {
    const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&format=json&limit=5&api_key=${appServices.lastfm}&track=${encodeURIComponent(searchTerm)}`;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(searchTerm)}&key=${appServices.ytkey}`;
    const itunesUrl = `${appServices.proxyLink}https://itunes.apple.com/search?limit=5&media=music&term=${encodeURIComponent(searchTerm)}`;
    const deezerUrl = `${appServices.proxyLink}https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=5`;

    const safeJsonFetch = async (url, apiName) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`${apiName} API returned status ${response.status}`);
                return null;
            }
            const text = await response.text();

            try {
                return JSON.parse(text);
            } catch (parseError) {
                console.error(`${apiName} API returned invalid JSON:`, parseError);
                console.debug(`${apiName} response starts with:`, text.substring(0, 100));
                return null;
            }
        } catch (fetchError) {
            console.error(`Error fetching from ${apiName} API:`, fetchError);
            return null;
        }
    };

    try {
        const [lastfmData, youtubeData, itunesData, deezerData] = await Promise.all([
            safeJsonFetch(lastfmUrl, "Last.fm"),
            safeJsonFetch(youtubeUrl, "YouTube"),
            safeJsonFetch(itunesUrl, "iTunes"),
            safeJsonFetch(deezerUrl, "Deezer")
        ]);
        const results = {
            lastfm: lastfmData ? formatLastfmResults(lastfmData) : [],
            youtube: youtubeData ? formatYoutubeResults(youtubeData) : [],
            itunes: itunesData ? formatItunesResults(itunesData) : [],
            deezer: deezerData ? formatDeezerResults(deezerData) : []
        };

        displayResults(results);
    } catch (error) {
        console.error("Error searching across APIs:", error);
        displayResults({ lastfm: [], youtube: [], itunes: [], deezer: [] });
    }
}

function formatLastfmResults(data) {
    if (!data || !data.results || !data.results.trackmatches) {
        return [];
    }
    return data.results.trackmatches.track.map(track => ({
        title: track.name,
        artist: track.artist,
    }));
}

function formatItunesResults(data) {
    if (!data || !data.results || data.results.length === 0) {
        return [];
    }
    return data.results.map(result => ({
        trackName: result.trackName,
        artistName: result.artistName,
        collectionName: result.collectionName,
        artworkUrl: result.artworkUrl100,
        previewUrl: result.previewUrl,
        trackId: result.trackId
    }));
}

function formatYoutubeResults(data) {
    if (!data || !data.items || data.items.length === 0) {
        return [];
    }
    return [{
        videoId: data.items[0].id.videoId,
    }];
}

function formatDeezerResults(data) {
    if (!data || !data.data) {
        return [];
    }
    else if (data.data.length === 0) {
        console.log("Blocked by Deezer?");
    }
    return data.data.map(track => ({
        title: track.title,
        artist: track.artist.name,
        cover: track.album.cover,
        album: track.album.title,
        preview: track.preview
    }));
}

function displayResults(results) {
    const lastfmResults = results.lastfm;
    const youtubeResults = results.youtube;
    const itunesResults = results.itunes;
    const deezerResults = results.deezer;
    const MAX_RESULTS = 5;

    VideoDisplay.style.display = "block";


    if (lastfmResults.length > 0) {
        const fragment = document.createDocumentFragment();
        const resultsCount = Math.min(MAX_RESULTS, lastfmResults.length);

        for (let i = 0; i < resultsCount; i++) {
            const song = lastfmResults[i];
            if (!song) continue;
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${song.artist} - ${song.title}`;
            fragment.appendChild(listItem);
        }
        document.getElementById('lastfmList').appendChild(fragment);
    } else {
        document.getElementById('lastfmList').innerHTML = '<h6 class="noresult mb-2">No results found on LastFM :(</h6>';
    }


    VideoDisplay.src = youtubeResults.length > 0
        ? `https://www.youtube.com/embed/${youtubeResults[0].videoId}`
        : `https://www.youtube.com/embed/SBQprWeOx8g`;


    if (itunesResults.length > 0) {
        const fragment = document.createDocumentFragment();
        itunesResults.slice(0, MAX_RESULTS).forEach(result => {
            const listItem = document.createElement('li');
            listItem.className = 'itunes-item';
            listItem.innerHTML = `
            <img class="search-cover" src="${result.artworkUrl}" alt="${result.trackName} cover art">
            <div class="info">
                <p><strong>${result.artistName} - ${result.trackName}</strong></p>
                <p class="album-name">${result.collectionName}</p>
            </div>
            <audio controls class="audio-preview">
                <source src="${result.previewUrl}" type="audio/mpeg">
            </audio>
        `;
            fragment.appendChild(listItem);
        });
        inneritunes.appendChild(fragment);
        const allAudioPlayers = document.querySelectorAll('.audio-preview');
        allAudioPlayers.forEach(player => {
            player.addEventListener('play', () => {
                allAudioPlayers.forEach(otherPlayer => {
                    if (otherPlayer !== player && !otherPlayer.paused) {
                        otherPlayer.pause();
                        otherPlayer.currentTime = 0;
                    }
                });
            });
        });
    } else {
        inneritunes.innerHTML = '<h6 class="noresult mb-2">No results found on iTunes :(</h6>';
    }

    if (deezerResults.length > 0) {
        const fragment = document.createDocumentFragment();
        const resultsToShow = Math.min(MAX_RESULTS, deezerResults.length);

        for (let i = 0; i < resultsToShow; i++) {
            const result = deezerResults[i];
            if (!result) continue;
            const listItem = document.createElement('li');
            listItem.className = 'itunes-item';
            listItem.innerHTML = `
            <img class="search-cover" src="${result.cover}" alt="${result.title}" 
                 onerror="this.src='default-music-cover.png'">
            <div class="info">
                <p><strong>${result.artist} - ${result.title}</strong></p>
                <p class="album-name">${result.album}</p>
            </div>
            <audio controls class="audio-preview">
                <source src="${result.preview}" type="audio/mp3">
            </audio>
            `;
            fragment.appendChild(listItem);
        }
        innerdeezer.appendChild(fragment);
        const audioPlayers = innerdeezer.querySelectorAll('audio');
        audioPlayers.forEach(player => {
            player.addEventListener('play', () => {
                audioPlayers.forEach(p => {
                    if (p !== player && !p.paused) {
                        p.pause();
                        p.currentTime = 0;
                    }
                });
            });
        });
    } else {
        innerdeezer.innerHTML = '<h6 class="noresult mb-2">No results found on Deezer :(</h6>';
    }
}

function getWebsiteURL(label, searchTerm) {
    let a = encodeURIComponent(searchTerm);
    switch (label) {
        case "Spotify":
            return `https://open.spotify.com/search/${a}`;
        case "Apple Music":
            return `https://music.apple.com/search?term=${a}`;
        case "Amazon Music":
            return `https://music.amazon.com/search/${a}`;
        case "Amazon Japan":
            return `https://music.amazon.co.jp/search/${a}`;
        case "YouTube":
            return `https://www.youtube.com/results?search_query=${a}`;
        case "YouTube Music":
            return `https://music.youtube.com/search?q=${a}`;
        case "网易云":
            return `https://music.163.com/#/search/m/?s=${a}`;
        case "VGMdb":
            return `https://vgmdb.net/search?q=${a}`;
        case "FollowLyrics":
            return `https://zh.followlyrics.com/search?name=${a}`;
        case "Kugeci":
            return `https://www.kugeci.com/search?q=${a}`;
        case "巴哈姆特":
            return `https://m.gamer.com.tw/search.php?q=${a}+歌詞`;
        case "Soundcloud":
            return `https://soundcloud.com/search?q=${a}`;
        case "Audio Archive":
            return `https://archive.org/details/audio?query=${a}`;
        case "last.fm":
            return `https://www.last.fm/search/tracks?q=${a}`;
        case "Google":
            return `https://www.google.com/search?q=${a}`;
        case "Google(Lyrics)":
            return `https://www.google.com/search?q=${a}+歌詞+lyrics`;
        case "Uta-net":
            return `https://www.uta-net.com/search/?target=art&type=in&keyword=${a}`;
        case "MusicBrainz":
            return `https://musicbrainz.org/search?query=${a}&type=work&method=indexed`;
        case "Gnudb":
            return `https://gnudb.org/song/${a}`;
        case "TouhouDB":
            return `https://touhoudb.com/Search?filter=${a}`;
        case "MikuDB":
            return `https://mikudb.moe/?s=${a}`;
        case "ニコニコ動画":
            return `https://www.nicovideo.jp/search/${a}`;
        case "VocaDB":
            return `https://vocadb.net/Search?filter=${a}`;
        case "PetitLyrics":
            return `https://petitlyrics.com/search_lyrics?title=${a}`;
        default:
            return ""
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();

    if (typeof db !== 'undefined') {
        window.chatApp = new ChatApp();
    }
});

class ChatApp {
    constructor() {
        this.chatPaths = {
            general: 'chats/general',
            mixednuts: 'chats/mixednuts'
        };
        this.currentChatPath = this.chatPaths.general;
        this.currentUser = null;
        this.activeListener = null;
        this.isSending = false;
        this.joinFormEl = document.querySelector('.joinform');
        this.chatContainerEl = document.querySelector('.chat_container');
        this.init();
    }

    init() {
        this.setupChatButtons();
        this.checkUserSession();
    }

    setupChatButtons() {
        const generalBtn = document.getElementById('generalChatBtn');
        const mixednutsBtn = document.getElementById('anotherChatBtn');
        if (generalBtn && mixednutsBtn) {
            generalBtn.addEventListener('click', () => this.switchChat('general'));
            mixednutsBtn.addEventListener('click', () => this.switchChat('mixednuts'));
        }
    }

    checkUserSession() {
        const savedName = localStorage.getItem('name');
        if (savedName) {
            this.currentUser = savedName;
            this.showChat();
        } else {
            this.showJoinForm();
        }
    }

    switchChat(room) {
        if (this.currentChatPath === this.chatPaths[room]) return;
        document.getElementById('generalChatBtn').classList.toggle('active', room === 'general');
        document.getElementById('anotherChatBtn').classList.toggle('active', room === 'mixednuts');
        this.currentChatPath = this.chatPaths[room];
        if (this.currentUser) {
            this.clearMessages();
            this.startListening();
        }
    }

    showJoinForm() {
        this.chatContainerEl.innerHTML = '';
        this.chatContainerEl.style.display = 'none';
        this.joinFormEl.innerHTML = `
            <div class="container mt-3">
                <div class="mb-3">
                    <input type="text" id="usernameInput" class="form-control" 
                           placeholder="Enter your name..." maxlength="20">
                </div>
                <button id="joinBtn" class="btn btn-primary w-100" disabled>
                    Join Chat
                </button>
            </div>
        `;
        this.joinFormEl.style.display = 'block';
        const usernameInput = document.getElementById('usernameInput');
        const joinBtn = document.getElementById('joinBtn');
        usernameInput.addEventListener('input', () => {
            const isValid = usernameInput.value.trim().length > 0;
            joinBtn.disabled = !isValid;
        });
        joinBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (!username) return;
            this.currentUser = username;
            localStorage.setItem('name', username);
            this.showChat();
        });
        usernameInput.focus();
    }

    showChat() {
        this.joinFormEl.style.display = 'none';
        this.buildChatUI();
        this.chatContainerEl.style.display = 'block';
        this.startListening();
    }

    buildChatUI() {
        const savedName = localStorage.getItem('name');
        this.chatContainerEl.innerHTML = `
            <div class="chat-content-wrapper">
                <div id="messagesContainer" class="messages-container"></div>
                <div class="message-input-area mt-3">
                    <div class="input-group">
                        <input type="text" id="messageInput" class="form-control" 
                               placeholder="Hi ${savedName}. Say Something..." maxlength="2000">
                        <button id="sendBtn" class="btn btn-primary" disabled>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                <div class="text-center mt-2">
                    <button id="logoutBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        `;
        this.setupChatEvents();
    }

    setupChatEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        messageInput.addEventListener('input', () => {
            const hasText = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasText;
        });
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !sendBtn.disabled) {
                this.sendMessage(messageInput.value.trim());
                messageInput.value = '';
                sendBtn.disabled = true;
            }
        });
        sendBtn.addEventListener('click', () => {
            this.sendMessage(messageInput.value.trim());
            messageInput.value = '';
            sendBtn.disabled = true;
        });
        logoutBtn.addEventListener('click', () => this.logout());
        setTimeout(() => messageInput.focus(), 100);
    }

    async sendMessage(text) {
        if (!text || !this.currentUser || this.isSending) return;
        this.isSending = true;
        const messageData = {
            text: String(text),
            user: String(this.currentUser),
            timestamp: Date.now()
        };
        try {
            const messageRef = ref(db, this.currentChatPath);
            const newMessageRef = push(messageRef);
            await set(newMessageRef, {
                message: messageData.text,
                name: messageData.user,
                timestamp: messageData.timestamp
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            this.isSending = false;
        }
    }

    startListening() {
        this.stopListening();
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        messagesContainer.innerHTML = '<div class="text-center text-muted py-3">Loading messages...</div>';
        const chatRef = ref(db, this.currentChatPath);
        const chatQuery = query(chatRef, orderByChild('timestamp'));
        this.activeListener = onValue(chatQuery, (snapshot) => {
            this.handleMessages(snapshot, messagesContainer);
        }, (error) => {
            console.error('Firebase listener error:', error);
            messagesContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error loading messages. Please refresh the page.
                </div>
            `;
        });
    }

    handleMessages(snapshot, container) {
        if (!snapshot.exists()) {
            container.innerHTML = '<div class="text-center text-muted py-3">No messages yet. Start the conversation!</div>';
            return;
        }
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            const msg = childSnapshot.val();
            if (msg && msg.timestamp) {
                messages.push({
                    id: childSnapshot.key,
                    ...msg
                });
            }
        });

        messages.sort((a, b) => a.timestamp - b.timestamp);
        container.innerHTML = '';
        messages.forEach(msg => {
            const messageEl = this.createMessageElement(msg);
            container.appendChild(messageEl);
        });
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }

    createMessageElement(msg) {
        const isOwnMessage = msg.name === this.currentUser;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwnMessage ? 'own-message' : 'other-message'}`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-user">${this.escapeHtml(msg.name || 'Unknown')}</span>
                <span class="message-time">${this.formatTime(msg.timestamp)}</span>
            </div>
            <div class="message-body">
                ${this.linkifyText(this.escapeHtml(msg.message || ''))}
            </div>
        `;
        return messageDiv;
    }

    clearMessages() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = '<div class="text-center text-muted py-3">Loading messages...</div>';
        }
    }

    stopListening() {
        if (this.activeListener) {
            this.activeListener();
            this.activeListener = null;
        }
    }

    logout() {
        this.stopListening();
        this.currentUser = null;
        localStorage.removeItem('name');
        this.showJoinForm();
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    linkifyText(text) {
        if (!text) return '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, url =>
            `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
        );
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const getFormattedDate = (d) => {
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            return `${year}/${month}/${day}`;
        };
        const getFormattedTime = (d) => {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        if (date.toDateString() === now.toDateString()) {
            return getFormattedTime(date);
        }
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${getFormattedTime(date)}`;
        }
        return `${getFormattedDate(date)} ${getFormattedTime(date)}`;
    }
}

async function loadPlaylist(playlistName) {
    try {
        showLoadingSpinner();
        const audioRef = ref(db, `audioList/${playlistName}`);
        const snapshot = await get(audioRef);
        const data = snapshot.val();

        if (!data) {
            hideLoadingSpinner();
            console.warn(`No audio data found for: ${playlistName}`);
            if (ap) ap.destroy();
            container.style.display = 'none';
            return;
        }

        const audioArray = Object.values(data).map(item => ({
            name: item.name,
            artist: item.artist,
            url: item.url,
            cover: item.cover || 'assets/sasalele_logo-removebg.webp'
        }));

        if (container) container.style.display = 'block';
        if (ap) ap.destroy();

        ap = new APlayer({
            container: document.getElementById('aplayer'),
            lrcType: 1,
            audio: audioArray
        });

        ap.on('play', updatePlayerTitleAndMediaSession);
        hideLoadingSpinner();
    } catch (error) {
        console.error("Error loading playlist:", error);
        hideLoadingSpinner();
        alert("Error loading playlist: " + error.message);
    }

    function updatePlayerTitleAndMediaSession() {
        const currentTrackIndex = ap.list.index;
        const currentTrack = ap.list.audios[currentTrackIndex];
        if (currentTrack) {
            const trackName = `${currentTrack.artist || 'Unknown Artist'} - ${currentTrack.name || 'Unknown Title'}`;
            trackHistory(trackName, playlistName);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: currentTrack.name || 'Unknown Track',
                    artist: currentTrack.artist || 'Unknown Artist',
                    album: playlistName,
                    artwork: [{
                        src: currentTrack.cover || 'assets/sasalele_logo-removebg.webp',
                        sizes: '96x96'
                    }]
                });
            }
        }
    }
}