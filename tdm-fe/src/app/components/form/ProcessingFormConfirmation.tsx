import CircularWaiting from '~/app/components/progress/CircularWaiting';
import { ProcessingFormContext } from '~/app/provider/ProcessingFormContextProvider';
import { RouteProcessingStatus } from '~/app/shared/routes';

import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useContext } from 'react';
import { useHref } from 'react-router-dom';

export type ProcessingFormConfirmationProps = {
    processingId: string;
    state: {
        status: 202 | 400 | 409 | 428 | 500 | null | undefined;
        pending: boolean;
    };
};

const ProcessingFormConfirmation = () => {
    const { processingId, isPending, startingStatus } = useContext(ProcessingFormContext);

    const href = useHref(`${RouteProcessingStatus}/${processingId}`);

    /**
     * Show a loading box will wait for the start to be fetched
     */
    if (isPending) {
        return <CircularWaiting />;
    }

    /**
     * Show an error if we get empty operations
     */
    if (!startingStatus) {
        return (
            <Alert severity="error">
                Nous ne parvenons pas à contacter le serveur, merci de ré-essayer ultérieurement.
            </Alert>
        );
    }

    /**
     * Show an error if we have no processing linked with the given id
     */
    if (startingStatus === 428) {
        return <Alert severity="error">Nous ne parvenons pas à trouver le fichier lié à ce traitement.</Alert>;
    }

    /**
     * Show an error if we get any other error
     */
    if (startingStatus !== 202 && startingStatus !== 409) {
        return <Alert severity="error">Un problème inattendu est survenu.</Alert>;
    }

    return (
        <>
            <p>Le traitement a commencé. Vous allez recevoir un mail contenant un résumé.</p>
            <p>
                Vous pouvez voir l&apos;avancement du traitement via la page de statut des traitements :{' '}
                <Link href={href}>{processingId}</Link>
            </p>
        </>
    );
};

export default ProcessingFormConfirmation;
