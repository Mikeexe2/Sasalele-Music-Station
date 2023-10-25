// Fetch the M3U file
fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/all.m3u")
    .then(response => response.text())
    .then(data => {
        // Split the data by line breaks
        var lines = data.split('\n');

        // Iterate through each line of the M3U file
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            // Check if the line contains station information
            if (line.startsWith('#EXTINF:')) {
                // Extract the station name from the line
                var name = line.split(',')[1].trim();

                // Extract the station link from the next line
                var link = lines[i + 1].trim();

                // Create a new list item element
                var li = document.createElement('li');
                var a = document.createElement('a');
                var playIcon = document.createElement('i');

                // Set the link and name attributes
                a.href = link;
                a.textContent = name;

                a.addEventListener('click', function (event) {
                    event.preventDefault();

                    var player = document.getElementById('miniPlayer');
                    player.src = this.getAttribute('data-link');
                    player.play();

                    var stationName = this.getAttribute('station-name');
                    document.getElementById('stationName').textContent = stationName;
                });

                // Set the data-link attribute to store the station link
                a.setAttribute('data-link', link);
                a.setAttribute('station-name', name);

                playIcon.classList.add('fas', 'fa-play');
                a.insertBefore(playIcon, a.firstChild);

                // Append the link to the list item
                li.appendChild(a);

                // Append the list item to the playlist
                document.getElementById("playlist").appendChild(li);
            }
        }

        // random play
        var cover = document.getElementById('miku-gif');
        cover.addEventListener('click', function () {
            var playlist = document.getElementById('playlist');
            var stationCount = playlist.childElementCount;
            if (stationCount > 0) {
                var randomIndex = Math.floor(Math.random() * stationCount);
                var randomStation = playlist.children[randomIndex].children[0];
                randomStation.click();
            }
        });
    });

// Dynamically list out website from github
const websitesContainer = document.querySelector('.websites');

fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/websites.txt")
    .then(response => response.text())
    .then(data => {
        // Split the data into individual websites
        const websitesData = data.split('\n\n');

        // Iterate over each website's data
        websitesData.forEach(websiteData => {
            // Split the website's data into lines
            const lines = websiteData.split('\n');

            // Extract the website's information from the lines
            const link = lines[0];
            const imageSrc = lines[1];
            const name = lines[2];

            const container = document.createElement('div');
            container.classList.add('container');

            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.target = "_blank";

            const image = document.createElement('img');
            image.src = imageSrc;

            linkElement.appendChild(image);
            container.appendChild(linkElement);

            const heading = document.createElement('h5');
            heading.textContent = name;
            container.appendChild(heading);

            websitesContainer.appendChild(container);
        });
    })
    .catch(error => {
        console.error('Error retrieving data:', error);
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

function closeVideo() {
    document.getElementById("YouTubeVideo").style.display = "none";
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
        case 'Audiomack':
            return `https://audiomack.com/search?q=${encodedSearchTerm}`;
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
        default:
            return '';
    }
}

function YouTubeSearchByTitle() {

    console.log("RUNNING YOUTUBE FUNCTION");
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
