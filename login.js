if (redirectIfLoggedIn()) {
    document.body.innerHTML = "";
}

document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var errorEl = document.getElementById("error");
    var btn = document.getElementById("submitBtn");

    errorEl.classList.add("hidden");
    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
        var data = await api.post("/auth/login", { email: email, password: password });
        var payload = JSON.parse(atob(data.token.split(".")[1]));
        login(data.token, { id: payload.user_id, name: payload.name, role: payload.role });

        if (payload.role === "teacher") {
            window.location.href = "/teacher/dashboard.html";
        } else {
            window.location.href = "/student/dashboard.html";
        }
    } catch (err) {
        errorEl.textContent = err.message || "Login failed";
        errorEl.classList.remove("hidden");
        btn.disabled = false;
        btn.textContent = "Login";
    }
});
