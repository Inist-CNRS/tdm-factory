import axios from 'axios';
import express from 'express';
import type { Config } from '../model/Config';
import type { Parameter, Request } from '../model/Request';

const router = express.Router();
const singleton: Config = require('../model/Config');

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
//Route to access all wrapper available due to config set
router.get('/list', async (req, res) => {
    const results = await Promise.all(singleton.getConfig().wrappers?.map((wrapper) => axios.get(wrapper.url)));

    const requests = results.flatMap((res) => {
        const tags = singleton.getConfig().wrappers?.find((wrapper) => wrapper.url === res.config.url)?.tags;
        return Object.entries(res.data.paths)
            .filter((path: any) =>
                tags?.some((t) => path[1].post?.tags?.includes(t.name) && t.excluded?.indexOf(path[0]) === -1),
            )
            .map<Request>((path: any[]) => {
                return {
                    label: `${path[1].post.summary} (${path[0]})`,
                    description: path[1].post.description,
                    fileType: Object.entries(path[1].post.requestBody.content).map((filetype) => filetype[0]),
                    url: `${res.data.servers[0].variables.scheme.default}://${res.data.servers[0].variables.hostname.default}${path[0]}`,
                    parameters: path[1].post?.parameters
                        ?.map((param: any) => {
                            return { name: param.name, displayName: param.description + ` (par défaut ${param.name})` };
                        })
                        .filter((param: Parameter) => param.name === 'value'),
                };
            });
    });
    res.json(requests);
});

module.exports = router;
