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
const confirmation = document.querySelector('.copy-confirmation');

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
    confirmation.style.display = 'flex';
    setTimeout(() => confirmation.style.display = 'none', 2000);
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
                <button class="download-button"><i class="fas fa-download"></i></button>
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
                        <button class="download-button"><i class="fas fa-download"></i></button>
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
    //const proxiedLink = `https://sasalele.api-anycast.workers.dev/${link}`;
    const hls = new Hls();
    if (Hls.isSupported()) {
        hls.loadSource(link);
        hls.attachMedia(m3u8player);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            m3u8player.play();
        });
    } else if (m3u8player.canPlayType('application/vnd.apple.mpegurl')) {
        m3u8player.src = link;
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

            function updateSendButtonState() {
                const hasValue = chatInput.value.length > 0;
                chatInputSend.disabled = !hasValue;
                chatInputSend.classList.toggle('enabled', hasValue);
            }

            chatInput.addEventListener("keyup", function (event) {
                updateSendButtonState();
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
            const fragment = document.createDocumentFragment();

            db.ref('chats/').on('value', (messagesObject) => {
                chatContentContainer.innerHTML = '';

                const messages = messagesObject.val();
                if (!messages || Object.keys(messages).length === 0) {
                    return;
                }

                const ordered = Object.values(messages).sort((a, b) => a.index - b.index);

                ordered.forEach((data) => {
                    const { name, message } = data;

                    const messageContainer = createElement('div', null, null, { class: 'message_container' });
                    const messageInnerContainer = createElement('div', null, null, { class: 'message_inner_container' });

                    const messageUserContainer = createElement('div', null, null, { class: 'message_user_container' });
                    const messageUser = createElement('p', null, name, { class: 'message_user' });
                    messageUserContainer.appendChild(messageUser);

                    const messageContentContainer = createElement('div', null, null, { class: 'message_content_container' });
                    const messageContent = createElement('p', null, message, { class: 'message_content' });
                    messageContentContainer.appendChild(messageContent);

                    messageInnerContainer.append(messageUserContainer, messageContentContainer);
                    messageContainer.appendChild(messageInnerContainer);
                    fragment.appendChild(messageContainer);
                });

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