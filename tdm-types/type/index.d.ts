// TODO Add every request and response from the api

type EmptyRequest = never;

type ApiOperationsWrapperResponse = {
    id: string;
    title: string;
    summary: string;
    defaultValue: string;
    mines: string[];
};

type ApiOperationsEnrichmentResponse = {
    id: string;
    title: string;
    summary: string;
};

type ApiProcessingFieldsRequest = {
    id: string;
};

type ApiProcessingFieldsResponse = {
    fields: string[];
};

export type GET = {
    Api: {
        Operations: {
            Wrapper: {
                Request: EmptyRequest;
                Response: ApiOperationsWrapperResponse;
            };
            Enrichment: {
                Request: EmptyRequest;
                Response: ApiOperationsEnrichmentResponse;
            };
        };
        Processing: {
            Fields: {
                Request: ApiProcessingFieldsRequest;
                Response: ApiProcessingFieldsResponse;
            };
        };
    };
};

type UploadResponse = {
    id: string;
};

export type POST = {
    Upload: {
        Response: UploadResponse;
    };
};
