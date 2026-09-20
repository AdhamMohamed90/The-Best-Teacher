if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";
    var SUBJECTS_MAP = { 1: "Arabic", 2: "English", 3: "Math", 4: "Science", 5: "Social Studies" };
    var GRADES_MAP = { 1: { s: "primary", n: 1 }, 2: { s: "primary", n: 2 }, 3: { s: "primary", n: 3 }, 4: { s: "primary", n: 4 }, 5: { s: "primary", n: 5 }, 6: { s: "primary", n: 6 }, 7: { s: "secondry", n: 1 }, 8: { s: "secondry", n: 2 }, 9: { s: "secondry", n: 3 } };

    async function loadSubjects() {
        var c = document.getElementById("subjectsList");
        showLoading(c);
        try {
            var subjects = await api.get("/teacher/subjects");
            if (subjects.length === 0) {
                showEmpty(c, "\u{1F4DA}", "No Subjects Yet", "Add subjects you teach");
                return;
            }
            var rows = "";
            for (var i = 0; i < subjects.length; i++) {
                var s = subjects[i];
                rows += "<tr><td><strong>" + s.subject + "</strong></td><td>" + s.stage + "</td><td>" + s.grade_number + "</td><td><div class='d-flex gap-1'><button class='btn btn-sm btn-outline' onclick='editSubject(" + s.id + ",\"" + s.subject + "\",\"" + s.stage + "\"," + s.grade_number + ")'>Edit</button><button class='btn btn-sm btn-danger' onclick='deleteSubject(" + s.id + ")'>Delete</button></div></td></tr>";
            }
            c.innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Subject</th><th>Stage</th><th>Grade</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    function openModal() {
        document.getElementById("modal").classList.remove("hidden");
        document.getElementById("modalError").classList.add("hidden");
        document.getElementById("editId").value = "";
        document.getElementById("modalTitle").textContent = "Add Subject";
        document.getElementById("formBtn").textContent = "Save";
    }
    window.openModal = openModal;

    function closeModal() {
        document.getElementById("modal").classList.add("hidden");
    }
    window.closeModal = closeModal;

    function editSubject(id, subjectName, stage, gradeNum) {
        openModal();
        document.getElementById("editId").value = id;
        document.getElementById("modalTitle").textContent = "Edit Subject";
        document.getElementById("formBtn").textContent = "Update";
        var subjId = Object.keys(SUBJECTS_MAP).find(function(k) { return SUBJECTS_MAP[k] === subjectName; });
        if (subjId) document.getElementById("subject_id").value = subjId;
        var gradeId = Object.keys(GRADES_MAP).find(function(k) { return GRADES_MAP[k].s === stage && GRADES_MAP[k].n === gradeNum; });
        if (gradeId) document.getElementById("grade_id").value = gradeId;
    }

    document.getElementById("subjectForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var editId = document.getElementById("editId").value;
        var body = {
            subject_id: Number(document.getElementById("subject_id").value),
            grade_id: Number(document.getElementById("grade_id").value)
        };
        var errEl = document.getElementById("modalError");
        errEl.classList.add("hidden");
        try {
            if (editId) {
                await api.put("/teacher/subjects/" + editId, body);
            } else {
                await api.post("/teacher/subjects", body);
            }
            closeModal();
            loadSubjects();
            showToast(editId ? "Updated!" : "Added!");
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        }
    });

    async function deleteSubject(id) {
        if (!confirm("Delete this subject?")) return;
        try {
            await api.delete("/teacher/subjects/" + id);
            loadSubjects();
            showToast("Deleted!");
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.editSubject = editSubject;
    window.deleteSubject = deleteSubject;

    loadSubjects();
}
