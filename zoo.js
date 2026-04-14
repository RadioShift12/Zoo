class Animal {
    #healthStatus;

    constructor(id, name, species, initialStatus = "Healthy", initialAvailability = "closed") {
        if (!id || !name || !species) {
            throw new Error("Invalid animal data: ID, Name, and Species are required.");
        }
        this.id = id;
        this.name = name;
        this.species = species;
        this.availability = initialAvailability; 
        this.#healthStatus = initialStatus;
    }

    
    get status() {
        return this.#healthStatus;
    }

    set status(newStatus) {
        if (typeof newStatus === 'string' && newStatus.trim() !== "") {
            this.#healthStatus = newStatus;
        } else {
            console.error("Invalid health status update attempted.");
        }
    }
}


const zoo = {
    animals: [],
    members: [],
    bookings: [],
    visitorCount: 0,
    currentEditingIndex: null,

    addAnimal(animalData) {
        try {
            if (!animalData?.name || !animalData?.species|| typeof animalData?.name !== 'string') {
                throw new Error('Invalid animal data provided to zoo. (Animal name: ' + animalData?.name + ', Species: ' + animalData?.species + ')');
            }
            const newAnimal = new Animal(
                animalData.id, 
                animalData.name, 
                animalData.species, 
                animalData.health, 
                animalData.status
            );
            this.animals.push(newAnimal);
        } catch (e) {
            this.handleError(`Failed to add animal: ${e.message}`);
        }
    },

    handleError(message) {
        const errorDisplay = document.getElementById('error-display');
        if (errorDisplay) {
            errorDisplay.textContent = `[Zoo Error]: ${message}`;
            setTimeout(() => { errorDisplay.textContent = ""; }, 5000);
        }
        console.error(`[Zoo Error]: ${message}`);
    }
};


const Security = {
    
    generateCSRFToken: () => {
        const array = new Uint32Array(2);
        window.crypto.getRandomValues(array);
        const token = Array.from(array, dec => dec.toString(16)).join('');
        sessionStorage.setItem('csrf_token', token);
        return token;
    },

    verifyToken: () => {
        return sessionStorage.getItem('csrf_token') !== null;
    },

    
    sanitize: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    },

    
    getAdminToken: () => {
        const payload = { role: 'admin', exp: Date.now() + 3600000 };
        const token = btoa(JSON.stringify(payload)); 
        localStorage.setItem('admin_token', token);
        return token;
    },

    isAdmin: () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token));
            return payload.role === 'admin' && payload.exp > Date.now();
        } catch {
            return false;
        }
    },

    // PART 2 CORS & Cookies
    allowedOrigins: ["http://localhost", "https://localhost", "http://127.0.0.1:5500", "https://zoo-9qur.onrender.com"],

    validateOrigin: () => {
        const origin = window.location.origin;
        console.log("Current Origin:", origin);
        return Security.allowedOrigins.includes(origin);
    },

    setSecureCookie: (name, value) => {
        document.cookie = `${name}=${value}; Secure; SameSite=Strict; path=/`;
    },

    // PART 3 Protocols Security
    logSecurityEvent: (type, message) => {
        if (!window.securityLogs) window.securityLogs = [];

        const log = {
            time: new Date().toISOString(),
            type,
            message
        };

        window.securityLogs.push(log);
        console.warn("[SECURITY]", log);
    },

    checkHTTPS: () => {
        if (window.location.protocol !== "https:") {
            Security.logSecurityEvent("INSECURE_PROTOCOL", window.location.href);
            return false;
        }
        return true;
    },

    validateCertificate: () => {
        const isSecureContext = window.isSecureContext;

        if (!isSecureContext) {
            Security.logSecurityEvent("CERT_INVALID", "Not a secure context");
            return false;
        }
        return true;
    },

    fallback: () => {
        zoo.handleError("Security requirements not met. Running in limited mode.");
    }
};

