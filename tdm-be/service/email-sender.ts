import nodemailer from 'nodemailer';
import fs from 'fs';
const rawdata = fs.readFileSync('config.json', 'utf-8');
const environment = JSON.parse(rawdata);
export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  attachments?: any[];
}

async function sendEmail(options: EmailOptions): Promise<any> {
  try {
    const smtpConfig = environment.smtp;

    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
      ...options,
      from: 'noreply@inist.fr'
    };

    const info = await transporter.sendMail(mailOptions);

    transporter.close();

    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export { sendEmail };