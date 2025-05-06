import adminRoute from '~/controller/admin';
import configRoute from '~/controller/config';
import configStaticRoute from '~/controller/config-static';
import dataEnrichmentRoute from '~/controller/data-enrichment';
import dataWrapperRoute from '~/controller/data-wrapper';
import traitmentRoute from '~/controller/traitment';
import webhookRoute from '~/controller/webhook';
import environment from '~/lib/config';
import initCron from '~/lib/cron';
import { initFilesSystem } from '~/lib/files';
import logger, { httpLogger } from '~/lib/logger';
import swaggerFile from '~/swagger/swagger-config.json';

import cors from 'cors';
import express from 'express';
import basicAuth from 'express-basic-auth';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import fs from 'node:fs/promises';
import path from 'path';

const app = express();

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minute
    limit: 2000, // Limit each IP to 1000 requests per `window` (here, per 10 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: {
        trustProxy: true, // Enable being behind a proxy server
    },
});
app.use(limiter);

// Simple example user credentials
const users = {
    user: environment.password,
};

// Middleware for basic authentication
const auth = basicAuth({
    users,
    challenge: true, // Sends 401 authentication challenges if credentials are missing
    unauthorizedResponse: 'Authentication required.', // Message for unauthorized access
});

app.use((req, res, next) => {
    httpLogger.debug(`${req.method} ${req.url} - ${req.ip} - ${req.get('user-agent')}`);
    next();
});

//Define backend routes
app.use(cors());
app.use(express.json());
app.use('/api/data-wrappers', dataWrapperRoute);
app.use('/api/data-enrichments', dataEnrichmentRoute);
app.use('/api/traitment', traitmentRoute);
app.use('/webhook', webhookRoute);
app.use('/config-static', configStaticRoute);

//to secure
app.use('/config', auth, configRoute);
app.use('/swagger-config', auth, swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/api/admin', auth, adminRoute);

const dirname = process.cwd();

// Route spécifique pour les téléchargements avec Content-Disposition
app.get('/downloads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(dirname, 'public', 'downloads', filename);

    // Vérifier si le fichier existe
    fs.access(filePath, fs.constants.F_OK)
        .then(() => {
            // Définir les en-têtes pour le téléchargement
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/octet-stream');

            // Envoyer le fichier
            res.sendFile(filePath);
        })
        .catch(() => {
            res.status(404).send(
                "Désolé, le fichier est introuvable, il n'a peut être pas encore été généré ou il a expiré (créé il y a plus d'une semaine)"
            );
        });
});

app.use(express.static(path.join(dirname, 'public')));

// Rewrite reverse proxy, this is required because we use a single page application
// We need to declare all route used by the front application
app.get('/', function (req, res) {
    res.sendFile(path.join(dirname, 'public', 'index.html'));
});
app.get('/status/:id', function (req, res) {
    res.sendFile(path.join(dirname, 'public', 'index.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(dirname, 'public', 'admin', 'index.html'));
});

// Middleware pour gérer les erreurs 404 (route non trouvée)
app.use((req, res) => {
    res.status(404).send(
        "Désolé, le fichier est introuvable, il n'a peut être pas encore été généré ou il a expiré (créé il y a plus d'une semaine)",
    );
});

initFilesSystem().then(() => {
    initCron();

    const server = app.listen(environment.port, () => {
        logger.debug(`Running on ${environment.port}`);
    });

    server.setTimeout(600000); // 10 minutes timeout for all routes
});
