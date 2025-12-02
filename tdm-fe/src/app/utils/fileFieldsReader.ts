/**
 * Utility functions to read fields from files client-side without uploading
 */

/**
 * Detect the most likely CSV delimiter by counting occurrences in the first line
 */
const detectCsvDelimiter = (line: string): string => {
    const delimiters = [',', ';', '\t', '|'];
    let maxCount = 0;
    let detectedDelimiter = ',';

    for (const delimiter of delimiters) {
        const count = line.split(delimiter).length - 1;
        if (count > maxCount) {
            maxCount = count;
            detectedDelimiter = delimiter;
        }
    }

    return detectedDelimiter;
};

/* Read fields from a CSV file */
export const readCsvFields = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split("\n");

                if (lines.length > 0) {
                    // Detect delimiter from first line
                    const delimiter = detectCsvDelimiter(lines[0]);
                    
                    // Get the first line (headers)
                    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
                    resolve(headers.filter((h) => h.length > 0));
                } else {
                    resolve([]);
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

/* Read fields from a JSON file */
export const readJsonFields = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const json = JSON.parse(text);

                if (Array.isArray(json) && json.length > 0) {
                    // Get keys from first object
                    resolve(Object.keys(json[0]));
                } else if (typeof json === "object" && json !== null) {
                    // Single object
                    resolve(Object.keys(json));
                } else {
                    resolve([]);
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

/* Read fields from a JSONL file */
export const readJsonlFields = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split("\n").filter((line) => line.trim().length > 0);

                if (lines.length > 0) {
                    // Parse first line to get fields
                    const firstObject = JSON.parse(lines[0]);
                    resolve(Object.keys(firstObject));
                } else {
                    resolve([]);
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

/**
 * Read fields from a file based on its extension
 */
export const readFileFields = async (file: File): Promise<string[]> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
        return readCsvFields(file);
    } else if (fileName.endsWith(".json")) {
        return readJsonFields(file);
    } else if (fileName.endsWith(".jsonl")) {
        return readJsonlFields(file);
    }

    return [];
};
