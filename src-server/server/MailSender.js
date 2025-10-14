/* eslint-disable no-console */
"use strict";
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import textEmailTemplate from './email-template/duv-text-email-template';
import sgMail from '@sendgrid/mail'; 

const DUV_LIVE_NO_REPLY_EMAIL = 'DUV LIVE <donotreply@duvlive.com>';
const DUV_LIVE_INFO_EMAIL = 'duvlive@gmail.com';
const emailLogo = `https://duvlive.com/email-logo.png`;

const mgClient = new Mailgun(formData);
const mg = mgClient.client({ username: 'api', key: process.env.MAILGUN_API_KEY });

export function generateEmailTemplate(options) {
  return new Promise((resolve, reject) => {
    return ejs.renderFile(
      __dirname + '/email-template/duv-html-email-template.ejs',
      { ...options, emailLogo },
      function (err, html) {
        if (err) {
          return reject(err);
        } else {
          const text = textEmailTemplate(options);
          return resolve({ html, text });
        }
      }
    );
  });
}

export default async function sendMail(content, user, additionalOptions = {}) {
  const options = {
    ...content,
    ...additionalOptions,
    firstName: user.firstName,
  };

  const { html, text } = await generateEmailTemplate(options);

  const message = {
    from: DUV_LIVE_NO_REPLY_EMAIL,
    to: `${user.email}`,
    subject: `${options.subject}`,
    text,
    html,
    'h:Reply-To': options.userEmail || DUV_LIVE_INFO_EMAIL,
  };

  
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const sgMessage = {
        to: message.to,
        from: message.from,
        subject: message.subject,
        text: message.text,
        html: message.html,
        replyTo: message['h:Reply-To'],
      };

      const [response] = await sgMail.send(sgMessage);
      console.log(' SendGrid response status:', response.statusCode);
      return response;
    } catch (err) {
      console.error('SendGrid send error:', err && err.toString ? err.toString() : err);
      if (err?.response?.body) {
        console.error('SendGrid error body:', err.response.body);
      }
      // fall through to Mailgun if SendGrid fails
    }
  }

  //  Fallback to Mailgun API (still Railway-safe)
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, message);
    console.log('Mailgun API result:', result);
    return result;
  } catch (error) {
    console.error('Mailgun send error:', error && error.toString ? error.toString() : error);
  }
}
