export type Format = {
    summary: string;
    description: string;
};

export type StaticConfig = {
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
    inputFormat2labels?: Record<string, Format>;
};
