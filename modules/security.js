export const Security = {
    allowedOrigins: [
        "http://localhost",
        "https://localhost",
        "http://127.0.0.1:5500",
        "https://zoo-9qur.onrender.com"
    ],
    // Made this a little easier to read.
    sanitize: (str) => {
        if (typeof str !== "string") return str;

        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return str.replace(/[&<>"']/g, (m) => map[m]);
    },

    generateCSRFToken: () => {
        const token = crypto.getRandomValues(new Uint32Array(2))
            .join("-");
        sessionStorage.setItem("csrf", token);
        return token;
    },

    verifyCSRF: (token) => {
        return sessionStorage.getItem("csrf") === token;
    },

    createAdminToken: () => {
        const payload = {
            role: "admin",
            exp: Date.now() + 3600000
        };

        const token = btoa(JSON.stringify(payload));
        localStorage.setItem("admin", token);
        return token;
    },

    isAdmin: () => {
        const token = localStorage.getItem("admin");
        if (!token) return false;

        try {
            const data = JSON.parse(atob(token));
            return data.role === "admin" && data.exp > Date.now();
        } catch {
            return false;
        }
    },

    log: (type, message) => {
        window.securityLogs ??= [];
        window.securityLogs.push({ type, message, time: Date.now() });
        console.warn(`[SECURITY:${type}]`, message);
    }
};