const API_BASE = "http://localhost:3000/api";

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login.html";
            return;
        }

        if (!response.ok) {
            throw { status: response.status, message: data.message || "Something went wrong" };
        }

        return data;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 500, message: "Network error" };
    }
}

const api = {
    get: (endpoint) => apiRequest(endpoint, { method: "GET" }),
    post: (endpoint, body) => apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: (endpoint, body) => apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    delete: (endpoint) => apiRequest(endpoint, { method: "DELETE" }),
};
