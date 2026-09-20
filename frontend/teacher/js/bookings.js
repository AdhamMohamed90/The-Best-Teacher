if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";

    async function loadBookings() {
        var c = document.getElementById("bookingsList");
        showLoading(c);
        try {
            var bookings = await api.get("/teacher/bookings");
            if (bookings.length === 0) {
                showEmpty(c, "\u{1F4C5}", "No Bookings Yet", "Bookings from students will appear here");
                return;
            }
            var rows = "";
            for (var i = 0; i < bookings.length; i++) {
                var b = bookings[i];
                rows += "<tr><td><strong>" + b.student_name + "</strong></td><td>" + b.subject + "</td><td>" + b.stage + " " + b.grade_number + "</td><td>" + (b.city || "-") + "</td><td>" + b.booking_date + "</td><td>" + b.start_time + " - " + b.end_time + "</td><td><span class='badge badge-" + b.mode + "'>" + b.mode + "</span></td></tr>";
            }
            c.innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Student</th><th>Subject</th><th>Grade</th><th>City</th><th>Date</th><th>Time</th><th>Mode</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    loadBookings();
}
