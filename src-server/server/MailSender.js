/* eslint-disable no-console */
"use strict";
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { MailtrapClient } = require("mailtrap");
const textEmailTemplate = require("./email-template/duv-text-email-template");

const DUV_LIVE_NO_REPLY_EMAIL = { email: "donotreply@duvlive.com", name: "DUV LIVE" };
const DUV_LIVE_INFO_EMAIL = "duvlive@gmail.com";
// const emailLogo = `https://duvlive.com/email-logo.png`;
const logoPath = path.resolve(__dirname, "email-template/assets/red-white.svg");

const mailtrap = new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN });


const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

function generateEmailTemplate(options) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(
      path.join(__dirname, "email-template/duv-html-email-template.ejs"),
      { ...options, emailLogo },
      (err, html) => {
        if (err) return reject(err);
        const text = textEmailTemplate(options);
        resolve({ html, text });
      }
    );
  });
}

async function sendViaGmail(message) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_SENDER_EMAIL,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `${DUV_LIVE_NO_REPLY_EMAIL.name} <${DUV_LIVE_NO_REPLY_EMAIL.email}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments,
      replyTo: message.replyTo,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Gmail Fallback Sent:", info.response);
    return info;
  } catch (error) {
    console.error(" Gmail Fallback Error:", error);
  }
}

async function sendMail(content, user, additionalOptions = {}) {
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
    replyTo: options.userEmail || DUV_LIVE_INFO_EMAIL,
    attachments: [
      {
        filename: "duv-logo.svg",
        content: fs.readFileSync(logoPath).toString("base64"),
        encoding: "base64",
        contentType: "image/svg+xml",
        disposition: "inline",
        contentId: "duv_logo",
      },
    ],
  };


  if (process.env.MAILTRAP_API_TOKEN) {
    try {
      const response = await mailtrap.send({
        from: message.from,
        to: [{ email: message.to }],
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments,
      });
      console.log("Mailtrap API result:", response);
      return response;
    } catch (error) {
      console.error("Mailtrap send error, using Gmail fallback:", error);
      // Fallback to Gmail
      return sendViaGmail(message);
    }
  } else {
    // Mailtrap not configured → go straight to Gmail
    return sendViaGmail(message);
  }
}

module.exports = sendMail;
