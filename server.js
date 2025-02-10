const express=require("express");
const dotenv=require("dotenv");
const bodyParser=require("body-parser");
const cors=require("cors");
const compression=require("compression");
const fileUpload=require("express-fileupload");
const helmet=require("helmet");
const uuid=require("uuid");

dotenv.config();

const app=express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(fileUpload());

const port=process.env.port || 7878;

app.listen(port,()=>{
  console.log("Running");
});

const userAuth=require("./Route/user/auth");
app.use("/api/user/",userAuth);

const adminAuth=require("./Route/admin/auth");
app.use("/api/admin/",adminAuth);

const fs = require('fs').promises;

async function readJSON() {
    try {
        const rawData = await fs.readFile('public/EventsData/data.json', 'utf8');
        const data = JSON.parse(rawData);
        console.log(data.name);
    } catch(error){
        console.error('Error reading file:', error);
    }
}

//readJSON();

app.get("/test",(req,res)=>{
  for(let i=0;i<10;i++){

    console.log(uuid.v1());
  }
  res.sendStatus(200);  
});