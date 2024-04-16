import '~/app/pages/scss/ProcessingCreationForm.scss';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfirmation from '~/app/components/form/ProcessingFormConfirmation';
import ProcessingFormEmail, { EMAIL_REGEX } from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';
import ProcessingFormUpload from '~/app/components/form/ProcessingFormUpload';
import { fields as fieldsService } from '~/app/services/creation/fields';
import { wrapper as wrapperService, enrichment as enrichmentService } from '~/app/services/creation/operations';
import { start } from '~/app/services/creation/processing';
import { upload } from '~/app/services/creation/upload';

import { Button } from '@mui/material';
import { useQueries, useQuery } from '@tanstack/react-query';
import mimeTypes from 'mime';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ProcessingFormConfigurationValueType } from '~/app/components/form/ProcessingFormConfiguration';
import type { Enrichment, Wrapper } from '~/app/shared/data.types';

export const PROCESSING_UPLOAD_STEP = 0;
export const PROCESSING_UPLOADING_STEP = 1;
export const PROCESSING_CONFIGURATION_STEP = 2;
export const PROCESSING_VALIDATION_STEP = 3;
export const PROCESSING_CONFIRMATION_STEP = 4;

const ProcessingCreationForm = () => {
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

            return fieldsService(processingId);
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

    const fields = useMemo(() => {
        return fieldsData ?? null;
    }, [fieldsData]);

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
    const handleNext = useCallback(() => {
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
    }, [email, step]);

    /**
     * Handle file change
     * @param value newly add file
     */
    const handleUploadChange = useCallback((value: File | null) => {
        setFile(value);
        setIsWaitingInput(false);
    }, []);

    /**
     * Handle configuration change
     * @param value newly selected wrapper, wrapperParam and enrichment
     */
    const handleConfigurationChange = useCallback((value: ProcessingFormConfigurationValueType) => {
        setWrapper(value.wrapper);
        setWrapperParam(value.wrapperParam);
        setEnrichment(value.enrichment);
        setIsWaitingInput(false);
    }, []);

    /**
     * Handle email change
     * @param value newly added email
     */
    const handleEmailChange = useCallback((value: string | null) => {
        setEmail(value);
        setIsWaitingInput(false);
    }, []);

    return (
        <div id="processing-form">
            {/* Visual stepper use to indicate the current step of the form */}
            <ProcessingFormStepper step={step} />

            {/* Content of the form */}
            <div id="processing-form-content">
                {/* Upload step */}
                {step === PROCESSING_UPLOAD_STEP || step === PROCESSING_UPLOADING_STEP ? (
                    <ProcessingFormUpload
                        mimes={mimes}
                        value={file}
                        onChange={handleUploadChange}
                        isOnError={isOnError}
                        isPending={isPending}
                    />
                ) : null}

                {/* Configuration step */}
                {step === PROCESSING_CONFIGURATION_STEP ? (
                    <ProcessingFormConfiguration
                        wrapperList={wrapperList}
                        enrichmentList={enrichmentList}
                        fields={fields}
                        value={{
                            wrapper,
                            wrapperParam,
                            enrichment,
                        }}
                        onChange={handleConfigurationChange}
                        isPending={isPending}
                    />
                ) : null}

                {/* Validation step */}
                {step === PROCESSING_VALIDATION_STEP ? (
                    <ProcessingFormEmail value={email} onChange={handleEmailChange} />
                ) : null}

                {/* Confirmation step */}
                {step === PROCESSING_CONFIRMATION_STEP ? (
                    <ProcessingFormConfirmation
                        processingId={processingId}
                        status={startingStatus}
                        isPending={isPending}
                    />
                ) : null}

                {/* Navigation button */}
                {!isPending ? (
                    <div id="processing-form-navigation">
                        <Button
                            onClick={handleNext}
                            variant="outlined"
                            size="large"
                            disabled={isInvalid || isWaitingInput}
                        >
                            {step === PROCESSING_CONFIRMATION_STEP ? 'Nouveau traitement' : 'Suivant'}
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ProcessingCreationForm;
