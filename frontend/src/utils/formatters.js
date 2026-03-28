/**
 * Formats a raw number string into a DD/MM/YYYY date format.
 * Includes basic validation for days (max 31) and months (max 12).
 */
export const formatDateInput = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 8) digits = digits.slice(0, 8);

    if (digits.length >= 2) {
        let day = parseInt(digits.substring(0, 2));
        if (day > 31) digits = '31' + digits.substring(2);
        if (day === 0 && digits.length === 2) digits = '01';
    }
    if (digits.length >= 4) {
        let month = parseInt(digits.substring(2, 4));
        if (month > 12) digits = digits.substring(0, 2) + '12' + digits.substring(4);
        if (month === 0 && digits.length === 4) digits = digits.substring(0, 2) + '01';
    }

    let formattedValue = '';
    if (digits.length > 0) {
        formattedValue = digits.substring(0, 2);
        if (digits.length > 2) {
            formattedValue += '/' + digits.substring(2, 4);
            if (digits.length > 4) {
                formattedValue += '/' + digits.substring(4, 8);
            }
        }
    }
    return formattedValue;
};

/**
 * Formats a number as a currency string.
 */
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Masks an account number, showing only the last 3 digits.
 * Format: xxx-xxx-789
 */
export const maskAccountNumber = (accNumber) => {
    if (!accNumber) return '';
    const digits = accNumber.replace(/-/g, '');
    if (digits.length < 9) return accNumber;
    return `xxx-xxx-${digits.substring(6)}`;
};
