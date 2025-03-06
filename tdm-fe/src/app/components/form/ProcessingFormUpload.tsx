import FileUpload from '~/app/components/progress/FileUpload';
import { colors } from '~/app/shared/theme';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type React from 'react';

type ProcessingFormUploadProps = {
    mimes: string[];
    value: File | null;
    isOnError: boolean;
    isPending: boolean;
    onChange: (value: File | null, isValid: boolean) => void;
};

const ProcessingFormUpload = ({ mimes, value, isOnError, isPending, onChange }: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);

    const stringifiesMineTypes = useMemo(() => {
        return mimes.join(', ');
    }, [mimes]);

    /**
     * Check file validity and update parent component
     */
    useEffect(() => {
        let invalid = false;

        if (file) {
            if (!mimes.includes(mimeTypes.getType(file.name) ?? '')) {
                invalid = true;
            }
            setHasAttemptedUpload(true);
        }

        setIsInvalid(invalid);
        onChange(file, file !== null && !invalid);
    }, [file, mimes, onChange]);

    const handleFileChange = useCallback((newFile: File | null) => {
        setFile(newFile);
        if (newFile === null) {
            setHasAttemptedUpload(false);
        }
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileChange(e.dataTransfer.files[0]);
            }
        },
        [handleFileChange],
    );

    if (isPending || isOnError) {
        return <FileUpload showError={isOnError} />;
    }

    return (
        <div
            className={`processing-form-field-group processing-form-field-with-label ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <MuiFileInput
                className="processing-form-field"
                placeholder="Déposer un fichier ou glisser-déposer ici"
                value={file}
                onChange={handleFileChange}
                error={isInvalid ? hasAttemptedUpload : false}
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
            {isInvalid && hasAttemptedUpload ? (
                <div className="text processing-form-field-label error">
                    Le fichier ne correspond pas à un format compatible, utilisez l&apos;un de ces formats :{' '}
                    {stringifiesMineTypes}.
                </div>
            ) : null}
        </div>
    );
};

export default memo(ProcessingFormUpload);
