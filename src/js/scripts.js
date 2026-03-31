import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "@waline/client/waline.css";
import "../css/styles.css";
import "media-chrome";
import {
  ref,
  set,
  get,
  onValue,
  query,
  orderByChild,
  limitToLast,
  endBefore,
  child,
  push,
} from "firebase/database";
import { db } from "./utils.js";
import { createIcon } from "./icons.js";
import { generateDropdown } from "./stats.js";

const searchToggleBtn = document.getElementById("searchToggleBtn");
const customStreamToggleBtn = document.getElementById("customStreamToggleBtn");
const searchPanel = document.getElementById("searchPanel");
const customStreamPanel = document.getElementById("customStreamPanel");
const streamUrlInput = document.getElementById("streamUrlInput");
const playStreamButton = document.getElementById("playStreamButton");
const playerContainer = document.getElementById("player");
const togglePlayerButton = document.getElementById("togglePlayer");
const toggleIcon = document.querySelector("#togglePlayer .toggle-icon");
const coverImage = document.getElementById("ip");
const nowPlaying = document.getElementById("nowPlaying");
const stationCount = document.getElementById("station-count");
const historyDisplay = document.getElementById("historyBtn");
const randomplay = document.getElementById("toggleRandom");
const stopBtn = document.getElementById("stopBtn");
const copyIcon = document.getElementById("copyIcon");
const copyIconSymbol = copyIcon.querySelector(".fa-copy");
const confirmation = document.querySelector("#copyIcon .copy-confirmation");
const searchIcon = document.getElementById("searchIcon");
const stationSearch = document.getElementById("sasalelesearch");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResultsWrapper = document.getElementById("searchResultsWrapper");
const dismissBtn = document.getElementById("dismissSearchResults");
const searchResultsCollapse = document.getElementById("searchResultsCollapse");
const VideoDisplay = document.getElementById("YouTubeVideo");
const innerlastfm = document.getElementById("lastfmList");
const inneritunes = document.getElementById("itunesList");
const innerdeezer = document.getElementById("deezerList");
const metadataElement = document.getElementById("metadataDisplay");
const genreSelect = document.getElementById("genre-select");
const toggleButton = document.getElementById("toggleButton");
const sidePanel = document.getElementById("sidePanel");
const hideButton = document.getElementById("hideButton");
const searchNavLink = document.querySelector(".search-nav-link");
const playlistMenu = document.getElementById("playlistMenu");
const acontainer = document.getElementById("hugeData");
const selectedContainer = document.getElementById("selected");
const recentTracksList = document.getElementById("recentTracksList");
const searchInputCon = document.getElementById("searchInputContainer");
const searchField = document.getElementById("search-field");
const countrySelectContainer = document.getElementById(
  "countrySelectContainer",
);
const countrySelect = document.getElementById("countrySelect");
const languageSelectContainer = document.getElementById(
  "languageSelectContainer",
);
const languageSelect = document.getElementById("languageSelect");
const tagSelectContainer = document.getElementById("tagSelectContainer");
const tagSelect = document.getElementById("tagSelect");
const searchOption = document.getElementById("searchOption");
const findRadioBtn = document.getElementById("radiosearch");
const searchResultHeader = document.getElementById("radio-result-header");
const mediaController = document.getElementById("media-controller");
const aPlayer = document.getElementById("aplayer");
const joinFormEl = document.querySelector(".joinform");
const chatContainerEl = document.querySelector(".chat_container");
const generalBtn = document.getElementById("generalChatBtn");
const mixednutsBtn = document.getElementById("anotherChatBtn");
const MAX_RETRIES = 3;
const coolDown = 1000;
const proxyLink = import.meta.env.VITE_PROXY_LINK;
const visithomepage = "Visit radio's homepage for playing info";
const nometadata = "No Metadata";
const notactive = "Stream endpoint not active";
const debouncedFilterStations = debounce(filterStations, 200);
const searchCache = new Map();
let hlsPlayer = null;
let hlsModules = null;
let icecastPlayer = null;
let icecastModules = null;
let currentStation = null;
let isPlaying = false;
let metadataInterval = null;
let currentSearchTerm = "";
let currentTrack = "";
let ap = null;
let originalTitle = document.title;
let isRandomPlayRunning = false;
let debounceTimeout;
let currentStationsList = [];
let filteredIndices = [];
let lastSearchedContent = null;
let isSearching = false;
let isStoppingPlayback = false;
let shouldStopRetrying = false;
let retryTimeoutId = null;

// utility
const getValidMetadata = (actionName) => {
  const content = metadataElement.textContent.trim();
  const invalidStates = [
    visithomepage,
    nometadata,
    notactive,
    "Loading...",
    "",
  ];

  if (invalidStates.includes(content)) {
    showNotification(`No content to ${actionName}!`, "warning");
    return null;
  }
  return content;
};

function debounce(func, delay = 300) {
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function openPanel(panel, button) {
  panel.style.display = "block";
  panel.style.animation = "slideDown 0.3s ease-out";
  button.setAttribute("data-state", "open");
}

function closePanel(panel, button) {
  panel.style.animation = "slideUp 0.3s ease-out";
  setTimeout(() => {
    panel.style.display = "none";
  }, 300);
  button.setAttribute("data-state", "closed");
}

function togglePanel() {
  sidePanel.classList.toggle("open");
  const isNowOpen = sidePanel.classList.contains("open");
  toggleButton.setAttribute("aria-expanded", isNowOpen);
  toggleButton.innerHTML = createIcon(isNowOpen ? "times" : "comments");
}

function updatePlayerUI(media) {
  coverImage.src = `${media.favicon ? media.favicon : "assets/radios/Unidentified2.webp"}`;
  nowPlaying.innerHTML = `<a href="${media.homepage || media.url}" target="_blank" rel="noopener noreferrer" class="homepagelink" title="Visit ${media.name} homepage">${media.name}</a>`;
  //metaSource.style.display = 'inline-block';
  //metaSource.textContent = `${media.host}`;
}

function displayRecentTracks() {
  const recentTracks = JSON.parse(localStorage.getItem("recentTracks")) || [];
  recentTracksList.innerHTML = "";

  if (recentTracks.length > 0) {
    recentTracks.forEach((track) => {
      const listItem = document.createElement("li");
      listItem.textContent = track;
      listItem.className = "list-group-item";
      recentTracksList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = "No recent tracks found.";
    listItem.className = "list-group-item";
    recentTracksList.appendChild(listItem);
  }
}

function updateMediaSessionMetadata(title, artist, media) {
  const favicon = media.favicon;
  const album = media.name;
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || "Unknown Track",
      artist: artist || album,
      album: album || "Playing Music",
      artwork: [
        {
          src: favicon || "/assets/sasalele_logo.webp",
          sizes: "512x512",
        },
      ],
    });
  }
}

function stopMediaSession() {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = null;
  }
  document.title = originalTitle;
}

function trackHistory(trackName, media) {
  let recentTracks = JSON.parse(localStorage.getItem("recentTracks")) || [];
  const latestTrack = recentTracks[0];

  const cleanTrackName = trackName.replace(
    /\.(mp3|m4a|ogg|wav|flac|aac|wma)$/i,
    "",
  );

  let trackTitle = cleanTrackName;
  let trackArtist = "";

  const dashCount = (cleanTrackName.match(/ - /g) || []).length;

  if (dashCount === 1) {
    const parts = cleanTrackName.split(" - ", 2);
    if (parts.length === 2) {
      trackArtist = parts[0].trim();
      trackTitle = parts[1].trim();
    }
  } else {
    trackArtist = cleanTrackName;
    trackTitle = cleanTrackName;
  }

  updateMediaSessionMetadata(trackTitle, trackArtist, media);
  document.title = `${cleanTrackName}`;

  if (trackName !== latestTrack) {
    recentTracks = recentTracks.filter((track) => track !== trackName);
    recentTracks.unshift(trackName);
    if (recentTracks.length > 300) {
      recentTracks = recentTracks.slice(0, 300);
    }
    localStorage.setItem("recentTracks", JSON.stringify(recentTracks));
  }
}

async function loadGenres() {
  try {
    const snapshot = await get(ref(db, "categories/stations"));
    if (!snapshot.exists()) return;
    const data = snapshot.val();
    const subCategories = data.subCategories || {};
    const sortedGenres = Object.entries(subCategories).sort(
      (a, b) => (Number(a[1].order) || 0) - (Number(b[1].order) || 0),
    );
    let htmlContent = "";
    sortedGenres.forEach(([id, details], index) => {
      const activeClass = index === 0 ? "active" : "";
      htmlContent += `
        <li>
          <span class="genre-pill align-items-center ${activeClass}"
                data-genre="${id}"
                role="button">
                ${details.label}
          </span>
        </li>
      `;
    });
    genreSelect.innerHTML = htmlContent;
    attachGenreListeners();
    if (sortedGenres.length > 0) {
      loadStations(sortedGenres[0][0]);
    }
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
}

async function loadStations(genre) {
  showLoadingSpinner();
  selectedContainer.classList.add("active");
  try {
    const stationsRef = ref(db, `stations/${genre}`);
    const stationsQuery = query(stationsRef, orderByChild("createdAt"));
    const snapshot = await get(stationsQuery);

    if (snapshot.exists()) {
      currentStationsList = [];
      snapshot.forEach((childSnapshot) => {
        currentStationsList.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      currentStationsList.reverse();
      renderStations(currentStationsList);
    } else {
      selectedContainer.innerHTML =
        '<p class="no-stations">No stations available</p>';
    }
  } catch (err) {
    console.error("Error fetching stations:", err);
  } finally {
    hideLoadingSpinner();
    if (currentSearchTerm && currentSearchTerm.trim() !== "") {
      filterStations();
    }
  }
}

function attachGenreListeners() {
  const pills = document.querySelectorAll(".genre-pill");
  pills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      const genre = e.target.getAttribute("data-genre");
      document.querySelector(".genre-pill.active")?.classList.remove("active");
      e.target.classList.add("active");

      e.target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });

      loadStations(genre);
    });
  });
}

