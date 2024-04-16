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
    sendErrorMail({
        email: processing.email as string,
        data: {
            processingId: processing.id,
            originalName: processing.originalName,
            wrapper: processing.wrapper as string,
            wrapperParam: processing.wrapperParam as string,
            enrichment: processing.enrichment as string,
            errorMessage,
        },
    }).then(undefined);
};
