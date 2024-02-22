import { databaseLogger } from './logger';
import Database from 'better-sqlite3';

const db = new Database('factory.db', {
    verbose: (message) => {
        databaseLogger.debug(message);
    },
});

const init = () => {
    db.prepare(
        `
        create table if not exists processing (
            id text primary key,
            status integer,
            email text default null,
            wrapper text default null,
            enrichment text default null,
            uploadFile text,
            tmpFile text default null,
            resultFile text default null
        );
    `,
    ).run();
};

init();

export default db;