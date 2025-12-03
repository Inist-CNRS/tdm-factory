import staticConfig from '~/lib/config-static';
import logger from '~/lib/logger';

import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /config-static:
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
router.get('/', (req, res) => {
    // Keep only flows field, as the other ones are confidential
    // (passwords, IPs, etc.), and not used by the frontend
    const { flows, inputFormat2labels, hosts } = staticConfig;
    logger.info('Get static config');
    res.json({ flows, inputFormat2labels, hosts });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     StaticConfig:
 *       type: object
 *       properties:
 *         flows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Flow'
 *         inputFormat2labels:
 *           type: object
 *           additionalProperties:
 *             $ref: '#/components/schemas/InputFormatLabel'
 *     Flow:
 *       type: object
 *       properties:
 *         featured:
 *           type: boolean
 *           example: true
 *         input:
 *           type: string
 *           example: article
 *         inputFormat:
 *           type: string
 *           example: pdf
 *         wrapper:
 *           type: string
 *           example: /v1/pdf
 *         enricher:
 *           type: string
 *           example: https://data-workflow.services.istex.fr/v1/bibcheck-pdf
 *         retrieve:
 *           type: string
 *           example: /v1/retrieve-csv
 *         retrieveExtension:
 *           type: string
 *           example: csv
 *         summary:
 *           type: string
 *           example: '**bibCheck** - Contrôle de références bibliographiques'
 *         description:
 *           type: string
 *           example: Contrôle les références bibliographiques d'un article en PDF, en vérifiant leur présence dans Crossref tout en s'assurant que l'article associé n'est pas rétracté.
 *         descriptionLink:
 *           type: string
 *           example: https://services.istex.fr/validation-de-reference-bibliographique/
 *         InputFormatLabel:
 *           type: string
 *           example: 'PDF'
 */

export default router;
