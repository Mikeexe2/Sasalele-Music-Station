const CLIENT_ID = '993505903479-tk48veqhlu2r1hiu9m2hvaq2l81urnla.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
const intro = document.getElementById('intro');
const content = document.getElementById("contents");
const parent = document.getElementById('parentfolder');
const audio = document.getElementById('audio');
const source = document.getElementById('source');
document.getElementById('loadLinkButton').addEventListener('click', loadLink);
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
        var container = document.getElementById(location);
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.mimeType.includes("application/vnd.google-apps.folder")) {
                    container.innerHTML += `
                    <details id="${file.id}">
                        <summary onclick="getContents('${file.id}')"><span>${file.name}</span></summary>
                    </details>
                    `;
                } else if (file.mimeType.includes("audio")) {
                    container.innerHTML += `
                    <div class="track-container">
                        <button class="track" onclick="playTrack('${file.id}', this)"><i class="fas fa-play"></i> ${file.name}</button>
                        <a href="${file.webContentLink}" download="${file.name}" class="download"><i class="fas fa-download"></i></a>
                    </div>  
                    `;
                }
            }
            container.classList.add("loaded");
        } else {
            alert('No files found.');
        }
        container.firstElementChild.focus();
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
    // public link
    if (type === 'link') {
        fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                source.src = URL.createObjectURL(blob);
                source.type = blob.type;
                audio.load();
                audio.oncanplay = () => {
                    audio.play();
                    if (document.getElementById("spinner")) {
                        document.getElementById("spinner").remove();
                    }
                };
            })
            .catch(error => {
                console.error('Error fetching the public link track:', error);
                alert('There was an error playing the track.');
                if (document.getElementById("spinner")) {
                    document.getElementById("spinner").remove();
                }
            });
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
// Public Link
const apiKey = 'AIzaSyBpTSeiuR5sajD1Sss4UnjvzCd9hHroK_Y';
const fileTree = document.getElementById("file-tree");

function loadFolders() {
    fetch("Links/folders.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateDropdown(data);
        })
        .catch(error => {
            console.error('Error fetching folder details:', error);
        });
}

function populateDropdown(folders) {
    const dropdownMenu = document.getElementById('folderDropdownMenu');
    dropdownMenu.innerHTML = '';

    folders.forEach(folder => {
        const item = document.createElement('a');
        item.className = 'dropdown-item';
        item.href = '#';
        item.textContent = folder.title;
        item.dataset.folderId = folder.folderId;

        item.addEventListener('click', (event) => {
            event.preventDefault();
            clearFileTree();
            fetchDriveFiles(folder.folderId);
            fileTree.style.display = 'block';
        });
        dropdownMenu.appendChild(item);
    });
}

function clearFileTree() {
    if (!fileTree) return;
    fileTree.innerHTML = '';
}

function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function fetchDriveFiles(folderId, subfolderContent = null) {
    showLoadingSpinner();
    const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&key=${apiKey}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayFolderContents(data.files, subfolderContent);
        })
        .catch(error => {
            console.error('Error fetching files:', error);
        })
        .finally(() => {
            hideLoadingSpinner();
        });
}

function displayFolderContents(files, subfolderContent = null) {
    if (files && files.length > 0) {
        files.forEach(file => {
            if (file.mimeType.includes("application/vnd.google-apps.folder")) {
                if (!document.getElementById(file.id)) {
                    const details = document.createElement("details");
                    details.id = file.id;
                    const summary = document.createElement("summary");
                    summary.textContent = file.name;
                    summary.addEventListener("click", () => toggleSubfolder(details));

                    details.appendChild(summary);
                    if (subfolderContent) {
                        subfolderContent.appendChild(details);
                    } else {
                        fileTree.appendChild(details);
                    }
                }
            } else if (file.mimeType.includes("audio")) {
                const trackContainer = document.createElement("div");
                trackContainer.classList.add("track-container");

                const playButton = document.createElement("button");
                playButton.classList.add("track");
                playButton.innerHTML = `<i class="fas fa-play"></i> ${file.name}`;
                playButton.addEventListener("click", () => playTrack(file.id, playButton, "link"));

                const downloadLink = document.createElement("a");
                downloadLink.classList.add("download");
                downloadLink.innerHTML = `<i class="fas fa-download"></i>`;
                downloadLink.href = "#";
                downloadLink.addEventListener("click", (event) => downloadTrack(event, file.id, file.name));

                trackContainer.appendChild(playButton);
                trackContainer.appendChild(downloadLink);
                if (subfolderContent) {
                    subfolderContent.appendChild(trackContainer);
                } else {
                    fileTree.appendChild(trackContainer);
                }
            }
        });
    } else {
        alert('No files found.');
    }
}

function toggleSubfolder(detailsElement) {
    let subfolderContent = detailsElement.querySelector(".subfolder-content");
    if (!subfolderContent) {
        subfolderContent = document.createElement("div");
        subfolderContent.classList.add("subfolder-content");
        detailsElement.appendChild(subfolderContent);
        fetchDriveFiles(detailsElement.id, subfolderContent);
    } else {
        return;
    }
}

function loadLink() {
    const linkInput = document.getElementById('shareLinkInput');
    const link = linkInput.value.trim();

    clearFileTree();

    if (link === '') {
        alert('Please enter a Google Drive folder link.');
        return;
    }
    const folderIdMatch = link.match(/folders\/([^/?]+)/);

    if (folderIdMatch) {
        const folderId = folderIdMatch[1];
        fetchDriveFiles(folderId);
        fileTree.style.display = 'block';
    } else {
        alert('Invalid Google Drive folder link.');
    }
}

function downloadTrack(event, fileId, fileName) {
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    event.preventDefault();
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const drive = document.createElement("a");
            drive.href = url;
            drive.download = fileName;
            drive.click();
        })
        .catch(error => {
            console.error('Error downloading the track:', error);
            alert('There was an error downloading the track.');
        });
}

// Initial call to load folders
loadFolders();