var m3uFileURL = "https://raw.githubusercontent.com/Mikeexe2/Internet-radio-stream-links/main/all.m3u";

// Fetch the M3U file
fetch(m3uFileURL)
    .then(response => response.text())
    .then(data => {
        // Split the data by line breaks
        var lines = data.split('\n');

        // Iterate through each line of the M3U file
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            // Check if the line contains station information
            if (line.startsWith('#EXTINF:')) {
                // Extract the station name from the line
                var name = line.split(',')[1].trim();

                // Extract the station link from the next line
                var link = lines[i + 1].trim();

                // Create a new list item element
                var li = document.createElement('li');
                var a = document.createElement('a');

                // Set the link and name attributes
                a.href = link;
                a.textContent = name;

                // Add an event listener to play the station when clicked
                a.addEventListener('click', function (event) {
                    event.preventDefault();

                    var player = document.getElementById('miniPlayer');
                    player.src = this.getAttribute('data-link');
                    player.play();

                    var stationName = this.getAttribute('station-name');
                    document.getElementById('stationName').textContent = stationName;
                });

                // Set the data-link attribute to store the station link
                a.setAttribute('data-link', link);
                a.setAttribute('station-name', name);

                // Append the link to the list item
                li.appendChild(a);

                // Append the list item to the playlist
                document.getElementById("playlist").appendChild(li);
            }
        }

        // Add event listener to the cover image (miku-gif) for random play
        var cover = document.getElementById('miku-gif');
        cover.addEventListener('click', function () {
            var playlist = document.getElementById('playlist');
            var stationCount = playlist.childElementCount;
            if (stationCount > 0) {
                var randomIndex = Math.floor(Math.random() * stationCount);
                var randomStation = playlist.children[randomIndex].children[0];
                randomStation.click();
            }
        });
    });

// Dynamically list out website from github
const websitesContainer = document.querySelector('.websites');

fetch("https://raw.githubusercontent.com/Mikeexe2/Internet-radio-stream-links/main/websites.txt")
    .then(response => response.text())
    .then(data => {
        // Split the data into individual websites
        const websitesData = data.split('\n\n');

        // Iterate over each website's data
        websitesData.forEach(websiteData => {
            // Split the website's data into lines
            const lines = websiteData.split('\n');

            // Extract the website's information from the lines
            const link = lines[0];
            const imageSrc = lines[1];
            const name = lines[2];

            const container = document.createElement('div');
            container.classList.add('container');

            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.target = "_blank";

            const image = document.createElement('img');
            image.src = imageSrc;

            linkElement.appendChild(image);
            container.appendChild(linkElement);

            const heading = document.createElement('h5');
            heading.textContent = name;
            container.appendChild(heading);

            websitesContainer.appendChild(container);
        });
    })
    .catch(error => {
        console.error('Error retrieving data:', error);
    });

// Search function
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const websites = document.querySelectorAll('.button');
const innerContainer = document.querySelector('.inner');
const searchTermsContainer = document.getElementById('searchTerms');

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== '') {
        innerContainer.style.display = 'block';
        searchTermsContainer.textContent = searchTerm;
    } else {
        searchInput.classList.add('error');
    }
    // Clear the input field
    searchInput.value = '';
});

searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

const websiteButtons = document.querySelectorAll('.button');

for (let i = 0; i < websiteButtons.length; i++) {
    websiteButtons[i].addEventListener('click', function () {
        const websiteLabel = this.querySelector('.button-label').textContent;
        const searchTerm = searchTermsContainer.textContent;
        const websiteURL = getWebsiteURL(websiteLabel, searchTerm);
        if (websiteURL !== '') {
            window.open(websiteURL, '_blank');
        }
    });
}
// Search result links generation
function getWebsiteURL(label, searchTerm) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);

    switch (label) {
        case 'Spotify':
            return `https://open.spotify.com/search/${encodedSearchTerm}`;
        case 'Apple Music':
            return `https://music.apple.com/search?term=${encodedSearchTerm}`;
        case 'Amazon Music':
            return `https://music.amazon.com/search/${encodedSearchTerm}`;
        case 'Amazon Japan':
            return `https://music.amazon.co.jp/search/${encodedSearchTerm}`;
        case 'YouTube':
            return `https://www.youtube.com/results?search_query=${encodedSearchTerm}`;
        case 'YouTube Music':
            return `https://music.youtube.com/search?q=${encodedSearchTerm}`;
        case '网易云（Netease）':
            return `https://music.163.com/#/search/m/?s=${encodedSearchTerm}`;
        case 'KKBOX':
            return `https://www.kkbox.com/my/en/search?q=${encodedSearchTerm}`;
        case 'VGMdb':
            return `https://vgmdb.net/search?q=${encodedSearchTerm}`;
        case 'Audiomack':
            return `https://audiomack.com/search?q=${encodedSearchTerm}`;
        case 'MusicEnc':
            return `https://www.musicenc.com/?search=${encodedSearchTerm}`;
        case 'J-Lyric.net':
            return `https://search3.j-lyric.net/index.php?ex=on&ct=2&ca=2&cl=2&kt==${encodedSearchTerm}`;
        case 'FollowLyrics':
            return `https://zh.followlyrics.com/search?name=${encodedSearchTerm}`;
        case 'Kugeci':
            return `https://www.kugeci.com/search?q=${encodedSearchTerm}`;
        case '巴哈姆特':
            return `https://m.gamer.com.tw/search.php?q=${encodedSearchTerm}`;
        case 'Soundcloud':
            return `https://soundcloud.com/search?q=${encodedSearchTerm}`;
        case 'Audio Archive':
            return `https://archive.org/details/audio?query=${encodedSearchTerm}`;
        case 'Shazam':
            return `https://www.shazam.com/`;
        case 'Google':
            return `https://www.google.com/search?q=${encodedSearchTerm}`;
        default:
            return '';
    }
}
