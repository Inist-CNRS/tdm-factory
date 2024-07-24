import config from '~/lib/config';

import { createLogger, format, transports } from 'winston';

import type { Logger } from 'winston';

export const loggerName: string[] = [];

/**
 * Create a winston logger with an associated label
 * @param name Label use with the logger
 */
const create = (name: string): Logger => {
    loggerName.push(name);

    return createLogger({
        format: format.combine(
            format.label({ label: name }),
            format.timestamp(),
            format.printf((info) => {
                return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
            }),
        ),
        transports: [
            new transports.Console({
                level: config.verbose,
            }),
            new transports.File({
                filename: name === 'default' ? 'logs/combined.log' : `logs/${name}-combined.log`,
            }),
            new transports.File({
                level: 'debug',
                filename: name === 'default' ? 'logs/debug.log' : `logs/${name}-debug.log`,
            }),
        ],
    });
};

/**
 * Default logger, the logger can be used for general propos
 */
export const defaultLogger: Logger = create('default');
/**
 * Logger use by the express http server
 */
export const httpLogger: Logger = create('http');
/**
 * Logger use to log mail process
 */
export const mailLogger: Logger = create('mail');
/**
 * Logger use to log cron process
 */
export const cronLogger: Logger = create('cron');
/**
 * Logger use to log database process
 */
export const databaseLogger: Logger = create('database');
/**
 * Logger use to log worker process
 */
export const workerLogger: Logger = create('worker');

export default defaultLogger;
