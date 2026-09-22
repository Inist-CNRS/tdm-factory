import { sendErrorMail } from '~/lib/email';

import type { Processing } from '~/model/ProcessingModel';

/**
 * Helper function use to compare two value and set a default value if both are null or undefined
 * @param first First value to compare
 * @param second Second value to compare
 */
export const defaultNull = <T>(first: T | null | undefined, second: T | null | undefined): T | null => {
    if (first !== null && first !== undefined) {
        return first;
    }

    if (second !== null && second !== undefined) {
        return second;
    }

    return null;
};

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
