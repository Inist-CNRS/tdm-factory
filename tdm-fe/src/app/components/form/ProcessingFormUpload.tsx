import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import mimeTypes from 'mime';
import { MuiFileInput } from 'mui-file-input';
import { useState } from 'react';
import FileUpload from '~/app/components/progress/FileUpload';
import { colors } from '~/app/shared/theme';

export type ChangeFile = {
    file: File | null;
    invalidState: boolean;
};

export type ProcessingFormUploadProps = {
    isUploading: {
        pending: boolean;
        error: boolean;
    };
    mimes: string[];
    value: File | null;
    onChange: (file: ChangeFile) => void;
};

const ProcessingFormUpload = ({ isUploading, mimes, value, onChange }: ProcessingFormUploadProps) => {
    const [file, setFile] = useState<File | null>(value);
    const [error, setError] = useState<boolean>(false);

    const handleFileChange = (newFile: File | null) => {
        let invalidState = false;

        setFile(newFile);

        if (!newFile || !mimes.includes(mimeTypes.getType(newFile.name) ?? '')) {
            invalidState = true;
        }

        setError(invalidState);
        onChange({
            file: newFile,
            invalidState,
        });
    };

    if (isUploading.pending || isUploading.error) {
        return <FileUpload showError={isUploading.error} />;
    }

    return (
        <div className="processing-form-field-group processing-form-field-with-label">
            <MuiFileInput
                className="processing-form-field"
                placeholder="Déposer un fichier"
                value={file}
                onChange={handleFileChange}
                error={error}
                fullWidth
                clearIconButtonProps={{
                    children: <CloseIcon fontSize="small" />,
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
            {error ? (
                <div className="text processing-form-field-label error">
                    {!file ? (
                        <>Fichier manquant</>
                    ) : (
                        <>
                            Le fichier ne correspond pas a un format compatible, utilisé l&apos;un de ces format :
                            {mimes.join(', ')}.
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default ProcessingFormUpload;
