import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "@waline/client/waline.css";
import "../css/styles.css";
import "../css/videos.css";
import "media-chrome";
import { ref, get, onValue } from "firebase/database";
import { db } from "./utils.js";
import { generateDropdown } from "./stats.js";
let hlsModules;
let dashModules = null;

document.addEventListener("DOMContentLoaded", function () {
  let currentVideos = [];
  let currentPlayingElement = null;
  let hlsInstance = null;
  let dashPlayerInstance = null;
  let fallbackHlsInstance = null;
  const titleNow = document.getElementById("selected-video-title");
  const videoPlayer = document.getElementById("video-player");
  const subtitleElement = document.getElementById("dash-subtitles");
  const videoListElement = document.getElementById("video-list");
  const controller = document.querySelector("media-controller");
  const genreNameElement = document.getElementById("genre-name");
  const channelCountElement = document.getElementById("channel-count");
  const searchChannel = document.getElementById("searchChannel");
  const customStreamToggleBtn = document.getElementById("customStreamToggle");
  const customStreamPanel = document.getElementById("customStreamPanel");
  const defaultGenre = "videos/jpvideos";
  const defaultGenreName = "Japanese";
  const m3uURLInput = document.getElementById("m3uURL");
  const channelThumbCache = {};

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

  customStreamToggleBtn.addEventListener("click", () => {
    const isOpen = customStreamPanel.style.display !== "none";

    if (isOpen) {
      closePanel(customStreamPanel, customStreamToggleBtn);
    } else {
      openPanel(customStreamPanel, customStreamToggleBtn);
    }
  });

  m3uURLInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      loadM3UButton.click();
    }
  });

  document
    .getElementById("vidstopBtn")
    .addEventListener("click", stopVideoPlayback);

  async function fetchVideoLinks(genre) {
    try {
      const videoRef = ref(db, `videos/${genre}`);
      const snapshot = await get(videoRef);

      const data = snapshot.val() || {};
      const videoLinks = Object.values(data);
      return videoLinks;
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  }

  async function loadGenre(genre, genreName) {
    try {
      showLoadingSpinner();
      console.log(genre);
      const videos = await fetchVideoLinks(genre);
      currentVideos = videos;
      createVideoList(currentVideos);
      updateGenreInfo(genreName, currentVideos.length);
      if (searchChannel && searchChannel.value.trim() !== "") {
        const filteredVideos = filterVideoList(searchChannel.value);
        createVideoList(filteredVideos);
      }
    } catch (error) {
      console.error("Error loading genre:", error);
    }
  }

  function updateGenreInfo(genre, count) {
    if (genreNameElement) {
      genreNameElement.textContent = genre;
    }
    if (channelCountElement) {
      channelCountElement.textContent = count;
    }
    hideLoadingSpinner();
  }

  function createVideoList(videos) {
    videoListElement.innerHTML = "";

    videos.forEach((video) => {
      const listItem = document.createElement("li");
      listItem.classList.add("list-group-item", "list-group-item-action");
      listItem.textContent = video.title;
      listItem.dataset.link = video.link;
      listItem.addEventListener("click", (event) => selectVideo(event.target));
      videoListElement.appendChild(listItem);
    });
  }

  function filterVideoList(query) {
    const lowerCaseQuery = query.toLowerCase();
    return currentVideos.filter((video) =>
      video.title.toLowerCase().includes(lowerCaseQuery),
    );
  }

  function selectVideo(element) {
    const selectedLink = element.dataset.link;
    const selectedTitle = element.textContent;

    if (currentPlayingElement) {
      currentPlayingElement.style.backgroundColor = "";
      currentPlayingElement.style.color = "";
    }

    element.style.backgroundColor = "#a1d5a7";
    element.style.color = "#000";
    currentPlayingElement = element;

    if (titleNow) {
      titleNow.textContent = selectedTitle;
    }

    playMedia(selectedLink);
  }

  const HLS_OPTIONS = {
    maxBufferLength: 12,
    maxMaxBufferLength: 40,
    fragLoadingRetryDelay: 500,
    manifestLoadingRetryDelay: 800,
    levelLoadingRetryDelay: 800,
    fragLoadingMaxRetry: 6,
    manifestLoadingMaxRetry: 6,
    levelLoadingMaxRetry: 6,
    enableWorker: true,
    backBufferLength: 90,
    lowLatencyMode: false,
    xhrSetup: function (xhr, url) {
      xhr.withCredentials = false;
    },
  };

  function cleanupHls() {
    if (hlsInstance) {
      hlsInstance.detachMedia();
      hlsInstance.destroy();
      hlsInstance = null;
    }
    if (fallbackHlsInstance) {
      hlsInstance.detachMedia();
      fallbackHlsInstance.destroy();
      fallbackHlsInstance = null;
    }
    videoPlayer.removeAttribute("src");
    videoPlayer.load();
  }

  function cleanupDash() {
    if (dashPlayerInstance) {
      dashPlayerInstance.reset();
      dashPlayerInstance.destroy();
      dashPlayerInstance = null;
    }
  }

  function proxyUrl(url) {
    return import.meta.env.VITE_PROXY_LINK + encodeURIComponent(url);
  }

  function isHlsUrl(url) {
    const lower = url.split("?")[0].toLowerCase();
    return lower.endsWith(".m3u8") || url.toLowerCase().includes(".m3u8");
  }

  function isDirectMedia(url) {
    const lower = url.split("?")[0].toLowerCase();
    return (
      /\.(mp4)$/i.test(lower) ||
      url.includes("video_id") ||
      url.includes("format=mp4")
    );
  }

  function isPhpDynamicHLS(url) {
    return url.includes(".php");
  }

  function isMPD(url) {
    return url.includes(".mpd");
  }

  async function tryDirect(url) {
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();
    try {
      videoPlayer.src = url;
      await videoPlayer.play();
      return {
        ok: true,
      };
    } catch (err) {
      if (url.startsWith("http://")) {
        showNotification(
          "Browser is blocking http:// stream. Enable insecure content if you want to play it.",
          "warning",
        );
        stopVideoPlayback();
      }
      return {
        ok: false,
        reason: err.message || String(err),
      };
    }
  }

  async function tryHls(url, isFallback = false) {
    const { Hls } = hlsModules;
    const hlsInst = new Hls(HLS_OPTIONS);
    if (isFallback) fallbackHlsInstance = hlsInst;
    else hlsInstance = hlsInst;

    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();

    hlsInst.attachMedia(videoPlayer);
    hlsInst.loadSource(url);

    return new Promise((resolve) => {
      let resolved = false;

      hlsInst.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          await videoPlayer.play();
          if (!resolved) {
            resolved = true;
            resolve({
              ok: true,
            });
          }
        } catch (err) {
          if (!resolved) {
            resolved = true;
            resolve({
              ok: false,
              reason: err.message,
            });
          }
        }
      });

      hlsInst.on(Hls.Events.ERROR, (event, data) => {
        console.warn("hls.js error:", data);
        if (data.fatal && !resolved) {
          hlsInst.destroy();
          stopVideoPlayback();
          resolved = true;
          resolve({
            ok: false,
            reason: data?.details || "Fatal HLS error",
          });
        }
      });
    });
  }

  async function tryDash(url, isProxied = false) {
    const { dashjs } = dashModules;

    return new Promise((resolve) => {
      try {
        cleanupDash();
        dashPlayerInstance = dashjs.MediaPlayer().create();
        dashPlayerInstance.on(dashjs.MediaPlayer.events.ERROR, (e) => {
          console.error("DASH Error:", e);
          resolve({
            ok: false,
            reason: isProxied ? "Proxy DASH failed" : "Direct DASH failed",
          });
        });
        dashPlayerInstance.on(
          dashjs.MediaPlayer.events.STREAM_INITIALIZED,
          () => {
            resolve({ ok: true });
          },
        );
        dashPlayerInstance.initialize(videoPlayer, url, true);
        dashPlayerInstance.attachTTMLRenderingDiv(subtitleElement);
        setTimeout(() => {
          resolve({ ok: false, reason: "DASH initialization timeout" });
        }, 10000);
      } catch (err) {
        resolve({ ok: false, reason: err.message });
      }
    });
  }

  function testHttpAllowed(url) {
    return new Promise((resolve) => {
      const testVideo = document.createElement("video");
      testVideo.src = url;

      let timeout = setTimeout(() => resolve(false), 2000);

      testVideo.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      testVideo.onloadedmetadata = () => {
        clearTimeout(timeout);
        resolve(true);
      };
    });
  }

  async function playMedia(originalUrl) {
    cleanupHls();
    cleanupDash();

    const proxiedUrl = proxyUrl(originalUrl);
    let res;

    const attemptOrder = [];

    if (originalUrl.startsWith("http://")) {
      const allowed = await testHttpAllowed(originalUrl);

      if (!allowed) {
        showNotification(
          "This stream uses http:// which is normally blocked by your browser. Please allow insecure content in your site settings if you want to play it. Retrying...",
          "warning",
        );
      }
    }

    const ensureHlsLoaded = async () => {
      if (!hlsModules) {
        const Hls = await import("hls.js").then((m) => m.default || m);
        hlsModules = { Hls };
      }
      return hlsModules.Hls;
    };

    const ensureDashLoaded = async () => {
      if (!dashModules) {
        const dashjs = await import("dashjs").then((m) => m.default || m);
        dashModules = { dashjs };
      }
      return dashModules.dashjs;
    };

    if (isDirectMedia(originalUrl)) {
      attemptOrder.push(() => tryDirect(originalUrl));
      attemptOrder.push(() => tryDirect(proxiedUrl));
    } else if (isHlsUrl(originalUrl) || isPhpDynamicHLS(originalUrl)) {
      const Hls = await ensureHlsLoaded();
      if (Hls.isSupported()) {
        attemptOrder.push(() => tryHls(originalUrl));
        attemptOrder.push(() => tryHls(proxiedUrl, true));
      }
      attemptOrder.push(() => tryDirect(originalUrl));
    } else if (isMPD(originalUrl)) {
      const dashjs = await ensureDashLoaded();
      if (dashjs) {
        attemptOrder.push(() => tryDash(originalUrl));
        attemptOrder.push(() => tryDash(proxiedUrl, true));
      }
    } else {
      attemptOrder.push(() => tryDirect(originalUrl));
      const Hls = await ensureHlsLoaded();
      if (Hls.isSupported()) {
        attemptOrder.push(() => tryHls(originalUrl));
      }
    }

    for (let attempt of attemptOrder) {
      res = await attempt();
      if (res.ok) return;
      console.warn("Attempt failed:", res.reason);
      showNotification(`Unable to play: ${res.reason}`, "warning");
    }
    stopVideoPlayback();
  }

  const loadM3UButton = document.getElementById("loadM3U");
  if (loadM3UButton) {
    loadM3UButton.addEventListener("click", function () {
      const Url = m3uURLInput.value;
      if (Url) {
        playMedia(Url);
        showNotification("Loading...", "success");
        if (titleNow) {
          titleNow.textContent = "Videos";
        }
      } else {
        showNotification("Please enter a URL.", "warning");
      }
    });
  }

  controller.addEventListener("mediaenterfullscreen", async () => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
        console.log("Orientation locked to landscape");
      }
    } catch (err) {
      console.warn("Orientation lock failed:", err);
    }
  });

  controller.addEventListener("mediaexitfullscreen", () => {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
      console.log("Orientation unlocked (returning to user settings)");
    }
  });

  function stopVideoPlayback() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }

      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }

      videoPlayer.pause();
      videoPlayer.removeAttribute("src");
      videoPlayer.load();

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (dashPlayerInstance) {
        dashPlayerInstance.destroy();
        dashPlayerInstance = null;
      }

      if (fallbackHlsInstance) {
        fallbackHlsInstance.destroy();
        fallbackHlsInstance = null;
      }

      if (titleNow) {
        titleNow.textContent = "Videos";
      }

      if (currentPlayingElement) {
        currentPlayingElement.style.backgroundColor = "";
        currentPlayingElement.style.color = "";
        currentPlayingElement = null;
      }
    } catch (err) {
      console.error("Error stopping playback:", err);
    }
  }

  if (searchChannel) {
    searchChannel.addEventListener("input", function () {
      const query = this.value;
      const filteredVideos = filterVideoList(query);
      createVideoList(filteredVideos);
    });
  }

  const genreSelect = document.getElementById("genreSelect");
  const streamList = document.getElementById("streamList");
  const streamCount = document.getElementById("streamCount");
  const playerTitle = document.getElementById("playerTitle");

  let ytPlayer = null;
  let isPlaying = false;
  let genresData = {};

  function onYouTubeIframeAPIReady() {
    console.log("YouTube API ready");
  }

  function createPlayer(videoId) {
    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
      return;
    }

    ytPlayer = new YT.Player("yt-player", {
      height: "360",
      width: "640",
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (e) => {
          isPlaying = false;
        },
      },
    });
  }

  function loadVideo(videoId, title, genreKey) {
    playerTitle.textContent = title || "Untitled";

    if (!ytPlayer && typeof YT !== "undefined" && YT.Player) {
      createPlayer(videoId);
    } else if (ytPlayer) {
      try {
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
        });
      } catch (err) {
        createPlayer(videoId);
      }
    } else {
      const t = setInterval(() => {
        if (typeof YT !== "undefined" && YT.Player) {
          clearInterval(t);
          createPlayer(videoId);
        }
      }, 200);
    }
  }

  async function loadGenres() {
    showLoadingSpinner();
    const categoryRef = ref(db, "categories/ytByGenre");

    onValue(categoryRef, async (snapshot) => {
      if (!snapshot.exists()) {
        genreSelect.innerHTML = "<option>No genres</option>";
        hideLoadingSpinner();
        return;
      }

      const categoryData = snapshot.val();
      const subCategories = categoryData.subCategories || {};

      const genreEntries = Object.keys(subCategories).map((key) => ({
        key,
        label: subCategories[key].label || key,
        order: subCategories[key].order ?? 0,
      }));

      genreEntries.sort((a, b) => a.order - b.order);

      genreSelect.innerHTML = "";

      genreEntries.forEach((entry) => {
        const opt = document.createElement("option");
        opt.value = entry.key;
        opt.textContent = entry.label;
        genreSelect.appendChild(opt);
      });

      async function loadGenreData(selectedKey) {
        if (!selectedKey) return;

        showLoadingSpinner();

        const dataRef = ref(db, `ytByGenre/${selectedKey}`);
        const dataSnapshot = await get(dataRef);

        if (!dataSnapshot.exists()) {
          genresData[selectedKey] = [];
        } else {
          const items = [];
          dataSnapshot.forEach((child) => {
            const v = child.val();
            items.push({
              id: child.key,
              title: v.title,
              link: v.link,
            });
          });
          genresData[selectedKey] = items;
        }

        renderStreamsForGenre(selectedKey);
        hideLoadingSpinner();
      }

      genreSelect.onchange = (e) => {
        loadGenreData(e.target.value);
      };
      const firstKey = genreEntries[0]?.key;
      if (firstKey) {
        genreSelect.value = firstKey;
        await loadGenreData(firstKey);
      }

      hideLoadingSpinner();
    });
  }

  function isChan2(id) {
    return /^UC[a-zA-Z0-9-_]{22}$/.test(id);
  }

  function isVid2(id) {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
  }

  function renderStreamsForGenre(genreKey) {
    streamList.innerHTML = "";
    if (!genreKey || !genresData[genreKey]) {
      streamList.innerHTML =
        '<div class="text-muted px-2">No streams found.</div>';
      streamCount.textContent = "0";
      playerTitle.textContent = "No video";
      return;
    }

    const items = genresData[genreKey];
    streamCount.textContent = items.length;

    items.forEach(async (item, idx) => {
      const isChan = isChan2(item.link);
      const isVid = isVid2(item.link);
      const li = document.createElement("div");
      li.className =
        "list-group-item list-group-item-action bg-transparent border-0 px-0 py-2 stream-item";
      li.dataset.videoId = item.link;
      li.dataset.title = item.title;

      let thumbUrl;

      if (isVid) {
        thumbUrl = `https://img.youtube.com/vi/${item.link}/hqdefault.jpg`;
      } else {
        if (!channelThumbCache[item.link]) {
          channelThumbCache[item.link] = await fetchChannelThumbnail(item.link);
        }
        thumbUrl = channelThumbCache[item.link];
      }

      li.innerHTML = `
      <div class="d-flex gap-2 align-items-center">
          <div style="width:110px; flex-shrink:0;">
              <img class="thumb" src="${thumbUrl}" alt="${escapeHtml(item.title)}">
          </div>
          <div class="flex-grow-1">
              <div class="stream-title">${escapeHtml(item.title)}</div>
          </div>
      </div>
  `;

      li.addEventListener("click", async () => {
        document
          .querySelectorAll(".stream-item")
          .forEach((it) => it.classList.remove("active"));
        li.classList.add("active");

        if (isVid) {
          loadVideo(item.link, item.title, genreKey);
        } else if (isChan) {
          const liveVideoId = await fetchLiveVideoId(item.link);
          if (liveVideoId) {
            loadVideo(liveVideoId, item.title + " (Live)", genreKey);
          } else {
            playerTitle.textContent = item.title;
            showNotification("Channel is not Live", "warning");
          }
        } else {
          console.error("Unknown YouTube ID:", item.link);
        }
      });

      streamList.appendChild(li);

      if (idx === 0) {
        setTimeout(() => {
          li.classList.add("active");
          loadVideo(item.link, item.title, genreKey);
        }, 20);
      }
    });
    hideLoadingSpinner();
  }

  genreSelect.addEventListener("change", () => {
    const g = genreSelect.value;
    renderStreamsForGenre(g);
  });

  async function fetchChannelThumbnail(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${import.meta.env.VITE_YT_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items[0]) {
      return data.items[0].snippet.thumbnails.high.url;
    }
    return "/ball.svg";
  }

  async function fetchLiveVideoId(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${import.meta.env.VITE_YT_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;
      }
      return null;
    } catch (error) {
      console.error("API Call failed (likely CORS issue):", error);
      return null;
    }
  }

  function escapeHtml(unsafe) {
    return unsafe
      ? unsafe.replace(/[&<"'>]/g, function (m) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          }[m];
        })
      : "";
  }
  generateDropdown(
    "categories/videos",
    videoDropdown,
    videoMenu,
    (key, name) => loadGenre(key, name),
    true,
  );
  loadGenres();
});
