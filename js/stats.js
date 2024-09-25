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

const colors = ["#cd4a4a", "#fae7b5", "#9f8170", "#232323", "#bc5d58", "#dd9475", "#9acdff", "#2b6cc4", "#efcdc0", "#6e515f", "#1df913", "#71bc78", "#fcd975", "#a8e4a0", "#95918c", "#1caf78", "#ff1dce", "#b2ec5d", "#5d76cb", "#fdfc74", "#fcb4d5", "#ffbd88", "#979aaa", "#ff8243", "#fdbcaa", "#1a4876", "#ffa343", "#baa864", "#ff752e", "#e6a8d7", "#414a4c", "#ff6e4a", "#1ca9c9", "#c5d0e6", "#8e4585", "#7442c8", "#d68659", "#e3236b", "#ee204d", "#1fcccb", "#7851a9", "#ff9bad", "#fc2847", "#9fe2bf", "#a5694f", "#8a795d", "#45cea2", "#fb7eff", "#eceaBE", "#fd5e53", "#faa76c", "#fc89ac", "#dbd7d2", "#17806d", "#77dde7", "#ffa089", "#8f4c9d", "#ededed", "#ff43a4", "#fc6c85", "#cda4de", "#fce885", "#c5e384", "#ffb653", "#505285", "#585e92", "#65689f", "#7474b0", "#7e7ebb", "#8389c7", "#9795d4", "#a2a1dc", "#b5aee4", "#ff0844", "#00c9ff", "#92fe9d", "#b721ff", "#f83600", "#13547a", "#7028e4", "#d43f8d", "#ec77ab", "#c1c161", "#20E2D7", "#007adf", "#F578DC", "#7DE2FC", "#85FFBD", "#FFFB7D", "#8BC6EC", "#E0C3FC", "#C850C0", "#0093E9", "#80D0C7", "#EA5455", "#ABDCFF", "#90F7EC", "#CE9FFC", "#7367F0", "#28C76F", "#F97794", "#8C1BAB", "#FFD26F", "#F6CEEC", "#D939CD", "#002661", "#EEAD92", "#52E5E7", "#CA26FF", "#FFF720", "#FAB2FF", "#00EAFF", "#FFA8A8"];

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