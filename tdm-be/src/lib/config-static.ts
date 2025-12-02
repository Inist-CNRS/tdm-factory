import config from 'config';

type StaticConfig = {
    flows: Array<{
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
            wrapperParameter?: string;
            extensions: string[];
        }
    >;
};

export default config as unknown as StaticConfig;
