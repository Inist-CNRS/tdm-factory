import '~/app/pages/scss/ProcessingCreationForm.scss';
import ProcessingFormConfiguration from '~/app/components/form/ProcessingFormConfiguration';
import ProcessingFormConfirmation from '~/app/components/form/ProcessingFormConfirmation';
import ProcessingFormEmail, { EMAIL_REGEX } from '~/app/components/form/ProcessingFormEmail';
import ProcessingFormFormat from '~/app/components/form/ProcessingFormFormat';
import ProcessingFormStepper from '~/app/components/form/ProcessingFormStepper';
import ProcessingFormUpload from '~/app/components/form/ProcessingFormUpload';
import ProcessingExample from '~/app/components/layout/ProcessingExample';
import { fields as fieldsService } from '~/app/services/creation/fields';
import { wrapper as wrapperService } from '~/app/services/creation/operations';
import { start } from '~/app/services/creation/processing';
import { upload } from '~/app/services/creation/upload';
import { getProcessingInfo } from '~/app/services/processing/processing-info';

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
export const PROCESSING_UPLOADING_STEP = 2;
export const PROCESSING_CONFIGURATION_STEP = 3;
export const PROCESSING_VALIDATION_STEP = 4;
export const PROCESSING_CONFIRMATION_STEP = 5;

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
    const [isOnError, setIsOnError] = useState<boolean>(false);
    const [isWaitingInput, setIsWaitingInput] = useState<boolean>(true);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

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
        queryKey: ['start', step, processingId, wrapper, email, wrapperParam],
        queryFn: () => {
            if (step !== PROCESSING_CONFIRMATION_STEP) {
                return null;
            }

            // We can't have this state due to previous check (I hate ts some time)
            if (!processingId || !wrapper || !email) {
                return null;
            }

            return start({
                id: processingId,
                wrapper: wrapper,
                wrapperParam: wrapperParam ?? undefined,
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



    const fields = useMemo(() => {
        if (!fieldsData || !fieldsData.fields) {
            return null;
        }
        return {
            fields: fieldsData.fields,
        };
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

    // État pour stocker le nom du fichier récupéré de l'API
    const [fileNameFromApi, setFileNameFromApi] = useState<string | null>(null);

    /**
     * Initialize the form with URL parameters if they exist
     */
    useEffect(() => {
        if (idFromUrl && stepFromUrl === '5') {
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
        } else if (step === PROCESSING_UPLOAD_STEP) {
            setIsWaitingInput(!file);
        } else if (step === PROCESSING_CONFIGURATION_STEP) {
            setIsWaitingInput(!wrapper);
        } else if (step === PROCESSING_VALIDATION_STEP) {
            setIsWaitingInput(!(email && EMAIL_REGEX.test(email)));
        }
    }, [step, selectedFormat, file, wrapper, email]);

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
            setFlowId(null);
            setSelectedFormat(null);
            setIsWaitingInput(true);
            nextStep = PROCESSING_FORMAT_STEP;
        }

        setIsInvalid(invalid);
        setIsWaitingInput(waiting);
        setStep(nextStep);
    }, [email, step]);

    /**
     * Handle file change
     * @param value newly add file
     * @param isValid indicates if the file is valid (correct MIME type and format)
     */
    const handleUploadChange = useCallback((value: File | null, isValid: boolean) => {
        setFile(value);
        setIsWaitingInput(!isValid);
        setIsInvalid(value !== null && !isValid);
    }, []);

    /**
     * Handle configuration change
     * @param value newly selected wrapper, wrapperParam and enrichment
     */
    const handleConfigurationChange = useCallback(
        (value: ProcessingFormConfigurationValueType) => {
            setWrapper(value.wrapper);
            setWrapperParam(value.wrapperParam);
            setFlowId(value.flowId);
            setIsWaitingInput(false);
        },
        [wrapperParam],
    );

    /**
     * Handle email change
     * @param value newly added email
     */
    const handleEmailChange = useCallback((value: string | null) => {
        setEmail(value);
        setIsWaitingInput(!value || !EMAIL_REGEX.test(value));
        setIsInvalid(!value || !EMAIL_REGEX.test(value));
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
            const isEmailValid = email && EMAIL_REGEX.test(email || '');
            setIsWaitingInput(!isEmailValid);
            setIsInvalid(!isEmailValid);
        }

        setStep(previousStep);
    }, [step, selectedFormat, file, wrapper, email, isInvalid]);

    const handleFormatChange = useCallback((format: string) => {
        setSelectedFormat(format);
        setIsWaitingInput(false);
    }, []);

    const handleFieldsChange = useCallback((fields: string[]) => {
        if (fields && fields.length > 0) {
            setWrapperParam(fields[0]);
        }
    }, []);

    return (
        <div id="processing-form">
            <Button
                onClick={handleHomeReturn}
                startIcon={<KeyboardBackspaceIcon />}
                className="back-button"
                sx={{ color: '#4a4a4a' }}
            >
                RETOUR A L'ACCUEIL
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
                                isOnError={isOnError}
                                isPending={isPending}
                                selectedFormat={selectedFormat}
                                onFieldsChange={handleFieldsChange}
                            />
                        ) : null}

                        {/* Configuration step */}
                        {step === PROCESSING_CONFIGURATION_STEP ? (
                            <ProcessingFormConfiguration
                                wrapperList={wrapperList}
                                fields={fields}
                                value={{
                                    wrapper,
                                    wrapperParam,
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
                                isPending={uploading}
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
