import '~/app/components/form/scss/ProcessingFormCommon.scss';
import '~/app/components/form/scss/ProcessingFormConfiguration.scss';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useQueries } from '@tanstack/react-query';
import { MuiFileInput } from 'mui-file-input';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { Enrichment, Wrapper } from '~/app/shared/data.types';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import { enrichment, wrapper } from '~/app/services/creation/operations';
import { colors } from '~/app/shared/theme';

const ProcessingFormConfiguration = () => {
    const [file, setFile] = useState<File | null>(null);
    const [selectedWrapper, setSelectedWrapper] = useState<Wrapper | null>(null);
    const [wrapperParam, setWrapperParam] = useState<string | null>(null);
    const [selectedEnrichment, setSelectedEnrichment] = useState<Enrichment | null>(null);

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

    const handleFileChange = (value: File | null) => {
        setFile(value);
    };

    const handleWrapperChange = (_: SyntheticEvent, value: Wrapper | null) => {
        setSelectedWrapper(value);
    };

    const handleEnrichmentChange = (_: SyntheticEvent, value: Enrichment | null) => {
        setSelectedEnrichment(value);
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
        return <div id="processing-form-configuration">error</div>;
    }

    return (
        <div id="processing-form-configuration">
            <MuiFileInput
                className="processing-form-field processing-form-field-group"
                placeholder="Déposer un fichier"
                value={file}
                onChange={handleFileChange}
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
            <div className="processing-form-field-group">
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
                        <div className="text processing-form-field-label">{selectedWrapper.description}</div>
                    ) : null}
                </div>
                {selectedWrapper ? (
                    <div id="processing-form-wrapper-param">
                        <div id="processing-form-wrapper-param-style"></div>
                        <TextField
                            className="processing-form-field"
                            label="Nom du champ à exploiter comme identifiant de ligne (par défaut value)"
                            fullWidth
                        />
                    </div>
                ) : null}
            </div>
            <Autocomplete
                className="processing-form-field"
                value={selectedEnrichment}
                onChange={handleEnrichmentChange}
                options={operations.data.enrichment}
                renderInput={(params) => <TextField {...params} label="Traitement" />}
                fullWidth
                disablePortal
            />
        </div>
    );
};

export default ProcessingFormConfiguration;
