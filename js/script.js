const websites = [
    { name: 'Google', url: 'https://www.google.com/search?q=' },
    { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
    { name: 'Netease', url: 'https://music.163.com/#/search/m/?s=' },
    { name: 'MusicEnc', url: 'https://www.musicenc.com/?search=' },
    { name: 'Kugeci', url: 'https://www.kugeci.com/search?q=' },
    { name: 'FollowLyrics', url: 'https://zh.followlyrics.com/search?name=' },
    { name: '巴哈姆特', url: 'https://m.gamer.com.tw/search.php?q=' },
    { name: 'J-Lyric.net', url: 'https://search3.j-lyric.net/index.php?ex=on&ct=2&ca=2&cl=2&kt=' }
];

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const websiteList = document.getElementById('websiteList');

// Event listener for search button click
searchButton.addEventListener('click', function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        websiteList.innerHTML = ''; // Clear previous website list

        // Create list items for each website
        websites.forEach(function (website) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = website.url + encodeURIComponent(searchTerm);
            link.target = '_blank';
            link.textContent = website.name;
            listItem.appendChild(link);
            websiteList.appendChild(listItem);
        });
    } else {
        searchInput.classList.add('error');
        searchInput.placeholder = 'Please enter a search term';
    }
});

// Event listener for Enter key press
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});
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
            image.alt = 'network error';

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

