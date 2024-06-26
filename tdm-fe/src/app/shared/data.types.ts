export type Operation = {
    label: string;
    description: string;
    url: string;
};

export type Wrapper = Operation & {
    fileType: string[];
    parameters?: Array<{
        name: string;
        displayName: string;
    }>;
};

export type WrapperList = Wrapper[];

export type Enrichment = Operation & {
    parameters: string[];
};

export type EnrichmentList = Enrichment[];

export type ProcessingStatus = {
    message: string;
    errorType: string;
};

export type ProcessingFields = {
    fields?: string[];
};
