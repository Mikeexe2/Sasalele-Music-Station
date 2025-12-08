document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById("toggleAnimation");

    if (toggle) {
        toggle.onclick = null;
        toggle.addEventListener("change", handleToggleChange);
    }

    const backtotop = document.querySelector('.back-to-top');
    if (backtotop) {
        function toggleBacktotop() {
            backtotop.classList.toggle('active', window.scrollY > 100);
        }

        backtotop.addEventListener('click', goTop);
        window.addEventListener('scroll', toggleBacktotop);
    }

    function goTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function showNotification(message, type = 'info') {
        const notificationArea = document.getElementById('notification-area') || createNotificationArea();

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

        notificationArea.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notificationArea.removeChild(notification);
            }, 2000);
        }, 1000);
    }

    function createNotificationArea() {
        const notificationArea = document.createElement('div');
        notificationArea.id = 'notification-area';
        notificationArea.className = 'position-fixed top-0 end-0 p-3';
        notificationArea.style.zIndex = '99999';
        document.body.appendChild(notificationArea);
        return notificationArea;
    }

    window.showNotification = showNotification;

    function showLoadingSpinner() {
        document.getElementById('loadingSpinner').style.display = 'block';
    }

    function hideLoadingSpinner() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    window.showLoadingSpinner = showLoadingSpinner;
    window.hideLoadingSpinner = hideLoadingSpinner;

    $(function () {
        $('[data-toggle="tooltip"]').tooltip({
            trigger: 'hover'
        });
        $('#historyBtn').tooltip({
            trigger: 'hover'
        });
    })

    function siteTime() {
        window.setTimeout(siteTime, 1000);
        var seconds = 1000;
        var minutes = seconds * 60;
        var hours = minutes * 60;
        var days = hours * 24;
        var years = days * 365;
        var today = new Date();
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth();
        var todayDate = today.getDate();
        var todayHour = today.getHours();
        var todayMinute = today.getMinutes();
        var todaySecond = today.getSeconds();
        var t1 = Date.UTC(2023, 9, 1, 0, 0, 0);
        var t2 = Date.UTC(todayYear, todayMonth, todayDate, todayHour, todayMinute, todaySecond);
        var diff = t2 - t1;
        var diffYears = Math.floor(diff / years);
        var diffDays = Math.floor((diff / days) - diffYears * 365);
        var diffHours = Math.floor((diff - (diffYears * 365 + diffDays) * days) / hours);
        var diffMinutes = Math.floor((diff - (diffYears * 365 + diffDays) * days - diffHours * hours) / minutes);
        var diffSeconds = Math.floor((diff - (diffYears * 365 + diffDays) * days - diffHours * hours - diffMinutes * minutes) / seconds);
        document.getElementById("liveTime").innerHTML = diffYears + " Years " + diffDays + " Days " + diffHours + " Hours " + diffMinutes + " Minutes " + diffSeconds + " Seconds";
    }

    const getLastCommitDate = (() => {
        const storageKey = "lastCommitDate";

        return async function () {
            let cachedDate = localStorage.getItem(storageKey);
            if (cachedDate) {

                document.getElementById('last-updated-date').textContent = cachedDate;

                return cachedDate;
            }
            const apiUrl = `https://api.github.com/repos/Mikeexe2/Sasalele-Music-Station/commits`;
            try {
                const response = await fetch(apiUrl);
                const commits = await response.json();

                if (commits && commits.length > 0) {
                    const lastCommitDate = commits[0].commit.author.date;
                    const formattedDate = new Date(lastCommitDate).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    localStorage.setItem(storageKey, formattedDate);

                    document.getElementById('last-updated-date').textContent = formattedDate;
                    return formattedDate;
                } else {
                    console.error('No commits found for the repository');
                    return null;
                }
            } catch (error) {
                console.error('Error fetching commit data:', error);
                return null;
            }
        };
    })();

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
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        return days[day];
    }

    const imageUrls = ["images/slow_images/image1.png", "images/slow_images/image2.png", "images/slow_images/image3.png", "images/slow_images/image4.png", "images/slow_images/image5.png", "images/slow_images/image6.png", "images/slow_images/image7.png", "images/slow_images/image8.png", "images/slow_images/image9.png", "images/slow_images/image10.png", "images/slow_images/image11.png", "images/slow_images/image12.png", "images/slow_images/image13.png", "images/slow_images/image14.png", "images/slow_images/image15.png", "images/slow_images/image16.png", "images/slow_images/image17.png", "images/slow_images/image18.png", "images/slow_images/image19.png", "images/slow_images/image20.png", "images/slow_images/image21.png", "images/slow_images/image22.png", "images/slow_images/image23.png", "images/slow_images/image24.png", "images/slow_images/image25.png", "images/slow_images/image26.png", "images/slow_images/image27.png", "images/slow_images/image28.png", "images/slow_images/image29.png", "images/slow_images/image30.png", "images/slow_images/image31.png", "images/slow_images/image32.png", "images/slow_images/image33.png", "images/slow_images/image34.png", "images/slow_images/image35.png", "images/slow_images/image36.png", "images/slow_images/image37.png", "images/slow_images/image38.png", "images/slow_images/image39.png", "images/slow_images/image40.png", "images/slow_images/image41.png", "images/slow_images/image42.png", "images/slow_images/image43.png", "images/slow_images/image44.png", "images/slow_images/image45.png", "images/slow_images/image46.png", "images/slow_images/image47.png", "images/slow_images/image48.png", "images/slow_images/image49.png", "images/slow_images/image50.png", "images/slow_images/image51.png", "images/slow_images/image52.png", "images/slow_images/image53.png", "images/slow_images/image54.png", "images/slow_images/image55.png", "images/slow_images/image56.png", "images/slow_images/image57.png", "images/slow_images/image58.png", "images/slow_images/image59.png", "images/slow_images/image60.png", "images/slow_images/image61.png", "images/slow_images/image62.png", "images/slow_images/image63.png", "images/slow_images/image64.png", "images/slow_images/image65.png", "images/slow_images/image66.png", "images/slow_images/image67.png", "images/slow_images/image68.png", "images/slow_images/image69.png", "images/slow_images/image70.png", "images/slow_images/image71.png", "images/slow_images/image72.png", "images/slow_images/image73.png", "images/slow_images/image74.png", "images/slow_images/image75.png", "images/slow_images/image76.png", "images/slow_images/image77.png", "images/slow_images/image78.png", "images/slow_images/image79.png", "images/slow_images/image80.png", "images/slow_images/image81.png", "images/slow_images/image82.png", "images/slow_images/image83.png", "images/slow_images/image84.png", "images/slow_images/image85.png", "images/slow_images/image86.png", "images/slow_images/image87.png", "images/slow_images/image88.png", "images/slow_images/image89.png", "images/slow_images/image90.png", "images/slow_images/image91.png", "images/slow_images/image92.png", "images/slow_images/image93.png", "images/slow_images/image94.png", "images/slow_images/image95.png", "images/slow_images/image96.png", "images/slow_images/image97.png", "images/slow_images/image98.png", "images/slow_images/image99.png", "images/slow_images/image100.png", "images/slow_images/image101.png", "images/slow_images/image102.png", "images/slow_images/image103.png", "images/slow_images/image104.png", "images/slow_images/image105.png", "images/slow_images/image106.png", "images/slow_images/image107.png", "images/slow_images/image108.png", "images/slow_images/image109.png", "images/slow_images/image110.png", "images/slow_images/image111.png", "images/slow_images/image112.png", "images/slow_images/image113.png", "images/slow_images/image114.png", "images/slow_images/image115.png", "images/slow_images/image116.png", "images/slow_images/image117.png", "images/slow_images/image118.png", "images/slow_images/image119.png", "images/slow_images/image120.png", "images/slow_images/image121.png", "images/slow_images/image122.png", "images/slow_images/image123.png", "images/slow_images/image124.png", "images/slow_images/image125.png", "images/slow_images/image126.png", "images/slow_images/image127.png", "images/slow_images/image128.png", "images/slow_images/image129.png", "images/slow_images/image130.png", "images/slow_images/image131.png", "images/slow_images/image132.png", "images/slow_images/image133.png", "images/slow_images/image134.png", "images/slow_images/image135.png", "images/slow_images/image136.png", "images/slow_images/image137.png", "images/slow_images/image138.png", "images/slow_images/image139.png", "images/slow_images/image140.png", "images/slow_images/image141.png", "images/slow_images/image142.png", "images/slow_images/image143.png", "images/slow_images/image144.png", "images/slow_images/image145.png", "images/slow_images/image146.png", "images/slow_images/image147.png", "images/slow_images/image148.png", "images/slow_images/image149.png", "images/slow_images/image150.png", "images/slow_images/image151.png", "images/slow_images/image152.png", "images/slow_images/image153.png", "images/slow_images/image154.png", "images/slow_images/image155.png", "images/slow_images/image156.png", "images/slow_images/image157.png", "images/slow_images/image158.png", "images/slow_images/image159.png", "images/slow_images/image160.png", "images/slow_images/image161.png", "images/slow_images/image162.png", "images/slow_images/image163.png", "images/slow_images/image164.png", "images/slow_images/image165.png", "images/slow_images/image166.png", "images/slow_images/image167.png", "images/slow_images/image168.png", "images/slow_images/image169.png", "images/slow_images/image170.png", "images/slow_images/image171.png", "images/slow_images/image172.png", "images/slow_images/image173.png", "images/slow_images/image174.png", "images/slow_images/image175.png", "images/slow_images/image176.png", "images/slow_images/image177.png", "images/slow_images/image178.png", "images/slow_images/image179.png", "images/slow_images/image180.png", "images/slow_images/image181.png", "images/slow_images/image182.png", "images/slow_images/image183.png", "images/slow_images/image184.png", "images/slow_images/image185.png", "images/slow_images/image186.png", "images/slow_images/image187.png", "images/slow_images/image188.png", "images/slow_images/image189.png", "images/slow_images/image190.png", "images/slow_images/image191.png", "images/slow_images/image192.png", "images/slow_images/image193.png", "images/slow_images/image194.png", "images/slow_images/image195.png", "images/slow_images/image196.png", "images/slow_images/image197.png", "images/slow_images/image198.png", "images/slow_images/image199.png", "images/slow_images/image200.png", "images/slow_images/image201.png", "images/slow_images/image202.png", "images/slow_images/image203.png", "images/slow_images/image204.png", "images/slow_images/image205.png", "images/slow_images/image206.png", "images/slow_images/image207.png", "images/slow_images/image208.png", "images/slow_images/image209.png", "images/slow_images/image210.png", "images/slow_images/image211.png", "images/slow_images/image212.png", "images/slow_images/image213.png", "images/slow_images/image214.png", "images/slow_images/image215.png", "images/slow_images/image216.png", "images/slow_images/image217.png", "images/slow_images/image218.png", "images/slow_images/image219.png", "images/slow_images/image220.png", "images/slow_images/image221.png", "images/slow_images/image222.png", "images/slow_images/image223.png", "images/slow_images/image224.png", "images/slow_images/image225.png", "images/gif_images1/image1.png", "images/gif_images1/image2.png", "images/gif_images1/image3.png", "images/gif_images1/image4.png", "images/gif_images1/image5.png", "images/gif_images1/image6.png", "images/gif_images1/image7.png", "images/gif_images1/image8.png", "images/gif_images1/image9.png", "images/gif_images1/image10.png", "images/gif_images1/image11.png", "images/gif_images1/image12.png", "images/gif_images1/image13.png", "images/gif_images1/image14.png", "images/gif_images1/image15.png", "images/gif_images1/image16.png", "images/gif_images1/image17.png", "images/gif_images1/image18.png", "images/gif_images1/image19.png", "images/gif_images1/image20.png", "images/gif_images1/image21.png", "images/gif_images1/image22.png", "images/gif_images1/image23.png", "images/gif_images1/image24.png", "images/gif_images1/image25.png", "images/gif_images1/image26.png", "images/gif_images1/image27.png", "images/gif_images2/image1.png", "images/gif_images2/image2.png", "images/gif_images2/image3.png", "images/gif_images2/image4.png", "images/gif_images2/image5.png", "images/gif_images2/image6.png", "images/gif_images2/image7.png", "images/gif_images2/image8.png", "images/gif_images2/image9.png", "images/gif_images2/image10.png", "images/gif_images2/image11.png", "images/gif_images2/image12.png", "images/gif_images2/image13.png", "images/gif_images2/image14.png", "images/gif_images2/image15.png", "images/gif_images2/image16.png", "images/gif_images2/image17.png", "images/gif_images3/image1.png", "images/gif_images3/image2.png", "images/gif_images3/image3.png", "images/gif_images3/image4.png", "images/gif_images3/image5.png", "images/gif_images3/image6.png", "images/gif_images4/image1.png", "images/gif_images4/image2.png", "images/gif_images4/image3.png", "images/gif_images4/image4.png", "images/gif_images4/image5.png", "images/gif_images4/image6.png", "images/gif_images5/image1.png", "images/gif_images5/image2.png", "images/gif_images5/image3.png", "images/gif_images5/image4.png", "images/gif_images5/image5.png", "images/gif_images5/image6.png", "images/gif_images6/image1.png", "images/gif_images6/image2.png", "images/gif_images6/image3.png", "images/gif_images6/image4.png", "images/gif_images6/image5.png", "images/gif_images6/image6.png"];

    const gifFolders = ['gif_images1', 'gif_images2', 'gif_images3', 'gif_images4', 'gif_images5', 'gif_images6'];
    const folderImageCounts = {
        gif_images1: 27, gif_images2: 17, gif_images3: 6,
        gif_images4: 6, gif_images5: 6, gif_images6: 6
    };
    const bgimages = [
        'assets/0.webp', 'assets/1.webp', 'assets/2.webp',
        'assets/3.webp', 'assets/4.webp', 'assets/5.webp', 'assets/6.webp'
    ];

    const gradients = [
        "var(--gradient-vivid-cyan-blue-to-vivid-purple)",
        "var(--gradient-light-green-cyan-to-vivid-green-cyan)",
        "var(--gradient--luminous-vivid-amber-to-luminous-vivid-orange)",
        "var(--gradient--luminous-vivid-orange-to-vivid-red)",
        "var(--gradient--very-light-gray-to-cyan-bluish-gray)",
        "var(--gradient--cool-to-warm-spectrum)",
        "var(gradient--blush-light-purple)",
        "var(--gradient--blush-bordeaux)",
        "var(--gradient--luminous-dusk)",
        "var(--gradient--pale-ocean)",
        "var(--gradient--electric-grass)",
        "var(--gradient--midnight)"
    ];

    const beatPatterns = [
        [600, 600, 600, 600],
        [400, 400, 800, 400],
        [300, 300, 300, 900],
        [500, 700, 500, 700],
        [200, 400, 200, 1000],
        [400, 600, 400, 600],
        [500, 500, 500, 500],
        [300, 400, 300, 700],
        [450, 550, 450, 550],
        [400, 400, 400, 400],
        [200, 200, 200, 600],
        [150, 150, 300, 150, 150, 300],
        [600, 400, 600, 400],
        [300, 300, 600, 300, 300, 600],
        [500, 500, 250, 250, 500]
    ];

    const phaseDuration = 10 * 1000;
    const randomimg = document.getElementById('randomimg');
    let isAnimating = false;
    let currentPhase = 'random';
    let phaseStartTime = 0;
    let gifFolderImageCount = 0;
    let gifFolderCurrentIndex = 1;
    let currentGifFolder = '';
    let animationTimeout = null;
    let currentBeatPattern = [];
    let currentBeatIndex = 0;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function selectRandomGifFolder() {
        const idx = getRandomInt(0, gifFolders.length - 1);
        currentGifFolder = gifFolders[idx];
        gifFolderImageCount = folderImageCounts[currentGifFolder];
    }

    function getNextBeatInterval() {
        if (currentBeatPattern.length === 0 || currentBeatIndex >= currentBeatPattern.length) {
            const patternIndex = getRandomInt(0, beatPatterns.length - 1);
            currentBeatPattern = beatPatterns[patternIndex];
            currentBeatIndex = 0;
        }
        const interval = currentBeatPattern[currentBeatIndex];
        currentBeatIndex++;
        return interval;
    }

    function setRandomImage() {
        const randomIndex = getRandomInt(1, 225);
        randomimg.style.display = "block";
        randomimg.src = `images/slow_images/image${randomIndex}.png`;
        randomimg.classList.remove('anim-fade-slide');
        void randomimg.offsetWidth;
        randomimg.classList.add('anim-fade-slide');
    }

    function updateImageAndBackground() {
        if (!isAnimating) return;
        const elapsed = Date.now() - phaseStartTime;
        if (currentPhase === 'random') {
            setRandomImage();
            const nextInterval = getNextBeatInterval();
            if (elapsed > phaseDuration) {
                currentPhase = 'fast';
                selectRandomGifFolder();
                gifFolderCurrentIndex = 1;
                phaseStartTime = Date.now();
            }
            animationTimeout = setTimeout(() => requestAnimationFrame(updateImageAndBackground), nextInterval);
        } else if (currentPhase === 'fast') {
            if (gifFolderCurrentIndex > gifFolderImageCount) {
                currentPhase = 'random';
                phaseStartTime = Date.now();
                animationTimeout = setTimeout(() => requestAnimationFrame(updateImageAndBackground), getNextBeatInterval());
            } else {
                randomimg.style.display = "block";
                randomimg.src = `images/${currentGifFolder}/image${gifFolderCurrentIndex++}.png`;
                animationTimeout = setTimeout(() => requestAnimationFrame(updateImageAndBackground), 100);
            }
        }
    }

    function preloadImages(urls) {
        let loaded = 0;
        const total = urls.length;
        return new Promise((resolve, reject) => {
            urls.forEach(url => {
                const img = new Image();
                img.onload = () => {
                    loaded++;
                    if (loaded === total) resolve();
                };
                img.onerror = reject;
                img.src = url;
            });
        });
    }

    async function handleToggleChange() {
        const toggleAnimation = document.getElementById('toggleAnimation');
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (toggleAnimation.checked) {
            loadingSpinner.style.display = 'block';
            try {
                await preloadImages(imageUrls);
                console.log("Images preloaded");
                isAnimating = true;
                phaseStartTime = Date.now();
                requestAnimationFrame(updateImageAndBackground);
            } catch (err) {
                console.error("Error preloading images:", err);
            } finally {
                loadingSpinner.style.display = 'none';
            }
        } else {
            isAnimating = false;
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
    }

    function setRandomBg() {
        const randomIndex = getRandomInt(0, bgimages.length - 1);
        const selectedImage = bgimages[randomIndex];
        document.body.style.backgroundImage = `url(${selectedImage})`;
    }

    function setRandomBackground() {
        const index = Math.floor(Math.random() * gradients.length);
        document.body.style.backgroundImage = gradients[index];
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
    }

    setRandomBackground();
    //setRandomBg();
    updateClock();
    setInterval(updateClock, 1000);
    siteTime();
    getLastCommitDate();
});