import StatusTimeline from '~/app/components/progress/StatusTimeline';
import { getProcessingInfo } from '~/app/services/processing/processing-info';
import { status } from '~/app/services/status/status';
import Status from '~/app/shared/Status';

import Timeline from '@mui/lab/Timeline';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ProcessingStatus = () => {
    const params = useParams();
    const navigate = useNavigate();

    const id = useMemo(() => {
        // Check if not nullish, if id exist this one is a md5
        if (params.id) {
            return params.id;
        }
        return null;
    }, [params.id]);

    // Récupérer les informations du traitement, y compris le type
    useEffect(() => {
        if (id) {
            const fetchProcessingInfo = async () => {
                try {
                    // Rediriger vers la page de traitement avec l'étape 5
                    navigate(`/process/result?id=${id}&step=5`);
                } catch (error) {
                    console.error('Error fetching processing info:', error);
                }
            };
            fetchProcessingInfo();
        }
    }, [id, navigate]);

    const { data } = useQuery({
        queryKey: ['status', id],
        queryFn: () => {
            if (!id) {
                return;
            }

            return status(id);
        },
        // Do pulling to update the page
        refetchInterval: (query) => {
            const stateData = query.state.data;
            if (
                stateData === undefined ||
                stateData === Status.WRAPPER_ERROR ||
                stateData === Status.ENRICHMENT_ERROR ||
                stateData === Status.FINISHED_ERROR ||
                stateData === Status.FINISHED
            ) {
                return undefined;
            }

            if (
                stateData === Status.WRAPPER_RUNNING ||
                stateData === Status.WAITING_WEBHOOK
            ) {
                return 1000 * 30; // 30 Secs
            }

            return 1000 * 4; // 4 Secs
        },
    });

    if (data === undefined) {
        return <p>Not found</p>; // Todo faire un page 404
    }

    return (
        <div>
            <p className="text" id="processing-status-title">
                Statut du traitement : {id}
            </p>
            <Timeline>
                <StatusTimeline
                    isRunning={data === Status.UNKNOWN}
                    isComplete={data > Status.UNKNOWN}
                    text="Initialisé"
                />

                <StatusTimeline
                    isRunning={data === Status.STARTING}
                    isComplete={data > Status.STARTING}
                    text="Démarrage"
                />

                <StatusTimeline
                    isRunning={data === Status.WRAPPER_RUNNING}
                    isComplete={data > Status.WRAPPER_ERROR}
                    isOnError={data === Status.WRAPPER_ERROR}
                    text="Conversion"
                />

                <StatusTimeline
                    isRunning={data === Status.ENRICHMENT_RUNNING}
                    isComplete={data > Status.ENRICHMENT_ERROR}
                    isOnError={data === Status.ENRICHMENT_ERROR}
                    text="Lancement de l'enrichissement"
                />

                <StatusTimeline
                    isRunning={data === Status.WAITING_WEBHOOK}
                    isComplete={data > Status.WAITING_WEBHOOK}
                    text="En attente du résultat"
                />

                <StatusTimeline
                    isRunning={data === Status.PROCESSING_WEBHOOK}
                    isComplete={data > Status.PROCESSING_WEBHOOK}
                    text="Récupération du résultat"
                />

                <StatusTimeline
                    isComplete={data === Status.FINISHED}
                    isOnError={data === Status.FINISHED_ERROR}
                    text="Traitement terminé"
                />
            </Timeline>
        </div>
    );
};

export default ProcessingStatus;
