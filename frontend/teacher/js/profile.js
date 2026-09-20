if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";

    async function loadProfile() {
        try {
            var profile = await api.get("/profile");
            document.getElementById("teachingmode").value = profile.teachingmode;
            document.getElementById("bio").value = profile.bio || "";
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    document.getElementById("profileForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var errorEl = document.getElementById("error");
        var successEl = document.getElementById("success");
        errorEl.classList.add("hidden");
        successEl.classList.add("hidden");
        document.getElementById("saveBtn").disabled = true;
        try {
            await api.put("/profile", {
                teachingmode: document.getElementById("teachingmode").value,
                bio: document.getElementById("bio").value.trim() || null
            });
            successEl.textContent = "Profile updated!";
            successEl.classList.remove("hidden");
            showToast("Profile updated!");
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove("hidden");
        }
        document.getElementById("saveBtn").disabled = false;
    });

    async function deleteProfile() {
        if (!confirm("Delete your account?")) return;
        try {
            await api.delete("/profile");
            logout();
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.deleteProfile = deleteProfile;

    loadProfile();
}
