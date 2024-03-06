import '~/app/components/form/scss/ProcessingFormCommon.scss';
import '~/app/components/form/scss/ProcessingFormConfiguration.scss';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useQueries } from '@tanstack/react-query';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { memo, useState } from 'react';
import type { SyntheticEvent, ChangeEvent } from 'react';
import type { Enrichment, Wrapper } from '~/app/shared/data.types';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import Markdown from '~/app/components/text/Markdown';
import { enrichment, wrapper } from '~/app/services/creation/operations';
import { colors } from '~/app/shared/theme';

type Configuration = {
    file: File | null;
    wrapper: Wrapper | null;
    wrapperParam: string | null;
    enrichment: Enrichment | null;
};

export type ChangeConfiguration = Configuration & {
    invalidState: boolean;
};

export type ProcessingFormConfigurationProps = {
    value: Partial<Configuration>;
    onChange: (configuration: ChangeConfiguration) => void;
};

const ProcessingFormConfiguration = ({ value = {}, onChange }: ProcessingFormConfigurationProps) => {
    const { file: fileIn, wrapper: wrapperIn, wrapperParam: wrapperParamIn, enrichment: enrichmentIn } = value;
    const [file, setFile] = useState<File | null>(fileIn ?? null);
    const [selectedWrapper, setSelectedWrapper] = useState<Wrapper | null>(wrapperIn ?? null);
    const [wrapperParam, setWrapperParam] = useState<string | null>(wrapperParamIn ?? null);
    const [selectedEnrichment, setSelectedEnrichment] = useState<Enrichment | null>(enrichmentIn ?? null);
    const [error, setError] = useState<{
        file: boolean;
        wrapper: boolean;
        enrichment: boolean;
    }>({
        file: false,
        wrapper: false,
        enrichment: false,
    });

    /**
     * Get a wrapper and enrichment list
     */
    const operations = useQueries({
        queries: [
            {
                queryKey: ['wrapper'],
                queryFn: wrapper,
                staleTime: 3600000, // 1 hour of cache
                gcTime: 3600000, // 1000 * 60 * 60
            },
            {
                queryKey: ['enrichment'],
                queryFn: enrichment,
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

    const handleChange = (configuration: Configuration) => {
        let invalidState = false;
        const newError = {
            file: false,
            wrapper: false,
            enrichment: false,
        };

        if (!configuration.wrapper) {
            newError.wrapper = true;
            invalidState = true;
        }

        if (!configuration.enrichment) {
            newError.enrichment = true;
            invalidState = true;
        }

        if (!configuration.file) {
            newError.file = true;
            invalidState = true;
        }

        if (configuration.wrapper && configuration.file) {
            if (configuration.wrapper.fileType.includes('application/x-gzip')) {
                configuration.wrapper.fileType.push('application/gzip');
            }

            if (!configuration.wrapper.fileType.includes(mimeTypes.getType(configuration.file.name) ?? '')) {
                newError.file = true;
                invalidState = true;
            }
        }

        setError(newError);
        onChange({
            file: configuration.file,
            wrapper: configuration.wrapper,
            wrapperParam: configuration.wrapperParam,
            enrichment: configuration.enrichment,
            invalidState,
        });
    };

    /**
     * Handle event from file input
     */
    const handleFileChange = (newFile: File | null) => {
        setFile(newFile);
        handleChange({
            file: newFile,
            wrapper: selectedWrapper,
            wrapperParam: wrapperParam,
            enrichment: selectedEnrichment,
        });
    };

    /**
     * Handle event from wrapper selection
     */
    const handleWrapperChange = (_: SyntheticEvent, newWrapper: Wrapper | null) => {
        setSelectedWrapper(newWrapper);
        handleChange({
            file,
            wrapper: newWrapper,
            wrapperParam: wrapperParam,
            enrichment: selectedEnrichment,
        });
    };

    const handleWrapperParamChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setWrapperParam(event.target.value);
        handleChange({
            file,
            wrapper: selectedWrapper,
            wrapperParam: event.target.value,
            enrichment: selectedEnrichment,
        });
    };

    const handleEnrichmentChange = (_: SyntheticEvent, newEnrichment: Enrichment | null) => {
        setSelectedEnrichment(newEnrichment);
        handleChange({
            file,
            wrapper: selectedWrapper,
            wrapperParam: wrapperParam,
            enrichment: newEnrichment,
        });
    };

    /**
     * Show a loading box will wait for the operations to be fetched
     */
    if (operations.pending) {
        return <CircularWaiting />;
    }

    /**
     * Show an error if we get empty operations
     */
    if (!operations.data.wrapper || !operations.data.enrichment) {
        return <Alert severity="error">Nous parvenos pas a contacté le serveur, merci de résayer utererment.</Alert>;
    }

    return (
        <div>
            {/* File input */}
            <div className="processing-form-field-group processing-form-field-with-label">
                <MuiFileInput
                    className="processing-form-field"
                    placeholder="Déposer un fichier"
                    value={file}
                    onChange={handleFileChange}
                    error={error.file}
                    fullWidth
                    clearIconButtonProps={{
                        children: <CloseIcon fontSize="small" />,
                    }}
                    InputProps={{
                        startAdornment: <AttachFileIcon />,
                    }}
                    sx={{
                        '& .MuiFileInput-placeholder': {
                            color: `${colors.lightBlack} !important`,
                        },
                    }}
                />
                {error.file ? (
                    <div className="text processing-form-field-label error">
                        {!file ? (
                            <>Fichier manquant</>
                        ) : (
                            <>
                                Le fichier n&apos;est pas compatible avec le convertisseur, utilisez le type{' '}
                                {selectedWrapper?.fileType.join(', ')}.
                            </>
                        )}
                    </div>
                ) : null}
            </div>
            {/* Wrapper input */}
            <div className="processing-form-field-group">
                {/* Wrapper selection */}
                <div className="processing-form-field-with-label">
                    <Autocomplete
                        className="processing-form-field"
                        value={selectedWrapper}
                        onChange={handleWrapperChange}
                        options={operations.data.wrapper}
                        renderInput={(params) => <TextField {...params} label="Convertisseur" />}
                        fullWidth
                        disablePortal
                    />
                    {selectedWrapper ? (
                        <div id="processing-form-wrapper-label">
                            <div id="processing-form-wrapper-label-style"></div>
                            <Markdown className="text processing-form-field-label" text={selectedWrapper.description} />
                        </div>
                    ) : null}
                </div>
                {/* Wrapper param */}
                {selectedWrapper ? (
                    <div id="processing-form-wrapper-param">
                        <div id="processing-form-wrapper-param-style"></div>
                        <TextField
                            value={wrapperParam}
                            onChange={handleWrapperParamChange}
                            className="processing-form-field"
                            label="Nom du champ à exploiter comme identifiant de ligne (par défaut value)"
                            fullWidth
                        />
                    </div>
                ) : null}
            </div>
            {/* Enrichment input */}
            <div className="processing-form-field-group processing-form-field-with-label">
                <Autocomplete
                    className="processing-form-field"
                    value={selectedEnrichment}
                    onChange={handleEnrichmentChange}
                    options={operations.data.enrichment}
                    renderInput={(params) => <TextField {...params} label="Traitement" />}
                    fullWidth
                    disablePortal
                />
                {selectedEnrichment ? (
                    <Markdown className="text processing-form-field-label" text={selectedEnrichment.description} />
                ) : null}
            </div>
        </div>
    );
};

export default memo(ProcessingFormConfiguration);
