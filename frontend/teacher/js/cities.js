if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";

    async function loadCities() {
        var c = document.getElementById("citiesList");
        showLoading(c);
        try {
            var cities = await api.get("/teacher/cities");
            if (cities.length === 0) {
                showEmpty(c, "\u{1F4CD}", "No Cities Yet", "Add cities where you teach");
                return;
            }
            var html = '<div class="grid grid-3">';
            for (var i = 0; i < cities.length; i++) {
                html += '<div class="card" style="display:flex;align-items:center;justify-content:space-between;"><strong>' + cities[i].city + '</strong><button class="btn btn-sm btn-danger" onclick="deleteCity(' + cities[i].id + ')">Delete</button></div>';
            }
            c.innerHTML = html + '</div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    function openModal() {
        document.getElementById("modal").classList.remove("hidden");
        document.getElementById("modalError").classList.add("hidden");
    }
    window.openModal = openModal;

    function closeModal() {
        document.getElementById("modal").classList.add("hidden");
    }
    window.closeModal = closeModal;

    document.getElementById("cityForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var errEl = document.getElementById("modalError");
        errEl.classList.add("hidden");
        try {
            await api.post("/teacher/cities", { city_id: Number(document.getElementById("city_id").value) });
            closeModal();
            loadCities();
            showToast("City added!");
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        }
    });

    async function deleteCity(id) {
        if (!confirm("Remove this city?")) return;
        try {
            await api.delete("/teacher/cities/" + id);
            loadCities();
            showToast("Removed!");
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.deleteCity = deleteCity;

    loadCities();
}
