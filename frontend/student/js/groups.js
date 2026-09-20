window.onerror = function(msg, url, line) {
    var c = document.getElementById("browseGroups");
    if (c) c.innerHTML = '<div class="alert alert-error">JS Error: ' + msg + ' (line ' + line + ')</div>';
    return false;
};

if (!requireAuth() || !requireRole("student")) {
    document.body.innerHTML = "";
} else {
    var user = getUser();
    document.getElementById("userName").textContent = (user && user.name) ? user.name : "Student";

    async function loadAll() {
        var c = document.getElementById("browseGroups");
        if (!c) return;
        showLoading(c);
        try {
            var groups = await api.get("/groups/browse");
            var myMemberships = [];
            try { myMemberships = await api.get("/student/groups"); } catch(e) {}
            var myIds = myMemberships.map(function(m) { return m.group_id; });

            if (groups.length === 0) {
                showEmpty(c, "\u{1F465}", "No Groups Available", "Teachers haven't created any groups yet");
                return;
            }
            var html = '<div class="grid grid-2">';
            for (var i = 0; i < groups.length; i++) {
                var g = groups[i];
                var spots = g.capacity - g.enrolled;
                var joined = myIds.indexOf(g.id) !== -1;
                var full = spots <= 0;
                var btnHtml = "";
                if (joined) {
                    btnHtml = '<button class="btn btn-sm btn-danger" onclick="leaveGroup(' + g.id + ')">Leave</button>';
                } else if (full) {
                    btnHtml = '<button class="btn btn-sm" disabled>Full</button>';
                } else {
                    btnHtml = '<button class="btn btn-sm btn-primary" onclick="joinGroup(' + g.id + ')">Join (' + spots + ' spots)</button>';
                }
                html += '<div class="card">';
                html += '<h3 style="font-size:16px;margin-bottom:4px;">' + (g.subject || '') + ' - ' + (g.stage || '') + ' ' + (g.grade_number || '') + '</h3>';
                html += '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">Teacher: ' + (g.teacher_name || '') + '</p>';
                html += '<div class="d-flex gap-1 flex-wrap mb-1">';
                html += '<span class="badge badge-' + (g.mode || '') + '">' + (g.mode || '') + '</span>';
                if (g.city) html += '<span class="badge badge-primary">' + g.city + '</span>';
                html += '<span class="badge">' + (g.price || 0) + ' EGP</span>';
                html += '</div>';
                html += '<p style="font-size:13px;color:var(--text-secondary);">';
                html += (g.day_of_week || '') + ' | ' + (g.start_time || '') + ' - ' + (g.end_time || '');
                html += '<br>' + (g.enrolled || 0) + '/' + (g.capacity || 0) + ' enrolled</p>';
                html += '<div class="d-flex gap-1 mt-2">' + btnHtml + '</div>';
                html += '</div>';
            }
            c.innerHTML = html + '</div>';
        } catch (err) {
            c.innerHTML = '<div class="alert alert-error">' + err.message + '</div>';
        }
    }

    async function joinGroup(groupId) {
        try {
            await api.post("/groups/" + groupId + "/join");
            showToast("Joined group!");
            loadAll();
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
            loadAll();
        } catch (err) {
            showToast(err.message, "error");
        }
    }
    window.leaveGroup = leaveGroup;

    loadAll();
}
