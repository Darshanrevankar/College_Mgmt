const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    container = body.querySelector('.container'),
    toggle = body.querySelector(".toggle"),
    sub = body.querySelector('.sub-menu-wrap'),
    user = body.querySelector(".user-pic")

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    container.classList.toggle("close");
})


document.addEventListener("click", (event) => {
    if (!sidebar.contains(event.target) && event.target !== toggle) {
        sidebar.classList.add("close");
        container.classList.remove("close");

    }
});

user.addEventListener("click", () => {
    sub.classList.toggle("open");
})

document.addEventListener("click", (event) => {
    if (!sub.contains(event.target) && event.target !== user) {
        sub.classList.add("open");
    }
});

