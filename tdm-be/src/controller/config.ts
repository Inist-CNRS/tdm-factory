import logger from '~/lib/logger';
import dynamicConfig from '~/model/DynamicConfig';

import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Config:
 *       type: object
 *       properties: {}
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
    (_req, res) => {
        dynamicConfig.setConfig();
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
router.get('/', (_req, res) => {
    res.json(dynamicConfig.getConfig());
});

export default router;
