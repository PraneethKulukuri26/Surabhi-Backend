export const MAIL=process.env.NODE_MAIL;
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

module.exports=transporter;