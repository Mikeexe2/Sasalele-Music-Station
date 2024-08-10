const CLIENT_ID = '993505903479-tk48veqhlu2r1hiu9m2hvaq2l81urnla.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const intro = document.getElementById('intro');
const content = document.getElementById("contents");
const parent = document.getElementById('parentfolder');
const audio = document.getElementById('audio');
const source = document.getElementById('source');

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

        // set parentfolder as root if nothing set  
        if (localStorage.getItem("parentfolder") == "" || localStorage.getItem("parentfolder") == null) {
            localStorage.setItem("parentfolder", "root");
            folderId = "root";
        }

        // only load initial contents on first auth
        if (!content.classList.contains("loaded")) {
            getContents(folderId, "initial");
        }

        // set user email and URL
        gapi.client.drive.about.get({
            'fields': "user",
        }).then(function (response) {
            window.location.hash = '#~' + response.result.user.permissionId;
            localStorage.setItem("email", response.result.user.emailAddress);
        });
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: '', login_hint: localStorage.getItem("email") });
    } else {
        tokenClient.requestAccessToken({ prompt: '', login_hint: localStorage.getItem("email") });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        // can use this to simulate expired token
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

        // Hide intro and show content
        intro.style.display = 'none';
        content.style.display = 'block';

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
                        <summary onclick="getContents('${file.id}')"><img src=""/><span>${file.name}</span></summary>
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
                    <div class="track-container">
                        <button class="track" onclick="playTrack('${file.id}', this)"><i class="fas fa-play"></i> ${file.name}</button>
                        <a href="${file.webContentLink}" download="${file.name}" class="download"><i class="fas fa-download"></i></a>
                    </div>  
                    `;
                }
                document.getElementById(location).classList.add("loaded");
            }

        } else {
            alert('No files found.');
        }

        document.getElementById(location).firstElementChild.focus();
    }).catch(function (error) {
        if (error.status === 401) {
            alert("Sessions are only valid for 1 hour. Session will refresh automatically.");
            tokenClient.requestAccessToken({ prompt: '', login_hint: localStorage.getItem("email") });
        }
    });
}

function submitFolderId(e) {
    e.preventDefault();
    localStorage.setItem("parentfolder", parent.value);
    handleAuthClick(parent.value);
}

function getFolderId() {
    parent.value = localStorage.getItem("parentfolder");
}

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

    if (type === 'demo') {
        // Handle demo track
        source.src = `assets/music/${id}.mp3`;
        audio.load();
        audio.oncanplay = () => {
            audio.play();
            if (document.getElementById("spinner")) {
                document.getElementById("spinner").remove();
            }
        };
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
    }).catch(function (error) {
        if (error.status === 401) {
            alert("Sessions are only valid for 1 hour. Session will refresh automatically.");
            tokenClient.requestAccessToken({ prompt: '', login_hint: localStorage.getItem("email") });
        }
    });
}

function prevTrack() {
    const prevButton = playing.closest('.track-container').previousElementSibling?.querySelector('.track');
    if (audio.currentTime > 3 || !prevButton) {
        audio.currentTime = 0;
        audio.play();
    } else {
        resetIconToPlay();
        prevButton.click();
    }
}

function nextTrack() {
    const nextButton = playing.closest('.track-container').nextElementSibling?.querySelector('.track');
    if (nextButton) {
        resetIconToPlay();
        nextButton.click();
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

function changeFolder() {
    intro.style.display = 'block';
    parent.focus();
    content.style.display = 'none';
    content.classList.remove("loaded");
    content.innerHTML = "";
    localStorage.removeItem("email");
}