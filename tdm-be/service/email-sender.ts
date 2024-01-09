import nodemailer from 'nodemailer';
import environment from '../environment';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  attachments?: any[];
}

async function sendEmail(options: EmailOptions): Promise<any> {
  try {
    const smtpConfig = environment.smtp;

    const transporter = nodemailer.createTransport({
      service: smtpConfig.service,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
    });

    const mailOptions = {
      ...options,
      from: smtpConfig.auth.user
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export { sendEmail };