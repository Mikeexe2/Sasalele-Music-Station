// Dynamically list out radios
fetch("Links/all.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        var cover = document.getElementById('cover');
        var player = document.getElementById('miniPlayer');
        var stationName = document.getElementById('stationName');
        let currentPlayingStation = null;

        var genreHTML = {
            jmusic: '', kmusic: '', cmusic: '', nightcore: '', anime: '', vocaloid: '', variety: '', bgm: '', jpradio: ''
        };

        data.forEach(station => {
            var genre = station.genre;

            var radHTML = `
                <div class="widget">
                    <img class="rad-icon" src="${station.favicon}">
                    <a class="player-radio-link" href="${station.website}" target="_blank">
                        <span class="player-radio-name">${station.name}</span>
                    </a>
                    <div class="main-play-button"><i class="fas fa-play"></i></div>
                </div>
            `;
            genreHTML[genre] += radHTML;
        });

        document.querySelector('#jmusic').innerHTML = genreHTML.jmusic;
        document.querySelector('#kmusic').innerHTML = genreHTML.kmusic;
        document.querySelector('#cmusic').innerHTML = genreHTML.cmusic;
        document.querySelector('#nightcore').innerHTML = genreHTML.nightcore;
        document.querySelector('#anime').innerHTML = genreHTML.anime;
        document.querySelector('#vocaloid').innerHTML = genreHTML.vocaloid;
        document.querySelector('#variety').innerHTML = genreHTML.variety;
        document.querySelector('#bgm').innerHTML = genreHTML.bgm;
        document.querySelector('#jpradio').innerHTML = genreHTML.jpradio;

        document.getElementById('station-count').textContent = data.length;

        // hide radio list
        document.querySelectorAll('.genre-header').forEach(header => {
            header.addEventListener('click', function () {
                var content = this.nextElementSibling;
                content.classList.toggle('close');
            });
        });

        // Add event listeners for play buttons
        document.querySelectorAll('.main-play-button').forEach(button => {
            button.addEventListener('click', function () {
                const parentDiv = this.closest('.widget');
                const station = data.find(st => st.name === parentDiv.querySelector('.player-radio-name').textContent);
                playStation(station, this);
            });
        });

        // Random play function
        var mikuGif = document.getElementById('miku-gif');
        mikuGif.addEventListener('click', function () {
            var stations = document.querySelectorAll('.widget');
            var randomIndex = Math.floor(Math.random() * stations.length);
            var playButton = stations[randomIndex].querySelector('.main-play-button');
            playButton.click();
        });

        function playStation(station, playButton) {
            document.querySelectorAll('.main-play-button').forEach(button => {
                if (button !== playButton) {
                    updatePlayButtonIcon(button, false); // Reset other play buttons to pause icon
                }
            });

            if (player.getAttribute('data-link') === station.url) {
                if (player.paused) {
                    player.play();
                    updatePlayButtonIcon(playButton, true);
                    startCoverRotation();
                } else {
                    player.pause();
                    updatePlayButtonIcon(playButton, false);
                    stopCoverRotation();
                }
            } else {
                player.src = station.url;
                player.play();
                cover.innerHTML = `<a href="${station.website}" target="_blank"><img id="ip" src="${station.favicon}"></a>`;
                stationName.textContent = station.name;
                player.setAttribute('data-link', station.url);
                updatePlayButtonIcon(playButton, true);
                startCoverRotation();
                currentPlayingStation = playButton; // Update currentPlayingStation
            }
        }

        function updatePlayButtonIcon(playButton, isPlaying) {
            playButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }

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

        // Listen for play and pause events on the player
        player.addEventListener('play', () => {
            if (currentPlayingStation) {
                updatePlayButtonIcon(currentPlayingStation, true);
                startCoverRotation();
            }
        });

        player.addEventListener('pause', () => {
            if (currentPlayingStation) {
                updatePlayButtonIcon(currentPlayingStation, false);
                stopCoverRotation();
            }
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });


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

// search station with options using Radio Browser's API
const findRadioBtn = document.getElementById("radiosearch");
const searchField = document.getElementById('search-field');
const searchResultContainer = document.querySelector('.radio-result-container');
const searchResultHeader = document.querySelector('.radio-result-header');
let currentPlayingRadio = null;

function radioSearch() {
    const searchOption = document.getElementById('searchOption').value;
    const searchRadio = searchField.value.trim();

    if (searchRadio !== '' && searchOption !== 'Choose a search option...') {
        searchResultHeader.style.display = "block";
        searchResultContainer.innerHTML = '';

        fetch(`https://de1.api.radio-browser.info/json/stations/${searchOption}/${searchRadio}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    searchResultHeader.textContent = `Search results for "${searchRadio}"`;
                    data.forEach(radio => {
                        const radioDiv = document.createElement('div');
                        radioDiv.classList.add('widget');
                        radioDiv.innerHTML = `
                            <img class="rad-icon" src="${radio.favicon ? radio.favicon : 'assets/radios/Unidentified2.png'}">
                            <a class="player-radio-link" href="${radio.homepage}" target="_blank">
                                <span class="player-radio-name">${radio.name}</span>
                            </a>
                            <div class="main-play-button" id="play-${radio.stationuuid}">
                                <i class="fas fa-play"></i>
                            </div>
                        `;
                        searchResultContainer.appendChild(radioDiv);

                        // Add event listener for the play button
                        document.getElementById(`play-${radio.stationuuid}`).addEventListener('click', function () {
                            const parentDiv = this.closest('.widget');
                            const radio = data.find(st => st.name === parentDiv.querySelector('.player-radio-name').textContent);
                            playRadio(radio, this);
                        });
                    });
                } else {
                    searchResultHeader.textContent = 'No result found.';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
    searchField.value = '';
}
// use same player for the radio searched
function playRadio(radio, playButton) {
    var cover = document.getElementById('cover');
    var player = document.getElementById('miniPlayer');
    var stationName = document.getElementById('stationName');

    document.querySelectorAll('.main-play-button').forEach(button => {
        if (button !== playButton) {
            updatepls(button, false);
        }
    });

    if (player.getAttribute('data-link') === radio.url) {
        if (player.paused) {
            player.play();
            updatepls(playButton, true);
            startCoverRotation();
        } else {
            player.pause();
            updatepls(playButton, false);
            stopCoverRotation();
        }
    } else {
        player.src = radio.url;
        player.play();
        cover.innerHTML = `<a href="${radio.homepage}" target="_blank"><img id="ip" src="${radio.favicon}"></a>`;
        stationName.textContent = radio.name;
        player.setAttribute('data-link', radio.url);
        updatepls(playButton, true);
        startCoverRotation();
        currentPlayingRadio = playButton;
    }
}

function updatepls(playButton, isPlaying) {
    playButton.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

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

findRadioBtn.addEventListener('click', radioSearch);

const player = document.getElementById('miniPlayer');

player.addEventListener('play', () => {
    if (currentPlayingRadio) {
        updatepls(currentPlayingRadio, true);
        startCoverRotation();
    }
});

player.addEventListener('pause', () => {
    if (currentPlayingRadio) {
        updatepls(currentPlayingRadio, false);
        stopCoverRotation();
    }
});


/* Dynamically list out websites
fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/websites.json").then((e=>e.json())).then((e=>{const n=e.reduce(((e,n)=>((e[n.tags]=e[n.tags]||[]).push(n),e)),{});Object.entries(n).forEach((([e,n])=>{const t=n.map((e=>`\n            <div class="container">\n              <a href="${e.url}" target="_blank">\n                <img src="${e.imgSrc}">\n                <h5>${e.name}</h5>\n              </a>\n            </div>\n          `)).join("");"radio"===e?document.querySelector("#radiohere").innerHTML=t:"website"===e?document.querySelector("#websitehere").innerHTML=t:"radiojp"===e&&(document.querySelector("#radiojphere").innerHTML=t)}))})),fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/downloads.json").then((e=>e.json())).then((e=>{const n=document.querySelector(".download");e.forEach((e=>{const t=document.createElement("div");t.className="container";const c=document.createElement("a");c.href=e.url,c.target="_blank";const o=document.createElement("img");o.src=e.imgSrc;const a=document.createElement("h5");a.textContent=e.name,c.append(o,a),t.appendChild(c),n.appendChild(t)}))}));
*/

// to display the warning
window.addEventListener('load', function () {
    const warnElement = document.getElementById('warn');

    function checkMixedContent() {
        const requests = performance.getEntriesByType('resource');

        for (let request of requests) {
            if (request.initiatorType === 'xmlhttprequest' || request.initiatorType === 'fetch') {
                if (request.name.startsWith('http:')) {
                    return true;
                }
            }
        }
        return false;
    }

    if (checkMixedContent()) {
        warnElement.style.display = 'block';
    }
});

// Listen to console warnings for mixed content
const originalConsoleWarn = console.warn;
console.warn = function (message) {
    if (message.includes('Mixed Content:')) {
        document.getElementById('warn').style.display = 'block';
    }
    originalConsoleWarn.apply(console, arguments);
};

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetElement = document.querySelector(this.getAttribute('href'));
        const offset = 90;

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - offset,
                behavior: 'smooth'
            });
        }
    });
});

function goTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

var goTopButton = document.getElementById('up-button');
goTopButton.addEventListener('click', goTop);

// for fun
var Original = document.title, titleTime;
document.addEventListener("visibilitychange",
    function () {
        if (document.hidden) {
            document.title = "Playing music~";
            clearTimeout(titleTime)
        } else {
            document.title = "(/≧▽≦/)Welcome back!";
            titleTime = setTimeout(function () {
                document.title = Original
            },
                2000)
        }
    });

// draggable player
(function () {
    var player = document.getElementById('player');
    var isDragging = false;
    var startX, startY, initialX, initialY;

    player.addEventListener('mousedown', function (e) {
        isDragging = true;
        startX = e.clientX - player.offsetLeft;
        startY = e.clientY - player.offsetTop;
        initialX = player.offsetLeft;
        initialY = player.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (isDragging) {
            var x = e.clientX - startX;
            var y = e.clientY - startY;
            player.style.left = x + 'px';
            player.style.top = y + 'px';
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
})();


// How long has the website been running?
var Sasalele = {
    liveTime: function (startDate) {
        var start = new Date(startDate);
        var now = new Date();
        var diff = now - start;

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('liveTime').innerText =
            "Operated secretly for: " + days + " days " + hours + " hours " + minutes + " minutes " + seconds + " seconds";
    }
};

setInterval(function () {
    Sasalele.liveTime('2023/10/01');
}, 1000);

// Expand and minimize player
const togglePlayerButton = document.getElementById("togglePlayer");
const playerContainer = document.getElementById("player");
const expandIcon = document.querySelector("#togglePlayer .fa-expand");
const minimizeIcon = document.querySelector("#togglePlayer .fa-compress");

togglePlayerButton.addEventListener("click", () => {
    playerContainer.classList.toggle("minimized");
    expandIcon.classList.toggle("hidden");
    minimizeIcon.classList.toggle("hidden");
});

// Search song function
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const innerContainer = document.querySelector('.search-results');
const searchTermsContainer = document.getElementById('searchTerms');

function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        innerContainer.style.display = 'block';
        searchTermsContainer.textContent = searchTerm;
        const gscsearchInput = document.querySelector('.gsc-input input');
        if (gscsearchInput) {
            gscsearchInput.value = searchTerm;
        }
        YouTubeSearch(searchTerm);
        lastfmSearch(searchTerm);
    }
    searchInput.value = '';
}

searchButton.addEventListener('click', performSearch);

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
    searchInput.value.trim(),
        document.getElementById("lastFMInfo").innerHTML = "";

    var songSearchDiv = document.getElementById("lastFMInfo");


    if (!data || data.results.trackmatches.track.length === 0) {
        document.getElementById("noresult").style.display = "block";
        return;
    }

    var songSearchList = document.createElement("ul");

    for (var i = 0; i < Math.min(5, data.results.trackmatches.track.length); i++) {
        var songTitleName = data.results.trackmatches.track[i].name;
        var songTitleArtist = data.results.trackmatches.track[i].artist;
        var result = "<li>" + songTitleName + " - " + songTitleArtist + "</li>";
        songSearchList.innerHTML += result;
    }
    songSearchDiv.appendChild(songSearchList);
}

// Get YouTube most relevant result
function YouTubeSearch(data) {

    var VideoDisplay = document.querySelector("#YouTubeVideo");

    if (VideoDisplay.style.display === "none") {
        VideoDisplay.style.display = "block";
    }

    var URLpath = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${data}&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s`;

    console.log(URLpath);
    fetch(URLpath)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw Error(response.statusText)
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
            return `https://www.google.com/search?q=${a}+歌詞 `;
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

// Google drive music player
const CLIENT_ID = "993505903479-tk48veqhlu2r1hiu9m2hvaq2l81urnla.apps.googleusercontent.com",
    DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    SCOPES = "https://www.googleapis.com/auth/drive.readonly";
let tokenClient, gapiInited = !1,
    gisInited = !1;

function gapiLoaded() {
    gapi.load("client", initializeGapiClient)
}
async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    }),
        gapiInited = !0
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: "993505903479-tk48veqhlu2r1hiu9m2hvaq2l81urnla.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: ""
    }),
        gisInited = !0
}

