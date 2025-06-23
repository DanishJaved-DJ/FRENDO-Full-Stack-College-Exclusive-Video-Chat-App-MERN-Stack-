import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/connect.db.js";
import app from "./app.js";
import http from 'http';
import {setupSocket} from "./utils/socket.js";
import { Server } from "socket.io";

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ORIGINS,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});
setupSocket(io);

const PORT = process.env.PORT || 3000;

connectDB()
.then(() => {
    server.listen(PORT, () => {
        console.log(`server is listening at : ${PORT}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection fail !!!", err);
});
