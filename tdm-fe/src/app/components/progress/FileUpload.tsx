import CircularWaiting from '~/app/components/progress/CircularWaiting';

import Alert from '@mui/material/Alert';

export type FileUploadProps = {
    showError?: boolean;
};

const FileUpload = ({ showError }: FileUploadProps) => {
    if (!showError) {
        return <CircularWaiting />;
    }

    return <Alert severity="error">Le fichier n&lsquo;a pas pu être téléversé.</Alert>;
};

export default FileUpload;
