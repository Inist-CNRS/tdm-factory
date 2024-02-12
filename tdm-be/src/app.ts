import environment from './lib/config';
import logger, { httpLogger, cronLogger } from './lib/logger';
import swaggerFile from './swagger/swagger-config.json';
import express from 'express';
import fs from 'node:fs';

const app = express();
const configRoute = require('./controller/config');
const dataEnrichmentRoute = require('./controller/data-enrichment');
const dataWrapperRoute = require('./controller/data-wrapper');
const traitmentRoute = require('./controller/traitment');
const webhookRoute = require('./controller/webhook');
const cors = require('cors');
const basicAuth = require('express-basic-auth'); // This package is used for basic authentication
const cron = require('node-cron');

//Import all controllers

//Import swagger config
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', '_next', 'server', 'app', 'index.html'));
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public'));
});

// Middleware pour gérer les erreurs 404 (route non trouvée)
app.use((req, res, next) => {
    res.status(404).send(
        "Désolé, le fichier est introuvable, il n'a peut être pas encore été généré ou il a expiré (créé il y a plus d'une semaine)",
    );
});

const server = app.listen(port, () => {
    logger.debug(`Running on ${port}`);
});

server.setTimeout(600000); // 10 minutes timeout for all routes

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
