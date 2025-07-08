import Markdown from '~/app/components/text/Markdown';
import { getStaticConfig } from '~/app/services/config';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Collapse } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, memo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import type React from 'react';
import './scss/ProcessingFormFormat.scss';

type ProcessingFormFormatProps = {
    onChange: (format: string) => void;
    value: string | null;
    type?: 'article' | 'corpus';
    inputFormat?: string;
};

const ProcessingFormFormat = ({ onChange, value, type: propType }: ProcessingFormFormatProps) => {
    const { type: paramType } = useParams();
    const type = propType || paramType;
    const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

    const {
        data: config,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
    });

    const handleFormatChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const format = event.target.value;
            onChange(format);
            setExpandedFormat(format);
        },
        [onChange],
    );

    const handleFormatClick = useCallback(
        (format: string, event: React.MouseEvent<HTMLDivElement>) => {
            const isArrowClick = (event.target as HTMLElement).closest('.arrow-icon');
            const isRadioClick = (event.target as HTMLElement).closest('.MuiRadio-root');

            if (isArrowClick) {
                // Si on clique sur la flèche, on change uniquement l'état expanded
                setExpandedFormat(expandedFormat === format ? null : format);
            } else if (!isRadioClick) {
                // Si on clique ailleurs que sur la flèche, on change l'état expanded et on sélectionne le format
                setExpandedFormat(expandedFormat === format ? null : format);
                if (value !== format) {
                    onChange(format);
                }
            }
        },
        [expandedFormat, onChange, value],
    );

    // Sélectionner le premier format par défaut
    useEffect(() => {
        if (config && !value) {
            const availableFlows = config.flows.filter((flow) => flow.input === type);
            const inputFormats = availableFlows
                .map((flow) => flow.inputFormat)
                .reduce(
                    (deduplicated: string[], format) =>
                        deduplicated.includes(format) ? deduplicated : [...deduplicated, format],
                    [] as string[],
                );

            if (inputFormats.length > 0) {
                const firstFormat = inputFormats[0];
                onChange(firstFormat);
                setExpandedFormat(firstFormat);
            }
        }
    }, [config, type, value, onChange]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading configuration</div>;
    }

    if (!config || !config.inputFormat2labels) {
        return <div>No configuration data available</div>;
    }

    // Filtrer les formats disponibles en fonction du type (corpus ou article)
    const availableFlows = config.flows.filter((flow) => flow.input === type);
    const inputFormats: string[] = availableFlows
        .map((flow) => flow.inputFormat)
        .reduce(
            (deduplicated: string[], format) =>
                deduplicated.includes(format) ? deduplicated : [...deduplicated, format],
            [] as string[],
        );

    type FormatLabels = { summary: string; description: string };

    const availableFormats: Array<[string, FormatLabels]> = inputFormats
        .map((formatId) => [formatId, config.inputFormat2labels[formatId]])
        .filter(([, format]) => format !== undefined) as Array<[string, FormatLabels]>;

    return (
        <>
            <Typography variant="h3" gutterBottom>
                Choisir le format de votre {type === 'corpus' ? 'corpus' : 'article'}
            </Typography>
            <div className="processing-form-format">
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup aria-label="format" name="format" onChange={handleFormatChange} value={value || ''}>
                        {availableFormats.map(([format, labels]) => {
                            if (!labels) {
                                return null;
                            }
                            return (
                                <div
                                    key={format}
                                    className={`format-container ${expandedFormat === format ? 'expanded' : ''}`}
                                    onClick={(e) => {
                                        handleFormatClick(format, e);
                                    }}
                                >
                                    <div className="format-label-container">
                                        <FormControlLabel
                                            value={format}
                                            control={<Radio />}
                                            label={<Markdown text={labels.summary || format} />}
                                        />
                                        <ExpandMoreIcon className="arrow-icon" />
                                    </div>
                                    <Collapse in={expandedFormat === format}>
                                        <div className="format-details">
                                            <Markdown text={labels.description || 'No description available'} />
                                        </div>
                                    </Collapse>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </FormControl>
            </div>
        </>
    );
};

export default memo(ProcessingFormFormat);
