import FileUpload from '~/app/components/progress/FileUpload';
import { colors } from '~/app/shared/theme';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

type ProcessingFormUploadProps = {
    mimes: string[];
    value: File | null;
    isOnError: boolean;
    isPending: boolean;
    onChange: (value: File | null) => void;
};

const ProcessingFormUpload = ({ mimes, value, isOnError, isPending, onChange }: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [isInvalid, setIsInvalid] = useState(false);

    const stringifiesMineTypes = useMemo(() => {
        return mimes.join(', ');
    }, [mimes]);

    useEffect(() => {
        let invalid = false;

        if (!file || !mimes.includes(mimeTypes.getType(file.name) ?? '')) {
            invalid = true;
        }

        setIsInvalid(invalid);
        if (!invalid) {
            onChange(file);
        }
    }, [file, mimes, onChange]);

    const handleFileChange = useCallback((newFile: File | null) => {
        setFile(newFile);
    }, []);

    if (isPending || isOnError) {
        return <FileUpload showError={isOnError} />;
    }

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <MuiFileInput
                className="processing-form-field"
                placeholder="Déposer un fichier"
                value={file}
                onChange={handleFileChange}
                error={isInvalid}
                fullWidth
                clearIconButtonProps={{
                    children: <CloseIcon fontSize="small" />,
                }}
                inputProps={{
                    accept: stringifiesMineTypes,
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
            {isInvalid ? (
                <div className="text processing-form-field-label error">
                    {!file ? (
                        <>Fichier manquant</>
                    ) : (
                        <>
                            Le fichier ne correspond pas à un format compatible, utilisez l&apos;un de ces formats :{' '}
                            {stringifiesMineTypes}.
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default memo(ProcessingFormUpload);
