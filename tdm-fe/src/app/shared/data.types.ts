export type Operation = {
    label: string;
    description: string;
    url: string;
};

export type WrapperList = Array<
    Operation & {
        fileType: string[];
    }
>;

export type EnrichmentList = Array<
    Operation & {
        parameters: string[];
    }
>;

export type ProcessingStatus = {
    message: string;
    errorType: string;
};
