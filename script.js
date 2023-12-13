fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/all.json").then(e => e.json()).then(e => {
    var t, a = document.getElementById("streamInfo"), o = document.getElementById("miniPlayer"), r = document.getElementById("stationName"), c = document.getElementById("radiostations");
    function n(e, t) {
        document.querySelectorAll(".main-play-button").forEach(function (e) {
            e !== t && s(e, !1)
        }),
            o.getAttribute("data-link") === e.url ? o.paused ? (o.play(),
                s(t, !0)) : (o.pause(),
                    s(t, !1)) : (o.src = e.url,
                        o.play(),
                        a.innerHTML = '<a href="' + e.website + '" target="_blank"><img src="' + e.favicon + '"></a>',
                        r.textContent = e.name,
                        o.setAttribute("data-link", e.url),
                        s(t, !0))
    }
    function s(e, t) {
        e.innerHTML = t ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'
    }
    e.forEach(e => {
        var t = document.createElement("div");
        t.className = "widget";
        var a = document.createElement("div");
        a.className = "main-play-button",
            a.innerHTML = '<i class="fas fa-play"></i>';
        var o = document.createElement("a");
        o.className = "player-radio-link",
            o.href = e.website,
            o.target = "_blank",
            o.innerHTML += '<img class="rad-icon" src="' + e.favicon + '"><span class="player-radio-name">' + e.name + "</span>",
            a.addEventListener("click", function () {
                n(e, a)
            }),
            t.appendChild(a),
            t.appendChild(o),
            c.appendChild(t)
    }
    ),
        document.getElementById("miku-gif").addEventListener("click", function () {
            var e = c.querySelectorAll(".widget");
            e[Math.floor(Math.random() * e.length)].querySelector(".main-play-button").click()
        })
}
),
    fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/websites.json").then(e => e.json()).then(e => {
        let t = e.reduce((e, t) => ((e[t.tags] = e[t.tags] || []).push(t),
            e), {});
        Object.entries(t).forEach(([e, t]) => {
            let a = t.map(e => `
            <div class="container">
              <a href="${e.url}" target="_blank">
                <img src="${e.imgSrc}">
                <h5>${e.name}</h5>
              </a>
            </div>
          `).join("");
            "radio" === e ? document.querySelector("#radiohere").innerHTML = a : "website" === e ? document.querySelector("#websitehere").innerHTML = a : "radiojp" === e && (document.querySelector("#radiojphere").innerHTML = a)
        }
        )
    }
    ),
    fetch("https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/downloads.json").then(e => e.json()).then(e => {
        let t = document.querySelector(".download");
        e.forEach(e => {
            let a = document.createElement("div");
            a.className = "container";
            let o = document.createElement("a");
            o.href = e.url,
                o.target = "_blank";
            let r = document.createElement("img");
            r.src = e.imgSrc;
            let c = document.createElement("h5");
            c.textContent = e.name,
                o.append(r, c),
                a.appendChild(o),
                t.appendChild(a)
        }
        )
    }
    );
const searchInput = document.getElementById("searchInput")
    , searchButton = document.getElementById("searchButton")
    , websites = document.querySelectorAll(".button")
    , innerContainer = document.querySelector(".inner")
    , searchTermsContainer = document.getElementById("searchTerms");
