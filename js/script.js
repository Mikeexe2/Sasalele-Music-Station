const cover = document.getElementById('cover');
const playerContainer = document.getElementById("player");
const expandIcon = document.querySelector("#togglePlayer .fa-expand");
const minimizeIcon = document.querySelector("#togglePlayer .fa-compress");
const coverImage = document.getElementById('ip');
const nowPlaying = document.getElementById('nowPlaying');
const stationCount = document.getElementById('station-count');
const historyDisplay = document.getElementById('historyBtn');
const randomplay = document.getElementById('randomplay');
const togglePlayerButton = document.getElementById("togglePlayer");
const copyIcon = document.getElementById('copyIcon');
const copyIconSymbol = copyIcon.querySelector('i.fas.fa-copy');
const confirmation = document.querySelector('#copyIcon .copy-confirmation');
const stationSearch = document.getElementById('sasalelesearch');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const innerContainer = document.querySelector('.search-results');
const searchTermsContainer = document.getElementById('searchTerms');
const VideoDisplay = document.getElementById("YouTubeVideo");
const innerlastfm = document.getElementById('lastfmList');
const inneritunes = document.getElementById('itunesList');
const innerdeezer = document.getElementById('deezerList');
const metadataElement = document.getElementById('metadataDisplay');
const genreSelect = document.getElementById('genre-select');
const mainAudio = document.getElementById('mainAudio');

let genreData = [];
let hlsPlayer = null;
let icecastPlayer = null;
let currentStation = null;
let isPlaying = false;
let metadataInterval = null;
let metadataEventSource = null;

const searchTab = document.querySelector('.nav-link[href="#search"]');
if (searchTab) {
    searchTab.addEventListener("click", () => {
        const si = document.getElementById('searchInput');
        if (si) si.focus();
    });
}

historyDisplay.addEventListener('click', function () {
    displayRecentTracks();
});

copyIcon.addEventListener('click', () => {

    const textarea = document.createElement('textarea');
    textarea.value = metadataElement.textContent.trim();
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    copyIconSymbol.style.display = 'none';
    confirmation.style.display = 'inline-flex';

    setTimeout(() => {
        confirmation.style.display = 'none';
        copyIconSymbol.style.display = 'inline';
    }, 500);
});

