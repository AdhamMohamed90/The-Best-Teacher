if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";

    async function loadAvailability() {
        var c = document.getElementById("availabilityList");
        showLoading(c);
        try {
            var slots = await api.get("/teachers/" + getUser().id + "/availability");
            if (slots.length === 0) {
                showEmpty(c, "\u{1F550}", "No Availability Set", "Add your available time slots");
                return;
            }
            var rows = "";
            for (var i = 0; i < slots.length; i++) {
                var s = slots[i];
                rows += "<tr><td><strong>" + s.day_of_week + "</strong></td><td>" + s.start_time + "</td><td>" + s.end_time + "</td><td><div class='d-flex gap-1'><button class='btn btn-sm btn-outline' onclick='editSlot(" + s.id + ",\"" + s.day_of_week + "\",\"" + s.start_time + "\",\"" + s.end_time + "\")'>Edit</button><button class='btn btn-sm btn-danger' onclick='deleteSlot(" + s.id + ")'>Delete</button></div></td></tr>";
            }
            c.innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Day</th><th>Start</th><th>End</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    function openModal() {
        document.getElementById("modal").classList.remove("hidden");
        document.getElementById("modalError").classList.add("hidden");
        document.getElementById("editId").value = "";
        document.getElementById("modalTitle").textContent = "Add Availability";
        document.getElementById("formBtn").textContent = "Save";
        document.getElementById("day_of_week").value = "Saturday";
        document.getElementById("start_time").value = "";
        document.getElementById("end_time").value = "";
    }
    window.openModal = openModal;

    function closeModal() {
        document.getElementById("modal").classList.add("hidden");
    }
    window.closeModal = closeModal;

    function editSlot(id, day, start, end) {
        openModal();
        document.getElementById("editId").value = id;
        document.getElementById("modalTitle").textContent = "Edit Availability";
        document.getElementById("formBtn").textContent = "Update";
        document.getElementById("day_of_week").value = day;
        document.getElementById("start_time").value = start;
        document.getElementById("end_time").value = end;
    }

    document.getElementById("availForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var editId = document.getElementById("editId").value;
        var body = {
            day_of_week: document.getElementById("day_of_week").value,
            start_time: document.getElementById("start_time").value,
            end_time: document.getElementById("end_time").value
        };
        var errEl = document.getElementById("modalError");
        errEl.classList.add("hidden");
        try {
            if (editId) {
                await api.put("/teacher/availability/" + editId, body);
            } else {
                await api.post("/teacher/availability", body);
            }
            closeModal();
            loadAvailability();
            showToast(editId ? "Updated!" : "Added!");
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        }
    });

    async function deleteSlot(id) {
        if (!confirm("Delete?")) return;
        try {
            await api.delete("/teacher/availability/" + id);
            loadAvailability();
            showToast("Deleted!");
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.editSlot = editSlot;
    window.deleteSlot = deleteSlot;

    loadAvailability();
}
