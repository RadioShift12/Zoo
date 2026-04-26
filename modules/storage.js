import { Security } from "./security.js";

export const Storage = {
    saveZooData: (data) => {
        try {
            // Validation before storage
            if (!Array.isArray(data)) throw new Error("Invalid data format");
            
            const serializedData = JSON.stringify(data);
            localStorage.setItem("zoo_animals", serializedData);
        } catch (err) {
            Security.log("STORAGE_ERROR", err.message);
        }
    },

    loadZooData: () => {
        try {
            const data = localStorage.getItem("zoo_animals");
            return data ? JSON.parse(data) : null;
        } catch (e) {
            Security.log("STORAGE_ERROR", e);
            return null;
        }
    }
};