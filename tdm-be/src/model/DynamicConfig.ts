import logger from '~/lib/logger';

import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

export class Tag {
    name = '';
    excluded?: string[] = [];
}

export class SwaggerApi {
    url = '';
    retrieveUrl?: string;
    tags: Tag[] = [];
}

export class Mail {
    subject = '';
    text = '';
}

type ConfigType = {
    wrappers: SwaggerApi[];
    enrichments: SwaggerApi[];
    mailSuccess: Mail;
    mailError: Mail;
};

export class DynamicConfig {
    private readonly config: ConfigType;
    constructor() {
        let localConfig: Partial<ConfigType>;
        try {
            const rawLocalConfig = readFileSync('dynamic-config.json', 'utf-8');
            localConfig = JSON.parse(rawLocalConfig);
        } catch (e) {
            logger.error('No dynamic config file found');
            localConfig = {};
        }

        this.config = {
            wrappers: localConfig.wrappers ?? [
                {
                    url: 'https://data-wrapper.services.istex.fr',
                    tags: [
                        {
                            name: 'data-wrapper',
                            excluded: ['/v1/fields/csv'],
                        },
                    ],
                },
            ],
            enrichments: localConfig.enrichments ?? [
                {
                    url: 'https://data-computer.services.istex.fr',
                    retrieveUrl: '/v1/retrieve',
                    tags: [
                        {
                            name: 'data-computer',
                            excluded: [
                                '/v1/collect',
                                '/v1/retrieve',
                                '/v1/retrieve-csv',
                                '/v1/retrieve-json',
                                '/v1/mock-error-async',
                                '/v1/mock-error-sync',
                            ],
                        },
                    ],
                },
                {
                    url: 'https://data-termsuite.services.istex.fr',
                    retrieveUrl: '/v1/retrieve',
                    tags: [
                        {
                            name: 'data-termsuite',
                            excluded: ['/v1/retrieve', '/v1/retrieve-csv', '/v1/retrieve-json'],
                        },
                    ],
                },
            ],
            mailSuccess: localConfig.mailSuccess ?? {
                subject: 'Objet du mail succès',
                text: "Vous pouvez télécharger le fichier enrichi à l'adresse ci-dessous",
            },
            mailError: localConfig.mailError ?? {
                subject: "Objet du mail d'erreur",
                text: "Une erreur s'est produite lors de l'enrichissement",
            },
        };
        logger.info('Dynamic config loaded');
        this.saveConfig();
    }

    getConfig(): ConfigType {
        return this.config;
    }
    setConfig(data: Partial<ConfigType>) {
        let hasChange = false;

        if (data.wrappers) {
            hasChange = true;
            this.config.wrappers = data.wrappers;
        }

        if (data.enrichments) {
            hasChange = true;
            this.config.enrichments = data.enrichments;
        }

        if (data.mailSuccess) {
            hasChange = true;
            this.config.mailSuccess = data.mailSuccess;
        }

        if (data.mailError) {
            hasChange = true;
            this.config.mailError = data.mailError;
        }

        if (hasChange) {
            this.saveConfig();
        }
    }

    private saveConfig() {
        writeFile('dynamic-config.json', JSON.stringify(this.config), 'utf-8').then(() => {
            logger.info('Dynamic config successfully written to disk');
        });
    }
}

const singleton = new DynamicConfig();

export default singleton;
