import logger from '~/lib/logger';

import axios from 'axios';
import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /data-wrappers/list:
 *   get:
 *     summary: Get a list of data enrichments
 *     description: Returns a list of data enrichments
 *     responses:
 *       200:
 *         description: A list of data enrichments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 */

type PathParameters = {
    name: string;
    description: string;
    schema: {
        type: string;
        default: string;
    };
};

type Path = {
    post: {
        summary: string;
        description: string;
        tags?: string[];
        parameters?: PathParameters[];
        requestBody: {
            content: Record<string, { type: string; format: string }>;
        };
    };
};

type ServerVariable = {
    description: string;
    default: string;
    enum?: string[];
};

type Server = {
    url: string;
    description: string;
    variables?: Record<string, ServerVariable>;
};

type Wrapper = {
    servers: Server[];
    paths: Record<string, Path>;
};

const getWrappers = async () => {
    const wrappers = [];
    const WRAPPER_URL = 'https://data-wrapper.services.istex.fr';
    const WRAPPER_TAG = 'data-wrapper';
    const EXCLUDED_PATHS = ['v1/fields/csv', '/v1/retrieve-csv'];

    const ws = await axios.get<Wrapper>(WRAPPER_URL);
    const paths = ws.data.paths;
    const servers = ws.data.servers;

    for (const path of Object.entries(paths)) {
        const [key, value] = path;

        if (
            value?.post?.tags &&
            servers[0].variables &&
            value.post.tags.includes(WRAPPER_TAG) &&
            !EXCLUDED_PATHS.includes(key)
        ) {
            const label = `${value.post.summary} (${key})`;
            const url = `${servers[0].variables.scheme.default}://${servers[0].variables.hostname.default}${key}`;
            let parameters: Array<{ name: string; displayName: string }> | undefined;
            if (value.post.parameters) {
                parameters = value.post.parameters
                    .filter((parameter) => parameter.name === 'value')
                    .map((parameter) => ({
                        name: parameter.name,
                        displayName: parameter.description + ` (par défaut ${parameter.schema.default})`,
                    }));
            }
            const fileType = Object.entries(value.post.requestBody.content).map((content) => content[0]);
            wrappers.push({
                label,
                description: value.post.description,
                url,
                parameters,
                fileType,
            });
        } else {
            logger.debug(`(${WRAPPER_URL}${key}) Excluded wrapper`);
        }
    }

    return wrappers;
};

//Route to access all wrappers available due to config set
router.get('/list', (req, res) => {
    getWrappers().then((wrappers) => {
        res.json(wrappers);
    });
});

export default router;