function updateToggleIcon() {
  const isMinimized = playerContainer.classList.contains("minimized");
  toggleIcon.innerHTML = isMinimized
    ? createIcon("expand")
    : createIcon("compress");
}

function initializeUI() {
  loadGenres();
  generateDropdown(
    "categories/audioList",
    playlistDropdown,
    playlistMenu,
    (key) => loadPlaylist(key),
    false,
  );

  togglePlayerButton.addEventListener("click", () => {
    playerContainer.classList.toggle("minimized");
    updateToggleIcon();
  });

  if (hideButton) {
    hideButton.addEventListener("click", togglePanel);
  }

  searchToggleBtn.addEventListener("click", () => {
    const isOpen = searchPanel.style.display !== "none";

    if (isOpen) {
      closePanel(searchPanel, searchToggleBtn);
    } else {
      openPanel(searchPanel, searchToggleBtn);
      closePanel(customStreamPanel, customStreamToggleBtn);
    }
  });

  customStreamToggleBtn.addEventListener("click", () => {
    const isOpen = customStreamPanel.style.display !== "none";

    if (isOpen) {
      closePanel(customStreamPanel, customStreamToggleBtn);
    } else {
      openPanel(customStreamPanel, customStreamToggleBtn);
      closePanel(searchPanel, searchToggleBtn);
    }
  });

  searchOption.addEventListener("change", handleSearchOptionChange);

  playStreamButton.disabled = true;

  streamUrlInput.addEventListener("input", () => {
    const hasValue = streamUrlInput.value.trim().length > 0;
    playStreamButton.disabled = !hasValue;
  });

  streamUrlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      playStreamButton.click();
    }
  });

  playStreamButton.addEventListener("click", () => {
    const url = streamUrlInput.value.trim();
    if (!isValidUrl(url)) {
      showNotification("Invalid URL format", "warning");
      return;
    }

    const customStreamMedia = {
      url: url,
      favicon: "/assets/sasalele_logo.webp",
      name: url.split("/").pop() || "Custom Stream",
    };

    const fakeButton = document.createElement("button");
    fakeButton.classList.add("main-play-button");

    playMedia(customStreamMedia, fakeButton);
  });

  if (toggleButton) {
    toggleButton.addEventListener("click", togglePanel);
  }

  stationSearch.addEventListener("input", function () {
    currentSearchTerm = this.value;
    debouncedFilterStations();
  });

  stopBtn.addEventListener("click", () => {
    stopPlayback();
  });

  historyDisplay.addEventListener("click", function () {
    displayRecentTracks();
  });

  copyIcon.addEventListener("click", async () => {
    const content = getValidMetadata("copy");
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      copyIconSymbol.style.display = "none";
      confirmation.style.display = "inline-block";
      setTimeout(() => {
        confirmation.style.display = "none";
        copyIconSymbol.style.display = "inline-block";
      }, 1500);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  });

  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      searchButton.click();
    }
  });

  searchIcon.addEventListener("click", () => {
    const content = getValidMetadata("search");
    if (!content || isSearching) return;

    if (content === lastSearchedContent) {
      showNotification("Search already available!", "info");
      searchIcon.classList.add("search-disabled");
      setTimeout(() => {
        searchIcon.classList.remove("search-disabled");
      }, 300);
      return;
    }

    isSearching = true;
    searchIcon.disabled = true;

    searchInput.value = lastSearchedContent = content;
    searchInput.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    performSearch();

    searchIcon.classList.add("search-active");
    setTimeout(() => {
      isSearching = false;
      searchIcon.disabled = false;
      searchIcon.classList.remove("search-active");
    }, 600);
  });

  dismissBtn.addEventListener("click", () => {
    searchResultsWrapper.style.display = "none";
  });

  findRadioBtn.addEventListener("click", radioSearch);
  searchInputCon.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      radioSearch();
    }
  });

  const websiteButtons = document.querySelectorAll(".togglesearch");
  for (let i = 0; i < websiteButtons.length; i++) {
    websiteButtons[i].addEventListener("click", function () {
      const websiteLabel = this.querySelector(".button-label").textContent;
      const websiteURL = getWebsiteURL(websiteLabel, lastSearchedContent);
      if (websiteURL !== "") {
        window.open(websiteURL, "_blank");
      }
    });
  }
}

if (searchNavLink) {
  searchNavLink.addEventListener("click", handleSearchNavClick);
}

function handleSearchNavClick(e) {
  e.preventDefault();
  const targetId = this.getAttribute("href");
  const targetElement = document.querySelector(targetId);
  if (targetElement) {
    const offset = targetElement.offsetTop - 60;
    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
    setTimeout(() => {
      searchInput.focus();
    }, 150);
  }
}

function renderStations(stations) {
  if (searchResultHeader) {
    searchResultHeader.style.display = "none";
  }
  if (stations.length === 0) {
    selectedContainer.innerHTML =
      '<p class="no-stations">No stations available in this genre</p>';
    return;
  }

  const genreHTML = stations
    .map((station, index) => {
      const tags = station.tags || [];
      const tagsHTML = tags
        .map((tag) => `<span class="tagger">${tag}</span>`)
        .join("");

      return `
        <li data-index="${index}" class="align-items-center station-item">
            <img src="${station.favicon || "assets/radios/Unidentified2.webp"}" 
                 alt="${station.name}" 
                 class="station-img">
            <div class="flex-grow-1 info">
                <h5>${station.name}</h5>
                <div class="d-flex flex-wrap">
                    ${tagsHTML}
                </div>
            </div>
            <div class="ms-3 d-flex button-group">
                <a href="${station.homepage || station.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm p-btn">
                    ${createIcon("external-link-alt")}
                </a>
                <button class="btn btn-sm p-btn download-button">
                ${createIcon("file-arrow-down")}
                </button>
                <button class="btn btn-sm p-btn main-play-button">
                ${createIcon("play")}
                </button>
            </div>
        </li>`;
    })
    .join("");

  selectedContainer.innerHTML = genreHTML;
  if (currentStation) {
    const stationElements =
      selectedContainer.querySelectorAll("li.station-item");
    stationElements.forEach((el) => {
      const index = el.dataset.index;
      const stationAtThisIndex = currentStationsList[index];
      if (stationAtThisIndex && stationAtThisIndex.url === currentStation.url) {
        const playButton = el.querySelector(".main-play-button");
        const currentMediaElement = mediaController && mediaController.media;
        const isCurrentlyPlaying = currentMediaElement
          ? !currentMediaElement.paused
          : false;
        el.classList.add("active-station");
        window.currentlyActiveLi = el;
        if (isCurrentlyPlaying && playButton) {
          playButton.innerHTML = createIcon("pause");
          playButton.setAttribute("data-playing", "true");
        }
      } else {
        el.classList.remove("active-station");
      }
    });
  }
  stationCount.textContent = stations.length;
}

function filterStations() {
  const searchTerm = (currentSearchTerm || "").trim().toLowerCase();
  const items = selectedContainer.querySelectorAll("li.station-item");

  let visibleCount = 0;
  filteredIndices = [];

  currentStationsList.forEach((station, index) => {
    const item = items[index];
    if (!item) return;

    const tagsString = (station.tags || []).join(" ").toLowerCase();
    const match =
      (station.name || "").toLowerCase().includes(searchTerm) ||
      (station.host || "").toLowerCase().includes(searchTerm) ||
      tagsString.includes(searchTerm);

    if (match) {
      item.style.display = "";
      visibleCount++;
      filteredIndices.push(index);
    } else {
      item.style.display = "none";
    }
  });

  updateNoResultsUI(visibleCount, searchTerm);
  stationCount.textContent = visibleCount;
}

