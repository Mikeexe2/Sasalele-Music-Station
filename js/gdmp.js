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
            document.getElementById("spinner") && document.getElementById("spinner").remove()
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