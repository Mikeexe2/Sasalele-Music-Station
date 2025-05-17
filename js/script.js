const togglePlayerButton = document.getElementById("togglePlayer");
const playerContainer = document.getElementById("player");
const expandIcon = document.querySelector("#togglePlayer .fa-expand");
const minimizeIcon = document.querySelector("#togglePlayer .fa-compress");
const cover = document.getElementById('cover');
const metadataElement = document.getElementById('metadata');
const player = document.getElementById('miniPlayer');
const stationName = document.getElementById('stationName');
const stationCount = document.getElementById('station-count');
const RandomPlay = document.getElementById('randomplay');
const historyDisplay = document.getElementById('historyBtn')
const genreSelect = document.getElementById('genre-select');
const copyIcon = document.getElementById('copyIcon');
const iconContainer = document.querySelector('#copyIcon .icon-container');
const confirmation = document.querySelector('#copyIcon .copy-confirmation');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const innerContainer = document.querySelector('.search-results');
const searchTermsContainer = document.getElementById('searchTerms');
const VideoDisplay = document.getElementById("YouTubeVideo");
const innerlastfm = document.getElementById('lastfmList');
const inneritunes = document.getElementById('itunesList');
const innerdeezer = document.getElementById('deezerList');

document.querySelector('.nav-link[href="#search"]').addEventListener('click', function (event) {
    document.getElementById('searchInput').focus();
});

let currentPlayingMedia = null;

player.addEventListener('play', () => handlePlayPause(true));
player.addEventListener('pause', () => handlePlayPause(false));

player.volume = localStorage.getItem('volumeKey') || 1.0;

// Event listener for volume changes
player.addEventListener('volumechange', function () {
    localStorage.setItem('volumeKey', player.volume);
});

// click to display track history
historyDisplay.addEventListener('click', function () {
    displayRecentTracks();
});

function startCoverRotation() {
    const coverImage = document.getElementById('ip');
    if (coverImage) {
        coverImage.classList.add('rotating');
    }
}

function stopCoverRotation() {
    const coverImage = document.getElementById('ip');
    if (coverImage) {
        coverImage.classList.remove('rotating');
    }
}

// copy stream title
copyIcon.addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    textarea.value = metadataElement.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    iconContainer.style.display = 'none';
    confirmation.style.display = 'flex';

    setTimeout(() => {
        confirmation.style.display = 'none';
        iconContainer.style.display = 'flex';
    }, 2000);
});

let metadataInterval = null;
let eventSource = null;
let icecastMetadataPlayer = null;

