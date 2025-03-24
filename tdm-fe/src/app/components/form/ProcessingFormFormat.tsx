import { FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useCallback, memo } from 'react';

import type React from 'react';
import './scss/ProcessingFormFormat.scss';

type ProcessingFormFormatProps = {
    onChange: (format: string) => void;
    value: string | null;
};

const ProcessingFormFormat = ({ onChange, value }: ProcessingFormFormatProps) => {
    const handleFormatChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        },
        [onChange],
    );

    return (
        <>
            <Typography variant="h3" gutterBottom>
                Choisir le format de votre corpus
            </Typography>
            <div className="processing-form-format">
                <FormControl component="fieldset">
                    <RadioGroup
                        aria-label="format"
                        name="format"
                        onChange={handleFormatChange}
                        value={value || ''}
                    >
                        <FormControlLabel value="istex" control={<Radio />} label="Corpus Istex (tar.gz)" />
                        <FormControlLabel value="text" control={<Radio />} label="Corpus de documents textes (tar.gz)" />
                        <FormControlLabel value="csv" control={<Radio />} label="Tableur (.csv)" />
                    </RadioGroup>
                </FormControl>
            </div>
        </>
    );
};

export default memo(ProcessingFormFormat);
