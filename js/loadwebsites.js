document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.database();

  const siteList = document.getElementById("siteList");
  const siteTabs = document.getElementById("siteTabs");

  function renderSites(category) {
    siteList.innerHTML = "";
    document.getElementById('loadingSpinner').style.display = 'block';

    db.ref(`websites/${category}`).once("value", (snapshot) => {
      document.getElementById('loadingSpinner').style.display = 'none';

      if (!snapshot.exists()) {
        siteList.innerHTML = `
          <div class="text-center w-100 py-3">
            <i class="fas fa-info-circle text-muted"></i><br>
            No sites found in <b>${category}</b>.
          </div>`;
        return;
      }

      snapshot.forEach((child) => {
        const data = child.val();

        const card = document.createElement("div");
        card.className = "col";
        card.innerHTML = `
          <a role="button" class="list-item" href="${data.url}" target="_blank">
            <div class="media w-100 rounded">
              <img src="${data.icon}" alt="${data.name}" class="media-content">
            </div>
            <div class="list-content">
              <div class="list-body">
                <div class="list-title text-md h-1x">${data.name}</div>
              </div>
            </div>
          </a>
        `;
        siteList.appendChild(card);
      });
    });
  }

  siteTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".nav-link");
    if (!tab) return;

    document.querySelectorAll(".nav-link").forEach((el) => el.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.dataset.category;
    renderSites(category);
  });

  renderSites("musicsite");
});
