import { API } from "./api.js";
import { Zoo } from "./zoo.js";
import { Security } from "./security.js";

export const Admin = {
    /**
     * Initializes the admin dashboard component.
     * @param {HTMLElement} container - The container element to render the dashboard in.
     */
    initDashboard: async (container) => {
        container.textContent = "";

        const status = await API.fetchZooStatus();
        const visitorStats = await API.fetchVisitors();

        const panel = document.createElement("div");
        panel.className = "admin-dashboard-inner";

        const title = document.createElement("h2");
        title.textContent = "Admin Dashboard";

        // Logic: Combine JSON stats with local state updates
        const total = (visitorStats?.todayTotal || 0) + Zoo.state.visitorCount;

        const visitorText = document.createElement("p");
        visitorText.textContent = `Real-time Total Visitors: ${total}`;

        const bookingText = document.createElement("p");
        bookingText.textContent = `Total Bookings: ${Zoo.state.bookings.length}`;

        const statusText = document.createElement("pre");
        statusText.textContent = `Zoo Status: ${status?.open ? "Open" : "Closed"} | Weather: ${status?.weather}`;

        panel.append(title, visitorText, bookingText, statusText);
        container.appendChild(panel);
    },

    saveHealthUpdate: (value) => {
        const index = Zoo.state.currentEditingIndex;

        if (index === null) return;

        try {
            Zoo.getAnimals()[index].status = Security.sanitize(value);
        } catch (err) {
            Security.log("VALIDATION", err.message);
        }
    }
};