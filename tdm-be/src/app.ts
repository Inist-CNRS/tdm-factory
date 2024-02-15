import configRoute from './controller/config';
import dataEnrichmentRoute from './controller/data-enrichment';
import dataWrapperRoute from './controller/data-wrapper';
import traitmentRoute from './controller/traitment';
import webhookRoute from './controller/webhook';
import environment from './lib/config';
import { initFilesSystem } from './lib/files';
import logger, { httpLogger, cronLogger } from './lib/logger';
import swaggerFile from './swagger/swagger-config.json';
import cors from 'cors';
import express from 'express';
import basicAuth from 'express-basic-auth'; // This package is used for basic authentication
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import path from 'path';

const app = express();

const port = environment.port;

// Simple example user credentials
const users = {
    user: environment.password,
};

// Middleware for basic authentication
const auth = basicAuth({
    users,
    challenge: true, // Sends 401 authentication challenge if credentials are missing
    unauthorizedResponse: 'Authentication required.', // Message for unauthorized access
});

app.use((req, res, next) => {
    httpLogger.info(`${req.method} ${req.url} - ${req.ip} - ${req.get('user-agent')}`);
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

app.get('/', function (req, res) {
    res.sendFile(path.join(dirname, 'public', '_next', 'server', 'app', 'index.html'));
});
app.use(express.static(path.join(dirname, 'public')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(dirname, 'public'));
});

// Middleware pour gérer les erreurs 404 (route non trouvée)
app.use((req, res, next) => {
    res.status(404).send(
        "Désolé, le fichier est introuvable, il n'a peut être pas encore été généré ou il a expiré (créé il y a plus d'une semaine)",
    );
});

initFilesSystem().then(() => {
    const server = app.listen(port, () => {
        logger.debug(`Running on ${port}`);
    });

    server.setTimeout(600000); // 10 minutes timeout for all routes
});

cron.schedule(environment.cron.schedule, () => {
    const oneWeekAgo = new Date(); // Date actuelle
    oneWeekAgo.setDate(oneWeekAgo.getDate() - environment.cron.deleteFileOlderThan); // Soustrait une semaine

    fs.readdir(environment.fileFolder, (err, files) => {
        if (err) {
            cronLogger.error('Erreur de lecture du dossier', err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(environment.fileFolder, file);

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
