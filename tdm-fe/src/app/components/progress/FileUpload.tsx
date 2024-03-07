import Alert from '@mui/material/Alert';
import CircularWaiting from '~/app/components/progress/CircularWaiting';

export type FileUploadProps = {
    showError?: boolean;
};

const FileUpload = ({ showError }: FileUploadProps) => {
    if (!showError) {
        return <CircularWaiting />;
    }

    return <Alert severity="error">Le fichier n&apos;a pas pu être téléversé.</Alert>;
};

export default FileUpload;
