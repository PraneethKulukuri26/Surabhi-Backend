const authLogics = require("./authLogics");
const {transporter} = require("../Config/mail");
const fs = require("fs");
const path = require("path");

async function sendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await authLogics.saveOTP(email, otp);

    const templatePath = path.join(__dirname, "../Templates/otpTemplate.html");
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at path: ${templatePath}`);
    }

    let htmlContent = fs.readFileSync(templatePath, "utf8");
    htmlContent = htmlContent.replace("[OTP]", otp);

    const mailOptions = {
      from: transporter.MAIL,
      to: email,
      subject: "Your OTP Code",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
    return true;
  } catch (err) {
    console.error("Error in sendOtp:", err.message || err);

    try {
      await authLogics.deleteOtp(email);
    } catch (cleanupErr) {
      console.error("Error during OTP cleanup:", cleanupErr.message || cleanupErr);
    }

    throw new Error("Failed to send OTP.");
  }
}

module.exports = {
  sendOtp,
};
