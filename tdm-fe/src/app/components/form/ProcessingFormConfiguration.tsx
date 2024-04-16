import '~/app/components/form/scss/ProcessingFormCommon.scss';
import '~/app/components/form/scss/ProcessingFormConfiguration.scss';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import Markdown from '~/app/components/text/Markdown';
import { ProcessingFormContext } from '~/app/provider/ProcessingFormContextProvider';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useContext, useMemo } from 'react';

import type { SyntheticEvent, FocusEvent } from 'react';
import type { Enrichment, Wrapper } from '~/app/shared/data.types';

const ProcessingFormConfiguration = () => {
    const {
        wrapperList,
        enrichmentList,
        fields,
        wrapper,
        setWrapper,
        wrapperParam,
        setWrapperParam,
        enrichment,
        setEnrichment,
        isPending,
    } = useContext(ProcessingFormContext);

    const cleanFields = useMemo(() => {
        if (fields && fields.fields) {
            return fields.fields;
        }
        return [];
    }, [fields]);

    /**
     * Handle event from wrapper selection
     */
    const handleWrapperChange = (_: SyntheticEvent, newWrapper: Wrapper | null) => {
        setWrapper(newWrapper);
    };

    const handleWrapperParamChange = (_: SyntheticEvent, newWrapperParam: string | null) => {
        setWrapperParam(newWrapperParam);
    };

    const handleEnrichmentChange = (_: SyntheticEvent, newEnrichment: Enrichment | null) => {
        setEnrichment(newEnrichment);
    };

    /**
     * Show a loading box will wait for the operations to be fetched
     */
    if (isPending) {
        return <CircularWaiting />;
    }

    return (
        <>
            {/* Wrapper input */}
            <div className="processing-form-field-group">
                {/* Wrapper selection */}
                <div className="processing-form-field-with-label">
                    <Autocomplete
                        className="processing-form-field"
                        value={wrapper}
                        onChange={handleWrapperChange}
                        options={wrapperList}
                        renderInput={(params) => <TextField {...params} label="Convertisseur" />}
                        fullWidth
                    />
                    {wrapper ? (
                        <div id="processing-form-wrapper-label">
                            <div id="processing-form-wrapper-label-style"></div>
                            <Markdown className="text processing-form-field-label" text={wrapper.description} />
                        </div>
                    ) : null}
                </div>
                {/* Wrapper param */}
                {wrapper ? (
                    <div id="processing-form-wrapper-param">
                        <div id="processing-form-wrapper-param-style"></div>
                        <Autocomplete
                            className="processing-form-field"
                            value={wrapperParam ?? ''}
                            onChange={handleWrapperParamChange}
                            onBlur={(event: unknown) => {
                                handleWrapperParamChange(
                                    {} as unknown as SyntheticEvent,
                                    (event as FocusEvent<HTMLInputElement | HTMLTextAreaElement>).target.value,
                                );
                            }}
                            options={cleanFields}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Nom du champ à exploiter comme identifiant de ligne (par défaut value)"
                                />
                            )}
                            fullWidth
                            freeSolo
                            disableClearable
                        />
                    </div>
                ) : null}
            </div>
            {/* Enrichment input */}
            <div className="processing-form-field-group processing-form-field-with-label">
                <Autocomplete
                    className="processing-form-field"
                    value={enrichment}
                    onChange={handleEnrichmentChange}
                    options={enrichmentList}
                    renderInput={(params) => <TextField {...params} label="Traitement" />}
                    fullWidth
                />
                {enrichment ? (
                    <Markdown className="text processing-form-field-label" text={enrichment.description} />
                ) : null}
            </div>
        </>
    );
};

export default ProcessingFormConfiguration;
