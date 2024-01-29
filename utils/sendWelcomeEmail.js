const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const config = require("config");
const fs = require("fs");
const { error, log } = require("console");

const sendWelcomeEmail = async (recipientEmail) => {
  //Sending Email
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587, //587,25
    secure: false, //true for 465, false for other ports
    auth: {
      user: config.get("email"),
      pass: config.get("password"),
    },
  });

  const emailTemplateFile = fs.readFileSync(
    "emailtemplates/emailverified.html",
    "utf8"
  );

  const template = handlebars.compile(emailTemplateFile);
  const replacements = {
    email: recipientEmail,
  };

  const emailHtml = template(replacements);

  const mailOptions = {
    from: config.get("email"),
    bcc: "simonblacke@outlook.com",
    to: recipientEmail,
    subject: "Welcome to Uptuned",
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

module.exports = sendWelcomeEmail;
