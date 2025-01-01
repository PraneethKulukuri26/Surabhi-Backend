const MAIL=process.env.NODE_MAIL;
const PASSWORD=process.env.NODE_PASSWORD;
const HOST=process.env.NODE_HOST;
const PORT=process.env.NODE_PORT;

const nodemailer=require("nodemailer");

const transporter=nodemailer.createTransport({
  host:HOST,  
  secureConnection:false,
  port:PORT,
  tls:{
    chipers: 'SSLv3'
  },
  auth:{
    user:MAIL,
    pass:PASSWORD
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("Transporter verification failed:", err.message || err);
  } else {
    console.log("Transporter is ready to send emails.");
  }
});

module.exports={
  MAIL,
  transporter,
};