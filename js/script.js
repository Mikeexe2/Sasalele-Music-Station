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
const copyIcon = document.getElementById('copyIcon');

let currentPlayingMedia = null;

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

function updateButtonIcon(button, isPlaying) {
    button.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// copy stream title
copyIcon.addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    textarea.value = metadataElement.textContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    //alert('Stream title copied to clipboard!');
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
                    metadataElement.innerHTML = "Click on icon to go to homepage";
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
            icecastMetadataPlayer.detachAudioElement();
            icecastMetadataPlayer = null;
        }
    }

    // play the stream without metadata
    function playStream() {
        player.src = chosenUrl;
        updatePlayerUI(media);
        startCoverRotation();
        player.play();
    };

    // Play Icecast stream with metadata
    function playIceCast() {
        try {
            icecastMetadataPlayer = new IcecastMetadataPlayer(chosenUrl, {
                audioElement: player,
                onMetadata: (metadata) => {
                    trackHistory(metadata.StreamTitle || 'No metadata');
                    metadataElement.innerHTML = metadata.StreamTitle || 'No metadata';
                },
                metadataTypes: ["icy"],
                icyDetectionTimeout: 100000,
                enableLogging: false,
                onError: (error) => {
                    console.log(error);
                    metadataElement.innerHTML = "Click on icon to go to homepage";
                },
            });
            updatePlayerUI(media);
            startCoverRotation();
            icecastMetadataPlayer.play();
        } catch (error) {
            console.error('Error initializing Icecast metadata player:', error);
        }
        playStream();
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
        }
        playStream();
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
        cover.innerHTML = `<a href="${media.homepage}" target="_blank" class="homepagelink"><img id="ip" src="${media.favicon}"></a>`;
        stationName.textContent = media.name;
        player.setAttribute('data-link', chosenUrl);
    }

    // extract name or ID from chosenUrl
    function getSpecialID(chosenUrl) {
        const parts = chosenUrl.split('/');
        return parts[parts.length - 1];
    }

    // Update button icons
    function UpdatePlayPause(activeButton) {
        document.querySelectorAll('.main-play-button').forEach(button => {
            updateButtonIcon(button, button === activeButton && !player.paused);
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

player.volume = localStorage.getItem('volumeKey') || 0.3;

// Event listener for volume changes
player.addEventListener('volumechange', function () {
    localStorage.setItem('volumeKey', player.volume);
});


function togglePlay() {
    if (player.paused) {
        player.play();
        startCoverRotation();
    } else {
        player.pause();
        stopCoverRotation();
    }
}

player.addEventListener('play', () => {
    updateButtonIcon(currentPlayingMedia, true);
    startCoverRotation();
});

player.addEventListener('pause', () => {
    updateButtonIcon(currentPlayingMedia, false);
    stopCoverRotation();
});

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

// click to display track history
document.getElementById('historyBtn').addEventListener('click', function () {
    displayRecentTracks();
});

function loadAll() {
    fetch("Links/all.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const genreContainers = {
                jmusic: document.querySelector('#jmusic'),
                kmusic: document.querySelector('#kmusic'),
                cmusic: document.querySelector('#cmusic'),
                nightcore: document.querySelector('#nightcore'),
                anime: document.querySelector('#anime'),
                vocaloid: document.querySelector('#vocaloid'),
                variety: document.querySelector('#variety'),
                bgm: document.querySelector('#bgm'),
                jpradio: document.querySelector('#jpradio')
            };

            const genreHTML = {
                jmusic: '', kmusic: '', cmusic: '', nightcore: '', anime: '', vocaloid: '', variety: '', bgm: '', jpradio: ''
            };

            data.forEach(station => {
                const genre = station.genre;

                const radHTML = `
                <div class="widget">
                <img class="rad-icon" src="${station.favicon}">
                <div class="download-button"><i class="fas fa-download"></i></div>
                <a href="${station.homepage}" target="_blank">
                    <span class="player-radio-name">${station.name}</span>
                </a>   
                <div class="ml-auto btn btn-primary main-play-button"><i class="fas fa-play"></i></a></div>
            </div>   
                `;
                genreHTML[genre] += radHTML;
            });

            Object.keys(genreContainers).forEach(genre => {
                genreContainers[genre].innerHTML = genreHTML[genre];
            });

            stationCount.textContent = data.length;

            document.addEventListener('click', function (event) {
                const downloadButton = event.target.closest('.download-button');
                const playButton = event.target.closest('.main-play-button');

                if (downloadButton) {
                    event.stopPropagation();
                    const parentDiv = downloadButton.closest('.widget');
                    const media = data.find(st => st.name === parentDiv.querySelector('.player-radio-name').textContent);
                    if (media) {
                        RadioM3UDownload(media.url, media.name);
                    }
                }

                if (playButton) {
                    const parentDiv = playButton.closest('.widget');
                    const media = data.find(st => st.name === parentDiv.querySelector('.player-radio-name').textContent);
                    if (media) {
                        playMedia(media, playButton);
                    }
                }
            });

            RandomPlay.addEventListener('click', function () {
                const stations = document.querySelectorAll('.widget');
                const randomIndex = Math.floor(Math.random() * stations.length);
                const playButton = stations[randomIndex].querySelector('.main-play-button');
                if (playButton) {
                    playButton.click();
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
// Initialize load all internet radios
document.addEventListener('DOMContentLoaded', () => {
    loadAll();
});

// initiate download of the internet radio's m3u file
function RadioM3UDownload(stationURL, stationName) {

    const patternsToRemove = [
        /;stream\.nsv&type=mp3&quot;$/,
        /;&type=mp3$/,
        /;?type=http&nocache$/,
        /jmusicid-backend\?type=http&nocache=2$/,
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
}

// search site's station function
document.getElementById('sasalelesearch').addEventListener('input', function () {
    var searchTerm = this.value.toLowerCase();
    document.querySelectorAll('.widget').forEach(widget => {
        var stationName = widget.querySelector('.player-radio-name').textContent.toLowerCase();
        if (stationName.includes(searchTerm)) {
            widget.style.display = 'flex';
        } else {
            widget.style.display = 'none';
        }
    });
});

// Expand and minimize player
togglePlayerButton.addEventListener("click", () => {
    playerContainer.classList.toggle("minimized");
    expandIcon.classList.toggle("hidden");
    minimizeIcon.classList.toggle("hidden");
});

// search station with options using Radio Browser's API

const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei Darussalam", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "The Democratic Republic Of The Congo", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador",
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
    "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
    "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan",
    "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
    "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
    "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
    "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", , "Puerto Rico", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
    "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo",
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
    "Tuvalu", "Uganda", "Ukraine", "The United Arab Emirates", , "The United Kingdom Of Great Britain And Northern Ireland", "United Kingdom",
    "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
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

    searchResultContainer.innerHTML = '';
    findradio.style.display = "block";
    // add limit to prevent loading forever
    fetch(`https://de1.api.radio-browser.info/json/stations/${searchBy}/${searchValue}?hidebroken=true&limit=300&order=clickcount&reverse=true`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                searchResultHeader.style.display = "block";
                searchResultHeader.innerHTML = `Radio Search Results for: <mark id="searchTerms">${searchValue}</mark>`;

                data.forEach(radio => {
                    const radioDiv = document.createElement('div');
                    radioDiv.classList.add('widget');
                    radioDiv.innerHTML = `
                        <img class="rad-icon" src="${radio.favicon ? radio.favicon : 'assets/radios/Unidentified2.webp'}">
                        <div class="download-button"><i class="fas fa-download"></i></div>
                        <a href="${radio.homepage}" target="_blank">
                            <span class="player-radio-name">${radio.name}</span>
                        </a>
                        <div class="ml-auto btn btn-primary main-play-button"><i class="fas fa-play"></i></div>
                    `;
                    searchResultContainer.appendChild(radioDiv);
                });

                searchResultContainer.addEventListener('click', function (event) {
                    const button = event.target.closest('.download-button');
                    if (button) {
                        event.stopPropagation();
                        const parentDiv = button.closest('.widget');
                        const media = data.find(st => st.name === parentDiv.querySelector('.player-radio-name').textContent);
                        if (media) {
                            RadioM3UDownload(media.url, media.name);
                        }
                    }

                    const playButton = event.target.closest('.main-play-button');
                    if (playButton) {
                        const parentDiv = playButton.closest('.widget');
                        const radio = data.find(st => st.name === parentDiv.querySelector('.player-radio-name').textContent);
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
    document.getElementById("selected-video-title").textContent = selectedTitle;

    playRadioStream(selectedLink);
}

function playRadioStream(link) {
    const m3u8player = document.getElementById("radio-player");
    const proxiedLink = `https://sasalele.api-anycast.workers.dev/${link}`;
    const hls = new Hls();

    if (Hls.isSupported()) {
        hls.loadSource(proxiedLink);
        hls.attachMedia(m3u8player);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            m3u8player.play();
        });
    } else if (m3u8player.canPlayType('application/vnd.apple.mpegurl')) {
        m3u8player.src = proxiedLink;
        m3u8player.addEventListener('loadedmetadata', function () {
            m3u8player.play();
        });
    } else {
        console.error('This browser does not support HLS.js or native HLS playback.');
    }
}

function createRadioList(radioStreams) {
    const videoListElement = document.getElementById("video-list");
    videoListElement.innerHTML = "";

    radioStreams.forEach((stream) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item", "list-group-item-action", "d-flex", "align-items-center");

        const iconImage = document.createElement("img");
        iconImage.classList.add("mr-2");
        iconImage.src = stream.icon || "assets/radios/Unidentified2.webp";
        iconImage.width = 40;
        iconImage.title = stream.icon ? "" : "No Homepage Available";

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
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const innerContainer = document.querySelector('.search-results');
const searchTermsContainer = document.getElementById('searchTerms');

const VideoDisplay = document.getElementById("YouTubeVideo");
const innerlastfm = document.getElementById('lastfmList');
const inneritunes = document.getElementById('itunesList');
const innerdeezer = document.getElementById('deezerList');

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
    const lastfmURL = `https://ws.audioscrobbler.com/2.0/?method=track.search&format=json&api_key=b9747c75368b42160af4301c2bf654a1&track=${encodeURIComponent(searchTerm)}`;
    const youtubeURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(searchTerm)}&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s`;
    const itunesURL = `https://sasalele.api-anycast.workers.dev/https://itunes.apple.com/search?limit=5&media=music&term=${encodeURIComponent(searchTerm)}`;
    const deezerURL = `https://sasalele.api-anycast.workers.dev/https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}`;

    try {
        const [lastfmResponse, youtubeResponse, itunesResponse, deezerResponse] = await Promise.all([
            fetch(lastfmURL).then(response => response.json()),
            fetch(youtubeURL).then(response => response.json()),
            fetch(itunesURL).then(response => response.json()),
            fetch(deezerURL).then(response => response.json()),
        ]);

        const lastfmResults = formatLastfmResults(lastfmResponse);
        const youtubeResults = formatYoutubeResults(youtubeResponse);
        const itunesResults = formatItunesResults(itunesResponse);
        const deezerResults = formatDeezerResults(deezerResponse);

        const combinedResults = {
            lastfm: lastfmResults,
            youtube: youtubeResults,
            itunes: itunesResults,
            deezer: deezerResults,
        };

        displayResults(combinedResults);

    } catch (error) {
        console.error('Error searching across APIs:', error);
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

    VideoDisplay.style.display = "block";

    // Display LastFM results
    if (lastfmResults.length > 0) {
        const fragment = document.createDocumentFragment();
        const maxResults = Math.min(5, lastfmResults.length);

        for (let i = 0; i < maxResults; i++) {
            const song = lastfmResults[i];
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
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
        : `https://www.youtube.com/embed/dQw4w9WgXcQ`;

    // Display iTunes results
    if (itunesResults.length > 0) {
        const itunesList = document.getElementById('itunesList');
        const fragment = document.createDocumentFragment();
        itunesResults.forEach(result => {
            const listItem = document.createElement('li');
            listItem.className = 'itunes-item';
            listItem.innerHTML = `
                <img class="search-cover" src="${result.artworkUrl}">
                <div class="info">
                    <p><strong>${result.trackName} - ${result.artistName}</strong></p>
                    <p>${result.collectionName}</p>
                    <audio id="audio-${result.trackId}" src="${result.previewUrl}"></audio>
                </div>
                <button class="btn btn-primary" onclick="playPreview('audio-${result.trackId}', this)">Play Preview</button>
            `;
            fragment.appendChild(listItem);
        });
        itunesList.appendChild(fragment);
    } else {
        document.getElementById('itunesList').innerHTML = '<h6 class="noresult mb-2">No results found on iTunes :(</h6>';
    }

    // Display Deezer results
    if (deezerResults.length > 0) {
        const deezerList = document.getElementById('deezerList');
        const fragment = document.createDocumentFragment();
        const maxResults = Math.min(5, deezerResults.length);

        for (let i = 0; i < maxResults; i++) {
            const result = deezerResults[i];
            const listItem = document.createElement('li');
            listItem.className = 'itunes-item';
            listItem.innerHTML = `
            <img class="search-cover" src="${result.cover}">
            <div class="info">
                <p><strong>${result.title} - ${result.artist}</strong></p>
                <p>${result.album}</p>
            </div>
            <audio class="deezer-audio" controls>
            <source src="${result.preview}" type="audio/mp3">
            </audio>
            `;
            fragment.appendChild(listItem);
        }
        deezerList.appendChild(fragment);
    } else {
        document.getElementById('deezerList').innerHTML = '<h6 class="noresult mb-2">No results found on Deezer :(</h6>';
    }
}

//play itunes preview
function playPreview(audioId, button) {
    const itunesgo = document.getElementById(audioId);

    if (itunesgo.paused) {
        itunesgo.play();
        button.textContent = 'Pause Preview';
    } else {
        itunesgo.pause();
        button.textContent = 'Play Preview';
    }
    itunesgo.onended = () => {
        button.textContent = 'Play Preview';
    };
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

    class Sasalele {
        home() {
            var chatContainer = document.querySelector('.chat_container');
            if (chatContainer) {
                chatContainer.innerHTML = ''; // Clear chat-related content
            }
            this.createJoinForm();
        }

        chat() {
            this.createChat();
        }

        createJoinForm() {
            var parent = this;

            var joinFormContainer = document.querySelector('.joinform');
            var joinInnerContainer = document.createElement('div');
            joinInnerContainer.setAttribute('id', 'join_inner_container');

            var joinButtonContainer = document.createElement('div');
            joinButtonContainer.setAttribute('id', 'join_button_container');

            var joinButton = document.createElement('button');
            joinButton.setAttribute('id', 'join_button');
            joinButton.innerHTML = 'Join <i class="fas fa-sign-in-alt"></i>';

            var joinInputContainer = document.createElement('div');
            joinInputContainer.setAttribute('id', 'join_input_container');

            var joinInput = document.createElement('input');
            joinInput.setAttribute('id', 'join_input');
            joinInput.setAttribute('maxlength', 20);
            joinInput.placeholder = 'Input your name...';
            joinInput.onkeyup = function () {
                if (joinInput.value.length > 0) {
                    joinButton.classList.add('enabled');
                    joinButton.onclick = function () {
                        parent.saveName(joinInput.value);
                        joinFormContainer.innerHTML = ''; // Clear join form content
                        parent.createChat();
                    };
                } else {
                    joinButton.classList.remove('enabled');
                }
            };

            joinButtonContainer.append(joinButton);
            joinInputContainer.append(joinInput);
            joinInnerContainer.append(joinInputContainer, joinButtonContainer);
            joinFormContainer.append(joinInnerContainer);
        }

        createLoad(containerId) {
            var container = document.getElementById(containerId);
            container.innerHTML = '';

            var loaderContainer = document.createElement('div');
            loaderContainer.setAttribute('class', 'loader_container');

            var loader = document.createElement('div');
            loader.setAttribute('class', 'loader');

            loaderContainer.append(loader);
            container.append(loaderContainer);
        }

        createChat() {
            var parent = this;
            var chatContainer = document.querySelector('.chat_container');
            chatContainer.innerHTML = '';

            var chatInnerContainer = document.createElement('div');
            chatInnerContainer.setAttribute('id', 'chat_inner_container');

            var chatContentContainer = document.createElement('div');
            chatContentContainer.setAttribute('id', 'chat_content_container');

            var chatInputContainer = document.createElement('div');
            chatInputContainer.setAttribute('id', 'chat_input_container');

            var chatInputSend = document.createElement('button');
            chatInputSend.setAttribute('id', 'chat_input_send');
            chatInputSend.setAttribute('disabled', true);
            chatInputSend.innerHTML = `<i class="far fa-paper-plane"></i>`;

            var chatInput = document.createElement('input');
            chatInput.setAttribute('id', 'chat_input');
            chatInput.setAttribute('maxlength', 99999);
            chatInput.placeholder = `Hi ${parent.getName()}. Say something...`;
            chatInput.onkeyup = function () {
                if (chatInput.value.length > 0) {
                    chatInputSend.removeAttribute('disabled');
                    chatInputSend.classList.add('enabled');
                    chatInputSend.onclick = function () {
                        chatInputSend.setAttribute('disabled', true);
                        chatInputSend.classList.remove('enabled');
                        if (chatInput.value.length <= 0) {
                            return;
                        }
                        parent.createLoad('chat_content_container');
                        parent.sendMessage(chatInput.value);
                        chatInput.value = '';
                        chatInput.focus();
                    };
                } else {
                    chatInputSend.classList.remove('enabled');
                }
            };
            chatInput.addEventListener("keyup", function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    chatInputSend.click();
                }
            });

            var chatLogoutContainer = document.createElement('div');
            chatLogoutContainer.setAttribute('id', 'chat_logout_container');

            var chatLogout = document.createElement('button');
            chatLogout.setAttribute('id', 'chat_logout');
            chatLogout.textContent = `${parent.getName()} • logout`;
            chatLogout.onclick = function () {
                localStorage.clear();
                parent.home();
            };

            chatLogoutContainer.append(chatLogout);
            chatInputContainer.append(chatInput, chatInputSend);
            chatInnerContainer.append(chatContentContainer, chatInputContainer, chatLogoutContainer);
            chatContainer.append(chatInnerContainer);

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
                db.ref('chats/' + `message_${index}`).set({
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
            var chatContentContainer = document.getElementById('chat_content_container');
            db.ref('chats/').on('value', function (messagesObject) {
                chatContentContainer.innerHTML = '';
                if (messagesObject.numChildren() == 0) {
                    return;
                }

                var messages = Object.values(messagesObject.val());
                var guide = [];
                var unordered = [];
                var ordered = [];

                for (var i = 0; i < messages.length; i++) {
                    guide.push(i + 1);
                    unordered.push([messages[i], messages[i].index]);
                }

                guide.forEach(function (key) {
                    var found = false;
                    unordered = unordered.filter(function (item) {
                        if (!found && item[1] == key) {
                            ordered.push(item[0]);
                            found = true;
                            return false;
                        } else {
                            return true;
                        }
                    });
                });

                ordered.forEach(function (data) {
                    var name = data.name;
                    var message = data.message;

                    var messageContainer = document.createElement('div');
                    messageContainer.setAttribute('class', 'message_container');

                    var messageInnerContainer = document.createElement('div');
                    messageInnerContainer.setAttribute('class', 'message_inner_container');

                    var messageUserContainer = document.createElement('div');
                    messageUserContainer.setAttribute('class', 'message_user_container');

                    var messageUser = document.createElement('p');
                    messageUser.setAttribute('class', 'message_user');
                    messageUser.textContent = `${name}`;

                    var messageContentContainer = document.createElement('div');
                    messageContentContainer.setAttribute('class', 'message_content_container');

                    var messageContent = document.createElement('p');
                    messageContent.setAttribute('class', 'message_content');
                    messageContent.textContent = `${message}`;

                    messageUserContainer.append(messageUser);
                    messageContentContainer.append(messageContent);
                    messageInnerContainer.append(messageUserContainer, messageContentContainer);
                    messageContainer.append(messageInnerContainer);

                    chatContentContainer.append(messageContainer);
                });
                chatContentContainer.scrollTop = chatContentContainer.scrollHeight;
            });
        }
    }

    var app = new Sasalele();
    if (app.getName() != null) {
        app.chat();
    }
});


const startDateTime = new Date('2023/10/01');

function updateLiveTime() {
    const now = new Date();
    const diff = now - startDateTime;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('liveTime').innerText =
        `Operated for: ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
}

updateLiveTime();

// 0x40 hues animation??
const hues = Array.from({ length: 128 }, () => Math.floor(Math.random() * 3600 / 10) * 10);

const background = document.getElementById('background');
const randomimg = document.getElementById('randomimg');
const toggleAnimation = document.getElementById('toggleAnimation');

let animationTimeout;

function setRandomBackgroundColor(hue) {
    background.style.backgroundColor = `hsla(${hue}, 80%, 70%, 1.0)`;
}

function setRandomImage() {
    const randomIndex = Math.floor(Math.random() * 296) + 1;
    randomimg.src = `images/image${randomIndex}.png`;

    const animation = ['anim-shake', 'anim-blur-left', 'anim-blur-right', 'anim-blur-top', 'anim-blur-bottom'];

    const anim = animation[Math.floor(Math.random() * animation.length)];

    randomimg.className = '';

    randomimg.classList.add(anim);
}

function getRandomInterval(min, max) {
    return Math.random() * (max - min) + min;
}

function animateHues() {
    function animate() {
        if (toggleAnimation.checked) {
            const hue = hues[Math.floor(Math.random() * hues.length)];
            setRandomBackgroundColor(hue);
            setRandomImage();

            const interval = getRandomInterval(0.5, 1.2) * 1000;
            animationTimeout = setTimeout(animate, interval);
        }
    }

    animate();
}

toggleAnimation.addEventListener('change', () => {
    if (toggleAnimation.checked) {
        animateHues();
    } else {
        clearTimeout(animationTimeout);
    }
});

const ap = new APlayer({ container: document.getElementById("aplayer"), fixed: !1, mini: !1, autoplay: !1, theme: "#b7daff", loop: "all", order: "random", preload: "none", volume: .7, mutex: !0, listFolded: !1, listMaxHeight: "300px", lrcType: 3, audio: [{ name: "スカイクラッドの観測者", artist: "いとうかなこ", url: "assets/music/スカイクラッドの観測者 - 伊藤加奈子.mp3", cover: "assets/covers/スカイクラッドの観測者-伊藤加奈子.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%82%B9%E3%82%AB%E3%82%A4%E3%82%AF%E3%83%A9%E3%83%83%E3%83%89%E3%81%AE%E8%A6%B3%E6%B8%AC%E8%80%85-%E4%BC%8A%E8%97%A4%E5%8A%A0%E5%A5%88%E5%AD%90.lrc" }, { name: "technovision", artist: "いとうかなこ", url: "assets/music/technovision - 伊藤加奈子.mp3", cover: "assets/covers/technovision-伊藤加奈子.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/technovision-%E4%BC%8A%E8%97%A4%E5%8A%A0%E5%A5%88%E5%AD%90.lrc" }, { name: "Hacking to the Gate", artist: "いとうかなこ", url: "assets/music/Hacking to the Gate.mp3", cover: "assets/covers/HackingtotheGate-伊藤加奈子.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/HackingtotheGate-%E4%BC%8A%E8%97%A4%E5%8A%A0%E5%A5%88%E5%AD%90.lrc" }, { name: "GATE OF STEINER (Bonus Track)", artist: "佐々木恵梨", url: "assets/music/GATE OF STEINER (Bonus Track) - 佐々木恵梨.mp3", cover: "assets/covers/GATEOFSTEINER(BonusTrack)-佐々木恵梨.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/GATEOFSTEINER(BonusTrack)-%E4%BD%90%E3%80%85%E6%9C%A8%E6%81%B5%E6%A2%A8.lrc" }, { name: "いつもこの場所で", artist: "あやね", url: "assets/music/いつもこの場所で (一直在这个地方) - あやね.mp3", cover: "assets/covers/いつもこの場所で-あやね.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%81%84%E3%81%A4%E3%82%82%E3%81%93%E3%81%AE%E5%A0%B4%E6%89%80%E3%81%A7-%E3%81%82%E3%82%84%E3%81%AD.lrc" }, { name: "あなたの選んだこの時を", artist: "いとうかなこ", url: "assets/music/あなたの選んだこの時を - いとうかなこ.mp3", cover: "assets/covers/あなたの選んだこの時を-いとうかなこ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%81%82%E3%81%AA%E3%81%9F%E3%81%AE%E9%81%B8%E3%82%93%E3%81%A0%E3%81%93%E3%81%AE%E6%99%82%E3%82%92-%E3%81%84%E3%81%A8%E3%81%86%E3%81%8B%E3%81%AA%E3%81%93.lrc" }, { name: "前前前世", artist: "RADWIMPS", url: "assets/music/前前前世.mp3", cover: "assets/covers/前前前世-RADWIMPS.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%89%8D%E5%89%8D%E5%89%8D%E4%B8%96-RADWIMPS.lrc" }, { name: "Butter-Fly", artist: "和田光司(By コバソロ & 七穂)", url: "assets/music/Butter-Fly.mp3", cover: "assets/covers/Butter-Fly-和田光司(わだこうじ).webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/Butter-Fly-%E5%92%8C%E7%94%B0%E5%85%89%E5%8F%B8(%E3%82%8F%E3%81%A0%E3%81%93%E3%81%86%E3%81%98).lrc" }, { name: "Catch the Moment", artist: "LiSA", url: "assets/music/Catch the Moment.mp3", cover: "assets/covers/CatchtheMoment-LiSA.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/CatchtheMoment-LiSA.lrc" }, { name: "Baby Don't Know Why", artist: "Ms.OOJA", url: "assets/music/Baby Dont Know Why.mp3", cover: "assets/covers/babydonttknowwhy-Ms.OOJA.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/babydonttknowwhy-Ms.OOJA.lrc" }, { name: "LOSER", artist: "米津玄師", url: "assets/music/LOSER.mp3", cover: "assets/covers/LOSER-米津玄師.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/LOSER-%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc" }, { name: "打上花火", artist: "DAOKO  米津玄師", url: "assets/music/打上花火.mp3", cover: "assets/covers/打上花火-米津玄師.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E6%89%93%E4%B8%8A%E8%8A%B1%E7%81%AB-%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc" }, { name: "終わりの世界から", artist: "麻枝 准  やなぎなぎ", url: "assets/music/終わりの世界から.mp3", cover: "assets/covers/終わりの世界から-やなぎなぎ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E7%B5%82%E3%82%8F%E3%82%8A%E3%81%AE%E4%B8%96%E7%95%8C%E3%81%8B%E3%82%89-%E3%82%84%E3%81%AA%E3%81%8E%E3%81%AA%E3%81%8E.lrc" }, { name: "Break Beat Bark!", artist: "神田沙也加", url: "assets/music/Break Beat Bark.mp3", cover: "assets/covers/BreakBeatBark!-神田沙也加.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/BreakBeatBark!-%E7%A5%9E%E7%94%B0%E6%B2%99%E4%B9%9F%E5%8A%A0.lrc" }, { name: "ワイルドローズ", artist: "May'n", url: "assets/music/Wild Rose.mp3", cover: "assets/covers/ワイルドローズ-Mayn.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%83%AF%E3%82%A4%E3%83%AB%E3%83%89%E3%83%AD%E3%83%BC%E3%82%BA-Mayn.lrc" }, { name: "My Days", artist: "鈴木このみ", url: "assets/music/My Days.mp3", cover: "assets/covers/MyDays-鈴木このみ.webp", lrc: "assets/lrc/MyDays-鈴木このみ.lrc" }, { name: "Lemon", artist: "米津玄師", url: "assets/music/Lemon.mp3", cover: "assets/covers/Lemon-米津玄師.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/Lemon-%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc" }, { name: "小さな恋のうた", artist: "コバソロ & 杏沙子", url: "assets/music/小さな恋のうた.mp3", cover: "assets/covers/コバソロ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F-Kobasolo(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E4%B8%83%E7%A9%82.lrc" }, { name: "あとひとつ", artist: "コバソロ & こぴ", url: "assets/music/あとひとつ.mp3", cover: "assets/covers/コバソロ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%81%82%E3%81%A8%E3%81%B2%E3%81%A8%E3%81%A4-Kobasolo(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E3%81%93%E3%81%B4.lrc" }, { name: "キセキ", artist: "高橋李依", url: "assets/music/キセキ.mp3", cover: "assets/covers/高橋李依Collection.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%82%AD%E3%82%BB%E3%82%AD-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc" }, { name: "小さな恋のうた", artist: "高橋李依", url: "assets/music/小さな恋のうた_高橋李依.mp3", cover: "assets/covers/高橋李依Collection.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc" }, { name: "言わないけどね。", artist: "高橋李依", url: "assets/music/言わないけどね。.mp3", cover: "assets/covers/高橋李依Collection.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E8%A8%80%E3%82%8F%E3%81%AA%E3%81%84%E3%81%91%E3%81%A9%E3%81%AD%E3%80%82-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc" }, { name: "愛唄", artist: "高橋李依", url: "assets/music/愛唄.mp3", cover: "assets/covers/高橋李依Collection.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E6%84%9B%E5%94%84-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc" }, { name: "奏(和聲版)", artist: "高橋李依 x 雨宫天", url: "assets/music/奏.mp3", cover: "assets/covers/高橋李依Collection.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%A5%8F(%E3%81%8B%E3%81%AA%E3%81%A7)-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc" }, { name: "生きていたんだよな", artist: "あいみょん", url: "assets/music/生きていたんだよな.mp3", cover: "assets/covers/生きていたんだよな-あいみょん.webp", lrc: "assets/lrc/生きていたんだよな-あいみょん.lrc" }, { name: "空の青さを知る人よ", artist: "あいみょん", url: "assets/music/空の青さを知る人よ.mp3", cover: "assets/covers/空の青さを知る人よ-あいみょん.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E7%A9%BA%E3%81%AE%E9%9D%92%E3%81%95%E3%82%92%E7%9F%A5%E3%82%8B%E4%BA%BA%E3%82%88-%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc" }, { name: "心做し", artist: "鹿乃", url: "assets/music/鹿乃 - 心做し.mp3", cover: "assets/covers/心做し-鹿乃.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%BF%83%E5%81%9A%E3%81%97-%E9%B9%BF%E4%B9%83.lrc" }, { name: "あの世行きのバスに乗ってさらば。", artist: "ツユ", url: "assets/music/あの世行きのバスに乗ってさらば。.mp3", cover: "assets/covers/あの世行きのバスに乗ってさらば。-ツユ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%81%82%E3%81%AE%E4%B8%96%E8%A1%8C%E3%81%8D%E3%81%AE%E3%83%90%E3%82%B9%E3%81%AB%E4%B9%97%E3%81%A3%E3%81%A6%E3%81%95%E3%82%89%E3%81%B0%E3%80%82-%E3%83%84%E3%83%A6.lrc" }, { name: "願い～あの頃のキミへ～", artist: "當山みれい", url: "assets/music/願い～あの頃のキミへ～.mp3", cover: "assets/covers/願いあの頃のキミへ-當山みれい..webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E9%A1%98%E3%81%84%E3%81%82%E3%81%AE%E9%A0%83%E3%81%AE%E3%82%AD%E3%83%9F%E3%81%B8-%E7%95%B6%E5%B1%B1%E3%81%BF%E3%82%8C%E3%81%84.lrc" }, { name: "茜さす", artist: "Aimer", url: "assets/music/茜さす.mp3", cover: "assets/covers/茜さす-Aimer.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E8%8C%9C%E3%81%95%E3%81%99-Aimer.lrc" }, { name: "Rain", artist: "秦基博(はたもとひろ)", url: "assets/music/Rain.mp3", cover: "assets/covers/Rain-秦基博(はたもとひろ).webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/Rain-%E7%A7%A6%E5%9F%BA%E5%8D%9A(%E3%81%AF%E3%81%9F%E3%82%82%E3%81%A8%E3%81%B2%E3%82%8D).lrc" }, { name: "remember", artist: "Uru", url: "assets/music/remember.mp3", cover: "assets/covers/remember-uru.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/remember-uru.lrc" }, { name: "AI DO.", artist: "桥本美雪", url: "assets/music/AI DO. - 桥本美雪.mp3", cover: "assets/covers/AIDO.-桥本美雪.webp", lrc: "assets/lrc/AIDO.-桥本美雪.lrc" }, { name: "Apple And Cinnamon", artist: "宇多田ヒカル", url: "assets/music/Apple And Cinnamon - 宇多田ヒカル.mp3", cover: "assets/covers/AppleAndCinnamon-宇多田ヒカル.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/AppleAndCinnamon-%E5%AE%87%E5%A4%9A%E7%94%B0%E3%83%92%E3%82%AB%E3%83%AB.lrc" }, { name: "Keep on Keeping on", artist: "SawanoHiroyuki[nZk],aLIEz.", url: "assets/music/Keep on Keeping on - SawanoHiroyuki[nZk],aLIEz.mp3", cover: "assets/covers/KeeponKeepingon-SawanoHiroyuki_aLIEz.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/KeeponKeepingon-SawanoHiroyuki_aLIEz.lrc" }, { name: "loser", artist: "KANA-BOON", url: "assets/music/loser - KANA-BOON.mp3", cover: "assets/covers/loser-KANA-BOON.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/loser-KANA-BOON.lrc" }, { name: "Moon", artist: "Perfume", url: "assets/music/Moon - Perfume.mp3", cover: "assets/covers/Moon-Perfume.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/Moon-Perfume.lrc" }, { name: "MOON SIGNAL", artist: "Sphere", url: "assets/music/MOON SIGNAL - Sphere.mp3", cover: "assets/covers/MOONSIGNAL-Sphere.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/MOONSIGNAL-Sphere.lrc" }, { name: "One Life", artist: "ナノ", url: "assets/music/One Life - ナノ.mp3", cover: "assets/covers/OneLife-ナノ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/OneLife-%E3%83%8A%E3%83%8E.lrc" }, { name: "メビウス", artist: "鈴木このみ", url: "assets/music/メビウス (梅比乌斯) - 鈴木このみ.mp3", cover: "assets/covers/メビウス(梅比乌斯)-鈴木このみ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%83%A1%E3%83%93%E3%82%A6%E3%82%B9(%E6%A2%85%E6%AF%94%E4%B9%8C%E6%96%AF)-%E9%88%B4%E6%9C%A8%E3%81%93%E3%81%AE%E3%81%BF.lrc" }, { name: "Damn Good Day", artist: "星街すいせい", url: "assets/music/Damn Good Day - 星街すいせい.mp3", cover: "assets/covers/DamnGoodDay-星街すいせい.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/DamnGoodDay-%E6%98%9F%E8%A1%97%E3%81%99%E3%81%84%E3%81%9B%E3%81%84.lrc" }, { name: "Necro Fantasia feat. 美里", artist: "Alstroemeria Records,美里", url: "assets/music/Necro Fantasia feat. 美里 - Alstroemeria Records,美里.mp3", cover: "assets/covers/NecroFantasiafeat.美里-AlstroemeriaRecords_美里.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/NecroFantasiafeat.%E7%BE%8E%E9%87%8C-AlstroemeriaRecords_%E7%BE%8E%E9%87%8C.lrc" }, { name: "ぐらでーしょん", artist: "KANA-BOON,北澤ゆうほ", url: "assets/music/ぐらでーしょん (波淡法) - KANA-BOON,北澤ゆうほ.mp3", cover: "assets/covers/ぐらでーしょん-KANA-BOON,北澤ゆうほ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%81%90%E3%82%89%E3%81%A7%E3%83%BC%E3%81%97%E3%82%87%E3%82%93-KANA-BOON%2C%E5%8C%97%E6%BE%A4%E3%82%86%E3%81%86%E3%81%BB.lrc" }, { name: "チョ・イ・ス", artist: "雨宮天", url: "assets/music/チョ・イ・ス - 雨宮天.mp3", cover: "assets/covers/チョ・イ・ス-雨宮天.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%83%81%E3%83%A7%E3%83%BB%E3%82%A4%E3%83%BB%E3%82%B9-%E9%9B%A8%E5%AE%AE%E5%A4%A9.lrc" }, { name: "ひかり", artist: "Flower Flower", url: "assets/music/ひかり - Flower Flower.mp3", cover: "assets/covers/ひかり-FlowerFlower.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E3%81%B2%E3%81%8B%E3%82%8A-FlowerFlower.lrc" }, { name: "人形ノ涙", artist: "仲村芽衣子", url: "assets/music/人形ノ涙 - 仲村芽衣子.mp3", cover: "assets/covers/人形ノ涙-仲村芽衣子.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E4%BA%BA%E5%BD%A2%E3%83%8E%E6%B6%99-%E4%BB%B2%E6%9D%91%E8%8A%BD%E8%A1%A3%E5%AD%90.lrc" }, { name: "喋蝶結び", artist: "ななひら", url: "assets/music/喋蝶結び - ななひら.mp3", cover: "assets/covers/喋蝶結び-ななひら.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%96%8B%E8%9D%B6%E7%B5%90%E3%81%B3-%E3%81%AA%E3%81%AA%E3%81%B2%E3%82%89.lrc" }, { name: "月に唄えば", artist: "サイダーガール", url: "assets/music/月に唄えば - サイダーガール.mp3", cover: "assets/covers/月に唄えば-サイダーガール.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E6%9C%88%E3%81%AB%E5%94%84%E3%81%88%E3%81%B0-%E3%82%B5%E3%82%A4%E3%83%80%E3%83%BC%E3%82%AC%E3%83%BC%E3%83%AB.lrc" }, { name: "甘いワナ ~Paint It, Black", artist: "宇多田ヒカル", url: "assets/music/甘いワナ ~Paint It, Black - 宇多田ヒカル.mp3", cover: "assets/covers/甘いワナPaintItBlack-宇多田ヒカル.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E7%94%98%E3%81%84%E3%83%AF%E3%83%8APaintItBlack-%E5%AE%87%E5%A4%9A%E7%94%B0%E3%83%92%E3%82%AB%E3%83%AB.lrc" }, { name: "廻廻奇譚", artist: "Eve", url: "assets/music/廻廻奇譚 - Eve.mp3", cover: "assets/covers/廻廻奇譚-Eve.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E5%BB%BB%E5%BB%BB%E5%A5%87%E8%AD%9A-Eve.lrc" }, { name: "足りない音はキミの声", artist: "諸星すみれ", url: "assets/music/足りない音はキミの声 - 諸星すみれ.mp3", cover: "assets/covers/足りない音はキミの声-諸星すみれ.webp", lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/assets/lrc/%E8%B6%B3%E3%82%8A%E3%81%AA%E3%81%84%E9%9F%B3%E3%81%AF%E3%82%AD%E3%83%9F%E3%81%AE%E5%A3%B0-%E8%AB%B8%E6%98%9F%E3%81%99%E3%81%BF%E3%82%8C.lrc" }] });
