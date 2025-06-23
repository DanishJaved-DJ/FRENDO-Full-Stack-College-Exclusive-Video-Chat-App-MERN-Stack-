import express from "express";
import cors from "cors";    
import cookieParser from "cookie-parser";
const app=express();

app.use(cors({
    origin:process.env.ORIGINS ,
    credentials:true,
    
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));

app.use(cookieParser());
// creating http server



//routes import
import userRouter from "./routes/user.routes.js"
// declaring routes 
app.use("/api/v1/users",userRouter);

export default app;