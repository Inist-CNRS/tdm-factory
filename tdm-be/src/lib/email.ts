import nodemailer from 'nodemailer';
import nunjucks from 'nunjucks';
import environment from '~/lib/config';
import { templatesFiles } from '~/lib/files';
import { mailLogger } from '~/lib/logger';

nunjucks.configure(templatesFiles());

const transporter = nodemailer.createTransport(environment.smtp);

transporter.on('error', (err) => {
    mailLogger.error(err.message);
});

transporter
    .verify()
    .then(() => {
        mailLogger.info('Connected to smtp server!');
    })
    .catch((reason) => {
        mailLogger.error("Can't connect to smtp server!");
        mailLogger.error(reason);
    });

export type DefaultMailData = {
    processingId: string;
    originalName: string;
    wrapper: string;
    wrapperParam: string;
    enrichment: string;
};

export type StartedMailOptions = {
    email: string;
    data: DefaultMailData & {
        statusPage: string;
    };
};

export const sendStartedMail = async (options: StartedMailOptions) => {
    try {
        const text = nunjucks.render('processing-started.njk', options.data);

        await transporter.sendMail({
            from: 'no-reply@inist.fr',
            to: options.email,
            subject: `IA Factory - Notification de creation - Traitement ${options.data.processingId}`,
            text,
        });
        mailLogger.info(`Notification email for processing '${options.data.processingId}' send`);
    } catch (e) {
        mailLogger.error(`Can't send notification email for processing '${options.data.processingId}'`);
    }
};

export type FinishedMailOptions = {
    email: string;
    data: DefaultMailData & {
        resultFile: string;
    };
};

export const sendFinishedMail = async (options: FinishedMailOptions) => {
    try {
        const text = nunjucks.render('processing-finished.njk', options.data);

        await transporter.sendMail({
            from: 'no-reply@inist.fr',
            to: options.email,
            subject: `IA Factory - Résultat - Traitement ${options.data.processingId}`,
            text,
        });
        mailLogger.info(`Result email for processing '${options.data.processingId}' send`);
    } catch (e) {
        mailLogger.error(`Can't send result email for processing '${options.data.processingId}'`);
    }
};

export type ErrorMailOptions = {
    email: string;
    data: DefaultMailData & {
        errorMessage: string;
    };
};

export const sendErrorMail = async (options: ErrorMailOptions) => {
    try {
        const text = nunjucks.render('processing-error.njk', options.data);

        await transporter.sendMail({
            from: 'no-reply@inist.fr',
            to: options.email,
            subject: `IA Factory - Rapport d'erreur - Traitement ${options.data.processingId}`,
            text,
        });
        mailLogger.info(`Error email for processing '${options.data.processingId}' send`);
    } catch (e) {
        mailLogger.error(`Can't send error email for processing '${options.data.processingId}'`);
    }
};
