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
    inputFormat2labels: Record<
        string,
        {
            summary: string;
            description: string;
            wrapperParameter?: string;
            extensions: string[];
        }
    >;
    flows: Array<{
        id: string;
        featured: boolean;
        input: string;
        inputFormat: string;
        wrapper: string;
        enricher: string;
        retrieve: string;
        retrieveExtension: string;
        summary: string;
        description: string;
        descriptionLink?: string;
    }>;
};

export default config as unknown as Config;
