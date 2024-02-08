import { readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises';

export class SwaggerApi {
    url: string = '';
    retrieveUrl?: string;
    tags: Tag[] = [];
}

export class Tag {
    name: string = '';
    excluded?: string[] = [];
}

export class Mail {
    subject: string = '';
    text: string = '';
}

type ConfigType = {
    wrappers: SwaggerApi[];
    enrichments: SwaggerApi[];
    mailSuccess: Mail;
    mailError: Mail;
}

export class Config {
    private readonly config: ConfigType;
    constructor() {
        let localConfig: Partial<ConfigType>;
        try {
            const rawLocalConfig = readFileSync('dynamic-config.json', 'utf-8');
            localConfig = JSON.parse(rawLocalConfig);
        } catch (e) {
            console.error('No dynamic config file found')
            localConfig = {};
        }

        this.config = {
            wrappers: localConfig.wrappers ?? [
                {
                    url: 'https://data-wrapper.services.istex.fr',
                    tags: [{
                        name: 'data-wrapper',
                        excluded: []
                    }]
                }
            ],
            enrichments: localConfig.enrichments ?? [
                {
                    url: 'https://data-computer.services.istex.fr',
                    retrieveUrl: '/v1/retrieve',
                    tags: [{
                        name: 'data-computer',
                        excluded: ['/v1/collect', '/v1/retrieve', '/v1/mock-error-async', '/v1/mock-error-sync']
                    }]
                }
            ],
            mailSuccess: localConfig.mailSuccess ?? {
                subject: 'Objet du mail succès',
                text: 'Vous pouvez télécharger le fichier enrichi à l\'adresse ci-dessous'
            },
            mailError: localConfig.mailError ?? {
                subject: 'Objet du mail d\'erreur',
                text: 'Une erreur s\'est produite lors de l\'enrichissement'
            }
        }
        console.info('Dynamic config loaded');
        this.saveConfig();
    }

    private saveConfig() {
        writeFile(
            'dynamic-config.json',
            JSON.stringify(this.config),
            'utf-8'
        ).then(() => {
            console.info('Dynamic config successfully written to disk')
        })
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
}

const singleton = new Config()

module.exports = singleton;
