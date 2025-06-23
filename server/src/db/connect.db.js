import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
    console.log("MongoDB URI is not defined");
    process.exit(1);
}

if (!DB_NAME) {
    console.log("MongoDB DB_NAME is not defined");
    process.exit(1);
}

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(MONGODB_URI, {
            dbName: `${DB_NAME}`
        });
        console.log(`\n  MongoDB is connected to : ${connectionInstance.connection.host}, DB: ${DB_NAME}`);
    } catch (err) {
        console.log("MongoDB connection error",err);
        process.exit(1);
        
    }
}

export default connectDB;