function updatePlayerUI(media) {
    coverImage.src = `${media.favicon ? media.favicon : 'assets/radios/Unidentified2.webp'}`;
    coverImage.classList.add('rotating');

    nowPlaying.innerHTML = `<a href="${media.homepage || media.url}" target="_blank" class="homepagelink">${media.name}</a>`;
    document.getElementById('metadataSource').textContent = `Stream type: ${media.host}`;
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

function trackHistory(trackName) {
    let recentTracks = JSON.parse(localStorage.getItem('recentTracks')) || [];
    recentTracks = recentTracks.filter(track => track !== trackName);

    recentTracks.unshift(trackName);

    if (recentTracks.length > 10) {
        recentTracks = recentTracks.slice(0, 10);
    }
    localStorage.setItem('recentTracks', JSON.stringify(recentTracks));
}

function loadStations(genre) {
    const selectedContainer = document.getElementById(genre);
    if (!selectedContainer) return;

    document.getElementById('loadingSpinner').style.display = 'block';
    selectedContainer.classList.add('active');

    firebase.database().ref("stations/" + genre)
        .once("value")
        .then(snapshot => {
            const data = snapshot.val() || {};
            const stations = Object.values(data);
            console.log(`[loadStations] Loaded ${stations.length} stations for ${genre}`);
            renderStations(stations, genre);
            document.getElementById('loadingSpinner').style.display = 'none';
        })
        .catch(error => {
            console.error("[loadStations] Error fetching stations:", error);
            selectedContainer.innerHTML = '<p class="no-stations">Error loading stations</p>';
        });
}

function initializeUI() {
    const defaultGenre = "jmusic";
    loadStations(defaultGenre);
    const defaultGenreButton = genreSelect?.querySelector(`[data-genre="${defaultGenre}"]`);
    if (defaultGenreButton) {
        defaultGenreButton.classList.add('active');
    }
    if (genreSelect) {
        genreSelect.addEventListener('click', (event) => {
            const genreButton = event.target.closest('.genre-btn');
            if (genreButton) {
                const genre = genreButton.getAttribute('data-genre');
                document.querySelectorAll('.genre-content').forEach(c => c.classList.remove('active'));
                loadStations(genre);
                document.querySelectorAll('.genre-btn').forEach(button => {
                    button.classList.remove('active');
                });
                genreButton.classList.add('active');
            }
        });
        setupPlayerControls();
    }
}

function renderStations(stations, genre) {
    const selectedContainer = document.getElementById(genre);
    if (!selectedContainer) return;

    if (stations.length === 0) {
        selectedContainer.innerHTML = '<p class="no-stations">No stations available in this genre</p>';
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
        stationElements.forEach(el => {
            const name = el.querySelector('h5').textContent;
            if (name.toLowerCase() === currentStation.name.toLowerCase()) {
                el.classList.add('active-station');
            }
        });
    }

    if (typeof stationCount !== 'undefined' && stationCount) {
        stationCount.textContent = stations.length;
    }
}

stationSearch.addEventListener('input', function () {
    const searchTerm = this.value.trim().toLowerCase();
    const activeGenre = document.querySelector('.genre-content.active');

    if (!activeGenre) return;

    const items = activeGenre.querySelectorAll('li');
    let visibleCount = 0;

    items.forEach(item => {
        try {
            const station = JSON.parse(decodeURIComponent(item.dataset.station));
            const name = (station.name || '').toLowerCase();
            const host = (station.host || '').toLowerCase();

            const match =
                name.includes(searchTerm) ||
                host.includes(searchTerm)

            item.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        } catch (err) {
            console.warn('[stationSearch] Failed to parse data-station for an item:', err);
            item.style.display = 'none';
        }
    });

    let noResults = activeGenre.querySelector('.no-results');
    if (visibleCount === 0 && !noResults) {
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
    }
});

randomplay.addEventListener('click', function () {
    const activeGenre = document.querySelector('.genre-content.active');
    if (!activeGenre) return;

    const visibleStations = [...activeGenre.querySelectorAll('li:not([style*="display: none"])')];
    if (visibleStations.length === 0) return;

    const randomIndex = Math.floor(Math.random() * visibleStations.length);
    const playButton = visibleStations[randomIndex].querySelector('.main-play-button');
    playButton?.click();
});

document.addEventListener('click', function (event) {
    const target = event.target.closest('.download-button, .main-play-button');
    if (!target) return;

    if (target.hasAttribute('data-processing')) return;
    target.setAttribute('data-processing', 'true');
    setTimeout(() => target.removeAttribute('data-processing'), 1000);

    if (target.classList.contains('download-button')) {
        handleDownloadClick(target);
    } else if (target.classList.contains('main-play-button')) {
        handlePlayClick(target);
    }
});

function handlePlayClick(button) {
    const parentLi = button.closest('li');
    if (!parentLi) return;
    try {
        const media = JSON.parse(decodeURIComponent(parentLi.dataset.station));
        playMedia(media, button);
    } catch (err) {
        console.error("[handlePlayClick] Failed to parse media:", err);
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

function setupPlayerControls() {
    const stopBtn = document.getElementById('stopBtn');
    stopBtn.addEventListener('click', () => {
        stopPlayback();
    });
}

function RadioM3UDownload(stationURL, stationName) {
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

    let cleanedURL = stationURL;
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
    try {
        if (mainAudio && !mainAudio.paused && mainAudio.readyState > 0) {
            await mainAudio.pause();
            console.log("[stopPlayback] pause player");
        } else {
            console.log("[stopPlayback] mainAudio already paused or not ready");
        }
    } catch (err) {
        console.warn("[stopPlayback] pause() error (ignored):", err);
    }

    if (icecastPlayer) {
        try {
            icecastPlayer.stop();
            icecastPlayer.detachAudioElement();
        } catch (err) {
            console.error("[cleanupPlayers] icecast cleanup error:", err);
        }
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

    if (mainAudio) {
        mainAudio.removeAttribute("src");
        mainAudio.load();
    }

    if (metadataInterval) {
        clearInterval(metadataInterval);
        metadataInterval = null;
    }

    if (metadataEventSource) {
        metadataEventSource.close();
        metadataEventSource = null;
    }

    isPlaying = false;
    document.getElementById('hlsStatus').textContent = '';
    coverImage.src = "assets/NezukoYay.gif";
    coverImage.classList.remove('rotating');

    document.querySelectorAll('li').forEach(li => {
        li.classList.remove('active-station');
    });
    nowPlaying.textContent = '';
    metadataElement.textContent = '';
    document.getElementById('metadataSource').textContent = "";

    currentStation = null;
}

async function playMedia(media, button) {
    await stopPlayback();

    document.querySelectorAll('li').forEach(li => {
        li.classList.remove('active-station');
    });

    const parentLi = button.closest('li');
    if (parentLi) parentLi.classList.add('active-station');

    switch (media.host) {
        case "icecast":
            playIcecastStream(media);
            break;
        case "zeno":
            playZeno(media);
            break;
        case "lautfm":
            playLautFM(media);
            break;
        case "special":
            playSpecial(media);
            break;
        case "hls":
            playHlsStream(media);
            break;
        case "unknown":
            playUnknownStream(media);
            break;
        default:
            playIcecastStream(media);
            break;
    }
    currentStation = media;
    updatePlayerUI(media);
    isPlaying = true;
}

function playHlsStream(media) {
    if (Hls.isSupported()) {
        hlsPlayer = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hlsPlayer.loadSource(media.url);
        hlsPlayer.attachMedia(mainAudio);

        hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (data && data.levels && data.levels.length > 0) {
                const stationName = data.levels[0].name || "Live Stream";
                metadataElement.textContent = stationName;
                mainAudio.play();
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
                            displayText = `Now Playing: ${title}`;
                        } else if (artist) {
                            displayText = `By: ${artist}`;
                        } else if (album) {
                            displayText = `Album: ${album}`;
                        } else if (genre) {
                            displayText = `Genre: ${genre}`;
                        } else if (comment) {
                            displayText = comment;
                        } else {
                            displayText = "Stream is live (no metadata)";
                        }
                        metadataElement.textContent = displayText;

                    },
                    onError: (error) => {
                        console.warn("ID3 parse error:", error);
                        metadataElement.textContent =
                            "Stream is live (metadata unavailable)";
                    }
                });
            });
        });

        hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        document.getElementById('hlsStatus').textContent = 'HLS: Network error - trying to recover';
                        hlsPlayer.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        document.getElementById('hlsStatus').textContent = 'HLS: Media error - trying to recover';
                        hlsPlayer.recoverMediaError();
                        break;
                    default:
                        document.getElementById('hlsStatus').textContent = 'HLS: Unrecoverable error';
                        stopPlayback();
                        break;
                }
            }
        });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        document.getElementById('hlsStatus').textContent = 'HLS: Using native support';
        mainAudio.play();
    } else {
        metadataElement.textContent = 'HLS not supported in this browser';
        document.getElementById('hlsStatus').textContent = 'HLS: Not supported';
        isPlaying = false;
    }
}

