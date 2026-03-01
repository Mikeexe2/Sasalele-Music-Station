import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { init } from "@waline/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js"
import "@waline/client/waline.css";
import "../css/styles.css";
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faStop,
  faPlay,
  faLightbulb,
  faCircleInfo,
  faCopy,
  faCheck,
  faShuffle,
  faHistory,
  faSearch,
  faLink,
  faExpand,
  faCompress,
  faExternalLinkAlt,
  faComments,
  faDownload,
  faFileArrowDown,
  faPaperPlane,
  faSignOut,
  faForwardStep,
  faBackwardStep,
  faRadio,
  faVideo,
  faBookBookmark,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faGoogle,
  faGoogleDrive,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";

library.add(
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faStop,
  faPlay,
  faPause,
  faLightbulb,
  faCircleInfo,
  faCopy,
  faCheck,
  faShuffle,
  faHistory,
  faSearch,
  faLink,
  faExpand,
  faCompress,
  faExternalLinkAlt,
  faComments,
  faPaperPlane,
  faSignOut,
  faTelegram,
  faGithub,
  faGoogle,
  faDownload,
  faForwardStep,
  faBackwardStep,
  faFileArrowDown,
  faRadio,
  faGoogleDrive,
  faVideo,
  faBookBookmark,
);
dom.watch();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

async function initExternalTools() {
  try {
    init({
      el: "#waline",
      serverURL: import.meta.env.VITE_WALINE_SERVER_URL,
      lang: "en",
      pageview: true,
      meta: ["nick"],
      reaction: [
        "/i1.png",
        "/i2.png",
        "/i3.png",
        "/i4.png",
        "/i5.png",
        "/i6.png",
      ],
      locale: {
        placeholder: "Say something *^_^* ...",
        reactionTitle: "What do you think?",
        sofa: "No comments yet ╥﹏╥...",
      },
      noCopyright: true,
    });

    const cseScript = document.createElement("script");
    cseScript.src = `https://cse.google.com/cse.js?cx=${import.meta.env.VITE_CSE}`;
    cseScript.setAttribute("data-cfasync", "false");
    gaScript.setAttribute("crossorigin", "anonymous");
    cseScript.async = true;

    document.head.appendChild(cseScript);
  } catch (err) {
    console.error("Failed to load external services:", err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initExternalTools();
});
