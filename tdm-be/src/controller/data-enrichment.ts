import logger from '~/lib/logger';
import config from '~/model/Config';

import axios from 'axios';
import express from 'express';

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           description: The request name
 *         url:
 *           type: string
 *           description: The request url
 *         description:
 *           type: string
 *           description: The request description
 *         parameters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Parameter'
 *         fileType:
 *           type: array
 *           description: The request accept type
 *           items:
 *             type: string
 *     Parameter:
 *       type: object
 *       properties:
 *         displayName:
 *           type: string
 *           description: Display name of the parameter
 *         name:
 *           type: string
 *           description: Name of the parameter
 *         value:
 *           type: string
 *           description: Value of the parameter
 */

/**
 * @swagger
 * /data-enrichments/list:
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
};

type Path = {
    post: {
        summary: string;
        description: string;
        tags?: string[];
        parameters?: PathParameters[];
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

type Enrichment = {
    servers: Server[];
    paths: Record<string, Path>;
};

const getEnrichments = async () => {
    const enrichments = [];

    for (const enrichment of config.getConfig().enrichments) {
        const ws = await axios.get<Enrichment>(enrichment.url);
        const paths = ws.data.paths;
        const servers = ws.data.servers;
        const tags = enrichment.tags.flatMap((tag) => tag.name);
        const excluded = enrichment.tags.flatMap((tag) => tag.excluded).filter((tag) => !!tag) as unknown as string[];
        for (const path of Object.entries(paths)) {
            const [key, value] = path;

            if (
                value.post.tags &&
                servers[0].variables &&
                value.post.tags.some((tag) => tags.includes(tag)) &&
                !excluded.includes(key)
            ) {
                const label = `${value.post.summary} (${key})`;
                const url = `${servers[0].variables.scheme.default}://${servers[0].variables.hostname.default}${key}`;
                let parameters: string[] | undefined;
                if (value.post.parameters) {
                    parameters = value.post.parameters.map((parameter) => parameter.name);
                }
                enrichments.push({
                    label,
                    description: value.post.description,
                    url,
                    parameters,
                });
            } else {
                logger.warning(`Invalid enrichment! (${enrichment.url})`);
            }
        }
    }

    return enrichments;
};

//Route to access all enrichments in the istex api due to config set
router.get('/list', (req, res) => {
    getEnrichments().then((enrichments) => {
        res.json(enrichments);
    });
});

export default router;
