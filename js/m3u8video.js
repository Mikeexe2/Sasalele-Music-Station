let currentVideos = [];
let currentPlayingElement = null;
let hlsInstance = null;

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
    document.getElementById("selected-video-title").textContent = selectedTitle;
    playVideo(selectedLink);
}

function filterVideoList(query) {
    const lowerCaseQuery = query.toLowerCase();
    return currentVideos.filter(video => video.title.toLowerCase().includes(lowerCaseQuery));
}

function playVideo(link) {
    const videoPlayer = document.getElementById("video-player");
    //special handling for cloud videos
    if (link.endsWith(".mp4") || link.includes("format=mp4")) {
        videoPlayer.src = link;
        videoPlayer.play();
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    }
    else if (Hls.isSupported()) {
        if (!hlsInstance) {
            hlsInstance = new Hls();
            hlsInstance.attachMedia(videoPlayer);
        }
        hlsInstance.loadSource(link);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
        });
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = link;
        videoPlayer.addEventListener('loadedmetadata', function () {
            videoPlayer.play();
        });
    } else {
        console.error("Your browser does not support HLS playback.");
    }

}

function playM3u8(url) {
    if (Hls.isSupported()) {
        var video = document.getElementById("video-player");
        video.volume = 1.0;
        var hls = new Hls();
        var m3u8Url = decodeURIComponent(url);
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    }
}

document.getElementById("loadM3U").addEventListener("click", function () {
    var m3uUrl = document.getElementById("m3uURL").value;
    playM3u8(m3uUrl);
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
