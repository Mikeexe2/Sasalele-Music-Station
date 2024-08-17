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
const hues = Array.from({ length: 128 }, (_, i) => (i * 137.6) % 360);

const background = document.getElementById('background');
const randomimg = document.getElementById('randomimg');
const toggleAnimation = document.getElementById('toggleAnimation');

let animationTimeout;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setRandomBackgroundColor() {
    const hue = hues[getRandomInt(0, hues.length - 1)];
    const saturation = getRandomInt(0, 100);
    const lightness = getRandomInt(40, 70);
    background.style.backgroundColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`;
}

function setRandomImage() {
    const randomIndex = getRandomInt(1, 296);
    randomimg.src = `images/image${randomIndex}.png`;

    const animations = ['anim-shake', 'anim-blur-left', 'anim-blur-right', 'anim-blur-top', 'anim-blur-bottom'];
    const anim = animations[getRandomInt(0, animations.length - 1)];
    randomimg.className = anim;
}

let debounceTimeout;
function handleToggleChange() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        if (toggleAnimation.checked) {
            animateHues();
        } else {
            clearTimeout(animationTimeout);
        }
    }, 200);
}

function animateHues() {
    function animate() {
        if (toggleAnimation.checked) {
            setRandomBackgroundColor();
            setRandomImage();
            const interval = getRandomInt(500, 1500);
            animationTimeout = setTimeout(animate, interval);
        }
    }

    animate();
}

setRandomBackgroundColor();
setRandomImage();

toggleAnimation.addEventListener('change', handleToggleChange);