function playIcecastStream(media) {
    const chosenUrl = media.url_resolved || media.url;
    try {
        icecastPlayer = new IcecastMetadataPlayer(chosenUrl, {
            audioElement: mainAudio,
            onMetadata: (metadata) => {
                if (metadata.StreamTitle) {
                    metadataElement.textContent = metadata.StreamTitle;
                } else {
                    metadataElement.textContent = 'No track information available';
                }
            },
            onError: (message) => {
                metadataElement.textContent = 'Error: ' + message;
                console.warn("Falling back to playUnknownStream...");
                icecastPlayer.stop();
                icecastPlayer.detachAudioElement();
                icecastPlayer = null;
                playUnknownStream(media);
            },
            onLoad: () => {
                metadataElement.textContent = 'Loading...';
            },
            onEnd: () => {
                metadataElement.textContent = 'Stream ended';
            },
            enableLogging: true
        });
        icecastPlayer.play();
    } catch (err) {
        console.error("Icecast player initialization failed:", err);
        icecastPlayer.stop();
        icecastPlayer.detachAudioElement();
        icecastPlayer = null;
        playUnknownStream(media);
    }
}

function playLautFM(media) {
    mainAudio.src = media.url;
    const apiUrl = `https://api.laut.fm/station/${getSpecialID(media.url)}/current_song`;
    startMetadataUpdate(apiUrl, 'lautfm');
    mainAudio.play();
}