function handleAuthClick(e) {
    tokenClient.callback = async t => {
        if (void 0 !== t.error)
            throw t;
        getContents(e, "initial"),
            localStorage.setItem("returning", "true"),
            document.getElementById("return").style.display = "none",
            gapi.client.drive.about.get({
                fields: "user"
            }).then(function (e) {
                window.location.hash = "#~" + e.result.user.permissionId
            })
    },
        gapi.client.getToken(),
        tokenClient.requestAccessToken({
            prompt: ""
        })
}

function handleSignoutClick() {
    let e = gapi.client.getToken();
    null !== e && (google.accounts.oauth2.revoke(e.access_token),
        gapi.client.setToken(""))
}

function getContents(e, t) {
    gapi.client.drive.files.list({
        pageSize: 1e3,
        q: "'" + e + "' in parents and trashed = false ",
        orderBy: "name",
        fields: "nextPageToken, files(id, name, mimeType, webContentLink)"
    }).then(function (a) {
        if (document.getElementById("intro").style.display = "none",
            "initial" == t)
            var o = "contents";
        else {
            var o = e;
            if (document.getElementById(o).classList.contains("loaded"))
                return
        }
        var r = a.result.files;
        if (r && r.length > 0) {
            for (var c = 0; c < r.length; c++) {
                var n = r[c];
                n.mimeType.includes("application/vnd.google-apps.folder") && (document.getElementById(o).innerHTML += `
          <details id="${n.id}">
            <summary onclick="getContents('${n.id}')">${n.name}</summary>
          </details>
          `),
                    document.getElementById(o).classList.add("loaded")
            }
            for (var c = 0; c < r.length; c++) {
                var n = r[c];
                n.mimeType.includes("audio") && (document.getElementById(o).innerHTML += `
          <button class="track" onclick="playTrack('${n.id}', this)"><i class="fas fa-play"></i> ${n.name}</button>
          `),
                    document.getElementById(o).classList.add("loaded")
            }
        } else
            alert("No files found.");
        document.getElementById(o).firstElementChild.focus()
    })
}

