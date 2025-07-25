import '~/app/components/form/scss/ProcessingFormCommon.scss';
import '~/app/components/form/scss/ProcessingFormConfiguration.scss';
import CircularWaiting from '~/app/components/progress/CircularWaiting';
import Markdown from '~/app/components/text/Markdown';
import { getStaticConfig } from '~/app/services/config';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import type { ProcessingFields, Wrapper } from '~/app/shared/data.types';

// Pour le traitement dans la base
export type ProcessingFormConfigurationValueType = {
    wrapper: Wrapper | null;
    wrapperParam: string | null;
    inputFormat?: string | null;
    flowId: string | null;
    fields?: string[] | null;
};

type ProcessingFormConfigurationProps = {
    wrapperList: Wrapper[];
    fields: ProcessingFields | null;
    isPending: boolean;
    value: ProcessingFormConfigurationValueType;
    onChange: (value: ProcessingFormConfigurationValueType) => void;
    onValidityChange: (isValid: boolean) => void;
};

// Pour l'affichage de la liste
type ServiceInfo = {
    inputFormat: string;
    featured: boolean;
    summary: string;
    description: string;
    descriptionLink?: string;
    enricher: string;
    wrapperParameterDefault?: string;
    wrapperParameter?: string;
    flowId: string;
};

const getServicePath = (url: string): string => {
    try {
        return new URL(url).pathname;
    } catch {
        return url;
    }
};

