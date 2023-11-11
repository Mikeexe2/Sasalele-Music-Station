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
        player.addEventListener('ended', function () {
            var currentPlayButton = radTopBar.querySelector('.main-play-button[data-link="' + player.getAttribute('data-link') + '"]');
            updatePlayButtonIcon(currentPlayButton, false);
        });

        player.addEventListener('pause', function () {
            var currentPlayButton = radTopBar.querySelector('.main-play-button[data-link="' + player.getAttribute('data-link') + '"]');
            updatePlayButtonIcon(currentPlayButton, false);
        });
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
    lrcType: 1,
    audio: [{
        name: "前前前世",
        artist: 'RADWIMPS',
        url: 'https://drive.google.com/uc?export=download&id=1MJsGgodLNQ-sW6xaGUPCeEFrM5KDTISe',
        cover: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Radwimps-zenzenzense.jpg',
        lrc: '[00:00.00]前前前世 (Movie ver.) - RADWIMPS (ラッドウィンプス) \n[00:06.77]词：野田洋次郎 \n[00:13.55]曲：野田洋次郎 \n[00:20.33]やっと眼を覚ましたかい（总算睡醒了吗？） \n[00:23.79] \n[00:24.70]それなのになぜ眼も（可你为什么） \n[00:26.64]合わせやしないんだい?（不肯对上我的视线呢？） \n[00:28.50] \n[00:30.25]「遅いよ」と怒る君（你生气地说：好慢啊） \n[00:33.31] \n[00:35.00]これでもやれるだけ（可我已经以最快的速度） \n[00:36.71]飛ばしてきたんだよ（飞奔到你的身边） \n[00:38.58] \n[00:40.01]心が身体を追い越してきたんだよ（心甚至比身体先一步抵达了这里） \n[00:44.17] \n[00:45.62]君の髪や瞳だけで胸が痛いよ（只是望着你的发丝和眼睛 我就会觉得心痛） \n[00:49.68] \n[00:50.40]同じ時を吸いこんで（想和你呼吸在当下） \n[00:52.37]離したくないよ（再也不想和你分开） \n[00:55.16]遥か昔から知るその声に（很久很久以前就熟稔于心的声音） \n[01:00.22]生まれてはじめて（有生以来第一次） \n[01:03.07]何を言えばいい?（烦恼着该如何回应？） \n[01:07.92]君の前前前世から僕は（从你的前前前世开始） \n[01:10.30]君を探しはじめたよ（我就在追寻你的踪迹） \n[01:12.67]そのぶきっちょな笑い方を（追随着你笨拙的笑容） \n[01:14.87]めがけてやってきたんだよ（总算找到了这个地方） \n[01:17.80]君が全然全部なくなって（就算你的一切化为乌有） \n[01:20.30]チリヂリになったって（散落成碎片） \n[01:22.62]もう迷わない（我也会毫不犹豫地） \n[01:23.90]また１から探しはじめるさ（从头开始再一次寻找） \n[01:26.71] \n[01:27.51]むしろ０から（不如说就这样从零开始） \n[01:29.15]また宇宙をはじめてみようか（再创造一个全新的宇宙） \n[01:32.37] \n[01:43.91]どっから話すかな（该从哪儿说起呢） \n[01:46.89] \n[01:48.29]君が眠っていた間のストーリー（在你沉睡这段期间的故事） \n[01:51.75] \n[01:53.77]何億何光年分の物語を（我来这里对你讲述） \n[01:59.86]語りにきたんだよ（这几亿光年的故事） \n[02:02.12] \n[02:03.40]けどいざその姿この眼に映すと（可当你一出现在我的眼前） \n[02:07.01] \n[02:08.89]君も知らぬ君とジャレて（我却想和你也不曾知晓的自己） \n[02:11.06]戯れたいよ（说笑玩闹） \n[02:13.15] \n[02:13.78]君の消えぬ痛みまで（包括长久纠缠你的苦痛） \n[02:15.78]愛してみたいよ（我也想一并地爱惜包容） \n[02:18.27] \n[02:19.16]銀河何個分かの果てに出逢えた（数不清是第几次穿越银河 才在尽头和你邂逅） \n[02:23.51]その手を壊さずに（我该如何小心翼翼） \n[02:26.52]どう握ったならいい?（紧握住你的手才好？） \n[02:31.29]君の前前前世から僕は（从你的前前前世开始） \n[02:33.71]君を探しはじめたよ（我就在追寻你的踪迹） \n[02:35.91]その騒がしい声と涙をめがけ（追随着喧嚣的噪音 你的眼泪） \n[02:39.13]やってきたんだよ（总算找到了这个地方） \n[02:41.09]そんな革命前夜の僕らを（处于革命前夜的我们） \n[02:43.82]誰が止めるというんだろう（你说还有谁能阻止呢） \n[02:45.96]もう迷わない（我会毫不犹豫地） \n[02:47.48]君のハートに旗を立てるよ（在你心中竖起我的旗帜） \n[02:50.18] \n[02:50.92]君は僕から諦め方を奪い取ったの（我放弃的念头早就被你夺走了） \n[02:56.17] \n[03:53.18]前前前世から僕は（从你的前前前世开始） \n[03:55.09]君を探しはじめたよ（我就在追寻你的踪迹） \n[03:57.42]そのぶきっちょな（追随着你） \n[03:58.77]笑い方をめがけて（笨拙的笑容） \n[04:00.35]やってきたんだよ（总算找到了这个地方） \n[04:02.62]君が全然全部なくなって（就算你的一切化为乌有） \n[04:05.13]チリヂリになったって（散落成碎片） \n[04:07.39]もう迷わない（我也会毫不犹豫地） \n[04:08.76]また１から探しはじめるさ（从头开始再一次寻找） \n[04:11.79] \n[04:12.80]何光年でも（不管相隔多少光年） \n[04:13.96]この歌を口ずさみながら（我都会继续哼唱起这首歌）',
        theme: '#ebd0c2'
    },
    {
        name: 'Butter-Fly',
        artist: '和田光司(By コバソロ & 七穂)',
        url: 'https://drive.google.com/uc?export=download&id=1MsP1LkJj8K5k_Dq7kwYGJDbRbXSN4mfP',
        cover: 'https://pic-bstarstatic.akamaized.net/ugc/5f4e8eb0f5673ea804c53ffeb6619bcf439d5a5e.jpg@160w_90h_1e_1c_90q',
        lrc: '[00:00.00]Butter-Fly - 和田光司 (わだ こうじ) \n[00:04.52]词：千綿偉功 \n[00:09.05]曲：千綿偉功 \n[00:13.57]编曲：渡部チェル \n[00:18.00]ゴキゲンな蝶になって（化为轻快的蝴蝶） \n[00:20.48]きらめく風に乗って（迎着那闪烁之风） \n[00:23.21]今すぐ キミに会いに行こう（现在立刻就去见你） \n[00:27.16] \n[00:29.32]余計な事なんて（那些多余的事情） \n[00:32.08]忘れた方がマシさ（还是忘掉比较好） \n[00:34.82]これ以上 シャレてる時間はない（没有时间再装模作样了） \n[00:38.65] \n[00:40.65]何が wow wow（有什么 wow wow） \n[00:42.96] \n[00:43.49]この空に届くのだろう（将要抵达这片天空） \n[00:46.40]だけど wow wow（然而 wow wow） \n[00:48.88] \n[00:49.56]明日の予定もわからない（明天将会如何依然未知） \n[00:54.70] \n[00:55.53]無限大な夢のあとの（在无限大的梦想过后） \n[00:59.70]何もない世の中じゃ（一无所有的世界中） \n[01:02.07]そうさ愛しい（拥有强烈的思念） \n[01:04.12]想いも負けそうになるけど（或许仍会失败吧） \n[01:07.23]Stayしがちなイメージだらけの（就算是这踌躇不前） \n[01:11.33]頼りない翼でも（又不可靠的双翼） \n[01:13.77]きっと飛べるさ（也一定能展翅高飞） \n[01:16.06]On my love \n[01:22.33] \n[01:30.87]ウカレタ蝶になって（化为朝气的蝴蝶） \n[01:33.19]一途な風に乗って（朝着唯一的风向） \n[01:35.90]どこまでも（天涯海角） \n[01:37.37]キミに会いに行こう（前去见你） \n[01:39.90] \n[01:42.03]曖昧な言葉って（暧昧的言语） \n[01:44.78]意外に便利だって（意外的方便） \n[01:47.48]叫んでるヒットソング聴きながら（听着如此叫嚣的流行歌曲） \n[01:51.64] \n[01:53.30]何が wow wow（有什么 wow wow） \n[01:55.70] \n[01:56.24]この街に響くのだろう（将会响彻这条街道） \n[01:59.12]だけど wow wow（然而 wow wow） \n[02:02.17]期待してても仕方ない（只是期待也无济于事） \n[02:07.27] \n[02:08.17]無限大な夢のあとの（在无限大的梦想过后） \n[02:12.42]やるせない世の中じゃ（百无聊赖的世界中） \n[02:14.74]そうさ常識（就这样脱离常轨） \n[02:17.01]はずれも悪くはないかな（也无可厚非吧） \n[02:19.91]Stayしそうなイメージを染めた（就算是这徘徊不进） \n[02:24.03]ぎこちない翼でも（又笨拙的双翼） \n[02:26.46]きっと飛べるさ（也一定能展翅高飞） \n[02:28.74]On my love \n[02:34.41] \n[03:12.18]無限大な夢のあとの（在无限大的梦想过后） \n[03:16.41]何もない世の中じゃ（一无所有的世界中） \n[03:18.79]そうさ愛しい（拥有强烈的思念） \n[03:20.91]想いも負けそうになるけど（或许仍会失败吧） \n[03:23.88]Stayしがちなイメージだらけの（就算是这踌躇不前） \n[03:28.05]頼りない翼でも（又不可靠的双翼） \n[03:30.49]きっと飛べるさ（也一定能展翅高飞） \n[03:32.79]Oh yeah \n[03:35.52]無限大な夢のあとの（在无限大的梦想过后） \n[03:39.72]やるせない世の中じゃ（百无聊赖的世界中） \n[03:42.04]そうさ常識（就这样脱离常轨） \n[03:44.36]はずれも悪くはないかな（也无可厚非吧） \n[03:47.14]Stayしそうなイメージを染めた（就算是这徘徊不进） \n[03:51.33]ぎこちない翼でも（又笨拙的双翼） \n[03:53.71]きっと飛べるさ（也一定能展翅高飞） \n[03:56.05]On my love',
        theme: '#60affe'
    },
    {
        name: 'Catch the Moment',
        artist: 'LiSA',
        url: 'https://drive.google.com/uc?export=download&id=1tYigvqC9QoUj5JzTFO_RHEuUIqzxHDmu',
        cover: 'https://static.wikia.nocookie.net/jpop/images/1/16/Catchreg.jpg/revision/latest?cb=20170224094844',
        lrc: '[00:07.21]LiSA [00:08.47] [00:09.77]Catch the Moment [00:10.98] [00:12.21]作詞：LiSA [00:13.63]作曲：田淵智也 [00:14.76] [00:21.12]そっと　吐き出す　ため息を吸い込んだ　後悔は苦い味残して(輕輕地將吐出的嘆息吞噬 留下的是後悔的甘苦)\n[00:30.65]いつも　なんで？　肝心なこと言えないまま　次の朝日が顔だしてる(為何總是如此?  想傳達的話語放在心中 就這樣日復一日)\n[00:39.34] [00:39.60]嫌になった運命を　ナイフで切り刻んで(變得討厭的命運用利刃去畫破它)\n[00:45.10]もう一度やり直したら　キミに出会えないかも(如果能夠重新再來過或許就不會遇見你吧)\n[00:54.98] [00:55.27]僕の声が響いた瞬間に始まる　命のリミット　心臓がカウントしてる(在我的聲音響徹的瞬間 心跳就開始倒數著我的人生)\n[01:06.42]叶えても叶えても　終わらない願い(無數的反覆祈願 心願也不會就此完結)\n[01:15.25]汗をかいて走った　世界の秒針は　いつか止まった僕を置いていく(劃下了汗水奔跑著 世界的秒針終將會拋下停滯不前的我)\n[01:26.78]あと何回キミと笑えるの？(還能有幾次能與你歡笑呢?)\n[01:32.96]試してるんだ　僕を　Catch the Moment(我正嘗試著 Catch the Moment)\n[01:37.08] [01:46.99]一個幸せを数えるたびに　変わっていく未来に怯えてしまうけど(每當細數一份幸福時 總會害怕著逐漸改變的未來)\n[01:56.62] [01:56.79]愛情の種を大切に育てよう(將愛情的種子用心灌溉吧)\n[02:03.37]分厚い雲も　やがて突き破るかな(在厚的雲層有一天我們也能穿破它吧)\n[02:10.82] [02:11.17]キミの声が響いた　僕の全身を通って　心臓のドアをノックしてる(你的吶喊響徹著 穿透我全身至心扉敲了個門)\n[02:22.22]「臆病」　でも開けちゃうんだよ　信じたいから(「膽小」的我也願意敞開喔 因為我想相信你)\n[02:31.11]何にもないと思ったはずの足元に　いつか深く確かな根を生やす(應該寸草不生的腳邊  曾幾何時萌芽出了深根)\n[02:42.53]嵐の夜が来たとしても　揺らいだりはしない(就算是暴風雨來臨的夜晚也不輕易動搖)\n[02:51.39] [02:51.57]何度でも(反覆嘗試)\n[02:52.24]追いついたり　追い越したり　キミがふいに分かんなくなって(追隨著你 超越過你 不經意地變得不了解你)\n[02:57.23]息をしたタイミングが合うだけで　嬉しくなったりして(只是呼吸合拍而已 就如此雀躍不已)\n[03:04.01]集めた一秒を　永遠にして行けるかな(是否能將所收集的每一秒化做永恆呢)\n[03:15.72] [03:27.03]僕の声が響いた瞬間に始まる　命のリミット　心臓がカウントしてる(在我的聲音響徹的瞬間 心跳就開始倒數著我的人生)\n[03:38.15]叶えても叶えても　終わらない願い(無數的反覆祈願 心願也不會就此完結)\n[03:46.92]汗をかいて走った　世界の秒針が　いつか止まった僕を置いていく(劃下了汗水奔跑著 世界的秒針終將會拋下停滯不前的我)\n[03:58.13]あと何回キミと笑えるの？(還能有幾次能與你歡笑呢?)\n[04:04.55]試してるんだ　僕を　Catch the Moment(我正嘗試著 Catch the Moment)\n[04:08.94] [04:09.67]逃さないよ僕は(不會讓你溜走的)\n[04:12.11]この瞬間を掴め　Catch the Moment(我會抓住這一瞬間  Catch the Moment)\n[04:18.80]',
        theme: '#1973dc'
    },
    {
        name: "Baby Don't Know Why",
        artist: 'Ms.OOJA',
        url: 'https://drive.google.com/uc?export=download&id=1mRjlDRVX3hZAlShGUvfj2KrGO9qaHOpd',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/841f28eff51de652924053d376bf9d33',
        lrc: '[00:00.00]baby don’t know why - Ms.OOJA(ミス・オオジャ)\n[00:11.40]词：Ms.OOJA\n[00:22.81]曲:Ms.OOJA\n[00:34.22]通り過ぎてゆく人の中(过往的人群中)\n[00:37.14]一人うつむいて歩いていた(我独自低头走着)\n[00:40.82]前が見えな くて(看不到前方)\n[00:43.18]降り出した雨にも気付かないで(连开始下雨了都没注意到)\n[00:46.81]どこにもいけなくて(哪儿都去不了)\n[00:50.82]あの日あなたに出会った事は(那天 遇 上了你)\n[00:53.81]私を変えてくれたよね(从此改变了我)\n[00:57.59]この手を掴んで離さないよって(你说 你会抓紧我不放手)\n[01:01.85]遠く遠く連れ去ってくれたのに(带我去了很远很远的地方)\n[01:07.13]流れてく時はいつの間にか(流逝的时光不知觉间)\n[01:11.10]孤独な長い夜を作り だした(创造出了孤独的长夜)\n[01:15.28]あなたの隣りで眠るときは(当你安睡在我身边)\n[01:19.41]朝はすぐやってきたのに(清晨一晃眼就来到)\n[01:22.88]Baby don’t know why I cry[01:25.37]さよなら(真的不想说再见)\n[01:26.88]本当は言いたくないタダの強がり(但却故作坚强)\n[01:32.04]Baby baby気付いてよ(Baby baby快注意到吧)\n[01:36.08]こんなはずじゃなかった(我们不应该)\n[01:38.15]二人なのに(是这种结局)\n[01:40.92]あの日あなたが(那一天)\n[01:42.30]言った言葉にウソは(你说的言 语中)\n[01:44.76]一つもなかったよね(没有任何谎言吧)\n[01:47.65]ずっと一緒だって変わらないよって(你不是曾紧紧抱住我)\n[01:52.01]強く強く抱きしめてくれたのに(说要永远在一 起 永远不变心吗)\n[01:57.15]私が気付いてた幸せは(我所感受到的幸福)\n[02:01.18]きっとあなたと同じじゃなかった(一定和你是不同的)\n[02:05.42]ほんの少しすれ違っただけで(只是因 为一丁点的分歧)\n[02:09.52]心は見えなくなってた(便看不清你的内心)\n[02:13.20]Baby don’t know why I cry[02:15.47]さよなら(真的不想说再见)\n[02:17.03]本当は言いたくないタダの強がり(但却故作坚强)\n[02:22.06]Baby baby気付いてよ(Baby baby快注意到吧)\n[02:26.26]こんなはずじゃなかったのに(明明不应该是这样的)\n[02:29.61]Baby don’t know why I cry[02:32.06]さよなら(再见了)\n[02:33.61]二度と戻れないこと(明明知道)\n[02:36.41]わかってるくせに(你再也不会回来)\n[02:38.86]Baby baby止まらない涙(Baby baby止不住的眼泪)\n[02:43.44]もう泣かないと決めたのに(虽然已经决定不再哭了)\n[02:47.55]不安で辛くてしょうがなかった(不安 辛酸 毫无办法)\n[02:51.26]あなたの背中に隠れて泣いてた(躲在你的背后哭泣)\n[02:55.63]ウソツキキライヨ(说谎 我讨厌你)\n[02:57.76]バカニシナイデヨ(不要把我当傻子)\n[02:59.93]どんな言葉もすり抜けていった(不管说什么都蒙混过关了)\n[03:03.96]わかってるあなたも(我明白)\n[03:06.02] 傷付いてたよね(你也受伤了吧)\n[03:08.22]気付いた二人は(才发现我们)\n[03:10.27]よく似てたんだね(其实很像啊)\n[03:12.32]あの日と同じ雨の中(和那天一样的雨中)\n[03:15.91]ま た一人になってしまった(又变成了一个人)\n[03:19.98]Baby don’t know why I cry[03:22.16]さよなら(真的不想说再见)\n[03:23.72]本当は言いたくないタダの強がり(但却故作坚强)\n[03:29.02]Baby baby気付いてよ(Baby baby快注意到吧)\n[03:33.00]こんなはずじゃなかったのに(明明不应该是这样的)\n[03:36.23]Baby don’t know why I cry[03:38.94]さよなら(再见了)\n[03:40.39]最後くらいちゃんと(至少在最后)\n[03:42.87]わかり合いたいよ(希望彼此都能清楚)\n[03:45.56]Baby baby二人が過ごした日々が(Baby baby两个人度过的日子)\n[03:51.60]大切なこと(真的真的很珍贵)\n[03:53.33]Baby don’t know why I cry[04:01.64]Baby don’t know why I cry[04:11.04]I don’t cry[04:19.30]I don’t cry’',
        theme: '#b38972'
    },
    {
        name: 'LOSER',
        artist: '米津玄師',
        url: 'https://drive.google.com/uc?export=download&id=192n7GXieQ6zrfkrg5HM2YoYsvk8DfuLH',
        cover: 'https://image.biccamera.com/img/00000003460188_A01.jpg?sr.dw=320&sr.jqh=60&sr.dh=320&sr.mat=1',
        lrc: '[00:00.13]LOSER - 米津玄師(よねづ けんし)\n[00:01.81]词：米津玄師 \n[00:02.87]曲：米津玄師 \n[00:30.28]いつもどおりの通り独り(一如既往日复一日)\n[00:31.88]こんな日々もはや懲り懲り(这种日子再难忍受)\n[00:33.90]もうどこにも行けやしないのに(明明已经无处可逃)\n[00:35.77]夢見ておやすみ(去梦中吧祝你好眠)\n[00:37.89]いつでも僕らはこんな風に(我们一直都是如此)\n[00:39.88]ぼんくらな夜に飽き飽き(厌倦着这样昏昏沉沉的夜)\n[00:41.64]また踊り踊り出す明日に(仍然还要继续起舞)\n[00:43.67]出会うためにさよなら(为了明天的相会挥手作别)\n[00:46.37]歩き回ってやっとついた(四处彷徨后终于到达)\n[00:48.42]ここはどうだ楽園か?(这里总该是乐园了吧)\n[00:50.30]今となっちゃもうわからない(可事到如今已经不敢确定)\n[00:54.20]四半世紀の結果出来た(历经四分之一个世纪总算得出结果)\n[00:56.24]青い顔のスーパースターが(面色惨白的superstar)\n[00:58.19]お腹すかしては待ってる(饿着肚子等待着)\n[01:01.80]アイムアルーザー(我是个loser)\n[01:02.84]どうせだったら(所以就算)\n[01:03.66]遠吠えだっていいだろう(虚张声势也无所谓吧)\n[01:05.70]もう一回もう一回行こうぜ(再一次再一次前行吧)\n[01:07.75]僕らの声(我们的声音)\n[01:09.65]アイムアルーザー(我是个loser)\n[01:10.71]ずっと前から聞こえてた(很久以前就已经听到)\n[01:13.14]いつかポケットに隠した声が(那不知何时被深藏于口袋之中的声音)\n[01:25.52]ああだのこうだの知ったもんか(这也好那也好我才不管)\n[01:27.48]幸先の空は悪天候(预兆出不祥的天空)\n[01:29.22]ほら窓から覗いた摩天楼(快看窗外的摩天楼)\n[01:31.07]からすりゃ塵のよう(从那边看过来不过是一粒尘埃)\n[01:33.29]イアンもカートも昔の人よ(伊恩和科特都是很久以前的人)\n[01:35.47]中指立ててもしょうがないの(就算竖起中指也是毫无他法)\n[01:37.36]今勝ち上がるためのお勉強(现在为了取胜而努力着)\n[01:39.27]朗らかな表情(展露着无比开朗的表情)\n[01:41.40]踊る阿呆に見る阿呆(跳舞的傻瓜看着的傻瓜)\n[01:42.84]我らそれを端から笑う阿呆(我们是旁观这种情景笑着的傻瓜)\n[01:44.90]デカイ自意識抱え込んでは(紧抱着的巨大自我意识)\n[01:46.85]もう磨耗(已被磨耗)\n[01:47.25]すり減って残る酸っぱい葡萄(像被消磨后残留下的酸涩葡萄)\n[01:49.35]膝抱えてもなんもねえ(抱着膝盖也不会发生什么)\n[01:50.81]ほら長い前髪で前が見えねえ(看吧长长的刘海已遮住了前方)\n[01:53.28]笑っちまうねパッと沸き立って(不禁笑出了声突然间厌倦了)\n[01:55.30]フワッと消えちゃえるこんな輪廻(或许会蓦然之间消失不见如此轮回反复)\n[01:57.30]愛されたいならそう言おうぜ(想要被爱的话就那样说出来吧)\n[01:59.27]思ってるだけじゃ伝わらないね(光是想的话是传递不了的)\n[02:01.19]永遠の淑女もそっぽ向いて(永恒的淑女也不予理睬)\n[02:03.14]天国は遠く向こうのほうへ(天国依然在遥远的另一端)\n[02:05.56]ああわかってるって(啊已经明白了)\n[02:07.06]深く転がる俺は負け犬(摔了个大跟头的我是一只败犬)\n[02:09.16]ただどこでもいいから(不管哪里都好)\n[02:10.50]遠くへ行きたいんだ(我只想去一个遥远的地方)\n[02:11.91]それだけなんだ(只是这样而已)\n[02:13.62]耳をすませ遠くで今(侧耳倾听不要错过)\n[02:15.62]響きだした音を逃すな(远方正在响彻的声音)\n[02:17.61]呼吸を整えて(调整好呼吸)\n[02:21.53]いつかは出会えるはずの(有朝一日你或许会遇到)\n[02:23.71]黄金の色したアイオライトを(散发着金色光芒的堇青石)\n[02:25.71]きっと掴んで離すな(一定要牢牢抓住不让它溜走)\n[02:27.16] \n[02:29.10]アイムアルーザー(我是个loser)\n[02:30.04]なんもないなら(原本就是一无所有)\n[02:31.03]どうなったっていいだろう(所以不管变得怎样都没什么所谓吧)\n[02:32.64]うだうだして(一直絮絮叨叨)\n[02:33.64]フラフラしていちゃ今に(游移不定不如和现在)\n[02:35.15]灰左様なら(挥手道别)\n[02:36.91]アイムアルーザー(我是个loser)\n[02:37.92]きっといつかって願うまま(祈祷着有朝一日能如愿)\n[02:40.41]進めロスタイムの(前进吧去往所遗失的)\n[02:42.73]そのまた奥へ行け(时光的更深处)\n[02:46.80]愛されたいならそう言おうぜ(想要被爱的话就那样说出来吧)\n[02:50.79]思ってるだけじゃ伝わらないね(光是想的话是传递不了的)\n[02:54.69]永遠の淑女もそっぽ向いて(永恒的淑女也不予理睬)\n[02:58.71]天国は遠く向こうのほうへ(天国依然在遥远的另一端)\n[03:02.58]ここいらでひとつ踊ってみようぜ(在这试着再跳一次舞吧)\n[03:06.61]夜が明けるまで転がっていこうぜ(在天亮之前磕绊着前进吧)\n[03:08.64] \n[03:10.54]聞こえてんなら声出していこうぜ(能听见的话就大喊着前进吧)\n[03:16.59]アイムアルーザー(我是个loser)\n[03:17.59]どうせだったら(所以就算)\n[03:18.54]遠吠えだっていいだろう(虚张声势也无所谓吧)\n[03:20.42]もう一回もう一回行こうぜ(再一次再一次前行吧)\n[03:22.55]僕らの声(我们的声音)\n[03:24.52]アイムアルーザー(我是个loser)\n[03:25.61]ずっと前から聞こえてた(很久以前就已经听到)\n[03:28.02]いつかポケットに隠した声が(那不知何时被深藏于口袋之中的声音)\n[03:34.35]ここいらでひとつ踊ってみようぜ(在这试着再跳一次舞吧)\n[03:38.15]夜が明けるまで転がっていこうぜ(在天亮之前磕绊着前进吧)\n[03:40.67] \n[03:42.35]聞こえてんなら声出していこうぜ(能听见的话就大喊着前进吧）',
        theme: '#18131a'
    },
    {
        name: '打上花火',
        artist: 'DAOKO × 米津玄師',
        url: 'https://drive.google.com/uc?export=download&id=1sBHIt_Pm7tSwtsu-cDOAwR3ba6KgpkNd',
        cover: 'https://upload.wikimedia.org/wikipedia/zh/c/c3/Uchiage_Hanabi_Cover_by_DAOKO.jpg',
        lrc: '[00:00.26]打上花火 - 米津玄師 (よねづ けんし) \n[00:03.38]词：米津玄師 \n[00:04.66]曲：米津玄師 \n[00:14.58]あの日見渡した渚を（如今我仍在回想） \n[00:19.48]今も思い出すんだ（那日环顾的海岸） \n[00:24.38]砂の上に刻んだ言葉（刻写在沙滩上的文字） \n[00:29.38]君の後ろ姿（以及你的背影） \n[00:34.38]寄り返す波が（浪花拍岸） \n[00:37.74]足元をよぎり何かを攫う（掠过脚边 不知带走了什么） \n[00:44.19]夕凪の中（风平浪静的海面上） \n[00:47.67]日暮れだけが通り過ぎて行く（只有落日缓缓滑落） \n[00:54.06]パッと光って咲いた（啪的一声 光芒绽放） \n[00:56.60]花火を見ていた（烟花映入眼帘） \n[00:59.18]きっとまだ終わらない夏が（夏天一定还没有完结） \n[01:04.03]曖昧な心を解かして繋いだ（将暧昧的心解明后紧紧相连） \n[01:08.97]この夜が続いて欲しかった（多希望这个夜晚能够永恒） \n[01:23.89]「あと何度君と同じ花火を（我还能与你） \n[01:26.97]見られるかな」って（看多少次同样的烟花呢） \n[01:28.85]笑う顔に何ができるだろうか（又能为你的笑容做些什么呢） \n[01:34.05]傷つくこと喜ぶこと（受伤之事 喜悦之事） \n[01:36.58]繰り返す波と情動（周而复始的浪涛与激情） \n[01:38.73]焦燥最終列車の音（焦躁 末班列车的声音） \n[01:44.15]何度でも（无数次） \n[01:46.07]言葉にして君を呼ぶよ（我喊出心中所想 呼唤着你） \n[01:48.81]波間を選びもう一度（再次选择面对汹涌的波涛） \n[01:54.13]もう二度と悲しまずに（只愿不用再经历） \n[02:00.08]済むように（那份悲伤） \n[02:03.35]はっと息を飲めば（只要蓦地屏住呼吸） \n[02:05.85]消えちゃいそうな光が（那近乎消失的光芒） \n[02:08.38]きっとまだ胸に住んでいた（便定会再次寄宿于心中） \n[02:13.32]手を伸ばせば触れた（只要伸出手去便能触摸到） \n[02:15.75]あったかい未来は（那温暖的未来） \n[02:18.22]ひそかに二人を見ていた（正偷偷窥探着我们） \n[02:23.70]パッと花火が（啪的一声） \n[02:26.29]夜に咲いた（烟花绽放于夜空） \n[02:28.70]夜に咲いて（盛放之后） \n[02:31.33]静かに消えた（归于宁静） \n[02:33.75]離れないで（请不要离开） \n[02:36.16]もう少しだけ（请稍微地） \n[02:38.58]もう少しだけ（稍微地让此刻延长一些吧） \n[03:02.71]パッと光って咲いた（啪的一声 光芒绽放） \n[03:05.29]花火を見ていた（烟花映入眼帘） \n[03:07.76]きっとまだ終わらない夏が（夏天一定还没有完结） \n[03:12.66]曖昧な心を解かして繋いだ（将暧昧的心解明后紧紧相连） \n[03:17.63]この夜が続いて欲しかった（多希望这个夜晚能够永恒） \n[03:23.12]パッと花火が（啪的一声） \n[03:25.70]夜に咲いた（烟花绽放于夜空） \n[03:28.08]夜に咲いて（盛放之后） \n[03:30.69]静かに消えた（归于宁静） \n[03:33.01]離れないで（请不要离开） \n[03:35.47]もう少しだけ（请稍微地） \n[03:37.98]もう少しだけ（稍微地让此刻延长一些吧）',
        theme: '#864378'
    },
    {
        name: '終わりの世界から',
        artist: '麻枝 准×やなぎなぎ',
        url: 'https://drive.google.com/uc?export=download&id=1L1S0-i1B9LpxYLFOrfZW05If3kKauHIx',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/41d1010473c549b0aee1dd16ffb6af70',
        lrc: '[00:00.00]終わりの世界から (始于终焉世界) - yanaginagi (やなぎなぎ) \n[00:00.56]词：麻枝准 \n[00:00.75]曲：麻枝准 \n[00:00.99]编曲：SHOGO \n[00:01.16]笑い合えるってすごく幸せなこと（能共同微笑是件幸福的事） \n[00:08.19]それをきみから（记得你曾经） \n[00:11.02]教えてもらったんだよ（对我说过这么一句话） \n[00:28.29]小さな時からなんでも知っていて（从小时候起我就清楚知道每一件事） \n[00:33.84]きみの趣味（努力迎合你的爱好） \n[00:35.40]その理想に合わせようとした（认同你的理想） \n[00:41.17]そんなきみが（然而你却） \n[00:42.90]こっそり教えてくれた（悄悄地告诉我） \n[00:46.70]好きな人 年上の綺麗な女性（喜欢的是 年长的漂亮女子） \n[00:53.41]追いつけない だから能力使う（无法赶上你 因此不惜动用能力） \n[00:58.59]過去へとリープ（带着期待穿越到过去） \n[01:00.45]そこでまたきみと出会い（我要在那里再次与你邂逅） \n[01:04.70]また恋をするんだ（再次与你相恋） \n[01:13.14]ぼろぼろに泣いて（泪如雨下的你） \n[01:15.87]きみは探していた（一直在寻找） \n[01:19.62]突然いなくなったあたしの面影を（突然消失不见的我所留下的痕迹） \n[01:27.07]早く帰ろ でも能力は一方通行（好想赶快回去 无奈法力却只能单向通行） \n[01:35.25]未来には飛べなかった（无法跳跃到未来） \n[01:52.61]遠くからきたってことを伝えたい（多想告诉你我来自遥远的地方） \n[01:58.07]でもそれは駄目だって（但是却不经意发现了） \n[02:01.67]どこかで気づいてた（这样做是不行的） \n[02:04.80]年上のあたしを見て訊くの（你望着年长的我轻问道） \n[02:10.03]「あなたに似た人を探してます（“我在寻找一个长得跟你相似的人） \n[02:15.19]何か知りませんか」と（你是否知道些什么？”） \n[02:24.55]ぼろぼろになって（你苦苦追寻着） \n[02:27.17]あの日を探していた（变得乱七八糟的那一天） \n[02:30.94]ばらばらになった（想要再次联结上） \n[02:33.51]ふたりをつなごうとした（早已散落于不同时空的两人） \n[02:38.27]やめて あたし ここに居るよ（停停吧 知道么 我就在这里啊） \n[02:43.97]だからどこにも行かないで（所以请哪里也不要去） \n[02:50.10]また春が来て（冬去春来） \n[02:53.36]きみはここを発つと決めた（你决定离开这里四处搜寻） \n[02:59.83]「もしあなたがあの人だったら（"如果你就是她的话） \n[03:05.12]よかったのに」と残し（该多好"只留下这样一句话） \n[03:27.41]恋をする 贅沢な感情（恋爱是奢侈的感情） \n[03:32.63]それを思い出した（我想起了这种说法） \n[03:35.85]だから全力でその手を取る（因此竭尽全力攥住了你的手） \n[03:42.22]ぼろぼろになって（泪如雨下的我） \n[03:44.96]きみにほんとを伝えた（告诉了你真相） \n[03:48.85]ばらばらになった（随后被吸入混乱不堪的） \n[03:51.35]時空に吸い込まれていく（时空之中） \n[03:56.07]そして目覚めたら（醒来之后） \n[04:00.20]そこは一面灰色の世界（身处万物灰色的世界） \n[04:08.42]手に持ってたのは（手上拿着的） \n[04:10.79]古びた一枚の写真（是一张陈旧的相片） \n[04:14.80]こんな色をしてた時代も（以前我们曾有过） \n[04:19.16]あったんだ（这种色彩缤纷的时代） \n[04:22.06]そこで無邪気に笑ってる（相片中的我天真地笑着） \n[04:27.94]きみに会いにここから旅を始めた（为能与你再会我在这里重新踏上旅途） \n[04:50.17]また笑えるかなあたしこの世界で（我还能再次欢笑么 在这个世界里） \n[04:57.24]きみの写真は（放下了你的照片） \n[05:00.08]置いたままで歩き出す（开始迈步出发）',
        theme: '#2e477e'
    },
    {
        name: 'Break Beat Bark!',
        artist: '神田沙也加',
        url: 'https://drive.google.com/uc?export=download&id=1GbZRNlum1WjsHtXHxRrZh3-LYi7ZXBbx',
        cover: '/music/cover/Break Beat Bark.jpg',
        lrc: '[00:00.21]Break Beat Bark! - 神田沙也加 (かんだ さやか) \n[00:02.11]词：hotaru \n[00:02.42]曲：eda \n[00:02.86]编曲：eda \n[00:15.84]警報が響いて（警报声响起） \n[00:18.34]包囲網でガンジガラメ（遭到包围网牢牢地围住） \n[00:21.20]Checkmate寸前 countdownが嫌らしいな（将死迫在眉睫 令人厌恶的倒计时蓦然响起） \n[00:26.30]勝手な欲望で踏みつけられたって（惨遭自私的欲望践踏而过） \n[00:31.46]僕のセオリーじゃ答えは（依据我的理论 答案是） \n[00:34.87]"No are you kidding me" \n[00:37.46]僕の刻んだ記憶を（铭刻于脑海中的记忆） \n[00:42.57]君と創り上げてきた現実を（与你一同创造的现实） \n[00:46.39]イレギュラーになんて奪わせるな（别让异常之物夺走它们） \n[00:51.14]Break Beat Bark まだ見えない（Break Beat Bark 仍然不可见的） \n[00:55.68]未来って（未来） \n[00:56.78]単純じゃないダンジョンみたい（并不单纯 而是像迷宫般错综复杂） \n[00:59.35]Can’t see \n[01:00.64]だけどhead up すぐそこさ（不过 抬起头来吧 近在眼前了） \n[01:05.89]"Never give up" \n[01:07.04]パスワードはそれで十分なんだ（密码只要这样就足够了） \n[01:10.69]君と僕の純粋すぎる理想（你我心中那过于纯粹的理想） \n[01:14.63]捨てられないね? Heartbeat（无论如何都无法轻易舍弃对吧? Heartbeat） \n[01:17.66]叫び出せ 願いの限り（将愿望的极限呼喊而出） \n[01:29.88]冗談じゃないって（“别开玩笑了”） \n[01:32.34]言う間に足を取られ（道出这话的瞬间便已寸步难行） \n[01:35.16]K.O.(ノックアウト)偽装で（伪装出瞬间K.O.的表象） \n[01:37.83]"You lose" ふざけてる（"You lose" 开什么玩笑） \n[01:40.30]正々堂々を逃げたって 僕はここさ（就算堂堂正正地逃离 我也依然还在这里） \n[01:45.45]もう手遅れだね（已经太迟了呢） \n[01:48.93]"Yes you are kidding me" \n[01:51.52]守るべきはずの約束を（应当守护的约定） \n[01:56.58]その中で育ててきた希望を（孕育于其中的希望） \n[02:00.65]違反させちゃいけないんだ（万万不可将之违背） \n[02:05.17]Break Beat Bark 遠ざかって（Break Beat Bark 渐行渐远） \n[02:09.74]明日へルートがまた（那通往明日的路途） \n[02:12.12]ループみたくlong way round（仿佛又开始原地打转 long way round） \n[02:14.68]だけどwake up 朝が来て（不过 醒过来吧 早晨到来了） \n[02:19.80]"Hello my hope"変換不能な意志があれば（"Hello my hope" 若有坚定不移的意志） \n[02:24.73]君と僕で立ち向かう壁（你我一起携手面对那道高墙） \n[02:28.73]熱くなるでしょ? Heartbeat（心跳便会随之逐渐地升温吧?） \n[02:31.71]叫び出す 祈りを込めて（诚心祈愿 呼喊而出吧） \n[02:34.94]涙の落ちる音がした（泪水滴落的声响） \n[02:39.13]今も耳に響いてる（至今仍在耳畔回响） \n[02:43.90]音の速さで助けに行くよ（以音速前去拯救你） \n[02:58.25]強くなれ この振動（愈发强烈的这股振动） \n[03:03.33]誰かを救うため 戦い抜くために（是为了拯救某人 是为了奋战至终） \n[03:10.35]Break Beat Bark 見えてきた（Break Beat Bark 渐渐能看见了） \n[03:14.83]未来って（未来并不单纯） \n[03:15.97]単純じゃないダンジョンじゃない（却也不像迷宫般错综复杂） \n[03:18.50]Let’s see \n[03:19.82]そうさhead up すぐそこさ（没错 抬起头来吧 近在眼前了） \n[03:24.79]"Never give up" \n[03:26.18]パスワードはもう必要ないんだ（不再需要密码了） \n[03:29.84]君と僕の純粋すぎる理想（你我心中那过于纯粹的理想） \n[03:33.85]叶えなきゃないね? Heartbeat（我们必须要去实现它对吧? Heartbeat） \n[03:36.88]叫び出せ 願いの限り（将愿望的极限呼喊而出）',
        theme: '#0b2065'
    },
    {
        name: 'ワイルドローズ',
        artist: "May'n",
        url: 'https://drive.google.com/uc?export=download&id=1APZ-CPaM4puJSkDJ4kHnQmPrsxJkIpe4',
        cover: 'https://www.animelyrics.com/albums/jpop/mayn/0113a2c4f1ed50e60b79137cd0c5571a562e326f.jpg',
        lrc: '[00:13.10]低空で飛ぶアゲハ \n[00:17.70]風に煽られて \n[00:21.88]くるくる踊る \n[00:25.42]とっさに不安になって \n[00:29.97]君を引き寄せた午後 \n[00:36.66]ただ　ここにいると \n[00:39.94]そう伝えたくて \n[00:43.23]言葉を捜すけど \n[00:46.22]Ah　めまいがする \n[00:49.53]神様に \n[00:52.48]どんな罰を下されようとも \n[00:58.55]自分を騙すのは \n[01:01.19]もう止めよう \n[01:04.49]この唇が　手のひらが \n[01:07.76]眼差しが求めるのは \n[01:11.35]誰なのか今日まで \n[01:14.13]気づくのが怖かった \n[01:17.38]ユメも弱さも知りすぎて \n[01:20.07]近すぎて　傷つけあう \n[01:23.48]絶望に咲く \n[01:25.02]野薔薇のような恋だけど \n[01:29.32]忘れたくない　君のことを \n[01:42.33]地下鉄の出口から \n[01:46.94]あふれる甘くて \n[01:51.04]残酷なメモリー \n[01:54.65]余りにカンタンに \n[01:57.64]過去へと誘う \n[02:00.79]夏の終わり \n[02:05.78]それでも未来に \n[02:09.06]向かい歩いてる \n[02:12.42]どうして君なのだろう \n[02:17.25]それは多分 \n[02:18.40]今だって逢うたび \n[02:22.77]震え出すこの想い \n[02:27.77]拒んでた分だけ \n[02:30.46]欲しくなるよ \n[02:33.76]その唇が　手のひらが \n[02:36.99]眼差しが求めるのも \n[02:40.44]この身体であれば \n[02:43.39]この魂であれば \n[02:46.54]夜を纏った水色の触角を \n[02:50.39]ひき千切って \n[02:52.84]夕陽がふたり \n[02:54.29]隠してしまうその前に \n[02:58.41]君を抱きしめ \n[03:01.40]こう言うよ \n[03:04.61]二度とは淋しくさせないと \n[03:10.26]もしもあした \n[03:12.38]この世界が崩れ去り \n[03:16.88]偽りという鱗雲が \n[03:20.03]覆い尽したって \n[03:26.15]この唇が　手のひらが \n[03:29.34]眼差しが求めるのは \n[03:32.74]待ち疲れたように \n[03:35.64]静かにほほえむ君 \n[03:38.84]ユメも弱さも知りすぎて \n[03:41.62]近すぎて　傷つけあう \n[03:45.00]荒れ野にゆれる \n[03:46.61]野薔薇のような愛だけど \n[03:50.88]背を向けないで \n[03:53.83]息を殺して \n[03:56.87]泣きたくなるような \n[03:59.77]キスをしよう',
        theme: '#e6c5cd'
    },
    {
        name: 'My Days',
        artist: '鈴木このみ',
        url: 'https://drive.google.com/uc?export=download&id=1IdeRiWzT7KXMDxo60iZtbJdRO1jAMTMw',
        cover: 'https://lineimg.omusic.com.tw/img/album/1827658.jpg?v=20200409213429',
        lrc: '[00:00.91]My Days (《永远的7日之都》游戏主题曲) - 铃木木乃美 (鈴木このみ) \n[00:07.27]词：メイリア \n[00:09.68]曲：toku \n[00:13.87]夢と現実の曖昧 混ざり合って（梦与现实的暧昧 交错混杂） \n[00:18.79]融け出した黒が 飲み込んでいく（唯有咽下那融化而出的漆黑） \n[00:23.63]見上げた空はいつも 大きすぎて（抬头仰望 天空依旧辽阔无边） \n[00:28.45]ちっぽけなボクを 笑ってるようだ（仿佛在嘲弄着渺小无助的我） \n[00:33.40]意味の無いことなど（这世界上本没有什么） \n[00:35.83]１つも無いんだ（毫无意义的事） \n[00:38.21]失うことでしか（有些东西唯有失去之后） \n[00:40.27]手に入らないモノもあった（方能握入掌心） \n[00:42.91]いつか結びついて（总有一天 我们会找到） \n[00:46.92]「答え」に繋がっていくから（与之关联的"答案"） \n[00:51.84]止まることない悲しみ（跨越永无止境的） \n[00:54.41]越えていこう（哀恨情仇） \n[00:56.85]これはきっと終わりじゃなくて（这绝非终结） \n[00:59.11]始まりへと向かうcount down（而是奔赴全新开端的倒计时） \n[01:01.99]目指す未来は まだ掴めないけど（虽然还未紧握 我们期许的未来） \n[01:06.67]傷が増えた今日のボクは（今天的我们伤痕累累） \n[01:09.36]昨日のボクよりも（但比起昨日） \n[01:11.61]ほんの少しだけ（我们应该多少） \n[01:13.87]強くなれた気がした（有所成长） \n[01:16.43]何度でも何度でも（一次又一次） \n[01:18.22]立ち上がり 始めよう（我们重新站起 开始吧） \n[01:20.69]Gameのようにまた（如同游戏一般周而复始的世界） \n[01:22.94]繰り返す世界に終わりを（再度奔赴终焉吧） \n[01:35.53]夢に見た今日の再来 霞む記憶（梦中见过的今日再度造访 朦胧的记忆） \n[01:40.39]容赦ない黒に 飲み込まれた（被那残忍无情的漆黑 吞噬殆尽） \n[01:45.40]時はいつもどおり（时间一如往常） \n[01:49.42]残酷に廻り続ける（残酷地轮回无限） \n[01:54.17]永遠に続く筋書き破り捨てて（废弃掉那永恒不变的故事梗概） \n[01:59.63]自分自身を描いていこう（描绘属于我们 自己的传奇） \n[02:04.06]これはきっと終わりじゃなくて（这绝非终结） \n[02:06.44]始まりへと向かうcount down（而是奔赴全新开端的倒计时） \n[02:09.20]目指す未来は まだ掴めないけど（虽然还未紧握 我们期许的未来） \n[02:13.97]誰の物でもない（我明日的方向） \n[02:15.90]ボクの明日の行先が（不属于任何旁人） \n[02:18.85]消えちゃわないように（紧紧握住） \n[02:21.01]強く握りしめて（切莫让它化作泡影） \n[02:23.60]何度でも何度でも（一次又一次） \n[02:25.38]立ち上がり 始めよう（我们重新站起 开始吧） \n[02:27.92]Gameのようにまた（如同游戏一般周而复始的世界） \n[02:30.11]繰り返す世界に終わりを（再度奔赴终焉吧） \n[02:43.41]カミサマは気まぐれでイタズラ（神明随性而喜好恶作剧） \n[02:48.25]運命に惑わされない強さを（为了不被命运迷惑而变强） \n[02:53.22](Believe believe in my days) \n[02:57.26]ボクだけにしかできない『革命』を（掀起唯有我们方能驾驭的"革命"） \n[03:23.62]きっと終わりじゃなくて（这绝非终结） \n[03:25.48]始まりへと向かうcount down（而是奔赴全新开端的倒计时） \n[03:28.35]目指す未来は まだ掴めないけど（虽然还未紧握 我们期许的未来） \n[03:33.18]傷が増えた今日のボクは（今天的我们伤痕累累） \n[03:35.70]昨日のボクよりも（但比起昨日） \n[03:38.00]ほんの少しだけ（我们应该多少） \n[03:40.25]強くなれた気がした（有所成长） \n[03:42.78]何度でも何度でも（一次又一次） \n[03:44.57]立ち上がり進むよ（我们重新站起 前进吧） \n[03:47.00]また繰り返される日を（去终结那依旧周而复始的） \n[03:49.95]終わらせに行こう（日日夜夜） \n[03:52.41]奇跡を超えて今（超越奇迹） \n[03:54.83]生まれる世界を始めよう（迎来方才诞生的崭新世界吧）',
        theme: '#544093'
    },
    {
        name: 'Lemon',
        artist: '米津玄師',
        url: 'https://drive.google.com/uc?export=download&id=1CbWp3q5-a30unNqOpCiCJl_QoIbgSTxR',
        cover: 'https://upload.wikimedia.org/wikipedia/en/1/12/Kenshi_Yonezu_-_Lemon.png',
        lrc: '[00:00.00]Lemon - 米津玄師 (よねづ けんし) \n[00:00.53]词：米津玄師 \n[00:01.06]曲：米津玄師 \n[00:01.54]夢ならば（如果只是一场梦） \n[00:02.88]どれほどよかったでしょう（那该有多好） \n[00:06.88]未だにあなたのことを夢にみる（你依旧出现在我梦里） \n[00:12.41]忘れた物を取りに帰るように（就像取回遗忘的东西一样） \n[00:17.91]古びた思い出の埃を払う（把陈旧回忆上的尘埃拂去） \n[00:26.27]戻らない幸せがあることを（有些幸福再也无法重来） \n[00:31.73]最後にあなたが教えてくれた（这是最后你告诉我的） \n[00:37.25]言えずに隠してた昏い過去も（藏在心里的黑暗过去） \n[00:42.80]あなたがいなきゃ（没有了你） \n[00:44.92]永遠に昏いまま（也会永远黑暗） \n[00:48.57]きっともうこれ以上（我明白） \n[00:51.36]傷つくことなど（不会再有比这） \n[00:54.18]ありはしないとわかっている（更让人受伤的事了） \n[00:58.98]あの日の悲しみさえ（连那一天的悲伤） \n[01:01.74]あの日の苦しみさえ（连那一天的痛苦） \n[01:04.52]そのすべてを愛してた（那一切我都深爱着） \n[01:07.28]あなたとともに（连同你一起） \n[01:09.98]胸に残り離れない（留在我心间 挥之不去） \n[01:13.07]苦いレモンの匂い（苦涩的柠檬香） \n[01:15.84]雨が降り止むまでは帰れない（直到大雨停下为止都不会归去） \n[01:21.39]今でもあなたはわたしの光（时至今日你依然是我的光） \n[01:37.98]暗闇であなたの背をなぞった（黑暗中描摹着你的背影） \n[01:43.43]その輪郭を鮮明に覚えている（那轮廓我一直鲜明地牢记在心） \n[01:48.97]受け止めきれないものと（每当遇到） \n[01:52.20]出会うたび（我无法接受的事情） \n[01:54.50]溢れてやまないのは涙だけ（泪水就止不住地流淌） \n[02:00.32]何をしていたの（你在做什么） \n[02:03.16]何を見ていたの（在看着什么） \n[02:05.92]わたしの知らない横顔で（带着我所陌生的表情） \n[02:10.69]どこかであなたが今（如果此刻你也在某处） \n[02:13.43]わたしと同じ様な（同我一样） \n[02:16.31]涙にくれ（泪眼潸然） \n[02:17.64]淋しさの中にいるなら（身处寂寞之中） \n[02:21.71]わたしのことなどどうか（那么请你） \n[02:24.85]忘れてください（忘了我的一切吧） \n[02:27.60]そんなことを心から願うほどに（我发自内心这么希望） \n[02:33.13]今でもあなたはわたしの光（时至今日你依然是我的光） \n[02:41.64]自分が思うより（我比自己想象中） \n[02:47.19]恋をしていたあなたに（还要喜欢你） \n[02:52.72]あれから思うように（在那之后我便无法如想象般） \n[02:58.24]息ができない（自如地呼吸） \n[03:03.33]あんなに側にいたのに（明明曾与你那般靠近） \n[03:09.27]まるで嘘みたい（如今想来那么不真实） \n[03:14.40]とても忘れられない（唯一确定的是） \n[03:20.21]それだけが確か（至今我仍忘不了你） \n[03:30.81]あの日の悲しみさえ（连那一天的悲伤） \n[03:33.41]あの日の苦しみさえ（连那一天的痛苦） \n[03:36.22]そのすべてを愛してた（那一切我都深爱着） \n[03:38.97]あなたとともに（连同你一起） \n[03:41.67]胸に残り離れない（残留在我心间 挥之不去） \n[03:44.77]苦いレモンの匂い（苦涩的柠檬香） \n[03:47.61]雨が降り止むまでは帰れない（直到大雨停下为止都不会归去） \n[03:53.09]切り分けた果実の片方の様に（我们就像被分为两瓣的果实） \n[03:58.60]今でもあなたはわたしの光（时至今日你依然是我的光）',
        theme: '#bfdcda'
    },
    {
        name: 'Hacking to the Gate',
        artist: '伊藤香奈子',
        url: 'https://drive.google.com/uc?export=download&id=10SoFpZxTQaELkm3vq59rOcRRreuEW__j',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/5b650b1337564521c5a01360097d3acb.jpg',
        lrc: '[00:00.80]Hacking to the Gate - 伊藤加奈子 (いとうかなこ) \n[00:04.86]词：志倉千代丸 \n[00:07.09]曲：志倉千代丸 \n[00:11.65] \n[00:13.41]数十億もの鼓動の数さえ（纵使数十亿次的心跳悸动） \n[00:18.86]あなたには（对你而言） \n[00:20.76]瞬き程度の些事な等級（也不过是转瞬即逝的些微琐事） \n[00:25.57]過去に囚われて（无论执迷过去） \n[00:28.05]未来を嘆くも（还是叹息未来） \n[00:30.74]塵一つ（皆是不准有丝毫误算的） \n[00:32.59]誤算を許さぬ必然（必然） \n[00:36.47]『無限』に広がる夢も（"无限"膨胀的梦想） \n[00:40.23]描く未来も（与理想的未来） \n[00:42.82]僕達に許された（是我们应得的） \n[00:45.96]虚栄の権利（虚荣权利） \n[00:48.33]『有限』それは二つの（"有限" 那即是） \n[00:52.36]針が示す（两根针所指示） \n[00:54.78]残酷な約定と選択へ（残酷的约定与抉择） \n[00:59.19]Hacking to the gate \n[01:01.62]だからいま１秒ごとに（所以现在） \n[01:05.28]世界線を越えて（越过每一秒的世界线） \n[01:08.54]君のその笑顔守りたいのさ（只因想要守护你的笑容） \n[01:13.57]そしてまた悲しみの無い（于是又再堕入） \n[01:17.06]時間のループへと（没有悲伤的时间回流） \n[01:20.53]飲み込まれてゆく（孤独的观测者） \n[01:23.21]孤独の観測者（逐渐被吞噬） \n[01:27.78] \n[01:42.79]命の主張と無意味な証明（生命的论点 与无意义的证明） \n[01:48.27]あなたには（对你而言） \n[01:50.22]退屈しのぎに足らぬ滑稽（不过是连消遣也不足以的滑稽） \n[01:54.98]支配者きどりの（自称支配者的） \n[01:57.62]愚かな種族は（愚蠢种族） \n[02:00.18]うぬぼれた（陈列出狂莽自大的） \n[02:02.07]稚拙な定理を並べた（幼稚定理） \n[02:05.98]『無限』と信じた愛も（相信"无限"的爱） \n[02:09.74]空の彼方も（和天空的彼方） \n[02:12.24]僕達に示された（皆是我们眼前） \n[02:15.36]仮想の自由（虚拟的自由） \n[02:17.64]『有限』それは無慈悲に（"有限" 那即是） \n[02:21.77]時を刻み（让时间无情流逝） \n[02:24.26]明日さえも否定する選択へ（不惜否定明天的选择） \n[02:28.75]Hacking to the gate \n[02:31.17]いくつもの輝ける日々（几度闪耀的日子） \n[02:34.79]仲間との約束（与同伴的约定） \n[02:38.09]無かった事には（不能就这样） \n[02:40.69]してはいけない（敷衍了事） \n[02:43.07]そのために時を欺く（为此 面对欺骗时间） \n[02:46.58]残された仕掛けに（所剩下的装置） \n[02:49.96]もう迷いはない（孤独的观测者） \n[02:52.57]孤独の観測者（不会再迷惘） \n[02:57.34] \n[03:36.66]だからいま１秒ごとに（所以现在） \n[03:40.37]世界線を越えて（越过每一秒的世界线） \n[03:43.59]君のその笑顔守りたいのさ（只因想要守护你的笑容） \n[03:48.61]そしてまた悲しみの無い（于是又再堕入） \n[03:52.19]時間のループへと（没有悲伤的时间回流） \n[03:55.57]飲み込まれてゆく（孤独的观测者） \n[03:58.16]孤独の観測者（逐渐被吞噬）',
        theme: '#b09456'
    },
    {
        name: '小さな恋のうた',
        artist: 'コバソロ & 杏沙子',
        url: 'https://drive.google.com/uc?export=download&id=1QAQ6XgHgBq48PGwiodumfqhFCowBazxt',
        cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ae/93/23/ae932363-26c8-721b-140f-efc4a9e94742/22UMGIM36963.rgb.jpg/400x400cc.jpg',
        lrc: '[00:00.00]小さな恋のうた - Kobasolo (コバソロ)/七穂 \n[00:00.23]词：Kiyosaku Uezu \n[00:00.47]曲：MONGOL８００ \n[00:00.93]広い宇宙の数ある一つ（浩瀚的宇宙中有一个仅有的蓝色星球） \n[00:06.04]青い地球の広い世界で（在这个星球广阔的天地间） \n[00:11.27]小さな恋の思いは届く（我把小小的爱恋） \n[00:16.30]小さな島のあなたのもとへ（传达给住在小岛上的你） \n[00:24.23]あなたと出会い（与你相遇） \n[00:26.66]時は流れる（随着时间的流逝） \n[00:29.25]思いを込めた手紙もふえる（饱含思念的书信也在增加） \n[00:34.40]いつしか二人互いに響く（不知不觉间回响在我们两个人之间） \n[00:39.56]時に激しく（时而激烈） \n[00:42.11]時に切なく（时而悲伤） \n[00:44.80]響くは遠く（这种回响） \n[00:47.30]遥か彼方へ（传向遥远的远方） \n[00:49.94]やさしい歌は世界を変える（优美的歌声能够改变世界） \n[00:58.92]ほら \n[01:00.52]あなたにとって（对你来说） \n[01:03.13]大事な人ほど（最重要的人） \n[01:05.82]すぐそばにいるの（已经在你身边） \n[01:09.22]ただ（我只希望） \n[01:11.00]あなたにだけ（只希望） \n[01:13.52]届いて欲しい（你能听见） \n[01:16.15]響け恋の歌（这回响的恋之歌） \n[01:19.65]ほら \n[01:24.66]ほら \n[01:29.83]ほら \n[01:35.47]響け恋の歌（这回响的恋之歌） \n[01:37.72]あなたは気づく（你知道） \n[01:40.16]二人は歩く暗い道でも（即使我们走在漆黑的道路上） \n[01:45.36]日々照らす月（也有每天倾洒大地的月光） \n[01:48.03]握りしめた手（我们紧握的手） \n[01:50.50]離すことなく（一次也不会分开） \n[01:53.08]思いは強く永遠誓う（强烈的感情发誓永远不变） \n[01:58.29]永遠の淵（即使是深渊） \n[02:00.89]きっと僕は言う（我也会） \n[02:03.44]思い変わらず同じ言葉を（不假思索地说着同样的话语） \n[02:08.52]それでも足りず（但是这并不足够） \n[02:11.11]涙にかわり（我想把你的泪水） \n[02:13.81]喜びになり（变成喜悦） \n[02:16.33]言葉にできず（说不出话来的我） \n[02:18.93]ただ抱きしめる（我只想抱紧你） \n[02:21.49]ただ抱きしめる（只想抱紧你） \n[02:27.91]ほら \n[02:29.62]あなたにとって（对你来说） \n[02:32.26]大事な人ほど（最重要的人） \n[02:34.73]すぐそばにいるの（已经在你身边） \n[02:38.23]ただ（我只希望） \n[02:39.92]あなたにだけ（只希望） \n[02:42.58]届いて欲しい（你能听见） \n[02:45.17]響け恋の歌（这回响的恋之歌） \n[02:48.65]ほら \n[02:53.79]ほら \n[02:58.94]ほら \n[03:04.50]響け恋の歌（回响的恋之歌） \n[03:09.24]夢ならば覚めないで（如果是梦的话就不要醒来） \n[03:14.41]夢ならば覚めないで（如果是梦的话就不要醒来） \n[03:19.59]あなたと過ごした時（让与你共度的日子） \n[03:22.81]永遠の星となる（成为永远的闪亮之星） \n[03:29.94]ほら \n[03:31.59]あなたにとって（对你来说） \n[03:34.17]大事な人ほど（最重要的人） \n[03:36.74]すぐそばにいるの（已经在你身边） \n[03:40.19]ただ（我只希望） \n[03:41.93]あなたにだけ届いて欲しい（只希望你能听见） \n[03:47.18]響け恋の歌（这回响的恋之歌） \n[03:50.53]ほら \n[03:52.28]あなたにとって（对你来说） \n[03:54.81]大事な人ほど（最重要的人） \n[03:57.42]すぐそばにいるの（已经在你身边） \n[04:00.92]ただ（我只希望） \n[04:02.64]あなたにだけ（只希望） \n[04:05.11]届いて欲しい（你能听见） \n[04:07.79]響け恋の歌（这回响的恋之歌） \n[04:11.20]ほら \n[04:16.41]ほら \n[04:21.50]ほら \n[04:27.02]響け恋の歌（这回响的恋之歌）',
        theme: '#117cdc'
    },
    {
        name: 'あとひとつ',
        artist: 'コバソロ & こぴ',
        url: 'https://drive.google.com/uc?export=download&id=1uJafY4DsI1YDewaiq1I4iJM9Vbwu3Ku7',
        cover: 'https://i.scdn.co/image/ab67616d0000b2736101e08696469c595f25deee',
        lrc: '[00:00.79]あとひとつ - Kobasolo (コバソロ)/こぴ \n[00:03.51]词：FUNKY MONKEY BABYS/川村結花 \n[00:05.81]曲：FUNKY MONKEY BABYS/川村結花 \n[00:12.00]あと一粒の涙で ひと言の勇気で（再流下一滴泪水 再喊出一句勇气之言） \n[00:18.80]願いがかなう その時が来るって（愿望就会实现 那个时刻就会到来） \n[00:24.06]僕は信じてるから（我始终相信着这一点） \n[00:26.97]君もあきらめないでいて（请你也不要放弃） \n[00:31.01]何度でも この両手を あの空へ（向着那片天空伸出双臂吧） \n[00:49.69]あの日もこんな夏だった（那一日也是这样的夏天） \n[00:52.67]砂まじりの風が吹いてた（风混杂着沙子吹着） \n[00:55.74]グランドの真上の空（运动场正上方的天空） \n[00:58.22]夕日がまぶしくて（夕阳耀眼） \n[01:01.69]どこまで頑張ればいいんだ（努力到什么地步才好呢） \n[01:04.72]ぎゅっと唇を噛みしめた（我紧咬着嘴唇） \n[01:07.77]そんな時 同じ目をした（那个时候 同样的目光交汇） \n[01:10.40]君に出会ったんだ（与你相遇） \n[01:13.46]そう 簡単じゃないからこそ（是啊 正是因为不那么简单） \n[01:18.87]夢はこんなに輝くんだと（梦想才会显得如此闪耀） \n[01:25.30]そう あの日の君の言葉（是啊 那一天你的话语） \n[01:31.00]今でも胸に抱きしめてるよ（直到现在仍珍藏在我的心中） \n[01:37.00]あと一粒の涙で ひと言の勇気で（再流下一滴泪水 再喊出一句勇气之言） \n[01:43.90]願いがかなう その時が来るって（愿望就会实现 那个时刻一定会到来） \n[01:49.30]僕は信じてるから（我始终相信着这一点） \n[01:52.11]君もあきらめないでいて（请你也不要放弃） \n[01:56.04]何度でも この両手を あの空へ（不管多少次 向着那片天空伸出双臂吧） \n[02:04.13]のばして あの空へ（向着那片天空） \n[02:14.06]いつもどうしても素直になれずに（无论怎样 总是不能坦率地面对自我） \n[02:17.58]自信なんてまるで持てずに（完全无法保持自信） \n[02:20.81]校舎の裏側（在校舍的背侧行走） \n[02:22.56]人目を気にして歩いてた（介意着别人的目光） \n[02:26.84]誰かとぶつかりあうことを（无论和谁碰面） \n[02:29.85]心のどこかで遠ざけた（心中的某处却会躲避疏远） \n[02:32.89]それは本当の自分を（那是因为 只是展现真实的自我） \n[02:35.48]見せるのが怖いだけだったんだと（对我来说就已经很可怕了） \n[02:39.87]教えてくれたのは（教会我的） \n[02:43.88]君と過ごした今日までの日々（是直到今天为止 与你一起度过的岁月） \n[02:50.46]そう 初めて口に出来た（是的 是第一次说出口来） \n[02:56.17]泣きたいくらいの本当の夢を（想要哭出来的真正的梦想） \n[03:02.25]あとひとつの坂道を（若能再越过一个坡道） \n[03:05.85]ひとつだけの夜を（若能再熬过） \n[03:08.95]越えられたなら（一个黑夜） \n[03:11.28]笑える日がくるって（欢笑的日子就会到来） \n[03:14.26]今日も信じてるから（今天我依然坚信着） \n[03:17.15]君もあきらめないでいて（请你也不要放弃） \n[03:21.13]何度でも この両手を あの空へ（不管多少次 向着那片天空伸出双臂吧） \n[03:38.98]あつくなっても無駄なんて言葉（那些"即便扬起斗志也是徒劳"的话语） \n[03:43.84]聞き飽きたよ（已经听腻了） \n[03:46.72]もしもそうだとしても（即便如此） \n[03:51.04]抑えきれないこの気持ちを（若将这抑制不住的感情） \n[03:55.96]希望と呼ぶなら（叫做希望的话） \n[03:59.07]いったい（究竟） \n[04:00.53]誰が止められると言うのだろう（又有谁能我们阻挡前行呢） \n[04:09.04]あと一粒の涙が ひと言の勇気が（再流下一滴泪水 再喊出一句勇气之言） \n[04:15.77]明日を変えるその時を見たんだ（就会见到那改变未来的时刻） \n[04:21.11]なくしかけた光（你让我回忆起） \n[04:24.07]君が思い出させてくれた（曾失去的光辉） \n[04:28.01]あの日の景色 忘れない（那一天的景色无法忘怀） \n[04:33.42]あと一粒の涙で ひと言の勇気で（再流下一滴泪水 再喊出一句勇气之言） \n[04:40.10]願いがかなう その時が来るって（愿望就会实现 那个时刻一定会到来） \n[04:45.34]僕は信じてるから（我始终相信着这一点） \n[04:48.38]君もあきらめないでいて（请你也不要放弃） \n[04:52.29]何度でも この両手を あの空へ（不管多少次 向着那片天空伸出双臂吧） \n[05:00.32]のばして あの空へ（向着那片天空）',
        theme: '#55524b'
    },
    {
        name: 'キセキ',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=1Irk0h8HwmgShTCuoJvI_SUfI_nwqy1JN',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: '[00:00.84]キセキ - 高橋李依 (たかはし りえ) \n[00:10.97]词：GReeeeN \n[00:14.54]曲：GReeeeN \n[00:20.29] \n[00:20.91]明日 今日よりも好きになれる（明天会比今天更喜欢你） \n[00:26.67]溢れる想いが止まらない（满溢的爱意已无法停止） \n[00:31.49]今もこんなに好きでいるのに（现在虽然如此喜欢你） \n[00:37.21]言葉に出来ない（但却无法用语言表述） \n[00:42.08]君のくれた日々が積み重なり（你给予我的岁月沉淀累积） \n[00:47.84]過ぎ去った日々（逝去的岁月） \n[00:49.93]２人歩いた『軌跡』（记录着我们一路走来的轨迹） \n[00:52.87]僕らの出逢いがもし偶然ならば？（我们的相遇是偶然） \n[00:58.66]運命ならば？（还是命运） \n[01:00.59]君に巡り合えた それって『奇跡』（能够与你邂逅就已是莫大的奇迹） \n[01:04.25]２人寄り添って歩いて（两个人并肩而行） \n[01:06.77]永久の愛を形にして（形成永恒的爱情） \n[01:09.61]いつまでも君の横で（无论何时） \n[01:11.92]笑っていたくて（都想要在你的身边笑着） \n[01:14.05]アリガトウや（谢谢或是我爱你） \n[01:15.58]Ah 愛してるじゃまだ足りないけど（都不足以传达情意） \n[01:20.85]せめて言わせて 「幸せです」と（请再让我说一句我很幸福） \n[01:24.87]いつも君の右の手の平を（我总是将你的右手） \n[01:30.55]ただ僕の左の手の平が（用我的左手） \n[01:35.51]そっと包んでくそれだけで（轻轻地包裹着 仅仅如此） \n[01:41.25]ただ愛を感じていた（便能全心地感受到彼此间的爱意） \n[01:46.13]日々の中で 小さな幸せ 見つけ重ね（岁月长河中发现的一个又一个小确幸） \n[01:53.91]ゆっくり歩いた『軌跡』（那是你我缓步前行的轨迹） \n[01:56.79]僕らの出会いは大きな世界で（我们的相遇不过是） \n[02:02.51]小さな出来事（偌大世界中的沧海一粟） \n[02:05.27]巡り合えた それって『奇跡』（能够与你邂逅就已是莫大的奇迹） \n[02:08.21]うまく行かない日だって（不顺利的日子） \n[02:10.81]２人で居れば晴れだって（两个人在一起就会放晴） \n[02:13.58]強がりや寂しさも 忘れられるから（逞强或是寂寞都可以全部忘却） \n[02:18.13]僕は君でなら 僕で居れるから（正因为你 我才能做我自己） \n[02:23.39]だからいつも そばにいてよ（所以一直留在我身边吧） \n[02:26.42]『愛しい君へ』（致我心爱的你） \n[02:28.31]２人フザけあった帰り道（两个人回家路上的嬉闹） \n[02:30.80]それも大切な僕らの日々（也是我们重要的时光） \n[02:33.41]「想いよ届け」と伝えた時に（传达情意的时刻） \n[02:36.12]初めて見せた表情の君（你第一次流露出那样的表情） \n[02:38.81]少し間が空いて 君がうなずいて（稍微有些迟疑你还是点头答应） \n[02:41.43]僕らの心 満たされてく愛で（我们的心中 被爱情填满） \n[02:44.49]ぼくらまだ旅の途中で（我们尚在旅途之中） \n[02:46.80]またこれから先も（自此开始） \n[02:48.33]何十年続いていけるような未来へ（还有几十年的时光向着延续的未来行去） \n[03:01.24]例えばほら 明日を見失いそうに（即便有时候会看不见彼此的明天） \n[03:08.73]僕らなったとしても（也没有关系） \n[03:10.90]２人寄り添って歩いて（两个人并肩而行） \n[03:13.42]永久の愛を形にして（形成永恒的爱情） \n[03:16.23]いつまでも君の横で（无论何时） \n[03:18.55]笑っていたくて（都想要在你的身边欢笑） \n[03:20.74]アリガトウや（谢谢或是我爱你） \n[03:22.25]Ah 愛してるじゃまだ足りないけど（都不足以传达情意） \n[03:27.50]せめて言わせて 「幸せです」と（请再让我说一句我很幸福） \n[03:32.15]うまく行かない日だって（不顺利的日子） \n[03:34.78]２人で居れば晴れだって（两个人在一起就会放晴） \n[03:37.61]喜びや悲しみも 全て分け合える（喜悦或是悲伤全部一起分享） \n[03:42.16]君がいるから 生きていけるから（正因为有你 我才有了活下去的动力） \n[03:47.46]だからいつも そばにいてよ（所以一直留在我身边吧） \n[03:50.41]『愛しい君へ』 最後の一秒まで（致我心爱的你 让我们陪伴彼此到生命结束的那一刻） \n[04:07.71]明日 今日より笑顔になれる（明天一定会绽放比今天更灿烂的笑颜） \n[04:13.17]君がいるだけで そう思えるから（只要有你在 我就会这样想） \n[04:18.16]何十年 何百年 何千年 時を超えよう（无论是几十年 几百年 还是几千年） \n[04:23.92]君を愛してる（我愿超越时光 给你矢志不渝的爱）',
        theme: '#f8e7aa'
    },
    {
        name: '小さな恋のうた',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=1y1zAUF6qxyAAPoZX2pgUgdBNw3pkBbih',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: '[00:00.00]小さな恋のうた (小小恋歌) - 高橋李依 (たかはし りえ) \n[00:00.18]词：Kiyosaku Uezu \n[00:00.41]曲：MONGOL800 \n[00:01.01]広い宇宙の数ある一つ（浩瀚的宇宙中唯一的蓝色星球） \n[00:05.33]青い地球の広い世界で（在这个星球广阔的天地间） \n[00:09.90]小さな恋の思いは届く（我把小小的爱恋） \n[00:14.64]小さな島のあなたのもとへ（传达给住在小岛上的你） \n[00:19.57] \n[00:20.74]あなたと出会い（与你相遇） \n[00:22.84]時は流れる（随着时间的流逝） \n[00:25.20]思いを込めた手紙もふえる（饱含思念的书信也在增加） \n[00:29.80]いつしか二人互いに響く（不知何时起温柔的歌声） \n[00:34.50]時に激しく（时而激烈） \n[00:36.83]時に切なく（时而悲伤） \n[00:39.32]響くは遠く（回响在我们之间） \n[00:41.57]遥か彼方へ（传向遥远的远方） \n[00:43.89]やさしい歌は世界を変える（去改变这个世界） \n[00:52.01]ほら \n[00:53.56]あなたにとって（对你来说） \n[00:55.84]大事な人ほど（最重要的人） \n[00:58.28]すぐそばにいるの（已经在你身边） \n[01:01.42]ただ（只希望） \n[01:02.88]あなたにだけ届いて欲しい（你能听见） \n[01:07.69]響け恋の歌（这回响的恋之歌） \n[01:10.89]ほら \n[01:15.44]ほら \n[01:20.19]ほら \n[01:25.21]響け恋の歌（这回响的恋之歌） \n[01:27.67]あなたは気づく（你知道） \n[01:29.49]二人は歩く暗い道でも（即使我们走在漆黑的道路上） \n[01:34.19]日々照らす月（也有每天倾洒大地的月光） \n[01:36.54]握りしめた手（我们紧握的手） \n[01:38.92]離すことなく（一次也不会分开） \n[01:41.24]思いは強く（强烈的感情） \n[01:43.58]永遠誓う（发誓永远不变） \n[01:45.91]永遠の淵（即使是深渊） \n[01:48.26]きっと僕は言う（我也始终如初） \n[01:50.68]思い変わらず同じ言葉を（说出同样的话语） \n[01:55.27]それでも足りず（但是这并不足够） \n[01:57.66]涙にかわり（我想把你的泪水） \n[01:59.89]喜びになり（变成喜悦） \n[02:02.19]言葉にできず（不善言辞的我） \n[02:04.60]ただ抱きしめる（只想抱紧你） \n[02:06.95]ただ抱きしめる（只想抱紧你） \n[02:12.85]ほら \n[02:14.32]あなたにとって（对你来说） \n[02:16.62]大事な人ほど（最重要的人） \n[02:18.97]すぐそばにいるの（已经在你身边） \n[02:22.23]ただ（我只希望） \n[02:23.67]あなたにだけ届いて欲しい（只希望你能听见） \n[02:28.44]響け恋の歌（这回响的恋之歌） \n[02:31.62]ほら \n[02:36.20]ほら \n[02:40.89]ほら \n[02:46.02]響け恋の歌（这回响的恋之歌） \n[02:51.28] \n[02:52.67]夢ならば覚めないで（如果是梦的话就不要醒来） \n[02:56.08] \n[02:57.27]夢ならば覚めないで（如果是梦的话就不要醒来） \n[03:01.11] \n[03:02.05]あなたと過ごした時（让与你共度的日子） \n[03:04.96]永遠の星となる（成为永远的闪亮之星） \n[03:11.60]ほら \n[03:12.90]あなたにとって（对你来说） \n[03:15.27]大事な人ほど（最重要的人） \n[03:17.63]すぐそばにいるの（已经在你身边） \n[03:20.81]ただ（我只希望） \n[03:22.21]あなたにだけ届いて欲しい（只希望你能听见） \n[03:26.94]響け恋の歌（这回响的恋之歌） \n[03:30.21]ほら \n[03:31.60]あなたにとって（对你来说） \n[03:33.90]大事な人ほど（最重要的人） \n[03:36.26]すぐそばにいるの（已经在你身边） \n[03:39.54]ただ（我只希望） \n[03:40.95]あなたにだけ届いて欲しい（只希望你能听见） \n[03:45.68]響け恋の歌（这回响的恋之歌） \n[03:49.00]ほら \n[03:53.49]ほら \n[03:58.21]ほら \n[04:03.25]響け恋の歌（这回响的恋之歌）',
        theme: '#ed885b'
    },
    {
        name: '言わないけどね。',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=13OBc-0kZRFaw10iEUlmeEhLNoteYC7hF',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: '[00:00.00]言わないけどね。 (虽然不会说出口。) (《擅长捉弄的高木同学 第二季》TV动画片尾曲) - 高橋李依 (たかはし りえ) \n[00:00.51]词：大原ゆい子 \n[00:00.60]曲：大原ゆい子 \n[00:00.70]勘違いされちゃったっていいよ（就算被误会了也没关系） \n[00:04.52]君とならなんて（就算我想和你在一起） \n[00:06.64]思ってったって言わないけどね（我也不会说出口） \n[00:09.73]近づく空の香りを（希望在你的身旁） \n[00:14.26]隣で感じていたいの（感受着靠近天空的香气） \n[00:28.85]校庭で君のことを（我最先在校园里） \n[00:32.53]一番に見つけて今日は（发现了你） \n[00:37.23]なんて話しかけようか（今天要跟你说些什么好呢） \n[00:40.31]ちょっと考えるの楽しくて（光是想一下就觉得很开心） \n[00:45.61]風に揺らされるカーテン（窗帘在风中摇曳） \n[00:49.19]不意打ちに当たる日差し（阳光不经意地照射进来） \n[00:53.90]眩しそうな顔を笑ったら（我若嘲笑你那耀眼般的面容） \n[00:58.05]照れて伏せちゃうのね（你就会害羞地低下头） \n[01:02.49]憂うつなテストも（令人忧郁的考试） \n[01:06.72]吹き飛ばせるような（也好像烟消云散一般） \n[01:10.88]ねえ（呐） \n[01:11.82]二人で秘密の約束をしたいなぁ（我提议） \n[01:16.42]って提案です（希望我们能偷偷地做个约定） \n[01:18.41]勘違いされちゃったっていいよ（就算被误会了也没关系） \n[01:22.28]君とならなんて（就算我想和你在一起） \n[01:24.36]思ってったって言わないけどね（我也不会说出口） \n[01:27.48]近付く空の香りを（希望在你的身旁） \n[01:31.97]隣で感じていたいの（感受着靠近天空的香气） \n[01:52.38]席替えが嫌だなんて（或许只有我自己） \n[01:56.08]思うのは私だけかな（讨厌换座位吧） \n[02:00.68]君の隣じゃないなら（如果不是坐在你的身边） \n[02:03.84]きっと少し退屈な日々ね（每一天定会有些无聊呢） \n[02:09.05]可愛くない落書きや（我讨厌你察觉不到） \n[02:12.60]真剣な表情にも（那不可爱的涂鸦） \n[02:17.35]気付けないなんて嫌なのよ（还有我认真的表情） \n[02:21.50]それだけじゃないけど（还不只是这些呢） \n[02:25.94]外を眺めるフリ 横顔を見ていた（我假装眺望窗外 实际上是在注视着你的侧脸） \n[02:34.37]ねえ（呐） \n[02:35.30]君の心の中覗いてみたいなぁ（我希望试着） \n[02:39.81]って思ってます（窥探你的心） \n[02:41.91]勘違いされちゃったっていいの（就算让你产生误会也没关系） \n[02:45.68]特別だなんて（就算我认为你很特别） \n[02:47.85]思ってったって言わないけどね（我也不会说出口） \n[02:50.95]不思議なままの関係（能将这种一直不可思议的关系） \n[02:55.11]変われる時は 来るのかなぁ（改变的那一刻是否会到来呢） \n[03:16.47]学校じゃ話せない事も（有很多在学校里） \n[03:21.27]いっぱいあるの（无法讲的事情） \n[03:23.64]それが何なのか 知りたいなら私と（那会是什么呢 如果想知道的话） \n[03:32.72]いつか制服じゃない（就和我一起） \n[03:35.88]君の事もっと（想要看到某天） \n[03:37.92]見たいなんて言わないけどね（你不穿校服的模样 但这种话我不会说出口） \n[03:41.05]会いたいの代わりの言葉（我一直在寻找别的话语） \n[03:45.52]探しているの（取代那句我想见你） \n[03:48.75]勘違いされちゃってもいいよ（就算被误会了也没关系） \n[03:52.53]君とならなんて（就算我想和你在一起） \n[03:54.60]思ってったって言わないけどね（我也不会说出口） \n[03:57.74]机の距離よりもっと（我希望） \n[04:02.28]近くに感じていたいの（在比书桌还要近的距离） \n[04:09.31]君をね（感受着你）',
        theme: '#f8e7aa'
    },
    {
        name: '愛唄',
        artist: '高橋李依',
        url: 'https://drive.google.com/uc?export=download&id=1pDg6f6wdl4p6RPbvC7rJdq-oxfB3AGii',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: '[00:00.00]愛唄 - 高橋李依 (たかはし りえ) \n[00:03.97]词：GReeeeN \n[00:07.94]曲：GReeeeN \n[00:11.92]「ねえ大好きな君へ」（给最爱的你） \n[00:14.40]笑わないで聞いてくれ（不要笑 请听我说） \n[00:16.71] \n[00:17.29]「愛してる」だなんて（我爱你这句话） \n[00:20.11]クサいけどね（虽是陈词滥调） \n[00:22.57]だけどこの言葉以外（但是除此之外） \n[00:25.71]伝える事が出来ない（我不知道该对你说什么才好） \n[00:28.54]ほらね（你看吧） \n[00:29.29]またバカにして笑ったよね（你又在笑我笨了） \n[00:34.07]君の選んだ人生は（你真的要选择我） \n[00:38.31]僕で良かったのか?（与你共度余生吗） \n[00:42.50]なんて分からないけど（虽然我不太确定） \n[00:48.40]ただ泣いて笑って（但在泪水与笑脸） \n[00:51.23]過ごす日々に（相伴的日子里） \n[00:54.06]隣に立って居れることで（留在你身边） \n[00:59.79]僕が生きる意味になって（就是我生存的意义） \n[01:05.34]君に捧ぐこの愛の唄（献给你 这首爱之歌） \n[01:13.59] \n[01:22.53]「ねえあの日の僕ら（那一天我们） \n[01:24.91]何の話をしてた?」（说了些什么？） \n[01:27.80]初めて逢った日によそよそしく（最初相逢时的冷淡） \n[01:33.20]あれから色々あって（自那以后经历了许多） \n[01:36.31]時にはケンカもして（时不时的也会有争吵） \n[01:39.17]解りあうためのトキ過ごしたね（都是为了相互理解的这一刻） \n[01:43.97] \n[01:44.51]この広い僕ら空の下（在广阔的天空之下） \n[01:49.60] \n[01:50.13]出逢って恋をしていつまでも（相遇相爱直到永远） \n[01:58.90]ただ泣いて笑って（在泪水与笑脸） \n[02:01.75]過ごす日々に（相伴的日子里） \n[02:04.62]隣に立って居れることで（留在你身边） \n[02:10.31]君と生きる意味になって（就是与你一起生活的意义） \n[02:15.95]君に捧ぐこの愛の唄（献给你 这首爱之歌） \n[02:21.83]いつも迷惑をかけてゴメンネ（总是给你添麻烦 真抱歉） \n[02:24.90]密度濃い時間を過ごしたね（度过如胶似漆的甜蜜时光） \n[02:27.63]僕ら２人日々を刻み（铭刻属于我们二人的岁月） \n[02:30.37]作り上げてきた想いつのり（日积月累的爱恋愈加深刻） \n[02:33.11]ヘタクソな唄を君に贈ろう（将这首笨拙的歌曲送给你） \n[02:35.82]「めちゃくちゃ好きだ」と（我超级喜欢你） \n[02:37.57]神に誓おう（我向神明起誓） \n[02:38.74]これからも君の手を握ってるよ（从此以后也会紧握着你的手） \n[02:44.17]僕の声が続く限り（只要我还能发出声音） \n[02:49.97]隣でずっと愛を唄うよ（就会在你身边一直歌唱爱情） \n[02:55.64]歳をとって声が枯れてきたら（当我老了 声音嘶哑） \n[03:02.12]ずっと手を握るよ（也会一直紧握你的手） \n[03:06.77]ただアリガトウじゃ（简短的一句谢谢） \n[03:09.53]伝えきれない（无法传达我的爱） \n[03:11.87] \n[03:12.38]泣き笑いと悲しみ喜びを（余生我们也要） \n[03:15.58]共に分かち合い（一起哭一起笑） \n[03:17.17]生きて行こう（一起分享悲伤和喜悦） \n[03:18.51]いくつもの夜を越えて（度过无数个夜晚） \n[03:23.26]僕は君と愛を唄おう（一起唱起这首爱之歌）',
        theme: '#ed885b'
    },
    {
        name: '奏(和聲版)',
        artist: '高橋李依 x 雨宫天',
        url: 'https://drive.google.com/uc?export=download&id=1c1YrHvdWhUF-ZMYEyxqQq5eg8Ce63B3A',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: '[00:00.86]奏(かなで) - 高橋李依 (たかはし りえ) \n[00:13.05]词：大橋卓弥/常田真太郎 \n[00:20.32]曲：大橋卓弥/常田真太郎 \n[00:42.00]改札の前つなぐ手と手（当我牵着你的手走到检票口） \n[00:47.77]いつものざわめき 新しい風（一如既往的喧闹 清新怡人的微风） \n[00:54.53]明るく見送るはずだったのに（本想带着轻快心情为你送行） \n[01:00.77]うまく笑えずに君を見ていた（却只能强颜欢笑 只能痴痴望着你） \n[01:08.77]君が大人になってくその季節が（希望你在长大成人的季节里） \n[01:15.16]悲しい歌で溢れないように（永远不会与悲伤的歌声相伴） \n[01:21.40]最後に何か君に伝えたくて（好想在最后再对你说点什么） \n[01:27.40]「さよなら」に代わる言葉を（却始终找不到话语） \n[01:32.64]僕は探してた（代替那句再见） \n[01:41.13]君の手を引くその役目が（在人生路上永远牵起你的手） \n[01:47.20]僕の使命だなんて そう思ってた（原本一直认为那是属于我的使命） \n[01:53.54]だけど今わかったんだ（此刻我才明白） \n[01:56.73]僕らならもう（如今的我们） \n[01:59.83]重ねた日々がほら 導いてくれる（早已在点滴往日中找到各自的路） \n[02:07.91]君が大人になってくその時間が（想必在你长大成人的时光里） \n[02:14.28]降り積もる間に僕も変わってく（我也会随着时光流逝而改变） \n[02:20.60]たとえばそこにこんな歌があれば（如果到那时还能想起这首歌） \n[02:26.60]ふたりはいつも（相信我们无论何时） \n[02:29.60]どんな時もつながっていける（心都连在一起） \n[03:05.27]突然ふいに鳴り響くベルの音（忽然之间发车的铃声响起） \n[03:11.97]焦る僕 解ける手 離れてく君（焦急的我 松开的手 渐渐远去的你） \n[03:18.43]夢中で呼び止めて 抱き締めたんだ（不顾一切地呼唤 最后紧紧地相拥） \n[03:24.71]君がどこに行ったって（无论你走到哪里） \n[03:27.05]僕の声で守るよ（我都会用歌声守护你） \n[03:35.65]君が僕の前に現れた日から（从你出现在我眼前的那天起） \n[03:42.35]何もかもが違くみえたんだ（我的整个世界就已焕然一新） \n[03:48.56]朝も光も涙も 歌う声も（无论清晨还是阳光 无论泪水还是歌声） \n[03:54.62]君が輝きをくれたんだ（全都因你而绽放着光彩） \n[04:01.21]抑えきれない思いを（用歌声载满） \n[04:04.50]この声に乗せて（按捺不住的思念） \n[04:07.81]遠く君の街へ届けよう（放飞到遥远某处的你的身边） \n[04:14.24]たとえばそれがこんな歌だったら（如果远方的你也听见这首歌） \n[04:20.26]ぼくらは何処にいたとしても（相信我们无论何地） \n[04:25.47]つながっていける（都能心心相印）',
        theme: '#a68461'
    },
    {
        name: '生きていたんだよな',
        artist: 'あいみょん',
        url: 'https://drive.google.com/uc?export=download&id=1IggcHU8UHKOfVvKlxgXv8zqZ_ywc2JVx',
        cover: 'https://c-cl.cdn.smule.com/rs-s79/arr/42/5e/937aa21e-3491-4122-ac03-daebcc96c421.jpg',
        lrc: '[00:00.35]生きていたんだよな (她曾活过啊) (《只想住在吉祥寺吗?》日剧片头曲) - あいみょん \n[00:05.20]词：あいみょん \n[00:05.90]曲：あいみょん \n[00:26.59]二日前このへんで（两天前这里附近） \n[00:27.45]飛び降り自殺した人の（有人跳楼自杀了） \n[00:28.81]ニュースが流れてきた（电视里播着这样一则新闻） \n[00:30.15]血まみれセーラー（满是血迹的水手服） \n[00:31.24]濡れ衣センコー（被冤枉的老师） \n[00:32.18]たちまちここらはネットの餌食（短时间内成为了网上的热议） \n[00:35.26]「危ないですから（“这里很危险） \n[00:36.08]離れてください」（请大家让开”） \n[00:37.03]そのセリフが集合の合図なのにな（那句话反而引来无数的围观群众） \n[00:39.10]馬鹿騒ぎした奴らが（他们炸开了锅似的） \n[00:40.09]アホみたいに撮りまくった（掏出手机拍下照片） \n[00:41.51]冷たいアスファルトに流れる（无声的血） \n[00:42.86]あの血の何とも言えない（流淌在冰冷的沥青上） \n[00:43.76]赤さが綺麗で綺麗で（那鲜红色是那样美丽） \n[00:48.00]泣いてしまったんだ（哭泣着） \n[00:50.25]泣いてしまったんだ（哭泣着） \n[00:52.39]何にも知らない（而显像管外侧的人） \n[00:53.40]ブラウン管の外側で（根本对此一无所知） \n[00:56.16]生きて生きて生きて生きて生きて（她活过 她活过 她活过 她活过 她活过） \n[01:00.44]生きて生きて生きていたんだよな（她活过 她活过 她也曾活过啊） \n[01:04.74]最後のサヨナラは他の誰でもなく（最后的那声再见不为任何人） \n[01:09.71]自分に叫んだんだろう（只为了自己而喊） \n[01:16.24]彼女が最後に流した涙（女孩最后流下的眼泪） \n[01:18.19]生きた証の赤い血は（是证明她活过的鲜血） \n[01:19.36]何も知らない大人たちに（最后却在短短的两秒钟之内） \n[01:20.73]二秒で拭き取られてしまう（就被陌生的大人清理干净了） \n[01:25.07]立ち入り禁止の黄色いテープ（贴上禁止入内的黄色胶带） \n[01:26.86]「ドラマでしかみたことなーい」（听见人们在议论纷纷地说） \n[01:28.63]そんな言葉が飛び交う中で（这种情景只在电视上看到过） \n[01:29.96]いま彼女はいったい何を（而此时此刻这女孩） \n[01:31.85]思っているんだろう（到底在想着什么呢） \n[01:33.34]遠くで遠くで（在远方 远方） \n[01:37.96]泣きたくなったんだ（突然好想哭泣） \n[01:40.16]泣きたくなったんだ（好想哭泣） \n[01:42.27]長いはずの一日がもう暮れる（原本漫长的一天却已日暮西山） \n[01:45.84]生きて生きて生きて生きて生きて（她活过 她活过 她活过 她活过 她活过） \n[01:50.10]生きて生きて生きていたんだよな（她活过 她活过 她也曾活过啊） \n[01:54.49]新しい何かが始まる時（当迎来一个新的开始之时） \n[01:59.52]消えたくなっちゃうのかな（可能只会想让自己消失吧） \n[02:05.73]「今ある命を（说什么把握当下） \n[02:07.20]精一杯生きなさい」なんて（生命要活得精彩） \n[02:09.05]綺麗事だな（只是漂亮话罢了） \n[02:10.21]精一杯勇気を振り絞って（拿出全部的勇气） \n[02:12.59]彼女は空を飛んだ（她纵身一跃飞过天空） \n[02:14.57]鳥になって雲をつかんで（成了飞鸟抓住云彩） \n[02:16.76]風になって遥遠くへ（化为风 飞向远方） \n[02:19.33]希望を抱いて飛んだ（她怀抱希望纵身一跃） \n[02:24.78]生きて生きて生きて生きて生きて（她活过 她活过 她活过 她活过 她活过） \n[02:29.01]生きて生きて生きていたんだよな（她活过 她活过 她也曾活过啊） \n[02:33.56]新しい何かが始まる時（当迎来一个新的开始之时） \n[02:38.39]消えたくなっちゃうのかな（可能只会想让自己消失吧） \n[02:42.05]生きて生きて生きて生きて生きて（她活过 她活过 她活过 她活过 她活过） \n[02:46.35]生きて生きて生きていたんだよな（她活过 她活过 她也曾活过啊） \n[02:50.76]最後のサヨナラは（最后的那声再见） \n[02:52.99]他の誰でもなく（不为任何人） \n[02:55.77]自分に叫んだんだろう（只为了自己而喊） \n[03:01.82]サヨナラサヨナラ（再见 永别了）',
        theme: '#df192b'
    },
    {
        name: '空の青さを知る人よ',
        artist: 'あいみょん',
        url: 'https://drive.google.com/uc?export=download&id=1OEJ7M3mCmHorNihCskaEKsIVH-ofDky_',
        cover: 'https://cdn.kdkw.jp/cover_1000/321906/321906000047.jpg',
        lrc: '[00:00.73]空の青さを知る人よ (知晓天空之蓝的人啊) - あいみょん \n[00:06.02]词：あいみょん \n[00:07.24]曲：あいみょん \n[00:11.04]全然好きじゃなかった（完全一点也不喜欢） \n[00:13.49] \n[00:14.51]ホラー映画とキャラメル味のキス（恐怖电影和奶糖味的吻） \n[00:19.36] \n[00:19.95]全然好きになれなかった（完全喜欢不起来） \n[00:23.27]それなのにね（可是） \n[00:25.54]今は悲鳴をあげながら（如今我却一边发出悲鸣） \n[00:29.45]君の横顔を探している（一边寻找你的侧脸） \n[00:37.23]空虚な心の落とし穴（内心里空虚的陷阱） \n[00:41.48]暗すぎてなにも見えない（太过昏暗什么也看不见） \n[00:44.89] \n[00:46.14]根拠なんて一つもないのにさ（明明毫无根据） \n[00:50.38]身体が走り出してく（身体却拔足狂奔） \n[00:56.64] \n[00:57.60]赤く染まった空から（从浸染赤红的天空中） \n[01:02.05]溢れ出すシャワーに打たれて（漫出淋浴般的雨水） \n[01:06.14]流れ出す 浮かび上がる（缓缓流淌 渐渐浮现出） \n[01:10.46]一番弱い自分の影（最软弱的自己的身影） \n[01:15.37]青く滲んだ思い出 隠せないのは（渗透着青蓝的回忆 之所以难以隐藏） \n[01:23.46]もう一度（是因为） \n[01:25.70]同じ日々を 求めているから（还在渴望着那同一段时光） \n[01:33.36]全然好きじゃなかった（完全一点也不喜欢） \n[01:36.66]ほら あの呼び方（那个称呼） \n[01:38.89]漫画の主人公みたいで（就像漫画的主角一样） \n[01:42.22]全然好きになれなかったんだ（我完全喜欢不起来） \n[01:45.51]それなのにね（然而） \n[01:47.76]今も似た言葉に身体が動くよ（至今我听到相似的词句仍会有所反应） \n[01:53.90] \n[01:54.43]皮肉な思い出なのさ（真是讽刺的回忆） \n[01:59.50]何回も右往左往してみても（无数次东奔西跑努力尝试） \n[02:03.72]暗すぎて何も見えない（却因为太过昏暗什么也看不见） \n[02:08.32]そうかいまだ隠れているのかい（是吗 又要藏起来了吗） \n[02:12.24]飛び出しておいでメモリー（记忆啊快飞奔到我的身边来吧） \n[02:19.84]高く掲げた掌（我确确实实感到） \n[02:24.22]届く気がしたんだ確かに（高举的手掌能够触及到那天空） \n[02:28.35]回り出す襲いかかる（周而复始 那一个个恶魔模样的人） \n[02:32.54]悪魔の顔した奴らが（又朝我侵袭而来） \n[02:36.75] \n[02:37.62]会いたい人に会えない（心心念念的人却始终都见不到） \n[02:41.93]そんな悪夢を雲に変えて（将那样的噩梦变成云朵） \n[02:47.79]食べてやるよ 悲しくなるから（我来把它吃掉 这样你就不会难过悲伤了） \n[02:57.34]いつもいつもいつもいつもいつも（总是总是总是总是总是） \n[02:59.43]君が君が君が君が（由你由你由你由你） \n[03:01.68]最初にいなくなってしまう（第一个消失不见） \n[03:06.25]なんでなんでなんでなんでなんで（为什么为什么为什么为什么为什么） \n[03:08.40]僕に僕に僕に僕に（对我对我对我对我） \n[03:10.47]さよならも言わずに 空になったの?（连一句再见也没有说 就化作了天空） \n[03:18.73] \n[03:19.78]赤く染まった空から（从浸染赤红的天空中） \n[03:24.20] \n[03:42.03]溢れ出すシャワーに打たれて（漫出淋浴般的雨水） \n[03:46.18]流れ出す 浮かび上がる（缓缓流淌 渐渐浮现出） \n[03:50.43]一番弱い自分の影（最软弱的自己的身影） \n[03:55.39]青く滲んだ思い出 隠せないのは（渗透着青蓝的回忆 之所以难以隐藏） \n[04:03.40]もう一度（是因为） \n[04:05.54]同じ日々を 求めているから（还在渴望着那同一段时光） \n[04:11.98]君が知っている 空の青さを（想要了解你所知晓的） \n[04:17.18]知りたいから（天空之蓝） \n[04:21.53]追いかけている 追いかけている（所以不断追逐着 追逐着） \n[04:31.97]届け（愿终能抵达）',
        theme: '#10530c'
    },
    {
        name: '心做し',
        artist: '鹿乃',
        url: 'https://drive.google.com/uc?export=download&id=11FcJbQv8zhmhF42QzXPJ_SSNFV4hXk3F',
        cover: 'https://i.scdn.co/image/ab67616d0000b27360f5aef8714e6f44935f32a2',
        lrc: '[00:00.00]心做し - 鹿乃 (かの) \n[00:00.34]词：蝶々P \n[00:00.69]曲：蝶々P \n[00:01.04]ねぇもしも（如果说） \n[00:02.26] \n[00:03.13]全て投げ捨てられたら（可以干脆的舍弃一切） \n[00:06.63]笑って生きることが（就这样笑着得过且过） \n[00:10.34]楽になるの？（是不是就能得到解脱） \n[00:12.26]また胸が痛くなるから（可我的心又开始痛了） \n[00:16.54]もう何も言わないでよ（所以什么都不要说了） \n[00:20.12] \n[00:46.72]ねぇもしも（如果说） \n[00:47.80] \n[00:48.66]全て忘れられたなら（可以干脆的忘掉一切） \n[00:52.30]泣かないで生きることも（就这样藏起泪水而活） \n[00:56.02]楽になるの？（是不是也算是种解脱） \n[00:58.13]でもそんな事出来ないから（可这些我全都做不到） \n[01:02.31]もう何も見せないでよ（所以什么都别再让我看到了） \n[01:05.91] \n[01:08.02]君にどれだけ近づいても（无论我如何接近你） \n[01:13.85]僕の心臓は一つだけ（我依旧只有一颗机械的心脏） \n[01:19.62]酷いよ酷いよ（现实是如此的残忍） \n[01:22.22]もういっそ僕の体を（算了 倒不如就这样） \n[01:25.14]壊して引き裂いて（将我的身躯摧毁粉碎） \n[01:28.01]好きなようにしてよ（随便你怎样处置都好） \n[01:30.89]叫んで藻掻いて（无论我如何哭喊挣扎） \n[01:33.72]瞼を腫らしても（哪怕双眼都哭到红肿） \n[01:36.54]まだ君は僕の事を（你依然紧紧抱着我） \n[01:39.47]抱きしめて離さない（不肯放手） \n[01:42.29]もういいよ（已经够了） \n[01:43.67] \n[01:55.25]ねぇもしも（如果说） \n[01:56.54] \n[01:57.25]僕の願いが叶うなら（我可以实现一个心愿） \n[02:01.03]君と同じものが欲しいんだ（我想要一颗和你一样的心脏） \n[02:06.68]でも僕には存在しないから（但它并不存在于我的身体之中） \n[02:10.80]じゃあせめて此処に来てよ（那至少让你留在我的身边也好） \n[02:14.56] \n[02:42.44]君にどれだけ愛されても（无论你有多么爱我） \n[02:48.12]僕の心臓は一つだけ（我依旧只有一颗机械的心脏） \n[02:53.83]やめてよやめてよ（到此为止吧） \n[02:56.72]優しくしないでよ（别再对我那么温柔） \n[02:59.49]どうしても僕には（无论如何我始终都） \n[03:02.34]理解ができないよ（无法理解这种感情） \n[03:05.22]痛いよ痛いよ（让我心痛至此的感情） \n[03:08.00]言葉で教えてよ（能否用语言让我了解） \n[03:10.99]こんなの知らないよ（我从未接触过的这种感情） \n[03:13.74]独りにしないで（不要丢下我一个人好不好） \n[03:16.80]酷いよ酷いよ（现实是如此的残忍） \n[03:19.43]もういっそ僕の体を（算了 倒不如就这样） \n[03:22.20]壊して引き裂いて（将我的身躯摧毁粉碎） \n[03:25.13]好きなようにしてよ（随便你怎样处置都好） \n[03:27.98]叫んで藻掻いて（无论我如何哭喊挣扎） \n[03:30.87]瞼を腫らしても（哪怕双眼都哭到红肿） \n[03:33.64]まだ君は僕の事を（你依然紧紧地抱着我） \n[03:36.62]抱きしめて離さない（不肯放手） \n[03:39.47]もういいよ（已经够了） \n[03:40.96] \n[04:03.84]ねぇもしも（如果说） \n[04:04.89] \n[04:05.89]僕に心があるなら（我也拥有人类的心） \n[04:09.52]どうやって（我该怎么做） \n[04:10.65] \n[04:11.53]それを見つければいいの？（才能找到它呢） \n[04:15.21]少し微笑んで君が言う（你微微笑着说道） \n[04:19.32]「それはねここにあるよ」（那个啊 就在这里哦）',
        theme: '#283c5b'
    },
    {
        name: 'あの世行きのバスに乗ってさらば。',
        artist: 'ツユ',
        url: 'https://drive.google.com/uc?export=download&id=1CzfPnhSfdxwvEFM4BI9VdLEq7j4UhleD',
        cover: 'https://i1.sndcdn.com/artworks-Hcxxf7HYNBPVt7GL-Da1lzQ-t500x500.jpg',
        lrc: '[00:00.00]あの世行きのバスに乗ってさらば。- ツユ \n[00:00.09]词：ぷす \n[00:00.11]曲：ぷす \n[00:00.14]編曲：ぷす \n[00:00.39]あの世行きのバスに乗ってさらば（搭乘去往那个世界的巴士 永别了） \n[00:11.68]幼い頃 殺めた命は数えきれず（小时候 扼杀了不计其数的生命） \n[00:15.91]小さな命を葬っては（而在葬送了弱小的生命后） \n[00:18.06]平然と笑って帰路についた（便若无其事地笑着回家了） \n[00:20.14]今になって考えたら（如今回想起来） \n[00:22.42]真っ先に死ぬのは私でよかった（要是最先死掉的是我的话该多好） \n[00:27.09]うらうらとした（四周的氛围） \n[00:29.61]周りの空気が濃くて（弥漫着春光融融的气息） \n[00:31.55]存在価値を奪うでしょ（一定是来夺走我的存在价值的吧） \n[00:35.23]生命線とか無駄に長いだけで（生命线什么的没事干嘛要那么长） \n[00:37.03]何の役にも立たない（明明只是一条） \n[00:38.72]ただのしわだよ（什么忙都帮不上的皱纹罢了） \n[00:40.12]心の奥がしょうもない（心底感慨着） \n[00:42.21]人生観を嘆いているの（无可奈何的人生观） \n[00:44.93]耳に刺さる理想 吐き捨てて（将刺耳的理想也一并倾吐出来吧） \n[00:47.51]消えてしまいたい（这想要消失的） \n[00:48.82]生涯なんてもんに（一生） \n[00:49.82]どんな値が付いて（究竟价值几何呢） \n[00:51.81]自己中心的だって（说我很自我中心？） \n[00:53.25]思いの欠片も知らないで（你明明就不知道我都经历过什么） \n[00:55.66]どうせ向こう数十年経った先では（反正未来几十年后） \n[00:58.32]煙たがれて（仍会被人敬而远之） \n[00:59.71]なら私を刺して殺して（若是这样的话 那就请把我杀了） \n[01:01.10]奪って去って（并且夺走我的一切吧） \n[01:02.20]あの世行きのバスに乗ってさらば（搭乘去往那个世界的巴士 永别了） \n[01:13.82]幼い頃（我仍无法忘记） \n[01:14.75]馬鹿にされたことも忘れきれず（小时候被当成傻瓜一样戏弄的经历） \n[01:17.99]身に覚えのない理不尽さが（对于无法理解的蛮横无理） \n[01:19.92]頭から離れてくれないんだ（依旧无法释怀） \n[01:22.19]今になって考えたら（如今回想起来） \n[01:24.34]何故飲み込んだのか（我当时为什么要忍气吞声呢） \n[01:26.70]歯向かえばよかった（要是当时可以大胆反抗的话就好了） \n[01:29.22]もやもやとした（我要匍匐在） \n[01:31.45]人混みの中を這って（熙攘杂乱的人群之中） \n[01:33.63]存在価値を示すのよ（彰显自己的存在价值） \n[01:37.11]幸福論とか無駄に深いだけで（幸福论什么的没事干嘛要那么深奥） \n[01:39.60]何の役にも立たない（明明就只是一段） \n[01:41.10]ただの文字だよ（什么忙都帮不上的文字罢了） \n[01:42.44]浅い心がパッとしない焦燥感に（浅薄的思绪） \n[01:45.48]駆られているの（被呆滞的焦躁感所驱使） \n[01:47.03]時だけが経って戻れないな（只有时光一去便不复返） \n[01:49.74]消えてしまいたい（这想要消失的） \n[01:50.63]生涯なんてもんに（一生又将会） \n[01:51.96]どんな芽が生えて（长出怎样的新芽呢） \n[01:53.81]面倒くさい奴だって（说我是个麻烦的家伙？） \n[01:54.91]お前の声とか要らないわ（我又不需要你这种人的建议） \n[01:57.82]どうせ向こう数十年経った先まで（反正未来几十年后） \n[02:00.29]持ち越すだけ（仍旧会维持着现状） \n[02:01.44]なら私を刺して殺して（若是这样的话 那就请把我杀了） \n[02:03.36]奪って去って（并且夺走我的一切吧） \n[02:23.71]消えてしまいたい（这想要消失的） \n[02:24.57]生涯なんてもんに（一生） \n[02:26.09]意味はあるんですか（究竟有什么意义） \n[02:31.67]消えてしまいたい（这想要消失的） \n[02:32.79]生涯なんてもんに（一生） \n[02:34.02]夢はあるんですか（究竟有什么梦想） \n[02:38.37]無いじゃん（根本什么都没有吧） \n[02:39.86]消えてしまいたい（这想要消失的） \n[02:40.84]生涯なんてもんに（一生） \n[02:41.96]どんな値が付いて（究竟价值几何呢） \n[02:43.52]辛いよね分かるよだって（什么叫“很辛苦吧 我知道的”） \n[02:45.24]分かったようなこと言わないで（不要说的一副好像很了解的样子） \n[02:47.62]どうせ向こう（反正未来） \n[02:48.55]数十年経った先でも（几十年后） \n[02:50.15]嘆いていて（仍旧会唉声叹气） \n[02:51.20]なら私を刺して殺して（若是这样的话 那就请把我杀了） \n[02:53.30]奪って去って（并且夺走我的一切吧） \n[02:54.48]それが私に出来る（那是我第一次） \n[02:59.32]最初で最後の悪あがきだ（也是最后一次做出的挣扎） \n[03:03.27]あの世行きのバスに乗ってさらば（搭乘去往那个世界的巴士 永别了） \n[03:06.20]でも私は悔いて叫んで雨が降って（但我仍后悔地呐喊着 雨也仍在漠然地下着）',
        theme: '#232a60'
    },
    {
        name: '願い～あの頃のキミへ～',
        artist: '當山みれい',
        url: 'https://drive.google.com/uc?export=download&id=12wWGwnIkDaJ_WTgJDSpt632j6cSpHZyq',
        cover: 'https://zh.followlyrics.com/storage/84/838361.jpg',
        lrc: '[00:00.79]願い～あの頃のキミへ～ (Acoustic ver.) - 当山真玲 (當山みれい) \n[00:06.73]词：Dohzi-T \n[00:08.25]曲：Dohzi-T/Shingo.S \n[00:15.68]二人の思い出（回想起） \n[00:18.23]かき集めたなら（和你之间的回忆） \n[00:21.23]また泣けてきちゃう（又会令我落泪） \n[00:24.11]寂しさ溢れて（令我感到寂寞） \n[00:27.03]最後の恋だと（曾相信你是我） \n[00:29.89]信じて願った（最后的爱情） \n[00:32.89]あの日々にウソはなかった（过去在一起的那些时光全都是真实的） \n[00:38.65] \n[00:42.22]希望夢明るい未来（希望 梦想 还有光明的未来） \n[00:45.18]東京に持った大きな期待（曾经对东京抱有很大的期待） \n[00:48.09]だけど現実は甘くなくて（但现实却没有那么令人满意） \n[00:51.09]落ち葉見つめ（凝视着落叶） \n[00:52.19]深く思い詰めてた（陷入了沉思） \n[00:54.24]そんなときに（在那个时候） \n[00:55.42]あなたと出会って（我遇见了你） \n[00:57.04]いつもあなたに助けられて（总是得到你的帮助） \n[00:59.98]バイトが楽しみになって（我开始期待打工的时间） \n[01:02.46]実はシフト被るように狙ってた（其实是希望可以和你在同一天轮班） \n[01:05.82]スタンプ使いが妙にうまくて（意外的你是经常用STAMP的类型） \n[01:08.61]お化けも虫も受け付けなくて（鬼怪和虫子是你害怕的东西） \n[01:11.46]くしゃくしゃの笑顔が可愛くて（一笑鼻子就会皱起来的你是那么可爱） \n[01:14.58]眠れない夜はキミのせいで（失眠的夜晚全都是因为你） \n[01:17.45]この気持ち今すぐに（想立刻向你） \n[01:19.27]伝えたい（表白我的心迹） \n[01:20.19]けどバレたくない（但又不想被你发现） \n[01:21.60]どうしたらいいの?（到底该怎么办才好） \n[01:23.27]迷ってるうちに（在自己这样纠结的时候） \n[01:24.57]夜明けがきて（黎明已经到来） \n[01:26.17]馬鹿みたいに後悔して（像个傻瓜一样沉浸在后悔之中） \n[01:28.21]二人の思い出（回想起） \n[01:30.98]かき集めたなら（和你之间的回忆） \n[01:33.91]また泣けてきちゃう（又会令我落泪） \n[01:36.83]寂しさ溢れて（令我感到寂寞） \n[01:39.74]最後の恋だと（曾相信你是我） \n[01:42.61]信じて願った（最后的爱情） \n[01:45.59]あの日々にウソはなかった（过去在一起的那些时光全都是真实的） \n[01:51.53] \n[02:03.37]帰り道の公園で受けた告白（在回家路上的公园里接受了你的告白） \n[02:06.95]ベタすぎるセリフ笑っちゃった（你说的那些腻歪台词让我不禁笑了出来） \n[02:09.78]一生忘れられない想い出（那是我一生都无法忘记的回忆） \n[02:12.68]あなたがプレゼントしてくれた（那是你赠与我的珍贵礼物） \n[02:15.65]一日中ゲームやりこんで（曾经一整天沉迷于游戏里） \n[02:18.51]夜ご飯は一緒に作って（也曾经两个人一起做晚饭） \n[02:21.44]贅沢なんてしなくたって（我并不向往多么奢侈的生活） \n[02:24.01]二人いればそれだけでよくて（只要和你在一起就已经足够） \n[02:27.37]口下手二人が本気で喧嘩（两个不善言辞的人那次大吵了一架） \n[02:30.24]お互いブロック（相互拉黑社交账号） \n[02:31.56]通じない電話（故意不接对方电话） \n[02:33.09]本気で（那时的我未能意识到） \n[02:33.81]ぶつかり合えることが（这样较真的争执） \n[02:35.92]どんな愛しいか（其实是多么） \n[02:37.34]気づけなかった（难能可贵的事情） \n[02:38.97]あなたが教えてくれたこと（你教会我的事情） \n[02:42.16]くれたもの（你赋予我的一切） \n[02:43.69]胸に刻み過ごしてる（至今仍铭刻在） \n[02:45.65]今日も（我的心中） \n[02:46.53]だから伝えたい（所以我想和你） \n[02:48.01]ありがとう（说声谢谢） \n[02:49.51]二人の思い出（回想起） \n[02:52.44]かき集めたなら（和你之间的回忆） \n[02:55.37]また泣けてきちゃう（又会令我落泪） \n[02:58.25]寂しさ溢れて（令我感到寂寞） \n[03:01.14]最後の恋だと（曾相信你是我） \n[03:04.04]信じて願った（最后的爱情） \n[03:06.96]あの日々にウソはなかった（过去在一起的那些时光全都是真实的） \n[03:13.30]子供のままでいられたなら（如果我们能够永远都长不大） \n[03:18.31] \n[03:18.93]何も怖がらず（是否能够毫不畏惧） \n[03:21.61]歩いていけたかな?（继续前行） \n[03:24.89]もっと早く（如果我们能够更早地） \n[03:26.62]大人になっていたなら（长大成人） \n[03:30.76]二人で乗り越えられたかな?（是否就能够克服一切的难关了） \n[03:35.85]今もキミの夢夜空へ願う（如今我依然向夜空中祈求着你的梦境） \n[03:42.78] \n[03:43.32]今でもキミは（希望如今的你） \n[03:45.12]あの頃と同じ笑顔で（依然和那时一样地笑着） \n[03:48.90]今でもキミは（希望如今的你） \n[03:51.00]あの頃のようにまっすぐで（依然和那时一样地率直） \n[03:54.66]今でもキミは（希望如今的你） \n[03:56.77]あの頃と変わらない優しさで（依然和那时一样地温柔） \n[04:00.52]今でもキミは（希望如今的你） \n[04:03.11]キミのままでいて（可以做你自己） \n[04:04.78]ほしいそう願うよ（不要改变） \n[04:08.45]二人の思い出（回想起） \n[04:11.00]かき集めたなら（和你之间的回忆） \n[04:13.85]また泣けてきちゃう（又会令我落泪） \n[04:16.80]寂しさ溢れて（令我感到寂寞） \n[04:19.72]最後の恋だと（曾相信你是我） \n[04:22.56]信じて願った（最后的爱情） \n[04:25.58]あの日々にウソはなかった（过去在一起的那些时光全都是真实的） \n[04:31.87]二人の思い出集めたら（回想起和你之间的回忆） \n[04:34.68]泣き出しそうになる今夜も（今晚依旧不禁想要哭泣） \n[04:37.60]寂しさ溢れて苦しくなる（我依然无比寂寞 痛苦不已） \n[04:43.45]最後の恋と信じ願った（曾相信你是我最后的爱情） \n[04:46.38]あの日々にウソはなかった（过去在一起的那些时光全都是真实的） \n[04:49.15]離れても（就算已经分开） \n[04:50.62]あなたの幸せ願う（我也希望你可以幸福） \n[04:55.06]二人の思い出集めたら（回想起和你之间的回忆） \n[04:58.02]泣き出しそうになる今夜も（今晚依旧不禁想要哭泣） \n[05:00.92]寂しさ溢れて苦しくなる（我依然无比寂寞 痛苦不已） \n[05:06.67]最後の恋と信じ願った（曾相信你是我最后的爱情） \n[05:09.64]あの日々にウソはなかった（过去在一起的那些时光全都是真实的） \n[05:12.39]離れても（就算已经分开） \n[05:13.93]あなたの幸せ願う（我也希望你可以幸福）',
        theme: '#163472'
    },
    {
        name: '茜さす',
        artist: 'Aimer',
        url: 'https://drive.google.com/uc?export=download&id=11Iajbd44r2BXFlj9oQ7XNwaQeeMNp4SD',
        cover: 'https://ro69-bucket.s3.amazonaws.com/uploads/text_image/image/341056/width:750/resize_image.jpg',
        lrc: '[00:04.86]词：aimerrhythm \n[00:05.60]曲：釣俊輔 \n[00:07.97]编曲：玉井健二/釣俊輔 \n[00:16.57]枯れ葉舞う町角を（枯叶纷飞的街角） \n[00:21.81] \n[00:22.66]駆け抜けてく乾いた風（萧瑟秋风在呼啸） \n[00:30.25]伸びた影とイチョウ並木（拉长的身影 道旁的银杏树） \n[00:36.69]季節を見てたかった（盼望见证四季的更迭） \n[00:42.59]返事のない呼ぶ声は（听不见回应的呼唤声） \n[00:48.62]あっとゆう間（瞬息之间） \n[00:51.33]かき消されてしまう（消散殆尽） \n[00:56.24]目抜き通り人波抜けて（穿过繁华巷陌熙攘人潮） \n[01:02.66]どこか遠く誰もいない場所へ（走向那渺无人迹的远方） \n[01:11.28]気付いていたのに（内心虽有所察觉） \n[01:14.98]何も知らないふり（却依然故作不知） \n[01:22.16]一人きりでは何もできなかった（孤身一人 又能有何作为） \n[01:37.41]出会えた幻にさよならを（朝着邂逅的幻境道离别） \n[01:44.25]茜さすこの空に（朝着斜阳余晖的天际） \n[01:50.35]零れた弱さに手のひらを（朝着纷洒而落的懦弱 伸出掌心） \n[01:57.21]一輪の徒花そんなふうに（恰如易逝繁花） \n[02:04.37]願い叶え痛みを知る（夙愿得偿 始知伤痛） \n[02:23.15]渡り鳥の鳴く声も（候鸟的鸣叫声） \n[02:29.25]赤く染まる雲に消えてしまう（消散在茜色云霞间） \n[02:36.80]帰り道も遠く離れて（逐渐远离归路的我） \n[02:43.23]今は一人誰もいない場所で（孤身徘徊在空无一人的地方） \n[02:51.93]気付いた景色の色に（恍然察觉） \n[02:58.51]ふれたとしても（即便如今触景生情） \n[03:02.71]一人きりでは（孤身一人） \n[03:08.85]声も出せなかった（又能向谁倾诉） \n[03:14.60]愛した幻に口づけを（吻别曾经挚爱的幻境） \n[03:21.55]黄昏たこの空に（黄昏时 天际中） \n[03:27.56]まだ夕べの星灯らない（昨夜的星辰依旧未明） \n[03:34.41]待ち宵も朧げ月は何処に（满月前夕 朦胧月色不知所踪） \n[03:41.59]引き裂かれて痛みを知る（撕心裂肺 始知伤痛） \n[03:49.91]くり返す日々の中で（岁月轮回往复） \n[03:55.54]探してたのは（不懈探寻的是） \n[03:57.89]歩き続けるための願い（支撑我继续走下去的心愿） \n[04:09.76]出会えた幻にさよならを（朝着邂逅的幻境道离别） \n[04:16.69]憧れはこの空に（憧憬散于天际） \n[04:22.72]流れた月日を手のひらに（流年置于手心） \n[04:29.68]一片の花弁そんなふうに（恰如一片花瓣） \n[04:36.60]痛み重ね出会いを知る（几经伤痛 始知相逢） \n[04:49.55]出会い重ね願いを知る（几经相逢 始知夙愿）',
        theme: '#ec3a36'
    },
    {
        name: 'Rain',
        artist: '秦基博(Motohiro Hata)',
        url: 'https://drive.google.com/uc?export=download&id=1C8DBCYQsMPmWsO60UcZrAduEpAOvQBZ6',
        cover: 'https://images.genius.com/0e2c2c5f015b011a77793831331e8372.1000x992x1.jpg',
        lrc: '[00:00.76]Rain - 秦基博 (はた もとひろ) \n[00:04.65]词：大江千里 \n[00:07.17]曲：大江千里 \n[00:09.10]编曲：皆川真人/多田彰文 \n[00:15.08]言葉にできず凍えたままで（不动声色 无以言表） \n[00:20.31]人前ではやさしく生きていた（扮演温柔 直到今日） \n[00:24.92]しわよせで こんなふうに雑に（所有冲动都化作） \n[00:29.42]雨の夜にきみを抱きしめてた（这雨夜鲁莽的拥抱） \n[00:34.23] \n[00:36.04]道路わきのビラと壊れた常夜燈（路旁的传单和坏掉的长明灯） \n[00:41.16]街角ではそう だれもが急いでた（街角旁每个人都行色匆匆） \n[00:45.77]きみじゃない 悪いのは自分の激しさを（错的不是你） \n[00:51.13]かくせないぼくのほうさ（而是无法掩藏住激情的我啊） \n[00:55.06] \n[00:56.81]Lady きみは雨にけむる（Lady 你包裹着雨幕） \n[01:01.36]すいた駅を少し走った（跑过空空的车站） \n[01:05.92] \n[01:07.23]どしゃぶりでもかまわないと（不顾大雨滂沱） \n[01:09.86]ずぶぬれでもかまわないと（不顾浑身湿透） \n[01:12.42]しぶきあげるきみが消えてく（你卷起雨花 渐行渐远） \n[01:17.76]路地裏では朝が早いから（小巷里的清晨总是更早到来） \n[01:20.25]今のうちにきみをつかまえ（我要趁现在抓住你） \n[01:22.88]行かないで 行かないで（对你说） \n[01:25.19]そう言うよ（不要走 不要走） \n[01:28.74] \n[01:49.27]別々に暮らす 泣きだしそうな空を（在这片阴霾的天空下 你我已天各一方） \n[01:54.19]にぎりしめる強さは今はもうない（曾经的坚强 已然不复存在） \n[01:58.73]変わらずいる心のすみだけで（但仍有心的一角 未曾改变） \n[02:03.22]傷つくようなきみなら（不愿再看到） \n[02:05.59]もういらない（受伤的你） \n[02:07.86] \n[02:09.92]Lady きみは雨にぬれて（Lady 烟雨中你浑身湿透） \n[02:14.42]ぼくの眼を少し見ていた（略微凝视我的双眼） \n[02:19.18] \n[02:20.23]どしゃぶりでもかまわないと（不顾大雨滂沱） \n[02:22.86]ずぶぬれでもかまわないと（不顾浑身湿透） \n[02:25.48]口笛ふくぼくがついてく（我吹着口哨 追随你） \n[02:30.67]ずいぶんきみを知りすぎたのに（分明已对你了解太多） \n[02:33.29]初めて争った夜のように（却仍会像初次争吵的夜晚时般） \n[02:35.91]行かないで 行かないで（对你说） \n[02:38.16]そう言うよ（不要走 不要走） \n[02:41.84] \n[03:02.14]肩が乾いたシャツ改札を出る頃（衬衫半干 走出车站时） \n[03:07.19]きみの町じゃもう雨は小降りになる（你的城市已是绵绵细雨） \n[03:11.80]今日だけが明日に続いてる（只有过完今天明天才会到来） \n[03:16.24]こんなふうに きみとは終われない（和你不会就这样结束） \n[03:20.91] \n[03:22.85]Lady きみは今もこうして（Lady 此刻你是否一如既往） \n[03:27.42]小さめの傘もささずに（不肯撑伞） \n[03:33.21] \n[03:35.98]どしゃぶりでもかまわないと（不顾大雨滂沱） \n[03:38.50]ずぶぬれでもかまわないと（不顾浑身湿透） \n[03:41.06]しぶきあげるきみが消えてく（你卷起雨花 渐行渐远） \n[03:46.40]路地裏では朝が早いから（小巷里的清晨总是更早到来） \n[03:48.95]今のうちにきみをつかまえ（我要趁现在抓住你） \n[03:51.51]行かないで 行かないで（对你说） \n[03:53.89]そう言うよ（不要走 不要走） \n[03:56.75]どしゃぶりでもかまわないと（不顾大雨滂沱） \n[03:59.38]ずぶぬれでもかまわないと（不顾浑身湿透） \n[04:01.94]口笛ふくぼくがついてく（我吹着口哨 追随你） \n[04:07.21]ずいぶんきみを知りすぎたのに（分明已对你了解太多） \n[04:09.83]初めて争った夜のように（却仍会像初次争吵的夜晚时般） \n[04:12.45]行かないで 行かないで（对你说） \n[04:14.76]そう言うよ（不要走 不要走）',
        theme: '#10530c'
    },
    {
        name: 'remember',
        artist: 'Uru',
        url: 'https://drive.google.com/uc?export=download&id=1f_Cbi9BNO7ztXSozBHvbdZK2s6EX-wX1',
        cover: 'https://i.scdn.co/image/ab67616d0000b273907c9c56af7a64ad6b528593',
        lrc: '[00:09.01]词：Uru \n[00:16.86]曲：Uru \n[00:19.30]编曲：トオミヨウ \n[00:33.44]夏の終わりを知らせるように（就像是宣告着夏天的落幕） \n[00:39.84]道端にそっと並んで咲いた（在道路的一旁静静的开放） \n[00:46.25]夕にも染まらず風も知らない（不为暮色所染 也不识风为何物） \n[00:52.68]青い青いリンドウ（那一片蓝色的龙胆花） \n[00:58.14]傷つくことを恐れながら（过去的我害怕会受伤） \n[01:04.43]心を隠したりしたけれど（而封闭起自己的心扉） \n[01:10.84]誰かが傍にいてくれる温かさを（是你让我体会到） \n[01:17.24]教えてもらったから（有个人陪伴在身边 是多么温暖的事情） \n[01:23.69]さよならじゃない（后会有期） \n[01:28.76]名も知らない遠い場所へ（走向尚不知名的遥远地方） \n[01:36.28]離れたとしても記憶の中で（哪怕从此天各一方） \n[01:42.72]息をし続ける（你也将永远存活在我的记忆之中） \n[01:49.33]夜に埋もれて（没入夜色之中） \n[01:54.08]誰も知らない遠い場所へ（走向无人知晓的遥远地方） \n[02:01.92]迷ったとしても記憶の中の（哪怕途中迷失了方向 愿记忆中的温暖） \n[02:08.07]温もりでずっと今を照らせるよう（能为我所在的当下 带来永恒的光亮） \n[02:28.73]遠くで聞こえる祭りの声は（远远听见夏日祭的喧闹声） \n[02:35.06]関係ないんだってそう思っていた（我曾以为那些都与我无关） \n[02:41.49]見たくもなかった境界線が（不愿去回顾的境界线） \n[02:47.84]寂しかった日々（是那一段寂寞的岁月） \n[02:53.28]誰の背中も追わなかった（不曾有过什么追求） \n[02:59.63]時には嘘もついたけれど（有时也会自欺欺人） \n[03:06.06]守りたいものがここにできたこと（可现在我却在这里 找到了我想守护的东西） \n[03:12.41]それがただ嬉しくて（仅是如此便让我欣喜万分） \n[03:18.85]さよならじゃない（后会有期） \n[03:23.90]向かい合えずいた寂しさも（无法与你坦诚相待的寂寞） \n[03:31.56]帰りたい場所がここにあるだけで（只要这里还有我心灵的归宿） \n[03:37.70]それだけで強さに変わる（只是如此便能成为我的力量） \n[03:44.37]愛されたいと本当はもがいていた（事实上我也曾渴望被爱 而痛苦的挣扎过） \n[03:50.41]この孤独も涙も包むような（因为我遇到了那个可以包容我的孤独） \n[03:57.26]優しさに出逢えたから（我的泪水的 温柔之人） \n[04:06.82]さよならじゃない（后会有期） \n[04:11.89]例えばもう会えなくなっても（哪怕这辈子再也无法相见） \n[04:19.73]きっとどこかで（我相信我们一定会在某处） \n[04:22.70]笑っていると（会心） \n[04:25.96]心繋げて（而笑） \n[04:32.54]さよならじゃない（后会有期） \n[04:37.50]名も知らない遠い場所へ（走向尚不知名的遥远地方） \n[04:45.04]離れたとしても記憶の中の（哪怕从此天各一方） \n[04:51.25]温もりをずっとずっと忘れないよ（我也会永远记得 记忆里曾有过的温暖）',
        theme: '#a19cba'
    },
    ]
});
