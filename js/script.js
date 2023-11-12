// Dynamically list out radios
fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/all.json")
    .then(response => response.json())
    .then(data => {
        var streamInfo = document.getElementById('streamInfo');
        var player = document.getElementById('miniPlayer');
        var stationName = document.getElementById('stationName');
        var radiostations = document.getElementById('radiostations');

        data.forEach(station => {
            var rad = document.createElement('div');
            rad.className = 'widget';

            var radPlayButton = document.createElement('div');
            radPlayButton.className = 'main-play-button';
            radPlayButton.innerHTML = '<i class="fas fa-play"></i>';

            var radLink = document.createElement('a');
            radLink.className = 'player-radio-link';
            radLink.href = station.website;
            radLink.target = '_blank';
            radLink.innerHTML += '<img class="rad-icon" src="' + station.favicon + '">' +
                '<span class="player-radio-name">' + station.name + '</span>';

            radPlayButton.addEventListener('click', function () {
                playStation(station, radPlayButton);
            });

            rad.appendChild(radPlayButton);
            rad.appendChild(radLink);

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
    });

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetElement = document.querySelector(this.getAttribute('href'));
        const offset = 60;

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

// Dynamically list out download sites
fetch('https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/downloads.json')
    .then(response => response.json())
    .then(scrap => {
        const parentElement = document.querySelector('.download');

        scrap.forEach(website => {
            const container = document.createElement('div');
            container.className = 'container';

            const link = document.createElement('a');
            link.href = website.url;
            link.target = '_blank';

            const img = document.createElement('img');
            img.src = website.imgSrc;

            const h5 = document.createElement('h5');
            h5.textContent = website.name;

            link.append(img, h5);
            container.appendChild(link);
            parentElement.appendChild(container);
        });
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
        YouTubeSearch(searchTerm);
        lastfmSearch(searchTerm);
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

// Function that uses the lastFM API to fetch matching song titles
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
            console.log("song title search:", data);
            displaysongSearch(data);
        })
        .catch(function (error) {
            console.log("Error from lastfm song title API:", error);
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

// Get YouTube most relevant result
function YouTubeSearch(songName) {
    const maxResults = 1;
    const ytURL = 'https://www.googleapis.com/youtube/v3/search';
    var ytAPIKey = '&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s';

    var VideoDisplay = document.querySelector("#YouTubeVideo");

    if (VideoDisplay.style.display === "none") {
        VideoDisplay.style.display = "block";
    }

    var fullYTURLPathTitle = `${ytURL}?part=snippet&maxResults=${maxResults}&type=video&q=${songName}${ytAPIKey}`;

    console.log(fullYTURLPathTitle);

    fetch(fullYTURLPathTitle)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(function (data) {
            console.log(data.items[0].id.videoId);

            var UniqueVidId = data.items[0].id.videoId;
            document.getElementById("YouTubeVideo").src = "https://www.youtube.com/embed/" + UniqueVidId;
        })
        .catch(function (error) {
            console.log("Error from Youtube by song title API:", error);
        });
}


// Search by website
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

// Generate search query
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

// Google drive music player
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

// USER FOLDER
function submitFolderId(e) {
    e.preventDefault();
    localStorage.setItem("parentfolder", document.getElementById('parentfolder').value);
    handleAuthClick(document.getElementById('parentfolder').value);
}

function getFolderId() {
    document.getElementById('parentfolder').value = localStorage.getItem("parentfolder");
}

// AUDIO
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

const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: false,
    autoplay: false,
    theme: '#b7daff',
    loop: 'all',
    order: 'list',
    preload: 'auto',
    volume: 0.7,
    mutex: true,
    listFolded: false,
    listMaxHeight: '200px',
    lrcType: 3,
    audio: [{
        name: "前前前世",
        artist: 'RADWIMPS',
        url: 'https://drive.google.com/uc?export=download&id=1MJsGgodLNQ-sW6xaGUPCeEFrM5KDTISe',
        cover: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Radwimps-zenzenzense.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%89%8D%E5%89%8D%E5%89%8D%E4%B8%96%20-%20RADWIMPS.lrc',
        theme: '#ebd0c2'
    },
    {
        name: 'Butter-Fly',
        artist: '和田光司(By コバソロ & 七穂)',
        url: 'https://drive.google.com/uc?export=download&id=1MsP1LkJj8K5k_Dq7kwYGJDbRbXSN4mfP',
        cover: 'https://pic-bstarstatic.akamaized.net/ugc/5f4e8eb0f5673ea804c53ffeb6619bcf439d5a5e.jpg@160w_90h_1e_1c_90q',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Butter-Fly%20-%20%E5%92%8C%E7%94%B0%E5%85%89%E5%8F%B8%20(%E3%82%8F%E3%81%A0%20%E3%81%93%E3%81%86%E3%81%98)%20.lrc',
        theme: '#60affe'
    },
    {
        name: 'Catch the Moment',
        artist: 'LiSA',
        url: 'https://drive.google.com/uc?export=download&id=1tYigvqC9QoUj5JzTFO_RHEuUIqzxHDmu',
        cover: 'https://static.wikia.nocookie.net/jpop/images/1/16/Catchreg.jpg/revision/latest?cb=20170224094844',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Catch%20the%20Moment%20-%20LiSA.lrc',
        theme: '#1973dc'
    },
    {
        name: "Baby Don't Know Why",
        artist: 'Ms.OOJA',
        url: 'https://drive.google.com/uc?export=download&id=1mRjlDRVX3hZAlShGUvfj2KrGO9qaHOpd',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/841f28eff51de652924053d376bf9d33',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/baby%20don%E2%80%99t%20know%20why%20-%20Ms.OOJA.lrc',
        theme: '#b38972'
    },
    {
        name: 'LOSER',
        artist: '米津玄師',
        url: 'https://drive.google.com/uc?export=download&id=192n7GXieQ6zrfkrg5HM2YoYsvk8DfuLH',
        cover: 'https://image.biccamera.com/img/00000003460188_A01.jpg?sr.dw=320&sr.jqh=60&sr.dh=320&sr.mat=1',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/LOSER%20-%20%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc',
        theme: '#18131a'
    },
    {
        name: '打上花火',
        artist: 'DAOKO × 米津玄師',
        url: 'https://drive.google.com/uc?export=download&id=1sBHIt_Pm7tSwtsu-cDOAwR3ba6KgpkNd',
        cover: 'https://upload.wikimedia.org/wikipedia/zh/c/c3/Uchiage_Hanabi_Cover_by_DAOKO.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E6%89%93%E4%B8%8A%E8%8A%B1%E7%81%AB%20-%20%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc',
        theme: '#864378'
    },
    {
        name: '終わりの世界から',
        artist: '麻枝 准×やなぎなぎ',
        url: 'https://drive.google.com/uc?export=download&id=1L1S0-i1B9LpxYLFOrfZW05If3kKauHIx',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/41d1010473c549b0aee1dd16ffb6af70',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%B5%82%E3%82%8F%E3%82%8A%E3%81%AE%E4%B8%96%E7%95%8C%E3%81%8B%E3%82%89%20-%20%E3%82%84%E3%81%AA%E3%81%8E%E3%81%AA%E3%81%8E.lrc',
        theme: '#2e477e'
    },
    {
        name: 'Break Beat Bark!',
        artist: '神田沙也加',
        url: 'https://drive.google.com/uc?export=download&id=1GbZRNlum1WjsHtXHxRrZh3-LYi7ZXBbx',
        cover: '/music/cover/Break Beat Bark.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Break%20Beat%20Bark!%20-%20%E7%A5%9E%E7%94%B0%E6%B2%99%E4%B9%9F%E5%8A%A0%20.lrc',
        theme: '#0b2065'
    },
    {
        name: 'ワイルドローズ',
        artist: "May'n",
        url: 'https://drive.google.com/uc?export=download&id=1APZ-CPaM4puJSkDJ4kHnQmPrsxJkIpe4',
        cover: 'https://www.animelyrics.com/albums/jpop/mayn/0113a2c4f1ed50e60b79137cd0c5571a562e326f.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%83%AF%E3%82%A4%E3%83%AB%E3%83%89%E3%83%AD%E3%83%BC%E3%82%BA%20-%20Mayn.lrc',
        theme: '#e6c5cd'
    },
    {
        name: 'My Days',
        artist: '鈴木このみ',
        url: 'https://drive.google.com/uc?export=download&id=1IdeRiWzT7KXMDxo60iZtbJdRO1jAMTMw',
        cover: 'https://lineimg.omusic.com.tw/img/album/1827658.jpg?v=20200409213429',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/My%20Days%20-%20%E9%88%B4%E6%9C%A8%E3%81%93%E3%81%AE%E3%81%BF.lrc',
        theme: '#544093'
    },
    {
        name: 'Lemon',
        artist: '米津玄師',
        url: 'https://drive.google.com/uc?export=download&id=1CbWp3q5-a30unNqOpCiCJl_QoIbgSTxR',
        cover: 'https://upload.wikimedia.org/wikipedia/en/1/12/Kenshi_Yonezu_-_Lemon.png',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Lemon%20-%20%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc',
        theme: '#bfdcda'
    },
    {
        name: 'Hacking to the Gate',
        artist: '伊藤香奈子',
        url: 'https://drive.google.com/uc?export=download&id=10SoFpZxTQaELkm3vq59rOcRRreuEW__j',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/5b650b1337564521c5a01360097d3acb.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Hacking%20to%20the%20Gate%20-%20%E4%BC%8A%E8%97%A4%E5%8A%A0%E5%A5%88%E5%AD%90.lrc',
        theme: '#b09456'
    },
    {
        name: '小さな恋のうた',
        artist: 'コバソロ & 杏沙子',
        url: 'https://drive.google.com/uc?export=download&id=1QAQ6XgHgBq48PGwiodumfqhFCowBazxt',
        cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ae/93/23/ae932363-26c8-721b-140f-efc4a9e94742/22UMGIM36963.rgb.jpg/400x400cc.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F%20-%20Kobasolo%20(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E4%B8%83%E7%A9%82%20.lrc',
        theme: '#117cdc'
    },
    {
        name: 'あとひとつ',
        artist: 'コバソロ & こぴ',
        url: 'https://drive.google.com/uc?export=download&id=1uJafY4DsI1YDewaiq1I4iJM9Vbwu3Ku7',
        cover: 'https://i.scdn.co/image/ab67616d0000b2736101e08696469c595f25deee',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%81%82%E3%81%A8%E3%81%B2%E3%81%A8%E3%81%A4%20-%20Kobasolo%20(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E3%81%93%E3%81%B4%20.lrc',
        theme: '#55524b'
    },
    {
        name: 'キセキ',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=1Irk0h8HwmgShTCuoJvI_SUfI_nwqy1JN',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%82%AD%E3%82%BB%E3%82%AD%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
        theme: '#f8e7aa'
    },
    {
        name: '小さな恋のうた',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=1y1zAUF6qxyAAPoZX2pgUgdBNw3pkBbih',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
        theme: '#ed885b'
    },
    {
        name: '言わないけどね。',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=13OBc-0kZRFaw10iEUlmeEhLNoteYC7hF',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E8%A8%80%E3%82%8F%E3%81%AA%E3%81%84%E3%81%91%E3%81%A9%E3%81%AD%E3%80%82-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
        theme: '#f8e7aa'
    },
    {
        name: '愛唄',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=1pDg6f6wdl4p6RPbvC7rJdq-oxfB3AGii',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E6%84%9B%E5%94%84%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
        theme: '#ed885b'
    },
    {
        name: '奏(和聲版)',
        artist: '高橋李依 x 雨宫天',
        url: 'https://drive.google.com/uc?export=download&id=1c1YrHvdWhUF-ZMYEyxqQq5eg8Ce63B3A',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%A5%8F(%E3%81%8B%E3%81%AA%E3%81%A7)%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
        theme: '#a68461'
    },
    {
        name: '生きていたんだよな',
        artist: 'あいみょん',
        url: 'https://drive.google.com/uc?export=download&id=1IggcHU8UHKOfVvKlxgXv8zqZ_ywc2JVx',
        cover: 'https://c-cl.cdn.smule.com/rs-s79/arr/42/5e/937aa21e-3491-4122-ac03-daebcc96c421.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%94%9F%E3%81%8D%E3%81%A6%E3%81%84%E3%81%9F%E3%82%93%E3%81%A0%E3%82%88%E3%81%AA%20-%20%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc',
        theme: '#df192b'
    },
    {
        name: '空の青さを知る人よ',
        artist: 'あいみょん',
        url: 'https://drive.google.com/uc?export=download&id=1OEJ7M3mCmHorNihCskaEKsIVH-ofDky_',
        cover: 'https://cdn.kdkw.jp/cover_1000/321906/321906000047.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%A9%BA%E3%81%AE%E9%9D%92%E3%81%95%E3%82%92%E7%9F%A5%E3%82%8B%E4%BA%BA%E3%82%88-%20%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc',
        theme: '#10530c'
    },
    {
        name: '心做し',
        artist: '鹿乃',
        url: 'https://drive.google.com/uc?export=download&id=11FcJbQv8zhmhF42QzXPJ_SSNFV4hXk3F',
        cover: 'https://i.scdn.co/image/ab67616d0000b27360f5aef8714e6f44935f32a2',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%BF%83%E5%81%9A%E3%81%97%20-%20%E9%B9%BF%E4%B9%83.lrc',
        theme: '#283c5b'
    },
    {
        name: 'あの世行きのバスに乗ってさらば。',
        artist: 'ツユ',
        url: 'https://drive.google.com/uc?export=download&id=1CzfPnhSfdxwvEFM4BI9VdLEq7j4UhleD',
        cover: 'https://i1.sndcdn.com/artworks-Hcxxf7HYNBPVt7GL-Da1lzQ-t500x500.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%81%82%E3%81%AE%E4%B8%96%E8%A1%8C%E3%81%8D%E3%81%AE%E3%83%90%E3%82%B9%E3%81%AB%E4%B9%97%E3%81%A3%E3%81%A6%E3%81%95%E3%82%89%E3%81%B0%E3%80%82-%20%E3%83%84%E3%83%A6.lrc',
        theme: '#232a60'
    },
    {
        name: '願い～あの頃のキミへ～',
        artist: '當山みれい',
        url: 'https://drive.google.com/uc?export=download&id=12wWGwnIkDaJ_WTgJDSpt632j6cSpHZyq',
        cover: 'https://zh.followlyrics.com/storage/84/838361.jpg',
        lrc: '',
        theme: '#163472'
    },
    {
        name: '茜さす',
        artist: 'Aimer',
        url: 'https://drive.google.com/uc?export=download&id=11Iajbd44r2BXFlj9oQ7XNwaQeeMNp4SD',
        cover: 'https://ro69-bucket.s3.amazonaws.com/uploads/text_image/image/341056/width:750/resize_image.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E9%A1%98%E3%81%84%EF%BD%9E%E3%81%82%E3%81%AE%E9%A0%83%E3%81%AE%E3%82%AD%E3%83%9F%E3%81%B8%20-%20%E7%95%B6%E5%B1%B1%E3%81%BF%E3%82%8C%E3%81%84.lrc',
        theme: '#ec3a36'
    },
    {
        name: 'Rain',
        artist: '秦基博(Motohiro Hata)',
        url: 'https://drive.google.com/uc?export=download&id=1C8DBCYQsMPmWsO60UcZrAduEpAOvQBZ6',
        cover: 'https://images.genius.com/0e2c2c5f015b011a77793831331e8372.1000x992x1.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Rain%20-%20%E7%A7%A6%E5%9F%BA%E5%8D%9A%20(%E3%81%AF%E3%81%9F%20%E3%82%82%E3%81%A8%E3%81%B2%E3%82%8D).lrc',
        theme: '#10530c'
    },
    {
        name: 'remember',
        artist: 'Uru',
        url: 'https://drive.google.com/uc?export=download&id=1f_Cbi9BNO7ztXSozBHvbdZK2s6EX-wX1',
        cover: 'https://i.scdn.co/image/ab67616d0000b273907c9c56af7a64ad6b528593',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/remember%20-%20uru.lrc',
        theme: '#a19cba'
    },
    {
        name: 'Licht und Schatten',
        artist: 'やまだ 豊',
        url: 'https://drive.google.com/uc?export=download&id=1LDR5h8-DMGThbbdQm2uYJ1eTyaOQku4K',
        cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/cf/6a/fb/cf6afb88-3e7c-4f6c-f112-0b5be855c88d/MJSA-01158-9.jpg/1200x1200bb.jpg',
        lrc: '',
        theme: '#505d6b'
    },
    {
        name: 'My Hero Is Our Hero',
        artist: '林ゆうき',
        url: 'https://drive.google.com/uc?export=download&id=1LzJnvmX_nIXpNzfTTFKXW-UI7vIpFPVP',
        cover: 'https://i.discogs.com/qVRNltnVIVbNlE48Ae77GvRfprMQ4VixQ3zjiBMISGM/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE5ODU4/MDc1LTE2Mjg5NDM5/MDMtODI4OS5qcGVn.jpeg',
        lrc: '',
        theme: '#505d6b'
    }]
});
