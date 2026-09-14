window.onerror = function(msg, url, line) {
    var c = document.getElementById("teacherContent");
    if (c) c.innerHTML = '<div class="alert alert-error">JS Error: ' + msg + ' (line ' + line + ')</div>';
    return false;
};

if (!requireAuth() || !requireRole("student")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Student";
    var params = new URLSearchParams(window.location.search);
    var teacherId = params.get("id");
    if (!teacherId) { window.location.href = "search.html"; }
    var teacherData = null;
    var reviewableBookings = [];
    var loadedReviews = [];
    var TG = [
        { id: 1, s: "primary", n: 1 }, { id: 2, s: "primary", n: 2 }, { id: 3, s: "primary", n: 3 },
        { id: 4, s: "primary", n: 4 }, { id: 5, s: "primary", n: 5 }, { id: 6, s: "primary", n: 6 },
        { id: 7, s: "secondry", n: 1 }, { id: 8, s: "secondry", n: 2 }, { id: 9, s: "secondry", n: 3 }
    ];

    async function loadTeacher() {
        var c = document.getElementById("teacherContent");
        c.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        try {
            var teacher = await api.get("/teachers/" + teacherId);
            var reviews = [];
            var rating = {};
            try { reviews = await api.get("/teachers/" + teacherId + "/reviews"); } catch(e) {}
            try { rating = await api.get("/teachers/" + teacherId + "/rating"); } catch(e) {}
            if (!reviews) reviews = [];
            if (!rating) rating = {};
            teacherData = teacher;
            loadedReviews = reviews;

            var html = '<div class="page-header"><h1>' + teacher.name + '</h1><button class="btn btn-primary" onclick="openBookingModal()">Book a Session</button></div>';
            html += '<div class="grid grid-3 mb-3">';
            html += '<div class="stat-card"><div class="stat-label">Mode</div><div class="stat-value" style="font-size:18px;"><span class="badge badge-' + teacher.teachingmode + '">' + teacher.teachingmode + '</span></div></div>';
            html += '<div class="stat-card"><div class="stat-label">Rating</div><div class="stat-value" style="font-size:18px;"><span class="rating"><span class="stars">' + renderStars(rating.average_rating || 0) + '</span> ' + (rating.average_rating || 0) + ' (' + (rating.total_reviews || 0) + ')</span></div></div>';
            html += '<div class="stat-card"><div class="stat-label">Email</div><div class="stat-value" style="font-size:14px;">' + teacher.email + '</div></div>';
            html += '</div>';

            if (teacher.bio) {
                html += '<div class="card mb-3"><h3 style="margin-bottom:8px;">About</h3><p style="color:var(--gray-600);">' + teacher.bio + '</p></div>';
            }

            var subjects = teacher.subjects || [];
            var cities = teacher.cities || [];

            html += '<div class="grid grid-2">';
            html += '<div class="card"><div class="card-header"><h2>Subjects</h2></div>';
            if (subjects.length === 0) html += '<p style="color:var(--text-secondary);">No subjects</p>';
            else {
                for (var i = 0; i < subjects.length; i++) {
                    var s = subjects[i];
                    html += '<div style="padding:8px 0;border-bottom:1px solid var(--border);"><strong>' + s.subject + '</strong> - ' + s.stage + ' ' + s.grade_number + '</div>';
                }
            }
            html += '</div>';
            html += '<div class="card"><div class="card-header"><h2>Cities</h2></div>';
            if (cities.length === 0) html += '<p style="color:var(--text-secondary);">No cities</p>';
            else {
                for (var j = 0; j < cities.length; j++) {
                    html += '<div style="padding:8px 0;border-bottom:1px solid var(--border);">' + cities[j].city + '</div>';
                }
            }
            html += '</div></div>';

            var teacherGroups = [];
            try { teacherGroups = await api.get("/groups/browse"); } catch(e) {}
            var myMemberships = [];
            try { myMemberships = await api.get("/student/groups"); } catch(e) {}
            var myGroupIds = myMemberships.map(function(m) { return m.group_id; });
            var myTeacherGroups = teacherGroups.filter(function(g) { return g.teacher_id === Number(teacherId); });

            if (myTeacherGroups.length > 0) {
                html += '<div class="card mt-3"><div class="card-header"><h2>Groups</h2></div>';
                for (var gi = 0; gi < myTeacherGroups.length; gi++) {
                    var gg = myTeacherGroups[gi];
                    var spotsLeft = gg.capacity - gg.enrolled;
                    var isJoined = myGroupIds.indexOf(gg.id) !== -1;
                    var isFull = spotsLeft <= 0;
                    var gBtn = "";
                    if (isJoined) {
                        gBtn = '<button class="btn btn-sm btn-danger" onclick="leaveGroup(' + gg.id + ')">Leave</button>';
                    } else if (isFull) {
                        gBtn = '<button class="btn btn-sm" disabled>Full</button>';
                    } else {
                        gBtn = '<button class="btn btn-sm btn-primary" onclick="joinGroup(' + gg.id + ')">Join (' + spotsLeft + ' spots)</button>';
                    }
                    html += '<div style="padding:12px 0;border-bottom:1px solid var(--border);"><div style="display:flex;justify-content:space-between;align-items:center;"><div><strong>' + gg.subject + ' - ' + gg.stage + ' ' + gg.grade_number + '</strong><br><span style="font-size:13px;color:var(--text-secondary);">' + gg.day_of_week + ' | ' + gg.start_time + ' - ' + gg.end_time + ' | ' + gg.price + ' EGP | ' + gg.enrolled + '/' + gg.capacity + ' enrolled</span></div>' + gBtn + '</div></div>';
                }
                html += '</div>';
            }

            html += '<div class="card mt-3"><div class="card-header"><h2>Reviews</h2></div>';
            if (reviews.length === 0) html += '<p style="color:var(--text-secondary);">No reviews yet</p>';
            else {
                for (var k = 0; k < reviews.length; k++) {
                    var r = reviews[k];
                    html += '<div style="padding:12px 0;border-bottom:1px solid var(--border);"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><strong>' + r.student_name + '</strong><span class="rating"><span class="stars">' + renderStars(r.rating) + '</span> ' + r.rating + '</span></div>' + (r.comment ? '<p style="font-size:14px;color:var(--text-secondary);">' + r.comment + '</p>' : "") + '</div>';
                }
            }
            html += '</div>';

            c.innerHTML = html;

            var subjectSelect = document.getElementById("book_subject");
            subjectSelect.innerHTML = "";
            for (var m = 0; m < subjects.length; m++) {
                var sub = subjects[m];
                var gid = TG.find(function(g) { return g.s === sub.stage && g.n === sub.grade_number; });
                var opt = document.createElement("option");
                opt.value = sub.subject_id + "|" + (gid ? gid.id : 1);
                opt.textContent = sub.subject + " - " + sub.stage + " " + sub.grade_number;
                subjectSelect.appendChild(opt);
            }

            var citySelect = document.getElementById("book_city");
            citySelect.innerHTML = "";
            for (var n = 0; n < cities.length; n++) {
                var copt = document.createElement("option");
                copt.value = cities[n].city_id;
                copt.textContent = cities[n].city;
                citySelect.appendChild(copt);
            }

            loadReviewableBookings();
        } catch (err) {
            c.innerHTML = '<div class="alert alert-error">' + err.message + '</div>';
        }
    }

    async function loadReviewableBookings() {
        reviewableBookings = [];
        try {
            var bookings = await api.get("/student/bookings");
            var reviewedIds = [];
            for (var i = 0; i < loadedReviews.length; i++) {
                reviewedIds.push(loadedReviews[i].booking_id);
            }
            var now = new Date();
            for (var j = 0; j < bookings.length; j++) {
                var b = bookings[j];
                if (b.teacher_id !== Number(teacherId)) continue;
                var endDT = new Date(b.booking_date + "T" + b.end_time);
                if (endDT > now) continue;
                if (reviewedIds.indexOf(b.id) !== -1) continue;
                reviewableBookings.push(b);
            }
            if (reviewableBookings.length > 0) {
                var header = document.querySelector(".page-header");
                var btn = document.createElement("button");
                btn.className = "btn btn-secondary";
                btn.textContent = "Write a Review";
                btn.onclick = function() { openReviewModal(); };
                header.appendChild(btn);
            }
        } catch(e) {}
    }

    function openBookingModal() {
        document.getElementById("bookingModal").classList.remove("hidden");
        document.getElementById("bookingError").classList.add("hidden");
        if (teacherData) {
            if (teacherData.teachingmode === "online") document.getElementById("book_mode").value = "online";
            else if (teacherData.teachingmode === "offline") document.getElementById("book_mode").value = "offline";
        }
        toggleBookingCity();
    }
    window.openBookingModal = openBookingModal;

    function closeBookingModal() {
        document.getElementById("bookingModal").classList.add("hidden");
    }
    window.closeBookingModal = closeBookingModal;

    function toggleBookingCity() {
        document.getElementById("bookCityGroup").style.display = document.getElementById("book_mode").value === "offline" ? "block" : "none";
    }
    window.toggleBookingCity = toggleBookingCity;

    document.getElementById("bookingForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var errEl = document.getElementById("bookingError");
        errEl.classList.add("hidden");
        var parts = document.getElementById("book_subject").value.split("|");
        var mode = document.getElementById("book_mode").value;
        var body = {
            teacher_id: Number(teacherId),
            grade_id: Number(parts[1]),
            subject_id: Number(parts[0]),
            booking_date: document.getElementById("book_date").value,
            start_time: document.getElementById("book_start").value,
            end_time: document.getElementById("book_end").value,
            mode: mode
        };
        if (mode === "offline") body.city_id = Number(document.getElementById("book_city").value);
        try {
            await api.post("/bookings", body);
            closeBookingModal();
            showToast("Booking created!");
            loadTeacher();
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        }
    });

    function openReviewModal(bookingId) {
        var bid = bookingId || (reviewableBookings.length > 0 ? reviewableBookings[0].id : null);
        if (!bid) { showToast("No completed bookings to review", "error"); return; }
        document.getElementById("review_booking_id").value = bid;
        document.getElementById("review_rating").value = "0";
        document.getElementById("review_comment").value = "";
        document.getElementById("reviewError").classList.add("hidden");
        updateStarDisplay(0);
        var select = document.getElementById("review_booking_select");
        if (select) {
            select.innerHTML = "";
            for (var i = 0; i < reviewableBookings.length; i++) {
                var b = reviewableBookings[i];
                var opt = document.createElement("option");
                opt.value = b.id;
                opt.textContent = b.subject + " - " + b.booking_date + " " + b.start_time;
                if (b.id === bid) opt.selected = true;
                select.appendChild(opt);
            }
        }
        document.getElementById("reviewModal").classList.remove("hidden");
    }
    window.openReviewModal = openReviewModal;

    function closeReviewModal() {
        document.getElementById("reviewModal").classList.add("hidden");
    }
    window.closeReviewModal = closeReviewModal;

    var starPicker = document.getElementById("starPicker");
    if (starPicker) {
        var stars = starPicker.querySelectorAll("span");
        stars.forEach(function(star) {
            star.addEventListener("mouseenter", function() {
                var val = parseInt(star.getAttribute("data-star"));
                highlightStars(val);
            });
            star.addEventListener("mouseleave", function() {
                var val = parseInt(document.getElementById("review_rating").value);
                highlightStars(val);
            });
            star.addEventListener("click", function() {
                var val = parseInt(star.getAttribute("data-star"));
                document.getElementById("review_rating").value = val;
                highlightStars(val);
            });
        });
    }

    function highlightStars(val) {
        var stars = document.querySelectorAll("#starPicker span");
        stars.forEach(function(s) {
            var v = parseInt(s.getAttribute("data-star"));
            s.style.color = v <= val ? "#f59e0b" : "var(--gray-300)";
        });
    }

    function updateStarDisplay(val) {
        highlightStars(val);
    }

    document.getElementById("reviewForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        var errEl = document.getElementById("reviewError");
        errEl.classList.add("hidden");
        var rating = parseInt(document.getElementById("review_rating").value);
        if (rating < 1 || rating > 5) {
            errEl.textContent = "Please select a rating";
            errEl.classList.remove("hidden");
            return;
        }
        var body = {
            booking_id: Number(document.getElementById("review_booking_id").value),
            rating: rating,
            comment: document.getElementById("review_comment").value || ""
        };
        try {
            await api.post("/reviews", body);
            closeReviewModal();
            showToast("Review submitted!");
            loadTeacher();
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        }
    });

    async function joinGroup(groupId) {
        try {
            await api.post("/groups/" + groupId + "/join");
            showToast("Joined group!");
            loadTeacher();
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.joinGroup = joinGroup;

    async function leaveGroup(groupId) {
        if (!confirm("Leave this group?")) return;
        try {
            await api.delete("/groups/" + groupId + "/leave");
            showToast("Left group!");
            loadTeacher();
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.leaveGroup = leaveGroup;

    loadTeacher();
}
