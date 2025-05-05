import './scss/ProcessingFormUpload.scss';
import FileUpload from '~/app/components/progress/FileUpload';
import { getStaticConfig } from '~/app/services/config';
import { fields as fieldsService } from '~/app/services/creation/fields';
import { upload } from '~/app/services/creation/upload';

import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

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
    onFieldsChange?: (fields: string[]) => void;
};

const ProcessingFormUpload = ({ mimes, value, isOnError, isPending, onChange, selectedFormat, onFieldsChange }: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [isInvalid, setIsInvalid] = useState(false);
    const [formatError, setFormatError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
    const [selectedField, setSelectedField] = useState<string>('');
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [isLoadingFields, setIsLoadingFields] = useState(false);

    const { data: config } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
    });

    const stringifiedMimeTypes = useMemo(() => {
        return mimes.join(', ');
    }, [mimes]);

    const checkFileFormat = useCallback((file: File | null, format: string | null | undefined): boolean => {
        if (!file || !format || !config) return true;

        const fileName = file.name.toLowerCase();
        const extensions = config.inputFormat2labels[format]?.extensions;

        if (!extensions) return true;

        return extensions.some(ext => fileName.endsWith(`.${ext}`));
    }, [config]);

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

            // Get fields for CSV
            if (file.name.toLowerCase().endsWith('.csv')) {
                setIsLoadingFields(true);
                upload(file)
                    .then(id => {
                        if (id) {
                            return fieldsService(id);
                        }
                        return null;
                    })
                    .then(fields => {
                        if (fields && fields.fields) {
                            const fieldsArray = Array.isArray(fields.fields) ? fields.fields : Object.keys(fields.fields);
                            setAvailableFields(fieldsArray);
                            if (fieldsArray.length > 0) {
                                setSelectedField('abstract');
                                onFieldsChange?.(['abstract']);
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error while retrieving fields:', error);
                    })
                    .finally(() => {
                        setIsLoadingFields(false);
                    });
            }
        }

        setIsInvalid(invalid);
        setFormatError(wrongFormat);
        onChange(file, file !== null && !invalid && !wrongFormat);
    }, [file, mimes, onChange, selectedFormat, checkFileFormat, onFieldsChange]);

    const handleFileChange = useCallback((newFile: File | null) => {
        setFile(newFile);
        setAvailableFields([]);
        setSelectedField('');
        if (newFile === null) {
            setHasAttemptedUpload(false);
        }
    }, []);

    const handleFieldChange = useCallback((event: SelectChangeEvent<string>) => {
        const newField = event.target.value;
        setSelectedField(newField);
        if (onFieldsChange) {
            onFieldsChange([newField]);
        }
    }, [onFieldsChange]);

    useEffect(() => {
        if (availableFields.length > 0 && !selectedField) {
            setSelectedField(availableFields[0]);
            if (onFieldsChange) {
                onFieldsChange([availableFields[0]]);
            }
        }
    }, [availableFields, selectedField, onFieldsChange]);

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
                                    accept: stringifiedMimeTypes,
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
                {file?.name.toLowerCase().endsWith('.csv') && (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Nom du champ à exploiter</InputLabel>
                        <Select
                            value={selectedField}
                            onChange={handleFieldChange}
                            label="Nom du champ à exploiter"
                            disabled={isLoadingFields || availableFields.length === 0}
                            defaultValue="abstract"
                        >
                            {availableFields.map((field) => (
                                <MenuItem key={field} value={field}>
                                    {field}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                {hasAttemptedUpload && (isInvalid || formatError) ? (
                    <div className="error-message">
                        {isInvalid ? (
                            <p>Le fichier ne correspond pas à un format compatible, utilisez l&apos;un de ces formats : {stringifiedMimeTypes}.</p>
                        ) : null}
                        {formatError && selectedFormat && config ? (
                            <p>
                                Le fichier ne correspond pas au format sélectionné.
                                <span> Les formats acceptés sont : {config.inputFormat2labels[selectedFormat]?.extensions?.map((ext: string) => `.${ext}`).join(', ')}</span>
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(ProcessingFormUpload);
