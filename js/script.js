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
    });
