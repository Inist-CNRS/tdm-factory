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

type Format = {
    summary: string;
    description: string;
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
    inputFormat2labels?: Record<string, Format>;
    flows: Array<{
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
        descriptionLink?: string;
        featured?: boolean;
    }>;
};

export default config as unknown as Config;
