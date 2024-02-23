import express from 'express';
import { HTTP_NOT_FOUND } from '~/lib/http';
import logger from '~/lib/logger';
import enrichmentHook from '~/worker/enrichmentHook';

const router = express.Router();

//Webhook of success after traitment done
router.post(
    '/success',
    (req, res) => {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            res.status(HTTP_NOT_FOUND).send({
                status: HTTP_NOT_FOUND,
            });
            return;
        }

        enrichmentHook.success(id);
    },
    (error) => {
        logger.error(error);
    },
);

//Webhook of failure after traitment done
router.post(
    '/failure',
    (req, res) => {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            res.status(HTTP_NOT_FOUND).send({
                status: HTTP_NOT_FOUND,
            });
            return;
        }

        enrichmentHook.failure(id);
    },
    (error) => {
        logger.error(error);
    },
);

export default router;