function updateNoResultsUI(count, term) {
  let noResults = selectedContainer.querySelector(".no-results");

  if (count === 0 && term.length > 0) {
    if (!noResults) {
      noResults = document.createElement("div");
      noResults.className = "no-results text-center p-5 opacity-50";
      noResults.innerHTML = `${createIcon("search")}</i><p>No matches for "${term}"</p>`;
      selectedContainer.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

randomplay.addEventListener("click", async function () {
  if (isRandomPlayRunning) return;

  const pool =
    currentSearchTerm.trim().length > 0
      ? filteredIndices
      : currentStationsList.map((_, i) => i);

  if (pool.length === 0) {
    showNotification("No visible stations to play", "warning");
    return;
  }

  isRandomPlayRunning = true;

  try {
    const randomIndexInPool = Math.floor(Math.random() * pool.length);
    const actualIndex = pool[randomIndexInPool];
    const media = currentStationsList[actualIndex];

    const randomStationLi = selectedContainer.querySelector(
      `li[data-index="${actualIndex}"]`,
    );

    if (randomStationLi) {
      const playButton = randomStationLi.querySelector(".main-play-button");
      await playMedia(media, playButton);
      randomStationLi.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => (isRandomPlayRunning = false), coolDown);
  }
});

document.addEventListener("click", function (event) {
  const target = event.target.closest(".download-button, .main-play-button");
  if (!target) return;

  if (target.hasAttribute("data-processing")) return;
  target.setAttribute("data-processing", "true");
  setTimeout(() => target.removeAttribute("data-processing"), 1000);

  if (target.classList.contains("download-button")) {
    handleDownloadClick(target);
  } else if (target.classList.contains("main-play-button")) {
    handlePlayClick(target);
  }
});

function handlePlayClick(button) {
  const parentLi = button.closest("li");
  if (!parentLi) return;

  const index = parentLi.dataset.index;
  const mediaData = currentStationsList[index];

  if (!mediaData || !mediaData.url) {
    console.error(
      "[handlePlayClick] Media data not found in global array or missing URL.",
    );
    return;
  }

  const isCurrentlyPlaying = button.getAttribute("data-playing") === "true";
  const currentMedia = mediaController.querySelector('[slot="media"]');

  const isSameStationLoaded =
    currentMedia && currentMedia.src === mediaData.url;

  if (isCurrentlyPlaying) {
    if (currentMedia) {
      currentMedia.pause();
    }
  } else {
    if (isSameStationLoaded) {
      currentMedia.play();
    } else {
      playMedia(mediaData, button);
    }
  }
}

function handleDownloadClick(button) {
  const parentLi = button.closest("li");
  if (!parentLi) return;

  const index = parentLi.dataset.index;
  const media = currentStationsList[index];

  if (media && media.url) {
    showNotification(`Downloading ${media.name}...`, "success");
    RadioM3UDownload(media.url, media.name);
  } else {
    console.error(
      "[handleDownloadClick] Failed to find media in global array.",
    );
  }
}

function RadioM3UDownload(stationURL, stationName) {
  let cleanedURL = stationURL;

  if (cleanedURL.startsWith(proxyLink)) {
    cleanedURL = cleanedURL.substring(proxyLink.length);
  }

  const patternsToRemove = [
    /;stream\.nsv&type=mp3&quot;$/,
    /;&type=mp3$/,
    /;?type=http&nocache$/,
    /jmusicid-backend\?type=http&nocache=2$/,
    /\?type=http&nocache=1$/,
    /stream&nocache=1$/,
    /\?nocache=1$/,
    /;stream\.nsv?nocache=$/,
    /\?type=http$/,
    /\?nocache$/,
    /;&type=mp3$/,
    /;stream\.nsv$/,
  ];

  patternsToRemove.forEach((pattern) => {
    cleanedURL = cleanedURL.replace(pattern, "");
  });

  const newStationURL = cleanedURL;
  const m3uContent = `#EXTM3U\n#EXTINF:-1,${stationName}\n${newStationURL}`;
  const blob = new Blob([m3uContent], { type: "text/plain;charset=utf-8" });

  const radioURL = URL.createObjectURL(blob);
  const downloadRad = document.createElement("a");
  downloadRad.href = radioURL;
  downloadRad.download = `${stationName}.m3u`;
  downloadRad.click();

  URL.revokeObjectURL(radioURL);
}

async function stopPlayback() {
  if (!isPlaying) return;
  if (isStoppingPlayback) return;
  isStoppingPlayback = true;
  shouldStopRetrying = true;

  if (retryTimeoutId) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }

  try {
    if (icecastPlayer) {
      try {
        icecastPlayer.stop();
        if (icecastPlayer.detachAudioElement) {
          await icecastPlayer.detachAudioElement();
        }
      } catch (err) {
        console.error("[stopPlayback] icecast cleanup error:", err);
      }
      icecastPlayer = null;
    }
    if (hlsPlayer) {
      try {
        hlsPlayer.stopLoad();
        hlsPlayer.destroy();
      } catch (err) {
        console.error("[stopPlayback] hls cleanup error:", err);
      }
      hlsPlayer = null;
    }
    const currentMedia = mediaController.querySelector('[slot="media"]');
    if (currentMedia) {
      try {
        currentMedia.pause();
        currentMedia.currentTime = 0;
        currentMedia.removeAttribute("src");
        currentMedia.load();
        await new Promise((resolve) => setTimeout(resolve, 50));
        currentMedia.remove();
      } catch (err) {
        console.error("[stopPlayback] media element cleanup error:", err);
      }
    }
    if (metadataInterval) {
      clearInterval(metadataInterval);
      metadataInterval = null;
    }

    clearActiveStation();
    currentTrack = "";
    currentStation = null;
    coverImage.src = "/ball.svg";
    nowPlaying.innerHTML = "";
    metadataElement.textContent = "";
    stopMediaSession();

    isPlaying = false;
  } catch (err) {
    console.error("[stopPlayback] unexpected error:", err);
    isPlaying = false;
  } finally {
    isStoppingPlayback = false;
  }
}

function clearActiveStation() {
  if (window.currentlyActiveLi) {
    window.currentlyActiveLi.classList.remove("active-station");
    const playButton =
      window.currentlyActiveLi.querySelector(".main-play-button");
    if (playButton) {
      playButton.innerHTML = createIcon("play");
      playButton.setAttribute("data-playing", "false");
    }
    window.currentlyActiveLi = null;
  }
}

function updateActiveStationPlayButton(isPlaying) {
  if (!window.currentlyActiveLi) return;

  const playButton =
    window.currentlyActiveLi.querySelector(".main-play-button");
  if (playButton) {
    if (isPlaying) {
      playButton.innerHTML = createIcon("pause");
      playButton.setAttribute("data-playing", "true");
      playButton.title = "Pause";
    } else {
      playButton.innerHTML = createIcon("play");
      playButton.setAttribute("data-playing", "false");
      playButton.title = "Play";
    }
  }
}

async function playMedia(media, button) {
  await stopPlayback();
  metadataElement.textContent = "Loading...";
  const newAudioElement = document.createElement("audio");
  newAudioElement.setAttribute("slot", "media");
  mediaController.appendChild(newAudioElement);
  newAudioElement.addEventListener("play", () => {
    updateActiveStationPlayButton(true);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
    }
  });
  newAudioElement.addEventListener("pause", () => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
    updateActiveStationPlayButton(false);
  });

  const parentLi = button.closest("li");
  if (parentLi) {
    parentLi.classList.add("active-station");
    window.currentlyActiveLi = parentLi;

    const playButton = parentLi.querySelector(".main-play-button");
    if (playButton) {
      playButton.innerHTML = createIcon("pause");
      playButton.setAttribute("data-playing", "true");
    }
  }

  const hostType = media.host;
  switch (hostType) {
    case "icecast":
    case "zeno":
      playIcecastStream(newAudioElement, media);
      break;
    case "lautfm":
      playLautFM(newAudioElement, media);
      break;
    case "special":
      playSpecial(newAudioElement, media);
      break;
    case "hls":
      playHlsStream(newAudioElement, media);
      break;
    case "unknown":
      playUnknownStream(newAudioElement, media);
      break;
    default:
      if (media.url.includes(".m3u8")) {
        playHlsStream(newAudioElement, media);
      } else {
        playIcecastStream(newAudioElement, media);
      }
      break;
  }
  currentStation = media;
  isPlaying = true;
  updatePlayerUI(media);
}

