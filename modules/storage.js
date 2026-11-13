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
    },
        saveFunds: (fundMap) => {
        try {
            localStorage.setItem("zoo_funds", JSON.stringify(fundMap));
        } catch (err) {
            Security.log("STORAGE_ERROR", err.message);
        }
    },

    loadFunds: () => {
        try {
            return JSON.parse(localStorage.getItem("zoo_funds")) || {};
        } catch (err) {
            Security.log("STORAGE_ERROR", err.message);
            return {};
        }
    }
};