function submitFolderId(e) {
    e.preventDefault(),
        localStorage.setItem("parentfolder", document.getElementById("parentfolder").value),
        handleAuthClick(document.getElementById("parentfolder").value)
}

function getFolderId() {
    document.getElementById("parentfolder").value = localStorage.getItem("parentfolder")
}

function playTrack(e, t, a) {
    if (t == playing) {
        audio.paused ? audio.play() : audio.pause();
        return
    }
    if (playing && (resetIconToPlay(),
        playing.classList.remove("playing")),
        t.classList.add("playing"),
        playing = document.getElementsByClassName("playing")[0],
        audio.pause(),
        source.src = "",
        audio.load(),
        spinner = `
    <div id="spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  `,
        playing.innerHTML += spinner,
        "demo" == a) {
        source.src = "assets/music/" + e + ".mp3",
            audio.load(),
            audio.oncanplay = audio.play(),
            document.getElementById("spinner") && document.getElementById("spinner").remove();
        return
    }
    gapi.client.drive.files.get({
        fileId: e,
        alt: "media"
    }).then(function (e) {
        dataArr = Uint8Array.from(e.body.split("").map(e => e.charCodeAt(0))),
            file = new File([dataArr], "audiofilename", {
                type: e.headers["Content-Type"]
            }),
            source.src = URL.createObjectURL(file),
            source.type = e.headers["Content-Type"],
            audio.load(),
            audio.oncanplay = audio.play(),
            document.getElementById("spinner") && document.getElementById("spinner").remove()
    })
}

