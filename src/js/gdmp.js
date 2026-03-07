import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "media-chrome";
import "@waline/client/waline.css";
import "../css/styles.css";
import { ref, get } from "firebase/database";
import { db } from "./utils.js";
import { createIcon } from "./icons.js";
import { Buffer } from "buffer";
import * as mm from "music-metadata-browser";

document.addEventListener("DOMContentLoaded", function () {
  window.Buffer = Buffer;
  const form = document.getElementById("folderForm");
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
  const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
  const intro = document.getElementById("intro");
  const LL = document.getElementById("loadLinkButton");
  const CF = document.getElementById("folderchange");
  const next = document.getElementById("next-btn");
  const prev = document.getElementById("prev-btn");
  const content = document.getElementById("contents");
  const parent = document.getElementById("parentfolder");
  const audio = document.getElementById("audio");
  const source = document.getElementById("source");
  const fileTree = document.getElementById("file-tree");
  const trackNameEl = document.getElementById("track-name");
  const artistNameEl = document.getElementById("artist-name");
  const coverArtEl = document.querySelector(".cover-art");
  const stopBtn = document.getElementById("stopBtn");
  const lyricDisplay = document.getElementById("current-lyric");
  const loading = "Loading....";

  let tokenClient;
  let gapiInited = false;
  let gisInited = false;
  let playing;
  let currentLyricsArray = [];
  let lastLyricIndex = -1;
  let file;

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
  }

  function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
  }

  async function initializeGapiClient() {
    await gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
  }

  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_CLIENTID,
      scope: SCOPES,
      callback: "",
    });
    gisInited = true;
  }

  function handleAuthClick(folderId) {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
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
      gapi.client.drive.about
        .get({
          fields: "user",
        })
        .then(function (response) {
          window.location.hash = "#~" + response.result.user.permissionId;
          localStorage.setItem("email", response.result.user.emailAddress);
        });
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({
        prompt: "",
        login_hint: localStorage.getItem("email"),
      });
    } else {
      tokenClient.requestAccessToken({
        prompt: "",
        login_hint: localStorage.getItem("email"),
      });
    }
  }

  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      // can use this to simulate expired token
      gapi.client.setToken("");
    }
  }

  function getContents(id, type) {
    var contentsQuery = "'" + id + "'" + " in parents and trashed = false ";
    gapi.client.drive.files
      .list({
        pageSize: 1000,
        q: contentsQuery,
        orderBy: "name",
        fields: "nextPageToken, files(id, name, mimeType, webContentLink)",
      })
      .then(function (response) {
        // Hide intro and show content
        intro.style.display = "none";
        content.style.display = "block";

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
            file = files[i];
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
            } else if (file.mimeType.includes("audio")) {
              const trackContainer = document.createElement("div");
              trackContainer.className = "track-container";

              const safeFileJSON = encodeURIComponent(JSON.stringify(file));

              const button = document.createElement("button");
              button.className = "track";
              button.dataset.file = safeFileJSON;
              button.innerHTML = `
              <span class="track-icon">${createIcon("play")}</span>
              <span class="track-name">${file.name}</span>
            `;

              button.addEventListener("click", () => {
                playTrack(button, "link");
              });

              const download = document.createElement("a");
              download.href = file.webContentLink;
              download.download = file.name;
              download.className = "download";
              download.innerHTML = `${createIcon("download")} `;

              trackContainer.appendChild(button);
              trackContainer.appendChild(download);
              container.appendChild(trackContainer);
            }
          }

          container.classList.add("loaded");
        } else {
          showNotification("No files found.", "warning");
        }

        container.firstElementChild.focus();
      })
      .catch(function (error) {
        if (error.status === 401) {
          showNotification(
            "Sessions are only valid for 1 hour. Session will refresh automatically.",
            "warning",
          );
          tokenClient.requestAccessToken({
            prompt: "",
            login_hint: localStorage.getItem("email"),
          });
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

  async function playTrack(element, type) {
    const stationDataString = element.dataset.file;
    if (!stationDataString) {
      console.error("Missing file data on track button.");
      return;
    }
    file = JSON.parse(decodeURIComponent(stationDataString));

    const id = file.id;

    if (element == playing) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
      return;
    }
    trackNameEl.textContent = loading;
    artistNameEl.textContent = loading;
    lyricDisplay.textContent = loading;
    await stopPlayback();
    // check for something already 'playing'
    if (playing) {
      const previousContainer = playing.closest(".track-container");
      if (previousContainer) {
        previousContainer.classList.remove("is-playing");
      }
      resetIconToPlay();
      playing.classList.remove("playing");
    }

    // set new track
    element.classList.add("playing");
    playing = element;
    const newContainer = playing.closest(".track-container");
    if (newContainer) {
      newContainer.classList.add("is-playing");
    }

    if (type === "demo") {
      const demoUrl = `/assets/music/${id}.mp3`;
      source.src = demoUrl;
      audio.load();
      audio.oncanplay = () => {
        audio.play();
        updateMediaSession({ name: id, url: demoUrl });
      };
      return;
    }
    // public link
    if (type === "link") {
      fetch(
        `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${import.meta.env.VITE_GD_API_KEY}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.blob();
        })
        .then((blob) => {
          source.src = URL.createObjectURL(blob);
          source.type = blob.type;
          audio.load();
          audio.oncanplay = () => {
            audio.play();
            updateMediaSession(file, blob);
          };
        })
        .catch((error) => {
          console.error("Error fetching the public link track:", "warning");
          showNotification("There was an error playing the track.", "warning");
          stopPlayback();
        });
      return;
    }
    // user track
    gapi.client.drive.files
      .get({
        fileId: id,
        alt: "media",
      })
      .then(function (response) {
        const dataArr = Uint8Array.from(
          response.body.split("").map((chr) => chr.charCodeAt(0)),
        );
        file = new File([dataArr], "audiofilename", {
          type: response.headers["Content-Type"],
        });
        source.src = URL.createObjectURL(file);
        source.type = response.headers["Content-Type"];
        audio.load();
        audio.oncanplay = () => {
          audio.play();
          updateMediaSession(file, file);
        };
      })
      .catch(function (error) {
        if (error.status === 401) {
          showNotification(
            "Sessions are only valid for 1 hour. Session will refresh automatically.",
            "warning",
          );
          tokenClient.requestAccessToken({
            prompt: "",
            login_hint: localStorage.getItem("email"),
          });
        }
      });
  }

  async function updateMediaSession(file, blob = null) {
    const rawFileName = file.name || "Unknown Track";
    const cleaned = rawFileName.replace(
      /\.(mp3|m4a|ogg|wav|flac|aac|wma)$/i,
      "",
    );
    const dashCount = (cleaned.match(/ - /g) || []).length;

    let fallbackArtist = cleaned;
    let fallbackTitle = cleaned;

    if (dashCount === 1) {
      const parts = cleaned.split(" - ", 2);
      fallbackArtist = parts[0].trim();
      fallbackTitle = parts[1].trim();
    }
    let metadata = null;
    let coverUrl = "/assets/sasalele_logo.webp";
    let rawLyrics = "";

    try {
      if (blob) {
        metadata = await mm.parseBlob(blob);
      } else if (file.url) {
        metadata = await mm.fetchFromUrl(file.url);
      }
    } catch (e) {
      console.error("Parser Error Details:", e);
      console.log("Blob info:", blob.type, blob.size);
    }

    const finalTitle = metadata?.common.title || fallbackTitle;
    const finalArtist = metadata?.common.artist || fallbackArtist;

    if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
      rawLyrics = metadata.common.lyrics[0];
      console.log(rawLyrics);
    } else {
      const id3 =
        metadata.native["ID3v2.3"] || metadata.native["ID3v2.4"] || [];
      const usltTag = id3.find((tag) => tag.id === "USLT");
      if (usltTag) {
        rawLyrics = usltTag.value.text || usltTag.value;
      }
    }

    if (rawLyrics) {
      const syncedLyrics = parseLrc(rawLyrics);
      if (syncedLyrics.length > 0) {
        setupLyricSync(audio, syncedLyrics);
      } else {
        lyricDisplay.textContent = "";
      }
    }

    if (metadata?.common.picture?.[0]) {
      const pic = metadata.common.picture[0];
      coverUrl = URL.createObjectURL(
        new Blob([pic.data], { type: pic.format }),
      );
    }

    trackNameEl.textContent = finalTitle;
    artistNameEl.textContent = finalArtist;
    coverArtEl.src = coverUrl;
    document.title = cleaned;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: finalTitle,
        artist: finalArtist,
        album: metadata?.common.album || "GDMP",
        artwork: [{ src: coverUrl, sizes: "512x512" }],
      });
    }
    navigator.mediaSession.setActionHandler("play", () => audio.play());
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  }

  function parseLrc(lrcText) {
    const lines = lrcText.replace(/^.*\|\|/, "").split(/\r?\n/);
    const lrcArray = [];

    const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    lines.forEach((line) => {
      const matches = line.match(timeExp);
      if (matches) {
        const text = line.replace(timeExp, "").trim();
        matches.forEach((match) => {
          const t =
            timeExp.exec(match) || /\[(\d{2}):(\d{2})\.(\d{2,3})\]/.exec(match);
          if (t) {
            const minutes = parseInt(t[1]);
            const seconds = parseInt(t[2]);
            const ms = parseInt(t[3].padEnd(3, "0"));
            const time = (minutes * 60 + seconds) * 1000 + ms;

            lrcArray.push({ time, text });
          }
          timeExp.lastIndex = 0;
        });
      }
    });
    return lrcArray.sort((a, b) => a.time - b.time);
  }

  function setupLyricSync(audioElement, lrcArray) {
    currentLyricsArray = lrcArray;
    lastLyricIndex = -1;

    audioElement.ontimeupdate = () => {
      if (!currentLyricsArray.length) return;

      const currentTimeMs = audioElement.currentTime * 1000;

      let index = currentLyricsArray.findIndex((line, i) => {
        const nextLine = currentLyricsArray[i + 1];
        return (
          currentTimeMs >= line.time &&
          (!nextLine || currentTimeMs < nextLine.time)
        );
      });

      if (index !== -1 && index !== lastLyricIndex) {
        lastLyricIndex = index;
        const activeLine = currentLyricsArray[index];

        lyricDisplay.style.opacity = 0;
        setTimeout(() => {
          lyricDisplay.textContent = activeLine.text;
          lyricDisplay.style.opacity = 1;
        }, 50);
      }
    };
  }

  function prevTrack() {
    if (!playing) return;
    const prevButton = playing
      .closest(".track-container")
      .previousElementSibling?.querySelector(".track");
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
    const nextButton = playing
      .closest(".track-container")
      .nextElementSibling?.querySelector(".track");
    if (nextButton) {
      resetIconToPlay();
      nextButton.click();
    }
  }

  function resetIconToPlay() {
    if (!playing) return;

    const iconContainer = playing.querySelector(".track-icon");
    if (iconContainer) {
      iconContainer.innerHTML = createIcon("play");
    }
    const barsElement = playing.querySelector("#bars");
    if (barsElement) {
      barsElement.remove();
    }
  }

  function resetIconToPause() {
    if (!playing) return;
    const iconContainer = playing.querySelector(".track-icon");
    if (iconContainer) {
      iconContainer.innerHTML = createIcon("pause");
    }
    const indicator = `
    <div id="bars">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  `;
    if (!playing.querySelector("#bars")) {
      playing.insertAdjacentHTML("beforeend", indicator);
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
  };
  audio.onplay = function () {
    resetIconToPause();
  };

  function changeFolder() {
    intro.style.display = "block";
    parent.focus();
    content.style.display = "none";
    content.classList.remove("loaded");
    content.innerHTML = "";
    localStorage.removeItem("email");
  }

  async function loadFolders() {
    const webRef = ref(db, "gdpublic");
    const snapshot = await get(webRef);
    const folders = [];
    try {
      if (!snapshot.exists()) {
        console.error("No data found.");
        return;
      }
      snapshot.forEach((child) => {
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
    const dropdownMenu = document.getElementById("folderDropdownMenu");
    dropdownMenu.innerHTML = "";
    folders.forEach((folder) => {
      const item = document.createElement("a");
      item.className = "dropdown-item";
      item.href = "#";
      item.textContent = folder.title;
      item.dataset.folderId = folder.folderId;
      item.addEventListener("click", (event) => {
        event.preventDefault();
        dropdownMenu
          .querySelectorAll(".dropdown-item.active")
          .forEach((activeItem) => {
            activeItem.classList.remove("active");
          });
        item.classList.add("active");
        clearFileTree();
        fetchDriveFiles(folder.folderId);
        fileTree.style.display = "block";
      });
      dropdownMenu.appendChild(item);
    });
  }

  function clearFileTree() {
    if (!fileTree) return;
    fileTree.innerHTML = "";
  }

  function loadLink() {
    const linkInput = document.getElementById("shareLinkInput");
    const link = linkInput.value.trim();

    if (link === "") {
      showNotification("Please enter a Google Drive folder link.", "warning");
      return;
    }
    clearFileTree();
    const folderIdMatch = link.match(/folders\/([^/?]+)/);

    if (folderIdMatch) {
      const folderId = folderIdMatch[1];
      fetchDriveFiles(folderId);
      fileTree.style.display = "block";
    } else {
      showNotification("Invalid Google Drive folder link.", "warning");
    }
  }

  function fetchDriveFiles(folderId, subfolderContent = null) {
    showLoadingSpinner();
    const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&key=${import.meta.env.VITE_GD_API_KEY}`;
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        displayFolderContents(data.files, subfolderContent);
      })
      .catch((error) => {
        console.error("Error fetching files:", "warning");
      })
      .finally(() => {
        hideLoadingSpinner();
        intro.style.display = "none";
      });
  }

  function displayFolderContents(files, subfolderContent = null) {
    if (files && files.length > 0) {
      files.forEach((file) => {
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
          playButton.innerHTML = `
            <span class="track-icon">${createIcon("play")}</span>
            <span class="track-name">${file.name}</span>
          `;
          playButton.setAttribute("data-file", safeFileJSON);
          playButton.addEventListener("click", () =>
            playTrack(playButton, "link"),
          );
          const downloadLink = document.createElement("a");
          downloadLink.classList.add("download");
          downloadLink.innerHTML = `${createIcon("download")} `;
          downloadLink.href = "#";
          downloadLink.addEventListener("click", (event) =>
            downloadTrack(event, file.id, file.name),
          );

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
      showNotification("No files found.", "warning");
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
    showNotification(`Downloading...`, "success");
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${import.meta.env.VITE_GD_API_KEY}`;
    event.preventDefault();
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const drive = document.createElement("a");
        drive.href = url;
        drive.download = fileName;
        drive.click();
      })
      .catch((error) => {
        console.error("Error downloading the track:", "warning");
        showNotification(
          "There was an error downloading the track.",
          "warning",
        );
      });
  }

  async function stopPlayback() {
    if (!playing) return;
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        source.src = "";
        audio.load();
      }
      if (playing) {
        const previousContainer = playing.closest(".track-container");
        if (previousContainer) {
          previousContainer.classList.remove("is-playing");
        }
        resetIconToPlay();
        playing.classList.remove("playing");
      }
      playing = false;
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = "none";
      }
      coverArtEl.src = "/ball.svg";
      document.title = "Google Drive Music Player";
      if (window.currentCoverUrl) {
        URL.revokeObjectURL(window.currentCoverUrl);
        window.currentCoverUrl = null;
      }
      currentLyricsArray = [];
      lastLyricIndex = -1;
      trackNameEl.textContent = "";
      artistNameEl.textContent = "";
      lyricDisplay.textContent = "";
    } catch (err) {
      console.error("[stopPlayback] unexpected error:", err);
      playing = false;
    }
  }

  showLoadingSpinner();
  loadFolders();
  getFolderId();
  LL.addEventListener("click", loadLink);
  CF.addEventListener("click", changeFolder);
  next.addEventListener("click", nextTrack);
  prev.addEventListener("click", prevTrack);
  form.addEventListener("submit", submitFolderId);
  stopBtn.addEventListener("click", () => {
    stopPlayback();
  });

  document.addEventListener("click", function (event) {
    const target = event.target.closest(".demo-track-btn");
    if (target) {
      file = {
        id: target.dataset.trackId,
      };
      const fileData = { id: file.id };
      target.setAttribute(
        "data-file",
        encodeURIComponent(JSON.stringify(fileData)),
      );

      playTrack(target, "demo");
    }
  });
  initGoogleDrive();
});