async function playHlsStream(audioEl, media) {
  if (!hlsModules) {
    const [Hls, jsmediatagsModule] = await Promise.all([
      import("hls.js").then((m) => m.default || m),
      import("jsmediatags/dist/jsmediatags.min.js").then((m) => m.default || m),
    ]);

    hlsModules = {
      Hls,
      jsmediatags: jsmediatagsModule,
    };
  }

  const { Hls, jsmediatags } = hlsModules;

  shouldStopRetrying = false;

  if (!Hls.isSupported()) {
    handleHlsNotSupported(audioEl, media);
    return;
  }

  let retryCount = 0;
  const maxRetries = 3;
  let currentUrl = media.url;
  let isUsingProxy = false;
  const liveTrackName = media.name + " (Live)";
  const originalUrl = media.url;

  const getInitialUrl = () => {
    let urlToUse = originalUrl;

    if (
      originalUrl.startsWith("http://") &&
      !originalUrl.startsWith(proxyLink)
    ) {
      if (isRawIP(originalUrl)) {
        console.warn("[HLS] Skipping proxy for: " + originalUrl);
        showNotification(
          `Allow insecure content on your browser to play this stream or download the m3u file to play it`,
          "warning",
        );
      } else if (proxyLink) {
        urlToUse = proxyLink + originalUrl;
        isUsingProxy = true;
      }
    }
    return urlToUse;
  };

  const createHlsPlayer = (url) => {
    if (shouldStopRetrying) {
      return null;
    }

    try {
      const hlsPlayer = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      return hlsPlayer;
    } catch (err) {
      console.error("[HLS] Failed to create hlsplayer:", err);
      return null;
    }
  };

  const setupHlsEventListeners = (hlsPlayer, url) => {
    if (!hlsPlayer) return;
    hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      if (shouldStopRetrying) return;
      if (data && data.levels && data.levels.length > 0) {
        const stationName = data.levels[0].name || visithomepage;
        metadataElement.textContent = stationName;
        trackHistory(liveTrackName, media);

        try {
          audioEl.play();
          retryCount = 0;
        } catch (err) {
          console.error("[HLS] Play failed:", err);
        }
      }
    });
    hlsPlayer.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
      if (shouldStopRetrying) return;
      data.samples.forEach((sample) => {
        jsmediatags.read(new Blob([sample.data]), {
          onSuccess: (tag) => {
            console.debug("[HLS Debug] jsmediatags success:", tag.tags);
            if (shouldStopRetrying) return;
            let displayText = formatMetadataDisplay(tag.tags, liveTrackName);
            metadataElement.textContent = displayText;
            trackHistory(displayText, media);
          },
          onError: (error) => {
            console.warn("[HLS] ID3 parse error:", error);
            if (!shouldStopRetrying) {
              metadataElement.textContent = nometadata;
              trackHistory(liveTrackName, media);
            }
          },
        });
      });
    });
    hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
      if (shouldStopRetrying) {
        return;
      }

      console.error("[HLS] Error:", data);
      handleHlsError(data, hlsPlayer, url);
    });
  };

  const formatMetadataDisplay = (tags, fallback) => {
    const artist = tags.artist || "";
    const title = tags.title || "";
    const album = tags.album || "";
    const genre = tags.genre || "";
    const comment = tags.comment ? tags.comment.text : "";

    if (artist && title) return `${artist} - ${title}`;
    if (title) return title;
    if (artist) return `By: ${artist}`;
    if (album) return `Album: ${album}`;
    if (genre) return `Genre: ${genre}`;
    if (comment) return comment;
    return fallback;
  };

  const loadStream = (url) => {
    if (shouldStopRetrying) {
      return;
    }
    currentUrl = url;
    hlsPlayer = createHlsPlayer(url);

    if (!hlsPlayer) {
      console.error("[HLS] Failed to create hlsplayer");
      showNotification("Failed to initialize HLS hlsplayer", "danger");
      stopPlayback();
      return;
    }

    try {
      hlsPlayer.loadSource(url);
      hlsPlayer.attachMedia(audioEl);
      setupHlsEventListeners(hlsPlayer, url);

      if (media.api) {
        startMetadataUpdate(media.api, media);
      }
    } catch (err) {
      console.error("[HLS] Failed to load stream:", err);
      showNotification("Failed to load HLS stream", "danger");
      stopPlayback();
    }
  };

  const handleHlsError = (errorData, hlsPlayer, url) => {
    if (!errorData.fatal) {
      handleNonFatalHlsError(errorData, hlsPlayer);
      return;
    }
    handleFatalHlsError(errorData, hlsPlayer, url);
  };

  const handleNonFatalHlsError = (errorData, hlsPlayer) => {
    switch (errorData.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        if (isLoadError(errorData.details)) {
          console.warn(
            "[HLS] Non-fatal network error, attempting recovery:",
            errorData.details,
          );
          scheduleRetry();
        } else {
          showNotification(
            "HLS: Network issue - attempting recovery",
            "warning",
          );
          hlsPlayer.startLoad();
        }
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.warn("[HLS] Non-fatal media error, recovering");
        showNotification("HLS: Media error - attempting recovery", "warning");
        hlsPlayer.recoverMediaError();
        break;
      default:
        console.warn("[HLS] Non-fatal error:", errorData.details);
    }
  };

  const handleFatalHlsError = (errorData, hlsPlayer, url) => {
    console.error("[HLS] Fatal error:", errorData);
    if (isUsingProxy && isLoadError(errorData.details)) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(
          `[HLS] Proxy failed, retry ${retryCount}/${maxRetries}: Switching to original URL`,
        );
        showNotification(
          `Retrying stream... (${retryCount}/${maxRetries})`,
          "warning",
        );
        cleanupHlsPlayer(hlsPlayer);
        currentUrl = originalUrl;
        isUsingProxy = false;
        scheduleHlsRetry(() => loadStream(originalUrl));
        return;
      }
    }
    console.error("[HLS] No more retries available, stopping playback");
    showNotification(
      `Failed to play stream after ${retryCount} attempts`,
      "danger",
    );
    cleanupHlsPlayer(hlsPlayer);
    stopPlayback();
  };

  const isLoadError = (details) => {
    return (
      details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
      details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
      details === Hls.ErrorDetails.FRAG_LOAD_ERROR
    );
  };

  const scheduleHlsRetry = (callback) => {
    if (shouldStopRetrying) {
      return;
    }

    retryTimeoutId = setTimeout(() => {
      if (shouldStopRetrying) {
        return;
      }
      callback();
    }, 1000);
  };

  const scheduleRetry = () => {
    if (retryCount >= maxRetries) {
      showNotification(
        `Failed to play stream after ${maxRetries} attempts`,
        "danger",
      );
      stopPlayback();
      return;
    }

    retryCount++;
    console.log(`[HLS] Scheduling retry ${retryCount}/${maxRetries}`);
    scheduleHlsRetry(() => loadStream(currentUrl));
  };

  const cleanupHlsPlayer = (hlsPlayer) => {
    if (!hlsPlayer) return;

    try {
      hlsPlayer.stopLoad();
      hlsPlayer.destroy();
    } catch (err) {
      console.error("[HLS] Error during hlsplayer cleanup:", err);
    }
  };

  const initialUrl = getInitialUrl();
  loadStream(initialUrl);
}

function handleHlsNotSupported(audioEl, media) {
  if (audioEl.canPlayType("application/vnd.apple.mpegurl")) {
    showNotification("HLS: Using native support", "info");
    audioEl.src = media.url;
    audioEl.play();
  } else {
    metadataElement.textContent = "HLS not supported in this browser";
    showNotification("HLS: Not supported in this browser", "warning");
    isPlaying = false;
  }
}

const shouldRetry = (error) => {
  const errorString = String(error).toLowerCase();

  if (
    error instanceof TypeError ||
    errorString.includes("typeerror") ||
    errorString.includes("failed to fetch")
  ) {
    return true;
  }

  const retryConditions = [
    "securityerror",
    "notsupportederror",
    "aborterror",
    "403",
    "500",
    "network",
    "load",
    "not allowed",
    "supported source",
    "mixed content",
    "connection closed",
    "invalid chunk",
    "cors",
    "cross-origin",
    "access-control-allow-origin",
    "blocked by cors",
    "preflight",
  ];
  return retryConditions.some((condition) => errorString.includes(condition));
};

async function playIcecastStream(audioEl, media) {
  let totalAttempts = 0;
  let originalUrl = media.url;
  let currentUrl = originalUrl;
  let fallbackTriggered = false;

  if (!icecastModules) {
    const [module] = await Promise.all([
      import("icecast-metadata-player").then((m) => m.default || m),
    ]);
    icecastModules = { IcecastMetadataPlayer: module };
  }

  const { IcecastMetadataPlayer } = icecastModules;

  shouldStopRetrying = false;

  if (originalUrl.startsWith("http://") && !originalUrl.startsWith(proxyLink)) {
    if (isRawIP(originalUrl)) {
      console.warn("Skipping proxy for: " + originalUrl);
    } else if (proxyLink) {
      currentUrl = proxyLink + originalUrl;
    }
  }

  const attemptIcecastPlayback = () => {
    if (shouldStopRetrying) {
      return;
    }

    totalAttempts++;
    try {
      icecastPlayer = new IcecastMetadataPlayer(currentUrl, {
        audioElement: audioEl,
        onMetadata: (metadata) => {
          if (shouldStopRetrying) return;
          const currentTitle = metadata.StreamTitle;
          metadataElement.textContent = currentTitle || media.name + " (Live)";
          trackHistory(metadataElement.textContent, media);
        },
        metadataTypes: ["icy"],
        icyDetectionTimeout: 2000,
        enableLogging: false,
        onError: (message) => {
          console.error("[Icecast player] Error:", message);
          handleIcecastError(message);
        },
      });
      icecastPlayer.play().catch((err) => {
        handleIcecastError(err);
      });
    } catch (err) {
      handleIcecastError(err);
    }
  };

  const handleIcecastError = async (error) => {
    if (shouldStopRetrying) {
      await cleanupIcecastPlayer();
      return;
    }

    console.warn(
      `[Icecast] Error (attempt ${totalAttempts}/${MAX_RETRIES + 1}):`,
      error,
    );

    await cleanupIcecastPlayer();

    if (!shouldRetry(error)) {
      await triggerFallbackToUnknown(audioEl);
      return;
    }
    if (totalAttempts >= MAX_RETRIES + 1) {
      await triggerFallbackToUnknown(audioEl);
      return;
    }

    const nextUrl = getNextRetryUrl(currentUrl, originalUrl, error);
    currentUrl = nextUrl;
    showNotification(
      `Retrying stream... (${totalAttempts}/${MAX_RETRIES})`,
      "warning",
    );

    retryTimeoutId = setTimeout(attemptIcecastPlayback, 1000);
  };

  const getNextRetryUrl = (current, original, error) => {
    const isCurrentlyProxy = current.startsWith(proxyLink);
    const errorStr = String(error).toLowerCase();
    const looksLikeCors =
      error instanceof TypeError ||
      errorStr.includes("cors") ||
      errorStr.includes("fetch");

    if (looksLikeCors && !isCurrentlyProxy && proxyLink) {
      console.warn("[Icecast] CORS detected, switching to proxy");
      return proxyLink + original;
    }

    if (isCurrentlyProxy) {
      console.warn("[Icecast] Proxy failed, trying original URL");
      return original;
    }

    if (proxyLink && current === original) {
      console.warn("[Icecast] Retrying with proxy");
      return proxyLink + original;
    }

    return current;
  };

  const cleanupIcecastPlayer = async () => {
    if (icecastPlayer) {
      try {
        icecastPlayer.stop();
        await icecastPlayer.detachAudioElement();
      } catch (err) {
        console.error("[Icecast] Cleanup error:", err);
      }
      icecastPlayer = null;
    }
  };

  const triggerFallbackToUnknown = async (audioEl) => {
    if (fallbackTriggered) return;
    fallbackTriggered = true;
    await cleanupIcecastPlayer();
    audioEl.src = "";
    playUnknownStream(audioEl, media);
  };
  attemptIcecastPlayback();
}