function playMedia(media, playButton) {
    // Update button icons on the radio list
    UpdatePlayPause(playButton);

    // url_resolved is for radio browser's search results
    const chosenUrl = media.url_resolved || media.url;

    handlePlayback(chosenUrl, media);

    function handlePlayback(chosenUrl, media) {
        if (player.getAttribute('data-link') === chosenUrl) {
            // restart the playback if paused before
            togglePlay();
        } else {
            // Clear intervals and detach event sources when reloading metadata for a new station
            clearMetadata();
            switch (media.host) {
                case 'icecast':
                    playIceCast();
                    break;
                case 'zeno':
                    playZeno();
                    break;
                case 'lautfm':
                    playLautFM();
                    break;
                case 'special':
                    playSpecial(media.api);
                    break;
                case 'unknown':
                    playStream();
                    metadataElement.innerHTML = "Visit radio's homepage for playing info";
                    break;
                default:
                    playIceCast();
                    break;
            }
        }
        currentPlayingMedia = playButton;
    }

    function clearMetadata() {
        metadataElement.innerHTML = '';
        if (metadataInterval) {
            clearInterval(metadataInterval);
            metadataInterval = null;
        }
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
        if (icecastMetadataPlayer) {
            icecastMetadataPlayer.stop();
            icecastMetadataPlayer.detachAudioElement();
        }
    }

    // play the stream without metadata
    function playStream() {
        player.src = chosenUrl;
        updatePlayerUI(media);
        player.play();
    };

    // Play Icecast stream with metadata
    function playIceCast() {
        try {
            icecastMetadataPlayer = new IcecastMetadataPlayer(chosenUrl, {
                audioElement: player,
                onMetadata: (metadata) => {
                    const title = metadata.StreamTitle || metadata['Stream Title'] || media.name || 'No track information';
                    trackHistory(title);
                    metadataElement.innerHTML = title;
                },
                metadataTypes: ["icy"],
                icyDetectionTimeout: 5000,
                enableLogging: true,
                onError: (error) => {
                    console.log(error);
                    metadataElement.innerHTML = "Click on icon to go to homepage";
                },
            });
            updatePlayerUI(media);
            icecastMetadataPlayer.play();
        } catch (error) {
            console.error('Error initializing Icecast metadata player:', error);
            playStream();
        }
    }

    // Play Zeno stream with metadata
    function playZeno() {
        const zenoapiUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${getSpecialID(chosenUrl)}`;
        eventSource = new EventSource(zenoapiUrl);

        eventSource.addEventListener('message', function (event) {
            processData(event.data);
        });

        eventSource.addEventListener('error', function (event) {
            console.error('Stream endpoint not active:', event);
            metadataElement.innerHTML = 'Stream endpoint not active';
        });

        function processData(data) {
            try {
                const parsedData = JSON.parse(data);

                if (parsedData.streamTitle) {
                    const streamTitle = parsedData.streamTitle.trim();
                    trackHistory(streamTitle);
                    metadataElement.innerHTML = streamTitle;
                } else {
                    metadataElement.innerHTML = 'Metadata not available';
                }
            } catch (error) {
                console.error('Failed to parse JSON:', error);
            }
            playStream();
        }
    }

    // Play LautFM stream with metadata
    function playLautFM() {
        const apiUrl = `https://api.laut.fm/station/${getSpecialID(chosenUrl)}/current_song`;
        startMetadataUpdate(apiUrl, 'lautfm');
        playStream();
    }

    // Play Special stream with metadata
    function playSpecial(alias) {
        const apiUrl = `https://scraper2.onlineradiobox.com/${alias}`;
        startMetadataUpdate(apiUrl, 'special');
        playStream();
    }

    // Start fetching metadata updates
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
                    metadataElement.innerHTML = 'Stream not active';
                });
        };

        fetchMetadata();
        metadataInterval = setInterval(fetchMetadata, 10000);
    }

    // Update metadata display based on type
    function updateMetadata(jsonData, type) {
        switch (type) {
            case 'lautfm':
                const streamTitle = formatLautTitle(jsonData);
                metadataElement.innerHTML = streamTitle;
                trackHistory(streamTitle);
                break;
            case 'special':
                try {
                    const streamTitle = jsonData.title || 'No metadata';
                    metadataElement.innerHTML = streamTitle;
                    trackHistory(streamTitle);
                } catch (error) {
                    console.error('Failed to parse JSON:', error);
                    metadataElement.innerHTML = 'No metadata';
                }
                break;
            default:
                break;
        }
    }

    // Format LautFM title
    function formatLautTitle(jsonData) {
        try {
            const title = jsonData.title || '';
            const artistName = (jsonData.artist && jsonData.artist.name) || '';
            const streamTitle = `${title} - ${artistName}`;
            return streamTitle;
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return 'Metadata not available';
        }
    }

    // Update player UI
    function updatePlayerUI(media) {
        cover.innerHTML = `<img id="ip" src="${media.favicon}">`;
        stationName.innerHTML = `<a href="${media.homepage}" target="_blank" class="homepagelink">${media.name}</a>`;
        player.setAttribute('data-link', chosenUrl);
    }

    // extract name or ID from chosenUrl
    function getSpecialID(chosenUrl) {
        const parts = chosenUrl.split('/');
        return parts[parts.length - 1];
    }

    // Update button icons
    function UpdatePlayPause(activeButton) {
        const buttons = document.querySelectorAll('.main-play-button');
        const isPlaying = !player.paused;

        buttons.forEach(button => {
            updateButtonIcon(button, button === activeButton && isPlaying);
        });
    }

    // Store track history
    function trackHistory(trackName) {
        let recentTracks = JSON.parse(localStorage.getItem('recentTracks')) || [];
        recentTracks = recentTracks.filter(track => track !== trackName);

        recentTracks.unshift(trackName);

        if (recentTracks.length > 5) {
            recentTracks = recentTracks.slice(0, 5);
        }

        localStorage.setItem('recentTracks', JSON.stringify(recentTracks));
    }
}

