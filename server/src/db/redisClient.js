import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const {
  REDIS_HOST = "127.0.0.1",
  REDIS_PORT = 6379,
  REDIS_PASSWORD,
  REDIS_DB = 0,
} = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD || undefined,
  db: Number(REDIS_DB),
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error(" Redis error:", err.message);
});

export default redis;