function playLautFM(audioEl, media) {
  audioEl.src = media.url;
  const apiUrl = `https://api.laut.fm/station/${getSpecialID(media.url)}/current_song`;
  startMetadataUpdate(apiUrl, media);
  audioEl.play();
}

function playSpecial(audioEl, media) {
  audioEl.src = media.url;
  let apiUrl;
  if (typeof media.api === "string" && /^https?:\/\//i.test(media.api)) {
    apiUrl = media.api;
  } else {
    apiUrl = `https://scraper2.onlineradiobox.com/${media.api}`;
  }
  startMetadataUpdate(apiUrl, media);
  audioEl.play();
}

function playUnknownStream(audioEl, media) {
  let totalAttempts = 0;
  const originalUrl = media.url;
  let currentUrl = originalUrl;
  let initialUrl = originalUrl;
  shouldStopRetrying = false;
  if (originalUrl.startsWith("http://") && !originalUrl.startsWith(proxyLink)) {
    if (isRawIP(originalUrl)) {
      console.warn("Skipping proxy for: " + originalUrl);
      showNotification(
        "Allow insecure content on your browser to play this stream or download the m3u file to play it",
        "warning",
      );
    } else {
      currentUrl = proxyLink + originalUrl;
      initialUrl = currentUrl;
    }
  }

  const attemptPlayback = () => {
    if (shouldStopRetrying) {
      return;
    }
    totalAttempts++;
    audioEl.src = currentUrl;
    metadataElement.textContent = visithomepage;
    const liveTrackName = media.name + " (Live)";
    trackHistory(liveTrackName, media);
    audioEl.play().catch((err) => {
      handlePlaybackError(err);
    });
  };

  const handlePlaybackError = (error) => {
    if (shouldStopRetrying) {
      return;
    }
    console.warn(
      `Playback error (attempt ${totalAttempts}/${MAX_RETRIES + 1}):`,
      error,
    );

    if (totalAttempts >= MAX_RETRIES + 1) {
      showNotification(
        `Failed to play stream after ${MAX_RETRIES + 1} attempts. Stopping playback.`,
        "danger",
      );
      stopPlayback();
      return;
    }
    if (shouldRetry(error)) {
      retryStream(error);
    } else {
      console.error("Non-retryable error encountered, stopping:", error);
      showNotification(`Stream failed. Stopping playback.`, "danger");
      stopPlayback();
    }
  };

  const retryStream = (error) => {
    if (shouldStopRetrying) {
      return;
    }
    let nextUrl = currentUrl;
    let retryMessage = "";
    const isCurrentlyProxy = currentUrl.startsWith(proxyLink);
    const errorStr = String(error).toLowerCase();
    const looksLikeCors =
      error instanceof TypeError ||
      errorStr.includes("cors") ||
      errorStr.includes("fetch");

    if (looksLikeCors && !isCurrentlyProxy && proxyLink) {
      nextUrl = proxyLink + originalUrl;
      retryMessage = `CORS/Network error detected. Switching to proxy...`;
    } else {
      if (initialUrl !== originalUrl) {
        if (isCurrentlyProxy) {
          nextUrl = originalUrl;
          retryMessage = `Proxy attempt failed. Retrying with original URL...`;
        } else if (proxyLink) {
          nextUrl = proxyLink + originalUrl;
          retryMessage = `Retrying with proxy URL...`;
        }
      }
    }
    currentUrl = nextUrl;
    showNotification(
      retryMessage || `Retrying stream... (${totalAttempts}/${MAX_RETRIES})`,
      "warning",
    );
    retryTimeoutId = setTimeout(attemptPlayback, 1000);
  };
  attemptPlayback();
}

function startMetadataUpdate(apiUrl, media) {
  let activeUrl = apiUrl;
  const isIp = isRawIP(activeUrl);
  if (activeUrl.startsWith("http://") && !activeUrl.startsWith(proxyLink)) {
    if (isIp) {
      showNotification(
        `Allow insecure content to see metadata for this IP stream`,
        "warning",
      );
    } else {
      activeUrl = proxyLink + apiUrl;
    }
  }

  const fetchMetadata = (urlToFetch) => {
    fetch(urlToFetch)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const contentType = (
          response.headers.get("content-type") || ""
        ).toLowerCase();
        if (contentType.includes("application/json")) {
          return response.json();
        } else {
          return response.text();
        }
      })
      .then((data) => {
        let processedData = data;
        if (typeof data === "string") {
          const trimmedData = data.trim();
          if (trimmedData.startsWith("{") || trimmedData.startsWith("[")) {
            try {
              processedData = JSON.parse(trimmedData);
            } catch (e) {
              processedData = trimmedData;
            }
          }
        }
        updateMetadata(processedData, media);
      })
      .catch((error) => {
        if (
          error instanceof TypeError &&
          !urlToFetch.startsWith(proxyLink) &&
          !isIp
        ) {
          activeUrl = proxyLink + apiUrl;
          fetchMetadata(activeUrl);
        } else {
          console.error("Metadata Fetch Error:", error);
          if (isIp) {
            clearInterval(metadataInterval);
          }
          metadataElement.textContent = visithomepage;
        }
      });
  };

  fetchMetadata(activeUrl);
  metadataInterval = setInterval(() => {
    fetchMetadata(activeUrl);
  }, 10000);
}

function getSpecialID(Url) {
  const parts = Url.split("/");
  return parts[parts.length - 1];
}

const isRawIP = (url) => {
  try {
    const hostname = new URL(url).hostname;
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipPattern.test(hostname);
  } catch {
    return false;
  }
};

function updateMetadata(data, media) {
  let streamTitle = nometadata;
  try {
    if (Array.isArray(data)) {
      const current = data[0];
      if (current.track) {
        streamTitle = formatTitle(current.track.artist, current.track.title);
      } else if (current.artist) {
        const artist =
          typeof current.artist === "object"
            ? current.artist.name
            : current.artist;
        streamTitle = formatTitle(artist, current.title);
      } else {
        streamTitle = current.title || nometadata;
      }
    } else if (typeof data === "object" && data !== null) {
      const songEntry = data.result?.entry?.[0]?.song?.entry?.[0];
      const song = data.now_playing?.song;
      if (song && song.artist && song.title) {
        streamTitle = formatTitle(song.artist, song.title);
      } else if (songEntry) {
        const title = songEntry.title;
        const artistName = songEntry.artist?.entry?.[0]?.name;
        streamTitle = formatTitle(artistName, title);
      } else if (data.ArtistName && data.TrackTitle) {
        streamTitle = formatTitle(data.ArtistName, data.TrackTitle);
      } else if (data.result && data.result.data) {
        const current = data.result.data[0];
        streamTitle =
          current.metadata || formatTitle(current.artist, current.title);
      } else if (data.results && Array.isArray(data.results)) {
        streamTitle = data.results[0].metadata;
      } else if (data.songtitle) {
        streamTitle = data.songtitle;
      } else if (data.artist || data.title) {
        const artist =
          typeof data.artist === "object" ? data.artist.name : data.artist;
        const title = data.title;
        streamTitle = formatTitle(artist, title);
      } else if (data.data && (data.data.trackName || data.data.title)) {
        streamTitle = data.data.trackName || data.data.title;
      } else if (data.current || data.currentShow) {
        const currentName = data.current?.name;
        const showName =
          Array.isArray(data.currentShow) && data.currentShow[0]
            ? data.currentShow[0].name
            : null;
        streamTitle = currentName || showName || nometadata;
      } else if (data.nowplaying) {
        streamTitle = data.nowplaying;
      } else if (data.current) {
        const current = data.current;
        streamTitle = formatTitle(current.artist, current.title);
      } else if (data.shoutcast && data.shoutcast.stream) {
        streamTitle = data.shoutcast.stream.currentSong || nometadata;
      } else if (data.song_history) {
        const current = data.song_history[0];
        streamTitle = formatTitle(current.artist, current.title);
      } else if (data.icestats) {
        const stats = data.icestats;
        const sources = Array.isArray(stats.source)
          ? stats.source
          : [stats.source];
        const currentSource =
          sources.find(
            (src) =>
              src.listenurl &&
              media.url.includes(src.listenurl.split(":").pop()),
          ) || sources[0];
        streamTitle =
          currentSource.title || currentSource.server_name || nometadata;
      } else if (data["current-track"]) {
        const track = data["current-track"];
        streamTitle = formatTitle(track.artist, track.title);
      }
    } else if (typeof data === "string") {
      streamTitle = data.trim() || nometadata;
    }
    streamTitle = decodeEntities(streamTitle);
    if (streamTitle !== currentTrack) {
      currentTrack = streamTitle;
      metadataElement.textContent = streamTitle;
      trackHistory(streamTitle, media);
    }
  } catch (error) {
    console.error("Metadata processing error:", error);
    metadataElement.textContent = nometadata;
  }
}

