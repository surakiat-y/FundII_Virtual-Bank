/**
 * Centralized validation rules for the application.
 */
export const validation = {
    isValidEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone: (phone) => {
        // Basic check for digits only, flexible length
        return /^\d{10,}$/.test(phone.replace(/\D/g, ''));
    },

    isPasswordMatching: (password, confirmPassword) => {
        return password.length > 0 && password === confirmPassword;
    },

    isDateComplete: (date) => {
        // Checks if DD/MM/YYYY is fully filled
        return date && date.length === 10;
    }
};