async function togglePlay() {
    try {
        const activePlayer = icecastMetadataPlayer || player;

        if (activePlayer.paused) {
            if (icecastMetadataPlayer && activePlayer !== icecastMetadataPlayer) {
                icecastMetadataPlayer.pause();
            }
            if (player && activePlayer !== player) {
                player.pause();
            }

            await activePlayer.play();
            startCoverRotation();
        } else {
            activePlayer.pause();
            stopCoverRotation();
        }
    } catch (error) {
        console.error("Playback error:", error);

        if (error.name === 'AbortError' && icecastMetadataPlayer) {
            console.log("Falling back to regular audio element");
            icecastMetadataPlayer = null;
            player.src = chosenUrl;
            await player.play().catch(e => console.error("Fallback play failed:", e));
        }
    }
}

function updateButtonIcon(button, isPlaying) {
    button.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function handlePlayPause(isPlaying) {
    updateButtonIcon(currentPlayingMedia, isPlaying);
    isPlaying ? startCoverRotation() : stopCoverRotation();
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


document.addEventListener('DOMContentLoaded', () => {
    fetch("Links/all.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            window.genreData = data;
            const stationCount = document.getElementById('station-count');
            stationCount.textContent = data.length;

            loadGenre('jmusic'); // default

            const defaultGenreButton = genreSelect.querySelector('[data-genre="jmusic"]');
            if (defaultGenreButton) {
                defaultGenreButton.classList.add('active');
            }

            genreSelect.addEventListener('click', (event) => {
                const genreButton = event.target.closest('.genre-btn');
                if (genreButton) {
                    const genre = genreButton.getAttribute('data-genre');
                    loadGenre(genre);

                    document.querySelectorAll('.genre-btn').forEach(button => {
                        button.classList.remove('active');
                    });

                    genreButton.classList.add('active');
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    function loadGenre(genreToLoad) {
        const genreContainers = document.querySelectorAll('.genre-content');
        const selectedContainer = document.getElementById(genreToLoad);
        const searchInput = document.getElementById('sasalelesearch');

        searchInput.value = '';

        genreContainers.forEach(container => {
            container.classList.remove('active');
            container.querySelectorAll('li').forEach(li => li.style.display = '');
            const noResults = container.querySelector('.no-results');
            if (noResults) noResults.remove();
        });

        if (selectedContainer) {
            selectedContainer.innerHTML = '<div class="loading-spinner">Loading stations...</div>';
            selectedContainer.classList.add('active');

            setTimeout(() => {
                const filteredData = window.genreData.filter(station => station.genre === genreToLoad);

                if (filteredData.length === 0) {
                    selectedContainer.innerHTML = '<p class="no-stations">No stations available in this genre</p>';
                    return;
                }

                const genreHTML = filteredData.map(station => `
                <li data-name="${station.name.toLowerCase()}">
                    <img src="${station.favicon}" alt="${station.name}">
                    <div class="info">
                        <h5>${station.name}</h5>
                    </div>
                    <a href="${station.homepage}" target="_blank" class="btn btn-info"><i class="fas fa-external-link-alt"></i></a>
                    <button class="btn btn-dark download-button"><i class="fas fa-download"></i></button>
                    <button class="btn btn-primary main-play-button"><i class="fas fa-play"></i></button>
                </li>
            `).join('');

                selectedContainer.innerHTML = genreHTML;
            }, 300);
        }
    }

    // Improved random play that respects visibility
    RandomPlay.addEventListener('click', function () {
        const activeGenre = document.querySelector('.genre-content.active');
        if (!activeGenre) return;

        const visibleStations = [...activeGenre.querySelectorAll('li:not([style*="display: none"])')];
        if (visibleStations.length === 0) return;

        const randomIndex = Math.floor(Math.random() * visibleStations.length);
        const playButton = visibleStations[randomIndex].querySelector('.main-play-button');
        playButton?.click();
    });

    function handleDownloadClick(button) {
        const parentLi = button.closest('li');
        const stationName = parentLi.querySelector('h5').textContent.trim();
        const media = window.genreData.find(st => st.name === stationName);

        if (media) {
            RadioM3UDownload(media.url, media.name);
        } else {
            console.error('Media not found:', stationName);
        }
    }
    // Event delegation for dynamic buttons
    document.addEventListener('click', function (event) {
        const target = event.target.closest('.download-button, .main-play-button');
        if (!target) return;

        // Throttle rapid clicks
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
        const stationName = parentLi.querySelector('h5').textContent;
        const media = window.genreData.find(st => st.name === stationName);

        if (media) {
            playMedia(media, button);
        } else {
            console.error('Media not found:', stationName);
        }
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
});

// search site's station function
// Modified search function that works with genre loading
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById('sasalelesearch').addEventListener('input', debounce(function () {
    const searchTerm = this.value.toLowerCase().trim();
    const activeGenre = document.querySelector('.genre-content.active');
    if (!activeGenre) return;

    const items = activeGenre.querySelectorAll('li');
    let hasVisibleItems = false;

    items.forEach(item => {
        const stationName = item.querySelector('h5')?.textContent.toLowerCase() || '';
        const isMatch = searchTerm === '' || stationName.includes(searchTerm);
        item.style.display = isMatch ? '' : 'none';
        if (isMatch) hasVisibleItems = true;
    });

    const noResultsMsg = activeGenre.querySelector('.no-results');
    if (!hasVisibleItems && searchTerm) {
        if (!noResultsMsg) {
            const msg = document.createElement('p');
            msg.className = 'no-results';
            msg.textContent = 'No stations match your search';
            activeGenre.appendChild(msg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}, 300));

// Expand and minimize player
togglePlayerButton.addEventListener("click", () => {
    playerContainer.classList.toggle("minimized");
    expandIcon.classList.toggle("hidden");
    minimizeIcon.classList.toggle("hidden");
});

// search station with options using Radio Browser's API

const countries = [
    "United States", "Germany", "Russia", "France", "Greece", "China", "United Kingdom",
    "Mexico", "Italy", "Australia", "Canada", "India", "Spain", "Brazil", "Poland",
    "Philippines", "Argentina", "Netherlands", "United Arab Emirates", "Uganda",
    "Switzerland", "Romania", "Colombia", "Turkey", "Indonesia", "Belgium", "Chile",
    "Serbia", "Austria", "Hungary", "Peru", "Ukraine", "Czechia", "Portugal", "Bulgaria",
    "Croatia", "Denmark", "New Zealand", "Ireland", "Ecuador", "Sweden", "Japan",
    "Slovakia", "Afghanistan", "Uruguay", "Malaysia", "Norway", "South Africa",
    "Bosnia and Herzegovina", "Gibraltar", "Venezuela", "Saudi Arabia", "Dominican Republic",
    "Finland", "Israel", "Slovenia", "Kenya", "Taiwan", "South Korea", "Morocco",
    "Thailand", "Estonia", "Bolivia", "Tunisia", "Lithuania", "Latvia", "Guatemala",
    "Sri Lanka", "Pakistan", "Belarus", "Hong Kong", "Nigeria", "Costa Rica", "Iran",
    "Algeria", "Egypt", "Montenegro", "Cuba", "Honduras", "El Salvador", "North Macedonia",
    "Senegal", "Paraguay", "Albania", "Kazakhstan", "Lebanon", "Singapore", "Moldova",
    "Cyprus", "Ethiopia", "Jamaica", "Puerto Rico", "Macau", "Luxembourg", "Vietnam",
    "Georgia", "Nepal", "Iraq", "Jordan", "Syria"
];


function populateCountries() {
    const selectElement = document.getElementById("countrySelect");
    countries.forEach(function (country) {

        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        selectElement.appendChild(option);
    });
}

const languages = [
    "English", "Spanish", "French", "Chinese", "Hindi", "Arabic",
    "Bengali", "Portuguese", "Russian", "Japanese", "German", "Korean",
    "Turkish", "Italian", "Dutch", "Polish", "Ukrainian", "Persian",
    "Malay", "Thai", "Swahili", "Yoruba", "Tagalog", "Sindhi", "Slovak",
    "Serbian", "Greek", "Hungarian", "Finnish", "Czech", "Croatian",
    "Danish", "Swedish", "Norwegian", "Lithuanian", "Latvian", "Estonian",
    "Romanian", "Bulgarian", "Albanian", "Vietnamese", "Indonesian",
    "Malagasy", "Swazi", "Zulu", "Xhosa", "Tamil", "Telugu", "Marathi",
    "Kannada", "Gujarati", "Punjabi", "Urdu", "Oromo", "Amharic", "Tigrinya",
    "Pashto", "Dari", "Farsi", "Kurdish", "Hausa", "Igbo", "Somali", "Fulani",
    "Akan", "Kinyarwanda", "Kirundi", "Shona", "Tswana", "Kinyamwezi",
    "Chichewa", "Lingala", "Bemba", "Sesotho", "Wolof", "Twi", "Berber",
    "Fula", "Wolof", "Berber", "Sotho", "Zarma", "Dinka", "Tigre",
    "Afrikaans", "Oshiwambo", "Sango", "Tswana", "Setswana", "Kikuyu",
    "Kongo", "Bambara", "Luganda", "Susu", "Zaghawa", "Mossi", "Khoekhoe"
];

function populateLanguages() {
    const selectElement = document.getElementById("languageSelect");
    languages.forEach(function (language) {
        const option = document.createElement("option");
        option.value = language;
        option.textContent = language;
        selectElement.appendChild(option);
    });
}

const tags = ["pop", "music", "news", "rock", "classical", "talk", "radio", "hits", "community radio", "dance", "electronic", "80s", "oldies", "méxico", "christian", "jazz", "classic hits", "pop music", "top 40", "90s", "adult contemporary", "country", "house", "house", "folk", "chillout", "soul", "top40", "news talk", "metal", "hiphop", "techno", "rap", "sports", "ambient", "lounge", "culture", "disco", "funk", "retro", "electro", "top hits", "world music", "edm", "latino", "international", "relax", "college radio", "catholic", "christmas music", "pop dance", "hip-hop", "00s", "love songs", "club", "various", "mix", "iheart", "bible", "piano", "tech house", "vaporwave", "dj", "anime radio", "anime", "free japan music", "japanese", "japanese music", "japanese idols", "japan", "anime openings", "animegroove"
];

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

// Function to clear the search field
function clearSearchField() {
    searchField.value = '';
    countrySelect.value = '';
    languageSelect.value = '';
    tagSelect.value = '';
}

// Function to perform radio search
function radioSearch() {
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
        return;
    }
    searchResultContainer.classList.remove('active');
    findradio.style.display = "block";
    // add limit to prevent loading forever
    fetch(`https://de1.api.radio-browser.info/json/stations/${searchBy}/${searchValue}?hidebroken=true&limit=300&order=clickcount&reverse=true`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                searchResultHeader.innerHTML = `Radio Search Results for: <mark id="searchTerms">${searchValue}</mark>`;
                searchResultContainer.classList.add('active');
                searchResultContainer.innerHTML = '';

                data.forEach(radio => {
                    const radioItem = document.createElement('li');
                    radioItem.innerHTML = `
                        <img src="${radio.favicon ? radio.favicon : 'assets/radios/Unidentified2.webp'}">
                        <div class="info">
                            <h5>${radio.name}</h5>
                        </div>
                        <a href="${radio.homepage}" target="_blank" class="btn btn-info"><i class="fas fa-external-link-alt"></i></a>
                        <button class="btn btn-dark download-button"><i class="fas fa-download"></i></button>
                        <button class="btn btn-primary main-play-button"><i class="fas fa-play"></i></button>
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
                searchResultHeader.style.display = "block";
                searchResultHeader.textContent = 'No result found.';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    clearSearchField();
}

// for radio streams
const titleNow = document.getElementById("selected-video-title");
let currentRadioStreams = [];
let currentPlayingElement = null;
let hls = null;

function updateLangInfo(lang, count) {
    const streamLang = document.getElementById("lang-name");
    const streamCount = document.getElementById("stream-count");

    streamLang.textContent = lang;
    streamCount.textContent = count;
}

function selectRadioStream(element) {
    const selectedLink = element.dataset.link;
    const selectedTitle = element.querySelector('span').textContent;

    if (currentPlayingElement) {
        currentPlayingElement.style.backgroundColor = "";
        currentPlayingElement.style.color = "";
    }

    element.style.backgroundColor = "#007bff";
    element.style.color = "#fff";
    currentPlayingElement = element;
    titleNow.style.display = "block";
    titleNow.textContent = selectedTitle;

    playRadioStream(selectedLink);
}

function playRadioStream(link) {
    const m3u8player = document.getElementById("radio-player");

    if (hls) {
        hls.destroy();
        hls = null;
    }

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(link);
        hls.attachMedia(m3u8player);
        hls.on(Hls.Events.MANIFEST_PARSED, () => m3u8player.play());
    } else if (m3u8player.canPlayType('application/vnd.apple.mpegurl')) {
        m3u8player.src = link;
        m3u8player.addEventListener('loadedmetadata', () => m3u8player.play());
    } else {
        console.error('HLS not supported.');
    }
}

function createRadioList(radioStreams) {
    const videoListElement = document.getElementById("video-list");
    videoListElement.innerHTML = "";

    radioStreams.forEach((stream) => {
        const listItem = document.createElement("li");
        listItem.classList.add("itunes-item", "d-flex", "align-items-center");

        const iconImage = document.createElement("img");
        iconImage.classList.add("mr-2");
        iconImage.src = stream.icon || "assets/radios/Unidentified2.webp";
        iconImage.width = 40;

        if (stream.homepage) {
            const homepageLink = document.createElement("a");
            homepageLink.classList.add("homepagelink");
            homepageLink.href = stream.homepage;
            homepageLink.target = "_blank";
            homepageLink.appendChild(iconImage);
            listItem.appendChild(homepageLink);
        } else {
            listItem.appendChild(iconImage);
        }

        const contentContainer = document.createElement("div");
        contentContainer.classList.add("d-flex", "align-items-center", "justify-content-between", "flex-grow-1");
        const titleSpan = document.createElement("span");
        titleSpan.textContent = stream.title;
        titleSpan.classList.add("ml-2");
        contentContainer.appendChild(titleSpan);
        const downloadIcon = document.createElement("i");
        downloadIcon.classList.add("fa", "fa-download");
        downloadIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            initiateM3UDownload(stream.link, stream.title);
        });

        contentContainer.appendChild(downloadIcon);
        listItem.appendChild(contentContainer);
        listItem.dataset.link = stream.link;
        videoListElement.appendChild(listItem);
    });

    videoListElement.addEventListener("click", (event) => {
        const listItem = event.target.closest("li");
        if (listItem) {
            selectRadioStream(listItem);
        }
    });
}

function filterRadioList(query) {
    const lowerCaseQuery = query.toLowerCase();
    return currentRadioStreams.filter(stream => stream.title.toLowerCase().includes(lowerCaseQuery));
}

// change the list based on selected language
document.querySelectorAll(".lang-link").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = link.getAttribute("data-lang");
        const filteredRadioStreams = currentRadioStreams.filter(stream => stream.lang === lang);
        createRadioList(filteredRadioStreams);
        updateLangInfo(link.textContent, filteredRadioStreams.length);
    });
});

// filter stream
document.getElementById("searchStream").addEventListener("input", function () {
    const query = this.value;
    const filteredRadioStreams = filterRadioList(query);
    createRadioList(filteredRadioStreams);
});
// download m3u8 stream
function initiateM3UDownload(streamUrl, streamTitle) {
    const m3uContent = `#EXTM3U\n#EXTINF:-1,${streamTitle}\n${streamUrl}`;
    const blob = new Blob([m3uContent], { type: "text/plain;charset=utf-8" });
    const downloadableUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadableUrl;
    downloadLink.download = `${streamTitle}.m3u8`;
    downloadLink.click();
}

(async () => {
    const defaultLang = "ja";
    const defaultLangName = "Japanese";

    try {
        const response = await fetch('Links/radiostreams.json');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        currentRadioStreams = await response.json();

        const filteredRadioStreams = currentRadioStreams.filter(stream => stream.lang === defaultLang);
        createRadioList(filteredRadioStreams);
        updateLangInfo(defaultLangName, filteredRadioStreams.length);
    } catch (error) {
        console.error('Error fetching radio streams:', error);
    }
})();

// Search song function
function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        innerContainer.style.display = 'block';
        searchTermsContainer.textContent = searchTerm;
        // autofill into the box
        const gscInput = document.querySelector('.gsc-input input');
        const gscClearButton = document.querySelector('.gsst_a');
        if (gscInput && gscClearButton) {
            gscInput.value = '';
            gscClearButton.click();
        }
        if (gscInput) {
            gscInput.value = searchTerm;
        }
        // Clear previous results
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

    // Display LastFM results
    if (lastfmResults.length > 0) {
        const fragment = document.createDocumentFragment();
        const resultsCount = Math.min(MAX_RESULTS, lastfmResults.length);

        for (let i = 0; i < resultsCount; i++) {
            const song = lastfmResults[i];
            if (!song) continue;
            const listItem = document.createElement('li');
            listItem.className = 'lastfm-item';
            listItem.textContent = `${song.title} - ${song.artist}`;
            fragment.appendChild(listItem);
        }
        document.getElementById('lastfmList').appendChild(fragment);
    } else {
        document.getElementById('lastfmList').innerHTML = '<h6 class="noresult mb-2">No results found on LastFM :(</h6>';
    }

    // Display YouTube results
    VideoDisplay.src = youtubeResults.length > 0
        ? `https://www.youtube.com/embed/${youtubeResults[0].videoId}`
        : `https://www.youtube.com/embed/SBQprWeOx8g`;

    // Display iTunes results
    if (itunesResults.length > 0) {
        const itunesList = document.getElementById('itunesList');
        const fragment = document.createDocumentFragment();
        itunesResults.slice(0, MAX_RESULTS).forEach(result => {
            const listItem = document.createElement('li');
            listItem.className = 'itunes-item';
            listItem.innerHTML = `
            <img class="search-cover" src="${result.artworkUrl}" alt="${result.trackName} cover art">
            <div class="info">
                <p><strong>${result.trackName} - ${result.artistName}</strong></p>
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

    // Display Deezer results
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
                <p><strong>${result.title} - ${result.artist}</strong></p>
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

// Search by website
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

// Generate search query
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
        case "KKBOX":
            return `https://www.kkbox.com/my/en/search?q=${a}`;
        case "VGMdb":
            return `https://vgmdb.net/search?q=${a}`;
        case "MusicEnc":
            return `https://www.musicenc.com/?search=${a}`;
        case "J-Lyric.net":
            return `https://search3.j-lyric.net/index.php?ex=on&ct=2&ca=2&cl=2&kt==${a}`;
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
        case "Japanese Song Lyrics":
            return `https://japanesesonglyrics.com/?s=${a}`;
        case "PetitLyrics":
            return `https://petitlyrics.com/search_lyrics?title=${a}`;
        default:
            return ""
    }
}
//Chatting
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
    const firebaseConfig = {
        apiKey: "AIzaSyBea1r2EXm5MyJItS00eRUIM7XZxt5Uzs8",
        authDomain: "sasalele.firebaseapp.com",
        databaseURL: "https://sasalele-default-rtdb.firebaseio.com",
        projectId: "sasalele",
        storageBucket: "sasalele.appspot.com",
        messagingSenderId: "993505903479",
        appId: "1:993505903479:web:1419b55ac1cd5913755772",
        measurementId: "G-JFENQ5SBN8"
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.database();

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


        createLoad(containerId) {
            var container = document.getElementById(containerId);
            container.innerHTML = '';
            var loaderContainer = createElement('div', null, null, { class: 'loader_container' });
            var loader = createElement('div', null, null, { class: 'loader' });

            loaderContainer.append(loader);
            container.append(loaderContainer);
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

            // fix pasted content not detected
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
                    parent.createLoad('chat_content_container');
                    parent.sendMessage(chatInput.value);
                    chatInput.value = '';
                    chatInput.focus();
                }
            });

            parent.createLoad('chat_content_container');
            parent.refreshChat();
        }

        saveName(name) {
            localStorage.setItem('name', name);
        }

        sendMessage(message) {
            var parent = this;
            if (parent.getName() == null && message == null) {
                return;
            }

            db.ref('chats/').once('value', function (messageObject) {
                var index = parseFloat(messageObject.numChildren()) + 1;
                db.ref(`chats/message_${index}`).set({
                    name: parent.getName(),
                    message: message,
                    index: index
                }).then(function () {
                    parent.refreshChat();
                });
            });
        }

        getName() {
            if (localStorage.getItem('name') != null) {
                return localStorage.getItem('name');
            } else {
                this.home();
                return null;
            }
        }

        refreshChat() {
            const chatContentContainer = document.getElementById('chat_content_container');
            let lastMessageIndex = -1;

            db.ref('chats/').on('value', (messagesObject) => {
                const messages = messagesObject.val();
                if (!messages) return;

                const ordered = Object.values(messages)
                    .sort((a, b) => a.index - b.index);

                if (ordered[0]?.index <= lastMessageIndex) return; // Skip if no new messages

                const fragment = document.createDocumentFragment();
                ordered.forEach((data) => {
                    const { name, message, index } = data;
                    lastMessageIndex = Math.max(lastMessageIndex, index);

                    const messageContainer = createElement('div', null, null, { class: 'message_container' });
                    const messageInnerContainer = createElement('div', null, null, { class: 'message_inner_container' });
                    const messageUser = createElement('p', null, name, { class: 'message_user' });
                    const messageContent = createElement('p', null, message, { class: 'message_content' });

                    messageInnerContainer.append(createElement('div', null, null, { class: 'message_user_container' }).appendChild(messageUser),
                        createElement('div', null, null, { class: 'message_content_container' }).appendChild(messageContent));
                    messageContainer.appendChild(messageInnerContainer);
                    fragment.appendChild(messageContainer);
                });

                chatContentContainer.innerHTML = ''; // Clear only once
                chatContentContainer.appendChild(fragment);
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
siteTime();

const loadPlaylist = document.getElementById('loadAplayer');
loadPlaylist.addEventListener('click', function () {
    var container = document.getElementById('hugeData');
    var script = document.createElement('script');
    script.src = 'js/module.js';
    script.onload = function () {
        container.style.display = 'block';
    };
    document.body.appendChild(script);
    loadPlaylist.style.display = 'none';
});