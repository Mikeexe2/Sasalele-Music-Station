fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/all.json")
    .then(response => response.json())
    .then(data => {
        var streamInfo = document.getElementById('streamInfo');
        var player = document.getElementById('miniPlayer');
        var stationName = document.getElementById('stationName');
        var radiostations = document.getElementById('radiostations');

        data.forEach(station => {
            // Create a new radio station widget
            var rad = document.createElement('div');
            rad.className = 'widget';

            // Create the play button with Font Awesome icon
            var radPlayButton = document.createElement('div');
            radPlayButton.className = 'main-play-button';
            radPlayButton.innerHTML = '<i class="fas fa-play"></i>';

            // Create a link with station information
            var radLink = document.createElement('a');
            radLink.className = 'player-radio-link';
            radLink.href = station.website;
            radLink.target = '_blank';
            radLink.innerHTML = '<img class="rad-icon" src="' + station.favicon + '">' +
                '<span class="player-radio-name">' + station.name + '</span>';

            // Add click event to the play button
            radPlayButton.addEventListener('click', function () {
                playStation(station, radPlayButton);
            });

            // Append elements to the radio station widget
            rad.appendChild(radPlayButton);
            rad.appendChild(radLink);

            // Append the radio station widget to the radTopBar
            radiostations.appendChild(rad);
        });

        // Random play function
        var mikuGif = document.getElementById('miku-gif');
        mikuGif.addEventListener('click', function () {
            var stations = radiostations.querySelectorAll('.widget');
            var randomIndex = Math.floor(Math.random() * stations.length);
            var playButton = stations[randomIndex].querySelector('.main-play-button');
            playButton.click();
        });

        function playStation(station, playButton) {
            var allPlayButtons = document.querySelectorAll('.main-play-button');
            allPlayButtons.forEach(function (button) {
                if (button !== playButton) {
                    updatePlayButtonIcon(button, false); // Reset other play buttons to pause icon
                }
            });

            if (player.getAttribute('data-link') === station.url) {
                if (player.paused) {
                    player.play();
                    updatePlayButtonIcon(playButton, true);
                } else {
                    player.pause();
                    updatePlayButtonIcon(playButton, false);
                }
            } else {
                player.src = station.url;
                player.play();
                streamInfo.innerHTML = '<a href="' + station.website + '" target="_blank"><img src="' + station.favicon + '"></a>';
                stationName.textContent = station.name;
                player.setAttribute('data-link', station.url);
                updatePlayButtonIcon(playButton, true);
            }
        }

        function updatePlayButtonIcon(playButton, isPlaying) {
            playButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }
        player.addEventListener('ended', function () {
            var currentPlayButton = radTopBar.querySelector('.main-play-button[data-link="' + player.getAttribute('data-link') + '"]');
            updatePlayButtonIcon(currentPlayButton, false);
        });

        player.addEventListener('pause', function () {
            var currentPlayButton = radTopBar.querySelector('.main-play-button[data-link="' + player.getAttribute('data-link') + '"]');
            updatePlayButtonIcon(currentPlayButton, false);
        });
    });

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetElement = document.querySelector(this.getAttribute('href'));
        const offset = 60; // Adjust this value according to your layout

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - offset,
                behavior: 'smooth'
            });
        }
    });
});

// Dynamically list out websites
fetch('https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/websites.json')
    .then(response => response.json())
    .then(websites => {
        // Group websites based on categories
        const groupedWebsites = websites.reduce((result, website) => {
            (result[website.tags] = result[website.tags] || []).push(website);
            return result;
        }, {});

        Object.entries(groupedWebsites).forEach(([tags, websites]) => {
            const containerHTML = websites.map(website => `
            <div class="container">
              <a href="${website.url}" target="_blank">
                <img src="${website.imgSrc}">
                <h5>${website.name}</h5>
              </a>
            </div>
          `).join('');

            // Insert the generated HTML into the respective tags element
            if (tags === 'radio') {
                document.querySelector('#radiohere').innerHTML = containerHTML;
            } else if (tags === 'website') {
                document.querySelector('#websitehere').innerHTML = containerHTML;
            } else if (tags === 'radiojp') {
                document.querySelector('#radiojphere').innerHTML = containerHTML;
            }
        });
    });