const ProcessingFormConfiguration = ({
    wrapperList,
    isPending,
    value,
    onChange,
    onValidityChange,
}: ProcessingFormConfigurationProps) => {
    const { type } = useParams();
    const [activeTab, setActiveTab] = useState('featured');
    const [expandedService, setExpandedService] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);

    const { data: config, isLoading: isConfigLoading } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
        staleTime: 0, // Considérer les données comme obsolètes immédiatement
        refetchOnMount: true, // Recharger à chaque montage du composant
        refetchOnWindowFocus: true, // Recharger quand la fenêtre reprend le focus
    });

    // Initialiser le service sélectionné en fonction de la valeur initiale
    useEffect(() => {
        if (config && value.flowId) {
            const service = config.flows.find((flow) => flow.id === value.flowId);
            if (service) {
                setSelectedService({
                    ...service,
                    flowId: service.id,
                });
                setExpandedService(service.id);

                // Définir l'onglet actif en fonction du service
                if (service.featured) {
                    setActiveTab('featured');
                } else {
                    setActiveTab('advanced');
                }
            } else {
                setSelectedService(null);
                setExpandedService(null);
            }
        } else {
            setSelectedService(null);
            setExpandedService(null);
        }
    }, [config, value.flowId]);

    const availableServices: ServiceInfo[] = useMemo(() => {
        if (!config) {
            return [];
        }

        return config.flows
            .filter((flow) => flow.input === type)
            .map((flow) => ({
                ...flow,
                flowId: flow.id,
            }))
            .filter((service) => service.inputFormat === value.inputFormat || service.inputFormat === '*');
    }, [config, type, value.inputFormat]);

    // Determine which categories have services
    const hasFeaturedServices = useMemo(
        () => availableServices.some((service) => service.featured),
        [availableServices],
    );

    const hasAdvancedServices = useMemo(
        () => availableServices.some((service) => !service.featured),
        [availableServices],
    );

    // Get available tabs based on which categories have services
    const availableTabs = useMemo(() => {
        const tabs = [];
        if (hasFeaturedServices) {
            tabs.push({ id: 'featured', label: 'Services à la une' });
        }
        if (hasAdvancedServices) {
            tabs.push({ id: 'advanced', label: 'Autres services' });
        }
        return tabs;
    }, [hasFeaturedServices, hasAdvancedServices]);

    useEffect(() => {
        if (!hasAdvancedServices && hasFeaturedServices) {
            setActiveTab('featured');
        } else if (!hasFeaturedServices && hasAdvancedServices) {
            setActiveTab('advanced');
        } else if (activeTab === 'featured' && !hasFeaturedServices) {
            setActiveTab(hasAdvancedServices ? 'advanced' : 'all');
        } else if (activeTab === 'advanced' && !hasAdvancedServices) {
            setActiveTab(hasFeaturedServices ? 'featured' : 'all');
        } else if (!hasFeaturedServices && !hasAdvancedServices) {
            setActiveTab('all');
        }
    }, [activeTab, hasFeaturedServices, hasAdvancedServices]);

    const filteredServices = useMemo(() => {
        switch (activeTab) {
            case 'featured':
                return availableServices.filter((service) => service.featured);
            case 'advanced':
                return availableServices.filter((service) => !service.featured);
            default:
                return availableServices;
        }
    }, [activeTab, availableServices]);

    const handleServiceChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newService = availableServices.find((service) => service.flowId === event.target.value);
            if (newService) {
                setSelectedService(newService);
                setExpandedService(newService.flowId);

                // Mettre à jour l'onglet actif en fonction du service
                if (newService.featured) {
                    setActiveTab('featured');
                } else {
                    setActiveTab('advanced');
                }

                onChange({
                    ...value,
                    flowId: newService.flowId,
                });
            }
        },
        [availableServices, value, onChange],
    );

    const handleServiceClick = useCallback(
        (serviceId: string, event: React.MouseEvent<HTMLDivElement>) => {
            const isArrowClick = (event.target as HTMLElement).closest('.arrow-icon');

            if (isArrowClick) {
                // Si on clique sur la flèche, on change uniquement l'état expanded
                setExpandedService((prev) => (prev === serviceId ? null : serviceId));
            } else {
                // Si on clique ailleurs sur la carte, on change l'état expanded et on sélectionne le service
                setExpandedService((prev) => (prev === serviceId ? null : serviceId));
                if (selectedService?.flowId !== serviceId) {
                    const newService = availableServices.find((service) => service.flowId === serviceId);
                    if (newService) {
                        setSelectedService(newService);
                        onChange({
                            ...value,
                            flowId: serviceId,
                        });
                    }
                }
            }
        },
        [availableServices, selectedService, value, onChange],
    );

    useEffect(() => {
        if (!selectedService || !config) {
            return;
        }
        // Recherche du flow par id
        const matchingFlow = config.flows.find((flow) => flow.id === selectedService.flowId);
        if (matchingFlow) {
            const wrapper = wrapperList.find((w) => {
                const wrapperPath = getServicePath(w.url);
                const flowWrapperPath = getServicePath(matchingFlow.wrapper);
                return wrapperPath === flowWrapperPath;
            });

            if (wrapper) {
                const wrapperParam = matchingFlow.wrapperParameter || '';

                onChange({
                    wrapper: wrapper,
                    wrapperParam: wrapperParam,
                    flowId: matchingFlow.id,
                    inputFormat: matchingFlow.inputFormat,
                });
            }
        }
    }, [selectedService, config, wrapperList, onChange, value.inputFormat, type]);

    useEffect(() => {
        const isValid =
            !!selectedService && !!config && config.flows.some((flow) => flow.id === selectedService.flowId);
        onValidityChange(isValid);
    }, [selectedService, config, onValidityChange]);

    // Sélectionner le premier service par défaut
    useEffect(() => {
        if (config && !value.flowId && value.inputFormat) {
            // Déterminer quel onglet est actif par défaut
            const defaultTab = hasFeaturedServices ? 'featured' : 'advanced';

            // Filtrer les services selon l'onglet par défaut
            const availableServices = config.flows
                .filter((flow) => {
                    const matchesType = flow.input === type;
                    const matchesFormat = flow.inputFormat === value.inputFormat || flow.inputFormat === '*';
                    const matchesTab = defaultTab === 'featured' ? flow.featured : !flow.featured;
                    return matchesType && matchesFormat && matchesTab;
                })
                .map((flow) => flow.id);

            if (availableServices.length > 0) {
                const firstService = availableServices[0];
                onChange({
                    wrapper: null,
                    wrapperParam: null,
                    flowId: firstService,
                    inputFormat: value.inputFormat,
                });
                setExpandedService(firstService);
                setActiveTab(defaultTab);
            }
        }
    }, [config, type, value.inputFormat, value.flowId, onChange, hasFeaturedServices]);

    if (isPending || isConfigLoading) {
        return <CircularWaiting />;
    }

    return (
        <div className="processing-form-configuration">
            <h3>Choisir un service*</h3>
            {hasFeaturedServices && hasAdvancedServices ? (
                <div className="service-tabs">
                    {availableTabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            role="tab"
                            tabIndex={0}
                            aria-selected={activeTab === tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setActiveTab(tab.id);
                                }
                            }}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>
            ) : null}

            <FormControl component="fieldset" fullWidth>
                <RadioGroup
                    aria-label="service"
                    name="service"
                    onChange={handleServiceChange}
                    value={selectedService?.flowId || ''}
                >
                    {filteredServices.map((service) => (
                        <div
                            key={service.flowId}
                            className={`service-container ${expandedService === service.flowId ? 'expanded' : ''}`}
                            onClick={(e) => {
                                handleServiceClick(service.flowId, e);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleServiceClick(service.flowId, e as any);
                                }
                            }}
                        >
                            <div className="service-label-container">
                                <FormControlLabel
                                    value={service.flowId}
                                    control={<Radio />}
                                    label={<Markdown text={service.summary} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                                <ExpandMoreIcon className="arrow-icon" />
                            </div>
                            <Collapse in={expandedService === service.flowId}>
                                <div className="service-details">
                                    <Markdown text={service.description} />
                                    {service.descriptionLink ? (
                                        <a
                                            href={service.descriptionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="service-link"
                                        >
                                            En savoir plus
                                        </a>
                                    ) : null}
                                </div>
                            </Collapse>
                        </div>
                    ))}
                </RadioGroup>
            </FormControl>

            <p className="service-description-link">
                * Tous les services sont décrits dans <a href="https://services.istex.fr/">ISTEX TDM</a>.
            </p>
        </div>
    );
};

export default memo(ProcessingFormConfiguration);
