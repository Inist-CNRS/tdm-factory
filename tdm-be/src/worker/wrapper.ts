import axios from 'axios';
import fs from 'fs';
import type { Traitment } from '~/model/Traitment';
import environment from '~/lib/config';
import { randomFileName, tmpFile } from '~/lib/files';
import logger from '~/lib/logger';
import Status from '~/model/Status';
import { enrichment } from '~/worker/enrichment';

export const wrapper = async (url: string, fileData: Buffer, traitment: Traitment, urlEnrichment: string) => {
    axios
        .post(url, fileData, {
            responseType: 'arraybuffer',
            params: {
                value: traitment.wrapper.parameters?.find((p) => p.name === 'value')?.value,
            },
            timeout: 600000,
        })
        .then(
            (wrapperRes) => {
                const bin: Buffer = Buffer.from(wrapperRes.data, 'binary');
                const dumpFilePath = tmpFile(`${randomFileName()}.tar.gz`);
                fs.writeFileSync(dumpFilePath, bin);
                const fd = fs.readFileSync(dumpFilePath);
                logger.info(`Wrapper Done for ${traitment.timestamp}`);
                const conf = {
                    headers: {
                        'X-Webhook-Success': `${
                            environment.hosts.internal.isHttps ? 'https' : 'http'
                        }://${environment.hosts.internal.host}/webhook/success?id=${traitment.timestamp}`,
                        'X-Webhook-Failure': `${
                            environment.hosts.internal.isHttps ? 'https' : 'http'
                        }://${environment.hosts.internal.host}/webhook/failure?id=${traitment.timestamp}`,
                    },
                    timeout: 600000,
                };
                traitment.status = Status.ENRICHMENT_RUNNING;
                enrichment(urlEnrichment, fd, conf, traitment);
            },
            (error) => {
                traitment.status = Status.WRAPPER_ERROR;
                logger.error(`Wrapper Error for ${traitment.timestamp}`);
                logger.error(error);
            },
        );
};
