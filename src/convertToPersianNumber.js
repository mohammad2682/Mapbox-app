export const convertToPersianNumber = (number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const stringNumber = String(number);
    let result = '';

    for (let i = 0; i < stringNumber.length; i++) {
        const char = stringNumber.charAt(i);
        const digit = parseInt(char);

        if (isNaN(digit)) {
            result += char; // Append non-digit characters as they are
        } else {
            result += persianDigits[digit]; // Convert digit character to Persian number
        }
    }

    return result;
}
