if (redirectIfLoggedIn()) {
    document.body.innerHTML = "";
}

function setRole(role, btn) {
    document.getElementById("role").value = role;
    document.querySelectorAll(".role-toggle button").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    document.getElementById("teacherFields").classList.toggle("hidden", role === "student");
}
window.setRole = setRole;

document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var role = document.getElementById("role").value;
    var errorEl = document.getElementById("error");
    var btn = document.getElementById("submitBtn");

    var body = { name: name, email: email, password: password, role: role };

    if (role === "teacher") {
        body.teachingmode = document.getElementById("teachingmode").value;
        body.bio = document.getElementById("bio").value.trim() || null;
    }

    errorEl.classList.add("hidden");
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
        await api.post("/auth/register", body);
        window.location.href = "/login.html";
    } catch (err) {
        errorEl.textContent = err.message || "Registration failed";
        errorEl.classList.remove("hidden");
        btn.disabled = false;
        btn.textContent = "Create Account";
    }
});
