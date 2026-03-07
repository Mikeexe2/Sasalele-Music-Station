import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "@waline/client/waline.css";
import "../css/styles.css";
import { ref, get } from "firebase/database";
import { db } from "./utils.js";

document.addEventListener("DOMContentLoaded", function () {
  const siteList = document.getElementById("siteList");
  const siteTabs = document.getElementById("siteTabs");

  async function renderSites(category) {
    siteList.innerHTML = "";
    showLoadingSpinner();

    try {
      const webRef = ref(db, `websites/${category}`);
      const snapshot = await get(webRef);

      hideLoadingSpinner();

      snapshot.forEach((child) => {
        const site = child.val();

        const card = document.createElement("div");
        card.className = "col";

        card.innerHTML = `
          <a role="button" class="list-item" href="${site.url}" target="_blank" rel="noopener noreferrer">
            <div class="media rounded">
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
      hideLoadingSpinner();
      siteList.innerHTML = `
        <div class="text-center w-100 py-3 text-danger">
          Failed to load <b>${category}</b>.
        </div>`;
    }
  }

  siteTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".nav-link");
    if (!tab) return;

    document
      .querySelectorAll(".nav-link")
      .forEach((el) => el.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.dataset.category;
    renderSites(category);
  });

  renderSites("mediatools");
});
