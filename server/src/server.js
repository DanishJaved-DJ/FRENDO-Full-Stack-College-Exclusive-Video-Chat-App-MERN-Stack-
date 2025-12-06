import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/connect.db.js";
import app from "./app.js";
import http from "http";
import setupSocket from "./config/socket.js";
import { Server } from "socket.io";

// NEW: imports for Redis adapter
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const init = async () => {
  try {
    //  Connecting  MongoDB
    await connectDB();
    console.log(" MongoDB connected");

    // Connecting  Redis for Socket.IO adapter
    try {
      const redisHost = process.env.REDIS_HOST || "127.0.0.1";
      const redisPort = process.env.REDIS_PORT || 6379;
      const redisUrl = `redis://${redisHost}:${redisPort}`;

      console.log(" Connecting Socket.IO Redis adapter to:", redisUrl);

      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      await pubClient.connect();
      await subClient.connect();

      console.log(" Redis connected for Socket.IO adapter");

      io.adapter(createAdapter(pubClient, subClient));
    } catch (redisErr) {
      console.error(" Failed to init Socket.IO Redis adapter. Falling back to in-memory adapter.");
      console.error("Redis error:", redisErr.message);
    }

    setupSocket(io);
    server.listen(PORT, () => {
      console.log(` Server (Socket.IO + Redis) listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(" Fatal init error:", err);
    process.exit(1);
  }
};

init();
