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
        return <Alert severity="error">Nous ne parvenons pas à contacter le serveur, merci de ré-essayer ultérieurement.</Alert>;
    }

    /**
     * Show an error if we have no processing linked with the given id
     */
    if (state.status === 428) {
        return <Alert severity="error">Nous ne parvenons pas à trouver le fichier lié à ce traitement.</Alert>;
    }

    /**
     * Show an error if we get any other error
     */
    if (state.status !== 200) {
        return <Alert severity="error">Un problème inattendu est survenu.</Alert>;
    }

    return (
        <div>
            <p>Le traitement a commencé. Vous allez recevoir un mail contenant un résumé.</p>
            <p>
                Vous pouvez voir l&apos;avancement du traitement via la page de statut des traitements :{' '}
                <Link href={href}>{processingId}</Link>
            </p>
        </div>
    );
};

export default ProcessingFormConfirmation;
