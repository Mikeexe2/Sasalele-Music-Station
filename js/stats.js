// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = this.getAttribute('href');
        const offset = 60;
        const targetElement = document.querySelector(target);

        if (target === '#search') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        } else if (targetElement) {
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


$(function () {
    $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
    });
})

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
const imageUrls = ["images/slow_images/image1.png", "images/slow_images/image2.png", "images/slow_images/image3.png", "images/slow_images/image4.png", "images/slow_images/image5.png", "images/slow_images/image6.png", "images/slow_images/image7.png", "images/slow_images/image8.png", "images/slow_images/image9.png", "images/slow_images/image10.png", "images/slow_images/image11.png", "images/slow_images/image12.png", "images/slow_images/image13.png", "images/slow_images/image14.png", "images/slow_images/image15.png", "images/slow_images/image16.png", "images/slow_images/image17.png", "images/slow_images/image18.png", "images/slow_images/image19.png", "images/slow_images/image20.png", "images/slow_images/image21.png", "images/slow_images/image22.png", "images/slow_images/image23.png", "images/slow_images/image24.png", "images/slow_images/image25.png", "images/slow_images/image26.png", "images/slow_images/image27.png", "images/slow_images/image28.png", "images/slow_images/image29.png", "images/slow_images/image30.png", "images/slow_images/image31.png", "images/slow_images/image32.png", "images/slow_images/image33.png", "images/slow_images/image34.png", "images/slow_images/image35.png", "images/slow_images/image36.png", "images/slow_images/image37.png", "images/slow_images/image38.png", "images/slow_images/image39.png", "images/slow_images/image40.png", "images/slow_images/image41.png", "images/slow_images/image42.png", "images/slow_images/image43.png", "images/slow_images/image44.png", "images/slow_images/image45.png", "images/slow_images/image46.png", "images/slow_images/image47.png", "images/slow_images/image48.png", "images/slow_images/image49.png", "images/slow_images/image50.png", "images/slow_images/image51.png", "images/slow_images/image52.png", "images/slow_images/image53.png", "images/slow_images/image54.png", "images/slow_images/image55.png", "images/slow_images/image56.png", "images/slow_images/image57.png", "images/slow_images/image58.png", "images/slow_images/image59.png", "images/slow_images/image60.png", "images/slow_images/image61.png", "images/slow_images/image62.png", "images/slow_images/image63.png", "images/slow_images/image64.png", "images/slow_images/image65.png", "images/slow_images/image66.png", "images/slow_images/image67.png", "images/slow_images/image68.png", "images/slow_images/image69.png", "images/slow_images/image70.png", "images/slow_images/image71.png", "images/slow_images/image72.png", "images/slow_images/image73.png", "images/slow_images/image74.png", "images/slow_images/image75.png", "images/slow_images/image76.png", "images/slow_images/image77.png", "images/slow_images/image78.png", "images/slow_images/image79.png", "images/slow_images/image80.png", "images/slow_images/image81.png", "images/slow_images/image82.png", "images/slow_images/image83.png", "images/slow_images/image84.png", "images/slow_images/image85.png", "images/slow_images/image86.png", "images/slow_images/image87.png", "images/slow_images/image88.png", "images/slow_images/image89.png", "images/slow_images/image90.png", "images/slow_images/image91.png", "images/slow_images/image92.png", "images/slow_images/image93.png", "images/slow_images/image94.png", "images/slow_images/image95.png", "images/slow_images/image96.png", "images/slow_images/image97.png", "images/slow_images/image98.png", "images/slow_images/image99.png", "images/slow_images/image100.png", "images/slow_images/image101.png", "images/slow_images/image102.png", "images/slow_images/image103.png", "images/slow_images/image104.png", "images/slow_images/image105.png", "images/slow_images/image106.png", "images/slow_images/image107.png", "images/slow_images/image108.png", "images/slow_images/image109.png", "images/slow_images/image110.png", "images/slow_images/image111.png", "images/slow_images/image112.png", "images/slow_images/image113.png", "images/slow_images/image114.png", "images/slow_images/image115.png", "images/slow_images/image116.png", "images/slow_images/image117.png", "images/slow_images/image118.png", "images/slow_images/image119.png", "images/slow_images/image120.png", "images/slow_images/image121.png", "images/slow_images/image122.png", "images/slow_images/image123.png", "images/slow_images/image124.png", "images/slow_images/image125.png", "images/slow_images/image126.png", "images/slow_images/image127.png", "images/slow_images/image128.png", "images/slow_images/image129.png", "images/slow_images/image130.png", "images/slow_images/image131.png", "images/slow_images/image132.png", "images/slow_images/image133.png", "images/slow_images/image134.png", "images/slow_images/image135.png", "images/slow_images/image136.png", "images/slow_images/image137.png", "images/slow_images/image138.png", "images/slow_images/image139.png", "images/slow_images/image140.png", "images/slow_images/image141.png", "images/slow_images/image142.png", "images/slow_images/image143.png", "images/slow_images/image144.png", "images/slow_images/image145.png", "images/slow_images/image146.png", "images/slow_images/image147.png", "images/slow_images/image148.png", "images/slow_images/image149.png", "images/slow_images/image150.png", "images/slow_images/image151.png", "images/slow_images/image152.png", "images/slow_images/image153.png", "images/slow_images/image154.png", "images/slow_images/image155.png", "images/slow_images/image156.png", "images/slow_images/image157.png", "images/slow_images/image158.png", "images/slow_images/image159.png", "images/slow_images/image160.png", "images/slow_images/image161.png", "images/slow_images/image162.png", "images/slow_images/image163.png", "images/slow_images/image164.png", "images/slow_images/image165.png", "images/slow_images/image166.png", "images/slow_images/image167.png", "images/slow_images/image168.png", "images/slow_images/image169.png", "images/slow_images/image170.png", "images/slow_images/image171.png", "images/slow_images/image172.png", "images/slow_images/image173.png", "images/slow_images/image174.png", "images/slow_images/image175.png", "images/slow_images/image176.png", "images/slow_images/image177.png", "images/slow_images/image178.png", "images/slow_images/image179.png", "images/slow_images/image180.png", "images/slow_images/image181.png", "images/slow_images/image182.png", "images/slow_images/image183.png", "images/slow_images/image184.png", "images/slow_images/image185.png", "images/slow_images/image186.png", "images/slow_images/image187.png", "images/slow_images/image188.png", "images/slow_images/image189.png", "images/slow_images/image190.png", "images/slow_images/image191.png", "images/slow_images/image192.png", "images/slow_images/image193.png", "images/slow_images/image194.png", "images/slow_images/image195.png", "images/slow_images/image196.png", "images/slow_images/image197.png", "images/slow_images/image198.png", "images/slow_images/image199.png", "images/slow_images/image200.png", "images/slow_images/image201.png", "images/slow_images/image202.png", "images/slow_images/image203.png", "images/slow_images/image204.png", "images/slow_images/image205.png", "images/slow_images/image206.png", "images/slow_images/image207.png", "images/slow_images/image208.png", "images/slow_images/image209.png", "images/slow_images/image210.png", "images/slow_images/image211.png", "images/slow_images/image212.png", "images/slow_images/image213.png", "images/slow_images/image214.png", "images/slow_images/image215.png", "images/slow_images/image216.png", "images/slow_images/image217.png", "images/slow_images/image218.png", "images/slow_images/image219.png", "images/slow_images/image220.png", "images/slow_images/image221.png", "images/slow_images/image222.png", "images/slow_images/image223.png", "images/slow_images/image224.png", "images/slow_images/image225.png", "images/gif_images1/image1.png", "images/gif_images1/image2.png", "images/gif_images1/image3.png", "images/gif_images1/image4.png", "images/gif_images1/image5.png", "images/gif_images1/image6.png", "images/gif_images1/image7.png", "images/gif_images1/image8.png", "images/gif_images1/image9.png", "images/gif_images1/image10.png", "images/gif_images1/image11.png", "images/gif_images1/image12.png", "images/gif_images1/image13.png", "images/gif_images1/image14.png", "images/gif_images1/image15.png", "images/gif_images1/image16.png", "images/gif_images1/image17.png", "images/gif_images1/image18.png", "images/gif_images1/image19.png", "images/gif_images1/image20.png", "images/gif_images1/image21.png", "images/gif_images1/image22.png", "images/gif_images1/image23.png", "images/gif_images1/image24.png", "images/gif_images1/image25.png", "images/gif_images1/image26.png", "images/gif_images1/image27.png", "images/gif_images2/image1.png", "images/gif_images2/image2.png", "images/gif_images2/image3.png", "images/gif_images2/image4.png", "images/gif_images2/image5.png", "images/gif_images2/image6.png", "images/gif_images2/image7.png", "images/gif_images2/image8.png", "images/gif_images2/image9.png", "images/gif_images2/image10.png", "images/gif_images2/image11.png", "images/gif_images2/image12.png", "images/gif_images2/image13.png", "images/gif_images2/image14.png", "images/gif_images2/image15.png", "images/gif_images2/image16.png", "images/gif_images2/image17.png", "images/gif_images3/image1.png", "images/gif_images3/image2.png", "images/gif_images3/image3.png", "images/gif_images3/image4.png", "images/gif_images3/image5.png", "images/gif_images3/image6.png", "images/gif_images4/image1.png", "images/gif_images4/image2.png", "images/gif_images4/image3.png", "images/gif_images4/image4.png", "images/gif_images4/image5.png", "images/gif_images4/image6.png", "images/gif_images5/image1.png", "images/gif_images5/image2.png", "images/gif_images5/image3.png", "images/gif_images5/image4.png", "images/gif_images5/image5.png", "images/gif_images5/image6.png", "images/gif_images6/image1.png", "images/gif_images6/image2.png", "images/gif_images6/image3.png", "images/gif_images6/image4.png", "images/gif_images6/image5.png", "images/gif_images6/image6.png"];

