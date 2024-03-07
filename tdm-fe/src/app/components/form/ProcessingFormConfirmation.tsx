import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useHref } from 'react-router-dom';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import { RouteProcessingStatus } from '~/app/shared/routes';

export type ProcessingFormConfirmationProps = {
    processingId: string;
    state: {
        status: 200 | 400 | 428 | 500 | null | undefined;
        pending: boolean;
    };
};

const ProcessingFormConfirmation = ({ processingId, state }: ProcessingFormConfirmationProps) => {
    const href = useHref(`${RouteProcessingStatus}/${processingId}`);

    /**
     * Show a loading box will wait for the start to be fetched
     */
    if (state.pending) {
        return <CircularWaiting />;
    }

    /**
     * Show an error if we get empty operations
     */
    if (!state.status) {
        return <Alert severity="error">Nous parvenos pas a contacté le serveur, merci de résayer utererment.</Alert>;
    }

    /**
     * Show an error if we have no processing linked with the given id
     */
    if (state.status === 428) {
        return <Alert severity="error">Nous parvenos pas a trouvé le fichier lié a ce traitement.</Alert>;
    }

    /**
     * Show an error if we get any other error
     */
    if (state.status !== 200) {
        return <Alert severity="error">Un probléme inatendue et survenue.</Alert>;
    }

    return (
        <div>
            <p>Le tratement a commencé vous aller recevoir un mail contenent un résumé.</p>
            <p>
                Vous pouvais voir l&apos;avancement du traitement via la page de status des traitement :{' '}
                <Link href={href}>{processingId}</Link>
            </p>
        </div>
    );
};

export default ProcessingFormConfirmation;
