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

// Pour le traitement dans la base
export type ProcessingFormConfigurationValueType = {
    wrapper: Wrapper | null;
    wrapperParam: string | null;
    enrichment: Enrichment | null;
    inputFormat?: string | null;
    flowId: string | null;
    fields?: string[] | null;
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
    enrichmentList,
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
    });

    const availableServices: ServiceInfo[] = useMemo(() => {
        if (!config) return [];

        return config.flows
            .filter(flow => flow.input === type)
            .map(flow => ({
                ...flow,
                flowId: flow.id
            }))
            .filter(service => service.inputFormat === value.inputFormat || service.inputFormat === "*");
    }, [config, enrichmentList, type, value.inputFormat]);

    // Determine which categories have services
    const hasFeaturedServices = useMemo(() =>
        availableServices.some(service => service.featured),
        [availableServices]
    );

    const hasAdvancedServices = useMemo(() =>
        availableServices.some(service => !service.featured),
        [availableServices]
    );

    // Get available tabs based on which categories have services
    const availableTabs = useMemo(() => {
        const tabs = [];
        if (hasFeaturedServices) tabs.push({ id: 'featured', label: 'Services à la une' });
        if (hasAdvancedServices) tabs.push({ id: 'advanced', label: 'Services avancés' });

        if (hasFeaturedServices || hasAdvancedServices) {
            tabs.push({ id: 'all', label: 'Tous les services' });
        }

        return tabs;
    }, [hasFeaturedServices, hasAdvancedServices]);

    useEffect(() => {
        if (!hasAdvancedServices && hasFeaturedServices) {
            setActiveTab('featured');
        }
        else if (!hasFeaturedServices && hasAdvancedServices) {
            setActiveTab('advanced');
        }
        else if (activeTab === 'featured' && !hasFeaturedServices) {
            setActiveTab(hasAdvancedServices ? 'advanced' : 'all');
        } else if (activeTab === 'advanced' && !hasAdvancedServices) {
            setActiveTab(hasFeaturedServices ? 'featured' : 'all');
        }
        else if (!hasFeaturedServices && !hasAdvancedServices) {
            setActiveTab('all');
        }
    }, [activeTab, hasFeaturedServices, hasAdvancedServices]);

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
        const newService = availableServices.find((service) => service.flowId === event.target.value);
        console.log(availableServices.map(service => service.flowId));
        console.log(event.target.value);
        console.log('newService', newService);
        if (newService !== selectedService) {
            setSelectedService(newService ?? null);
            console.log('selectedService', selectedService);
        }
    }, [availableServices, selectedService]);

    const handleServiceClick = useCallback((serviceFlowId: string, event: React.MouseEvent<HTMLDivElement>) => {
        const isInteractive = (event.target as HTMLElement).closest('.MuiRadio-root, a');
        if (!isInteractive) {
            setExpandedService(prev => prev === serviceFlowId ? null : serviceFlowId);
        }
    }, []);

    useEffect(() => {
        if (!selectedService || !config) return;
        const matchingFlow = config.flows.find(flow => {
            const matchesService = getServicePath(flow.enricher) === getServicePath(selectedService.enricher);
            const matchesFormat = flow.inputFormat === value.inputFormat || flow.inputFormat === "*";
            const matchesType = flow.input === type;

            return matchesService && matchesFormat && matchesType;
        });

        if (matchingFlow) {
            const wrapper = wrapperList.find(w => {
                const wrapperPath = getServicePath(w.url);
                const flowWrapperPath = getServicePath(matchingFlow.wrapper);
                const matches = wrapperPath === flowWrapperPath;
                return matches;
            });

            if (wrapper) {
                const wrapperParam = matchingFlow.wrapperParameterDefault ||
                    matchingFlow.wrapperParameter ||
                    '';

                onChange({
                    wrapper: wrapper,
                    wrapperParam: wrapperParam,
                    enrichment: { ...selectedService, url: selectedService.enricher, label: selectedService.summary, parameters: [] },
                    flowId: matchingFlow.id,
                    inputFormat: matchingFlow.inputFormat
                });
            }
        }
    }, [selectedService, config, wrapperList, onChange, value.inputFormat, type]);

    useEffect(() => {
        const isValid = !!selectedService && !!config && config.flows.some(flow =>
            getServicePath(flow.enricher) === getServicePath(selectedService.enricher)
        );
        onValidityChange(isValid);
    }, [selectedService, config, onValidityChange]);

    if (isPending || isConfigLoading) {
        return <CircularWaiting />;
    }

    return (
        <div className="processing-form-configuration">
            <h3>Choisir un service</h3>
            {hasFeaturedServices && hasAdvancedServices ? (
                <div className="service-tabs">
                    {availableTabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
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
                    {filteredServices.map((service, index) => (
                        // Service card
                        <div
                            key={`${service.flowId}-${index}`}
                            className={`service-container ${expandedService === service.flowId ? 'expanded' : ''}`}
                            onClick={(e) => handleServiceClick(service.flowId, e)}
                        >
                            <div className="service-label-container">
                                <FormControlLabel
                                    value={service.flowId}
                                    control={<Radio />}
                                    label={<Markdown text={service.summary} />}
                                />
                                <ExpandMoreIcon className="arrow-icon" />
                            </div>
                            <Collapse in={expandedService === service.flowId}>
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
