const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const config = require("config");
const fs = require("fs");
const { error, log } = require("console");

const sendSignUpEmail = async (recipientEmail, newOTP) => {
  //Sending Email
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 587,
    secure: false, //true for 465, false for other ports
    auth: {
      user: config.get("email"),
      pass: config.get("password"),
    },
  });

  const emailTemplateFile = fs.readFileSync(
    "emailtemplates/signupotp.html",
    "utf8"
  );

  const template = handlebars.compile(emailTemplateFile);
  const replacements = {
    email: recipientEmail,
    otp: newOTP,
  };

  const emailHtml = template(replacements);

  const mailOptions = {
    from: config.get("email"),
    bcc: "simeon.ola.bb@gmail.com",
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

module.exports = sendSignUpEmail;