function prevTrack() {
    audio.currentTime > 3 || !playing.previousElementSibling.previousElementSibling ? (audio.currentTime = 0,
        audio.play()) : playing.previousElementSibling.previousElementSibling && (resetIconToPlay(),
            playing.previousElementSibling.click())
}

function nextTrack() {
    playing.nextElementSibling && (resetIconToPlay(),
        playing.nextElementSibling.click())
}

function resetIconToPlay() {
    playing.firstChild.classList.remove("fa-pause"),
        playing.firstChild.classList.add("fa-play"),
        document.getElementById("bars") && document.getElementById("bars").remove()
}

function resetIconToPause() {
    playing.firstChild.classList.remove("fa-play"),
        playing.firstChild.classList.add("fa-pause"),
        indicator = `
    <div id="bars">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  `,
        playing.innerHTML += indicator
}

function changeFolder() {
    document.getElementById("return").style.display = "none",
        document.getElementById("intro").style.display = "block",
        document.getElementById("parentfolder").focus(),
        localStorage.setItem("returning", "false")
}
audio = document.getElementById("audio"),
    source = document.getElementById("source"),
    playing = !!document.getElementsByClassName("playing")[0] && document.getElementsByClassName("playing")[0],
    audio.onended = function () {
        playing.nextElementSibling && playing.nextElementSibling.focus(),
            nextTrack()
    },
    audio.onpause = function () {
        resetIconToPlay()
    },
    audio.onplay = function () {
        resetIconToPause()
    },
    "true" == localStorage.getItem("returning") && null !== localStorage.getItem("parentfolder") ? document.getElementById("return").style.display = "block" : document.getElementById("intro").style.display = "block";

