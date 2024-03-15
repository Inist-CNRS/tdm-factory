import '~/app/components/form/scss/ProcessingFormCommon.scss';
import '~/app/components/form/scss/ProcessingFormConfiguration.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useContext } from 'react';
import type { SyntheticEvent, ChangeEvent } from 'react';
import type { Enrichment, Wrapper } from '~/app/shared/data.types';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import Markdown from '~/app/components/text/Markdown';
import { ProcessingFormContext } from '~/app/provider/ProcessingFormContextProvider';

const ProcessingFormConfiguration = () => {
    const {
        wrapperList,
        enrichmentList,
        wrapper,
        setWrapper,
        wrapperParam,
        setWrapperParam,
        enrichment,
        setEnrichment,
    } = useContext(ProcessingFormContext);

    /**
     * Handle event from wrapper selection
     */
    const handleWrapperChange = (_: SyntheticEvent, newWrapper: Wrapper | null) => {
        setWrapper(newWrapper);
    };

    const handleWrapperParamChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setWrapperParam(event.target.value);
    };

    const handleEnrichmentChange = (_: SyntheticEvent, newEnrichment: Enrichment | null) => {
        setEnrichment(newEnrichment);
    };

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
                        disablePortal
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
                    value={enrichment}
                    onChange={handleEnrichmentChange}
                    options={enrichmentList}
                    renderInput={(params) => <TextField {...params} label="Traitement" />}
                    fullWidth
                    disablePortal
                />
                {enrichment ? (
                    <Markdown className="text processing-form-field-label" text={enrichment.description} />
                ) : null}
            </div>
        </>
    );
};

export default ProcessingFormConfiguration;
