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