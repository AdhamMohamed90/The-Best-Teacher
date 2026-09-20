if (!requireAuth() || !requireRole("student")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Student";

    async function loadBookings() {
        var c = document.getElementById("bookingsList");
        showLoading(c);
        try {
            var bookings = await api.get("/student/bookings");
            if (bookings.length === 0) {
                showEmpty(c, "\u{1F4C5}", "No Bookings Yet", "Search for tutors and book sessions");
                return;
            }
            var rows = "";
            var now = new Date();
            for (var i = 0; i < bookings.length; i++) {
                var b = bookings[i];
                var endDT = new Date(b.booking_date + "T" + b.end_time);
                var isCompleted = endDT < now;
                var actionHtml = "";
                if (isCompleted) {
                    actionHtml = "<button class='btn btn-sm btn-primary' onclick='goToReview(" + b.teacher_id + ")'>Review</button>";
                } else {
                    actionHtml = "<button class='btn btn-sm btn-danger' onclick='deleteBooking(" + b.id + ")'>Cancel</button>";
                }
                rows += "<tr><td><strong>" + b.teacher_name + "</strong></td><td>" + b.subject + "</td><td>" + b.stage + " " + b.grade_number + "</td><td>" + (b.city || "-") + "</td><td>" + b.booking_date + "</td><td>" + b.start_time + " - " + b.end_time + "</td><td><span class='badge badge-" + b.mode + "'>" + b.mode + "</span></td><td>" + actionHtml + "</td></tr>";
            }
            c.innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Teacher</th><th>Subject</th><th>Grade</th><th>City</th><th>Date</th><th>Time</th><th>Mode</th><th>Actions</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    function goToReview(teacherId) {
        window.location.href = "teacher.html?id=" + teacherId;
    }
    window.goToReview = goToReview;

    async function deleteBooking(id) {
        if (!confirm("Cancel this booking?")) return;
        try {
            await api.delete("/bookings/" + id);
            loadBookings();
            showToast("Cancelled!");
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.deleteBooking = deleteBooking;

    loadBookings();
}
