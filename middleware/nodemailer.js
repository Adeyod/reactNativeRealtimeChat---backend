import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.SECURE,
  service: process.env.SERVICE,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const verifyEmailTemplatePath = join(
  __dirname,
  'emailTemplates',
  'verifyEmail.html'
);

const verifyEmailTemplate = readFileSync(verifyEmailTemplatePath, 'utf8');

const forgotPasswordTemplatePath = join(
  __dirname,
  'emailTemplates',
  'forgotPassword.html'
);

const forgotPasswordTemplate = readFileSync(forgotPasswordTemplatePath, 'utf8');

const verifyEmail = async (token, email, name) => {
  try {
    const verifyEmailContent = verifyEmailTemplate
      .replace('{{token}}', token)
      .replace('{{name}}', name);
    const info = await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: 'Please use the token to verify your email',
      html: verifyEmailContent,
    });
  } catch (error) {
    console.log(error);
  }
};

const forgotPasswordMail = async (token, email, name) => {
  const forgotPasswordContent = forgotPasswordTemplate
    .replace('{{token}}', token)
    .replace('{{name}}', name);

  try {
    const info = await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: 'Password Reset',
      html: forgotPasswordContent,
    });

    return info;
  } catch (error) {
    console.log(error);
  }
};

export { verifyEmail, forgotPasswordMail };
