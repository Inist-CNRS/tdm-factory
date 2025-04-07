import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Collapse, CircularProgress } from '@mui/material';
import { useCallback, memo, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStaticConfig } from '~/app/services/config';

import type React from 'react';
import type { Format } from '~/lib/config';
import './scss/ProcessingFormFormat.scss';

type ProcessingFormFormatProps = {
    onChange: (format: string) => void;
    value: string | null;
    type: 'article' | 'corpus';
};

// Fallback format details au cas où l'API échoue
const fallbackFormatDetails = {
    'istex.tar.gz': {
        summary: 'Corpus Istex (tar.gz)',
        description: 'Pour obtenir un fichier corpus ISTEX, utiliser ISTEX Search, le format LODEX (ou au minimum les métadonnées JSON), et le format de compression .tar.gz.'
    },
    'txt': {
        summary: 'Corpus de documents textes (tar.gz)',
        description: 'Le format texte permet de traiter des documents textuels bruts. Les fichiers doivent être au format .txt.'
    },
    'csv': {
        summary: 'Tableur (.csv)',
        description: 'Le format CSV permet de traiter des données tabulaires. Les fichiers doivent être au format .csv.'
    },
    'pdf': {
        summary: 'PDF',
        description: 'Fichier PDF texte. Le PDF ne doit pas être un PDF image.'
    },
    'tei.tar.gz': {
        summary: 'Corpus TEI (.tar.gz)',
        description: 'Un corpus contenant des fichiers XML-TEI dans un répertoire `data`, au format `.tar.gz`.'
    }
};

const ProcessingFormFormat = ({ onChange, value, type }: ProcessingFormFormatProps) => {
    const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

    // Récupérer les formats depuis l'API
    const { data: config, isLoading } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
        staleTime: 3600000, // 1 heure de cache
        gcTime: 3600000,
    });

    // Filtrer les formats disponibles en fonction du type (article ou corpus)
    const availableFormats = useMemo(() => {
        if (!config?.flows) return [];

        // Filtrer les flux par type (article ou corpus)
        const filteredFlows = config.flows.filter(flow => flow.input === type);

        // Extraire les formats uniques
        return [...new Set(filteredFlows.map(flow => flow.inputFormat))];
    }, [config, type]);

    // Utiliser les formats de l'API ou les formats de secours, filtrés par type
    const formatDetails = useMemo(() => {
        if (!config?.inputFormat2labels) return fallbackFormatDetails;

        // Si aucun format disponible, retourner un objet vide
        if (availableFormats.length === 0) return {};

        // Filtrer les formats par type
        return Object.entries(config.inputFormat2labels)
            .filter(([format]) => availableFormats.includes(format))
            .reduce((acc, [format, details]) => {
                acc[format] = details;
                return acc;
            }, {} as Record<string, Format>);
    }, [config, availableFormats]);

    const handleFormatChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
        },
        [onChange],
    );

    const handleFormatClick = useCallback(
        (format: string, event: React.MouseEvent) => {
            const label = (event.currentTarget as HTMLElement).querySelector('.MuiFormControlLabel-root');
            if (!label) {
                return;
            }

            const rect = label.getBoundingClientRect();
            const rightEdge = rect.right - 40;

            if (event.clientX > rightEdge) {
                event.preventDefault();
                event.stopPropagation();
                setExpandedFormat(expandedFormat === format ? null : format);
            }
        },
        [expandedFormat],
    );

    if (isLoading) {
        return (
            <div className="loading-container">
                <CircularProgress />
                <Typography>Chargement des formats disponibles...</Typography>
            </div>
        );
    }

    // Vérifier s'il y a des formats disponibles
    const hasFormats = Object.keys(formatDetails).length > 0;

    return (
        <>
            <Typography variant="h3" gutterBottom>
                Choisir le format de votre {type === 'article' ? 'article' : 'corpus'}
            </Typography>
            {!hasFormats ? (
                <div className="no-formats-message">
                    <Typography>
                        Aucun format disponible pour le traitement de {type === 'article' ? 'articles' : 'corpus'} pour le moment.
                    </Typography>
                </div>
            ) : (
                <div className="processing-form-format">
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup aria-label="format" name="format" onChange={handleFormatChange} value={value || ''}>
                            {Object.entries(formatDetails).map(([format, formatInfo]) => (
                                <div
                                    key={format}
                                    className={`format-container ${expandedFormat === format ? 'expanded' : ''}`}
                                    onClick={(e) => {
                                        handleFormatClick(format, e as React.MouseEvent);
                                    }}
                                >
                                    <div className="format-label-container">
                                        <FormControlLabel
                                            value={format}
                                            control={<Radio />}
                                            label={formatInfo.summary}
                                        />
                                        <ExpandMoreIcon className="arrow-icon" />
                                    </div>
                                    <Collapse in={expandedFormat === format}>
                                        <div className="format-details">{formatInfo.description}</div>
                                    </Collapse>
                                </div>
                            ))}
                        </RadioGroup>
                    </FormControl>
                </div>
            )}
        </>
    );
};

export default memo(ProcessingFormFormat);