function formatTitle(artist, title) {
  if (artist && title) return `${artist} - ${title}`;
  return artist || title || nometadata;
}

function decodeEntities(text) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
}

// search station with options using RadioBrowser's API
const countries = [
  "United States",
  "Germany",
  "Russia",
  "France",
  "China",
  "United Kingdom",
  "Mexico",
  "Italy",
  "Canada",
  "India",
  "Spain",
  "Brazil",
  "Philippines",
  "Argentina",
  "Netherlands",
  "Turkey",
  "Indonesia",
  "Belgium",
  "Japan",
  "Hungary",
  "Peru",
  "Ukraine",
  "Czechia",
  "Portugal",
  "Sweden",
  "South Africa",
  "Saudi Arabia",
  "Finland",
  "Israel",
  "Kenya",
  "South Korea",
  "Thailand",
  "Pakistan",
  "Nigeria",
  "Iran",
  "Egypt",
  "Vietnam",
  "Malaysia",
  "Colombia",
  "Chile",
  "Romania",
  "Morocco",
  "Ecuador",
  "Kazakhstan",
  "Greece",
  "Austria",
  "Switzerland",
  "Denmark",
  "Norway",
  "Ireland",
];

function populateCountries() {
  countries.forEach(function (country) {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });
}

const languages = [
  "English",
  "Spanish",
  "French",
  "Chinese",
  "Hindi",
  "Arabic",
  "Bengali",
  "Portuguese",
  "Russian",
  "Japanese",
  "German",
  "Korean",
  "Turkish",
  "Italian",
  "Dutch",
  "Polish",
  "Ukrainian",
  "Persian",
  "Malay",
  "Thai",
  "Swahili",
  "Tagalog",
  "Greek",
  "Hungarian",
  "Finnish",
  "Czech",
  "Danish",
  "Swedish",
  "Norwegian",
  "Romanian",
  "Bulgarian",
  "Vietnamese",
  "Indonesian",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Pashto",
  "Farsi",
  "Kurdish",
  "Hausa",
  "Somali",
  "Afrikaans",
];

function populateLanguages() {
  languages.forEach(function (language) {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    languageSelect.appendChild(option);
  });
}

const tags = [
  "pop",
  "music",
  "news",
  "rock",
  "classical",
  "talk",
  "radio",
  "hits",
  "community radio",
  "dance",
  "electronic",
  "80s",
  "oldies",
  "méxico",
  "christian",
  "jazz",
  "classic hits",
  "pop music",
  "top 40",
  "90s",
  "adult contemporary",
  "country",
  "house",
  "house",
  "folk",
  "chillout",
  "soul",
  "top40",
  "news talk",
  "metal",
  "hiphop",
  "techno",
  "rap",
  "sports",
  "ambient",
  "lounge",
  "culture",
  "disco",
  "funk",
  "retro",
  "electro",
  "top hits",
  "world music",
  "edm",
  "latino",
  "international",
  "relax",
  "college radio",
  "catholic",
  "christmas music",
  "pop dance",
  "hip-hop",
  "00s",
  "love songs",
  "club",
  "various",
  "mix",
  "iheart",
  "bible",
  "piano",
  "tech house",
  "vaporwave",
  "dj",
  "anime radio",
  "anime",
  "free japan music",
  "japanese",
  "japanese music",
  "japanese idols",
  "japan",
  "anime openings",
  "animegroove",
];

function populateTags() {
  tags.forEach(function (tag) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagSelect.appendChild(option);
  });
}

function handleSearchOptionChange() {
  const selectedOption = searchOption.value;

  searchInputCon.style.display = "none";
  countrySelectContainer.style.display = "none";
  languageSelectContainer.style.display = "none";
  tagSelectContainer.style.display = "none";

  switch (selectedOption) {
    case "byname":
      searchInputCon.style.display = "inline-block";
      break;
    case "bycountry":
      countrySelectContainer.style.display = "inline-block";
      populateCountries();
      break;
    case "bylanguage":
      languageSelectContainer.style.display = "inline-block";
      populateLanguages();
      break;
    case "bytag":
      tagSelectContainer.style.display = "inline-block";
      populateTags();
      break;
    default:
      break;
  }
  clearSearchField();
}

function clearSearchField() {
  searchField.value = "";
  countrySelect.value = "";
  languageSelect.value = "";
  tagSelect.value = "";
}

function radioSearch() {
  showLoadingSpinner();
  const searchBy = searchOption.value;
  let searchValue = "";
  switch (searchBy) {
    case "byname":
      searchValue = searchField.value.toLowerCase();
      break;
    case "bycountry":
      searchValue = countrySelect.value.toLowerCase();
      break;
    case "bylanguage":
      searchValue = languageSelect.value.toLowerCase();
      break;
    case "bytag":
      searchValue = tagSelect.value.toLowerCase();
      break;
    default:
      break;
  }

  if (searchValue === "" || searchBy === "Search by") {
    showNotification(`Please enter a search term!`, "warning");
    hideLoadingSpinner();
    return;
  }

  fetch(
    `${proxyLink}https://de2.api.radio-browser.info/json/stations/${searchBy}/${searchValue}?hidebroken=true&limit=150&order=clickcount&reverse=true`,
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        document
          .querySelectorAll(".genre-content")
          .forEach((c) => c.classList.remove("active"));
        document
          .querySelector(".genre-pill.active")
          ?.classList.remove("active");

        searchResultHeader.innerHTML = `<div class="search-terms">Top 150 Search Results for: <span class="searchTerms">${searchValue}</span><div>`;
        searchResultHeader.style.display = "block";
        selectedContainer.classList.add("active");
        currentStationsList = [];
        currentStationsList = data.map((radio) => ({
          name: radio.name,
          url: radio.url_resolved || radio.url,
          favicon: radio.favicon,
          homepage: radio.homepage,
          host: "from API",
          tags: radio.tags ? radio.tags.split(",").slice(0, 3) : ["Radio"],
        }));

        const radioHTML = currentStationsList
          .map((radio, index) => {
            const tagsHTML = radio.tags
              .map((tag) => `<span class="tagger">${tag}</span>`)
              .join("");

            return `
                <li data-index="${index}" class="align-items-center p-2 mb-2 station-item">
                    <img src="${radio.favicon || "assets/radios/Unidentified2.webp"}" 
                         alt="${radio.name}" class="station-img">
                    <div class="flex-grow-1 info">
                        <h5>${radio.name}</h5>
                        <div class="d-flex flex-wrap">
                            ${tagsHTML}
                        </div>
                    </div>
                    <div class="ms-3 d-flex button-group">
                        <a href="${radio.homepage || radio.url}" target="_blank" rel="noopener noreferrer"  class="btn btn-sm p-btn">
                        ${createIcon("external-link-alt")}
                        </a>
                      <button class="btn btn-sm p-btn download-button">
                      ${createIcon("file-arrow-down")}
                      </button>
                      <button class="btn btn-sm p-btn main-play-button">
                        ${createIcon("play")}
                      </button>
                    </div>
                </li>`;
          })
          .join("");

        selectedContainer.innerHTML = radioHTML;
        hideLoadingSpinner();
        stationCount.textContent = currentStationsList.length;
      } else {
        hideLoadingSpinner();
        searchResultHeader.style.display = "block";
        searchResultHeader.textContent = "No result found.";
      }
    })
    .catch((error) => {
      hideLoadingSpinner();
      console.error("Error fetching data:", error);
    });
  clearSearchField();
}

function showSearchResults() {
  searchResultsWrapper.style.display = "block";
  searchResultsCollapse.classList.add("show");
}

function performSearch() {
  lastSearchedContent = searchInput.value.trim();
  if (lastSearchedContent !== "") {
    showSearchResults();
    const gscInput = document.querySelector(".gsc-input input");
    const gscClearButton = document.querySelector(".gsst_a");
    if (gscInput && gscClearButton) {
      gscInput.value = "";
      gscClearButton.click();
    }
    if (gscInput) {
      gscInput.value = lastSearchedContent;
      const enterEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        keyCode: 13,
        key: "Enter",
      });
      gscInput.dispatchEvent(enterEvent);
    }

    inneritunes.innerHTML = "";
    innerlastfm.innerHTML = "";
    VideoDisplay.src = "";
    innerdeezer.innerHTML = "";

    searchAcrossApis(lastSearchedContent);
  } else {
    showNotification(`Please enter a search term!`, "warning");
  }
}

