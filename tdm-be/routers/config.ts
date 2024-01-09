import express from 'express';
var config = require('../model/Config');

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
 *           example: [{'url':'https://data-enrichment.services.istex.fr', 'tags':[{'name':'data-enrichment','excluded':['/v1/collect','/v1/lda','/v1/retrieve','/v1/mock-error-async','/v1/mock-error-sync']}]}]
 * 
 *     SwaggerApi:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: 'https://data-wrapper.services.istex.fr'
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
router.post('/set', (req, res) => {
    config.setConfig(req.body);
    res.status(200).json({ message: 'Config data updated successfully', config });
}, (error) => {
    console.log(error);
});

module.exports = router;
