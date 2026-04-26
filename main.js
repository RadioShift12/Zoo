import { Zoo } from "./modules/zoo.js";
import { API } from "./modules/api.js";
import { Security } from "./modules/security.js";
import { UI } from "./modules/ui.js";
import { Admin } from "./modules/admin.js";

document.addEventListener("DOMContentLoaded", async () => {
    Security.generateCSRFToken();
    Security.createAdminToken();

    const container = document.getElementById("zoo-container");
    const feedback = document.getElementById("form-feedback");

        // Part 3: Geolocation Implementation
    const initGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log(`Visitor located at: ${latitude}, ${longitude}`);
                    // In a real app, you'd compare this to your "Animal Exhibit" coords
                    UI.renderAnimals(container,longitude,latitude);
                },
                () => {
                    Security.log("GEO_ERROR", "User denied location access");
                }
            );
        }
    };

    // Call it inside your DOMContentLoaded listener
    initGeolocation();

    // 2. Load Animal Data via AJAX
    const apiAnimals = await API.fetchAnimals();
    apiAnimals.forEach(Zoo.addAnimal);
    UI.renderAnimals(container,longitude,latitude);

    // 3. Initialize Dashboard
    const adminPanel = document.getElementById("admin-panel");
    if (adminPanel) {
        Admin.initDashboard(adminPanel);
    }

    // 4. Handle Membership Form
    const memberForm = document.getElementById("membership-form");
    memberForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const memberData = {
            name: document.getElementById("member-name").value,
            email: document.getElementById("member-email").value,
            type: document.getElementById("member-type").value
        };

        Zoo.addMember(memberData);
        
        feedback.textContent = `Success: ${memberData.name} registered!`;
        memberForm.reset();
        
        // Update dashboard to reflect new visitor count
        if (adminPanel) Admin.initDashboard(adminPanel);
    });

    // 5. Handle Booking Form
    const bookingForm = document.getElementById("booking-form");
    bookingForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const bookingData = {
            visitor: document.getElementById("visitor-name").value,
            animal: document.getElementById("animal-select").value,
            time: document.getElementById("booking-time").value
        };

        Zoo.addBooking(bookingData);
        feedback.textContent = `Encounter booked for ${bookingData.visitor}!`;
        bookingForm.reset();
    });

    // 6. Health Modal Logic
    const saveBtn = document.getElementById("save-health-btn");
    const cancelBtn = document.getElementById("cancel-health-btn");
    const input = document.getElementById("health-input");

    saveBtn?.addEventListener("click", () => {
        Admin.saveHealthUpdate(input.value);
        document.getElementById("health-modal").classList.add("hidden");
        UI.renderAnimals(container);
    });

    cancelBtn?.addEventListener("click", () => {
        document.getElementById("health-modal").classList.add("hidden");
    });
});