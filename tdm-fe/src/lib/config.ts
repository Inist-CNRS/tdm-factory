export type StaticConfig = {
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
    inputFormat2labels: Record<
        string,
        {
            summary: string;
            description: string;
            extensions: string[];
            wrapperParameter?: string;
            wrapperParameterComplete?: string;
        }
    >;
};
