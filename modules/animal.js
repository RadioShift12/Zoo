// Animal module
// Handles ONLY animal data model + validation

export class Animal {
    #healthStatus;

    constructor({ id, name, species, health = "Healthy", status = "closed", coords, feeding, maintenance }) {        
        if (typeof id !== "number" || typeof name !== "string" || typeof species !== "string") {
            throw new Error("Invalid Animal constructor data");
        }

        this.id = id;
        this.name = name;
        this.species = species;
        this.availability = status;
        this.#healthStatus = health;

        this.coords = coords || { lat: 0, lng: 0 }; 
        this.feedingSchedule = feeding || "Not set";
        this.maintenanceRecords = maintenance || [];
    }

    getDistanceTo(visitorLat, visitorLng) { // I found this part online.
        const R = 6371e3; // Earth radius in meters
        const phi1 = this.coords.lat * Math.PI/180;
        const phi2 = visitorLat * Math.PI/180;
        const deltaPhi = (visitorLat - this.coords.lat) * Math.PI/180;
        const deltaLambda = (visitorLng - this.coords.lng) * Math.PI/180;

        const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distance in meters
    }

    get status() {
        return this.#healthStatus;
    }

    set status(value) {
        if (typeof value !== "string" || !value.trim()) {
            throw new Error("Invalid health status");
        }
        this.#healthStatus = value.trim();
    }

    toggleAvailability = () => {
        this.availability = this.availability === "open" ? "closed" : "open";
    };
}