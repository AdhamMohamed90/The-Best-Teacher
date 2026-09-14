if (!requireAuth() || !requireRole("teacher")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Teacher";

    async function loadDashboard() {
        try {
            var subjects = await api.get("/teacher/subjects");
            var cities = await api.get("/teacher/cities");
            var groups = await api.get("/teacher/groups");
            var bookings = await api.get("/teacher/bookings");
            var reviews = [];
            var rating = {};
            try { reviews = await api.get("/teachers/" + user.id + "/reviews"); } catch(e) {}
            try { rating = await api.get("/teachers/" + user.id + "/rating"); } catch(e) {}
            if (!reviews) reviews = [];
            if (!rating) rating = {};

            document.getElementById("statSubjects").textContent = subjects.length;
            document.getElementById("statCities").textContent = cities.length;
            document.getElementById("statGroups").textContent = groups.length;
            document.getElementById("statBookings").textContent = bookings.length;
            document.getElementById("statRating").textContent = (rating.average_rating || 0) + " ⭐";
            document.getElementById("statReviews").textContent = rating.total_reviews || 0;

            var recent = bookings.slice(0, 5);
            var container = document.getElementById("recentBookings");

            if (recent.length === 0) {
                showEmpty(container, "\u{1F4C5}", "No Bookings Yet", "Bookings from students will appear here");
            } else {
                var rows = "";
                for (var i = 0; i < recent.length; i++) {
                    var b = recent[i];
                    rows += "<tr><td>" + b.student_name + "</td><td>" + b.subject + "</td><td>" + b.booking_date + "</td><td>" + b.start_time + " - " + b.end_time + "</td><td><span class='badge badge-" + b.mode + "'>" + b.mode + "</span></td></tr>";
                }
                container.innerHTML = '<div class="table-wrapper"><table><thead><tr><th>Student</th><th>Subject</th><th>Date</th><th>Time</th><th>Mode</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
            }

            var reviewsContainer = document.getElementById("recentReviews");
            var recentReviews = reviews.slice(0, 5);

            if (recentReviews.length === 0) {
                showEmpty(reviewsContainer, "\u2B50", "No Reviews Yet", "Reviews from students will appear here");
            } else {
                var html = "";
                for (var j = 0; j < recentReviews.length; j++) {
                    var r = recentReviews[j];
                    var stars = "";
                    for (var s = 0; s < 5; s++) {
                        stars += s < r.rating ? "\u2605" : "\u2606";
                    }
                    html += '<div style="padding:12px 0;border-bottom:1px solid var(--border);"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong>' + r.student_name + '</strong><span class="rating"><span class="stars">' + stars + '</span> ' + r.rating + '/5</span></div>' + (r.comment ? '<p style="font-size:14px;color:var(--text-secondary);">' + r.comment + '</p>' : '<p style="font-size:13px;color:var(--text-secondary);font-style:italic;">No comment</p>') + '</div>';
                }
                reviewsContainer.innerHTML = html;
            }
        } catch (err) {
            console.error(err);
        }
    }

    loadDashboard();
}
