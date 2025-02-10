const eventLogic=require("../../JS/eventLogics");

async function registerEvent(req,res) {
    const {EID}=req.body;
    const {userId,role}=req.payload;

    try{
        if(role!="user"){
            throw new Error("Invalid User.");
        }

        await eventLogic.registerEvent(userId,EID);

        return res.json({code:1,message:"Registered Successfully."});

    }catch(err){
        return res.json({code:-1,message:err.message});
    }
}

async function unRegisterEvent(req,res) {
    const {EID}=req.body;
    const {userId,role}=req.payload;

    try{
        if(role!="user"){
            throw new Error("Invalid User.");
        }

        await eventLogic.unRegisterEvent(userId,EID);

        return res.json({code:1,message:"UnRegistered Successfully."});
    }catch(err){
        return res.json({code:-1,message:err.message});
    }
}

module.exports={
    registerEvent,
    unRegisterEvent,
}