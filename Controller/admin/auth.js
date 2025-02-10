const adminId=process.env.admin_id;
const adminPassword=process.env.admin_password;
const uid=process.env.admin_unq;


async function loginAdmin(req,res) {
    const {id,password}=req.body;

    try{
        if(!id) throw new Error("Id is required.");
        if(!password) throw new Error("Password is required.");

        if(adminId!=id){
            throw new Error("Id not found.");
        }

        if(adminPassword!=password){
            throw new Error("Incorrect password.");
        }

        const token=jwt.sign({
              uid:uid,
              role:'admin'
            },process.env.SECRET_KEY,{
              algorithm: "HS512",
              expiresIn: "1d",
            });

        return res.json({code:1,message:'Login Successfull',token:token});

    }catch(err){
        return res.json({code:-1,message:err.message});
    }
    
}

module.exports={
    loginAdmin,
}