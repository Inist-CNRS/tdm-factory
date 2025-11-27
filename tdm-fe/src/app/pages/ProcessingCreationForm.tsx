import '~/app/pages/scss/ProcessingCreationForm.scss';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfirmation from '~/app/components/form/ProcessingFormConfirmation';
import ProcessingFormEmail from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormFormat from '~/app/components/form/ProcessingFormFormat';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';
import ProcessingFormUpload from '~/app/components/form/ProcessingFormUpload';
import ProcessingExample from '~/app/components/layout/ProcessingExample';
import { wrapper as wrapperService } from '~/app/services/creation/operations';
import { start } from '~/app/services/creation/processing';
import { getProcessingInfo } from '~/app/services/processing/processing-info';

import type { UploadFileFunction } from '~/app/components/form/ProcessingFormUpload';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Button } from '@mui/material';
import { useQueries, useQuery } from '@tanstack/react-query';
import mimeTypes from 'mime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import type { ProcessingFormConfigurationValueType } from '~/app/components/form/ProcessingFormConfiguration';
import type { Wrapper } from '~/app/shared/data.types';

export const PROCESSING_FORMAT_STEP = 0;
export const PROCESSING_UPLOAD_STEP = 1;
export const PROCESSING_CONFIGURATION_STEP = 2;
export const PROCESSING_VALIDATION_STEP = 3;
export const PROCESSING_CONFIRMATION_STEP = 4;

