import nodemailer from 'nodemailer';
import environment from '~/lib/config';
import { mailLogger } from '~/lib/logger';

export type EmailOptions = {
    to: string;
    subject: string;
    text: string;
    attachments?: any[];
};

async function sendEmail(options: EmailOptions): Promise<any> {
    try {
        const smtpConfig = environment.smtp;

        const transporter = nodemailer.createTransport(smtpConfig);

        const mailOptions = {
            ...options,
            from: 'noreply@inist.fr',
        };

        const info = await transporter.sendMail(mailOptions);

        transporter.close();

        mailLogger.info('Email sent:', info.response);
        return info;
    } catch (error) {
        mailLogger.error('Error sending email:', error);
        throw error;
    }
}

export { sendEmail };
