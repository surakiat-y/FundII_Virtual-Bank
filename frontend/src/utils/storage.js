/**
 * Simple wrapper for localStorage with JSON parsing/stringifying.
 */
export const storage = {
    get: (key, initial) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : initial;
        } catch (error) {
            console.error(`Error reading from localStorage [${key}]:`, error);
            return initial;
        }
    },

    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage [${key}]:`, error);
            return false;
        }
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};
