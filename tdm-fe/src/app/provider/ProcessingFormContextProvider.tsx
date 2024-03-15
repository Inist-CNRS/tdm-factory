import { useQueries, useQuery } from '@tanstack/react-query';
import mimeTypes from 'mime';
import { createContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Enrichment, Wrapper } from '~/app/shared/data.types';
import { wrapper as wrapperService, enrichment as enrichmentService } from '~/app/services/creation/operations';
import { upload } from '~/app/services/creation/upload';

export type ProcessingFormContextProviderProps = PropsWithChildren;

export type ProcessingFormContextType = {
    step: number;
    isInvalid: boolean;
    isPending: boolean;
    next: () => void;
    wrapperList: Wrapper[];
    enrichmentList: Enrichment[];
    // Upload step
    file: File | null;
    setFile: (file: File | null) => void;
    processingId: string | null;
    // Configuration step
    wrapper: Wrapper | null;
    setWrapper: (wrapper: Wrapper | null) => void;
    wrapperParam: string | null;
    setWrapperParam: (wrapperParam: string | null) => void;
    enrichment: Enrichment | null;
    setEnrichment: (enrichment: Enrichment | null) => void;
    // Validation step
    email: string | null;
    setEmail: (email: string | null) => void;
};

export const ProcessingFormContext = createContext<ProcessingFormContextType>({} as ProcessingFormContextType);

export const PROCESSING_UPLOAD_STEP = 0;
export const PROCESSING_CONFIGURATION_STEP = 1;
export const PROCESSING_VALIDATION_STEP = 2;
export const PROCESSING_CONFIRMATION_STEP = 3;

const ProcessingFormContextProvider = ({ children }: ProcessingFormContextProviderProps) => {
    const [step, setStep] = useState<number>(0);
    const [isInvalid, setIsInvalid] = useState<boolean>(true);

    const [file, setFile] = useState<File | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [wrapper, setWrapper] = useState<Wrapper | null>(null);
    const [wrapperParam, setWrapperParam] = useState<string | null>(null);
    const [enrichment, setEnrichment] = useState<Enrichment | null>(null);

    const [email, setEmail] = useState<string | null>(null);

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

    const {
        data: uploadResult,
        isPending: uploading,
        isError: uploadFailed,
    } = useQuery({
        queryKey: ['upload', step, processingId, file],
        queryFn: () => {
            if (step !== PROCESSING_UPLOAD_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (!file) {
                return null;
            }

            return upload(file);
        },
        staleTime: 3600000,
        gcTime: 3600000,
    });

    const mimes = useMemo<string[]>(() => {
        if (!operations.pending && operations.data.wrapper) {
            return operations.data.wrapper.flatMap((entry) => entry.fileType);
        }
        return [];
    }, [operations.data.wrapper, operations.pending]);

    const isPending = useMemo(() => {
        return operations.pending || uploading;
    }, [operations.pending, uploading]);

    useEffect(() => {
        if (uploadResult) {
            setProcessingId(uploadResult);
            setStep(PROCESSING_CONFIGURATION_STEP);
        }
    }, [uploadResult]);

    useEffect(() => {
        if (uploadFailed) {
            setIsInvalid(true);
        }
    }, [uploadFailed]);

    const handleNext = () => {
        setStep(step + 1);
        setIsInvalid(true);
    };

    const handleFileChange = (newFile: File | null) => {
        if (step === PROCESSING_UPLOAD_STEP) {
            setFile(newFile);

            let invalid = false;

            if (!newFile || !mimes.includes(mimeTypes.getType(newFile.name) ?? '')) {
                invalid = true;
            }

            setIsInvalid(invalid);
        }
    };

    const handleWrapperChange = (newWrapper: Wrapper | null) => {
        if (step === PROCESSING_CONFIGURATION_STEP) {
            setWrapper(newWrapper);
        }
    };

    const handleWrapperParamChange = (newWrapperParam: string | null) => {
        if (step === PROCESSING_CONFIGURATION_STEP) {
            setWrapperParam(newWrapperParam);
        }
    };

    const handleEnrichmentChange = (newEnrichment: Enrichment | null) => {
        if (step === PROCESSING_CONFIGURATION_STEP) {
            setEnrichment(newEnrichment);
        }
    };

    const handleEmailChange = (newEmail: string | null) => {
        if (step === PROCESSING_VALIDATION_STEP) {
            setEmail(newEmail);
        }
    };

    return (
        <ProcessingFormContext.Provider
            value={{
                step,
                isInvalid,
                isPending,
                next: handleNext,
                wrapperList: operations.data.wrapper ?? [],
                enrichmentList: operations.data.enrichment ?? [],
                file,
                setFile: handleFileChange,
                processingId,
                wrapper,
                setWrapper: handleWrapperChange,
                wrapperParam,
                setWrapperParam: handleWrapperParamChange,
                enrichment,
                setEnrichment: handleEnrichmentChange,
                email,
                setEmail: handleEmailChange,
            }}
        >
            {children}
        </ProcessingFormContext.Provider>
    );
};

export default ProcessingFormContextProvider;
