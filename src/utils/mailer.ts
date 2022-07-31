import nodemailer, { SentMessageInfo } from 'nodemailer';
import dotenv from 'dotenv';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IUser } from '../models/User.model';

dotenv.config();

const options: SMTPTransport.Options = {
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
};

export const transporter = nodemailer.createTransport(options);

/**
 * Verify if the transporter of nodemailer is success.
 * @returns {boolean}
 */
export const verify = async (): Promise<boolean> => {
  try {
    if (await transporter.verify()) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

export const sendRegisterMail = async (user: IUser): Promise<SentMessageInfo | null> => {
  const appName = process.env.APP_NAME;
  const body = /* html */ `
  <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <title></title>
      <style>
        
      </style>
    </head>
    <body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
      <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
        <h1>${appName}</h1>
        <p>Bienvenido a la plataforma ${user.name}</p>
      </div>
    </body>
  </html>
  `;

  if (await verify()) {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_USERNAME}" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: `Bienvenido a ${appName}`,
      text: `Bienvenido ${user.name} a este nuevo proyecto, gracias por acompañarnos`,
      html: body,
    });

    return info;
  }

  return null;
};
