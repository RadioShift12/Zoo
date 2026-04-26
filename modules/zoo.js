import { Animal } from "./animal.js";

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
            const animal = new Animal(data);
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

    return {
        state,
        addAnimal,
        getAnimals,
        incrementVisitors,
        addBooking,
        addMember
    };
})();