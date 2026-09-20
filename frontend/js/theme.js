(function() {
    var saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }
})();

function getThemeIcon() {
    var current = document.documentElement.getAttribute("data-theme");
    return current === "dark" ? "\u263E" : "\u2600";
}

function createThemeToggle(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.title = "Toggle dark mode";
    btn.innerHTML = '<span class="toggle-knob">' + getThemeIcon() + '</span>';
    btn.addEventListener("click", function() {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
        btn.querySelector(".toggle-knob").textContent = getThemeIcon();
    });
    container.appendChild(btn);
}
