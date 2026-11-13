import { Animal } from "./animal.js";
import { Storage } from "./storage.js";

export const Zoo = (() => {
    const state = {
        animals: [],
        members: [],
        bookings: [],
        visitorCount: 0,
        currentEditingIndex: null
    };

    const addAnimal = (data) => {
        try {
            const saved = Storage.loadFunds()[data.id];
            const animal = new Animal({ ...data, fund: saved });
            state.animals.push(animal);
        } catch (err) {
            console.error("[Zoo:addAnimal]", err.message);
        }
    };

    const getAnimals = () => state.animals;

    const incrementVisitors = () => {
        state.visitorCount++;
        return state.visitorCount;
    };

    const addBooking = (booking) => {
        state.bookings.push(booking);
    };

    const addMember = (member) => {
        state.members.push(member);
        state.visitorCount++;
    };

    const saveFunds = () => {
        const map = {};
        state.animals.forEach(a => { map[a.id] = a.fund.balance; });
        Storage.saveFunds(map);
    };

    return {
        state,
        addAnimal,
        getAnimals,
        incrementVisitors,
        addBooking,
        addMember,
        saveFunds
    };
})();