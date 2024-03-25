import FileUpload from '~/app/components/progress/FileUpload';
import { ProcessingFormContext } from '~/app/provider/ProcessingFormContextProvider';
import { colors } from '~/app/shared/theme';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { MuiFileInput } from 'mui-file-input';
import { useContext, useMemo } from 'react';

const ProcessingFormUpload = () => {
    const { mimes, file, setFile, isPending, isInvalid, isOnError } = useContext(ProcessingFormContext);

    const stringifiesMineTypes = useMemo(() => {
        return mimes.join(', ');
    }, [mimes]);

    const handleFileChange = (newFile: File | null) => {
        setFile(newFile);
    };

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
                            Le fichier ne correspond pas a un format compatible, utilisé l&lsquo;un de ces format :{' '}
                            {stringifiesMineTypes}.
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default ProcessingFormUpload;
