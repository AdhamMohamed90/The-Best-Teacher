function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showLoading(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
}

function showEmpty(container, icon, title, desc) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="icon">${icon}</div>
            <h3>${title}</h3>
            <p>${desc}</p>
        </div>`;
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "☆" : "") + "☆".repeat(empty);
}

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const GRADES = [
    { id: 1, label: "Primary 1" },
    { id: 2, label: "Primary 2" },
    { id: 3, label: "Primary 3" },
    { id: 4, label: "Primary 4" },
    { id: 5, label: "Primary 5" },
    { id: 6, label: "Primary 6" },
    { id: 7, label: "Secondary 1" },
    { id: 8, label: "Secondary 2" },
    { id: 9, label: "Secondary 3" },
];

const SUBJECTS = [
    { id: 1, name: "Arabic" },
    { id: 2, name: "English" },
    { id: 3, name: "Math" },
    { id: 4, name: "Science" },
    { id: 5, name: "Social Studies" },
];

function getGradeLabel(stage, num) {
    return `${stage} ${num}`;
}

function getSubjectName(id) {
    const s = SUBJECTS.find(s => s.id === id);
    return s ? s.name : id;
}
