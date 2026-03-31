import {
  faTimes,
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
  faLink,
  faExpand,
  faCompress,
  faExternalLinkAlt,
  faComments,
  faDownload,
  faFileArrowDown,
  faPaperPlane,
  faRightFromBracket,
  faForwardStep,
  faBackwardStep,
  faRadio,
  faVideo,
  faBookBookmark,
  faPause,
  faExclamationTriangle,
  faMagnifyingGlass,
  faCopyright,
  faShieldHalved,
  faGlobe,
  faFolderOpen,
  faFileLines,
  faArrowsRotate,
  faBan,
  faHeadphones,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import {
  faGithub,
  faGoogle,
  faGoogleDrive,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";

const importedIcons = {
  faTimes,
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
  faLink,
  faExpand,
  faCompress,
  faExternalLinkAlt,
  faComments,
  faDownload,
  faFileArrowDown,
  faPaperPlane,
  faRightFromBracket,
  faForwardStep,
  faBackwardStep,
  faRadio,
  faVideo,
  faBookBookmark,
  faPause,
  faExclamationTriangle,
  faMagnifyingGlass,
  faGithub,
  faGoogle,
  faGoogleDrive,
  faTelegram,
  faCopyright,
  faShieldHalved,
  faGlobe,
  faFolderOpen,
  faFileLines,
  faBan,
  faArrowsRotate,
  faHeadphones,
  faTags,
};

function toKebabCase(iconName) {
  return iconName
    .replace(/^fa/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

const iconMap = Object.entries(importedIcons).reduce((map, [key, value]) => {
  const className = `fa-${toKebabCase(key)}`;
  map[className] = value;
  return map;
}, {});

export function initIcons() {
  const elements = document.querySelectorAll('i[class*="fa-"]');
  elements.forEach((el) => {
    const iconName = [...el.classList].find((cls) => iconMap[cls]);
    const iconData = iconMap[iconName];

    if (iconData) {
      const [width, height, , , path] = iconData.icon;
      const svg = `
        <svg 
          class="${el.className} svg-inline--fa" 
          role="img" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 ${width} ${height}"
          style="width: 1em; height: 1em; fill: currentColor; display: inline-block; vertical-align: -0.125em;"
        >
          <path d="${path}"></path>
        </svg>`;
      el.outerHTML = svg;
    }
  });
}

export function createIcon(name, className = "") {
  const normalized = name.startsWith("fa-") ? name : `fa-${name}`;
  const iconData = iconMap[normalized];

  if (!iconData) return "";

  const [width, height, , , path] = iconData.icon;

  return `
    <svg class="svg-inline--fa ${className}"
         viewBox="0 0 ${width} ${height}"
         style="width: 1em; height: 1em; fill: currentColor;">
      <path d="${path}"></path>
    </svg>
  `.trim();
}
