/*
    I got lucky, and like the portfolio, this already has most of the error handling, so not much changed.
*/

document.addEventListener('DOMContentLoaded', () => {
    // Part 1: Error-Safe Data Structure
    let animals = [
        { name: "Leo", species: "Lion", id: 2, status: "closed", health: "Excellent" },
        { name: "Mort", species: "Orca", id: 1, status: "open", health: "Good" },
        { name: "Ella", species: "Elephant", id: 3, status: "closed", health: "Healthy" },
        { name: "Dolly", species: "Dolphin", id: 4, status: "open", health: "Excellent" },
        { name: 3, species: "Dolphin", id: 4, status: "open", health: "Excellent" } // Invalid name to test error handling
    ];

    let members = [];
    let bookings = [];
    let visitorCount = 0;
    let currentEditingIndex = null;

    
    const container = document.getElementById('zoo-container');
    const modal = document.getElementById('health-modal');
    const healthInput = document.getElementById('health-input');
    const saveBtn = document.getElementById('save-health-btn');
    const cancelBtn = document.getElementById('cancel-health-btn');
    const visitorBtn = document.getElementById('add-visitor');
    const errorBtn = document.getElementById('fake-error');
    const animalSelect = document.getElementById('animal-select');

    
    const membershipForm = document.getElementById('membership-form');
    const bookingForm = document.getElementById('booking-form');
    const errorDisplay = document.getElementById('error-display');
    

   /*
      Part 2: Error-safe DOM updater
      Validates element existence before manipulation to prevent script crashes.
    */
    function showError(message) {
        if (errorDisplay) {
            errorDisplay.textContent = message;
            // Clear error after 5 seconds
            setTimeout(() => { errorDisplay.textContent = ""; }, 5000);
        }
        console.error(`[Zoo Error]: ${message}`);
    }

    function updateDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            // Part 1: Log errors to console for debugging
            console.error(`Error: Element #${elementId} not found.`);
        }
    }

    /*
      Part 1: Validation Logic
      Ensures all required data exists before being used.
    */
    function validateAnimalData(animal) {
        if (!animal.name || animal.name.trim() === "") throw new Error("Animal Name is required.");
        if (!animal.species) throw new Error("Species must be defined.");
        if (!animal.id || typeof animal.id !== 'number') throw new Error("Invalid or missing ID.");
        return true;
    }
    function renderZoo() {
        // Part 2: Handle missing elements gracefully
        if (!container) {
            console.error("Critical Error: #zoo-container not found in DOM.");
            return;
        }
        
        
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Part 2: Use console.table for debugging zoo data
        console.log("Current Zoo Inventory:");
        console.table(animals);
        
        animals.forEach((animal, index) => {
            try {
                // Validate data before rendering
                validateAnimalData(animal);
            const card = document.createElement('div');
            card.className = `animal-card ${animal.status}`;

            const title = document.createElement('h3');
            title.textContent = animal.name;

            const speciesPara = document.createElement('p');
            speciesPara.textContent = `Species: ${animal.species}`;

            const healthPara = document.createElement('p');
            healthPara.textContent = `Health: ${animal.health}`;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'card-actions';

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = 'Toggle Status';
            toggleBtn.onclick = () => {
                animal.status = animal.status === 'open' ? 'closed' : 'open';
                renderZoo();
            };

            
            const healthBtn = document.createElement('button');
            healthBtn.textContent = 'Update Health';
            healthBtn.onclick = () => openHealthModal(index);

            actionsDiv.append(toggleBtn, healthBtn);
            card.append(title, speciesPara, healthPara, actionsDiv);
            container.appendChild(card);
            } catch (error) {
                showError(`Failed to render animal: ${error.message}`);
            }
        });

        
        populateAnimalOptions();
    }

   
    function populateAnimalOptions() {
        if (!animalSelect) return;
        while (animalSelect.firstChild) {
            animalSelect.removeChild(animalSelect.firstChild);
        }

        animals.forEach(animal => {
            if(animal.status === 'open') {
                const opt = document.createElement('option');
                opt.value = animal.name;
                opt.textContent = `${animal.name} (${animal.species})`;
                animalSelect.appendChild(opt);
            }
        });
    }

    function openHealthModal(index) {
        currentEditingIndex = index;
        healthInput.value = animals[index].health;
        modal.classList.remove('hidden'); 
        healthInput.focus();
    }

    saveBtn.addEventListener('click', () => {
        if (currentEditingIndex !== null && healthInput.value.trim()) {
            animals[currentEditingIndex].health = healthInput.value.trim();
            modal.classList.add('hidden');
            renderZoo();
        }
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    
    if (membershipForm) {
        membershipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newMember = {
                name: document.getElementById('member-name').value,
                email: document.getElementById('member-email').value,
                type: document.getElementById('member-type').value,
                startDate: document.getElementById('member-start').value,
                emergency: document.getElementById('member-emergency').value
            };

            members.push(newMember);
            
            
            visitorCount++;
            updateDisplay('visitor-count', visitorCount);
            
            console.log("Membership Registered", newMember);
            membershipForm.reset();
        });
    }

    

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const booking = {
                visitor: document.getElementById('visitor-name').value,
                animal: animalSelect.value,
                time: document.getElementById('booking-time').value,
                size: parseInt(document.getElementById('group-size').value, 10)
            };

            
            const animalExists = animals.some(a => a.name === booking.animal);
            
            if (animalExists && booking.size > 0 && booking.visitor.trim() !== "") {
                bookings.push(booking);
                console.log("Encounter Booked", booking);
                bookingForm.reset();
            } else {
                console.error("Booking Error: Validation failed. Check animal selection or group size.");
            }
        });
    }

    

    if (visitorBtn) {
        visitorBtn.addEventListener('click', () => {
            visitorCount++;
            updateDisplay('visitor-count', visitorCount);
        });
    }
    if(errorBtn) {
        errorBtn.addEventListener('click', () => {
            showError("This is a simulated error for testing purposes.");
        });
    }

    renderZoo();
});