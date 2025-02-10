const express=require("express");
const router=express.Router();
const authController=require("../../Controller/user/auth");

router.post("/sendOtpRegister",authController.sendOtpRegistration);
router.post("/VerifyOtp",authController.VerifyOtp);
router.post("/Register",authController.RegisterUser);
router.post("/login",authController.LoginUser);

module.exports=router;