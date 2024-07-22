import { filesLocation, readDir } from '~/lib/files';
import { findAllStatus } from '~/model/ProcessingModel';

import { statfs } from 'node:fs/promises';

import type { Stats } from 'node:fs';

const createStorage = async () => {
    const files = await Promise.all([
        readDir(filesLocation.upload),
        readDir(filesLocation.tmp),
        readDir(filesLocation.download),
    ]).then();

    let used = 0;
    const convertFile = ({ stats }: { file: string; stats: Stats }) => {
        used += stats.size;
        return {
            date: stats.ctime,
            size: stats.size,
        };
    };

    const upload = files[0].map(convertFile);
    const tmp = files[1].map(convertFile);
    const download = files[2].map(convertFile);

    const fsStats = await statfs(filesLocation.app);

    return {
        free: fsStats.bfree * fsStats.bsize,
        used,
        files: {
            upload,
            tmp,
            download,
        },
    };
};

const createStatus = () => {
    const status: Record<number, number> = {};
    for (const datum of findAllStatus()) {
        const previousStatus = status[datum.status];
        if (previousStatus === undefined) {
            status[datum.status] = 1;
            continue;
        }
        status[datum.status] = previousStatus + 1;
    }

    return status;
};

const createDashboard = async () => {
    return {
        status: createStatus(),
        storage: await createStorage(),
    };
};

export default createDashboard;
