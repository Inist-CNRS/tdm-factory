import { parse } from 'csv-string';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline/promises';

/**
 * Get fields from csv file
 * @param fileName file name (absolute or relative path)
 */
const csvFields = async (fileName: string): Promise<string[] | undefined> => {
    // Create a file read stream
    const stream = createReadStream(fileName);

    // Create a line reader
    const lineReader = createInterface({
        input: stream,
    });

    // Get the first line
    let firstLine: string | undefined;
    /* eslint-disable no-unreachable-loop */
    // noinspection LoopStatementThatDoesntLoopJS
    for await (const line of lineReader) {
        firstLine = line;
        break;
    }
    /* eslint-enable no-unreachable-loop */

    // Close all streams
    lineReader.close();
    stream.close();

    // Return if we don't found any line
    if (!firstLine) {
        return undefined;
    }

    // Parse the first line with csv-string
    const fields = parse(firstLine);

    // Return if we don't have any data
    if (fields.length < 1) {
        return undefined;
    }

    // Return the fields
    return fields[0];
};

export default csvFields;
