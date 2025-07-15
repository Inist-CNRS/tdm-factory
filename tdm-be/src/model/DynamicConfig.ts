import logger from '~/lib/logger';

type ConfigType = Record<string, never>;

export class DynamicConfig {
    private readonly config: ConfigType;
    constructor() {
        this.config = {};
        logger.info('Dynamic config loaded (empty)');
    }

    getConfig(): ConfigType {
        return this.config;
    }
    setConfig() {
        // No configuration to set anymore
        // This method is kept for backward compatibility
    }
}

const singleton = new DynamicConfig();

export default singleton;