function preloadImages(urls) {
    let loadedImages = 0;
    const totalImages = urls.length;

    return new Promise((resolve, reject) => {
        urls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loadedImages++;
                if (loadedImages === totalImages) {
                    resolve();
                }
            };
            img.onerror = reject;
            img.src = url;
        });
    });
}

function showLoadingMessage() {
    document.getElementById('loadingMessage').style.display = 'block';
}

function hideLoadingMessage() {
    document.getElementById('loadingMessage').style.display = 'none';
}

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
    "#ff4b4b", "#cfa77d", "#a4826d", "#606060", "#d3615f", "#d48a75", "#9dbce6", "#4a6ef0",
    "#ffd4a3", "#8c5c69", "#42d639", "#72c977", "#d1c267", "#a0f1b2", "#8c7e7b", "#2aaf80",
    "#e03acb", "#b1f159", "#6379d3", "#f0f44f", "#fbb7d1", "#f4a26b", "#97a2c9", "#e38531",
    "#fbd0a3", "#6d4a73", "#f04f25", "#b5b18a", "#ff6b2f", "#c4a8e0", "#4b5159", "#d64f45",
    "#3a8aa7", "#d9e7ff", "#9b4c97", "#7848db", "#ea855f", "#ff246a", "#e32946", "#4bb5cc",
    "#8b55bf", "#f0a3e0", "#ff2e6f", "#afffda", "#c46f3c", "#8f7a4c", "#45cda2", "#d085ff",
    "#fff5db", "#ff624f", "#f0a373", "#d0acb1", "#f7f5f0", "#1d8270", "#8dd9e5", "#d38b8b",
    "#d36ab5", "#fff1db", "#e5c8fe", "#eed7ff", "#fce379", "#70c5a4", "#7075d1", "#8587b9",
    "#9494b8", "#9a9cc6", "#a0a9d2", "#c1bff4", "#d0d2ff", "#fb2656", "#1dd0e4", "#96f1bb",
    "#b91fff", "#e5481f", "#2b577e", "#6a37db", "#c02d96", "#b865b8", "#f6c6a1", "#607fbf",
    "#2f7b88", "#6fa8f7", "#4f8fe1", "#a2f5ef", "#d6f8f4", "#4766e4", "#7df8d1", "#8bc5a9",
    "#4c97ff", "#b7f7a2", "#fdffa3", "#3b58bf", "#cc97fd", "#dcbad0", "#b367ef", "#9bffb5",
    "#6f95ff", "#f27797", "#e5bfe3", "#ffdfd9", "#2c3e74", "#ea56e4", "#ff7421", "#d2b9cf",
    "#c3f4c7", "#ff4f92", "#97a7f9", "#5bc7eb", "#93f5ef", "#f3bfd9", "#cc61f7", "#39c6fb",
    "#8fe7d3", "#65eaf5", "#f5c96b", "#f1d8ff", "#d160ff", "#5d3b79", "#4094db", "#c5c6f9",
    "#baf2f3", "#cd72ff", "#fcd0b3", "#f6c900"
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
    background.style.backgroundColor = randomColor;
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

async function handleToggleChange() {
    const toggleAnimation = document.getElementById('toggleAnimation');

    if (toggleAnimation.checked) {
        showLoadingMessage();

        try {
            await preloadImages(imageUrls);
            console.log('All images are preloaded.');
            updateImageAndBackground();
        } catch (error) {
            console.error('Error preloading images:', error);
        } finally {
            hideLoadingMessage();
        }
    } else {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

setRandomBackgroundColor();
setRandomImage();