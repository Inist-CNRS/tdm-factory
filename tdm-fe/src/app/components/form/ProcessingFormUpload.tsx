import './scss/ProcessingFormUpload.scss';
import FileUpload from '~/app/components/progress/FileUpload';
import { getStaticConfig } from '~/app/services/config';

import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import { Button } from '@mui/material';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type React from 'react';
import type { Format } from '~/lib/config';

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
    selectedFormat: string | null;
    onChange: (value: File | null, isValid: boolean) => void;
};

const ProcessingFormUpload = ({
    mimes,
    value,
    isOnError,
    isPending,
    selectedFormat,
    onChange,
}: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);

    // Récupérer les formats depuis l'API
    const { data: config } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
        staleTime: 3600000, // 1 heure de cache
        gcTime: 3600000,
    });

    const stringifiesMineTypes = useMemo(() => {
        const mimeToExtension: Record<string, string> = {
            'application/pdf': '.pdf',
            'text/csv': '.csv',
            'application/x-gzip': '.tar.gz',
            'application/gzip': '.tar.gz',
            'text/plain': '.txt',
        };

        const extensions = mimes.map((mime) => mimeToExtension[mime] || mime).filter(Boolean);

        return extensions.length > 0 ? extensions.join(', ') : 'aucun format disponible';
    }, [mimes]);

    const acceptedMimeTypes = useMemo(() => {
        if (!selectedFormat) return mimes;

        const formatMimeMap: Record<string, string[]> = {
            'pdf': ['application/pdf'],
            'csv': ['text/csv'],
            'istex.tar.gz': ['application/gzip', 'application/x-gzip'],
            'tei.tar.gz': ['application/gzip', 'application/x-gzip'],
            'txt': ['text/plain'],
        };

        return formatMimeMap[selectedFormat] || mimes;
    }, [selectedFormat, mimes]);

    const getDefaultMimeType = useCallback(
        (fileName: string): string => {
            const extension = fileName.split('.').pop()?.toLowerCase();

            if (selectedFormat === 'pdf' && extension === 'pdf') {
                return 'application/pdf';
            } else if (selectedFormat === 'csv' && extension === 'csv') {
                return 'text/csv';
            } else if ((selectedFormat === 'istex.tar.gz' || selectedFormat === 'tei.tar.gz') &&
                      (extension === 'gz' || extension === 'tar.gz')) {
                return 'application/gzip';
            } else if (selectedFormat === 'txt' && extension === 'txt') {
                return 'text/plain';
            }
            return '';
        },
        [selectedFormat],
    );

    useEffect(() => {
        let invalid = false;

        if (file) {
            if (acceptedMimeTypes.length === 0) {
                const defaultMimeType = getDefaultMimeType(file.name);
                if (defaultMimeType) {
                    invalid = false;
                    console.log('Utilisation du type MIME par défaut:', defaultMimeType);
                } else {
                    invalid = true;
                }
            } else if (!acceptedMimeTypes.includes(mimeTypes.getType(file.name) ?? '')) {
                invalid = true;
            }
            setHasAttemptedUpload(true);
        }

        setIsInvalid(invalid);
        onChange(file, file !== null && !invalid);
    }, [file, acceptedMimeTypes, onChange, getDefaultMimeType]);

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
            if (droppedFile && acceptedMimeTypes.includes(mimeTypes.getType(droppedFile.name) ?? '')) {
                handleFileChange(droppedFile);
            }
        },
        [handleFileChange, acceptedMimeTypes],
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
                {isInvalid && hasAttemptedUpload ? (
                    <div className="error-message">
                        {selectedFormat && config?.inputFormat2labels && config.inputFormat2labels[selectedFormat] ? (
                            <>Veuillez sélectionner un fichier au format {config.inputFormat2labels[selectedFormat].summary}</>
                        ) : selectedFormat === 'pdf' ? (
                            <>Veuillez sélectionner un fichier .pdf</>
                        ) : selectedFormat === 'csv' ? (
                            <>Veuillez sélectionner un fichier .csv</>
                        ) : selectedFormat === 'istex.tar.gz' || selectedFormat === 'tei.tar.gz' ? (
                            <>Veuillez sélectionner un fichier .tar.gz</>
                        ) : selectedFormat === 'txt' ? (
                            <>Veuillez sélectionner un fichier .txt</>
                        ) : (
                            <>
                                Format non reconnu ou fichier incompatible. Veuillez sélectionner un fichier au format approprié pour le traitement choisi.
                            </>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(ProcessingFormUpload);
