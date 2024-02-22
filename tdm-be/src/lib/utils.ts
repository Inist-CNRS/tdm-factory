/**
 * Helper function use to compare two value and set a default value if both are null or undefined
 * @param first First value to compare
 * @param second Second value to compare
 */
export const defaultNull = <T>(first: T | null | undefined, second: T | null | undefined): T | null => {
    if (first !== null && first !== undefined) {
        return first;
    }

    if (second !== null && second !== undefined) {
        return second;
    }

    return null;
};
