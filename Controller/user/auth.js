const logic=require("../../JS/authLogics");
const emailServices=require("../../JS/mailWorks");

async function sendOtpRegistration(req,res) {
  const {email}=req.body;

  if(!email){
    return res.status(400).json({code:"-1",message:"Email is required."});
  }
  
  logic.checkUserPresence(email)
  .then(async (check)=>{
    if(check==true){
      return res.status(200).json({code:0,message:"Email all ready exist."});
    }

    try{
      const sent=await emailServices.sendOtp(email);
      if(sent){
        return res.json({code:1,message:"OTP sent."});
      }

      throw new Error("Could not send mail.");
    }catch(err){
      return res.json({code:0,message:err.message});
    }

  }).catch(err=>{
    return res.status(500).json({code:-1,message:err.message});
  });
}

async function VerifyOtp(req,res) {

  const {email,otp}=req.body;

    try{
      const verifed=await logic.verifyOtp(email,otp);

      if(verifed){
        const token=await logic.storeToken(email);

        return res.json({code:1,message:"Email Verified.",token:token,tokenMessage:"Valid for 30 minutes."});
      }

      return res.json({code:0,message:"Incorrect OTP."});
    }catch(err){
      return res.json({code:-1,message:err.message});
    }
}

module.exports={
  sendOtpRegistration,
  VerifyOtp,
}