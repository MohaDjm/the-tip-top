"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = generateCode;
exports.generateMultipleCodes = generateMultipleCodes;
exports.validateCodeFormat = validateCodeFormat;
exports.generateUniqueCodeBatch = generateUniqueCodeBatch;
/**
 * Generates a unique 10-character alphanumeric code for lottery participation
 * Format: XXXXXXXXXX (10 characters, uppercase letters and numbers)
 */
function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
/**
 * Generates multiple unique codes
 * @param count Number of codes to generate
 * @returns Array of unique codes
 */
function generateMultipleCodes(count) {
    const codes = new Set();
    while (codes.size < count) {
        codes.add(generateCode());
    }
    return Array.from(codes);
}
/**
 * Validates if a code has the correct format
 * @param code Code to validate
 * @returns True if valid, false otherwise
 */
function validateCodeFormat(code) {
    const codeRegex = /^[A-Z0-9]{10}$/;
    return codeRegex.test(code);
}
/**
 * Generates a batch of codes with guaranteed uniqueness check
 * This function ensures no duplicates within the batch
 * @param count Number of codes to generate
 * @param maxAttempts Maximum attempts to generate unique codes
 * @returns Array of unique codes
 */
function generateUniqueCodeBatch(count, maxAttempts = 1000) {
    const codes = new Set();
    let attempts = 0;
    while (codes.size < count && attempts < maxAttempts) {
        const newCode = generateCode();
        codes.add(newCode);
        attempts++;
    }
    if (codes.size < count) {
        throw new Error(`Could not generate ${count} unique codes after ${maxAttempts} attempts`);
    }
    return Array.from(codes);
}
//# sourceMappingURL=codeGenerator.js.map