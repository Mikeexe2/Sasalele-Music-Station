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
    searchInput.value.trim(),
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
        source.src = "https://www.dropbox.com/scl/fi/" + e + "&raw=1",
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
    preload: "none",
    volume: .7,
    mutex: !0,
    listFolded: !1,
    listMaxHeight: "120px",
    lrcType: 3,
    audio: [{
        name: 'スカイクラッドの観測者',
        artist: 'いとうかなこ',
        url: 'https://www.dropbox.com/scl/fi/exqququ4fr7uw110a9f72/.mp3?rlkey=3e9q6youmgu2hvz7s92qcfdjc&raw=1',
        cover: 'https://images.genius.com/85412180fa59ace8051fcec5f7c2d189.310x312x1.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/スカイクラッドの観測者-伊藤加奈子.lrc',
    }, {
        name: 'technovision',
        artist: 'いとうかなこ',
        url: 'https://www.dropbox.com/scl/fi/r6vj3q80emnudtd921zwf/technovision.mp3?rlkey=ce36erpofwpcagzfr16z774st&raw=1',
        cover: 'https://y.qq.com/music/photo_new/T002R300x300M000003AGEDl3ESzYk_1.jpg?max_age=2592000',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/technovision-伊藤加奈子.lrc',
    }, {
        name: 'Hacking to the Gate',
        artist: 'いとうかなこ',
        url: 'https://www.dropbox.com/scl/fi/w9i5j2q79gp8zrgzm5w2d/Hacking-to-the-Gate.mp3?rlkey=wsvup4gc0zb8o1kdowxrdwrgz&raw=1',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/5b650b1337564521c5a01360097d3acb.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/HackingtotheGate-%E4%BC%8A%E8%97%A4%E5%8A%A0%E5%A5%88%E5%AD%90.lrc',
    }, {
        name: 'GATE OF STEINER (Bonus Track)',
        artist: '佐々木恵梨',
        url: 'https://www.dropbox.com/scl/fi/uhnlqiq6pz3k703ul5xqe/GATE-OF-STEINER-Bonus-Track.mp3?rlkey=yhw13ddtaa01es7mh267a1i3i&raw=1',
        cover: 'https://images.genius.com/4ca343c719b10f19dad5806999aad983.500x500x1.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/GATEOFSTEINER(BonusTrack)-佐々木恵梨.lrc',
    }, {
        name: 'いつもこの場所で',
        artist: 'あやね',
        url: 'https://www.dropbox.com/scl/fi/gg1j70nhhmu8pcr958piw/.mp3?rlkey=7qlu6a92qogac3kyvequv9fxu&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b273423e971ce00d4dc2c6298203',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/いつもこの場所で-あやね.lrc',
    }, {
        name: 'あなたの選んだこの時を',
        artist: 'いとうかなこ',
        url: 'https://www.dropbox.com/scl/fi/haml1bg7evu943xidel08/.mp3?rlkey=xiisekiw4sm3pp4xmzxwq70na&raw=1',
        cover: 'https://music.mages.co.jp/wp/wp-content/uploads/2016/08/FVCG1236X.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/あなたの選んだこの時を-いとうかなこ.lrc',
    }, {
        name: '前前前世',
        artist: 'RADWIMPS',
        url: 'https://www.dropbox.com/scl/fi/124o07fl075088qujh2au/.mp3?rlkey=t3zmscadd32vmb5xily0uynoc&raw=1',
        cover: 'https://upload.wikimedia.org/wikipedia/en/c/c8/Radwimps-zenzenzense.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%89%8D%E5%89%8D%E5%89%8D%E4%B8%96-RADWIMPS.lrc',
    }, {
        name: 'Butter-Fly',
        artist: '和田光司(By コバソロ & 七穂)',
        url: 'https://www.dropbox.com/scl/fi/oagrr5zk2yrogqpu7ei6e/Butter-Fly.mp3?rlkey=nnzucrd70ryj8527qpmg9ldam&raw=1',
        cover: 'https://pic-bstarstatic.akamaized.net/ugc/5f4e8eb0f5673ea804c53ffeb6619bcf439d5a5e.jpg@160w_90h_1e_1c_90q',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Butter-Fly-%E5%92%8C%E7%94%B0%E5%85%89%E5%8F%B8(%E3%82%8F%E3%81%A0%E3%81%93%E3%81%86%E3%81%98).lrc',
    }, {
        name: 'Catch the Moment',
        artist: 'LiSA',
        url: 'https://www.dropbox.com/scl/fi/wlj9tyhus77f0yabhrm3n/Catch-the-Moment.mp3?rlkey=v38wfhxbx4m91ro601fhgfbqf&raw=1',
        cover: 'https://static.wikia.nocookie.net/jpop/images/1/16/Catchreg.jpg/revision/latest?cb=20170224094844',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/CatchtheMoment-LiSA.lrc',
    }, {
        name: 'Baby Don\'t Know Why',
        artist: 'Ms.OOJA',
        url: 'https://www.dropbox.com/scl/fi/4bv579a9hpi1ej8rr2ifo/Baby-Dont-Know-Why.mp3?rlkey=gy715lnjdsa699a7wnoutpwwc&raw=1',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/841f28eff51de652924053d376bf9d33',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/babydon%E2%80%99tknowwhy-Ms.OOJA.lrc',
    }, {
        name: 'LOSER',
        artist: '米津玄師',
        url: 'https://www.dropbox.com/scl/fi/w43u51x3ut59bzbwfq63m/LOSER.mp3?rlkey=oaxqvyevfhpaw9mq2b826k1d3&raw=1',
        cover: 'https://image.biccamera.com/img/00000003460188_A01.jpg?sr.dw=320&sr.jqh=60&sr.dh=320&sr.mat=1',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/LOSER-%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc',
    }, {
        name: '打上花火',
        artist: 'DAOKO \ 米津玄師',
        url: 'https://www.dropbox.com/scl/fi/zfdscwhc8fwv3fnnr097b/.mp3?rlkey=vt2r7ocffgpwg9ryb8ypfud9k&raw=1',
        cover: 'https://upload.wikimedia.org/wikipedia/zh/c/c3/Uchiage_Hanabi_Cover_by_DAOKO.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E6%89%93%E4%B8%8A%E8%8A%B1%E7%81%AB-%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc',
    }, {
        name: '終わりの世界から',
        artist: '麻枝 准 \ やなぎなぎ',
        url: 'https://www.dropbox.com/scl/fi/k43v7qx2jl9x0q373u1o6/.mp3?rlkey=4yv8xo7ljkm2er27ltku7oz9c&raw=1',
        cover: 'https://lastfm.freetls.fastly.net/i/u/300x300/41d1010473c549b0aee1dd16ffb6af70',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%B5%82%E3%82%8F%E3%82%8A%E3%81%AE%E4%B8%96%E7%95%8C%E3%81%8B%E3%82%89-%E3%82%84%E3%81%AA%E3%81%8E%E3%81%AA%E3%81%8E.lrc',
    }, {
        name: 'Break Beat Bark!',
        artist: '神田沙也加',
        url: 'https://www.dropbox.com/scl/fi/j8jzpd75e71kag14mhmui/Break-Beat-Bark.mp3?rlkey=9wlarn6l6gl6cimlcj7vogyx4&raw=1',
        cover: 'https://i.quotev.com/h7lqxrfxaaaa.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/BreakBeatBark!-%E7%A5%9E%E7%94%B0%E6%B2%99%E4%B9%9F%E5%8A%A0.lrc',
    }, {
        name: 'ワイルドローズ',
        artist: 'May\'n',
        url: 'https://www.dropbox.com/scl/fi/6jzkekn6u78i29nneylhx/Wild-Rose.mp3?rlkey=p4q45c85evr37ayfwx9f9tqtt&raw=1',
        cover: 'https://www.animelyrics.com/albums/jpop/mayn/0113a2c4f1ed50e60b79137cd0c5571a562e326f.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%83%AF%E3%82%A4%E3%83%AB%E3%83%89%E3%83%AD%E3%83%BC%E3%82%BA-Mayn.lrc',
        theme: '#e6c5cd'
    }, {
        name: 'My Days',
        artist: '鈴木このみ',
        url: 'https://www.dropbox.com/scl/fi/l5g266uvijxl63a76b6f5/My-Days.mp3?rlkey=wbi4kjrmiz5tche42o5nooo5u&raw=1',
        cover: 'https://lineimg.omusic.com.tw/img/album/1827658.jpg?v=20200409213429',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/MyDays-%E9%88%B4%E6%9C%A8%E3%81%93%E3%81%AE%E3%81%BF.lrc',
    }, {
        name: 'Lemon',
        artist: '米津玄師',
        url: 'https://www.dropbox.com/scl/fi/hh9dqbjav4qkblu69x2k4/Lemon.mp3?rlkey=lu58gz4hd48acitz81t5k8psm&raw=1',
        cover: 'https://upload.wikimedia.org/wikipedia/en/1/12/Kenshi_Yonezu_-_Lemon.png',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Lemon-%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc',
    }, {
        name: '小さな恋のうた',
        artist: 'コバソロ & 杏沙子',
        url: 'https://www.dropbox.com/scl/fi/12n320ilw3z1f4kbxqjtf/.mp3?rlkey=77qo2kc0nk5qyn4hy8txq06xw&raw=1',
        cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ae/93/23/ae932363-26c8-721b-140f-efc4a9e94742/22UMGIM36963.rgb.jpg/400x400cc.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F-Kobasolo(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E4%B8%83%E7%A9%82.lrc',
    }, {
        name: 'あとひとつ',
        artist: 'コバソロ & こぴ',
        url: 'https://www.dropbox.com/scl/fi/ljwmcthrajow0f579ziwh/.mp3?rlkey=rpqzw0kiiaodv1pdnhm8hj6sf&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b2736101e08696469c595f25deee',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%81%82%E3%81%A8%E3%81%B2%E3%81%A8%E3%81%A4-Kobasolo(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E3%81%93%E3%81%B4.lrc',
    }, {
        name: 'キセキ',
        artist: '高橋李依',
        url: 'https://www.dropbox.com/scl/fi/xkcwg5731ndzjn6oa49le/.mp3?rlkey=stvdyzouyxu3uzeggqs8yrzwn&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%82%AD%E3%82%BB%E3%82%AD-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
    }, {
        name: '小さな恋のうた',
        artist: '高橋李依',
        url: 'https://www.dropbox.com/scl/fi/hh8ak8ubphiru5h2vjgn2/_.mp3?rlkey=8iouucouuswkd6ni9bo1g0xbr&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
    }, {
        name: '言わないけどね。',
        artist: '高橋李依',
        url: 'https://www.dropbox.com/scl/fi/ixq5z476jvrtag73elj8g/.mp3?rlkey=lijzwtbv0lj7scp6dpv0yeo92&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E8%A8%80%E3%82%8F%E3%81%AA%E3%81%84%E3%81%91%E3%81%A9%E3%81%AD%E3%80%82-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
    }, {
        name: '愛唄',
        artist: '高橋李依',
        url: 'https://www.dropbox.com/scl/fi/ufukfrfypjn5qrx1hsiqw/.mp3?rlkey=5n6gnwyh844izhrx06ke8lgqi&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E6%84%9B%E5%94%84-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
    }, {
        name: '奏(和聲版)',
        artist: '高橋李依 x 雨宫天',
        url: 'https://www.dropbox.com/scl/fi/jct04srvdv51kgwfyntnc/.mp3?rlkey=3z0zyar5knw40ahdw05kgxrzu&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%A5%8F(%E3%81%8B%E3%81%AA%E3%81%A7)-%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc',
        theme: '#a68461'
    }, {
        name: '生きていたんだよな',
        artist: 'あいみょん',
        url: 'https://www.dropbox.com/scl/fi/jznkphfjbe8ljqw9p5p3r/.mp3?rlkey=h6yta8m0q2vyep528idtyusl8&raw=1',
        cover: 'https://c-cl.cdn.smule.com/rs-s79/arr/42/5e/937aa21e-3491-4122-ac03-daebcc96c421.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%94%9F%E3%81%8D%E3%81%A6%E3%81%84%E3%81%9F%E3%82%93%E3%81%A0%E3%82%88%E3%81%AA-%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc',
        theme: '#df192b'
    }, {
        name: '空の青さを知る人よ',
        artist: 'あいみょん',
        url: 'https://www.dropbox.com/scl/fi/lr7z4gzm56jpbwadr2ktz/.mp3?rlkey=im7of807sjp0rhf6wc28g35bl&raw=1',
        cover: 'https://cdn.kdkw.jp/cover_1000/321906/321906000047.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%A9%BA%E3%81%AE%E9%9D%92%E3%81%95%E3%82%92%E7%9F%A5%E3%82%8B%E4%BA%BA%E3%82%88-%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc',
    }, {
        name: '心做し',
        artist: '鹿乃',
        url: 'https://www.dropbox.com/scl/fi/gidea4t0uz08fp2tav4fh/.mp3?rlkey=y3qyqz0uc9he13otr98iylgor&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27360f5aef8714e6f44935f32a2',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%BF%83%E5%81%9A%E3%81%97-%E9%B9%BF%E4%B9%83.lrc',
    }, {
        name: 'あの世行きのバスに乗ってさらば。',
        artist: 'ツユ',
        url: 'https://www.dropbox.com/scl/fi/akzad6ivaohe9bk84fm80/.mp3?rlkey=amk8yteb4knl7fdkg2qnd4p2a&raw=1',
        cover: 'https://i1.sndcdn.com/artworks-Hcxxf7HYNBPVt7GL-Da1lzQ-t500x500.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%81%82%E3%81%AE%E4%B8%96%E8%A1%8C%E3%81%8D%E3%81%AE%E3%83%90%E3%82%B9%E3%81%AB%E4%B9%97%E3%81%A3%E3%81%A6%E3%81%95%E3%82%89%E3%81%B0%E3%80%82-%E3%83%84%E3%83%A6.lrc',
    }, {
        name: '願い～あの頃のキミへ～',
        artist: '當山みれい',
        url: 'https://www.dropbox.com/scl/fi/sojsvngwaks2eae6gkocz/.mp3?rlkey=rgsoksce261vdoa4w07be3zkh&raw=1',
        cover: 'https://zh.followlyrics.com/storage/84/838361.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E9%A1%98%E3%81%84%EF%BD%9E%E3%81%82%E3%81%AE%E9%A0%83%E3%81%AE%E3%82%AD%E3%83%9F%E3%81%B8-%E7%95%B6%E5%B1%B1%E3%81%BF%E3%82%8C%E3%81%84.lrc',
    }, {
        name: '茜さす',
        artist: 'Aimer',
        url: 'https://www.dropbox.com/scl/fi/bwtdhhxscv70q9s6f7yqc/.mp3?rlkey=0qmdwfeq7nqvaub0g5asiqepz&raw=1',
        cover: 'https://ro69-bucket.s3.amazonaws.com/uploads/text_image/image/341056/width:750/resize_image.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E9%A1%98%E3%81%84%EF%BD%9E%E3%81%82%E3%81%AE%E9%A0%83%E3%81%AE%E3%82%AD%E3%83%9F%E3%81%B8-%E7%95%B6%E5%B1%B1%E3%81%BF%E3%82%8C%E3%81%84.lrc',
    }, {
        name: 'Rain',
        artist: '秦基博(Motohiro Hata)',
        url: 'https://www.dropbox.com/scl/fi/bgoe96alx491nxu6nk0ex/Rain.mp3?rlkey=wej140wmf90irs5ekvxtxxr5l&raw=1',
        cover: 'https://images.genius.com/0e2c2c5f015b011a77793831331e8372.1000x992x1.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Rain-%E7%A7%A6%E5%9F%BA%E5%8D%9A(%E3%81%AF%E3%81%9F%E3%82%82%E3%81%A8%E3%81%B2%E3%82%8D).lrc',
    }, {
        name: 'remember',
        artist: 'Uru',
        url: 'https://www.dropbox.com/scl/fi/aawjmc8taixm4ngh9ab13/remember.mp3?rlkey=7ir1uou6a7sx39h4deushc7h2&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b273907c9c56af7a64ad6b528593',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/remember-uru.lrc',
    }, {
        name: 'AI DO.',
        artist: '桥本美雪',
        url: 'https://www.dropbox.com/scl/fi/f1xm57rpr9icc4x94ozp2/AI-DO..mp3?rlkey=wdfr48kwgpuzeu9yq3bzkskcs&raw=1',
        cover: 'https://medium-media.vgm.io/albums/70/37707/37707-1559760648.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/AIDO.-桥本美雪.lrc',
    }, {
        name: 'Apple And Cinnamon',
        artist: '宇多田ヒカル',
        url: 'https://www.dropbox.com/scl/fi/5806o4b1dnnkqa5508jp2/Apple-And-Cinnamon.mp3?rlkey=ecew0tnkx5bg21err0f04nsb5&raw=1',
        cover: 'https://i.ytimg.com/vi/2dMu4Fz2M6M/maxresdefault.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/AppleAndCinnamon-宇多田ヒカル.lrc',
    }, {
        name: 'Keep on Keeping on',
        artist: 'SawanoHiroyuki[nZk],aLIEz.',
        url: 'https://www.dropbox.com/scl/fi/xi3by1zk9hq0guhgh2dad/Keep-on-Keeping-on-SawanoHiroyuki-nZk-aLIEz.mp3?rlkey=tz3u7tsn33yhsefbi4eklep62&raw=1',
        cover: 'https://static.wikia.nocookie.net/hiroyuki-sawano/images/f/fa/AZ_aLIEz_Regular_Cover.jpg/revision/latest?cb=20200808080846',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/KeeponKeepingon-SawanoHiroyuki%5BnZk%5D%2CaLIEz.lrc',
    }, {
        name: 'loser',
        artist: 'KANA-BOON',
        url: 'https://www.dropbox.com/scl/fi/3l6e46bdxk4jyew1l2m59/loser-KANA-BOON.mp3?rlkey=cu1q4anj5z3meh94xevwwc5z5&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27303e166e73d4bfadc04b4b9f9',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/loser-KANA-BOON.lrc',
    }, {
        name: 'Moon',
        artist: 'Perfume',
        url: 'https://www.dropbox.com/scl/fi/3u9gern2gu72mkk2vixvg/Moon-Perfume.mp3?rlkey=wl1jnysqanretnq7g0oskaaln&raw=1',
        cover: 'https://images.genius.com/e33b2dd0777209b8a3c0fd1cbca646b8.1000x1000x1.png',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Moon-Perfume.lrc',
    }, {
        name: 'MOON SIGNAL',
        artist: 'Sphere',
        url: 'https://www.dropbox.com/scl/fi/n0qbhkokqw97abeb1zcvi/MOON-SIGNAL-Sphere.mp3?rlkey=j82e1kwpbe8sr29x6gzf1gjme&raw=1',
        cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/bd/42/86/bd428603-02a7-728c-569e-36aff3ae7879/886448022398.jpg/1200x1200bb.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/MOONSIGNAL-Sphere.lrc',
    }, {
        name: 'One Life',
        artist: 'ナノ',
        url: 'https://www.dropbox.com/scl/fi/x8gpp7pfokmdj3chzxtno/One-Life.mp3?rlkey=p01ibn0yecnox3v5jadht2djd&raw=1',
        cover: 'https://i.ytimg.com/vi/P1pIZu93-zM/maxresdefault.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/OneLife-ナノ.lrc',
    }, {
        name: 'メビウス',
        artist: '鈴木このみ',
        url: 'https://www.dropbox.com/scl/fi/6pr5t5c5nkk1ow41rus5y/.mp3?rlkey=z82hp4i4d8llgnryol0phafot&raw=1',
        cover: 'https://y.qq.com/music/photo_new/T002R300x300M000000wD0sS0UBVgE_1.jpg?max_age=2592000',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/メビウス(梅比乌斯)-鈴木このみ.lrc',
    }, {
        name: 'Damn Good Day',
        artist: '星街すいせい',
        url: 'https://www.dropbox.com/scl/fi/g4aclqh1x5huhjyd8ail7/Damn-Good-Day.mp3?rlkey=v05mqxf9gou5m5osefuymdeuy&raw=1',
        cover: 'https://images.genius.com/b5b197af4217d02a5362b5ee13d40e27.500x500x1.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/DamnGoodDay-星街すいせい.lrc',
    }, {
        name: 'Necro Fantasia feat. 美里',
        artist: 'Alstroemeria Records,美里',
        url: 'https://www.dropbox.com/scl/fi/jzalueavhws89e3x98y2h/Necro-Fantasia-feat.-Alstroemeria-Records.mp3?rlkey=snw3utnynrncts1c0ymsjobbv&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27399e46d544c0d3aeaab238f0e',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/NecroFantasiafeat.美里-AlstroemeriaRecords%2C美里.lrc',
    }, {
        name: 'ぐらでーしょん',
        artist: 'KANA-BOON,北澤ゆうほ',
        url: 'https://www.dropbox.com/scl/fi/c872guiw0kbhjdx13clss/KANA-BOON.mp3?rlkey=l4ppqdutr9n3x594iv30fdygc&raw=1',
        cover: 'https://aop-emtg-jp.s3.amazonaws.com/prod/public/kanaboon/contents/information/fed9d25f2a1e238ebd6e19567b3374e2.png',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/ぐらでーしょん(波淡法)-KANA-BOON%2C北澤ゆうほ.lrc',
    }, {
        name: 'チョ・イ・ス',
        artist: '雨宮天',
        url: 'https://www.dropbox.com/scl/fi/db5h2xmkjpnnnk69n1r28/.mp3?rlkey=wx6lxkn2u67v2sc4xo6p6lzde&raw=1',
        cover: 'https://i.kfs.io/album/global/6259823,3v1/fit/500x500.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/チョ・イ・ス-雨宮天.lrc',
    }, {
        name: 'ひかり',
        artist: 'Flower Flower',
        url: 'https://www.dropbox.com/scl/fi/4cmxzgw7h7xhmdmdq4mxc/Flower-Flower.mp3?rlkey=l77prdj6fxckefsw4cy0t6t30&raw=1',
        cover: 'https://i.scdn.co/image/ab67616d0000b27376a5c13ed7a066fe02a99fa5',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/ひかり-FlowerFlower.lrc',
    }, {
        name: '人形ノ涙',
        artist: '仲村芽衣子',
        url: 'https://www.dropbox.com/scl/fi/q8kjdky66ejxbau87tyka/.mp3?rlkey=8x57dfzqi85fljqq26kywdgv6&raw=1',
        cover: 'https://www.tunecore.co.jp/s3pna/tcj-image-production/u10847/r673576/itd673576.png',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/人形ノ涙-仲村芽衣子.lrc',
    }, {
        name: '喋蝶結び',
        artist: 'ななひら',
        url: 'https://www.dropbox.com/scl/fi/e778vrubb0pnk2rk136gq/.mp3?rlkey=5yaumsodju68uxdkc70503g5s&raw=1',
        cover: 'https://i.ytimg.com/vi/6qKPSd6dEjs/maxresdefault.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/喋蝶結び-ななひら.lrc',
    }, {
        name: '月に唄えば',
        artist: 'サイダーガール',
        url: 'https://www.dropbox.com/scl/fi/r6a2hikiw8feu2oj1i5bk/.mp3?rlkey=f7i58bh5rjjb4i5zbxmgvegkt&raw=1',
        cover: 'https://i.kfs.io/album/global/29413719,0v1/fit/500x500.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/月に唄えば-サイダーガール.lrc',
    }, {
        name: '甘いワナ ~Paint It, Black',
        artist: '宇多田ヒカル',
        url: 'https://www.dropbox.com/scl/fi/zj2jbmny7dfbscq5ak1lx/Paint-It-Black.mp3?rlkey=qc136ambn35iq188w3nwco15x&raw=1',
        cover: 'https://i.kfs.io/album/global/30579665,0v1/fit/500x500.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/甘いワナ~PaintIt%2CBlack-宇多田ヒカル.lrc',
    }, {
        name: '廻廻奇譚',
        artist: 'Eve',
        url: 'https://www.dropbox.com/scl/fi/bdtk1u090yknerderj0ol/Eve.mp3?rlkey=g49nxwhalxa0ifbhyt9lox5nt&raw=1',
        cover: 'https://eveofficial-kaikaiwarutsu.com/img/main_sp_1105.jpg?=',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/廻廻奇譚-Eve.lrc',
    }, {
        name: '足りない音はキミの声',
        artist: '諸星すみれ',
        url: 'https://www.dropbox.com/scl/fi/0lo85a69xnfip52fhgrey/.mp3?rlkey=cqfj0ha3nb4u5f8cfj3nlh7e2&raw=1',
        cover: 'https://i.ytimg.com/vi/goIn3hw1dlE/sddefault.jpg',
        lrc: 'https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/足りない音はキミの声-諸星すみれ.lrc',
    }]
});