import './scss/ProcessingFormUpload.scss';
import FileUpload from '~/app/components/progress/FileUpload';

import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
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
    selectedFormat?: string | null;
};

const ProcessingFormUpload = ({ mimes, value, isOnError, isPending, onChange, selectedFormat }: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [isInvalid, setIsInvalid] = useState(false);
    const [formatError, setFormatError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);

    const stringifiesMineTypes = useMemo(() => {
        return mimes.join(', ');
    }, [mimes]);

    const checkFileFormat = useCallback((file: File | null, format: string | null | undefined): boolean => {
        if (!file || !format) return true;

        const fileName = file.name.toLowerCase();
        const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);

        if (format === 'istex.tar.gz' || format === 'tei.tar.gz') {
            // Vérifier les différentes variantes d'archives compressées
            return fileName.endsWith('.tar.gz') ||
                   fileName.endsWith('.tgz') ||
                   fileName.endsWith('.targz');
        }

        return fileName.endsWith('.' + format);
    }, []);

    useEffect(() => {
        let invalid = false;
        let wrongFormat = false;

        if (file) {
            if (!mimes.includes(mimeTypes.getType(file.name) ?? '')) {
                invalid = true;
            }
            
            if (selectedFormat && !checkFileFormat(file, selectedFormat)) {
                wrongFormat = true;
            }

            setHasAttemptedUpload(true);
        }

        setIsInvalid(invalid);
        setFormatError(wrongFormat);
        onChange(file, file !== null && !invalid && !wrongFormat);
    }, [file, mimes, onChange, selectedFormat, checkFileFormat]);

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
                                    textTransform: 'none',
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
                {hasAttemptedUpload && (isInvalid || formatError) ? (
                    <div className="error-message">
                        {isInvalid ? (
                            <p>Le fichier ne correspond pas à un format compatible, utilisez l&apos;un de ces formats : {stringifiesMineTypes}.</p>
                        ) : null}
                        {formatError ? (
                            <p>
                                Le fichier ne correspond pas au format sélectionné ({selectedFormat}).
                                {selectedFormat && (selectedFormat.includes('tar.gz') || selectedFormat.includes('tgz')) ? (
                                    <span> Les formats acceptés sont : .tar.gz, .tgz, .targz</span>
                                ) : (
                                    <span> Le fichier doit avoir l&apos;extension .{selectedFormat}</span>
                                )}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(ProcessingFormUpload);