fetch('https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/downloads.json')
    .then(response => response.json())
    .then(scrap => {
        const containerHTML = scrap.map(website => `
    <div class="container">
        <a href="${website.url}" target="_blank">
            <img src="${website.imgSrc}">
                <h5>${website.name}</h5>
        </a>
    </div>`).join('');
        document.querySelector('.download').innerHTML = containerHTML;
    });

// Search function
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const websites = document.querySelectorAll('.button');
const innerContainer = document.querySelector('.inner');
const searchTermsContainer = document.getElementById('searchTerms');

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== '') {
        innerContainer.style.display = 'block';
        searchTermsContainer.textContent = searchTerm;
        lastfmSearch(searchTerm);
        YouTubeSearch(searchTerm);
    } else {
        searchInput.classList.add('error');
    }
    // Clear the input field
    searchInput.value = '';
});

searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// function that uses the lastFM API to fetch matching song titles
function lastfmSearch(songTitle) {
    var baseURL = "https://ws.audioscrobbler.com/2.0/?method=track.search&format=json";

    var lastfmAPIKey = "b9747c75368b42160af4301c2bf654a1";
    var parameterssongSearch = `&api_key=${lastfmAPIKey}&track=${songTitle}`;

    baseURL = baseURL + parameterssongSearch;

    var requestOptions = {
        method: "GET",
        redirect: "follow",
    };

    fetch(baseURL, requestOptions)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(function (data) {
            console.log("song title search: ", data);
            displaysongSearch(data);
        })
        .catch(function (error) {
            console.log("Error from lastfm song title API: ", error);
        });
}

// Function to display matching song - artist
function displaysongSearch(data) {
    const searchTerm = searchInput.value.trim();
    document.getElementById("lastFMInfo").innerHTML = "";

    var songSearchDiv = document.getElementById("lastFMInfo");

    var songSearchList = document.createElement("ul");

    for (var i = 0; i < 5; i++) {
        var songTitleName = data.results.trackmatches.track[i].name;
        var songTitleArtist = data.results.trackmatches.track[i].artist;
        var result = "<li>" + songTitleName + " - " + songTitleArtist + "</li>";
        console.log(result);
        songSearchList.innerHTML += result;
    }

    songSearchDiv.appendChild(songSearchList);
}

