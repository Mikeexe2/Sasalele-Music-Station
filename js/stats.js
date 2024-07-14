// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = this.getAttribute('href');
        const offset = 60;
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
        }, 2000);
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
const hues = Array.from({ length: 64 }, () => Math.floor(Math.random() * 360));

const background = document.getElementById('background');
const randomimg = document.getElementById('randomimg');

function setRandomBackgroundColor(hue) {
    const opacity = Math.random() * 0.8 + 0.2; // Random opacity between 0.2 and 0.7
    background.style.backgroundColor = `hsla(${hue}, 80%, 70%, ${opacity})`;
}

function setRandomImage() {
    const randomIndex = Math.floor(Math.random() * 296) + 1;
    randomimg.classList.add('shake');

    randomimg.src = `images/image${randomIndex}.png`;

    setTimeout(() => {
        randomimg.classList.remove('shake');
    }, 140);

}

function getRandomInterval(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomBlendMode() {
    const blendModes = ['darken', 'overlay', 'multiply'];
    return blendModes[Math.floor(Math.random() * blendModes.length)];
}

function animateHues() {
    function animate() {
        const hue = hues[Math.floor(Math.random() * hues.length)];
        setRandomBackgroundColor(hue);
        setRandomImage();

        const blendMode = getRandomBlendMode();
        randomimg.style.mixBlendMode = blendMode;

        const interval = getRandomInterval(0.5, 1.7) * 1000; // Convert seconds to milliseconds
        setTimeout(animate, interval);
    }

    animate(); // Initial call to start animation
}

animateHues();


