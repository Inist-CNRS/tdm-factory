import configRoute from '~/controller/config';
import dataEnrichmentRoute from '~/controller/data-enrichment';
import dataWrapperRoute from '~/controller/data-wrapper';
import traitmentRoute from '~/controller/traitment';
import webhookRoute from '~/controller/webhook';
import environment from '~/lib/config';
import { filesLocation, initFilesSystem } from '~/lib/files';
import logger, { httpLogger, cronLogger } from '~/lib/logger';
import swaggerFile from '~/swagger/swagger-config.json';

import cors from 'cors';
import express from 'express';
import basicAuth from 'express-basic-auth';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';

import fs from 'node:fs';
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

//to secure
app.use('/config', auth, configRoute);
app.use('/swagger-config', auth, swaggerUi.serve, swaggerUi.setup(swaggerFile));

const dirname = process.cwd();

app.use(express.static(path.join(dirname, 'public')));

// Rewrite reverse proxy, this is required because we use a single page application
// We need to declare all route used by the front application
app.get('/', function (req, res) {
    res.sendFile(path.join(dirname, 'public', 'index.html'));
});
app.get('/status/:id', function (req, res) {
    res.sendFile(path.join(dirname, 'public', 'index.html'));
});

// Middleware pour gérer les erreurs 404 (route non trouvée)
app.use((req, res) => {
    res.status(404).send(
        "Désolé, le fichier est introuvable, il n'a peut être pas encore été généré ou il a expiré (créé il y a plus d'une semaine)",
    );
});

initFilesSystem().then(() => {
    const server = app.listen(environment.port, () => {
        logger.debug(`Running on ${environment.port}`);
    });

    server.setTimeout(600000); // 10 minutes timeout for all routes
});

cron.schedule(environment.cron.schedule, () => {
    const oneWeekAgo = new Date(); // Date actuelle
    oneWeekAgo.setDate(oneWeekAgo.getDate() - environment.cron.deleteFileOlderThan); // Soustrait une semaine

    fs.readdir(filesLocation.upload, (err, files) => {
        if (err) {
            cronLogger.error('Erreur de lecture du dossier', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(filesLocation.upload, file);

            fs.stat(filePath, (error, stats) => {
                if (error) {
                    cronLogger.error('Erreur de récupération des informations sur le fichier', error);
                    return;
                }

                // Vérifie si le fichier est plus ancien d'une semaine
                if (stats.isFile() && stats.mtime < oneWeekAgo) {
                    fs.unlink(filePath, (unlinkError) => {
                        if (unlinkError) {
                            cronLogger.error('Erreur de suppression du fichier', unlinkError);
                            return;
                        }
                        cronLogger.info(`Le fichier ${file} a été supprimé.`);
                    });
                }
            });
        });
    });
});
