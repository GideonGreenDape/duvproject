/* eslint-disable no-console */
"use strict";
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require("mailersend");
const textEmailTemplate = require("./email-template/duv-text-email-template");

const DUV_LIVE_NO_REPLY_EMAIL = { email: "donotreply@duvlive.com", name: "DUV LIVE" };
const DUV_LIVE_INFO_EMAIL = "duvlive@gmail.com";
const logoPath = path.resolve(__dirname, "email-template/assets/red-white.svg");

// Initialize MailerSend client
const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_TOKEN,
});

function generateEmailTemplate(options = {}) {
  console.log("📨 [generateEmailTemplate] options received:", options);

  return new Promise((resolve, reject) => {
    ejs.renderFile(
      path.join(__dirname, "email-template/duv-html-email-template.ejs"),
      { ...options, logoPath },
      (err, html) => {
        if (err) {
          console.error("❌ [EJS render error]", err);
          return reject(err);
        }

        console.log("✅ [generateEmailTemplate] Rendering text version...");
        const text = textEmailTemplate(options || {});
        resolve({ html, text });
      }
    );
  });
}

async function sendMail(content = {}, user = {}, additionalOptions = {}) {
  console.log("🚀 [sendMail] called with content:", content);
  console.log("👤 [sendMail] user:", user);
  console.log("⚙️ [sendMail] additionalOptions:", additionalOptions);

  const options = {
    ...content,
    ...additionalOptions,
    firstName: user.firstName,
  };

  console.log("🧾 [sendMail] merged options:", options);

  const { html, text } = await generateEmailTemplate(options);

  const message = {
    from: DUV_LIVE_NO_REPLY_EMAIL,
    to: `${user.email || ""}`,
    subject: `${options.subject || ""}`,
    text: text || "",
    html: html || "",
    replyTo: options.userEmail || DUV_LIVE_INFO_EMAIL,
    attachments: [
      {
        content: fs.existsSync(logoPath)
          ? fs.readFileSync(logoPath).toString("base64")
          : "",
        filename: "duv-logo.svg",
        type: "image/svg+xml",
        disposition: "inline",
        content_id: "duv_logo",
      },
    ],
  };

  try {
    console.log("📤 [MailerSend] Preparing to send message to:", message.to);

    const sentFrom = new Sender(message.from.email, message.from.name);
    const recipients = message.to ? [new Recipient(message.to)] : [];
    const attachments = (message.attachments || []).map(
      (a) =>
        new Attachment({
          content: a.content,
          filename: a.filename,
          disposition: a.disposition,
          id: a.content_id,
          type: a.type,
        })
    );

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(message.subject)
      .setHtml(message.html)
      .setText(message.text)
      .setAttachments(attachments)
      .setReplyTo(message.replyTo);

    const response = await mailersend.email.send(emailParams);

    console.log("✅ [MailerSend API result]:", response);
    return response;
  } catch (error) {
    console.error("❌ [MailerSend send error]:", error);
    throw error;
  }
}

module.exports = sendMail;
