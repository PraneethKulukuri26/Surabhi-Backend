const express=require("express");
const router=express.Router();

const authController=require("../../Controller/admin/auth");

router.post("/login",authController.loginAdmin);

module.exports=router;