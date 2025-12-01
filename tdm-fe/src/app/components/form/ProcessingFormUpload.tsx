import "./scss/ProcessingFormUpload.scss";
import FileUpload from "~/app/components/progress/FileUpload";
import { getStaticConfig } from "~/app/services/config";
import { upload } from "~/app/services/creation/upload";
import { readFileFields } from "~/app/utils/fileFieldsReader";

import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import mimeTypes from "mime";
import { MuiFileInput } from "mui-file-input";
import { memo, useCallback, useEffect, useMemo, useState, type DragEvent } from "react";

import type { SelectChangeEvent } from "@mui/material";

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
        return "0 o";
    }
    const k = 1024;
    const sizes = ["io", "Kio", "Mio", "Gio", "Tio"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export type UploadFileFunction = () => Promise<string | null>;

type ProcessingFormUploadProps = {
    mimes: string[];
    value: File | null;
    isOnError: boolean;
    isPending: boolean;
    onChange: (value: File | null, isValid: boolean) => void;
    selectedFormat?: string | null;
    onFieldsChange?: (fields: string[]) => void;
    onUploadReady?: (uploadFn: UploadFileFunction) => void;
};

const ProcessingFormUpload = ({
    mimes,
    value,
    isOnError,
    isPending,
    onChange,
    selectedFormat,
    onFieldsChange,
    onUploadReady,
}: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [isInvalid, setIsInvalid] = useState(false);
    const [formatError, setFormatError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
    const [selectedField, setSelectedField] = useState<string>("");
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [isLoadingFields, setIsLoadingFields] = useState(false);

    const { data: config } = useQuery({
        queryKey: ["static-config"],
        queryFn: getStaticConfig,
    });

    // Build accept string with both MIME types and file extensions
    const acceptString = useMemo(() => {
        const acceptParts = [...mimes];

        // Add file extensions for formats without standard MIME types
        if (mimes.includes("application/jsonl")) {
            acceptParts.push(".jsonl");
        }
        if (mimes.includes("application/json")) {
            acceptParts.push(".json");
        }
        if (mimes.includes("text/csv")) {
            acceptParts.push(".csv");
        }

        return acceptParts.join(",");
    }, [mimes]);

    const checkFileFormat = useCallback(
        (file: File | null, format: string | null | undefined): boolean => {
            if (!file || !format || !config) {
                return true;
            }

            const fileName = file.name.toLowerCase();
            const extensions = config.inputFormat2labels[format]?.extensions;

            if (!extensions) {
                return true;
            }

            return extensions.some((ext) => fileName.endsWith(`.${ext}`));
        },
        [config]
    );

    useEffect(() => {
        let invalid = false;
        let wrongFormat = false;

        if (file) {
            const fileName = file.name.toLowerCase();
            const detectedMimeType = mimeTypes.getType(file.name) ?? "";

            // Special handling for JSONL files (no standard MIME type)
            const isJsonl = fileName.endsWith(".jsonl");
            const effectiveMimeType = isJsonl ? "application/jsonl" : detectedMimeType;

            // Check MIME type compatibility
            if (!mimes.includes(effectiveMimeType)) {
                invalid = true;
            }

            // Check if file extension matches selected format
            if (selectedFormat && !checkFileFormat(file, selectedFormat)) {
                wrongFormat = true;
            }

            setHasAttemptedUpload(true);

            // Read fields from file client-side
            const supportsFieldSelection =
                fileName.endsWith(".csv") || fileName.endsWith(".json") || fileName.endsWith(".jsonl");

            if (supportsFieldSelection) {
                setIsLoadingFields(true);
                readFileFields(file)
                    .then((fieldsArray) => {
                        setAvailableFields(fieldsArray);

                        // Select "abstract" or "Résumé" or "content" if available, otherwise select the first field
                        let defaultField = fieldsArray[0];
                        if (fieldsArray.includes("abstract")) {
                            defaultField = "abstract";
                        } else if (fieldsArray.includes("Résumé")) {
                            defaultField = "Résumé";
                        } else if (fieldsArray.includes("content")) {
                            defaultField = "content";
                        }

                        if (fieldsArray.length > 0) {
                            setSelectedField(defaultField);
                            onFieldsChange?.([defaultField]);
                        }
                    })
                    .catch((error) => {
                        console.error("Erreur lors de la lecture des champs:", error);
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

    const uploadFileFunction = useCallback(async (): Promise<string | null> => {
        if (!file) {
            return null;
        }

        try {
            const id = await upload(file);
            return id;
        } catch (error) {
            console.error("Erreur lors de l'upload:", error);
            throw error;
        }
    }, [file]);

    useEffect(() => {
        if (onUploadReady) {
            onUploadReady(uploadFileFunction);
        }
    }, [onUploadReady, uploadFileFunction]);

    const handleFileChange = useCallback((newFile: File | null) => {
        setFile(newFile);
        setAvailableFields([]);
        setSelectedField("");
        if (newFile === null) {
            setHasAttemptedUpload(false);
        }
    }, []);

    const handleFieldChange = useCallback(
        (event: SelectChangeEvent) => {
            const newField = event.target.value;
            setSelectedField(newField);
            if (onFieldsChange) {
                onFieldsChange([newField]);
            }
        },
        [onFieldsChange]
    );

    useEffect(() => {
        if (availableFields.length > 0 && !selectedField) {
            setSelectedField(availableFields[0]);
            if (onFieldsChange) {
                onFieldsChange([availableFields[0]]);
            }
        }
    }, [availableFields, selectedField, onFieldsChange]);

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
                const fileName = droppedFile.name.toLowerCase();
                const isJsonl = fileName.endsWith(".jsonl");
                const detectedMimeType = isJsonl ? "application/jsonl" : mimeTypes.getType(droppedFile.name) ?? "";

                if (mimes.includes(detectedMimeType)) {
                    handleFileChange(droppedFile);
                }
            }
        },
        [handleFileChange, mimes]
    );

    if (isPending || isOnError) {
        return <FileUpload showError={isOnError} />;
    }

    return (
        <div className="processing-form-upload">
            <div className="upload-container">
                <h3>Téléverser votre fichier</h3>
                <div
                    className={`upload-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
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
                                    accept: acceptString,
                                }}
                                InputProps={{
                                    sx: { display: "none" },
                                }}
                            />
                            <Button
                                variant="contained"
                                component="label"
                                onClick={() => {
                                    (document.querySelector(".file-input input") as HTMLInputElement)?.click();
                                }}
                                sx={{
                                    textTransform: "none",
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
                {file &&
                (file.name.toLowerCase().endsWith(".csv") ||
                    file.name.toLowerCase().endsWith(".json") ||
                    file.name.toLowerCase().endsWith(".jsonl")) &&
                availableFields.length > 0 ? (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Nom du champ à exploiter</InputLabel>
                        <Select
                            value={selectedField}
                            onChange={handleFieldChange}
                            label="Nom du champ à exploiter"
                            disabled={isLoadingFields || availableFields.length === 0}
                        >
                            {availableFields.map((field) => (
                                <MenuItem key={field} value={field}>
                                    {field}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ) : null}
                {hasAttemptedUpload && (isInvalid || formatError) ? (
                    <div className="error-message">
                        {formatError && selectedFormat && config ? (
                            <p>
                                {`Le fichier ne correspond pas au format sélectionné (${
                                    config.inputFormat2labels[selectedFormat]?.summary || selectedFormat
                                }).`}
                                <span>
                                    {` Les extensions acceptées sont: ${config.inputFormat2labels[
                                        selectedFormat
                                    ]?.extensions
                                        ?.map((ext) => `.${ext}`)
                                        .join(", ")}`}
                                </span>
                            </p>
                        ) : isInvalid ? (
                            <p>
                                Le fichier ne correspond pas à un format compatible. Veuillez vérifier que vous avez
                                sélectionné le bon format à l&apos;étape précédente.
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default memo(ProcessingFormUpload);
