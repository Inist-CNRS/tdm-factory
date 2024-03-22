import singleton from '~/model/Config';

import axios from 'axios';
import express from 'express';

import type { Request } from '~/model/Request';

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

//Route to access all enrichments in the istex api due to config set
router.get('/list', async (req, res) => {
    const results = await Promise.all(
        singleton.getConfig().enrichments?.map((enrichment) => axios.get(enrichment.url)),
    );

    const requests = results.flatMap((res) => {
        const tags = singleton.getConfig().enrichments?.find((enrichment) => enrichment.url === res.config.url)?.tags;
        return Object.entries(res.data.paths)
            .filter((path: any) =>
                tags?.some((t) => path[1].post?.tags?.includes(t.name) && t.excluded?.indexOf(path[0]) === -1),
            )
            .map<Request>((path: any) => {
                return {
                    label: `${path[1].post.summary} (${path[0]})`,
                    description: path[1].post.description,
                    url: `${res.data.servers[0].variables.scheme.default}://${res.data.servers[0].variables.hostname.default}${path[0]}`,
                    parameters: path[1].post?.parameters?.map((param: any) => param.name),
                };
            });
    });
    res.json(requests);
});

export default router;
