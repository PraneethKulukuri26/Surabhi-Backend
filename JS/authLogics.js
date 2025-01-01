const database=require("../Config/database");

async function checkUserPresence(email) {

  if(!email || typeof email!=="string"){
    throw new Error("Email is required.");
  }

  const conn=await database.getConnection();
  try{
    const [userExistResult]=await conn.query("select exists( select 1 from SurabhiUsers where email=?) as emailExist",[email]);
    // userExistResult=userExistResult[0];
    
    return userExistResult.emailExist===1;
  }catch(err){
    console.error("Database error:",err);
    throw new Error("Internal Server Error.");
  }finally{
    conn.release();
  }
}

async function saveOTP(email, otp) {
  const conn = await database.getConnection();

  try {
    const expiry="DATE_ADD(NOW(), INTERVAL 6 MINUTE)";
    const insertQuery = `INSERT INTO otp_table (email, otp_code, expiry_time) VALUES (?, ?, ${expiry})`;
    await conn.query(insertQuery,[email, otp]);
  } catch (err) {
    console.error("Error OTP:",err);
    throw new Error("Internal Server Error.");
  } finally {
    conn.release();
  }
}

async function deleteOtp(email) {
  const conn=await database.getConnection();

  try{
    await conn.query("delete from otp_table where email=?",[email]);
  }catch(err){
    console.error("Failed deletion:",err);
    throw new Error("Internal Server Error.");
  }finally{
    conn.release();
  }
}

module.exports={
  checkUserPresence,
  saveOTP,
  deleteOtp,
}