function YouTubeSearch(songName) {

    const ytURL =
        "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&videoSyndicated=true&videoEmbeddable=true&q=";
    var ytAPIKey = "&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s";

    var VideoDisplay = document.querySelector("#YouTubeVideo");

    if ((VideoDisplay.style.display = "none")) {
        VideoDisplay.style.display = "block";
    }

    var fullYTURLPathTitle = ytURL + songName + ytAPIKey;

    console.log(fullYTURLPathTitle);

    fetch(fullYTURLPathTitle)
        .then(function (response) {
            console.log(response);
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(function (data) {
            console.log(data.items[0].id.videoId);

            var UniqueVidId = data.items[0].id.videoId;
            document.getElementById("YouTubeVideo").src =
                "https://www.youtube.com/embed/" + UniqueVidId;
        })
        .catch(function (error) {
            console.log("Error from Youtube by song title API: ", error);
        });
}

const websiteButtons = document.querySelectorAll('.button');

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

// Search result links generation
function getWebsiteURL(label, searchTerm) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);

    switch (label) {
        case 'Spotify':
            return `https://open.spotify.com/search/${encodedSearchTerm}`;
        case 'Apple Music':
            return `https://music.apple.com/search?term=${encodedSearchTerm}`;
        case 'Amazon Music':
            return `https://music.amazon.com/search/${encodedSearchTerm}`;
        case 'Amazon Japan':
            return `https://music.amazon.co.jp/search/${encodedSearchTerm}`;
        case 'YouTube':
            return `https://www.youtube.com/results?search_query=${encodedSearchTerm}`;
        case 'YouTube Music':
            return `https://music.youtube.com/search?q=${encodedSearchTerm}`;
        case '网易云':
            return `https://music.163.com/#/search/m/?s=${encodedSearchTerm}`;
        case 'KKBOX':
            return `https://www.kkbox.com/my/en/search?q=${encodedSearchTerm}`;
        case 'VGMdb':
            return `https://vgmdb.net/search?q=${encodedSearchTerm}`;
        case 'MusicEnc':
            return `https://www.musicenc.com/?search=${encodedSearchTerm}`;
        case 'J-Lyric.net':
            return `https://search3.j-lyric.net/index.php?ex=on&ct=2&ca=2&cl=2&kt==${encodedSearchTerm}`;
        case 'FollowLyrics':
            return `https://zh.followlyrics.com/search?name=${encodedSearchTerm}`;
        case 'Kugeci':
            return `https://www.kugeci.com/search?q=${encodedSearchTerm}`;
        case '巴哈姆特':
            return `https://m.gamer.com.tw/search.php?q=${encodedSearchTerm}+歌詞`;
        case 'Soundcloud':
            return `https://soundcloud.com/search?q=${encodedSearchTerm}`;
        case 'Audio Archive':
            return `https://archive.org/details/audio?query=${encodedSearchTerm}`;
        case 'last.fm':
            return `https://www.last.fm/search/tracks?q=${encodedSearchTerm}`;
        case 'Google':
            return `https://www.google.com/search?q=${encodedSearchTerm}`;
        case 'Google(Lyrics)':
            return `https://www.google.com/search?q=${encodedSearchTerm}+歌詞 `;
        case 'Uta-net':
            return `https://www.uta-net.com/search/?target=art&type=in&keyword=${encodedSearchTerm}`;
        case 'MusicBrainz':
            return `https://musicbrainz.org/search?query=${encodedSearchTerm}&type=work&method=indexed`;
        case 'Gnudb':
            return `https://gnudb.org/song/${encodedSearchTerm}`;
        case 'TouHouDB':
            return `https://touhoudb.com/Search?filter=${encodedSearchTerm}`;
        case 'MikuDB':
            return `https://mikudb.moe/?s=${encodedSearchTerm}`;
        case 'ニコニコ動画':
            return `https://www.nicovideo.jp/search/${encodedSearchTerm}`;
        case 'VocaDB':
            return `https://vocadb.net/Search?filter=${encodedSearchTerm}`;
        case 'Japanese Song Lyrics':
            return `https://japanesesonglyrics.com/?s=${encodedSearchTerm}`;
        case 'PetitLyrics':
            return `https://petitlyrics.com/search_lyrics?title=${encodedSearchTerm}`;
        default:
            return '';
    }
}

function YouTubeSearchByTitle() {

    const ytURL =
        "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&videoSyndicated=true&videoEmbeddable=true&q=";
    var ytAPIKey = "&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s";

    var songName = document.getElementById("titleinput").value;
    if (!songName) {
        return;
    }
    var VideoDisplay = document.querySelector("#YouTubeVideo");

    if ((VideoDisplay.style.display = "none")) {
        VideoDisplay.style.display = "block";
    }

    var fullYTURLPathTitle = ytURL + songName + ytAPIKey;

    console.log(fullYTURLPathTitle);

    fetch(fullYTURLPathTitle)
        .then(function (response) {
            console.log(response);
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(function (data) {
            console.log(data.items[0].id.videoId);

            var UniqueVidId = data.items[0].id.videoId;
            document.getElementById("YouTubeVideo").src =
                "https://www.youtube.com/embed/" + UniqueVidId;
        })
        .catch(function (error) {
            console.log("Error from Youtube by song title API: ", error);
        });
}

// google drive music player
const CLIENT_ID = '993505903479-tk48veqhlu2r1hiu9m2hvaq2l81urnla.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    gisInited = true;
}

function handleAuthClick(folderId) {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }

        getContents(folderId, "initial");
        localStorage.setItem("returning", "true");
        document.getElementById('return').style.display = 'none';

        gapi.client.drive.about.get({
            'fields': "user",
        }).then(function (response) {
            window.location.hash = '#~' + response.result.user.permissionId;
        });
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: '' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
    }
}


