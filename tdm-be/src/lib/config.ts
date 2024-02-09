import config from 'config';

type Host = {
    host: string;
    isHttps: boolean;
};

type SMTP = {
    host: string;
    port: number;
    auth: {
        user: string;
        pass: string;
    };
    secure: boolean;
    tls: {
        ignore: boolean;
        rejectUnauthorized: false;
    };
};

type Config = {
    port: number;
    password: string;
    hosts: {
        internal: Host;
        external: Host;
    };
    smtp: SMTP;
    fileFolder: string;
    dumpFile: string;
    finalFile: string;
    cron: {
        schedule: string;
        deleteFileOlderThan: number;
    };
};

export default config as unknown as Config;
