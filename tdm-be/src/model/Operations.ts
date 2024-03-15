export type XField<T> = {
    value: T;
    description: string;
};

export type WebServiceInfo = {
    title: string;
    description: string;
    summary: string;
    termsOfService: string;
    version: string;
    contact: {
        name: string;
        url: string;
    };
    'x-encoding': XField<string>;
    'x-concurrency': XField<number>;
    'x-uptime': XField<number>;
    'x-timestamp': XField<number>;
    'x-daemon': XField<boolean>;
    'x-slave': XField<boolean>;
    'x-cache': XField<boolean>;
};

export type WebServiceServer = {
    url: string;
    description: string;
    'x-profil'?: string;
    variables?: Record<
        string,
        {
            description: string;
            default: string;
            enum: string[];
        }
    >;
};

export type WebServiceTag = {
    name: string;
    description: string;
    externalDocs: {
        description: string;
        url: string;
    };
};

export type WebServices = {
    openapi: string;
    info: WebServiceInfo;
    servers: WebServiceServer[];
    tags: WebServiceTag[];
};
