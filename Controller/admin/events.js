

async function addEvents(req,res) {
    let image,jsonData;

    const {userId,role}=req.payload;

    try{
        if(role!=="admin" || userId!=process.env.admin_id){
            throw new Error("Invalid User.");
        }

        if(!req.body.json) {
            throw new Error("Invalid request. Missing JSON data.");
        }
        jsonData=JSON.parse(req.body.json);

        image = req.files?.image;
        if (!image) {
            throw new Error("Poster is requered.");
        }

        
    }catch(err){
        return res.json({code:-1,message:err.message});
    }
}

module.exports={
    addEvents,
}