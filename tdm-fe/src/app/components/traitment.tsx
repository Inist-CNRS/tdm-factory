'use client';
import { DefaultApiFactory } from '@/generated';
import EmailIcon from '@mui/icons-material/Email';
import Factory from '@mui/icons-material/Factory';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import { useEffect, useState } from 'react';
import type { TraitmentStatusGet200Response } from '@/generated';
import type React from 'react';

const TraitmentComponent: React.FC<{ id: number }> = (props) => {
    const [result, setResult] = useState<TraitmentStatusGet200Response>({ message: '', errorType: 7 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                //Fetching data from status
                const api = await DefaultApiFactory();
                const fetchDataWrappers = await api.traitmentStatusGet(props.id);
                setResult(fetchDataWrappers.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {result?.errorType === 7 ? (
                result?.message
            ) : (
                <div className="traitment">
                    {result?.message}
                    <br />
                    <Factory color={result.errorType >= 0 ? 'primary' : 'disabled'} />
                    <br />
                    En cours de conversion
                    <br />
                    {result.errorType === 1 ? (
                        <div>
                            <Factory color="error" />
                            <br />
                            Erreur à l&apos;appel du convertisseur
                        </div>
                    ) : (
                        <div>
                            <FindReplaceIcon color={result.errorType >= 2 ? 'primary' : 'disabled'} />
                            <br />
                            En cours d&apos;appel au traitement
                            <br />
                            {result.errorType === 3 ? (
                                <div>
                                    <TroubleshootIcon color="error" />
                                    <br />
                                    Erreur à l&apos;appel du traitement
                                </div>
                            ) : (
                                <div>
                                    <TroubleshootIcon color={result.errorType >= 4 ? 'primary' : 'disabled'} />
                                    <br />
                                    En attente de la fin du traitement
                                    <br />
                                    {result.errorType === 5 ? (
                                        <div>
                                            <EmailIcon color="success" />
                                            <br />
                                            Terminé vous avez reçu un mail
                                        </div>
                                    ) : result.errorType === 6 ? (
                                        <div>
                                            <EmailIcon color="error" />
                                            <br />
                                            Une erreur est retournée par le webhook vérifiez vos mails
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default TraitmentComponent;
