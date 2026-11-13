import { Security } from "./security.js";
import { Zoo } from "./zoo.js";

export const UI = {

    
    renderAnimals: (container, currentLng, currentLat) => {
        if (!container) return;

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const animalSelect = document.getElementById('animal-select');
        function populateAnimalOptions() {
            if (!animalSelect) return;
            animalSelect.textContent = "";

            
            const openAnimals = Zoo.getAnimals().filter(a => a.availability === 'open');
            
            openAnimals.forEach(animal => {
                const opt = document.createElement('option');
                opt.value = animal.name;
                opt.textContent = `${animal.name} (${animal.species})`;
                animalSelect.appendChild(opt);
            });
        }
        Zoo.getAnimals().forEach((animal, index) => {
            const card = document.createElement("div");
            card.className = `animal-card ${animal.availability}`;

            const title = document.createElement("h3");
            title.textContent = Security.sanitize(animal.name);

            const species = document.createElement("p");
            species.textContent = `Species: ${animal.species}`;

            const health = document.createElement("p");
            health.textContent = `Health: ${animal.status}`;

            const coords = document.createElement("p");
            coords.textContent = `Loc: ${animal.coords.lat}, ${animal.coords.lng}`;

            const schedule = document.createElement("p");
            schedule.className = "schedule-info";
            schedule.textContent = `Feeding: ${animal.feedingSchedule}`;


            const dist = animal.getDistanceTo(currentLat, currentLng);
            const distText = document.createElement("p");
            distText.textContent = `Distance: ${Math.round(dist)}m away`;
            
            const btnToggle = document.createElement("button");
            btnToggle.textContent = "Toggle";
            btnToggle.onclick = () => {
                animal.toggleAvailability();
                UI.renderAnimals(container);
            };

            const btnHealth = document.createElement("button");
            btnHealth.textContent = "Edit Health";

            btnHealth.onclick = () => {
                if (!Security.isAdmin()) {
                    Security.log("AUTH", "Admin required");
                    return;
                }

                UI.openHealthModal(index);
            };
            populateAnimalOptions();


            const fundText = document.createElement("p");
            fundText.className = "fund-balance";
            fundText.textContent = `Sponsorship Fund: $${animal.fund.balance.toFixed(2)}${animal.fund.isOpen ? "" : " (closed)"}`;

            const btnDonate = document.createElement("button");
            btnDonate.textContent = "Donate";
            btnDonate.onclick = () => UI.openFundModal(index, "donate");

            const btnSpend = document.createElement("button");
            btnSpend.textContent = "Spend";
            btnSpend.onclick = () => UI.openFundModal(index, "spend");


            card.append(title, species, health, schedule, coords, distText, fundText, btnToggle, btnHealth, btnDonate);
            if (Security.isAdmin()) card.append(btnSpend);
            container.appendChild(card);
        });
    },

    openHealthModal: (index) => {
        const modal = document.getElementById("health-modal");
        const input = document.getElementById("health-input");

        Zoo.state.currentEditingIndex = index;
        input.value = Zoo.getAnimals()[index].status;

        modal.classList.remove("hidden");
    },

        openFundModal: (index, mode) => {
        const animal = Zoo.getAnimals()[index];
        Zoo.state.fundAction = { index, mode };

        document.getElementById("fund-modal-title").textContent =
            mode === "donate" ? `Donate to ${animal.name}` : `Spend from ${animal.name}'s fund`;
        document.getElementById("fund-amount").value = "";
        document.getElementById("fund-note").value = "";
        document.getElementById("fund-error").textContent = "";
        document.getElementById("fund-modal").classList.remove("hidden");
    }
};