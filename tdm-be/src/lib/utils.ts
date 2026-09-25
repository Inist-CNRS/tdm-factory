import { sendErrorMail } from '~/lib/email';

import { updateProcessing, type Processing } from '~/model/ProcessingModel';

export const errorEmail = (processing: Processing, errorMessage: string) => {
    if (processing.email) {
        sendErrorMail(
            processing.id,
            processing.originalName,
            processing.wrapper as string,
            processing.wrapperParam as string,
            processing.enrichment as string,
            processing.email,
            processing.flowId,
            errorMessage,
        ).then(undefined);
    }

    // Error paths end the processing: purge the client IP right away, it is only
    // useful for usage statistics of successful web service calls.
    updateProcessing(processing.id, { clientIp: null });
};

export const addSidToUrl = (url: string, clientIp?: string | null) => {
    const urlObj = new URL(url);
    urlObj.searchParams.append('sid', 'tdm-factory');

    // Usage statistics: forward the IP of the user who requested the processing, so the
    // called web service can log which organisation (IP -> organisation mapping) made the call.
    if (clientIp) {
        urlObj.searchParams.append('ip', clientIp);
    }

    return urlObj.toString();
};
