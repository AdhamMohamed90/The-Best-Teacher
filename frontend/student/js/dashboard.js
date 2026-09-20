if (!requireAuth() || !requireRole("student")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Student";

    async function loadDashboard() {
        try {
            var bookings = await api.get("/student/bookings");
            var groups = await api.get("/student/groups");

            var bContainer = document.getElementById("upcomingBookings");
            var upcoming = bookings.slice(0, 3);
            if (upcoming.length === 0) {
                bContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No bookings yet</p>';
            } else {
                var html = "";
                for (var i = 0; i < upcoming.length; i++) {
                    var b = upcoming[i];
                    html += '<div style="padding:12px 0;border-bottom:1px solid var(--border);"><strong>' + b.teacher_name + '</strong> - ' + b.subject + '<br><span style="font-size:13px;color:var(--text-secondary);">' + b.booking_date + ' | ' + b.start_time + ' - ' + b.end_time + ' | <span class="badge badge-' + b.mode + '">' + b.mode + '</span></span></div>';
                }
                bContainer.innerHTML = html;
            }

            var gContainer = document.getElementById("myGroups");
            if (groups.length === 0) {
                gContainer.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No groups joined</p>';
            } else {
                var ghtml = "";
                for (var j = 0; j < Math.min(groups.length, 3); j++) {
                    ghtml += '<div style="padding:12px 0;border-bottom:1px solid var(--border);"><strong>Group #' + groups[j].group_id + '</strong></div>';
                }
                gContainer.innerHTML = ghtml;
            }
        } catch (err) {
            console.error(err);
        }
    }

    loadDashboard();
}