function playSpecial(media) {
    mainAudio.src = media.url;
    const apiUrl = `https://scraper2.onlineradiobox.com/${media.api}`;
    startMetadataUpdate(apiUrl, 'special');
    mainAudio.play();
}

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
}

function playUnknownStream(media) {
    const chosenUrl = media.url_resolved || media.url;
    mainAudio.src = chosenUrl;
    metadataElement.textContent = "Visit radio's homepage for playing info";
    mainAudio.play();

    mainAudio.addEventListener('error', (e) => {
        console.warn("Unknown stream failed to play, falling back to HLS...", e);
        playHlsStream(media);
    });
}

function startMetadataUpdate(apiUrl, type) {
    const fetchMetadata = () => {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(jsonData => {
                updateMetadata(jsonData, type);
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

function formatLautTitle(jsonData) {
    try {
        const title = jsonData.title || '';
        const artistName = (jsonData.artist && jsonData.artist.name) || '';
        const streamTitle = `${artistName} - ${title}`;
        return streamTitle;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return 'Metadata not available';
    }
}

function updateMetadata(jsonData, type) {
    switch (type) {
        case 'lautfm':
            const streamTitle = formatLautTitle(jsonData);
            metadataElement.textContent = streamTitle;
            trackHistory(streamTitle);
            break;
        case 'special':
            try {
                const streamTitle = jsonData.title || 'No metadata';
                metadataElement.textContent = streamTitle;
                trackHistory(streamTitle);
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

const countrySelectContainer = document.getElementById('countrySelectContainer');
const countrySelect = document.getElementById('countrySelect');
const languageSelectContainer = document.getElementById('languageSelectContainer');
const languageSelect = document.getElementById('languageSelect');
const tagSelectContainer = document.getElementById('tagSelectContainer');
const tagSelect = document.getElementById('tagSelect');
const searchOption = document.getElementById('searchOption');
const findRadioBtn = document.getElementById("radiosearch");
const searchField = document.getElementById('search-field');
const searchResultContainer = document.querySelector('.radio-result-container');
const searchResultHeader = document.querySelector('.radio-result-header');
const findradio = document.querySelector('.radioresultsdisplay');
const downloadRadio = document.querySelector('.download-button');

findRadioBtn.addEventListener('click', radioSearch);
searchField.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        radioSearch();
    }
});

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
    document.getElementById('loadingSpinner').style.display = 'block';
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
        case 'bytag': info
            searchValue = tagSelect.value.toLowerCase();
            break;
        default:
            break;
    }

    if (searchValue === '' || searchBy === 'Search by') {
        return;
    }
    searchResultContainer.classList.remove('active');
    findradio.style.display = "block";

    fetch(`https://sasalele.apnic-anycast.workers.dev/https://de2.api.radio-browser.info/json/stations/${searchBy}/${searchValue}?hidebroken=true&limit=150&order=clickcount&reverse=true`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                document.getElementById('loadingSpinner').style.display = 'none';
                searchResultHeader.innerHTML = `Radio Search Results for: <mark id="searchTerms">${searchValue}</mark>`;
                searchResultContainer.classList.add('active');
                searchResultContainer.innerHTML = '';

                data.forEach(radio => {
                    const radioItem = document.createElement('li');
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

                searchResultContainer.addEventListener('click', function (event) {
                    const downloadButton = event.target.closest('.download-button');
                    if (downloadButton) {
                        event.stopPropagation();
                        const parentLi = downloadButton.closest('li');
                        const stationName = parentLi.querySelector('h5').textContent;
                        const media = data.find(st => st.name === stationName);
                        if (media) {
                            initiateM3UDownload(media.url, media.name);
                        }
                    }

                    const playButton = event.target.closest('.main-play-button');
                    if (playButton) {
                        const parentLi = playButton.closest('li');
                        const stationName = parentLi.querySelector('h5').textContent;
                        const radio = data.find(st => st.name === stationName);
                        if (radio) {
                            playMedia(radio, playButton);
                        }
                    }
                });
            } else {
                document.getElementById('loadingSpinner').style.display = 'none';
                searchResultHeader.style.display = "block";
                searchResultHeader.textContent = 'No result found.';
            }
        })
        .catch(error => {
            document.getElementById('loadingSpinner').style.display = 'none';
            console.error('Error fetching data:', error);
        });

    clearSearchField();
}

function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        innerContainer.style.display = 'block';
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
    searchInput.value = '';
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

async function searchAcrossApis(searchTerm) {
    const proxyLink = "https://sasalele.apnic-anycast.workers.dev/";

    const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&format=json&limit=5&api_key=b9747c75368b42160af4301c2bf654a1&track=${encodeURIComponent(searchTerm)}`;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(searchTerm)}&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s`;
    const itunesUrl = `${proxyLink}https://itunes.apple.com/search?limit=5&media=music&term=${encodeURIComponent(searchTerm)}`;
    const deezerUrl = `${proxyLink}https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=5`;

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
    if (!data || !data.data || data.data.length === 0) {
        return [];
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
        const itunesList = document.getElementById('itunesList');
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
        itunesList.appendChild(fragment);
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
        document.getElementById('itunesList').innerHTML = '<h6 class="noresult mb-2">No results found on iTunes :(</h6>';
    }

    if (deezerResults.length > 0) {
        const deezerList = document.getElementById('deezerList');
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
        deezerList.appendChild(fragment);
        const audioPlayers = deezerList.querySelectorAll('audio');
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
        document.getElementById('deezerList').innerHTML = '<h6 class="noresult mb-2">No results found on Deezer :(</h6>';
    }
}

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

const toggleButton = document.getElementById('toggleButton');
const panel = document.getElementById('sidePanel');
const hideButton = document.getElementById('hideButton');

function togglePanel() {
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
}
toggleButton.addEventListener('click', togglePanel);

hideButton.addEventListener('click', function () {
    panel.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
    var db = firebase.database();

    initializeUI();
    siteTime();

    function createElement(tag, id, innerHTML, attributes = {}) {
        const element = document.createElement(tag);
        if (id) element.id = id;
        if (innerHTML) element.innerHTML = innerHTML;
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    class Sasalele {
        home() {
            var chatContainer = document.querySelector('.chat_container');
            if (chatContainer) {
                chatContainer.innerHTML = '';
            }
            this.createJoinForm();
        }

        chat() {
            this.createChat();
        }

        createJoinForm() {
            const parent = this;
            const joinFormContainer = document.querySelector('.joinform');

            const joinInnerContainer = createElement('div', 'join_inner_container');
            const joinButtonContainer = createElement('div', 'join_button_container');
            const joinButton = createElement('button', 'join_button', 'Join <i class="fas fa-sign-in-alt"></i>');
            const joinInputContainer = createElement('div', 'join_input_container');
            const joinInput = createElement('input', 'join_input', null, { maxlength: 20, placeholder: 'Input your name...' });

            joinButton.classList.add('disabled');

            joinInput.addEventListener('keyup', () => {
                const isEnabled = joinInput.value.length > 0;
                joinButton.classList.toggle('enabled', isEnabled);
                joinButton.classList.toggle('disabled', !isEnabled);
            });

            joinButton.addEventListener('click', () => {
                if (joinButton.classList.contains('enabled')) {
                    parent.saveName(joinInput.value);
                    joinFormContainer.innerHTML = '';
                    parent.createChat();
                }
            });

            joinButtonContainer.appendChild(joinButton);
            joinInputContainer.appendChild(joinInput);
            joinInnerContainer.append(joinInputContainer, joinButtonContainer);
            joinFormContainer.appendChild(joinInnerContainer);
        }

        createChat() {
            const parent = this;
            const chatContainer = document.querySelector('.chat_container');
            chatContainer.innerHTML = '';

            const chatInnerContainer = createElement('div', 'chat_inner_container');
            const chatContentContainer = createElement('div', 'chat_content_container');
            const chatInputContainer = createElement('div', 'chat_input_container');

            const chatInputSend = createElement('button', 'chat_input_send', `<i class="far fa-paper-plane"></i>`, { disabled: true });
            const chatInput = createElement('input', 'chat_input', '', { maxlength: 2000 });
            chatInput.placeholder = `Hi ${parent.getName()}. Say something...`;

            const chatLogout = createElement('button', 'chat_logout', `${parent.getName()} • logout`);
            chatLogout.onclick = function () {
                localStorage.clear();
                parent.home();
            };

            const chatLogoutContainer = createElement('div', 'chat_logout_container');
            chatLogoutContainer.append(chatLogout);

            chatInputContainer.append(chatInput, chatInputSend);
            chatInnerContainer.append(chatContentContainer, chatInputContainer, chatLogoutContainer);
            chatContainer.append(chatInnerContainer);


            chatInput.addEventListener("input", function () {
                const hasValue = chatInput.value.length > 0;
                chatInputSend.disabled = !hasValue;
                chatInputSend.classList.toggle('enabled', hasValue);
            });

            chatInput.addEventListener("keyup", function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    chatInputSend.click();
                }
            });

            chatInputSend.addEventListener("click", function () {
                if (chatInput.value.length > 0) {
                    chatInputSend.disabled = true;
                    chatInputSend.classList.remove('enabled');
                    parent.sendMessage(chatInput.value);
                    chatInput.value = '';
                    chatInput.focus();
                }
            });
            parent.refreshChat();
        }

        saveName(name) {
            localStorage.setItem('name', name);
        }

        getName() {
            if (localStorage.getItem('name') != null) {
                return localStorage.getItem('name');
            } else {
                this.home();
                return null;
            }
        }

        sendMessage(message) {
            const parent = this;
            if (!parent.getName() || !message) return;

            db.ref('chats/').push({
                name: parent.getName(),
                message: message,
                timestamp: Date.now()
            });
        }

        refreshChat() {
            const chatContentContainer = document.getElementById('chat_content_container');

            chatContentContainer.innerHTML = '';
            let firstLoad = true;
            const currentUser = this.getName();

            db.ref('chats/').off();
            db.ref('chats/').orderByChild('timestamp').on('child_added', (snapshot) => {
                const { name, message, timestamp } = snapshot.val();
                if (!timestamp) return;

                if (firstLoad) {
                    chatContentContainer.innerHTML = '';
                    firstLoad = false;
                }

                const msgDate = new Date(timestamp);
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);


                let dateLabel;
                if (msgDate.toDateString() === today.toDateString()) {
                    dateLabel = "Today";
                } else if (msgDate.toDateString() === yesterday.toDateString()) {
                    dateLabel = "Yesterday";
                } else {
                    dateLabel = msgDate.toLocaleDateString();
                }

                if (this.lastRenderedDate !== dateLabel) {
                    this.lastRenderedDate = dateLabel;
                    const separator = createElement('div', null, dateLabel, { class: 'date_separator' });
                    chatContentContainer.appendChild(separator);
                }

                const isMine = name === currentUser;

                const messageContainer = createElement('div', null, null, {
                    class: isMine ? 'message_container my_message' : 'message_container'
                });
                const messageInnerContainer = createElement('div', null, null, { class: 'message_inner_container' });

                if (!isMine) {
                    const messageUser = createElement('p', null, name, { class: 'message_user' });
                    messageInnerContainer.append(
                        createElement('div', null, null, { class: 'message_user_container' })
                            .appendChild(messageUser)
                    );
                }

                const messageContent = createElement('p', null, message, { class: 'message_content' });

                messageInnerContainer.append(
                    createElement('div', null, null, { class: 'message_content_container' })
                        .appendChild(messageContent)
                );
                messageContainer.appendChild(messageInnerContainer);

                chatContentContainer.appendChild(messageContainer);
                chatContentContainer.scrollTop = chatContentContainer.scrollHeight;
            });
        }

    }

    var app = new Sasalele();
    if (app.getName() != null) {
        app.chat();
    }
});

