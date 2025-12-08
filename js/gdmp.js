import { ref, get } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";
document.addEventListener('DOMContentLoaded', function () {
    const CLIENT_ID = appServices.clientId;
    const db = appServices.db;
    const apiKey = appServices.apiKey;
    const form = document.getElementById('folderForm');
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
    const intro = document.getElementById('intro');
    const LL = document.getElementById('loadLinkButton');
    const CF = document.getElementById('folderchange');
    const next = document.getElementById('next-btn');
    const prev = document.getElementById('prev-btn');
    const content = document.getElementById("contents");
    const parent = document.getElementById('parentfolder');
    const audio = document.getElementById('audio');
    const source = document.getElementById('source');
    const fileTree = document.getElementById("file-tree");

    let tokenClient;
    let gapiInited = false;
    let gisInited = false;
    let playing;

    let folderId = localStorage.getItem("parentfolder");
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.defer = true;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function initGoogleDrive() {
        await loadScript("https://apis.google.com/js/api.js");
        await loadScript("https://accounts.google.com/gsi/client");

        gapiLoaded();
        gisLoaded();
    };


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
            if (folderId == "" || folderId == null) {
                localStorage.setItem("parentfolder", "root");
                parent.value = "root";
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

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.mimeType.includes("application/vnd.google-apps.folder")) {
                        const details = document.createElement("details");
                        details.id = file.id;
                        const summary = document.createElement("summary");
                        summary.textContent = file.name;
                        summary.addEventListener("click", () => {
                            getContents(file.id);
                        });

                        details.appendChild(summary);
                        container.appendChild(details);
                    }
                    else if (file.mimeType.includes("audio")) {
                        const trackContainer = document.createElement("div");
                        trackContainer.className = "track-container";

                        const safeFileJSON = encodeURIComponent(JSON.stringify(file));

                        const button = document.createElement("button");
                        button.className = "track";
                        button.dataset.file = safeFileJSON;
                        button.innerHTML = `<i class="fas fa-play"></i> ${file.name}`;

                        button.addEventListener("click", () => {
                            playTrack(button, "link");
                        });

                        const download = document.createElement("a");
                        download.href = file.webContentLink;
                        download.download = file.name;
                        download.className = "download";
                        download.innerHTML = `<i class="fas fa-download"></i>`;

                        trackContainer.appendChild(button);
                        trackContainer.appendChild(download);
                        container.appendChild(trackContainer);
                    }
                }

                container.classList.add("loaded");
            }
            else {
                alert("No files found.");
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

    function playTrack(element, type) {
        const stationDataString = element.dataset.file;
        if (!stationDataString) {
            console.error("Missing file data on track button.");
            return;
        }
        const file = JSON.parse(decodeURIComponent(stationDataString));
        const id = file.id;
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
            const previousContainer = playing.closest('.track-container');
            if (previousContainer) {
                previousContainer.classList.remove("is-playing");
            }
            resetIconToPlay();
            playing.classList.remove("playing");
        }

        // set new track
        element.classList.add("playing");
        playing = element;
        const newContainer = playing.closest('.track-container');
        if (newContainer) {
            newContainer.classList.add("is-playing");
        }
        audio.pause();
        source.src = "";
        audio.load();

        showLoadingSpinner();

        if (type === 'demo') {
            // Handle demo track
            source.src = `assets/music/${id}.mp3`;
            audio.load();
            audio.oncanplay = () => {
                audio.play();
                hideLoadingSpinner();
                updateMediaSession(file);
            };
            return;
        }
        // public link
        if (type === 'link') {
            fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${appServices.apiKey}`)
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
                        hideLoadingSpinner();
                        updateMediaSession(file);
                    };
                })
                .catch(error => {
                    console.error('Error fetching the public link track:', error);
                    alert('There was an error playing the track.');
                    hideLoadingSpinner();
                    updateMediaSession(file);
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
            audio.oncanplay = () => {
                audio.play();
                hideLoadingSpinner();
                updateMediaSession(file);
            };
        }).catch(function (error) {
            if (error.status === 401) {
                alert("Sessions are only valid for 1 hour. Session will refresh automatically.");
                tokenClient.requestAccessToken({ prompt: '', login_hint: localStorage.getItem("email") });
            }
        });
    }

    function updateMediaSession(file) {
        if (!('mediaSession' in navigator)) return;
        const fileName = file.name || 'Unknown Track';
        let trackTitle = fileName;
        let trackArtist = '';

        const cleaned = fileName.replace(/\.(mp3|m4a|ogg|wav|flac|aac|wma)$/i, '');
        const dashCount = (cleaned.match(/ - /g) || []).length;

        if (dashCount === 1) {
            const parts = cleaned.split(' - ', 2);
            if (parts.length === 2) {
                trackArtist = parts[0].trim();
                trackTitle = parts[1].trim();
            }
        } else {
            trackArtist = cleaned;
            trackTitle = cleaned;
        }

        if (document) {
            document.title = cleaned;
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: trackTitle,
            artist: trackArtist,
            album: "GDMP",
            artwork: [{
                src: "assets/sasalele_logo-removebg.webp",
                sizes: '96x96'
            }]
        });
    }

    function prevTrack() {
        if (!playing) return;
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
        if (!playing) return;
        const nextButton = playing.closest('.track-container').nextElementSibling?.querySelector('.track');
        if (nextButton) {
            resetIconToPlay();
            nextButton.click();
        }
    }

    function resetIconToPlay() {
        const iconElement = playing.querySelector('i');
        if (iconElement) {
            iconElement.classList.remove("fa-pause");
            iconElement.classList.add("fa-play");
        }

        const barsElement = playing.querySelector('#bars');
        if (barsElement) {
            barsElement.remove();
        }
    }

    function resetIconToPause() {
        const iconElement = playing.querySelector('i');
        if (iconElement) {
            iconElement.classList.remove("fa-play");
            iconElement.classList.add("fa-pause");
        }
        const indicator = ` <div id="bars"><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>`;
        if (!playing.querySelector('#bars')) {
            playing.insertAdjacentHTML('beforeend', indicator);
        }
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

    async function loadFolders() {
        const webRef = ref(db, 'gdpublic');
        const snapshot = await get(webRef);
        const folders = [];
        try {
            if (!snapshot.exists()) {
                console.error("No data found.");
                return;
            }
            snapshot.forEach(child => {
                const data = child.val();
                if (data.title && data.folderId) {
                    folders.push(data);
                }
            });
            populateDropdown(folders);
            hideLoadingSpinner();
        } catch (err) {
            console.error("Error loading folders", err);
        }
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

    function loadLink() {
        const linkInput = document.getElementById('shareLinkInput');
        const link = linkInput.value.trim();

        if (link === '') {
            alert('Please enter a Google Drive folder link.');
            return;
        }
        clearFileTree();
        const folderIdMatch = link.match(/folders\/([^/?]+)/);

        if (folderIdMatch) {
            const folderId = folderIdMatch[1];
            fetchDriveFiles(folderId);
            fileTree.style.display = 'block';
        } else {
            alert('Invalid Google Drive folder link.');
        }
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
                intro.style.display = 'none';
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
                    const safeFileJSON = encodeURIComponent(JSON.stringify(file));

                    const playButton = document.createElement("button");
                    playButton.classList.add("track");
                    playButton.innerHTML = `<i class="fas fa-play"></i> ${file.name}`;
                    playButton.setAttribute('data-file', safeFileJSON);
                    playButton.addEventListener("click", () => playTrack(playButton, "link"));
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

    showLoadingSpinner();
    loadFolders();
    getFolderId();
    LL.addEventListener('click', loadLink);
    CF.addEventListener('click', changeFolder);
    next.addEventListener('click', nextTrack);
    prev.addEventListener('click', prevTrack);
    form.addEventListener("submit", submitFolderId);
    document.addEventListener('click', function (event) {
        const target = event.target.closest('.demo-track-btn');
        if (target) {
            const file = {
                id: target.dataset.trackId,
                name: target.dataset.trackName,
            };
            const fileData = { id: file.id, name: file.name };
            target.setAttribute('data-file', encodeURIComponent(JSON.stringify(fileData)));

            playTrack(target, 'demo');
        }
    });
    initGoogleDrive();
});
