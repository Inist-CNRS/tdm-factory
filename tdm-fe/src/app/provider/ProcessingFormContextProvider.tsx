import { fields } from '~/app/services/creation/fields';
import { wrapper as wrapperService, enrichment as enrichmentService } from '~/app/services/creation/operations';
import { start } from '~/app/services/creation/processing';
import { upload } from '~/app/services/creation/upload';
import type { Enrichment, ProcessingFields, Wrapper } from '~/app/shared/data.types';

import { useQueries, useQuery } from '@tanstack/react-query';
import mimeTypes from 'mime';
import { createContext, useEffect, useMemo, useState } from 'react';

import type { PropsWithChildren } from 'react';

export type ProcessingFormContextProviderProps = PropsWithChildren;

export type ProcessingFormContextType = {
    step: number;
    isInvalid: boolean;
    isPending: boolean;
    isOnError: boolean;
    isWaitingInput: boolean;
    next: () => void;
    mimes: string[];
    wrapperList: Wrapper[];
    enrichmentList: Enrichment[];
    // Upload step
    file: File | null;
    setFile: (file: File | null) => void;
    processingId: string | null;
    // Configuration step
    fields: ProcessingFields | null;
    wrapper: Wrapper | null;
    setWrapper: (wrapper: Wrapper | null) => void;
    wrapperParam: string | null;
    setWrapperParam: (wrapperParam: string | null) => void;
    enrichment: Enrichment | null;
    setEnrichment: (enrichment: Enrichment | null) => void;
    // Validation step
    email: string | null;
    setEmail: (email: string | null) => void;
    // Confirmation step
    startingStatus: 202 | 400 | 409 | 428 | 500 | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ProcessingFormContext = createContext<ProcessingFormContextType>({} as ProcessingFormContextType);

export const PROCESSING_UPLOAD_STEP = 0;
export const PROCESSING_UPLOADING_STEP = 1;
export const PROCESSING_CONFIGURATION_STEP = 2;
export const PROCESSING_VALIDATION_STEP = 3;
export const PROCESSING_CONFIRMATION_STEP = 4;

/**
 * Processing creation form context provider
 * This context handle all data processing of the Processing creation form
 */
const ProcessingFormContextProvider = ({ children }: ProcessingFormContextProviderProps) => {
    /**
     * Form states
     */
    const [step, setStep] = useState<number>(PROCESSING_UPLOAD_STEP);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [isInvalid, setIsInvalid] = useState<boolean>(false);
    const [isOnError, setIsOnError] = useState<boolean>(false);
    const [isWaitingInput, setIsWaitingInput] = useState<boolean>(true);

    /**
     * Form file and processing id (upload step)
     */
    const [file, setFile] = useState<File | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    /**
     * Form configuration step
     */
    const [wrapper, setWrapper] = useState<Wrapper | null>(null);
    const [wrapperParam, setWrapperParam] = useState<string | null>(null);
    const [enrichment, setEnrichment] = useState<Enrichment | null>(null);

    /**
     * Form validation step
     */
    const [email, setEmail] = useState<string | null>(null);

    /**
     * Form confirmation step
     */
    const [startingStatus, setStartingStatus] = useState<202 | 400 | 409 | 428 | 500 | null>(null);

    /**
     * Get wrapper and enrichment available
     */
    const operations = useQueries({
        queries: [
            {
                queryKey: ['wrapper'],
                queryFn: wrapperService,
                staleTime: 3600000, // 1 hour of cache
                gcTime: 3600000, // 1000 * 60 * 60
            },
            {
                queryKey: ['enrichment'],
                queryFn: enrichmentService,
                staleTime: 3600000,
                gcTime: 3600000,
            },
        ],
        combine: (results) => {
            return {
                data: { wrapper: results[0].data, enrichment: results[1].data },
                pending: results.some((result) => result.isPending),
            };
        },
    });

    /**
     * Upload the corpus and get the associated processing id
     */
    const {
        data: uploadResult,
        isPending: uploading,
        isError: uploadFailed,
    } = useQuery({
        queryKey: ['upload', step, processingId, file],
        queryFn: () => {
            if (step !== PROCESSING_UPLOADING_STEP) {
                return null;
            }

            if (!file) {
                return null;
            }

            return upload(file);
        },
        staleTime: 3600000,
        gcTime: 3600000,
    });

    const { data: fieldsData } = useQuery({
        queryKey: ['fields', step, processingId],
        queryFn: () => {
            if (step !== PROCESSING_CONFIGURATION_STEP) {
                return null;
            }

            if (!processingId) {
                return null;
            }

            return fields(processingId);
        },
    });

    /**
     * Start the processing
     */
    const { data: startResponse, isPending: startPending } = useQuery({
        queryKey: ['start', step, processingId, wrapper, enrichment, email, wrapperParam],
        queryFn: () => {
            if (step !== PROCESSING_CONFIRMATION_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (!processingId || !wrapper || !enrichment || !email) {
                return null;
            }

            return start({
                id: processingId,
                wrapper: wrapper,
                wrapperParam: wrapperParam ?? undefined,
                enrichment: enrichment,
                mail: email,
            });
        },
        staleTime: 3600000,
        gcTime: 3600000,
    });

    /**
     * Aggregate all mine type available
     */
    const mimes = useMemo<string[]>(() => {
        if (!operations.pending && operations.data.wrapper) {
            const mimeType = [...new Set(operations.data.wrapper.flatMap((entry) => entry.fileType))];

            if (mimeType.includes('application/x-gzip')) {
                mimeType.push('application/gzip');
            }

            return mimeType;
        }
        return [];
    }, [operations.data.wrapper, operations.pending]);

    /**
     * Clean up wrapper list
     */
    const wrapperList = useMemo(() => {
        if (!operations.data.wrapper) {
            return [];
        }

        const list = operations.data.wrapper;

        if (file) {
            return list.filter((entry) => {
                return entry.fileType.includes(mimeTypes.getType(file.name) ?? '');
            });
        }

        return list;
    }, [file, operations.data.wrapper]);

    /**
     * Clean up enrichment list
     */
    const enrichmentList = useMemo(() => {
        if (!operations.data.enrichment) {
            return [];
        }

        return operations.data.enrichment;
    }, [operations.data.enrichment]);

    /**
     * Listen for network call and update the state
     */
    useEffect(() => {
        setIsPending(operations.pending || uploading || startPending);
    }, [operations.pending, uploading, startPending]);

    /**
     * Listen for the end of the upload and update the processing id state
     */
    useEffect(() => {
        if (uploadResult) {
            setProcessingId(uploadResult);
            setStep(PROCESSING_CONFIGURATION_STEP);
        }
    }, [uploadResult]);

    /**
     * Listen for the upload error and set the form on error
     */
    useEffect(() => {
        if (uploadFailed) {
            setIsOnError(true);
        }
    }, [uploadFailed]);

    /**
     * Listen for start response
     */
    useEffect(() => {
        setStartingStatus(startResponse ?? null);
    }, [startResponse]);

    /**
     * Handle the next button
     */
    const handleNext = () => {
        let invalid = false;
        let waiting = true;
        let nextStep = step + 1;

        if (nextStep === PROCESSING_VALIDATION_STEP) {
            if (email && EMAIL_REGEX.test(email)) {
                waiting = false;
            }

            if (email && !EMAIL_REGEX.test(email)) {
                invalid = true;
            }
        }

        if (nextStep === PROCESSING_CONFIRMATION_STEP) {
            waiting = false;
        }

        if (step === PROCESSING_CONFIRMATION_STEP) {
            setFile(null);
            setWrapper(null);
            setWrapperParam(null);
            setEnrichment(null);
            nextStep = PROCESSING_UPLOAD_STEP;
        }

        setIsInvalid(invalid);
        setIsWaitingInput(waiting);
        setStep(nextStep);
    };

    /**
     * Handle file change
     * @param newFile newly add file
     */
    const handleFileChange = (newFile: File | null) => {
        if (step === PROCESSING_UPLOAD_STEP) {
            setFile(newFile);

            let invalid = false;

            if (!newFile || !mimes.includes(mimeTypes.getType(newFile.name) ?? '')) {
                invalid = true;
            }

            setIsInvalid(invalid);
            setIsWaitingInput(false);
        }
    };

    /**
     * Handle wrapper selection
     * @param newWrapper newly selected wrapper
     */
    const handleWrapperChange = (newWrapper: Wrapper | null) => {
        if (step === PROCESSING_CONFIGURATION_STEP) {
            setWrapper(newWrapper);

            let invalid = false;

            if (operations.data.wrapper && !operations.data.wrapper.find((entry) => entry.url === newWrapper?.url)) {
                invalid = true;
            }

            setIsInvalid(invalid);
            setIsWaitingInput(false);
        }
    };

    /**
     * Handle wrapper param change
     * @param newWrapperParam newly added param
     */
    const handleWrapperParamChange = (newWrapperParam: string | null) => {
        if (step === PROCESSING_CONFIGURATION_STEP) {
            setWrapperParam(newWrapperParam);
        }
    };

    /**
     * Handle enrichment selection
     * @param newEnrichment newly selected enrichment
     */
    const handleEnrichmentChange = (newEnrichment: Enrichment | null) => {
        if (step === PROCESSING_CONFIGURATION_STEP) {
            setEnrichment(newEnrichment);

            let invalid = false;

            if (
                operations.data.enrichment &&
                !operations.data.enrichment.find((entry) => entry.url === newEnrichment?.url)
            ) {
                invalid = true;
            }

            setIsInvalid(invalid);
            setIsWaitingInput(false);
        }
    };

    /**
     * Handle email change
     * @param newEmail newly added email
     */
    const handleEmailChange = (newEmail: string | null) => {
        if (step === PROCESSING_VALIDATION_STEP) {
            setEmail(newEmail);

            let invalid = false;

            if (!newEmail || !EMAIL_REGEX.test(newEmail)) {
                invalid = true;
            }

            setIsInvalid(invalid);
            setIsWaitingInput(false);
        }
    };

    return (
        <ProcessingFormContext.Provider
            value={{
                step,
                isInvalid,
                isPending,
                isOnError,
                isWaitingInput,
                next: handleNext,
                mimes,
                wrapperList,
                enrichmentList,
                file,
                setFile: handleFileChange,
                processingId,
                fields: fieldsData ?? null,
                wrapper,
                setWrapper: handleWrapperChange,
                wrapperParam,
                setWrapperParam: handleWrapperParamChange,
                enrichment,
                setEnrichment: handleEnrichmentChange,
                email,
                setEmail: handleEmailChange,
                startingStatus,
            }}
        >
            {children}
        </ProcessingFormContext.Provider>
    );
};

export default ProcessingFormContextProvider;
