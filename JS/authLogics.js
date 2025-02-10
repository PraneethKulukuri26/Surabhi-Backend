const database=require("../Config/database");
const uuid=require("uuid");
const jwt=require('jsonwebtoken');

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

async function verifyOtp(email,otp) {

  if(!email || typeof email!=="string" || !otp || typeof otp!=="string"){
    throw new Error("Email is required.");
  }

  const conn=await database.getConnection();

  try{
    const query = `SELECT otp_code from otp_table where email=? and created_at >=NOW() - INTERVAL 6 MINUTE ORDER BY created_at DESC LIMIT 1`;

    const [rows]=await conn.query(query,[email]);

    if (rows.length===0) {
      throw new Error("Not found");
    }

    const {otp_code} = rows[0];
    if(otp_code==otp){

      try{
        await deleteOtp(email);
      }catch(err){
        
      }

      return true;
    }

    return false;

  }catch(err){

    if(err.message==="Not found" || err.message==="OTP Expired"){
      throw err;
    }

    throw new Error("Failed to verify OTP.");
  }finally{
    conn.release();
  }
}

async function storeToken(email) {
  const token=uuid.v4();
  const conn=await database.getConnection();

  try{
    const query="insert into registerToken (token,email) values(?,?)";
    await conn.query(query,[email,token]);

    return token;
  }catch(err){
    throw new Error("Internal Server Error.");
  }finally{
    conn.release();
  }
}

async function deleteToken(token) {

  const conn=await database.getConnection();

  try{
    await conn.query("delete from registerToken where token =?",[token]);
    return true;
  }catch(err){
    return false;
  }
  
}

async function verifyToken(token,email) {
  const conn=await database.getConnection();

  try{
      const [result]=await conn.query("select email from registerToken where token=? and created_at >=NOW() - INTERVAL 30 MINUTE ORDER BY created_at DESC LIMIT 1",[token]);

      if(result.length===0){
        throw new Error("Token Expired or not found.");
      }

      const {emailData}=result[0];

      if(emailData!=email){
        throw new Error("Email does not match with Token details.");
      }

  }catch(err){
    if(err.message=="Token Expired or not found" || err.message=="Email does not match with Token details."){
      throw err;
    }

    throw new Error("Failed to verify token. Please try again.");
  }finally{
    conn.release();
  }
}

async function registerUser(params,image=null) {
  const { name, email, phone_number, profession, gender, id, password, college, college_name,trans_id, state } = params;

  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    const query = `INSERT INTO SurabhiUsers (name, email, phone, profession, gender, CID, password, collage, collageName, state,transId,registeredOn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,NOW())`;

    const values = [name,email,phone_number,profession,gender,id,password,college,college_name,trans_id,state];

    const [result] = await conn.execute(query, values);

    if(college=='other'){
      await image.mv('public/images/payment/'+result.insertId);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error("Error registering user:", err);

    throw err;

  } finally {
    conn.release();
  }
}

async function loginUser(params) {
  const {email,password}=params;

  const conn=database.getConnection();

  try{
    const [rows] = await conn.query("SELECT UID, password FROM SurabhiUsers WHERE email = ?",[email]);

    if (rows.length === 0) {
      throw new Error("Email not found.");
    }
    const user = rows[0];
    if (user.password !== password) {
      throw new Error("Invalid password.");
    }

    const token=jwt.sign({
      userId:user.UID,
      role:'user',
      email:email
    },process.env.SECRET_KEY,{
      algorithm: "HS512",
      expiresIn: "1d",
    });

    return token;

  }catch(err){
    throw err;
  }finally{
    conn.release();
  }
}

module.exports={
  checkUserPresence,
  saveOTP,
  deleteOtp,
  verifyOtp,
  storeToken,
  verifyToken,
  deleteToken,
  registerUser,
  loginUser,
}