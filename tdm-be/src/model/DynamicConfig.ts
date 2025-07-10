import logger from '~/lib/logger';
import defaultConfig from '~/model/json/DefaultDynamicConfig.json';

import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';

export class Tag {
    name = '';
    excluded?: string[] = [];
}

export class SwaggerApi {
    url = '';
    retrieveUrl?: {
        url: string;
        fileExtension: string;
    };
    tags: Tag[] = [];
}

type ConfigType = {
    wrappers: SwaggerApi[];
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
            wrappers: localConfig.wrappers ?? defaultConfig.wrappers,
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
