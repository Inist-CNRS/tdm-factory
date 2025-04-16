import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Collapse } from '@mui/material';
import { useCallback, memo, useState } from 'react';

import type React from 'react';
import './scss/ProcessingFormFormat.scss';

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStaticConfig } from '~/app/services/config';
import Markdown from '~/app/components/text/Markdown';

type ProcessingFormFormatProps = {
    onChange: (format: string) => void;
    value: string | null;
    type?: 'article' | 'corpus';
};

const ProcessingFormFormat = ({ onChange, value, type: propType }: ProcessingFormFormatProps) => {
    const { type: paramType } = useParams();
    const type = propType || paramType;
    const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
    });

    const handleFormatChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        },
        [onChange],
    );

    const handleFormatClick = useCallback(
        (format: string, event: React.MouseEvent) => {
            const label = (event.currentTarget as HTMLElement).querySelector('.MuiFormControlLabel-root');
            if (!label) {
                return;
            }

            const rect = label.getBoundingClientRect();
            const rightEdge = rect.right - 40;

            if (event.clientX > rightEdge) {
                event.preventDefault();
                event.stopPropagation();
                setExpandedFormat(expandedFormat === format ? null : format);
            }
        },
        [expandedFormat],
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        console.error('Error loading configuration:', error);
        return <div>Error loading configuration</div>;
    }

    if (!config || !config.inputFormat2labels) {
        return <div>No configuration data available</div>;
    }

    // Filtrer les formats disponibles en fonction du type (corpus ou article)
    const availableFlows = config.flows.filter(flow => flow.input === type);
    const inputFormats: Array<string> = availableFlows
        .map(flow => flow.inputFormat)
        .reduce( // Dédoublonne les formats
            (deduplicated: Array<string>, format) => deduplicated.includes(format)
                ? deduplicated : [...deduplicated, format],
            [] as Array<string>
        );
    type FormatLabels = { summary: string; description: string };

    const availableFormats: Array<[string, FormatLabels]> = inputFormats
        .map(formatId => [formatId, config.inputFormat2labels[formatId]])
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
                            if (!labels) return null;
                            return (
                                <div
                                    key={format}
                                    className={`format-container ${expandedFormat === format ? 'expanded' : ''}`}
                                    onClick={(e) => handleFormatClick(format, e)}
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
