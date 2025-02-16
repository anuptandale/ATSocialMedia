// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "anupdineshtandale@gmail.com",
    pass: "usgikbutnzcfouav",
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(to, text, html) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: 'anupdineshtandale@gmail.com', // sender address
    to, // list of receivers
    subject: "Mail from AT Social Media Application", // Subject line
    text, // plain text body
    html, // html body
  });

  
}

export default sendMail;