function siteTime() {
    window.setTimeout(siteTime, 1000);
    var seconds = 1000;
    var minutes = seconds * 60;
    var hours = minutes * 60;
    var days = hours * 24;
    var years = days * 365;
    var today = new Date();
    var todayYear = today.getFullYear();
    var todayMonth = today.getMonth();
    var todayDate = today.getDate();
    var todayHour = today.getHours();
    var todayMinute = today.getMinutes();
    var todaySecond = today.getSeconds();
    var t1 = Date.UTC(2023, 9, 1, 0, 0, 0);
    var t2 = Date.UTC(todayYear, todayMonth, todayDate, todayHour, todayMinute, todaySecond);
    var diff = t2 - t1;
    var diffYears = Math.floor(diff / years);
    var diffDays = Math.floor((diff / days) - diffYears * 365);
    var diffHours = Math.floor((diff - (diffYears * 365 + diffDays) * days) / hours);
    var diffMinutes = Math.floor((diff - (diffYears * 365 + diffDays) * days - diffHours * hours) / minutes);
    var diffSeconds = Math.floor((diff - (diffYears * 365 + diffDays) * days - diffHours * hours - diffMinutes * minutes) / seconds);
    document.getElementById("liveTime").innerHTML = diffYears + " Years " + diffDays + " Days " + diffHours + " Hours " + diffMinutes + " Minutes " + diffSeconds + " Seconds";
}

