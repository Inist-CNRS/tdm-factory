import '~/app/components/form/scss/ProcessingFormCommon.scss';
import '~/app/components/form/scss/ProcessingFormConfiguration.scss';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import Markdown from '~/app/components/text/Markdown';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type { SyntheticEvent, FocusEvent } from 'react';
import type { Enrichment, ProcessingFields, Wrapper } from '~/app/shared/data.types';

export type ProcessingFormConfigurationValueType = {
    wrapper: Wrapper | null;
    wrapperParam: string | null;
    enrichment: Enrichment | null;
};

type ProcessingFormConfigurationProps = {
    wrapperList: Wrapper[];
    enrichmentList: Enrichment[];
    fields: ProcessingFields | null;
    isPending: boolean;
    value: ProcessingFormConfigurationValueType;
    onChange: (value: ProcessingFormConfigurationValueType) => void;
};

const getWrapperParamDescription = (wrapper: Required<Wrapper>) => {
    const defaultReturn = 'Nom du champ à exploiter comme identifiant de ligne (par défaut value)';
    if (wrapper.parameters.length === 0) {
        return defaultReturn;
    }

    const wrapperParamDescription = wrapper.parameters.find((value) => value.name === 'value');

    if (wrapperParamDescription && wrapperParamDescription.displayName) {
        return wrapperParamDescription.displayName;
    }

    return defaultReturn;
};

const ProcessingFormConfiguration = ({
    wrapperList,
    enrichmentList,
    fields,
    isPending,
    value,
    onChange,
}: ProcessingFormConfigurationProps) => {
    const [wrapper, setWrapper] = useState<Wrapper | null>(value.wrapper);
    const [wrapperParam, setWrapperParam] = useState<string>(value.wrapperParam ?? '');
    const [enrichment, setEnrichment] = useState<Enrichment | null>(value.enrichment);

    const cleanFields = useMemo(() => {
        if (fields && fields.fields) {
            return fields.fields;
        }
        return [];
    }, [fields]);

    useEffect(() => {
        let invalid = false;

        // Check wrapper
        if (wrapperList && !wrapperList.find((entry) => entry.url === wrapper?.url)) {
            invalid = true;
        }

        // Check wrapper param
        if (wrapperParam === null || wrapperParam === undefined) {
            invalid = true;
        }

        // Check enrichment
        if (enrichmentList && !enrichmentList.find((entry) => entry.url === enrichment?.url)) {
            invalid = true;
        }

        if (!invalid) {
            onChange({
                wrapper,
                wrapperParam,
                enrichment,
            });
        }
    }, [enrichment, enrichmentList, onChange, wrapper, wrapperList, wrapperParam]);

    const handleWrapperChange = useCallback((_: SyntheticEvent, newWrapper: Wrapper | null) => {
        setWrapper(newWrapper);
    }, []);

    const handleWrapperParamChange = useCallback((_: SyntheticEvent, newWrapperParam: string | null) => {
        setWrapperParam(newWrapperParam ?? '');
    }, []);

    const handleWrapperParamBlur = useCallback((event: FocusEvent) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setWrapperParam(event.target.value ?? '');
    }, []);

    const handleEnrichmentChange = useCallback((_: SyntheticEvent, newEnrichment: Enrichment | null) => {
        setEnrichment(newEnrichment);
    }, []);

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
                {wrapper && wrapper.parameters ? (
                    <div id="processing-form-wrapper-param">
                        <div id="processing-form-wrapper-param-style"></div>
                        <Autocomplete
                            className="processing-form-field"
                            value={wrapperParam}
                            onChange={handleWrapperParamChange}
                            onBlur={handleWrapperParamBlur}
                            options={cleanFields}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={getWrapperParamDescription(wrapper as Required<Wrapper>)}
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

export default memo(ProcessingFormConfiguration);