async function searchAcrossApis(searchTerm) {
  const services = [
    {
      name: "YouTube",
      url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(searchTerm)}&key=${import.meta.env.VITE_YT_KEY}`,
      render: (data) => {
        const results = data ? formatYoutubeResults(data) : [];
        VideoDisplay.style.display = "block";
        VideoDisplay.src =
          results.length > 0
            ? `https://www.youtube.com/embed/${results[0].videoId}`
            : `https://www.youtube.com/embed/SBQprWeOx8g`;
      },
    },
    {
      name: "Last.fm",
      url: `${import.meta.env.VITE_PROXY}lastfm/search?track=${encodeURIComponent(searchTerm)}`,
      render: (data) => {
        const results = data ? formatLastfmResults(data) : [];
        renderLastfm(results);
      },
    },
    {
      name: "iTunes",
      url: `${proxyLink}https://itunes.apple.com/search?limit=10&media=music&term=${encodeURIComponent(searchTerm)}`,
      render: (data) => {
        const results = data ? formatItunesResults(data) : [];
        renderMusicResults(results, inneritunes, "iTunes");
      },
    },
    {
      name: "Deezer",
      url: `${import.meta.env.VITE_PROXY}deezer/search?q=${encodeURIComponent(searchTerm)}&limit=10`,
      render: (data) => {
        const results = data ? formatDeezerResults(data) : [];
        renderMusicResults(results, innerdeezer, "Deezer");
      },
    },
  ];
  services.forEach(async (service) => {
    const data = await safeJsonFetch(service.url, service.name);
    service.render(data);
  });
}

async function safeJsonFetch(url, apiName) {
  if (searchCache.has(url)) return searchCache.get(url);
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    searchCache.set(url, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${apiName}:`, error);
    return null;
  }
}

function formatLastfmResults(data) {
  if (!data || !data.results || !data.results.trackmatches) {
    return [];
  }
  return data.results.trackmatches.track.map((track) => ({
    title: track.name,
    artist: track.artist,
  }));
}

function formatItunesResults(data) {
  if (!data || !data.results || data.results.length === 0) {
    return [];
  }
  return data.results.map((result) => ({
    trackName: result.trackName,
    artistName: result.artistName,
    collectionName: result.collectionName,
    artworkUrl: result.artworkUrl100,
    previewUrl: result.previewUrl,
    trackId: result.trackId,
  }));
}

function formatYoutubeResults(data) {
  if (!data || !data.items || data.items.length === 0) {
    return [];
  }
  return [
    {
      videoId: data.items[0].id.videoId,
    },
  ];
}

function formatDeezerResults(data) {
  if (!data || !data.data) {
    return [];
  } else if (data.data.length === 0) {
    console.log("Blocked by Deezer?");
  }
  return data.data.map((track) => ({
    title: track.title,
    artist: track.artist.name,
    cover: track.album.cover,
    album: track.album.title,
    preview: track.preview,
  }));
}

function renderLastfm(lastfmResults) {
  if (lastfmResults.length > 0) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < lastfmResults.length; i++) {
      const song = lastfmResults[i];
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.textContent = `${song.artist} - ${song.title}`;
      fragment.appendChild(listItem);
    }
    innerlastfm.appendChild(fragment);
  } else {
    innerlastfm.innerHTML = `<div class="p-3 text-center text-secondary">
    ${createIcon("search")}
      <small>No results found on LastFM</small>
    </div>`;
  }
}

function renderMusicResults(results, container, serviceName) {
  if (results.length === 0) {
    container.innerHTML = `<div class="p-3 text-center text-secondary">
    ${createIcon("search")}
      <small>No results found on ${serviceName}</small>
    </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < results.length; index++) {
    const res = results[index];
    const playerID = `audio-${serviceName}-${index}`;
    const data = {
      img: res.artworkUrl || res.cover,
      artist: res.artistName || res.artist,
      track: res.trackName || res.title,
      album: res.collectionName || res.album,
      audio: res.previewUrl || res.preview,
    };

    const listItem = document.createElement("li");

    listItem.className =
      "list-group-item d-flex align-items-center p-2 border-0 bg-transparent";

    listItem.innerHTML = `
      <img class="search-cover shadow-sm me-3" 
           src="${data.img}" 
           alt="${data.track}" >
      <div class="info flex-grow-1">
          <p class="mb-0 fw-bold">
              ${data.artist} - ${data.track}
          </p>
          <p class="mb-0 album-name">
              ${data.album}
          </p>
          <div class="mt-2">
               <media-controller audio>
                  <audio slot="media" id="${playerID}" src="${data.audio}" preload="none"></audio>
                  <media-control-bar mediacontroller="${playerID}">
                    <media-play-button mediacontroller="${playerID}"></media-play-button>
                    <media-time-display mediacontroller="${playerID}" show-duration></media-time-display>
                    <media-time-range mediacontroller="${playerID}" class="flex-grow-1"></media-time-range>
                  </media-control-bar>
               </media-controller>
          </div>
      </div>
    `;
    fragment.appendChild(listItem);
  }
  container.appendChild(fragment);

  const allAudios = container.querySelectorAll('audio[slot="media"]');
  allAudios.forEach((audio) => {
    audio.addEventListener("play", () => {
      document.querySelectorAll("audio").forEach((other) => {
        if (other !== audio) other.pause();
      });
    });
  });
}

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
    case "VGMdb":
      return `https://vgmdb.net/search?q=${a}`;
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
      return `https://www.google.com/search?q=${a}+歌詞+lyrics`;
    case "Uta-net":
      return `https://www.uta-net.com/search/?target=art&type=in&keyword=${a}`;
    case "MusicBrainz":
      return `https://musicbrainz.org/search?query=${a}&type=work&method=indexed`;
    case "Gnudb":
      return `https://gnudb.org/song/${a}`;
    case "TouhouDB":
      return `https://touhoudb.com/Search?filter=${a}`;
    case "Touhou Fandom":
      return `https://touhou.fandom.com/wiki/Special:Search?query=${a}&scope=internal&navigationSearch=true`;
    case "Touhou Wiki":
      return `https://en.touhouwiki.net/index.php?title=Special:Search&profile=all&search=${a}&fulltext=1`;
    case "LRC Lib":
      return `https://lrclib.net/search/${a}`;
    case "MikuDB":
      return `https://mikudb.moe/?s=${a}`;
    case "ニコニコ動画":
      return `https://www.nicovideo.jp/search/${a}`;
    case "VocaDB":
      return `https://vocadb.net/Search?filter=${a}`;
    case "PetitLyrics":
      return `https://petitlyrics.com/search_lyrics?title=${a}`;
    default:
      return "";
  }
}

class ChatApp {
  constructor() {
    this.chatPaths = {
      general: "chats/general",
      mixednuts: "chats/mixednuts",
    };
    this.currentChatPath = this.chatPaths.general;
    this.currentUser = null;
    this.activeListener = null;
    this.isSending = false;
    this.oldestTimestamp = null;
    this.joinFormEl = joinFormEl;
    this.chatContainerEl = chatContainerEl;
    this.init();
  }

  init() {
    this.setupChatButtons();
    this.checkUserSession();
  }

  setupChatButtons() {
    if (generalBtn && mixednutsBtn) {
      generalBtn.addEventListener("click", () => this.switchChat("general"));
      mixednutsBtn.addEventListener("click", () =>
        this.switchChat("mixednuts"),
      );
    }
  }

  checkUserSession() {
    const savedName = localStorage.getItem("name");
    if (savedName) {
      this.currentUser = savedName;
      this.showChat();
    } else {
      this.showJoinForm();
    }
  }

  switchChat(room) {
    if (this.currentChatPath === this.chatPaths[room]) return;
    if (!this.currentUser) {
      showNotification(`Please log in first!`, "warning");
      return;
    }
    generalBtn.classList.toggle("active", room === "general");
    mixednutsBtn.classList.toggle("active", room === "mixednuts");
    this.currentChatPath = this.chatPaths[room];
    if (this.currentUser) {
      this.stopListening();
      this.clearMessages();
      this.resetLoadMoreUI();
      this.startListening();
    }
  }

  showJoinForm() {
    chatContainerEl.innerHTML = "";
    chatContainerEl.style.display = "none";
    joinFormEl.innerHTML = `
            <div class="container mt-3">
                <div class="mb-3">
                    <input type="text" id="usernameInput" class="form-control" placeholder="Enter your name..." maxlength="20">
                </div>
                <button id="joinBtn" class="btn btn-primary w-100" disabled>Join Chat</button>
            </div>
        `;
    joinFormEl.style.display = "block";

    const usernameInput = document.getElementById("usernameInput");
    const joinBtn = document.getElementById("joinBtn");

    usernameInput.addEventListener("input", () => {
      const isValid = usernameInput.value.trim().length > 0;
      joinBtn.disabled = !isValid;
    });
    joinBtn.addEventListener("click", () => {
      const username = usernameInput.value.trim();
      if (!username) return;
      this.currentUser = username;
      localStorage.setItem("name", username);
      this.showChat();
    });
    usernameInput.focus();
  }