function getContents(id, type) {
    var contentsQuery = "'" + id + "'" + " in parents and trashed = false ";
    gapi.client.drive.files.list({
        'pageSize': 1000,
        'q': contentsQuery,
        'orderBy': 'name',
        'fields': "nextPageToken, files(id, name, mimeType, webContentLink)"
    }).then(function (response) {

        // hide intro
        document.getElementById('intro').style.display = 'none';

        // set location
        if (type == "initial") {
            var location = "contents";
        } else {
            var location = id;

            // check for previous load
            if (document.getElementById(location).classList.contains("loaded")) {
                return;
            }
        }

        var files = response.result.files;
        if (files && files.length > 0) {

            // loop folders
            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (file.mimeType.includes("application/vnd.google-apps.folder")) {
                    document.getElementById(location).innerHTML += `
          <details id="${file.id}">
            <summary onclick="getContents('${file.id}')">${file.name}</summary>
          </details>
          `;
                }
                document.getElementById(location).classList.add("loaded");
            }

            // loop files
            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (file.mimeType.includes("audio")) {
                    document.getElementById(location).innerHTML += `
          <button class="track" onclick="playTrack('${file.id}', this)"><i class="fas fa-play"></i> ${file.name}</button>
          `;
                }

                document.getElementById(location).classList.add("loaded");
            }

        } else {
            alert('No files found.');
        }

        document.getElementById(location).firstElementChild.focus();
    });
}

//USER FOLDER
function submitFolderId(e) {
    e.preventDefault();
    localStorage.setItem("parentfolder", document.getElementById('parentfolder').value);
    handleAuthClick(document.getElementById('parentfolder').value);
}

function getFolderId() {
    document.getElementById('parentfolder').value = localStorage.getItem("parentfolder");
}

//AUDIO
audio = document.getElementById('audio');
source = document.getElementById('source');
if (document.getElementsByClassName("playing")[0]) {
    playing = document.getElementsByClassName("playing")[0];
} else {
    playing = false;
}

function playTrack(id, element, type) {
    // check if clicked track is already 'playing'
    if (element == playing) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        return;
    }

    // check for something already 'playing'
    if (playing) {
        resetIconToPlay();
        playing.classList.remove("playing");
    }

    // set new track
    element.classList.add("playing");
    playing = document.getElementsByClassName("playing")[0];
    audio.pause();
    source.src = "";
    audio.load();

    spinner = `
    <div id="spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  `;
    playing.innerHTML += spinner;

    // demo track
    if (type == "demo") {
        source.src = "https://drive.google.com/uc?id=" + id + "&export=download";
        audio.load();
        audio.oncanplay = audio.play();
        if (document.getElementById("spinner")) {
            document.getElementById("spinner").remove();
        }
        return;
    }

    // user track
    gapi.client.drive.files.get({
        'fileId': id,
        'alt': 'media',
    }).then(function (response) {
        dataArr = Uint8Array.from(response.body.split('').map((chr) => chr.charCodeAt(0)));
        file = new File([dataArr], 'audiofilename', { type: response.headers['Content-Type'] });
        source.src = URL.createObjectURL(file);
        source.type = response.headers['Content-Type'];
        audio.load();
        audio.oncanplay = audio.play();
        if (document.getElementById("spinner")) {
            document.getElementById("spinner").remove();
        }
    });
}

function prevTrack() {
    if (audio.currentTime > 3 || !playing.previousElementSibling.previousElementSibling) {
        audio.currentTime = 0;
        audio.play();
    } else if (playing.previousElementSibling.previousElementSibling) {
        resetIconToPlay();
        playing.previousElementSibling.click();
    }
}

function nextTrack() {
    if (playing.nextElementSibling) {
        resetIconToPlay();
        playing.nextElementSibling.click();
    }
}

function resetIconToPlay() {
    playing.firstChild.classList.remove("fa-pause");
    playing.firstChild.classList.add("fa-play");
    if (document.getElementById("bars")) {
        document.getElementById("bars").remove();
    }
}

function resetIconToPause() {
    playing.firstChild.classList.remove("fa-play");
    playing.firstChild.classList.add("fa-pause");
    indicator = `
    <div id="bars">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  `;
    playing.innerHTML += indicator;
}

audio.onended = function () {
    if (playing.nextElementSibling) {
        playing.nextElementSibling.focus();
    }
    nextTrack();
};

audio.onpause = function () {
    resetIconToPlay();
}
audio.onplay = function () {
    resetIconToPause();
}


if (localStorage.getItem("returning") == "true" && localStorage.getItem("parentfolder") !== null) {
    document.getElementById('return').style.display = 'block';
} else {
    document.getElementById('intro').style.display = 'block';
}

function changeFolder() {
    document.getElementById('return').style.display = 'none';
    document.getElementById('intro').style.display = 'block';
    document.getElementById('parentfolder').focus();
    localStorage.setItem("returning", "false");
}
