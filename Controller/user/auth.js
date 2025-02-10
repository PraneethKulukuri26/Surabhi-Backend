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

async function RegisterUser(req,res) {
  const token=req.header("token");

  let image,jsonData;

  try{

    if(!token){
      throw new Error("Access denied. No token provided.");
    }

    if(!req.body.json) {
      throw new Error("Invalid request. Missing JSON data.");
    }

    jsonData=JSON.parse(req.body.json);

    const {name,email,phone_number,profession,gender,id,password,college,college_name,state,trans_id}=jsonData;

    if(!email){
      throw new Error("Email requered.");
    }

    await logic.verifyToken(token,email);

    if(!name) throw new Error("Name is required.");
    if(!email) throw new Error("Email is required.");
    if(!phone_number) throw new Error("Phone number is required.");
    if(!profession) throw new Error("Profession is required.");
    if(!gender) throw new Error("Gender is required.");
    if(!password) throw new Error("Password is required.");

    if(college=="other"){
      if (!college_name) {
        throw new Error("College name is required for 'other' option.");
      }

      if(!trans_id){
        throw new Error("Transtion Id is required for 'other' option.");
      }

      if(!state){
        throw new Error("State is requered for 'other' option.");
      }

      image = req.files?.image;
      if (!image) {
        throw new Error("Payment receipt is required.");
      }

    }else if(college!=="KL University"){
      throw new Error("Invalid college name.");
    }else{
      id=email.replace("@kluniversity.in", "");
      trans_id="";
    }

    logic.registerUser(jsonData,image);

    return res.json({code:1,message:"User registered successfully."});
  }catch(err){
    return res.json({code:-1,message:err.message});
  }
}

async function LoginUser(req,res) {
  try{
    const {email,password}=req.body;

    if(!email) throw new Error("Email is required.");
    if(!password) throw new Error("Password is required.");

    const token=await logic.loginUser({email,password});

    return res.json({code:1,message:'Login Successfull',token:token});
  }catch(err){
    return res.json({code:-1,message:err.message});
  }
}

module.exports={
  sendOtpRegistration,
  VerifyOtp,
  RegisterUser,
  LoginUser,
}