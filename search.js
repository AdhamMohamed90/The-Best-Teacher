if (!requireAuth() || !requireRole("student")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Student";

    async function searchTeachers() {
        var c = document.getElementById("results");
        var params = new URLSearchParams();
        var subject = document.getElementById("filterSubject").value;
        var grade = document.getElementById("filterGrade").value;
        var mode = document.getElementById("filterMode").value;
        if (subject) params.set("subject_id", subject);
        if (grade) params.set("grade_id", grade);
        if (mode) params.set("teachingmode", mode);
        showLoading(c);
        try {
            var teachers = await api.get("/teachers/search?" + params.toString());
            if (teachers.length === 0) {
                showEmpty(c, "\u{1F50D}", "No Tutors Found", "Try different filters");
                return;
            }
            var html = '<div class="grid grid-2">';
            for (var i = 0; i < teachers.length; i++) {
                var t = teachers[i];
                html += '<div class="teacher-card"><h3>' + t.name + '</h3><div class="meta"><span class="badge badge-' + t.teachingmode + '">' + t.teachingmode + '</span></div><p class="bio">' + (t.bio || "No bio") + '</p><button type="button" class="btn btn-sm btn-primary" onclick="goToTeacher(' + t.id + ')">View Profile</button></div>';
            }
            c.innerHTML = html + '</div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.searchTeachers = searchTeachers;
    window.goToTeacher = function(id) { window.location.href = "teacher.html?id=" + id; };

    searchTeachers();
}
