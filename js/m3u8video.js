document.addEventListener('DOMContentLoaded', function () {

  let currentVideos = [];
  let currentPlayingElement = null;
  let hlsInstance = null;
  let lastBlobUrl = null;
  const titleNow = document.getElementById("selected-video-title");
  const videoPlayer = document.getElementById("video-player");
  const videoListElement = document.getElementById("video-list");
  const genreNameElement = document.getElementById("genre-name");
  const channelCountElement = document.getElementById("channel-count");
  const searchChannel = document.getElementById("searchChannel");
  const defaultGenre = "jpvideos";
  const defaultGenreName = "Japanese";
  const m3uURLInput = document.getElementById("m3uURL");

  m3uURLInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      loadM3UButton.click();
    }
  });

  loadGenre(defaultGenre, defaultGenreName);
  document.getElementById("vidstopBtn").addEventListener("click", stopVideoPlayback);

  async function fetchVideoLinks(genre) {
    try {
      const snapshot = await firebase.database().ref(`${genre}`).once("value");
      document.getElementById('loadingSpinner').style.display = 'none';
      const data = snapshot.val() || {};
      const videoLinks = Object.values(data);
      console.log(`${genre} loaded:`, videoLinks.length, "videos");
      return videoLinks;
    } catch (error) {
      console.error("Error fetching videos:", error);
      return [];
    }
  }

  async function loadGenre(genre, genreName) {
    try {
      document.getElementById('loadingSpinner').style.display = 'block';
      const videos = await fetchVideoLinks(genre);
      currentVideos = videos;
      createVideoList(currentVideos);
      updateGenreInfo(genreName, currentVideos.length);
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
    return currentVideos.filter(video =>
      video.title.toLowerCase().includes(lowerCaseQuery)
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
      titleNow.style.display = "block";
      titleNow.textContent = selectedTitle;
    }

    playMedia(selectedLink);
  }

  const PROXY_BASE = "https://sasalele.apnic-anycast.workers.dev/";
  const PROXY_EVERYTHING = true;
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
      // don't send credentials by default
      xhr.withCredentials = false;
    }
  };

  function isHlsUrl(url) {
    const lower = url.split("?")[0].toLowerCase();
    return lower.endsWith(".m3u8") || url.toLowerCase().includes(".m3u8") || lower.includes("playlist") || lower.includes("manifest") || url.startsWith("blob:");
  }

  function isDirectMedia(url) {
    const lower = url.split("?")[0].toLowerCase();
    return /\.(mp4|flv|mov|avi|webm|mkv|aac|mp3|ts)$/i.test(lower) || url.includes("video_id") || url.includes("format=mp4");
  }

  function isPhpDynamicHLS(url) {
    console.log("found php");
    return url.includes(".php");
  }

  function proxyUrl(url) {
    return PROXY_BASE + encodeURIComponent(url);
  }

  async function headProbe(url, timeout = 8000) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        signal: controller.signal,
        credentials: 'omit'
      });
      clearTimeout(id);
      return {
        ok: res.ok,
        status: res.status,
        ctype: res.headers.get('content-type')
      };
    } catch (err) {
      return {
        ok: false,
        status: null,
        error: err && err.name ? err.name : String(err)
      };
    }
  }

  async function fetchAndRewriteManifest(url, proxyManifest = false, proxySegments = PROXY_EVERYTHING) {
    try {
      const fetchUrl = proxyManifest ? proxyUrl(url) : url;
      const res = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      if (!res.ok) throw new Error(`Manifest fetch failed ${res.status}`);
      const text = await res.text();
      const base = new URL(url);
      const lines = text.split(/\r?\n/);
      const rewritten = lines.map(line => {
        if (!line || line.startsWith('#')) return line;
        let abs = line;
        try {
          abs = new URL(line, base).toString();
        } catch {
        }
        return proxySegments ? proxyUrl(abs) : abs;
      }).join("\n");
      const blob = new Blob([rewritten], {
        type: 'application/vnd.apple.mpegurl'
      });
      return URL.createObjectURL(blob);
    } catch (err) {
      throw err;
    }
  }

  async function sniffUrlType(originalUrl, useProxy = false) {
    const url = useProxy ? proxyUrl(originalUrl) : originalUrl;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        signal: controller.signal
      });

      clearTimeout(id);

      if (!res.ok) {
        return {
          ok: false,
          error: res.status
        };
      }

      const ctype = res.headers.get("content-type") || "";
      if (ctype.includes("video") || ctype.includes("octet-stream")) {
        console.log("direct php");
        return {
          ok: true,
          type: "direct",
          url: originalUrl,
          fetchUrl: url
        };
      }

      if (ctype.includes("mpegurl") || ctype.includes("application/x-mpegURL")) {
        const text = await res.text();
        console.log("hls php");
        return {
          ok: true,
          type: "hls",
          url: originalUrl,
          fetchUrl: url,
          manifestText: text
        };
      }

      const text = await res.text();
      if (text.includes("#EXTM3U")) {
        console.log(text);
        return {
          ok: true,
          type: "hls",
          url: originalUrl,
          fetchUrl: url,
          manifestText: text
        };
      }
      return {
        ok: true,
        type: "unknown",
        url: originalUrl,
        fetchUrl: url,
        manifestText: null
      };

    } catch (err) {
      return {
        ok: false,
        error: err.message
      };
    }
  }

  function buildBlobM3U(text, baseUrl) {
    const base = new URL(baseUrl);

    const lines = text.split(/\r?\n/);
    const rewritten = [];

    for (let line of lines) {
      if (!line || line.startsWith("#")) {
        rewritten.push(line);
        continue;
      }

      if (/^https?:\/\//i.test(line)) {
        rewritten.push(PROXY_EVERYTHING ? proxyUrl(line) : line);
        continue;
      }

      let abs;
      try {
        abs = new URL(line, base).toString();
      } catch {
        abs = line;
      }

      if (PROXY_EVERYTHING) {
        abs = proxyUrl(abs);
      }

      rewritten.push(abs);
    }

    const blob = new Blob([rewritten.join("\n")], {
      type: "application/vnd.apple.mpegurl"
    });

    return URL.createObjectURL(blob);
  }

  function cleanupHls() {
    try {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    } catch (e) { }
    if (lastBlobUrl) {
      try {
        URL.revokeObjectURL(lastBlobUrl);
      } catch (e) { }
      lastBlobUrl = null;
    }
  }

  async function playMedia(originalUrl) {
    cleanupHls();
    showNotification("Preparing playback...", "success");

    let initialMuted = videoPlayer.muted;
    const ensureUnmutedLater = () => {
      if (!initialMuted) {
        videoPlayer.muted = false;
      }
    };

    async function tryDirect(link, isProxy = false) {
      videoPlayer.pause();
      videoPlayer.removeAttribute('src');
      videoPlayer.load();

      const probe = await headProbe(link, 7000);
      if (!probe.ok) {
        const reason = `HEAD failed: ${probe.status || probe.error}`;
        return {
          ok: false,
          reason
        };
      }

      videoPlayer.src = link;

      try {
        videoPlayer.muted = true;
        await videoPlayer.play();
        setTimeout(ensureUnmutedLater, 800);
        showNotification("Playback started", "success");
        return {
          ok: true
        };
      } catch (err) {
        const reason = err.message || String(err);
        return {
          ok: false,
          reason
        };
      }
    }

    async function tryHls(link, manifestProxy = false) {
      videoPlayer.pause();
      videoPlayer.removeAttribute('src');
      videoPlayer.load();

      let sourceToLoad = link;
      if (manifestProxy) {
        try {
          sourceToLoad = await fetchAndRewriteManifest(link, true, PROXY_EVERYTHING);
          lastBlobUrl = sourceToLoad;
        } catch (err) {
          const reason = err.message || String(err);
          return {
            ok: false,
            reason
          };
        }
      }

      hlsInstance = new Hls(HLS_OPTIONS);

      let fatalDetected = false;
      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.warn("hls.js error", data);
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            console.log("Attempting media recovery");
            try {
              hlsInstance.recoverMediaError();
            } catch (e) {
              console.error(e);
              fatalDetected = true;
            }
          } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            console.log("Attempting to restart load for network error");
            try {
              hlsInstance.startLoad();
            } catch (e) {
              console.error(e);
              fatalDetected = true;
            }
          } else {
            fatalDetected = true;
          }
        }
      });

      // Attach and load
      hlsInstance.attachMedia(videoPlayer);
      try {
        hlsInstance.loadSource(sourceToLoad);
      } catch (err) {
        return {
          ok: false,
          reason: "hls.loadSource failed: " + (err.message || err)
        };
      }

      const manifestParsed = await new Promise(resolve => {
        const id = setTimeout(() => {
          resolve({
            ok: false,
            reason: "MANIFEST_PARSED timeout"
          });
        }, 9000);

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          clearTimeout(id);
          resolve({
            ok: true
          });
        });

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          // if fatal and we haven't started, report failure
          if (data && data.fatal && !videoPlayer.currentTime) {
          }
        });
      });

      if (!manifestParsed.ok) {
        return {
          ok: false,
          reason: manifestParsed.reason || "No manifest parsed"
        };
      }

      try {
        videoPlayer.muted = true;
        await videoPlayer.play();
        // give it a tick to ensure playback
        setTimeout(() => ensureUnmutedLater(), 800);
        showNotification("Playback started (hls.js)", "success");
        return {
          ok: true
        };
      } catch (err) {
        await new Promise(r => setTimeout(r, 600));
        if (!videoPlayer.paused && videoPlayer.currentTime > 0) {
          setTimeout(() => ensureUnmutedLater(), 800);
          return {
            ok: true
          };
        }
        return {
          ok: false,
          reason: "hls play failed: " + (err && err.message ? err.message : err)
        };
      }
    }

    let url = originalUrl;
    let type = "unknown";
    let useProxyForStream = false;
    let manifestText = null;
    let res;

    if (isPhpDynamicHLS(url)) {
      showNotification("Resolving dynamic PHP stream...", "success");
      let sniff = await sniffUrlType(url, false);
      if (!sniff.ok && sniff.error && (sniff.error.includes("Failed to fetch") || sniff.error.toLowerCase().includes("cors"))) {
        useProxyForStream = true;
        sniff = await sniffUrlType(url, true);
      }
      if (!sniff.ok) {
        showNotification("Stream resolution failed.", "danger");
        return stopVideoPlayback();
      }
      type = sniff.type;
      if (type === "direct") {
        url = sniff.fetchUrl;
      } else if (type === "hls") {
        manifestText = sniff.manifestText;
        if (!manifestText || manifestText.trim().length < 10) {
          console.warn("Manifest empty or too short — retrying fetch");
          const refetchUrl = useProxyForStream ? proxyUrl(url) : url;
          try {
            const r = await fetch(refetchUrl, {
              method: 'GET',
              mode: 'cors',
              credentials: 'omit'
            });
            if (r.ok) manifestText = await r.text();
          } catch (err) {
            console.warn("Refetch failed:", err);
          }
        }
        if (manifestText && manifestText.includes("#EXTM3U")) {
          console.log("PHP resolved to HLS playlist — rewriting...");
          const blobUrl = buildBlobM3U(manifestText, url);
          lastBlobUrl = blobUrl;
          url = blobUrl;
          type = "hls";
        } else {
          showNotification("Invalid HLS manifest from PHP.", "danger");
          return stopVideoPlayback();
        }
      } else {
        showNotification("Unknown PHP stream type.", "danger");
        return stopVideoPlayback();
      }
    } else if (isDirectMedia(url)) {
      type = "direct";
    } else if (isHlsUrl(url)) {
      type = "hls";
    } else {
      showNotification("Probing stream type...", "success");
      const probe = await headProbe(url);
      if (probe.ok) {
        if (probe.ctype.includes("video")) {
          type = "direct";
        } else if (probe.ctype.includes("mpegurl")) {
          type = "hls";
        }
      }
      if (type === "unknown") {
        const sniff = await sniffUrlType(url, false);
        if (sniff.ok) type = sniff.type;
      }
    }

    if (type === "direct") {
      showNotification("Detected direct media — attempting native playback", "success");
      res = await tryDirect(url);
      if (res.ok) return;
      console.warn("Direct native failed:", res.reason);
      if (!useProxyForStream) {
        const proxiedUrl = proxyUrl(originalUrl);
        showNotification("Retrying direct via proxy...", "warning");
        res = await tryDirect(proxiedUrl, true);
        if (res.ok) return;
        console.warn("Proxied direct failed:", res.reason);
      }
    } else if (type === "hls") {
      showNotification("Detected HLS stream — attempting playback", "success");

      if (videoPlayer.canPlayType && videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
        res = await tryDirect(url);
        if (res.ok) return;
        console.warn("Native HLS failed:", res.reason);
      }

      if (Hls.isSupported()) {
        res = await tryHls(url, false);
        if (res.ok) return;
        console.warn("hls.js direct failed:", res.reason);
      }

      if (Hls.isSupported() && !url.startsWith("blob:")) { // Skip if already a rewritten blob
        showNotification("Retrying HLS via proxy (manifest rewrite)...", "warning");
        res = await tryHls(originalUrl, true);
        if (res.ok) return;
        console.warn("Proxied manifest hls failed:", res.reason);
      }

      if (videoPlayer.canPlayType && videoPlayer.canPlayType("application/vnd.apple.mpegurl") && !url.startsWith("blob:")) {
        showNotification("Retrying native HLS via proxy...", "warning");
        try {
          const blobUrl = await fetchAndRewriteManifest(originalUrl, true, PROXY_EVERYTHING);
          lastBlobUrl = blobUrl;
          res = await tryDirect(blobUrl, true);
          if (res.ok) return;
          console.warn("Proxied native HLS failed:", res.reason);
        } catch (err) {
          console.warn("Proxied manifest fetch failed:", err);
        }
      }
    }
    showNotification("Stream failed to play after multiple attempts.", "danger");
    stopVideoPlayback();
    cleanupHls();
    videoPlayer.muted = initialMuted;
  }

  const loadM3UButton = document.getElementById("loadM3U");
  if (loadM3UButton) {
    loadM3UButton.addEventListener("click", function () {
      const Url = m3uURLInput.value
      if (Url) {
        playMedia(Url);
        if (titleNow) {
          titleNow.style.display = "none";
        }
      } else {
        showNotification('Please enter a URL.', 'warning');
      }
    });
  }

  function stopVideoPlayback() {
    try {

      videoPlayer.pause();
      videoPlayer.removeAttribute('src');
      videoPlayer.load();

      if (typeof hlsInstance !== 'undefined' && hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (titleNow) {
        titleNow.textContent = '';
        titleNow.style.display = "none";
      }

      if (currentPlayingElement) {
        currentPlayingElement.style.backgroundColor = '';
        currentPlayingElement.style.color = '';
        currentPlayingElement = null;
      }

      console.log("Playback stopped successfully.");
    } catch (err) {
      console.error("Error stopping playback:", err);
    }
  }

  document.querySelectorAll(".genre-link").forEach(link => {
    link.addEventListener("click", async function (e) {
      e.preventDefault();
      const genre = this.getAttribute("data-genre");
      const genreName = this.textContent;
      await loadGenre(genre, genreName);
    });
  });

  if (searchChannel) {
    searchChannel.addEventListener("input", function () {
      const query = this.value;
      const filteredVideos = filterVideoList(query);
      createVideoList(filteredVideos);
    });
  }

  const genreSelect = document.getElementById('genreSelect');
  const streamList = document.getElementById('streamList');
  const streamCount = document.getElementById('streamCount');
  const playerTitle = document.getElementById('playerTitle').querySelector('h5');
  const playerSubtitle = document.getElementById('playerSubtitle');
  const openOnYT = document.getElementById('openOnYT');
  const playPauseBtn = document.getElementById('playPauseBtn');

  let ytPlayer = null;
  let isPlaying = false;
  let genresData = {};

  function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
  }

  function createPlayer(videoId) {
    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
      return;
    }

    ytPlayer = new YT.Player('yt-player', {
      height: '360',
      width: '640',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: (e) => {
          isPlaying = false;

        },
        onStateChange: (e) => {
          const state = e.data;
          isPlaying = (state === YT.PlayerState.PLAYING);
          playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
        }
      }
    });
  }

  function loadVideo(videoId, title, genreKey) {
    playerTitle.textContent = title || 'Untitled';
    playerSubtitle.textContent = genreKey ? `Genre: ${genreKey}` : '';
    openOnYT.href = `https://www.youtube.com/watch?v=${videoId}`;

    if (!ytPlayer && typeof YT !== 'undefined' && YT.Player) {
      createPlayer(videoId);
    } else if (ytPlayer) {
      try {
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
      } catch (err) {
        createPlayer(videoId);
      }
    } else {
      const t = setInterval(() => {
        if (typeof YT !== 'undefined' && YT.Player) {
          clearInterval(t);
          createPlayer(videoId);
        }
      }, 200);
    }
  }


  playPauseBtn.addEventListener('click', () => {
    if (!ytPlayer) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
    else ytPlayer.playVideo();
  });

  function loadGenres() {
    const db = firebase.database();
    const ref = db.ref('ytByGenre');
    ref.once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          genreSelect.innerHTML = '<option>No genres</option>';
          return;
        }

        genresData = {};
        const keys = [];
        snapshot.forEach(child => {
          keys.push(child.key);
          const items = [];
          child.forEach(entry => {
            const v = entry.val();
            items.push({
              id: entry.key,
              link: v.link,
              title: v.title
            });
          });
          genresData[child.key] = items;
        });

        genreSelect.innerHTML = '';
        keys.forEach(k => {
          const opt = document.createElement('option');
          opt.value = k;
          opt.textContent = k;

          if (k === 'Japanese') opt.selected = true;
          genreSelect.appendChild(opt);
        });

        const defaultKey = genresData['Japanese'] ? 'Japanese' : keys[0];
        genreSelect.value = defaultKey || '';
        renderStreamsForGenre(defaultKey);
      })
      .catch(err => {
        console.error('Error reading ytByGenre:', err);
      });
  }

  function renderStreamsForGenre(genreKey) {
    streamList.innerHTML = '';
    if (!genreKey || !genresData[genreKey]) {
      streamList.innerHTML = '<div class="text-muted px-2">No streams found.</div>';
      streamCount.textContent = '0';
      playerTitle.textContent = 'No video';
      playerSubtitle.textContent = '';
      return;
    }

    const items = genresData[genreKey];
    streamCount.textContent = items.length;

    items.forEach((item, idx) => {
      const li = document.createElement('div');
      li.className = 'list-group-item list-group-item-action bg-transparent border-0 px-0 py-2 stream-item';
      li.dataset.videoId = item.link;
      li.dataset.title = item.title;

      li.innerHTML = `
        <div class="d-flex gap-2 align-items-center">
          <div style="width:110px; flex-shrink:0;">
            <img class="thumb" src="https://img.youtube.com/vi/${item.link}/hqdefault.jpg" alt="${escapeHtml(item.title)}">
          </div>
          <div class="flex-grow-1">
            <div class="stream-title">${escapeHtml(item.title)}</div>
            <div class="stream-sub">Video ID: ${item.link}</div>
          </div>
        </div>
      `;

      li.addEventListener('click', () => {
        document.querySelectorAll('.stream-item').forEach(it => it.classList.remove('active'));
        li.classList.add('active');

        loadVideo(item.link, item.title, genreKey);
      });

      streamList.appendChild(li);


      if (idx === 0) {
        setTimeout(() => {
          li.classList.add('active');
          loadVideo(item.link, item.title, genreKey);
        }, 20);
      }
    });
  }

  genreSelect.addEventListener('change', () => {
    const g = genreSelect.value;
    renderStreamsForGenre(g);
  });

  function escapeHtml(unsafe) {
    return unsafe ?
      unsafe.replace(/[&<"'>]/g, function (m) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        })[m];
      }) :
      '';
  }

  loadGenres();
});