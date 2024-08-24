// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = this.getAttribute('href');
        const offset = 0;
        const targetElement = document.querySelector(target);

        if (targetElement) {
            const isInCollapsible = targetElement.closest('.collapse');

            if (!isInCollapsible) {
                const offsetTop = targetElement.offsetTop - offset;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Back to top button
function goTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

const backtotop = document.querySelector('.back-to-top');
if (backtotop) {
    function toggleBacktotop() {
        backtotop.classList.toggle('active', window.scrollY > 100);
    }

    backtotop.addEventListener('click', goTop);
    window.addEventListener('scroll', toggleBacktotop);
}

let originalTitle = document.title;
let titleTime;

document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        document.title = "Playing music~";
        clearTimeout(titleTime);
    } else {
        document.title = "(/≧▽≦/) Welcome back!";
        titleTime = setTimeout(function () {
            document.title = originalTitle;
        }, 1000);
    }
});

const clockTime = document.getElementById("clockTime");
const clockDay = document.getElementById("clockDay");

function updateClock() {
    const now = new Date();
    const timeString = `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
    const dayString = `${padZero(now.getMonth() + 1)}/${padZero(now.getDate())} ${getDayAbbreviation(now.getDay())}`;

    clockTime.textContent = timeString;
    clockDay.textContent = dayString;
}

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}

function getDayAbbreviation(day) {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[day];
}

updateClock();
setInterval(updateClock, 1000);

// 0x40 hues animation??
const background = document.getElementById('background');
const randomimg = document.getElementById('randomimg');

let animationTimeout;
let phaseStartTime = Date.now();
let currentPhase = 'random';
let randomFolderCurrentIndex = 1;
let gifFolderImageCount = 0;
let gifFolderCurrentIndex = 1;

const phaseDuration = 10 * 1000;

let gifFolders = ['gif_images1', 'gif_images2', 'gif_images3', 'gif_images4', 'gif_images5', 'gif_images6'];
let currentGifFolder = '';

const imageFolders = {
    'random': 'slow_images',
    'fast': ''
};

const folderImageCounts = {
    'gif_images1': 27,
    'gif_images2': 17,
    'gif_images3': 6,
    'gif_images4': 6,
    'gif_images5': 6,
    'gif_images6': 6
};

const colors = [
    0xcd4a4a, 0xfae7b5, 0x9f8170, 0x232323, 0xbc5d58, 0xdd9475, 0x9aceeb,
    0x2b6cc4, 0xefcdb8, 0x6e5160, 0x1df914, 0x71bc78, 0xfcd975, 0xa8e4a0,
    0x95918c, 0x1cac78, 0xff1dce, 0xb2ec5d, 0x5d76cb, 0xfdfc74, 0xfcb4d5,
    0xffbd88, 0x979aaa, 0xff8243, 0xfdbcb4, 0x1a4876, 0xffa343, 0xbab86c,
    0xff7538, 0xe6a8d7, 0x414a4c, 0xff6e4a, 0x1ca9c9, 0xc5d0e6, 0x8e4585,
    0x7442c8, 0xd68a59, 0xe3256b, 0xee204d, 0x1fcecb, 0x7851a9, 0xff9baa,
    0xfc2847, 0x9fe2bf, 0xa5694f, 0x8a795d, 0x45cea2, 0xfb7efd, 0xeceabe,
    0xfd5e53, 0xfaa76c, 0xfc89ac, 0xdbd7d2, 0x17806d, 0x77dde7, 0xffa089,
    0x8f509d, 0xededed, 0xff43a4, 0xfc6c85, 0xcda4de, 0xfce883, 0xc5e384,
    0xffb653
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getImageCount(folder) {
    return folderImageCounts[folder] || 0;
}

function selectRandomGifFolder() {
    const randomIndex = getRandomInt(0, gifFolders.length - 1);
    currentGifFolder = gifFolders[randomIndex];
    gifFolderImageCount = getImageCount(currentGifFolder);
    return currentGifFolder;
}

function setRandomBackgroundColor() {
    const randomColor = colors[getRandomInt(0, colors.length - 1)];
    const hex = `#${randomColor.toString(16).padStart(6, '0')}`;
    background.style.backgroundColor = hex;
}

function setRandomImage() {
    const folder = imageFolders[currentPhase];
    const randomIndex = getRandomInt(1, 225);
    randomimg.style.display = "block";
    randomimg.src = `images/${folder}/image${randomIndex}.png`;

    const animations = ['anim-blur-left', 'anim-blur-right', 'anim-blur-top', 'anim-blur-bottom'];
    const anim = animations[getRandomInt(0, animations.length - 1)];
    randomimg.className = anim;
}

function updateImageAndBackground() {
    if (currentPhase === 'random') {
        setRandomImage();
        setRandomBackgroundColor();

        let interval = getRandomInt(400, 800);
        animationTimeout = setTimeout(updateImageAndBackground, interval);

        if (Date.now() - phaseStartTime > phaseDuration) {
            currentPhase = 'fast';
            selectRandomGifFolder();
            gifFolderCurrentIndex = 1;
            phaseStartTime = Date.now();
        }
    } else if (currentPhase === 'fast') {
        if (gifFolderCurrentIndex > gifFolderImageCount) {
            currentPhase = 'random';
            phaseStartTime = Date.now();
            animationTimeout = setTimeout(updateImageAndBackground, getRandomInt(400, 800));
        } else {
            const imageIndex = gifFolderCurrentIndex++;
            randomimg.style.display = "block";
            randomimg.src = `images/${currentGifFolder}/image${imageIndex}.png`;
            animationTimeout = setTimeout(updateImageAndBackground, 100);
        }
    }
}

function handleToggleChange() {
    if (toggleAnimation.checked) {
        if (!animationTimeout) {
            updateImageAndBackground();
        }
    } else {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

setRandomBackgroundColor();
setRandomImage();