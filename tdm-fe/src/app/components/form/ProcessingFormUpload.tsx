import './scss/ProcessingFormUpload.scss';
import FileUpload from '~/app/components/progress/FileUpload';

import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type React from 'react';

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
        return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

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
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && mimes.includes(mimeTypes.getType(droppedFile.name) ?? '')) {
                handleFileChange(droppedFile);
            }
        },
        [handleFileChange, mimes],
    );

    if (isPending || isOnError) {
        return <FileUpload showError={isOnError} />;
    }

    return (
        <div className="processing-form-upload">
            <div className="upload-container">
                <h3>Téléverser votre fichier</h3>
                <div
                    className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {!file ? (
                        <>
                            <DescriptionIcon className="file-icon" />
                            <p>Faites glisser votre fichier ou</p>
                            <MuiFileInput
                                className="file-input"
                                value={file}
                                onChange={handleFileChange}
                                error={isInvalid ? hasAttemptedUpload : false}
                                hideSizeText
                                inputProps={{
                                    accept: stringifiesMineTypes,
                                }}
                                InputProps={{
                                    sx: { display: 'none' },
                                }}
                            />
                            <Button
                                variant="contained"
                                component="label"
                                onClick={() => {
                                    (document.querySelector('.file-input input') as HTMLInputElement)?.click();
                                }}
                                sx={{
                                    textTransform: 'none'
                                }}
                            >
                                Parcourir vos fichiers
                            </Button>
                        </>
                    ) : (
                        <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <div className="file-actions">
                                <span className="file-size">{formatFileSize(file.size)}</span>
                                <Button
                                    className="remove-file"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFileChange(null);
                                    }}
                                >
                                    <CloseIcon />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                {isInvalid && hasAttemptedUpload ? (
                    <div className="error-message">
                        Le fichier ne correspond pas à un format compatible, utilisez l&apos;un de ces formats :{' '}
                        {stringifiesMineTypes}.
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(ProcessingFormUpload);
