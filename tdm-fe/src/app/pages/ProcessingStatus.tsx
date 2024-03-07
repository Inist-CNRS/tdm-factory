import Timeline from '@mui/lab/Timeline';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StatusTimeline from '~/app/components/progress/StatusTimeline';
import { status } from '~/app/services/status/status';
import Status from '~/app/shared/Status';

const ProcessingStatus = () => {
    const params = useParams();

    const id = useMemo(() => {
        if (params.id) {
            return params.id;
        }
        return null;
    }, [params.id]);

    const { data } = useQuery({
        queryKey: ['status', id],
        queryFn: () => {
            if (!id) {
                return;
            }

            return status(id);
        },
    });

    if (data === undefined) {
        return <p>Not found</p>; // Todo faire un page 404
    }

    // TODO Add scss file instead of the jsx css
    return (
        <div>
            <p className="text" style={{ textAlign: 'center' }}>
                Status du traitement : {id}
            </p>
            <Timeline>
                <StatusTimeline
                    isRunning={data === Status.UNKNOWN}
                    isComplet={data > Status.UNKNOWN}
                    text="Initialisé"
                />

                <StatusTimeline
                    isRunning={data === Status.STARTING}
                    isComplet={data > Status.STARTING}
                    text="Démarrage"
                />

                <StatusTimeline
                    isRunning={data === Status.WRAPPER_RUNNING}
                    isComplet={data > Status.WRAPPER_ERROR}
                    isOnError={data === Status.WRAPPER_ERROR}
                    text="Conversion"
                />

                <StatusTimeline
                    isRunning={data === Status.ENRICHMENT_RUNNING}
                    isComplet={data > Status.ENRICHMENT_ERROR}
                    isOnError={data === Status.ENRICHMENT_ERROR}
                    text="Lancement de l'enrichissement"
                />

                <StatusTimeline
                    isRunning={data === Status.WAITING_WEBHOOK}
                    isComplet={data > Status.WAITING_WEBHOOK}
                    text="En attente du résultat"
                />

                <StatusTimeline
                    isRunning={data === Status.PROCESSING_WEBHOOK}
                    isComplet={data > Status.PROCESSING_WEBHOOK}
                    text="Récupération du résultat"
                />

                <StatusTimeline
                    isComplet={data === Status.FINISHED}
                    isOnError={data === Status.FINISHED_ERROR}
                    text="Traitement terminé"
                />
            </Timeline>
        </div>
    );
};

export default ProcessingStatus;
