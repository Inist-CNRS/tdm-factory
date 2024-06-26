import logger from '~/lib/logger';
import dynamicConfig from '~/model/DynamicConfig';

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

type WrapperOutput = {
    label: string;
    description: string;
    url: string | null;
    parameters?: Array<{
        name: string;
        displayName: string;
    }>;
    fileType: string[];
};

const getWrappers = async () => {
    const wrappers: WrapperOutput[] = [
        {
            label: 'Aucune Transformation',
            description: 'Ce convertisseur est à utilisé avec des traitement qui ne require pas de transformation',
            url: null,
            fileType: ['*/*', ...dynamicConfig.getConfig().wrapperNoneFileType],
        },
    ];

    for (const wrapper of dynamicConfig.getConfig().wrappers) {
        const ws = await axios.get<Wrapper>(wrapper.url);
        const paths = ws.data.paths;
        const servers = ws.data.servers;
        const tags = wrapper.tags.flatMap((tag) => tag.name);
        const excluded = wrapper.tags.flatMap((tag) => tag.excluded).filter((tag) => !!tag) as unknown as string[];
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
                logger.debug(`(${wrapper.url}${key}) Excluded wrapper`);
            }
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