const ProcessingCreationForm = () => {
    const { type } = useParams();
    const location = useLocation();

    // Récupérer les paramètres de l'URL
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const idFromUrl = queryParams.get('id');
    const stepFromUrl = queryParams.get('step');

    const handleHomeReturn = () => {
        window.location.href = '/';
    };

    /**
     * Form states
     */
    const [step, setStep] = useState<number>(PROCESSING_FORMAT_STEP);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [isInvalid, setIsInvalid] = useState<boolean>(false);
    const [isWaitingInput, setIsWaitingInput] = useState<boolean>(true);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

    /**
     * Form file and processing id (upload step)
     */
    const [file, setFile] = useState<File | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [uploadFileFunction, setUploadFileFunction] = useState<UploadFileFunction | null>(null);

    /**
     * Form configuration step
     */
    const [wrapper, setWrapper] = useState<Wrapper | null>(null);
    const [wrapperParameter, setWrapperParameter] = useState<string | null>(null);
    const [flowId, setFlowId] = useState<string | null>(null);

    /**
     * Form validation step
     */
    const [email, setEmail] = useState<string | null>(null);

    /**
     * Form confirmation step
     */
    const [startingStatus, setStartingStatus] = useState<202 | 400 | 409 | 428 | 500 | null>(null);

    /**
     * Get wrapper available
     */
    const operations = useQueries({
        queries: [
            {
                queryKey: ['wrapper'],
                queryFn: wrapperService,
                staleTime: 3600000, // 1 hour of cache
                gcTime: 3600000, // 1000 * 60 * 60
            },
        ],
        combine: (results) => {
            return {
                data: { wrapper: results[0].data },
                pending: results.some((result) => result.isPending),
            };
        },
    });

    /**
     * Start the processing
     */
    const { data: startResponse, isPending: startPending } = useQuery({
        queryKey: ['start', step, processingId, wrapper, email, wrapperParameter, flowId],
        queryFn: () => {
            if (step !== PROCESSING_CONFIRMATION_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (!processingId || !wrapper) {
                return null;
            }

            return start({
                id: processingId,
                wrapper: wrapper,
                wrapperParam: wrapperParameter ?? undefined,
                mail: email,
                flowId: flowId ?? undefined,
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
            // Add JSONL support (no standard MIME type, so we add it manually)
            if (mimeType.includes('application/json')) {
                mimeType.push('application/jsonl');
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
            const fileName = file.name.toLowerCase();
            const isJsonl = fileName.endsWith('.jsonl');
            const detectedMimeType = isJsonl ? 'application/jsonl' : (mimeTypes.getType(file.name) ?? '');
            
            return list.filter((entry) => {
                return entry.fileType.includes(detectedMimeType);
            });
        }

        return list;
    }, [file, operations.data.wrapper]);

    // Fields are no longer needed here as they are managed in ProcessingFormUpload
    const fields = null;

    /**
     * Listen for network call and update the state
     */
    useEffect(() => {
        setIsPending(operations.pending || startPending);
    }, [operations.pending, startPending]);


    // État pour stocker le nom du fichier récupéré de l'API
    const [fileNameFromApi, setFileNameFromApi] = useState<string | null>(null);

    /**
     * Initialize the form with URL parameters if they exist
     */
    useEffect(() => {
        if (idFromUrl && stepFromUrl === '4') {
            setProcessingId(idFromUrl);
            setStep(PROCESSING_CONFIRMATION_STEP);

            // Récupérer uniquement le nom du fichier
            const fetchFileName = async () => {
                try {
                    const processingInfo = await getProcessingInfo(idFromUrl);
                    if (processingInfo) {
                        // Stocker le nom du fichier dans un état dédié
                        setFileNameFromApi(processingInfo.originalName);
                    }
                } catch (error) {
                    console.error('Error fetching processing info:', error);
                }
            };

            fetchFileName();
        }
    }, [idFromUrl, stepFromUrl]);

    /**
     * Update button state when step changes
     */
    useEffect(() => {
        if (step === PROCESSING_FORMAT_STEP) {
            setIsWaitingInput(!selectedFormat);
            setIsInvalid(false);
        } else if (step === PROCESSING_UPLOAD_STEP) {
            const fileIsValid = file !== null && !isInvalid;
            setIsWaitingInput(!fileIsValid);
        } else if (step === PROCESSING_CONFIGURATION_STEP) {
            // Pour CSV, JSON et JSONL, un champ doit être sélectionné
            const needsFieldSelection = selectedFormat === 'csv' || selectedFormat === 'json' || selectedFormat === 'jsonl';
            setIsWaitingInput(!wrapper || (needsFieldSelection && !wrapperParameter));
            setIsInvalid(false);
        } else if (step === PROCESSING_VALIDATION_STEP) {
            // L'email est optionnel
            setIsWaitingInput(false);
            setIsInvalid(false); // Pas d'invalidation car géré par le composant ProcessingFormEmail
        }
    }, [step, selectedFormat, file, wrapper, email, isInvalid, wrapperParameter]);

    /**
     * Listen for start response
     */
    useEffect(() => {
        setStartingStatus(startResponse ?? null);
    }, [startResponse]);

    /**
     * Handle the next button
     */
    const handleNext = useCallback(async () => {
        let invalid = false;
        let waiting = true;
        let nextStep = step + 1;

        // For upload step, trigger the upload when user clicks "Suivant"
        if (step === PROCESSING_UPLOAD_STEP) {
            if (uploadFileFunction && !processingId) {
                setIsPending(true);
                try {
                    const id = await uploadFileFunction();
                    if (id) {
                        setProcessingId(id);
                        nextStep = PROCESSING_CONFIGURATION_STEP;
                    } else {
                        // Upload failed
                        setIsPending(false);
                        return;
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    setIsPending(false);
                    return;
                } finally {
                    setIsPending(false);
                }
            } else if (processingId) {
                // Already uploaded, move to next step
                nextStep = PROCESSING_CONFIGURATION_STEP;
            } else {
                return;
            }
        }

        if (nextStep === PROCESSING_VALIDATION_STEP) {
            // L'email est optionnel
            waiting = false;
            invalid = false;
        }

        if (nextStep === PROCESSING_CONFIRMATION_STEP) {
            waiting = false;
        }

        if (step === PROCESSING_CONFIRMATION_STEP) {
            setFile(null);
            setProcessingId(null);
            setUploadFileFunction(null);
            setWrapper(null);
            setWrapperParameter(null);
            setFlowId(null);
            setSelectedFormat(null);
            setIsWaitingInput(true);
            nextStep = PROCESSING_FORMAT_STEP;
        }

        setIsInvalid(invalid);
        setIsWaitingInput(waiting);
        setStep(nextStep);
    }, [step, uploadFileFunction, processingId]);

    /**
     * Handle file change
     * @param value newly add file
     * @param isValid indicates if the file is valid (correct MIME type and format)
     */
    const handleUploadChange = useCallback((value: File | null, isValid: boolean) => {
        setFile(value);
        setIsWaitingInput(!isValid);
        setIsInvalid(value !== null && !isValid);
        // Reset processing ID when file changes
        if (value === null) {
            setProcessingId(null);
        }
    }, []);

    /**
     * Handle upload function ready from upload component
     * @param uploadFn function to call to upload the file
     */
    const handleUploadReady = useCallback((uploadFn: UploadFileFunction) => {
        setUploadFileFunction(() => uploadFn);
    }, []);

    /**
     * Handle configuration change
     * @param value newly selected wrapper, wrapperParameter and enrichment
     */
    const handleConfigurationChange = useCallback((value: ProcessingFormConfigurationValueType) => {
        setWrapper(value.wrapper);
        setWrapperParameter((prev) => {
            if (value.wrapperParameter && value.wrapperParameter !== prev) {
                return value.wrapperParameter;
            }
            return prev;
        });
        setFlowId(value.flowId);
        setIsWaitingInput(false);
    }, []);

    /**
     * Handle email change
     * @param value newly added email
     */
    const handleEmailChange = useCallback((value: string | null) => {
        setEmail(value);
        // L'email est optionnel et la validation est gérée par ProcessingFormEmail
        setIsWaitingInput(false);
        setIsInvalid(false);
    }, []);

    const handleBack = useCallback(() => {
        let previousStep = step - 1;

        // Handle return from config step
        if (step === PROCESSING_CONFIGURATION_STEP) {
            previousStep = PROCESSING_UPLOAD_STEP;
        }

        // Update isWaitingInput and isInvalid based on the previous step
        if (previousStep === PROCESSING_FORMAT_STEP) {
            setIsWaitingInput(!selectedFormat);
            setIsInvalid(false);
        } else if (previousStep === PROCESSING_UPLOAD_STEP) {
            const fileIsValid = file !== null && !isInvalid;
            setIsWaitingInput(!fileIsValid);
            } else if (previousStep === PROCESSING_CONFIGURATION_STEP) {
            setIsWaitingInput(!wrapper);
            setIsInvalid(false);
        } else if (previousStep === PROCESSING_VALIDATION_STEP) {
            // L'email est optionnel
            setIsWaitingInput(false);
            setIsInvalid(false);
        }

        setStep(previousStep);
    }, [step, selectedFormat, file, wrapper, isInvalid]);

    const handleFormatChange = useCallback((format: string) => {
        setSelectedFormat(format);
        setIsWaitingInput(false);
    }, []);

    /**
     * Handle fields change (CSV column selection)
     */
    const handleFieldsChange = useCallback(
        (selectedFields: string[]) => {
            if (selectedFields && selectedFields.length > 0) {
                setWrapperParameter(selectedFields[0]);
                if (step === PROCESSING_CONFIGURATION_STEP) {
                    setIsWaitingInput(false);
                }
            }
        },
        [step],
    );

    return (
        <div id="processing-form">
            <Button
                onClick={handleHomeReturn}
                startIcon={<KeyboardBackspaceIcon />}
                className="back-button"
                sx={{ color: '#4a4a4a' }}
            >
                RETOUR À L&apos;ACCUEIL
            </Button>
            <h1>Traiter un {type === 'corpus' ? 'corpus' : 'article'}</h1>

            <div className="processing-form-layout">
                {/* Visual stepper use to indicate the current step of the form */}
                <div className="stepper-container">
                    <ProcessingFormStepper step={step} />
                </div>

                {/* Content of the form */}
                <div id="processing-form-content">
                    <div className="form-content">
                        {/* Back button */}
                        {step > PROCESSING_FORMAT_STEP && step !== PROCESSING_CONFIRMATION_STEP ? (
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                className="back-button"
                                sx={{ alignSelf: 'flex-start', marginBottom: 2 }}
                            >
                                RETOUR
                            </Button>
                        ) : null}

                        {/* Format step */}
                        {step === PROCESSING_FORMAT_STEP ? (
                            <ProcessingFormFormat
                                onChange={handleFormatChange}
                                value={selectedFormat}
                                type={type as 'article' | 'corpus'}
                            />
                        ) : null}

                        {/* Upload step */}
                        {step === PROCESSING_UPLOAD_STEP ? (
                            <ProcessingFormUpload
                                mimes={mimes}
                                value={file}
                                onChange={handleUploadChange}
                                isOnError={false}
                                isPending={isPending}
                                selectedFormat={selectedFormat}
                                onFieldsChange={handleFieldsChange}
                                onUploadReady={handleUploadReady}
                            />
                        ) : null}

                        {/* Configuration step */}
                        {step === PROCESSING_CONFIGURATION_STEP ? (
                            <ProcessingFormConfiguration
                                wrapperList={wrapperList}
                                fields={fields}
                                value={{
                                    wrapper,
                                    wrapperParameter: wrapperParameter,
                                    inputFormat: selectedFormat,
                                    flowId,
                                }}
                                onChange={handleConfigurationChange}
                                isPending={isPending}
                                onValidityChange={(isValid) => {
                                    setIsWaitingInput(!isValid);
                                }}
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
                                fileName={fileNameFromApi || file?.name || ''}
                                status={startingStatus}
                                isPending={isPending}
                                flowId={flowId}
                            />
                        ) : null}
                    </div>

                    {/* Navigation button */}
                    {!isPending && step !== PROCESSING_CONFIRMATION_STEP ? (
                        <div id="processing-form-navigation">
                            <Button
                                onClick={handleNext}
                                variant="outlined"
                                size="large"
                                disabled={isInvalid || isWaitingInput}
                            >
                                Suivant
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
            <ProcessingExample currentStep={step} />
        </div>
    );
};

export default ProcessingCreationForm;
