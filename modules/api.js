import { Security } from "./security.js";
import { Storage } from "./storage.js";

export const API = {
    baseURL: "./animals.json",
    loading: false,
    lastCall: 0,
    rateLimitMs: 2000,

    fetchAnimals: async () => {
        // Rate Limiting Logic
        const now = Date.now();
        if (now - API.lastCall < API.rateLimitMs) {
            Security.log("RATE_LIMIT", "Too many requests. Please wait.");
            return Storage.loadZooData() || []; // Fallback to storage
        }
        API.lastCall = now;

        try {
            API.setLoading(true);
            const res = await fetch(API.baseURL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            // Save to LocalStorage after successful fetch
            Storage.saveZooData(data);
            return data;
        } catch (err) {
            Security.log("FETCH_ERROR", err.message);
            return Storage.loadZooData() || []; // Offline functionality
        } finally {
            API.setLoading(false);
        }
    },

    fetchZooStatus: async () => {
        try {
            const res = await fetch("./zoo-status.json");
            if (!res.ok) throw new Error("Status failed");
            return await res.json();
        } catch (err) {
            Security.log("STATUS_ERROR", err.message);
            return null;
        }
    },

    fetchVisitors: async () => {
        try {
            const res = await fetch("./visitors.json");
            if (!res.ok) throw new Error("Visitor fetch failed");
            return await res.json();
        } catch (err) {
            Security.log("VISITOR_ERROR", err.message);
            return [];
        }
    },

    setLoading: (state) => {
        API.loading = state;

        const el = document.getElementById("loading");
        if (el) {
            el.textContent = state ? "Loading..." : "";
        }
    }
};