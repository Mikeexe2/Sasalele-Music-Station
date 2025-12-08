import { ref, get } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js';
document.addEventListener('DOMContentLoaded', function () {
  const siteList = document.getElementById("siteList");
  const siteTabs = document.getElementById("siteTabs");
  const db = window.appServices.db;

  async function renderSites(category) {
    siteList.innerHTML = "";
    document.getElementById('loadingSpinner').style.display = 'block';

    try {
      const webRef = ref(db, `websites/${category}`);
      const snapshot = await get(webRef);

      document.getElementById('loadingSpinner').style.display = 'none';

      if (!snapshot.exists()) {
        siteList.innerHTML = `
          <div class="text-center w-100 py-3">
            <i class="fas fa-info-circle text-muted"></i><br>
            No sites found in <b>${category}</b>.
          </div>`;
        return;
      }

      snapshot.forEach(child => {
        const site = child.val();

        const card = document.createElement("div");
        card.className = "col";

        card.innerHTML = `
          <a role="button" class="list-item" href="${site.url}" target="_blank">
            <div class="media w-100 rounded">
              <img src="${site.icon}" alt="${site.name}" class="media-content">
            </div>
            <div class="list-content">
              <div class="list-body">
                <div class="list-title text-md h-1x">${site.name}</div>
              </div>
            </div>
          </a>
        `;

        siteList.appendChild(card);
      });

    } catch (err) {
      console.error("Error loading category:", err);
      document.getElementById('loadingSpinner').style.display = 'none';
      siteList.innerHTML = `
        <div class="text-center w-100 py-3 text-danger">
          Failed to load <b>${category}</b>.
        </div>`;
    }
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
