document.addEventListener('DOMContentLoaded', function () {

  let currentVideos = [];
  let currentPlayingElement = null;
  let hlsInstance = null;
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

  function detectStreamType(link) {
    const baseLink = link.split('?')[0];

    if (baseLink.match(/\.(mp4|flv|mov|avi|webm)$/i) || link.includes("video_id") || link.includes("format=mp4")) {
      return "direct";
    } else if (baseLink.includes("php") || baseLink.endsWith(".m3u8")) {
      return "hls";
    }
    return "hls";
  }

  function playMedia(link) {
    let retrying = false;
    const proxiedLink = `https://sasalele.apnic-anycast.workers.dev/${link}`;

    const loadAndPlay = async (linkToTry, fallbackLink = null, triedProxy = false) => {
      const type = detectStreamType(linkToTry);
      console.log("Detected stream type:", type);

      const tryPlay = () => {
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            handlePlaybackError(type, err, linkToTry, fallbackLink, triedProxy);
          });
        }
      };

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (type === "direct") {
        videoPlayer.src = linkToTry;
        //videoPlayer.type = "video/mp4";
        videoPlayer.onloadedmetadata = tryPlay;
        showNotification("Loading stream...", "success");
        videoPlayer.onerror = (event) => {
          const err = videoPlayer.error;
          handlePlaybackError(type, err || event, linkToTry, fallbackLink, triedProxy);
        };
      }
      else if (type === "hls" && Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(linkToTry);
        hlsInstance.attachMedia(videoPlayer);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, tryPlay);
        showNotification("Loading stream...", "success");

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data);
          handlePlaybackError(type, data, linkToTry, fallbackLink, triedProxy);
        });
      } else if (videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
        videoPlayer.src = linkToTry;
        videoPlayer.onloadedmetadata = tryPlay;
        videoPlayer.onerror = (err) => {
          console.error("Native HLS error:", err);
          handlePlaybackError("hls-native", err, linkToTry, fallbackLink, triedProxy);
        };
      } else {
        videoPlayer.src = linkToTry;
        //videoPlayer.type = "video/mp4";
        videoPlayer.onloadedmetadata = tryPlay;
        showNotification("Loading stream...", "success");
        videoPlayer.onerror = (event) => {
          const err = videoPlayer.error;
          handlePlaybackError(type, err || event, linkToTry, fallbackLink, triedProxy);
        };
      }
    };

    function handlePlaybackError(type, err, linkToTry, fallbackLink, triedProxy) {
      if (retrying) return;
      retrying = true;

      const msg = err?.message || JSON.stringify(err) || "";
      const errCode = err?.code || 0;

      const isCritical =
        msg.includes("403") || msg.includes("CORS") || msg.includes("cross-origin") || msg.includes("Failed to fetch") || msg.includes("decode") || msg.includes("unsupported") || errCode === 3 || errCode === 4;

      // short grace period before declaring fatal
      setTimeout(() => {
        const ready = videoPlayer.readyState >= 2;
        if (!isCritical && ready) {
          console.log("Non-critical error ignored, playback appears fine.");
          retrying = false;
          return;
        }

        console.error(`Critical playback error on ${type}:`, msg);

        if (!triedProxy && fallbackLink) {
          console.log("Retrying with proxied link");
          showNotification("Stream failed. Retrying via proxy...", "warning");
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          loadAndPlay(fallbackLink, null, true);
        } else {
          showNotification("Stream failed to play.", "danger");
          stopVideoPlayback();
        }

        retrying = false;
      }, 600);
    }

    loadAndPlay(link, proxiedLink);
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
        ytPlayer.loadVideoById({ videoId: videoId, startSeconds: 0 });
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
    return unsafe
      ? unsafe.replace(/[&<"'>]/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
      })
      : '';
  }

  loadGenres();
});