const playlistMenu = document.getElementById('playlistMenu');
const dropdownBtn = document.getElementById('playlistDropdown');
const container = document.getElementById('hugeData');

let selectedPlaylist = null;
let ap = null;

playlistMenu.addEventListener('click', e => {
    if (!e.target.matches('.dropdown-item')) return;
    e.preventDefault();
    const selectedPlaylist = e.target.getAttribute('data-playlist');
    loadPlaylist(selectedPlaylist);
});

function loadPlaylist(playlistName) {
    document.getElementById('loadingSpinner').style.display = 'block';
    const audioRef = firebase.database().ref(`audioList/${playlistName}`);

    audioRef.once("value")
        .then(snapshot => {
            const data = snapshot.val();
            if (!data) {
                document.getElementById('loadingSpinner').style.display = 'none';
                console.warn(`No audio data found for: ${playlistName}`);
                if (ap) ap.destroy();
                container.style.display = 'none';
                return;
            }

            const audioArray = Object.values(data);
            container.style.display = 'block';

            if (ap) ap.destroy();

            ap = new APlayer({
                container: document.getElementById('aplayer'),
                lrcType: 1,
                audio: audioArray
            });

            document.getElementById('loadingSpinner').style.display = 'none';
        })
        .catch(error => {
            console.error("Err:", error);
            document.getElementById('loadingSpinner').style.display = 'none';
            alert("Error loading playlist: " + error.message);
        });
}