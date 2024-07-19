import { filesLocation, logFile, readDir } from '~/lib/files';
import { loggerName } from '~/lib/logger';
import { findAllProcessing } from '~/model/ProcessingModel';

import express from 'express';

import fs from 'node:fs/promises';

const router = express.Router();

router.get('/database', (req, res) => {
    let page = 1;
    if (req.query.page && Number(req.query.page) > 1) {
        page = Number(req.query.page);
    }
    res.json(findAllProcessing(page));
});

router.get('/logs', (req, res) => {
    res.json(loggerName);
});

router.get('/logs/:name/:level', (req, res) => {
    const { name, level } = req.params;

    if (!name || !level) {
        res.status(400).send();
        return;
    }

    if (!loggerName.includes(name) || !['combined', 'debug'].includes(level)) {
        res.status(400).send();
        return;
    }

    let fileName = name === 'default' ? 'combined.log' : `${name}-combined.log`;

    if (level === 'debug') {
        fileName = name === 'default' ? 'debug.log' : `${name}-debug.log`;
    }

    fs.readFile(logFile(fileName)).then((value) => {
        res.send(value);
    });
});

router.get('/files', (req, res) => {
    Promise.all([readDir(filesLocation.upload), readDir(filesLocation.tmp), readDir(filesLocation.download)]).then(
        (value) => {
            res.json({
                upload: value[0],
                tmp: value[1],
                download: value[2],
            });
        },
    );
});

router.get('/', (req, res) => {
    res.json({ status: 200 });
});

export default router;
