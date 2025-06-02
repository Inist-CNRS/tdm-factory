import environment from '~/lib/config';
import { templatesFiles } from '~/lib/files';
import { mailLogger } from '~/lib/logger';

import nodemailer from 'nodemailer';
import nunjucks from 'nunjucks';

// To get the number of days before expiration for processing-finished.njk
const nunjucksEnv = nunjucks.configure(templatesFiles(), {
    autoescape: true,
    noCache: true,
    watch: false
});

nunjucksEnv.addGlobal('config', environment);

const transporter = nodemailer.createTransport(environment.smtp);

transporter.on('error', (err) => {
    mailLogger.error(err.message);
});

transporter
    .verify()
    .then(() => {
        mailLogger.info('Connected to smtp server!');
    })
    .catch((error) => {
        mailLogger.error("Can't connect to smtp server!");
        mailLogger.error(error);
    });

export type DefaultMailData = {
    processingId: string;
    originalName: string;
    wrapper: string;
    wrapperParam: string;
    enrichment: string;
    serviceName?: string;
};

export type StartedMailOptions = {
    email: string;
    data: DefaultMailData & {
        statusPage: string;
    };
};

const getServiceName = (flowId: string | null): string => {
    if (!flowId) return '';
    const flow = environment.flows.find(f => f.id === flowId);
    if (!flow) return '';
    const match = flow.summary.match(/\*\*(.*?)\*\*/);
    return match ? match[1] : flow.summary;
};

export const sendStartedMail = async (processingId: string, originalName: string, wrapper: string, wrapperParam: string, enrichment: string, email: string, flowId: string | null) => {
    const serviceName = getServiceName(flowId);
    const mailData: DefaultMailData = {
        processingId,
        originalName,
        wrapper,
        wrapperParam,
        enrichment,
        serviceName
    };
    try {
        const html = nunjucks.render('processing-started.njk', mailData);
        const text = nunjucks.render('processing-started-text.njk', mailData);

        await transporter.sendMail({
            from: environment.mailFrom ?? 'dev@local',
            to: email,
            subject: `IA Factory - Notification de création - Traitement ${processingId}`,
            html,
            text,
        });
        mailLogger.info(`Notification email for processing '${processingId}' send`);
    } catch (e) {
        mailLogger.error(`Can't send notification email for processing '${processingId}'`);
    }
};

export type FinishedMailOptions = {
    email: string;
    data: DefaultMailData & {
        resultFile: string;
    };
};

export const sendFinishedMail = async (processingId: string, originalName: string, wrapper: string, wrapperParam: string, enrichment: string, email: string, flowId: string | null) => {
    const serviceName = getServiceName(flowId);
    const mailData: DefaultMailData = {
        processingId,
        originalName,
        wrapper,
        wrapperParam,
        enrichment,
        serviceName
    };
    try {
        const html = nunjucks.render('processing-finished.njk', mailData);
        const text = nunjucks.render('processing-finished-text.njk', mailData);

        await transporter.sendMail({
            from: environment.mailFrom ?? 'dev@local',
            to: email,
            subject: `IA Factory - Résultat - Traitement ${processingId}`,
            html,
            text,
        });
        mailLogger.info(`Result email for processing '${processingId}' send`);
    } catch (e) {
        mailLogger.error(`Can't send result email for processing '${processingId}'`);
    }
};

export type ErrorMailOptions = {
    email: string;
    data: DefaultMailData & {
        errorMessage: string;
    };
};

export const sendErrorMail = async (processingId: string, originalName: string, wrapper: string, wrapperParam: string, enrichment: string, email: string, flowId: string | null) => {
    const serviceName = getServiceName(flowId);
    const mailData: DefaultMailData = {
        processingId,
        originalName,
        wrapper,
        wrapperParam,
        enrichment,
        serviceName
    };
    try {
        const html = nunjucks.render('processing-error.njk', mailData);
        const text = nunjucks.render('processing-error-text.njk', mailData);

        await transporter.sendMail({
            from: environment.mailFrom ?? 'dev@local',
            to: email,
            subject: `IA Factory - Rapport d'erreur - Traitement ${processingId}`,
            html,
            text,
        });
        mailLogger.info(`Error email for processing '${processingId}' send`);
    } catch (e) {
        mailLogger.error(`Can't send error email for processing '${processingId}'`);
    }
};
