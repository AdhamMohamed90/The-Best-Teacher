if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";
    var myCities = [];

    async function loadCities() {
        myCities = await api.get("/teacher/cities");
        var sel = document.getElementById("city_id");
        sel.innerHTML = '<option value="">Select city...</option>';
        for (var i = 0; i < myCities.length; i++) {
            sel.innerHTML += '<option value="' + myCities[i].id + '">' + myCities[i].city + '</option>';
        }
    }

    function toggleCity() {
        document.getElementById("cityGroup").style.display = document.getElementById("mode").value === "offline" ? "block" : "none";
    }
    window.toggleCity = toggleCity;

    async function loadGroups() {
        var c = document.getElementById("groupsList");
        showLoading(c);
        try {
            var groups = await api.get("/teacher/groups");
            if (groups.length === 0) {
                showEmpty(c, "\u{1F465}", "No Groups Yet", "Create your first study group");
                return;
            }
            var html = '<div class="grid grid-2">';
            for (var i = 0; i < groups.length; i++) {
                var g = groups[i];
                html += '<div class="card"><h3 style="font-size:16px;margin-bottom:8px;">' + g.subject + ' - ' + g.stage + ' ' + g.grade_number + '</h3><div class="d-flex gap-1 flex-wrap mb-1"><span class="badge badge-' + g.mode + '">' + g.mode + '</span>' + (g.city ? '<span class="badge badge-primary">' + g.city + '</span>' : "") + '</div><p style="font-size:13px;color:var(--gray-500);">' + g.day_of_week + ' | ' + g.start_time + ' - ' + g.end_time + '<br>Capacity: ' + g.capacity + ' | Price: ' + g.price + ' EGP</p><div class="d-flex gap-1 mt-2"><button class="btn btn-sm btn-outline" onclick="viewStudents(' + g.id + ')">Students</button><button class="btn btn-sm btn-danger" onclick="deleteGroup(' + g.id + ')">Delete</button></div></div>';
            }
            c.innerHTML = html + '</div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    function openModal() {
        document.getElementById("modal").classList.remove("hidden");
        document.getElementById("modalError").classList.add("hidden");
        document.getElementById("editId").value = "";
        document.getElementById("modalTitle").textContent = "Create Group";
        document.getElementById("formBtn").textContent = "Create";
        document.getElementById("groupForm").reset();
        document.getElementById("capacity").value = 2;
        toggleCity();
    }
    window.openModal = openModal;

    function closeModal() {
        document.getElementById("modal").classList.add("hidden");
    }
    window.closeModal = closeModal;

    document.getElementById("groupForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var mode = document.getElementById("mode").value;
        var body = {
            subject_id: Number(document.getElementById("subject_id").value),
            grade_id: Number(document.getElementById("grade_id").value),
            mode: mode,
            city_id: mode === "offline" ? Number(document.getElementById("city_id").value) : null,
            day_of_week: document.getElementById("day_of_week").value,
            start_time: document.getElementById("start_time").value,
            end_time: document.getElementById("end_time").value,
            capacity: Number(document.getElementById("capacity").value),
            price: Number(document.getElementById("price").value)
        };
        var errEl = document.getElementById("modalError");
        errEl.classList.add("hidden");
        try {
            await api.post("/teacher/groups", body);
            closeModal();
            loadGroups();
            showToast("Group created!");
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        }
    });

    async function deleteGroup(id) {
        if (!confirm("Delete group?")) return;
        try {
            await api.delete("/teacher/groups/" + id);
            loadGroups();
            showToast("Deleted!");
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    async function viewStudents(groupId) {
        document.getElementById("studentsModal").classList.remove("hidden");
        var list = document.getElementById("studentsList");
        list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        try {
            var students = await api.get("/groups/" + groupId + "/students");
            if (students.length === 0) {
                list.innerHTML = '<p style="text-align:center;color:var(--gray-400);padding:20px;">No students yet</p>';
            } else {
                var rows = "";
                for (var i = 0; i < students.length; i++) {
                    rows += '<tr><td>' + students[i].student_name + '</td><td>' + students[i].student_email + '</td></tr>';
                }
                list.innerHTML = '<table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>' + rows + '</tbody></table>';
            }
        } catch (err) {
            list.innerHTML = '<p class="alert alert-error">' + err.message + '</p>';
        }
    }
    window.viewStudents = viewStudents;
    window.deleteGroup = deleteGroup;

    loadCities().then(function() {
        loadGroups();
        toggleCity();
    });
}
