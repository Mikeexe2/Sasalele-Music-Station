document.addEventListener("DOMContentLoaded", () => {
  let currentVideos = [];
  let currentPlayingElement = null;
  const titleNow = document.getElementById("selected-video-title");
  const videoPlayer = document.getElementById("video-player");
  const videoListElement = document.getElementById("video-list");
  const genreNameElement = document.getElementById("genre-name");
  const channelCountElement = document.getElementById("channel-count");
  const searchChannel = document.getElementById("searchChannel");
  const defaultGenre = "jpvideos";
  const defaultGenreName = "Japanese";

  loadGenre(defaultGenre, defaultGenreName);

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

  function playMedia(link) {

    const proxiedLink = `https://sasalele.apnic-anycast.workers.dev/${link}`;
    let hlsInstance = null;
    const loadAndPlay = async (linkToTry, fallbackLink = null) => {

      const tryPlay = () => {
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn("Playback failed:", err);
            if (fallbackLink) {
              console.log("Retrying with proxied link:", fallbackLink);
              loadAndPlay(fallbackLink);
            }
          });
        }
      };

      if (linkToTry.startsWith("https:")) {
        if (linkToTry.endsWith(".mp4") || linkToTry.includes("format=mp4")) {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          videoPlayer.src = linkToTry;
          videoPlayer.type = 'video/mp4';
          videoPlayer.preload = 'auto';
          videoPlayer.onloadedmetadata = tryPlay;
          videoPlayer.onerror = () => {
            console.error("Error loading video:", linkToTry);
            if (fallbackLink) {
              console.log("Falling back to proxied link:", fallbackLink);
              loadAndPlay(fallbackLink);
            }
          };
        } else {
          if (Hls.isSupported()) {
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            hlsInstance = new Hls();
            hlsInstance.loadSource(linkToTry);
            hlsInstance.attachMedia(videoPlayer);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
              console.error("HLS error:", data);
              if (fallbackLink) {
                hlsInstance.destroy();
                hlsInstance = null;
                loadAndPlay(fallbackLink);
              }
            });
          } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            videoPlayer.src = linkToTry;
            videoPlayer.preload = 'auto';
            videoPlayer.onloadedmetadata = tryPlay;
            videoPlayer.onerror = () => {
              console.error("Error loading HLS stream:", linkToTry);
              if (fallbackLink) {
                console.log("Falling back to proxied link:", fallbackLink);
                loadAndPlay(fallbackLink);
              }
            };
          } else {
            console.error('HLS not supported on this device.');
          }
        }
      } else {
        console.error('Unsupported link format:', linkToTry);
      }
    };
    loadAndPlay(link, proxiedLink);
  }

  const loadM3UButton = document.getElementById("loadM3U");
  if (loadM3UButton) {
    loadM3UButton.addEventListener("click", function () {
      var m3uUrl = document.getElementById("m3uURL").value;
      if (m3uUrl) {
        playMedia(m3uUrl);
      } else {
        alert("Please enter a URL.");
      }
    });
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

  const db = firebase.database();
  function loadGenres() {
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

  (function init() {
    loadGenres();
  })();
});