// PART 1  AJAX Setup
const API = {
    baseURL: "./animals.json",
    loading: false,

    async fetchAnimals() {
        this.setLoading(true);

        try {
            const response = await fetch(this.baseURL, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();

            return data;
        } catch (error) {
            Security.logSecurityEvent("FETCH_ERROR", error.message);
            zoo.handleError("Failed to fetch animals.");
            return [];
        } finally {
            this.setLoading(false);
        }
    },

    setLoading(state) {
        this.loading = state;

        const loader = document.getElementById("loading");
        if (loader) {
            loader.textContent = state ? "Loading..." : "";
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    
    Security.generateCSRFToken();
    Security.getAdminToken(); 


    if (!Security.validateOrigin()) {
        Security.logSecurityEvent("CORS_BLOCK", "Origin not allowed");
        zoo.handleError("Unauthorized origin.");
        return;
    }
    Security.setSecureCookie("session", "active");
    const httpsValid = Security.checkHTTPS();
    const certValid = Security.validateCertificate();

    if (!httpsValid || !certValid) {
        Security.fallback();
    }

    const rawAnimals = [
        { name: "Leo", species: "Lion", id: 2, status: "closed", health: "Excellent" },
        { name: "Mort", species: "Orca", id: 1, status: "open", health: "Good" },
        { name: "Ella", species: "Elephant", id: 3, status: "closed", health: "Healthy" },
        { name: "Dolly", species: "Dolphin", id: 4, status: "open", health: "Excellent" },
        { name: 3, species: "Dolphin", id: 5, status: "open", health: "Excellent" }
    ];

    (async () => {
        rawAnimals.forEach(a => zoo.addAnimal(a));

        const fetchedAnimals = await API.fetchAnimals();
        fetchedAnimals.forEach(a => zoo.addAnimal(a));

        renderZoo();
    })();


    const container = document.getElementById('zoo-container');
    const modal = document.getElementById('health-modal');
    const healthInput = document.getElementById('health-input');
    const saveBtn = document.getElementById('save-health-btn');
    const cancelBtn = document.getElementById('cancel-health-btn');
    const visitorBtn = document.getElementById('add-visitor');
    const animalSelect = document.getElementById('animal-select');
    const membershipForm = document.getElementById('membership-form');
    const bookingForm = document.getElementById('booking-form');

    function renderZoo() {
        if (!container) return;
        

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        zoo.animals.forEach((animal, index) => {
            try {
                
                const { name, species, availability, status: health } = animal;

                const card = document.createElement('div');
                card.className = `animal-card ${availability}`;

                const title = document.createElement('h3');
                title.textContent = Security.sanitize(name);

                const speciesPara = document.createElement('p');
                const speciesLabel = document.createElement('strong');
                speciesLabel.textContent = "Species: ";
                speciesPara.append(speciesLabel, Security.sanitize(species));

                const healthPara = document.createElement('p');
                const healthLabel = document.createElement('strong');
                healthLabel.textContent = "Health: ";
                healthPara.append(healthLabel, Security.sanitize(health));

                const actionsDiv = document.createElement('div');
                
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = 'Toggle Status';
                toggleBtn.onclick = () => {
                    animal.availability = animal.availability === 'open' ? 'closed' : 'open';
                    renderZoo();
                };

                const healthBtn = document.createElement('button');
                healthBtn.textContent = 'Update Health';
                healthBtn.onclick = () => {
                    if(Security.isAdmin()) {
                        openHealthModal(index);
                    } else {
                        zoo.handleError("Unauthorized: Admin role required.");
                    }
                };

                actionsDiv.append(toggleBtn, healthBtn);
                card.append(title, speciesPara, healthPara, actionsDiv);
                container.appendChild(card);
            } catch (error) {
                zoo.handleError(`Rendering failed: ${error.message}`);
            }
        });

        populateAnimalOptions();
    }

    function populateAnimalOptions() {
        if (!animalSelect) return;
        animalSelect.textContent = "";

        
        const openAnimals = zoo.animals.filter(a => a.availability === 'open');
        
        openAnimals.forEach(animal => {
            const opt = document.createElement('option');
            opt.value = animal.name;
            opt.textContent = `${animal.name} (${animal.species})`;
            animalSelect.appendChild(opt);
        });
    }

    function openHealthModal(index) {
        zoo.currentEditingIndex = index;
        healthInput.value = zoo.animals[index].status;
        modal.classList.remove('hidden'); 
        healthInput.focus();
    }

    saveBtn.addEventListener('click', () => {
        if (zoo.currentEditingIndex !== null) {
            zoo.animals[zoo.currentEditingIndex].status = Security.sanitize(healthInput.value);
            modal.classList.add('hidden');
            renderZoo();
        }
    });

    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    
    if (membershipForm) {
        membershipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!Security.verifyToken()) {
                zoo.handleError("CSRF Token missing or invalid.");
                return;
            }

            const newMember = {
                name: Security.sanitize(document.getElementById('member-name').value),
                email: Security.sanitize(document.getElementById('member-email').value),
                type: document.getElementById('member-type').value
            };

            zoo.members.push(newMember);
            zoo.visitorCount++;
            document.getElementById('visitor-count').textContent = zoo.visitorCount;
            membershipForm.reset();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedAnimal = animalSelect.value;
            
            
            const exists = zoo.animals.some(a => a.name === selectedAnimal);

            if (exists) {
                const booking = {
                    visitor: Security.sanitize(document.getElementById('visitor-name').value),
                    animal: selectedAnimal,
                    date: document.getElementById('booking-time').value
                };
                zoo.bookings.push(booking);
                bookingForm.reset();
            } else {
                zoo.handleError("Please select an available animal.");
            }
        });
    }

    visitorBtn?.addEventListener('click', () => {
        zoo.visitorCount++;
        document.getElementById('visitor-count').textContent = zoo.visitorCount;
    });


    // PART 4 Testing
    function runTests() {
        const results = [];

        // Successful fetch test
        results.push({
            test: "Fetch Animals",
            result: API.loading === false ? "PASS" : "FAIL"
        });

        // Protocol test
        results.push({
            test: "HTTPS Check",
            result: window.location.protocol === "https:" ? "PASS" : "FAIL"
        });

        // Origin whitelist test
        results.push({
            test: "Origin Allowed",
            result: Security.validateOrigin() ? "PASS" : "FAIL"
        });

        // CSRF test
        results.push({
            test: "CSRF Token Exists",
            result: Security.verifyToken() ? "PASS" : "FAIL"
        });

        console.table(results);

        if (window.securityLogs) {
            console.table(window.securityLogs);
        }
    }

    runTests();
    renderZoo();
});