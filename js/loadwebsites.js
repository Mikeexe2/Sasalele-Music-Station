async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null;
    }
}
// hope it will help maintenance easier later
async function generateLinks(location, jsonfile) {
    const data = await fetchJSON(jsonfile);
    if (!data) return;

    const linksContainer = document.getElementById(location);
    data.forEach(link => {
        const listItem = document.createElement('li');
        listItem.classList.add('LinksItem');

        const linkElement = document.createElement('a');
        linkElement.classList.add('LinksItemLink');
        linkElement.href = link.url;
        linkElement.target = '_blank';

        const iconImage = document.createElement('img');
        iconImage.classList.add('rad-icon');
        iconImage.alt = link.name;
        iconImage.src = link.icon;

        linkElement.appendChild(iconImage);
        linkElement.insertAdjacentHTML('beforeend', `${link.name}`);

        listItem.appendChild(linkElement);
        linksContainer.appendChild(listItem);
    });
}

generateLinks('radiowebsites', 'Links/radiowebsites.json');
generateLinks('jppodcastradio', 'Links/jppodcastradio.json');
generateLinks('musicsites', 'Links/musicsites.json');
generateLinks('downloadtools', 'Links/downloadtools.json');
