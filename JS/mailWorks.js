const authLogics=require("./authLogics");
const transporter=require("../Config/mail");
const fs = require("fs");
const path = require("path");

async function sendOtp(email){
  const otp=Math.floor(100000 + Math.random() * 900000).toString();

  authLogics.saveOTP(email,otp)
  .then(async ()=>{
    try{
      const templatePath=path.join(__dirname,"../Templates/otpTemplate.html");
      let htmlContent = fs.readFileSync(templatePath, "utf8");
      htmlContent=htmlContent.replace("{{otp}}",otp);

      const mailOptions = {
        from: transporter.MAIL,
        to: email,
        subject: "Your OTP Code",
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      return true;
    }catch(err){
      try{
        await authLogics.deleteOtp(email);
      }finally{
        throw new Error("Failed to send OTP.")
      }
    }
  }).catch(err=>{
    throw new Error("Failed to send OTP.");
  });

}

module.exports={
  sendOtp,
}