//Chatting
window.onload = function () {
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
    var db = firebase.database()
    class sasalele {
        home() {
            var chatContainer = document.querySelector('.chat_container');
            if (chatContainer) {
                chatContainer.innerHTML = '';  // Clear chat-related content
            }
            this.create_join_form();
        }
        chat() {
            this.create_chat()
        }
        create_join_form() {
            var parent = this;

            var joinFormContainer = document.querySelector('.joinform');
            var join_inner_container = document.createElement('div');
            join_inner_container.setAttribute('id', 'join_inner_container');

            var join_button_container = document.createElement('div');
            join_button_container.setAttribute('id', 'join_button_container');

            var join_button = document.createElement('button');
            join_button.setAttribute('id', 'join_button');
            join_button.innerHTML = 'Join <i class="fas fa-sign-in-alt"></i>';

            var join_input_container = document.createElement('div');
            join_input_container.setAttribute('id', 'join_input_container');

            var join_input = document.createElement('input');
            join_input.setAttribute('id', 'join_input');
            join_input.setAttribute('maxlength', 20);
            join_input.placeholder = 'Input your name...';
            join_input.onkeyup = function () {
                if (join_input.value.length > 0) {
                    join_button.classList.add('enabled');
                    join_button.onclick = function () {
                        parent.save_name(join_input.value);
                        joinFormContainer.innerHTML = '';  // Clear join form content
                        parent.create_chat();
                    };
                } else {
                    join_button.classList.remove('enabled');
                }
            };

            join_button_container.append(join_button);
            join_input_container.append(join_input);
            join_inner_container.append(join_input_container, join_button_container);
            joinFormContainer.append(join_inner_container);
        }
        create_load(container_id) {
            var parent = this;
            var container = document.getElementById(container_id)
            container.innerHTML = ''

            var loader_container = document.createElement('div')
            loader_container.setAttribute('class', 'loader_container')

            var loader = document.createElement('div')
            loader.setAttribute('class', 'loader')

            loader_container.append(loader)
            container.append(loader_container)

        }
        create_chat() {
            var parent = this;
            var chattContainer = document.querySelector('.chat_container');
            chattContainer.innerHTML = '';

            var chat_inner_container = document.createElement('div');
            chat_inner_container.setAttribute('id', 'chat_inner_container');

            var chat_content_container = document.createElement('div');
            chat_content_container.setAttribute('id', 'chat_content_container');

            var chat_input_container = document.createElement('div');
            chat_input_container.setAttribute('id', 'chat_input_container');

            var chat_input_send = document.createElement('button');
            chat_input_send.setAttribute('id', 'chat_input_send');
            chat_input_send.setAttribute('disabled', true);
            chat_input_send.innerHTML = `<i class="far fa-paper-plane"></i>`;

            var chat_input = document.createElement('input');
            chat_input.setAttribute('id', 'chat_input');
            chat_input.setAttribute('maxlength', 99999);
            chat_input.placeholder = `Hi ${parent.get_name()}. Say something...`;
            chat_input.onkeyup = function () {
                if (chat_input.value.length > 0) {
                    chat_input_send.removeAttribute('disabled')
                    chat_input_send.classList.add('enabled')
                    chat_input_send.onclick = function () {
                        chat_input_send.setAttribute('disabled', true)
                        chat_input_send.classList.remove('enabled')
                        if (chat_input.value.length <= 0) {
                            return
                        }
                        parent.create_load('chat_content_container')
                        parent.send_message(chat_input.value)
                        chat_input.value = ''
                        chat_input.focus()
                    }
                } else {
                    chat_input_send.classList.remove('enabled')
                }
            };
            chat_input.addEventListener("keyup", function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    chat_input_send.click();
                }
            });
            var chat_logout_container = document.createElement('div');
            chat_logout_container.setAttribute('id', 'chat_logout_container');

            var chat_logout = document.createElement('button');
            chat_logout.setAttribute('id', 'chat_logout');
            chat_logout.textContent = `${parent.get_name()} • logout`;
            chat_logout.onclick = function () {
                localStorage.clear();
                parent.home();
            }
            chat_logout_container.append(chat_logout);
            chat_input_container.append(chat_input, chat_input_send);
            chat_inner_container.append(chat_content_container, chat_input_container, chat_logout_container);
            chattContainer.append(chat_inner_container);

            parent.create_load('chat_content_container');
            parent.refresh_chat();
        }
        save_name(name) {
            localStorage.setItem('name', name)
        }
        send_message(message) {
            var parent = this
            if (parent.get_name() == null && message == null) {
                return
            }

            db.ref('chats/').once('value', function (message_object) {
                var index = parseFloat(message_object.numChildren()) + 1
                db.ref('chats/' + `message_${index}`).set({
                    name: parent.get_name(),
                    message: message,
                    index: index
                })
                    .then(function () {
                        parent.refresh_chat()
                    })
            })
        }
        get_name() {
            if (localStorage.getItem('name') != null) {
                return localStorage.getItem('name')
            } else {
                this.home()
                return null
            }
        }
        refresh_chat() {
            var chat_content_container = document.getElementById('chat_content_container')
            db.ref('chats/').on('value', function (messages_object) {
                chat_content_container.innerHTML = ''
                if (messages_object.numChildren() == 0) {
                    return
                }

                var messages = Object.values(messages_object.val());
                var guide = []
                var unordered = []
                var ordered = []

                for (var i, i = 0; i < messages.length; i++) {
                    guide.push(i + 1)
                    unordered.push([messages[i], messages[i].index]);
                }

                guide.forEach(function (key) {
                    var found = false
                    unordered = unordered.filter(function (item) {
                        if (!found && item[1] == key) {
                            ordered.push(item[0])
                            found = true
                            return false
                        } else {
                            return true
                        }
                    })
                })
                ordered.forEach(function (data) {
                    var name = data.name
                    var message = data.message

                    var message_container = document.createElement('div')
                    message_container.setAttribute('class', 'message_container')

                    var message_inner_container = document.createElement('div')
                    message_inner_container.setAttribute('class', 'message_inner_container')

                    var message_user_container = document.createElement('div')
                    message_user_container.setAttribute('class', 'message_user_container')

                    var message_user = document.createElement('p')
                    message_user.setAttribute('class', 'message_user')
                    message_user.textContent = `${name}`

                    var message_content_container = document.createElement('div')
                    message_content_container.setAttribute('class', 'message_content_container')

                    var message_content = document.createElement('p')
                    message_content.setAttribute('class', 'message_content')
                    message_content.textContent = `${message}`

                    message_user_container.append(message_user)
                    message_content_container.append(message_content)
                    message_inner_container.append(message_user_container, message_content_container)
                    message_container.append(message_inner_container)

                    chat_content_container.append(message_container)
                });
                chat_content_container.scrollTop = chat_content_container.scrollHeight;
            })

        }
    }
    var app = new sasalele()
    if (app.get_name() != null) {
        app.chat()
    }
}

