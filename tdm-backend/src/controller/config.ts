import logger from '~/lib/logger';
import dynamicConfig from '~/model/DynamicConfig';

import express from 'express';

const router = express.Router();

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
 *           example: [{'url':'https://data-computer.services.istex.fr', 'retrieveUrl':'/v1/retrieve', 'tags':[{'name':'data-computer','excluded':['/v1/collect','/v1/retrieve','/v1/mock-error-async','/v1/mock-error-sync']}]}]
 *         mailSuccess:
 *           type:
 *             $ref: '#/components/schemas/Mail'
 *           example: {'subject':'Objet du mail succès', 'text':'Vous pouvez télécharger le fichier enrichi à l&apos;adresse ci-dessous' }
 *         mailError:
 *           type:
 *             $ref: '#/components/schemas/Mail'
 *           example: {'subject':'Objet du mail d&apos;erreur', 'text':'Une erreur s&apos;est produite lors de l&apos;enrichissement' }
 *
 *     SwaggerApi:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: 'https://data-wrapper.services.istex.fr'
 *         retrieveUrl:
 *           type: string
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
 *     Mail:
 *       type: object
 *       properties:
 *         subject:
 *           type: string
 *         text:
 *           type: string
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