function lastfmSearch(e) {
    var t = "https://ws.audioscrobbler.com/2.0/?method=track.search&format=json";
    fetch(t += `&api_key=b9747c75368b42160af4301c2bf654a1&track=${e}`, {
        method: "GET",
        redirect: "follow"
    }).then(function (e) {
        if (e.ok)
            return e.json();
        throw Error(e.statusText)
    }).then(function (e) {
        console.log("song title search:", e),
            displaysongSearch(e)
    }).catch(function (e) {
        console.log("Error from lastfm song title API:", e)
    })
}
function displaysongSearch(e) {
    searchInput.value.trim(),
        document.getElementById("lastFMInfo").innerHTML = "";
    for (var t = document.getElementById("lastFMInfo"), a = document.createElement("ul"), o = 0; o < 5; o++) {
        var r, c = "<li>" + e.results.trackmatches.track[o].name + " - " + e.results.trackmatches.track[o].artist + "</li>";
        console.log(c),
            a.innerHTML += c
    }
    t.appendChild(a)
}
function YouTubeSearch(e) {
    var t = document.querySelector("#YouTubeVideo");
    "none" === t.style.display && (t.style.display = "block");
    var a = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${e}&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s`;
    console.log(a),
        fetch(a).then(function (e) {
            if (e.ok)
                return e.json();
            throw Error(e.statusText)
        }).then(function (e) {
            console.log(e.items[0].id.videoId);
            var t = e.items[0].id.videoId;
            document.getElementById("YouTubeVideo").src = "https://www.youtube.com/embed/" + t
        }).catch(function (e) {
            console.log("Error from Youtube by song title API:", e)
        })
}
searchButton.addEventListener("click", () => {
    let e = searchInput.value.trim();
    "" !== e ? (innerContainer.style.display = "block",
        searchTermsContainer.textContent = e,
        YouTubeSearch(e),
        lastfmSearch(e)) : searchInput.classList.add("error"),
        searchInput.value = ""
}
),
    searchInput.addEventListener("keyup", function (e) {
        "Enter" === e.key && searchButton.click()
    }),
    document.querySelectorAll('a[href^="#"]').forEach(e => {
        e.addEventListener("click", function (e) {
            e.preventDefault();
            let t = document.querySelector(this.getAttribute("href"));
            t && window.scrollTo({
                top: t.offsetTop - 60,
                behavior: "smooth"
            })
        })
    }
    );
const websiteButtons = document.querySelectorAll(".button");
for (let i = 0; i < websiteButtons.length; i++)
    websiteButtons[i].addEventListener("click", function () {
        let e = this.querySelector(".button-label").textContent
            , t = searchTermsContainer.textContent
            , a = getWebsiteURL(e, t);
        "" !== a && window.open(a, "_blank")
    });
function getWebsiteURL(e, t) {
    let a = encodeURIComponent(t);
    switch (e) {
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
const CLIENT_ID = "993505903479-tk48veqhlu2r1hiu9m2hvaq2l81urnla.apps.googleusercontent.com"
    , DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    , SCOPES = "https://www.googleapis.com/auth/drive.readonly";
let tokenClient, gapiInited = !1, gisInited = !1;
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
    }
        ,
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
        source.src = "https://drive.google.com/uc?id=" + e + "&export=download",
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
    }
    ,
    audio.onpause = function () {
        resetIconToPlay()
    }
    ,
    audio.onplay = function () {
        resetIconToPause()
    }
    ,
    "true" == localStorage.getItem("returning") && null !== localStorage.getItem("parentfolder") ? document.getElementById("return").style.display = "block" : document.getElementById("intro").style.display = "block";
const ap = new APlayer({
    container: document.getElementById("aplayer"),
    fixed: !1,
    autoplay: !1,
    theme: "#b7daff",
    order: "random",
    loop: "all",
    order: "random",
    preload: "auto",
    volume: .7,
    mutex: !0,
    listFolded: !1,
    listMaxHeight: "180px",
    lrcType: 3,
    audio: [{
        name: "Tender affection",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1U-vrE3k8mjDn7oXMkOaj_R_0NkEjtBUt",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "别れ",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1Jfe0I6-h-lRwpki4kkOccl9oVp1M4s96",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "铃羽",
        artist: "村上純",
        url: "https://drive.google.com/uc?export=download&id=1Oqoac1f-RbEIB3IAbSbtYbt5DU_UsZB4",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "スカイクラッドの観測者",
        artist: "いとうかなこ",
        url: "https://drive.google.com/uc?export=download&id=14B4JIiIlqw270lzQh3ldcT7unuJKlAD4",
        cover: "https://images.genius.com/85412180fa59ace8051fcec5f7c2d189.310x312x1.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/スカイクラッドの観測者%20-%20伊藤加奈子.lrc",
        theme: "#2e477e"
    }, {
        name: "technovision",
        artist: "いとうかなこ",
        url: "https://drive.google.com/uc?export=download&id=1OHon13e-9hT90-8NTZCasKuUZ-KmG4sZ",
        cover: "https://y.qq.com/music/photo_new/T002R300x300M000003AGEDl3ESzYk_1.jpg?max_age=2592000",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/technovision%20-%20伊藤加奈子.lrc",
        theme: "#2e477e"
    }, {
        name: "Hacking to the Gate",
        artist: "いとうかなこ",
        url: "https://drive.google.com/uc?export=download&id=10SoFpZxTQaELkm3vq59rOcRRreuEW__j",
        cover: "https://lastfm.freetls.fastly.net/i/u/300x300/5b650b1337564521c5a01360097d3acb.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Hacking%20to%20the%20Gate%20-%20%E4%BC%8A%E8%97%A4%E5%8A%A0%E5%A5%88%E5%AD%90.lrc",
        theme: "#b09456"
    }, {
        name: "GATE OF STEINER (Bonus Track)",
        artist: "佐々木恵梨",
        url: "https://drive.google.com/uc?export=download&id=15NNWq52ZX2xgvFvkVi-7guRAzsR3UN4Z",
        cover: "https://images.genius.com/4ca343c719b10f19dad5806999aad983.500x500x1.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/GATE%20OF%20STEINER%20(Bonus%20Track)%20-%20佐々木恵梨.lrc",
        theme: "#2e477e"
    }, {
        name: "GATE OF STEINER -Piano-",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1atByYgtX0n2AT9a83qLC4RFH4Y6A78oH",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "Dメール",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1uODR-ZBN9_CuVmlJvXjrDcOgbhnCytS1",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "Promise-piano",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1gn9n-ihQCna4r2OOi_i5eXh9Ufs2RFdj",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "いつもこの場所で",
        artist: "あやね",
        url: "https://drive.google.com/uc?export=download&id=1xF5xQnJokaHFnR8lHONtMw01l5zSoF64",
        cover: "https://i.scdn.co/image/ab67616d0000b273423e971ce00d4dc2c6298203",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/いつもこの場所で%20-%20あやね.lrc",
        theme: "#2e477e"
    }, {
        name: "あなたの選んだこの時を",
        artist: "いとうかなこ",
        url: "https://drive.google.com/uc?export=download&id=1w2ZrGoqoQjBmIPzfppm9N0vgwBf_uqtB",
        cover: "https://music.mages.co.jp/wp/wp-content/uploads/2016/08/FVCG1236X.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/あなたの選んだこの時を%20-%20いとうかなこ.lrc",
        theme: "#2e477e"
    }, {
        name: "Believe me",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1ArwDlnOOQBzkV23k4kldQlZ-ScGHmFMe",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "Fake Verthandi",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1DovBpuJ-vmceBFiiN_nUPc0Sqx2XAIkL",
        cover: "https://lyricsfromanime.com/animes-info/steins-gate/cover/steins-gate-lyrics.jpg",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "Gate of Steiner",
        artist: "阿保剛",
        url: "https://drive.google.com/uc?export=download&id=1gmRo2BfJbwVxiGnJHObYjPanZTNpUOS7",
        cover: "https://i.scdn.co/image/ab67616d0000b273d832768a591d9104472c9e0b",
        lrc: "[00:00.00]No lyrics",
        theme: "#2e477e"
    }, {
        name: "前前前世",
        artist: "RADWIMPS",
        url: "https://drive.google.com/uc?export=download&id=1MJsGgodLNQ-sW6xaGUPCeEFrM5KDTISe",
        cover: "https://upload.wikimedia.org/wikipedia/en/c/c8/Radwimps-zenzenzense.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%89%8D%E5%89%8D%E5%89%8D%E4%B8%96%20-%20RADWIMPS.lrc",
        theme: "#ebd0c2"
    }, {
        name: "Butter-Fly",
        artist: "和田光司(By コバソロ & 七穂)",
        url: "https://drive.google.com/uc?export=download&id=1MsP1LkJj8K5k_Dq7kwYGJDbRbXSN4mfP",
        cover: "https://pic-bstarstatic.akamaized.net/ugc/5f4e8eb0f5673ea804c53ffeb6619bcf439d5a5e.jpg@160w_90h_1e_1c_90q",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Butter-Fly%20-%20%E5%92%8C%E7%94%B0%E5%85%89%E5%8F%B8%20(%E3%82%8F%E3%81%A0%20%E3%81%93%E3%81%86%E3%81%98)%20.lrc",
        theme: "#60affe"
    }, {
        name: "Catch the Moment",
        artist: "LiSA",
        url: "https://drive.google.com/uc?export=download&id=1tYigvqC9QoUj5JzTFO_RHEuUIqzxHDmu",
        cover: "https://static.wikia.nocookie.net/jpop/images/1/16/Catchreg.jpg/revision/latest?cb=20170224094844",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Catch%20the%20Moment%20-%20LiSA.lrc",
        theme: "#1973dc"
    }, {
        name: "Baby Don't Know Why",
        artist: "Ms.OOJA",
        url: "https://drive.google.com/uc?export=download&id=1mRjlDRVX3hZAlShGUvfj2KrGO9qaHOpd",
        cover: "https://lastfm.freetls.fastly.net/i/u/300x300/841f28eff51de652924053d376bf9d33",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/baby%20don%E2%80%99t%20know%20why%20-%20Ms.OOJA.lrc",
        theme: "#b38972"
    }, {
        name: "LOSER",
        artist: "米津玄師",
        url: "https://drive.google.com/uc?export=download&id=192n7GXieQ6zrfkrg5HM2YoYsvk8DfuLH",
        cover: "https://image.biccamera.com/img/00000003460188_A01.jpg?sr.dw=320&sr.jqh=60&sr.dh=320&sr.mat=1",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/LOSER%20-%20%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc",
        theme: "#18131a"
    }, {
        name: "打上花火",
        artist: "DAOKO \xd7 米津玄師",
        url: "https://drive.google.com/uc?export=download&id=1sBHIt_Pm7tSwtsu-cDOAwR3ba6KgpkNd",
        cover: "https://upload.wikimedia.org/wikipedia/zh/c/c3/Uchiage_Hanabi_Cover_by_DAOKO.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E6%89%93%E4%B8%8A%E8%8A%B1%E7%81%AB%20-%20%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc",
        theme: "#864378"
    }, {
        name: "終わりの世界から",
        artist: "麻枝 准\xd7やなぎなぎ",
        url: "https://drive.google.com/uc?export=download&id=1L1S0-i1B9LpxYLFOrfZW05If3kKauHIx",
        cover: "https://lastfm.freetls.fastly.net/i/u/300x300/41d1010473c549b0aee1dd16ffb6af70",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%B5%82%E3%82%8F%E3%82%8A%E3%81%AE%E4%B8%96%E7%95%8C%E3%81%8B%E3%82%89%20-%20%E3%82%84%E3%81%AA%E3%81%8E%E3%81%AA%E3%81%8E.lrc",
        theme: "#2e477e"
    }, {
        name: "Break Beat Bark!",
        artist: "神田沙也加",
        url: "https://drive.google.com/uc?export=download&id=1GbZRNlum1WjsHtXHxRrZh3-LYi7ZXBbx",
        cover: "https://i.quotev.com/h7lqxrfxaaaa.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Break%20Beat%20Bark!%20-%20%E7%A5%9E%E7%94%B0%E6%B2%99%E4%B9%9F%E5%8A%A0%20.lrc",
        theme: "#0b2065"
    }, {
        name: "ワイルドローズ",
        artist: "May'n",
        url: "https://drive.google.com/uc?export=download&id=1APZ-CPaM4puJSkDJ4kHnQmPrsxJkIpe4",
        cover: "https://www.animelyrics.com/albums/jpop/mayn/0113a2c4f1ed50e60b79137cd0c5571a562e326f.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%83%AF%E3%82%A4%E3%83%AB%E3%83%89%E3%83%AD%E3%83%BC%E3%82%BA%20-%20Mayn.lrc",
        theme: "#e6c5cd"
    }, {
        name: "My Days",
        artist: "鈴木このみ",
        url: "https://drive.google.com/uc?export=download&id=1IdeRiWzT7KXMDxo60iZtbJdRO1jAMTMw",
        cover: "https://lineimg.omusic.com.tw/img/album/1827658.jpg?v=20200409213429",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/My%20Days%20-%20%E9%88%B4%E6%9C%A8%E3%81%93%E3%81%AE%E3%81%BF.lrc",
        theme: "#544093"
    }, {
        name: "Lemon",
        artist: "米津玄師",
        url: "https://drive.google.com/uc?export=download&id=1CbWp3q5-a30unNqOpCiCJl_QoIbgSTxR",
        cover: "https://upload.wikimedia.org/wikipedia/en/1/12/Kenshi_Yonezu_-_Lemon.png",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Lemon%20-%20%E7%B1%B3%E6%B4%A5%E7%8E%84%E5%B8%AB.lrc",
        theme: "#bfdcda"
    }, {
        name: "小さな恋のうた",
        artist: "コバソロ & 杏沙子",
        url: "https://drive.google.com/uc?export=download&id=1QAQ6XgHgBq48PGwiodumfqhFCowBazxt",
        cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ae/93/23/ae932363-26c8-721b-140f-efc4a9e94742/22UMGIM36963.rgb.jpg/400x400cc.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F%20-%20Kobasolo%20(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E4%B8%83%E7%A9%82%20.lrc",
        theme: "#117cdc"
    }, {
        name: "あとひとつ",
        artist: "コバソロ & こぴ",
        url: "https://drive.google.com/uc?export=download&id=1uJafY4DsI1YDewaiq1I4iJM9Vbwu3Ku7",
        cover: "https://i.scdn.co/image/ab67616d0000b2736101e08696469c595f25deee",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%81%82%E3%81%A8%E3%81%B2%E3%81%A8%E3%81%A4%20-%20Kobasolo%20(%E3%82%B3%E3%83%90%E3%82%BD%E3%83%AD)%E3%81%93%E3%81%B4%20.lrc",
        theme: "#55524b"
    }, {
        name: "キセキ",
        artist: "高橋李依",
        url: "https://drive.google.com/uc?export=download&id=1Irk0h8HwmgShTCuoJvI_SUfI_nwqy1JN",
        cover: "https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%82%AD%E3%82%BB%E3%82%AD%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc",
        theme: "#f8e7aa"
    }, {
        name: "小さな恋のうた",
        artist: "高橋李依",
        url: "https://drive.google.com/uc?export=download&id=1y1zAUF6qxyAAPoZX2pgUgdBNw3pkBbih",
        cover: "https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%B0%8F%E3%81%95%E3%81%AA%E6%81%8B%E3%81%AE%E3%81%86%E3%81%9F%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc",
        theme: "#ed885b"
    }, {
        name: "言わないけどね。",
        artist: "高橋李依",
        url: "https://drive.google.com/uc?export=download&id=13OBc-0kZRFaw10iEUlmeEhLNoteYC7hF",
        cover: "https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E8%A8%80%E3%82%8F%E3%81%AA%E3%81%84%E3%81%91%E3%81%A9%E3%81%AD%E3%80%82-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc",
        theme: "#f8e7aa"
    }, {
        name: "愛唄",
        artist: "高橋李依",
        url: "https://drive.google.com/uc?export=download&id=1pDg6f6wdl4p6RPbvC7rJdq-oxfB3AGii",
        cover: "https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E6%84%9B%E5%94%84%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc",
        theme: "#ed885b"
    }, {
        name: "奏(和聲版)",
        artist: "高橋李依 x 雨宫天",
        url: "https://drive.google.com/uc?export=download&id=1c1YrHvdWhUF-ZMYEyxqQq5eg8Ce63B3A",
        cover: "https://i.scdn.co/image/ab67616d0000b27370b8fdc4df4098b686128ed7",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%A5%8F(%E3%81%8B%E3%81%AA%E3%81%A7)%20-%20%E9%AB%98%E6%A9%8B%E6%9D%8E%E4%BE%9D.lrc",
        theme: "#a68461"
    }, {
        name: "生きていたんだよな",
        artist: "あいみょん",
        url: "https://drive.google.com/uc?export=download&id=1IggcHU8UHKOfVvKlxgXv8zqZ_ywc2JVx",
        cover: "https://c-cl.cdn.smule.com/rs-s79/arr/42/5e/937aa21e-3491-4122-ac03-daebcc96c421.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%94%9F%E3%81%8D%E3%81%A6%E3%81%84%E3%81%9F%E3%82%93%E3%81%A0%E3%82%88%E3%81%AA%20-%20%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc",
        theme: "#df192b"
    }, {
        name: "空の青さを知る人よ",
        artist: "あいみょん",
        url: "https://drive.google.com/uc?export=download&id=1OEJ7M3mCmHorNihCskaEKsIVH-ofDky_",
        cover: "https://cdn.kdkw.jp/cover_1000/321906/321906000047.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E7%A9%BA%E3%81%AE%E9%9D%92%E3%81%95%E3%82%92%E7%9F%A5%E3%82%8B%E4%BA%BA%E3%82%88-%20%E3%81%82%E3%81%84%E3%81%BF%E3%82%87%E3%82%93.lrc",
        theme: "#10530c"
    }, {
        name: "心做し",
        artist: "鹿乃",
        url: "https://drive.google.com/uc?export=download&id=11FcJbQv8zhmhF42QzXPJ_SSNFV4hXk3F",
        cover: "https://i.scdn.co/image/ab67616d0000b27360f5aef8714e6f44935f32a2",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E5%BF%83%E5%81%9A%E3%81%97%20-%20%E9%B9%BF%E4%B9%83.lrc",
        theme: "#283c5b"
    }, {
        name: "あの世行きのバスに乗ってさらば。",
        artist: "ツユ",
        url: "https://drive.google.com/uc?export=download&id=1CzfPnhSfdxwvEFM4BI9VdLEq7j4UhleD",
        cover: "https://i1.sndcdn.com/artworks-Hcxxf7HYNBPVt7GL-Da1lzQ-t500x500.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E3%81%82%E3%81%AE%E4%B8%96%E8%A1%8C%E3%81%8D%E3%81%AE%E3%83%90%E3%82%B9%E3%81%AB%E4%B9%97%E3%81%A3%E3%81%A6%E3%81%95%E3%82%89%E3%81%B0%E3%80%82-%20%E3%83%84%E3%83%A6.lrc",
        theme: "#232a60"
    }, {
        name: "願い～あの頃のキミへ～",
        artist: "當山みれい",
        url: "https://drive.google.com/uc?export=download&id=12wWGwnIkDaJ_WTgJDSpt632j6cSpHZyq",
        cover: "https://zh.followlyrics.com/storage/84/838361.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E9%A1%98%E3%81%84%EF%BD%9E%E3%81%82%E3%81%AE%E9%A0%83%E3%81%AE%E3%82%AD%E3%83%9F%E3%81%B8%20-%20%E7%95%B6%E5%B1%B1%E3%81%BF%E3%82%8C%E3%81%84.lrc",
        theme: "#163472"
    }, {
        name: "茜さす",
        artist: "Aimer",
        url: "https://drive.google.com/uc?export=download&id=11Iajbd44r2BXFlj9oQ7XNwaQeeMNp4SD",
        cover: "https://ro69-bucket.s3.amazonaws.com/uploads/text_image/image/341056/width:750/resize_image.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/%E9%A1%98%E3%81%84%EF%BD%9E%E3%81%82%E3%81%AE%E9%A0%83%E3%81%AE%E3%82%AD%E3%83%9F%E3%81%B8%20-%20%E7%95%B6%E5%B1%B1%E3%81%BF%E3%82%8C%E3%81%84.lrc",
        theme: "#ec3a36"
    }, {
        name: "Rain",
        artist: "秦基博(Motohiro Hata)",
        url: "https://drive.google.com/uc?export=download&id=1C8DBCYQsMPmWsO60UcZrAduEpAOvQBZ6",
        cover: "https://images.genius.com/0e2c2c5f015b011a77793831331e8372.1000x992x1.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Rain%20-%20%E7%A7%A6%E5%9F%BA%E5%8D%9A%20(%E3%81%AF%E3%81%9F%20%E3%82%82%E3%81%A8%E3%81%B2%E3%82%8D).lrc",
        theme: "#10530c"
    }, {
        name: "remember",
        artist: "Uru",
        url: "https://drive.google.com/uc?export=download&id=1f_Cbi9BNO7ztXSozBHvbdZK2s6EX-wX1",
        cover: "https://i.scdn.co/image/ab67616d0000b273907c9c56af7a64ad6b528593",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/remember%20-%20uru.lrc",
        theme: "#a19cba"
    }, {
        name: "Licht und Schatten",
        artist: "やまだ 豊",
        url: "https://drive.google.com/uc?export=download&id=1LDR5h8-DMGThbbdQm2uYJ1eTyaOQku4K",
        cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/cf/6a/fb/cf6afb88-3e7c-4f6c-f112-0b5be855c88d/MJSA-01158-9.jpg/1200x1200bb.jpg",
        lrc: "[00:00.00]No lyrics",
        theme: "#505d6b"
    }, {
        name: "AI DO.",
        artist: "桥本美雪",
        url: "https://drive.google.com/uc?export=download&id=1eursbJJsDOL9qER4MwW1AYuJoeqzqpS2",
        cover: "https://medium-media.vgm.io/albums/70/37707/37707-1559760648.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/AI%20DO.%20-%20桥本美雪.lrc",
        theme: "#2e477e"
    }, {
        name: "Apple And Cinnamon",
        artist: "宇多田ヒカル",
        url: "https://drive.google.com/uc?export=download&id=1j5ObqJr7Dp8-iBPwUE2cOwGfCBTKhP6d",
        cover: "https://i.ytimg.com/vi/2dMu4Fz2M6M/maxresdefault.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Apple%20And%20Cinnamon%20-%20宇多田ヒカル.lrc",
        theme: "#2e477e"
    }, {
        name: "Keep on Keeping on",
        artist: "SawanoHiroyuki[nZk],aLIEz.",
        url: "https://drive.google.com/uc?export=download&id=1-Jzf5_DcSOoGv0YxhMJL6SmHwIHm8Gpo",
        cover: "https://static.wikia.nocookie.net/hiroyuki-sawano/images/f/fa/AZ_aLIEz_Regular_Cover.jpg/revision/latest?cb=20200808080846",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Keep%20on%20Keeping%20on%20-%20SawanoHiroyuki%5BnZk%5D%2CaLIEz.lrc",
        theme: "#2e477e"
    }, {
        name: "loser",
        artist: "KANA-BOON",
        url: "https://drive.google.com/uc?export=download&id=1XjDVFeJxYAuTFyRpz0NjRSSLxmGwxamy",
        cover: "https://i.scdn.co/image/ab67616d0000b27303e166e73d4bfadc04b4b9f9",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/loser%20-%20KANA-BOON.lrc",
        theme: "#2e477e"
    }, {
        name: "Moon",
        artist: "Perfume",
        url: "https://drive.google.com/uc?export=download&id=1Z5iIqe88-uOmxLoNoyI3xYGSVIepdHQd",
        cover: "https://images.genius.com/e33b2dd0777209b8a3c0fd1cbca646b8.1000x1000x1.png",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Moon%20-%20Perfume.lrc",
        theme: "#2e477e"
    }, {
        name: "MOON SIGNAL",
        artist: "Sphere",
        url: "https://drive.google.com/uc?export=download&id=1xllFxj_tgO9hS6NDVXNS70w0U0o9NUe9",
        cover: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/bd/42/86/bd428603-02a7-728c-569e-36aff3ae7879/886448022398.jpg/1200x1200bb.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/MOON%20SIGNAL%20-%20Sphere.lrc",
        theme: "#2e477e"
    }, {
        name: "One Life",
        artist: "ナノ",
        url: "https://drive.google.com/uc?export=download&id=1vVIjhIPcoIy9kFyXlQ6lRdLvgbQWHzhS",
        cover: "https://i.ytimg.com/vi/P1pIZu93-zM/maxresdefault.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/One%20Life%20-%20ナノ.lrc",
        theme: "#2e477e"
    }, {
        name: "メビウス",
        artist: "鈴木このみ",
        url: "https://drive.google.com/uc?export=download&id=1LTG_gNYqbi8-InlhwCWX5g4qUjdyTcRF",
        cover: "https://y.qq.com/music/photo_new/T002R300x300M000000wD0sS0UBVgE_1.jpg?max_age=2592000",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/メビウス%20(梅比乌斯)%20-%20鈴木このみ.lrc",
        theme: "#2e477e"
    }, {
        name: "Damn Good Day",
        artist: "星街すいせい",
        url: "https://drive.google.com/uc?export=download&id=1ckqOgwyg6_x9SU2DwFfsN_DeA3mzr_Lk",
        cover: "https://images.genius.com/b5b197af4217d02a5362b5ee13d40e27.500x500x1.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Damn%20Good%20Day%20-%20星街すいせい.lrc",
        theme: "#2e477e"
    }, {
        name: "Necro Fantasia feat. 美里",
        artist: "Alstroemeria Records,美里",
        url: "https://drive.google.com/uc?export=download&id=1L7WBBBthnEMuZsFF5xMxRNlW3yMGpq-4",
        cover: "https://i.scdn.co/image/ab67616d0000b27399e46d544c0d3aeaab238f0e",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/Necro%20Fantasia%20feat.%20美里%20-%20Alstroemeria%20Records%2C美里.lrc",
        theme: "#2e477e"
    }, {
        name: "ぐらでーしょん",
        artist: "KANA-BOON,北澤ゆうほ",
        url: "https://drive.google.com/uc?export=download&id=d/1gwgKjEVDRrMnN_ocoGqUHoOxSSCEpr68",
        cover: "https://aop-emtg-jp.s3.amazonaws.com/prod/public/kanaboon/contents/information/fed9d25f2a1e238ebd6e19567b3374e2.png",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/ぐらでーしょん%20(波淡法)%20-%20KANA-BOON%2C北澤ゆうほ.lrc",
        theme: "#2e477e"
    }, {
        name: "チョ・イ・ス",
        artist: "雨宮天",
        url: "https://drive.google.com/uc?export=download&id=1peQORjB9Soyh6HGqXWGaYYrkoKzcFat2",
        cover: "https://i.kfs.io/album/global/6259823,3v1/fit/500x500.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/チョ・イ・ス%20-%20雨宮天.lrc",
        theme: "#2e477e"
    }, {
        name: "ひかり",
        artist: "Flower Flower",
        url: "https://drive.google.com/uc?export=download&id=1bB9Xc6eQgzizpofHXi4kbZ7t0GBQ1rog",
        cover: "https://i.scdn.co/image/ab67616d0000b27376a5c13ed7a066fe02a99fa5",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/ひかり%20-%20Flower%20Flower.lrc",
        theme: "#2e477e"
    }, {
        name: "人形ノ涙",
        artist: "仲村芽衣子",
        url: "https://drive.google.com/uc?export=download&id=1gtNNiJ1IBGWwQRPCqpUktyNmfKXcoIkK/view",
        cover: "https://www.tunecore.co.jp/s3pna/tcj-image-production/u10847/r673576/itd673576.png",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/人形ノ涙%20-%20仲村芽衣子.lrc",
        theme: "#2e477e"
    }, {
        name: "喋蝶結び",
        artist: "ななひら",
        url: "https://drive.google.com/uc?export=download&id=1U1K16NyhxdXHaK5qmoFA-pnGmlFovv4g",
        cover: "https://i.ytimg.com/vi/6qKPSd6dEjs/maxresdefault.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/喋蝶結び%20-%20ななひら.lrc",
        theme: "#2e477e"
    }, {
        name: "月に唄えば",
        artist: "サイダーガール",
        url: "https://drive.google.com/uc?export=download&id=1PMJ_9M9TIW0P4p3FiipM2FjP3cKxRcYV",
        cover: "https://i.kfs.io/album/global/29413719,0v1/fit/500x500.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/月に唄えば%20-%20サイダーガール.lrc",
        theme: "#2e477e"
    }, {
        name: "甘いワナ ~Paint It, Black",
        artist: "宇多田ヒカル",
        url: "https://drive.google.com/uc?export=download&id=1yIsl_FxR3MVSZymASn2YEMBhqNDdiAG_",
        cover: "https://i.kfs.io/album/global/30579665,0v1/fit/500x500.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/甘いワナ%20~Paint%20It%2C%20Black%20-%20宇多田ヒカル.lrc",
        theme: "#2e477e"
    }, {
        name: "廻廻奇譚",
        artist: "Eve",
        url: "https://drive.google.com/uc?export=download&id=1IRCmKykQ5XPU-V1CvuySVOgHaLH46nyS",
        cover: "https://eveofficial-kaikaiwarutsu.com/img/main_sp_1105.jpg?=",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/廻廻奇譚%20-%20Eve.lrc",
        theme: "#2e477e"
    }, {
        name: "足りない音はキミの声",
        artist: "諸星すみれ",
        url: "https://drive.google.com/uc?export=download&id=1gfOXMPLl4cnKufGSGC7xWCzk9PgzW5mb",
        cover: "https://i.ytimg.com/vi/goIn3hw1dlE/sddefault.jpg",
        lrc: "https://raw.githubusercontent.com/Mikeexe2/Sasalele-Music-Station/main/Links/lrc/足りない音はキミの声%20-%20諸星すみれ.lrc",
        theme: "#2e477e"
    }, {
        name: "My Hero Is Our Hero",
        artist: "林ゆうき",
        url: "https://drive.google.com/uc?export=download&id=1LzJnvmX_nIXpNzfTTFKXW-UI7vIpFPVP",
        cover: "https://i.discogs.com/qVRNltnVIVbNlE48Ae77GvRfprMQ4VixQ3zjiBMISGM/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTE5ODU4/MDc1LTE2Mjg5NDM5/MDMtODI4OS5qcGVn.jpeg",
        lrc: "[00:00.00]No lyrics",
        theme: "#505d6b"
    }]
});
