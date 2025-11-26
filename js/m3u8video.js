document.addEventListener('DOMContentLoaded', function () {

  let currentVideos = [];
  let currentPlayingElement = null;
  let hlsInstance = null;
  let fallbackHlsInstance = null;
  const titleNow = document.getElementById("selected-video-title");
  const videoPlayer = document.getElementById("video-player");
  const videoListElement = document.getElementById("video-list");
  const genreNameElement = document.getElementById("genre-name");
  const channelCountElement = document.getElementById("channel-count");
  const searchChannel = document.getElementById("searchChannel");
  const defaultGenre = "jpvideos";
  const defaultGenreName = "Japanese";
  const m3uURLInput = document.getElementById("m3uURL");
  const channelThumbCache = {};

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
    }
  };

  function cleanupHls() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    if (fallbackHlsInstance) {
      fallbackHlsInstance.destroy();
      fallbackHlsInstance = null;
    }
    videoPlayer.removeAttribute("src");
    videoPlayer.load();
  }

  function proxyUrl(url) {
    return PROXY_BASE + encodeURIComponent(url);
  }

  function isHlsUrl(url) {
    const lower = url.split("?")[0].toLowerCase();
    return lower.endsWith(".m3u8") || url.toLowerCase().includes(".m3u8");
  }

  function isDirectMedia(url) {
    const lower = url.split("?")[0].toLowerCase();
    return /\.(mp4)$/i.test(lower) || url.includes("video_id") || url.includes("format=mp4");
  }

  function isPhpDynamicHLS(url) {
    return url.includes(".php");
  }

  async function tryDirect(url) {
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();
    try {
      videoPlayer.src = url;
      videoPlayer.muted = true;
      await videoPlayer.play();
      setTimeout(() => {
        if (!videoPlayer.muted) videoPlayer.muted = false;
      }, 800);
      showNotification("Playback started (direct)", "success");
      return {
        ok: true
      };
    } catch (err) {
      if (url.startsWith("http://")) {
        showNotification(
          "Browser is blocking http:// stream. Enable insecure content if you want to play it.",
          "warning"
        );
        stopVideoPlayback();
      }
      return {
        ok: false,
        reason: err.message || String(err)
      };
    }
  }

  async function tryHls(url, isFallback = false) {
    const hlsInst = new Hls(HLS_OPTIONS);
    if (isFallback) fallbackHlsInstance = hlsInst;
    else hlsInstance = hlsInst;

    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.load();

    hlsInst.attachMedia(videoPlayer);
    hlsInst.loadSource(url);

    return new Promise(resolve => {
      let resolved = false;

      hlsInst.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          await videoPlayer.play();
          setTimeout(() => {
            if (!videoPlayer.muted) videoPlayer.muted = false;
          }, 800);
          if (!resolved) {
            resolved = true;
            resolve({
              ok: true
            });
          }
        } catch (err) {
          if (!resolved) {
            resolved = true;
            resolve({
              ok: false,
              reason: err.message
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
            reason: data?.details || "Fatal HLS error"
          });
        }
      });
    });
  }

  function testHttpAllowed(url) {
    return new Promise(resolve => {
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
    showNotification("Preparing playback...", "success");

    const proxiedUrl = proxyUrl(originalUrl);
    let res;

    const attemptOrder = [];

    if (originalUrl.startsWith("http://")) {
      const allowed = await testHttpAllowed(originalUrl);

      if (!allowed) {
        showNotification("This stream uses http:// which is normally blocked by your browser. Please allow insecure content in your site settings if you want to play it. Retrying...", "warning");
      }
    }

    if (isDirectMedia(originalUrl)) {
      attemptOrder.push(() => tryDirect(originalUrl));
      attemptOrder.push(() => tryDirect(proxiedUrl));
    } else if (isHlsUrl(originalUrl)) {
      if (Hls.isSupported()) {
        attemptOrder.push(() => tryHls(originalUrl));
        attemptOrder.push(() => tryHls(proxiedUrl, true));
      } else {
        attemptOrder.push(() => tryDirect(originalUrl));
        attemptOrder.push(() => tryDirect(proxiedUrl));
      }
    } else if (isPhpDynamicHLS(originalUrl)) {
      if (Hls.isSupported()) {
        attemptOrder.push(() => tryHls(originalUrl));
        attemptOrder.push(() => tryHls(proxiedUrl, true));
      }
      attemptOrder.push(() => tryDirect(originalUrl));
      attemptOrder.push(() => tryDirect(proxiedUrl));
    } else {

      attemptOrder.push(() => tryDirect(originalUrl));
      attemptOrder.push(() => tryDirect(proxiedUrl));
      if (Hls.isSupported()) {
        attemptOrder.push(() => tryHls(originalUrl));
        attemptOrder.push(() => tryHls(proxiedUrl, true));
      }
    }

    for (let attempt of attemptOrder) {
      res = await attempt();
      if (res.ok) return;
      console.warn("Attempt failed:", res.reason);
      showNotification(`Unable to play: ${res.reason}`, "warning");
    }

    stopVideoPlayback();
    showNotification("Stream failed to play after multiple attempts.", "danger");
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

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (fallbackHlsInstance) {
        fallbackHlsInstance.destroy();
        fallbackHlsInstance = null;
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
      showNotification('Playback stopped successfully.', 'success');
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

  function isChan2(id) {
    return /^UC[a-zA-Z0-9-_]{22}$/.test(id);
  }

  function isVid2(id) {
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
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

    items.forEach(async (item, idx) => {
      const isChan = isChan2(item.link);
      const isVid = isVid2(item.link);
      const li = document.createElement('div');
      li.className = 'list-group-item list-group-item-action bg-transparent border-0 px-0 py-2 stream-item';
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
              <div class="stream-sub">
                  ${isVid ? "Video ID" : "Channel ID"}: ${item.link}
              </div>
          </div>
      </div>
  `;

      li.addEventListener('click', async () => {
        document.querySelectorAll('.stream-item').forEach(it => it.classList.remove('active'));
        li.classList.add('active');

        if (isVid) {
          loadVideo(item.link, item.title, genreKey);
        } else if (isChan) {
          const liveVideoId = await fetchLiveVideoId(item.link);
          if (liveVideoId) {
            loadVideo(liveVideoId, item.title + " (Live)", genreKey);
          } else {
            playerTitle.textContent = item.title;
            playerSubtitle.textContent = "Channel Offline";
            openOnYT.href = `https://www.youtube.com/channel/${item.link}`;
            showNotification("Channel is not Live", "warning");
          }
        } else {
          console.error("Unknown YouTube ID:", item.link);
        }
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

  async function fetchChannelThumbnail(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items[0]) {
      return data.items[0].snippet.thumbnails.high.url;
    }
    return "assets/ball.svg";
  }

  async function fetchLiveVideoId(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=AIzaSyAwM_RLjqj8dbbMAP5ls4qg1olDsaxSq5s`;

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