//Music Player
const ap = new APlayer({
    container: document.getElementById("aplayer"),
    fixed: false,
    mini: false,
    autoplay: false,
    theme: "#b7daff",
    loop: "all",
    order: "list",
    preload: 'auto',
    volume: .7,
    mutex: true,
    listFolded: false,
    listMaxHeight: "300px",
    lrcType: 3,
    audio: [{
        name: 'スカイクラッドの観測者',
        artist: 'いとうかなこ',
        url: 'assets/music/スカイクラッドの観測者 - 伊藤加奈子.mp3',
        cover: 'assets/covers/スカイクラッドの観測者-伊藤加奈子.jpg',
        lrc: 'assets/lrc/スカイクラッドの観測者-伊藤加奈子.lrc',
    }, {
        name: 'technovision',
        artist: 'いとうかなこ',
        url: 'assets/music/technovision - 伊藤加奈子.mp3',
        cover: 'assets/covers/technovision-伊藤加奈子.jpg',
        lrc: 'assets/lrc/technovision-伊藤加奈子.lrc',
    }, {
        name: 'Hacking to the Gate',
        artist: 'いとうかなこ',
        url: 'assets/music/Hacking to the Gate.mp3',
        cover: 'assets/covers/HackingtotheGate-伊藤加奈子.jpg',
        lrc: 'assets/lrc/HackingtotheGate-伊藤加奈子.lrc',
    }, {
        name: 'GATE OF STEINER (Bonus Track)',
        artist: '佐々木恵梨',
        url: 'assets/music/GATE OF STEINER (Bonus Track) - 佐々木恵梨.mp3',
        cover: 'assets/covers/GATEOFSTEINER(BonusTrack)-佐々木恵梨.jpg',
        lrc: 'assets/lrc/GATEOFSTEINER(BonusTrack)-佐々木恵梨.lrc',
    }, {
        name: 'いつもこの場所で',
        artist: 'あやね',
        url: 'assets/music/いつもこの場所で (一直在这个地方) - あやね.mp3',
        cover: 'assets/covers/いつもこの場所で-あやね.jpg',
        lrc: 'assets/lrc/いつもこの場所で-あやね.lrc',
    }, {
        name: 'あなたの選んだこの時を',
        artist: 'いとうかなこ',
        url: 'assets/music/あなたの選んだこの時を - いとうかなこ.mp3',
        cover: 'assets/covers/あなたの選んだこの時を-いとうかなこ.jpg',
        lrc: 'assets/lrc/あなたの選んだこの時を-いとうかなこ.lrc',
    }, {
        name: '前前前世',
        artist: 'RADWIMPS',
        url: 'assets/music/前前前世.mp3',
        cover: 'assets/covers/前前前世-RADWIMPS.jpg',
        lrc: 'assets/lrc/前前前世-RADWIMPS.lrc',
    }, {
        name: 'Butter-Fly',
        artist: '和田光司(By コバソロ & 七穂)',
        url: 'assets/music/Butter-Fly.mp3',
        cover: 'assets/covers/Butter-Fly-和田光司(わだこうじ).jpg',
        lrc: 'assets/lrc/Butter-Fly-和田光司(わだこうじ).lrc',
    }, {
        name: 'Catch the Moment',
        artist: 'LiSA',
        url: 'assets/music/Catch the Moment.mp3',
        cover: 'assets/covers/CatchtheMoment-LiSA.jpg',
        lrc: 'assets/lrc/CatchtheMoment-LiSA.lrc',
    }, {
        name: 'Baby Don\'t Know Why',
        artist: 'Ms.OOJA',
        url: 'assets/music/Baby Dont Know Why.mp3',
        cover: 'assets/covers/babydonttknowwhy-Ms.OOJA.jpg',
        lrc: 'assets/lrc/babydonttknowwhy-Ms.OOJA.lrc',
    }, {
        name: 'LOSER',
        artist: '米津玄師',
        url: 'assets/music/LOSER.mp3',
        cover: 'assets/covers/LOSER-米津玄師.jpg',
        lrc: 'assets/lrc/LOSER-米津玄師.lrc',
    }, {
        name: '打上花火',
        artist: 'DAOKO \ 米津玄師',
        url: 'assets/music/打上花火.mp3',
        cover: 'assets/covers/打上花火-米津玄師.jpg',
        lrc: 'assets/lrc/打上花火-米津玄師.lrc',
    }, {
        name: '終わりの世界から',
        artist: '麻枝 准 \ やなぎなぎ',
        url: 'assets/music/終わりの世界から.mp3',
        cover: 'assets/covers/終わりの世界から-やなぎなぎ.png',
        lrc: 'assets/lrc/終わりの世界から-やなぎなぎ.lrc',
    }, {
        name: 'Break Beat Bark!',
        artist: '神田沙也加',
        url: 'assets/music/Break Beat Bark.mp3',
        cover: 'assets/covers/BreakBeatBark!-神田沙也加.jpg',
        lrc: 'assets/lrc/BreakBeatBark!-神田沙也加.lrc',
    }, {
        name: 'ワイルドローズ',
        artist: 'May\'n',
        url: 'assets/music/Wild Rose.mp3',
        cover: 'assets/covers/ワイルドローズ-Mayn.jpg',
        lrc: 'assets/lrc/ワイルドローズ-Mayn.lrc',
    }, {
        name: 'My Days',
        artist: '鈴木このみ',
        url: 'assets/music/My Days.mp3',
        cover: 'assets/covers/MyDays-鈴木このみ.jpg',
        lrc: 'assets/lrc/MyDays-鈴木このみ.lrc',
    }, {
        name: 'Lemon',
        artist: '米津玄師',
        url: 'assets/music/Lemon.mp3',
        cover: 'assets/covers/Lemon-米津玄師.png',
        lrc: 'assets/lrc/Lemon-米津玄師.lrc',
    }, {
        name: '小さな恋のうた',
        artist: 'コバソロ & 杏沙子',
        url: 'assets/music/小さな恋のうた.mp3',
        cover: 'assets/covers/コバソロ.jpg',
        lrc: 'assets/lrc/小さな恋のうた-Kobasolo(コバソロ)七穂.lrc',
    }, {
        name: 'あとひとつ',
        artist: 'コバソロ & こぴ',
        url: 'assets/music/あとひとつ.mp3',
        cover: 'assets/covers/コバソロ.jpg',
        lrc: 'assets/lrc/あとひとつ-Kobasolo(コバソロ)こぴ.lrc',
    }, {
        name: 'キセキ',
        artist: '高橋李依',
        url: 'assets/music/キセキ.mp3',
        cover: 'assets/covers/高橋李依Collection.jpg',
        lrc: 'assets/lrc/キセキ-高橋李依.lrc',
    }, {
        name: '小さな恋のうた',
        artist: '高橋李依',
        url: 'assets/music/小さな恋のうた_高橋李依.mp3',
        cover: 'assets/covers/高橋李依Collection.jpg',
        lrc: 'assets/lrc/小さな恋のうた-高橋李依.lrc',
    }, {
        name: '言わないけどね。',
        artist: '高橋李依',
        url: 'assets/music/言わないけどね。.mp3',
        cover: 'assets/covers/高橋李依Collection.jpg',
        lrc: 'assets/lrc/言わないけどね。-高橋李依.lrc',
    }, {
        name: '愛唄',
        artist: '高橋李依',
        url: 'assets/music/愛唄.mp3',
        cover: 'assets/covers/高橋李依Collection.jpg',
        lrc: 'assets/lrc/愛唄-高橋李依.lrc',
    }, {
        name: '奏(和聲版)',
        artist: '高橋李依 x 雨宫天',
        url: 'assets/music/奏.mp3',
        cover: 'assets/covers/高橋李依Collection.jpg',
        lrc: 'assets/lrc/奏(かなで)-高橋李依.lrc',
    }, {
        name: '生きていたんだよな',
        artist: 'あいみょん',
        url: 'assets/music/生きていたんだよな.mp3',
        cover: 'assets/covers/生きていたんだよな-あいみょん.jpg',
        lrc: 'assets/lrc/生きていたんだよな-あいみょん.lrc',
    }, {
        name: '空の青さを知る人よ',
        artist: 'あいみょん',
        url: 'assets/music/空の青さを知る人よ.mp3',
        cover: 'assets/covers/空の青さを知る人よ-あいみょん.jpg',
        lrc: 'assets/lrc/空の青さを知る人よ-あいみょん.lrc',
    }, {
        name: '心做し',
        artist: '鹿乃',
        url: 'assets/music/鹿乃 - 心做し.mp3',
        cover: 'assets/covers/心做し-鹿乃.jpg',
        lrc: 'assets/lrc/心做し-鹿乃.lrc',
    }, {
        name: 'あの世行きのバスに乗ってさらば。',
        artist: 'ツユ',
        url: 'assets/music/あの世行きのバスに乗ってさらば。.mp3',
        cover: 'assets/covers/あの世行きのバスに乗ってさらば。-ツユ.jpg',
        lrc: 'assets/lrc/あの世行きのバスに乗ってさらば。-ツユ.lrc',
    }, {
        name: '願い～あの頃のキミへ～',
        artist: '當山みれい',
        url: 'assets/music/願い～あの頃のキミへ～.mp3',
        cover: 'assets/covers/願いあの頃のキミへ-當山みれい..jpg',
        lrc: 'assets/lrc/願いあの頃のキミへ-當山みれい.lrc',
    }, {
        name: '茜さす',
        artist: 'Aimer',
        url: 'assets/music/茜さす.mp3',
        cover: 'assets/covers/茜さす-Aimer.jpg',
        lrc: 'assets/lrc/茜さす-Aimer.lrc',
    }, {
        name: 'Rain',
        artist: '秦基博(はたもとひろ)',
        url: 'assets/music/Rain.mp3',
        cover: 'assets/covers/Rain-秦基博(はたもとひろ).jpg',
        lrc: 'assets/lrc/Rain-秦基博(はたもとひろ)  .lrc',
    }, {
        name: 'remember',
        artist: 'Uru',
        url: 'assets/music/remember.mp3',
        cover: 'assets/covers/remember-uru.jpg',
        lrc: 'assets/lrc/remember-uru.lrc',
    }, {
        name: 'AI DO.',
        artist: '桥本美雪',
        url: 'assets/music/AI DO. - 桥本美雪.mp3',
        cover: 'assets/covers/AIDO.-桥本美雪.jpg',
        lrc: 'assets/lrc/AIDO.-桥本美雪.lrc',
    }, {
        name: 'Apple And Cinnamon',
        artist: '宇多田ヒカル',
        url: 'assets/music/Apple And Cinnamon - 宇多田ヒカル.mp3',
        cover: 'assets/covers/AppleAndCinnamon-宇多田ヒカル.png',
        lrc: 'assets/lrc/AppleAndCinnamon-宇多田ヒカル.lrc',
    }, {
        name: 'Keep on Keeping on',
        artist: 'SawanoHiroyuki[nZk],aLIEz.',
        url: 'assets/music/Keep on Keeping on - SawanoHiroyuki[nZk],aLIEz.mp3',
        cover: 'assets/covers/KeeponKeepingon-SawanoHiroyuki_aLIEz.jpg',
        lrc: 'assets/lrc/KeeponKeepingon-SawanoHiroyuki_aLIEz.lrc',
    }, {
        name: 'loser',
        artist: 'KANA-BOON',
        url: 'assets/music/loser - KANA-BOON.mp3',
        cover: 'assets/covers/loser-KANA-BOON.jpg',
        lrc: 'assets/lrc/loser-KANA-BOON.lrc',
    }, {
        name: 'Moon',
        artist: 'Perfume',
        url: 'assets/music/Moon - Perfume.mp3',
        cover: 'assets/covers/Moon-Perfume.jpg',
        lrc: 'assets/lrc/Moon-Perfume.lrc',
    }, {
        name: 'MOON SIGNAL',
        artist: 'Sphere',
        url: 'assets/music/MOON SIGNAL - Sphere.mp3',
        cover: 'assets/covers/MOONSIGNAL-Sphere.jpg',
        lrc: 'assets/lrc/MOONSIGNAL-Sphere.lrc',
    }, {
        name: 'One Life',
        artist: 'ナノ',
        url: 'assets/music/One Life - ナノ.mp3',
        cover: 'assets/covers/OneLife-ナノ.jpg',
        lrc: 'assets/lrc/OneLife-ナノ.lrc',
    }, {
        name: 'メビウス',
        artist: '鈴木このみ',
        url: 'assets/music/メビウス (梅比乌斯) - 鈴木このみ.mp3',
        cover: 'assets/covers/メビウス(梅比乌斯)-鈴木このみ.jpg',
        lrc: 'assets/lrc/メビウス(梅比乌斯)-鈴木このみ.lrc',
    }, {
        name: 'Damn Good Day',
        artist: '星街すいせい',
        url: 'assets/music/Damn Good Day - 星街すいせい.mp3',
        cover: 'assets/covers/DamnGoodDay-星街すいせい.jpg',
        lrc: 'assets/lrc/DamnGoodDay-星街すいせい.lrc',
    }, {
        name: 'Necro Fantasia feat. 美里',
        artist: 'Alstroemeria Records,美里',
        url: 'assets/music/Necro Fantasia feat. 美里 - Alstroemeria Records,美里.mp3',
        cover: 'assets/covers/NecroFantasiafeat.美里-AlstroemeriaRecords_美里.jpg',
        lrc: 'assets/lrc/NecroFantasiafeat.美里-AlstroemeriaRecords_美里.lrc',
    }, {
        name: 'ぐらでーしょん',
        artist: 'KANA-BOON,北澤ゆうほ',
        url: 'assets/music/ぐらでーしょん (波淡法) - KANA-BOON,北澤ゆうほ.mp3',
        cover: 'assets/covers/ぐらでーしょん-KANA-BOON,北澤ゆうほ.jpg',
        lrc: 'assets/lrc/ぐらでーしょん-KANA-BOON,北澤ゆうほ.lrc',
    }, {
        name: 'チョ・イ・ス',
        artist: '雨宮天',
        url: 'assets/music/チョ・イ・ス - 雨宮天.mp3',
        cover: 'assets/covers/チョ・イ・ス-雨宮天.jpg',
        lrc: 'assets/lrc/チョ・イ・ス-雨宮天.lrc',
    }, {
        name: 'ひかり',
        artist: 'Flower Flower',
        url: 'assets/music/ひかり - Flower Flower.mp3',
        cover: 'assets/covers/ひかり-FlowerFlower.jpg',
        lrc: 'assets/lrc/ひかり-FlowerFlower.lrc',
    }, {
        name: '人形ノ涙',
        artist: '仲村芽衣子',
        url: 'assets/music/人形ノ涙 - 仲村芽衣子.mp3',
        cover: 'assets/covers/人形ノ涙-仲村芽衣子.jpg',
        lrc: 'assets/lrc/人形ノ涙-仲村芽衣子.lrc',
    }, {
        name: '喋蝶結び',
        artist: 'ななひら',
        url: 'assets/music/喋蝶結び - ななひら.mp3',
        cover: 'assets/covers/喋蝶結び-ななひら.jpg',
        lrc: 'assets/lrc/喋蝶結び-ななひら.lrc',
    }, {
        name: '月に唄えば',
        artist: 'サイダーガール',
        url: 'assets/music/月に唄えば - サイダーガール.mp3',
        cover: 'assets/covers/月に唄えば-サイダーガール.jpg',
        lrc: 'assets/lrc/月に唄えば-サイダーガール.lrc',
    }, {
        name: '甘いワナ ~Paint It, Black',
        artist: '宇多田ヒカル',
        url: 'assets/music/甘いワナ ~Paint It, Black - 宇多田ヒカル.mp3',
        cover: 'assets/covers/甘いワナPaintItBlack-宇多田ヒカル.jpg',
        lrc: 'assets/lrc/甘いワナPaintItBlack-宇多田ヒカル.lrc',
    }, {
        name: '廻廻奇譚',
        artist: 'Eve',
        url: 'assets/music/廻廻奇譚 - Eve.mp3',
        cover: 'assets/covers/廻廻奇譚-Eve.jpg',
        lrc: 'assets/lrc/廻廻奇譚-Eve.lrc',
    }, {
        name: '足りない音はキミの声',
        artist: '諸星すみれ',
        url: 'assets/music/足りない音はキミの声 - 諸星すみれ.mp3',
        cover: 'assets/covers/足りない音はキミの声-諸星すみれ.jpg',
        lrc: 'assets/lrc/足りない音はキミの声-諸星すみれ.lrc',
    }]
});