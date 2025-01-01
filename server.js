const express=require("express");
const dotenv=require("dotenv");
const bodyParser=require("body-parser");
const cors=require("cors");
const compression=require("compression");
const fileUpload=require("express-fileupload");
const helmet=require("helmet");

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