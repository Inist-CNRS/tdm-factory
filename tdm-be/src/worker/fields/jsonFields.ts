import logger from '~/lib/logger';

import axios from 'axios';

import { readFile } from 'node:fs/promises';

/**
 * Get fields from json file
 * @param fileName file name (absolute or relative path)
 */
const jsonFields = async (fileName: string): Promise<string[]> => {
    try {
        const fileBuffer = await readFile(fileName);
        const response = await axios.post('https://data-wrapper.services.istex.fr/v1/fields/json', fileBuffer, {
            responseType: 'arraybuffer',
            timeout: 600000,
        });

        const json = JSON.parse(Buffer.from(response.data, 'binary').toString('utf8')) as Array<{
            value: string;
        }>;

        return json.map((value) => value.value);
    } catch (e) {
        logger.error(`json fields - ${e}`);
        return [];
    }
};

export default jsonFields;
