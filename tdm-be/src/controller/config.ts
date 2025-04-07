import staticConfig from '~/lib/config';
import logger from '~/lib/logger';
import dynamicConfig from '~/model/DynamicConfig';

import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /config/static:
 *   get:
 *     summary: Get the static configuration
 *     responses:
 *       200:
 *         description: Static configuration of the tdm project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StaticConfig'
 */
router.get('/static', (req, res) => {
    // Keep only flows field, as the other ones are confidential
    // (passwords, IPs, etc.), and not used by the frontend
    const { flows } = staticConfig;
    res.json({ flows });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Config:
 *       type: object
 *       properties:
 *         wrappers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SwaggerApi'
 *           example: [{'url':'https://data-wrapper.services.istex.fr', 'tags':[{'name':'data-wrapper','excluded':[]}]}]
 *         enrichments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SwaggerApi'
 *           example: [{'url':'https://data-computer.services.istex.fr', 'retrieveUrl':{url: '/v1/retrieve-csv', fileExtension: 'csv'}, 'tags':[{'name':'data-computer','excluded':['/v1/collect','/v1/retrieve','/v1/mock-error-async','/v1/mock-error-sync']}]}]
 *
 *     SwaggerApi:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: 'https://data-wrapper.services.istex.fr'
 *         retrieveUrl:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: /v1/retrieve-csv
 *             fileExtension:
 *               type: string
 *               example: csv
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *     Tag:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: 'data-wrapper'
 *         excluded:
 *           type: array
 *           items:
 *             type: string
 *           example: ['csv']
 *
 */

/**
 * @swagger
 * /config/set:
 *   post:
 *     summary: Set configuration data
 *     description: Endpoint to set configuration data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Config'
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *       '400':
 *         description: Invalid request body or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the issue
 */
router.post(
    '/set',
    (req, res) => {
        dynamicConfig.setConfig(req.body);
        res.status(200).json({ message: 'Config data updated successfully', config: dynamicConfig.getConfig() });
    },
    (error) => {
        logger.error(error);
    },
);

/**
 * @swagger
 * /config:
 *   get:
 *     summary: Get a the current configuration
 *     responses:
 *       200:
 *         description: Current configuration of the tdm project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 */
//Route to get config the current config
router.get('/', (req, res) => {
    res.json(dynamicConfig.getConfig());
});

export default router;
