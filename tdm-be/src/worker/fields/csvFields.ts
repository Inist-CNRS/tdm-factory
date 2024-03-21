import axios from 'axios';
import { readFile } from 'node:fs/promises';
import logger from '~/lib/logger';

/**
 * Get fields from csv file
 * @param fileName file name (absolute or relative path)
 */
const csvFields = async (fileName: string): Promise<string[]> => {
    try {
        const fileBuffer = await readFile(fileName);
        const response = await axios.post('https://data-wrapper.services.istex.fr/v1/fields/csv', fileBuffer, {
            responseType: 'arraybuffer',
            timeout: 600000,
        });

        logger.info(Buffer.from(response.data, 'binary').toString('utf8'));

        const json = JSON.parse(Buffer.from(response.data, 'binary').toString('utf8')) as Array<{
            value: string;
        }>;

        return json.map((value) => value.value);
    } catch (e) {
        logger.error(e);
        return [];
    }
};

export default csvFields;
