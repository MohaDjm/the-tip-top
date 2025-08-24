/**
 * Generates a unique 10-character alphanumeric code for lottery participation
 * Format: XXXXXXXXXX (10 characters, uppercase letters and numbers)
 */
export declare function generateCode(): string;
/**
 * Generates multiple unique codes
 * @param count Number of codes to generate
 * @returns Array of unique codes
 */
export declare function generateMultipleCodes(count: number): string[];
/**
 * Validates if a code has the correct format
 * @param code Code to validate
 * @returns True if valid, false otherwise
 */
export declare function validateCodeFormat(code: string): boolean;
/**
 * Generates a batch of codes with guaranteed uniqueness check
 * This function ensures no duplicates within the batch
 * @param count Number of codes to generate
 * @param maxAttempts Maximum attempts to generate unique codes
 * @returns Array of unique codes
 */
export declare function generateUniqueCodeBatch(count: number, maxAttempts?: number): string[];
//# sourceMappingURL=codeGenerator.d.ts.map