function getUser() {
    var user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

function getToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    return !!getToken();
}

function login(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "/login.html";
        return false;
    }
    return true;
}

function requireRole(role) {
    var user = getUser();
    if (!user || user.role !== role) {
        window.location.href = "/index.html";
        return false;
    }
    return true;
}

function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        var user = getUser();
        if (user && user.role === "teacher") {
            window.location.href = "/teacher/dashboard.html";
        } else {
            window.location.href = "/student/dashboard.html";
        }
        return true;
    }
    return false;
}
