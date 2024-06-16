// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetElement = document.querySelector(this.getAttribute('href'));
        const offset = 90;

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - offset,
                behavior: 'smooth'
            });
        }
    });
});

// for fun
var Original = document.title, titleTime;
document.addEventListener("visibilitychange",
    function () {
        if (document.hidden) {
            document.title = "Playing music~";
            clearTimeout(titleTime)
        } else {
            document.title = "(/≧▽≦/)Welcome back!";
            titleTime = setTimeout(function () {
                document.title = Original
            },
                2000)
        }
    });

// Date and time
var clockTime = document.getElementById("clockTime");
var clockDay = document.getElementById("clockDay");

function updateClock() {
    var now = new Date();
    var timeString = padZero(now.getHours()) + ":" + padZero(now.getMinutes()) + ":" + padZero(now.getSeconds());
    var dayString = padZero(now.getMonth() + 1) + "/" + padZero(now.getDate()) + " " + getDayAbbreviation(now.getDay());

    clockTime.textContent = timeString;
    clockDay.textContent = dayString;
}

function padZero(num) {
    return (num < 10 ? "0" : "") + num;
}

function getDayAbbreviation(day) {
    var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[day];
}

updateClock();
setInterval(updateClock, 1000);