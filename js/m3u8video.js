let currentVideos = [];
let currentPlayingElement = null;
let hlsInstance = null;
const titleNow = document.getElementById("selected-video-title");

async function fetchVideoLinks(genre) {
  try {
    const response = await fetch(`Links/${genre}.json`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function updateGenreInfo(genre, count) {
  const genreNameElement = document.getElementById("genre-name");
  const channelCountElement = document.getElementById("channel-count");

  genreNameElement.textContent = genre;
  channelCountElement.textContent = count;
}

function createVideoList(videos) {
  const videoListElement = document.getElementById("video-list");
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
  return currentVideos.filter(video => video.title.toLowerCase().includes(lowerCaseQuery));
}

function selectVideo(element) {
  const selectedLink = element.dataset.link;
  const selectedTitle = element.textContent;
  if (currentPlayingElement) {
    currentPlayingElement.style.backgroundColor = "";
    currentPlayingElement.style.color = "";
  }
  element.style.backgroundColor = "#007bff";
  element.style.color = "#fff";
  currentPlayingElement = element;
  titleNow.style.display = "block";
  titleNow.textContent = selectedTitle;
  playMedia(selectedLink);
}

function playMedia(link) {
  const videoPlayer = document.getElementById("video-player");
  const proxiedLink = `https://sasalele.api-anycast.workers.dev/${link}`;

  const loadAndPlay = async (link) => {
    if (link.startsWith("http:")) {
      if (link.endsWith(".mp4") || link.includes("format=mp4")) {
        window.open(link, '_blank');
      } else {
        // Open the HLS player in a new tab
        //const playerUrl = `hls_player.html?videoUrl=${link}`;
        window.open(link, '_blank');
      }
    } else if (link.startsWith("https:")) {
      if (link.endsWith(".mp4") || link.includes("format=mp4")) {
        videoPlayer.src = link;
        videoPlayer.type = 'video/mp4';
        videoPlayer.addEventListener('loadedmetadata', function () {
          videoPlayer.play();
        });
      } else if (link.includes(".m3u8")) {
        if (Hls.isSupported()) {
          const hlsInstance = new Hls();
          hlsInstance.loadSource(proxiedLink);
          hlsInstance.attachMedia(videoPlayer);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
          });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
          videoPlayer.src = proxiedLink;
          videoPlayer.addEventListener('loadedmetadata', function () {
            videoPlayer.play();
          });
        } else {
          console.error('HLS is not supported on this device.');
        }
      }
    } else {
      console.error('Unsupported link format.');
    }
  };

  loadAndPlay(link);
}

document.getElementById("loadM3U").addEventListener("click", function () {
  var m3uUrl = document.getElementById("m3uURL").value;
  playMedia(m3uUrl);
});

document.querySelectorAll(".genre-link").forEach(link => {
  link.addEventListener("click", async function (e) {
    e.preventDefault();
    const genre = this.getAttribute("data-genre");
    currentVideos = await fetchVideoLinks(genre);
    createVideoList(currentVideos);
    updateGenreInfo(this.textContent, currentVideos.length);
  });
});

document.getElementById("searchChannel").addEventListener("input", function () {
  const query = this.value;
  const filteredVideos = filterVideoList(query);
  createVideoList(filteredVideos);
});

(async () => {
  const defaultGenre = "jpvideos";
  const defaultGenreName = "Japan Mix";
  currentVideos = await fetchVideoLinks(defaultGenre);
  createVideoList(currentVideos);
  updateGenreInfo(defaultGenreName, currentVideos.length);
})();