  showChat() {
    joinFormEl.style.display = "none";
    this.buildChatUI();
    chatContainerEl.style.display = "block";
    this.startListening();
  }

  buildChatUI() {
    const savedName = localStorage.getItem("name");
    chatContainerEl.innerHTML = `
            <div class="chat-content-wrapper">
                <div id="messagesContainer" class="messages-container">
                  <div id="loadMoreArea" class="text-center py-2">
                    <button id="loadMoreBtn" class="btn btn-sm btn-link">Load Older Messages</button>
                  </div>
                  <div id="historyContainer"></div>
                  <div id="liveMessages"></div>
                </div>
                <div class="message-input-area">
                    <div class="input-group">
                        <input type="text" id="messageInput" class="form-control" 
                               placeholder="Hi ${savedName}. Say Something..." maxlength="2000">
                        <button id="sendBtn" class="btn btn-primary" disabled>
                             ${createIcon("paper-plane")}
                        </button>
                    </div>
                </div>
                <div class="text-center mt-2">
                    <button id="logoutBtn" class="btn btn-outline-secondary btn-sm">
                        ${createIcon("right-from-bracket")} Logout
                    </button>
                </div>
            </div>
        `;
    this.setupChatEvents();
  }

  setupChatEvents() {
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    messageInput.addEventListener("input", () => {
      const hasText = messageInput.value.trim().length > 0;
      sendBtn.disabled = !hasText;
    });
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !sendBtn.disabled) {
        this.sendMessage(messageInput.value.trim());
        messageInput.value = "";
        sendBtn.disabled = true;
      }
    });
    sendBtn.addEventListener("click", () => {
      this.sendMessage(messageInput.value.trim());
      messageInput.value = "";
      sendBtn.disabled = true;
    });
    document
      .getElementById("loadMoreBtn")
      ?.addEventListener("click", () => this.loadMore());
    logoutBtn.addEventListener("click", () => this.logout());
    setTimeout(() => messageInput.focus(), 100);
  }

  async sendMessage(text) {
    if (!text || !this.currentUser || this.isSending) return;
    this.isSending = true;
    const messageData = {
      text: String(text),
      user: String(this.currentUser),
      timestamp: Date.now(),
    };
    try {
      const messageRef = ref(db, this.currentChatPath);
      const newMessageRef = push(messageRef);
      await set(newMessageRef, {
        message: messageData.text,
        name: messageData.user,
        timestamp: messageData.timestamp,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      this.isSending = false;
    }
  }

  startListening() {
    const liveContainer = document.getElementById("liveMessages");
    const historyContainer = document.getElementById("historyContainer");
    if (!liveContainer) return;
    liveContainer.innerHTML = "";
    historyContainer.innerHTML = "";

    const chatRef = ref(db, this.currentChatPath);

    const chatQuery = query(
      chatRef,
      orderByChild("timestamp"),
      limitToLast(40),
    );

    this.activeListener = onValue(chatQuery, (snapshot) => {
      this.handleMessages(snapshot);
    });
  }

  handleMessages(snapshot) {
    const liveContainer = document.getElementById("liveMessages");
    if (!snapshot.exists()) {
      liveContainer.innerHTML =
        '<div class="text-center text-muted py-3">No messages.</div>';
      return;
    }
    const messages = [];
    snapshot.forEach((child) => {
      messages.push({ id: child.key, ...child.val() });
    });

    messages.sort((a, b) => a.timestamp - b.timestamp);
    //first load
    if (this.oldestTimestamp === null && messages.length > 0) {
      this.oldestTimestamp = messages[0].timestamp;
    }

    messages.forEach((msg) => {
      liveContainer.appendChild(this.createMessageElement(msg));
    });
    const container = document.getElementById("messagesContainer");
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  async loadMore() {
    if (!this.oldestTimestamp) return;

    const btn = document.getElementById("loadMoreBtn");
    const historyContainer = document.getElementById("historyContainer");
    const limitCount = 50;

    btn.disabled = true;
    btn.innerText = "Loading...";

    const chatRef = ref(db, this.currentChatPath);
    const oldQuery = query(
      chatRef,
      orderByChild("timestamp"),
      endBefore(this.oldestTimestamp),
      limitToLast(limitCount),
    );

    try {
      const snapshot = await get(oldQuery);

      if (snapshot.exists()) {
        const oldMessages = [];
        snapshot.forEach((child) => {
          oldMessages.push({ id: child.key, ...child.val() });
        });

        oldMessages.sort((a, b) => a.timestamp - b.timestamp);
        this.oldestTimestamp = oldMessages[0].timestamp;

        oldMessages.reverse().forEach((msg) => {
          const msgEl = this.createMessageElement(msg);
          historyContainer.prepend(msgEl);
        });
        if (oldMessages.length < limitCount) {
          btn.parentElement.innerHTML =
            '<span class="text-muted small">Beginning of chat</span>';
        } else {
          btn.innerText = "Load Older Messages";
          btn.disabled = false;
        }
      } else {
        btn.parentElement.innerHTML =
          '<span class="text-muted small">Beginning of chat</span>';
      }
    } catch (e) {
      console.error("Load more failed:", e);
      btn.disabled = false;
      btn.innerText = "Error - Try Again";
    }
  }

  createMessageElement(msg) {
    const isOwnMessage = msg.name === this.currentUser;
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isOwnMessage ? "own-message" : "other-message"}`;
    messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-user">${this.escapeHtml(msg.name || "Unknown")}</span>
                <span class="message-time">${this.formatTime(msg.timestamp)}</span>
            </div>
            <div class="message-body">
                ${this.linkifyText(this.escapeHtml(msg.message || ""))}
            </div>
        `;
    return messageDiv;
  }

  clearMessages() {
    document.getElementById("historyContainer").innerHTML = "";
    document.getElementById("liveMessages").innerHTML = "";
  }

  resetLoadMoreUI() {
    const loadMoreArea = document.getElementById("loadMoreArea");
    if (!loadMoreArea) return;
    loadMoreArea.innerHTML = `<button id="loadMoreBtn" class="btn btn-sm btn-link">Load Older Messages</button>`;
    document
      .getElementById("loadMoreBtn")
      .addEventListener("click", () => this.loadMore());
    this.oldestTimestamp = null;
  }

  stopListening() {
    if (this.activeListener) {
      this.activeListener();
      this.activeListener = null;
    }
  }

  logout() {
    this.stopListening();
    this.currentUser = null;
    localStorage.removeItem("name");
    this.showJoinForm();
  }

  escapeHtml(text) {
    if (typeof text !== "string") return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  linkifyText(text) {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
    );
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const getFormattedDate = (d) => {
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${year}/${month}/${day}`;
    };
    const getFormattedTime = (d) => {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    if (date.toDateString() === now.toDateString()) {
      return getFormattedTime(date);
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${getFormattedTime(date)}`;
    }
    return `${getFormattedDate(date)} ${getFormattedTime(date)}`;
  }
}

async function loadPlaylist(playlistName) {
  try {
    showLoadingSpinner();
    const [APlayerModule] = await Promise.all([
      import("aplayer/dist/APlayer.min.js"),
      import("aplayer/dist/APlayer.min.css"),
    ]);

    const APlayer = APlayerModule.default;

    const audioRef = ref(db, `audioList/${playlistName}`);
    const snapshot = await get(audioRef);
    const data = snapshot.val();

    if (!data) {
      hideLoadingSpinner();
      if (ap) ap.destroy();
      acontainer.style.display = "none";
      return;
    }

    const audioArray = Object.values(data).map((item) => ({
      name: item.name,
      artist: item.artist,
      url: item.url,
      lrc: item.lrc,
      cover: item.cover || "/assets/sasalele_logo.webp",
    }));

    if (acontainer) acontainer.style.display = "block";
    if (ap) ap.destroy();

    ap = new APlayer({
      container: aPlayer,
      lrcType: 1,
      autoplay: false,
      preload: "none",
      audio: audioArray,
    });

    ap.on("play", updatePlayerTitleAndMediaSession);
    hideLoadingSpinner();
  } catch (error) {
    console.error("Error loading playlist:", error);
    hideLoadingSpinner();
    alert("Error loading playlist: " + error.message);
  }

  function updatePlayerTitleAndMediaSession() {
    const currentTrackIndex = ap.list.index;
    const currentTrack = ap.list.audios[currentTrackIndex];
    if (currentTrack) {
      const trackName = `${currentTrack.artist || "Unknown Artist"} - ${currentTrack.name || "Unknown Title"}`;
      trackHistory(trackName, playlistName);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.name || "Unknown Track",
          artist: currentTrack.artist || "Unknown Artist",
          album: playlistName,
          artwork: [
            {
              src: currentTrack.cover,
              sizes: "512x512",
            },
          ],
        });
        navigator.mediaSession.setActionHandler("play", () => ap.play());
        navigator.mediaSession.setActionHandler("pause", () => ap.pause());
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
  if (typeof db !== "undefined") {
    window.chatApp = new ChatApp();
  }
  const cseScript = document.createElement("script");
  cseScript.src = `https://cse.google.com/cse.js?cx=${import.meta.env.VITE_CSE}`;
  cseScript.setAttribute("data-cfasync", "false");
  cseScript.async = true;

  document.head.appendChild(cseScript);
});
