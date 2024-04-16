import { databaseLogger } from './logger';

import { dbFile } from '~/lib/files';

import Database from 'better-sqlite3';

const db = new Database(dbFile('factory.db'), {
    verbose: (message) => {
        databaseLogger.debug(message);
    },
});

const init = () => {
    db.prepare(
        `
        create table if not exists processing
        (
            id             text primary key,
            status         integer,
            email          text default null,
            wrapper        text default null,
            wrapperParam   text default null,
            enrichment     text default null,
            enrichmentHook text default null,
            originalName   text,
            uploadFile     text,
            tmpFile        text default null,
            resultFile     text default null
        );
    `,
    ).run();
};

init();

export default db;
