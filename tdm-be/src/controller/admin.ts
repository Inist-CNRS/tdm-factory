import { filesLocation, readDir } from '~/lib/files';

import express from 'express';

const router = express.Router();

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
