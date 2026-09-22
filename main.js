import { Zoo } from "./modules/zoo.js";
import { API } from "./modules/api.js";
import { Security } from "./modules/security.js";
import { UI } from "./modules/ui.js";
import { Admin } from "./modules/admin.js";
import './components/AnimalCard.js';
let coor = { latitude: 0, longitude: 0 };
const REGEX_PATTERNS = {
    // Allows 2-30 letters/spaces, starting with a capital letter
    name: /^[A-Z][a-zA-Z\s]{1,29}$/,
    // Allows 2-30 letters/spaces, starting with a capital letter
    species: /^[A-Z][a-zA-Z\s]{1,29}$/,
    // Health keywords
    health: /^(Healthy|Good|Excellent|Fair|Sick|Critical)$/i
};

document.addEventListener("DOMContentLoaded", async () => {
    Security.generateCSRFToken();
    Security.createAdminToken();

    const container = document.getElementById("zoo-container");
    const feedback = document.getElementById("form-feedback");
    const addAnimalForm = document.getElementById("add-animal-form");
    const globalFeedback = document.getElementById("add-animal-feedback");



    if (addAnimalForm) {
        // I didnt want to type it multiple times.
        const validateField = (inputEl, feedbackEl, regex, errorMsg) => {
            const value = inputEl.value.trim();
            if (!regex.test(value)) {
                inputEl.classList.add("invalid");
                inputEl.classList.remove("valid");
                feedbackEl.textContent = errorMsg;
                feedbackEl.className = "feedback-msg error";
                return false;
            } else {
                inputEl.classList.add("valid");
                inputEl.classList.remove("invalid");
                feedbackEl.textContent = "✓ Looks good!";
                feedbackEl.className = "feedback-msg success";
                return true;
            }
        };

        const nameInput = document.getElementById("animal-name");
        const nameFeedback = document.getElementById("name-feedback");
        const speciesInput = document.getElementById("animal-species");
        const speciesFeedback = document.getElementById("species-feedback");
        const healthInput = document.getElementById("animal-health");
        const healthFeedback = document.getElementById("health-feedback");

        // Input listeners for real time validation
        nameInput?.addEventListener("input", () => {
            validateField(nameInput, nameFeedback, REGEX_PATTERNS.name, "Name must start with a capital letter and contain only letters (min 2 chars).");
        });

        speciesInput?.addEventListener("input", () => {
            validateField(speciesInput, speciesFeedback, REGEX_PATTERNS.species, "Species must start with a capital letter and contain only letters (min 2 chars).");
        });

        healthInput?.addEventListener("input", () => {
            validateField(healthInput, healthFeedback, REGEX_PATTERNS.health, "Please enter a valid status (Healthy, Good, Excellent, Fair, Sick).");
        });

        addAnimalForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // One more validation, just in case.
            const isNameValid = validateField(nameInput, nameFeedback, REGEX_PATTERNS.name, "Name must start with a capital letter and contain only letters (min 2 chars).");
            const isSpeciesValid = validateField(speciesInput, speciesFeedback, REGEX_PATTERNS.species, "Species must start with a capital letter and contain only letters (min 2 chars).");
            const isHealthValid = validateField(healthInput, healthFeedback, REGEX_PATTERNS.health, "Please enter a valid status (Healthy, Good, Excellent, Fair, Sick).");

            if (isNameValid && isSpeciesValid && isHealthValid) {
                const newAnimalData = {
                    id: Date.now(),
                    name: nameInput.value.trim(),
                    species: speciesInput.value.trim(),
                    health: healthInput.value.trim(),
                    status: "closed"
                };

                Zoo.addAnimal(newAnimalData);
                UI.renderAnimals(container, coor.longitude, coor.latitude);
                globalFeedback.style.color = "#2E7D32";
                globalFeedback.textContent = `Success, ${newAnimalData.name} the ${newAnimalData.species} was added to the zoo.`;

                // Reset form
                addAnimalForm.reset();
                [nameInput, speciesInput, healthInput].forEach(el => el.classList.remove("valid", "invalid"));
                [nameFeedback, speciesFeedback, healthFeedback].forEach(el => el.textContent = "");
            } else {
                // Failure
                globalFeedback.style.color = "#d32f2f";
                globalFeedback.textContent = "Please fix form errors before submitting.";
            }
        });
    }



        // Part 3: Geolocation Implementation
    const initGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    coor = { latitude, longitude };
                    console.log(`Visitor located at: ${latitude}, ${longitude}`);
                    UI.renderAnimals(container,longitude,latitude);
                },
                () => {
                    Security.log("GEO_ERROR", "User denied location access");
                }
            );
        }
    };

    // PART 3: Push Notification Request Capability
    const initNotifications = async () => {
        if ('Notification' in window) {
            let permission = Notification.permission;
            if (permission === 'default') {
                permission = await Notification.requestPermission();
            }
            if (permission === 'granted') {
                console.log("Push notifications permitted.");
            } else {
                Security.log("NOTIFICATION_DENIED", "User blocked notifications.");
            }
        }
    };

    initNotifications();

    initGeolocation();

    // 2. Load Animal Data via AJAX
    const apiAnimals = await API.fetchAnimals();
    apiAnimals.forEach(Zoo.addAnimal);
    UI.renderAnimals(container,coor.longitude,coor.latitude);

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