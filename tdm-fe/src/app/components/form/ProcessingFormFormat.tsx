import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Collapse } from '@mui/material';
import { useCallback, memo, useState } from 'react';

import type React from 'react';
import './scss/ProcessingFormFormat.scss';

type ProcessingFormFormatProps = {
    onChange: (format: string) => void;
    value: string | null;
};

const formatDetails = {
    istex: 'Pour obtenir un fichier corpus ISTEX, utiliser ISTEX Search, le format LODEX (ou au minimum les métadonnées JSON), et le format de compression .tar.gz.',
    text: 'Le format texte permet de traiter des documents textuels bruts. Les fichiers doivent être au format tar.gz.',
    csv: 'Le format CSV permet de traiter des données tabulaires. Les fichiers doivent être au format .csv.',
};

const ProcessingFormFormat = ({ onChange, value }: ProcessingFormFormatProps) => {
    const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

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

    return (
        <>
            <Typography variant="h3" gutterBottom>
                Choisir le format de votre corpus
            </Typography>
            <div className="processing-form-format">
                <FormControl component="fieldset" fullWidth>
                    <RadioGroup aria-label="format" name="format" onChange={handleFormatChange} value={value || ''}>
                        {Object.entries(formatDetails).map(([format, details]) => (
                            <div
                                key={format}
                                className={`format-container ${expandedFormat === format ? 'expanded' : ''}`}
                                onClick={(e) => {
                                    handleFormatClick(format, e as React.MouseEvent);
                                }}
                            >
                                <div className="format-label-container">
                                    <FormControlLabel
                                        value={format}
                                        control={<Radio />}
                                        label={
                                            format === 'istex'
                                                ? 'Corpus Istex (tar.gz)'
                                                : format === 'text'
                                                  ? 'Corpus de documents textes (tar.gz)'
                                                  : 'Tableur (.csv)'
                                        }
                                    />
                                    <ExpandMoreIcon className="arrow-icon" />
                                </div>
                                <Collapse in={expandedFormat === format}>
                                    <div className="format-details">{details}</div>
                                </Collapse>
                            </div>
                        ))}
                    </RadioGroup>
                </FormControl>
            </div>
        </>
    );
};

export default memo(ProcessingFormFormat);
