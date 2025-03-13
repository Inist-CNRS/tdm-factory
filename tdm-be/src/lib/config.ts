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
    mailFrom?: string;
    smtp: SMTP;
    cron: {
        schedule: string;
        deleteFileOlderThan: number;
    };
    verbose: string;
    flows: {
        input: string;
        inputFormat: string;
        wrapper: string;
        wrapperParameter?: string;
        wrapperParameterDefault?: string;
        wrapperParameterComplete?: string;
        enricher: string;
        retrieve: string;
        retrieveExtension: string;
        summary: string;
        description: string;
    }[];
};

export default config as unknown as Config;
