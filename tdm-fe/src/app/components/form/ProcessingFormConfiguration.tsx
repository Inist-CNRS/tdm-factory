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

import type { Enrichment, ProcessingFields, Wrapper } from '~/app/shared/data.types';

export type ProcessingFormConfigurationValueType = {
    wrapper: Wrapper | null;
    wrapperParam: string | null;
    enrichment: Enrichment | null;
    inputFormat?: string | null;
    flowId?: string | null;
};

type ProcessingFormConfigurationProps = {
    wrapperList: Wrapper[];
    enrichmentList: Enrichment[];
    fields: ProcessingFields | null;
    isPending: boolean;
    value: ProcessingFormConfigurationValueType;
    onChange: (value: ProcessingFormConfigurationValueType) => void;
    onValidityChange: (isValid: boolean) => void;
};

type ServiceInfo = {
    inputFormat: string;
    featured: boolean;
    summary: string;
    description: string;
    descriptionLink?: string;
    url: string;
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
    enrichmentList,
    isPending,
    value,
    onChange,
    onValidityChange,
}: ProcessingFormConfigurationProps) => {
    const { type } = useParams();
    const [activeTab, setActiveTab] = useState('featured');
    const [expandedService, setExpandedService] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<Enrichment | null>(value.enrichment);

    const { data: config, isLoading: isConfigLoading } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig,
    });

    const availableServices = useMemo(() => {
        if (!config || !enrichmentList) return [];

        return config.flows
            .filter(flow => flow.input === type)
            .reduce<ServiceInfo[]>((services, flow) => {
                const flowPath = getServicePath(flow.enricher);
                const matchingService = enrichmentList.find(service =>
                    getServicePath(service.url) === flowPath
                );

                if (matchingService) {
                    services.push({
                        inputFormat: flow.inputFormat,
                        featured: flow.featured,
                        summary: flow.summary,
                        description: flow.description,
                        descriptionLink: flow.descriptionLink,
                        url: matchingService.url
                    });
                }
                return services;
            }, [])
            .filter(service => service.inputFormat === value.inputFormat);
    }, [config, enrichmentList, type]);

    const filteredServices = useMemo(() => {
        switch (activeTab) {
            case 'featured':
                return availableServices.filter(service => service.featured);
            case 'advanced':
                return availableServices.filter(service => !service.featured);
            default:
                return availableServices;
        }
    }, [activeTab, availableServices]);

    const handleServiceChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newService = enrichmentList.find((service) => service.url === event.target.value);
        if (newService && newService !== selectedService) {
            setSelectedService(newService);
        }
    }, [enrichmentList, selectedService]);

    const handleServiceClick = useCallback((serviceUrl: string, event: React.MouseEvent<HTMLDivElement>) => {
        const isInteractive = (event.target as HTMLElement).closest('.MuiRadio-root, a');
        if (!isInteractive) {
            setExpandedService(prev => prev === serviceUrl ? null : serviceUrl);
        }
    }, []);

    useEffect(() => {
        if (!selectedService || !config) return;

        const matchingFlow = config.flows.find(flow =>
            getServicePath(flow.enricher) === getServicePath(selectedService.url)
        );
    
        if (matchingFlow) {
            const wrapper = wrapperList.find(w =>
                getServicePath(w.url) === getServicePath(matchingFlow.wrapper)
            );

            onChange({
                wrapper: wrapper || null,
                wrapperParam: matchingFlow.wrapperParameterDefault || null,
                enrichment: selectedService,
                flowId: matchingFlow.id
            });
        }
    }, [selectedService, config, wrapperList, onChange]);

    useEffect(() => {
        const isValid = !!selectedService && !!config && config.flows.some(flow =>
            getServicePath(flow.enricher) === getServicePath(selectedService.url)
        );
        onValidityChange(isValid);
    }, [selectedService, config, onValidityChange]);

    if (isPending || isConfigLoading) {
        return <CircularWaiting />;
    }

    return (
        <div className="processing-form-configuration">
            <h3>Choisir un service</h3>
            <div className="service-tabs">
                {[
                    { id: 'featured', label: 'Services à la une' },
                    { id: 'advanced', label: 'Services avancés' },
                    { id: 'all', label: 'Tous les services' }
                ].map(tab => (
                    <div
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>

            <FormControl component="fieldset" fullWidth>
                <RadioGroup
                    aria-label="service"
                    name="service"
                    onChange={handleServiceChange}
                    value={selectedService?.url || ''}
                >
                    {filteredServices.map((service, index) => (
                        <div
                            key={`${service.url}-${index}`}
                            className={`service-container ${expandedService === service.url ? 'expanded' : ''}`}
                            onClick={(e) => handleServiceClick(service.url, e)}
                        >
                            <div className="service-label-container">
                                <FormControlLabel
                                    value={service.url}
                                    control={<Radio />}
                                    label={<Markdown text={service.summary} />}
                                />
                                <ExpandMoreIcon className="arrow-icon" />
                            </div>
                            <Collapse in={expandedService === service.url}>
                                <div className="service-details">
                                    <Markdown text={service.description} />
                                    {service.descriptionLink && (
                                        <a
                                            href={service.descriptionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="service-link"
                                        >
                                            En savoir plus
                                        </a>
                                    )}
                                </div>
                            </Collapse>
                        </div>
                    ))}
                </RadioGroup>
            </FormControl>
        </div>
    );
};

export default memo(ProcessingFormConfiguration);
