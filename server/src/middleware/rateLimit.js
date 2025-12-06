import redis from "../db/redisClient.js";

export const rateLimit = (options = {}) => {
  const {
    windowSeconds = 60,    // time window
    maxRequests = 5,       // max attempts per window
    keyPrefix = "rl",      // redis key prefix
  } = options;

  return async (req, res, next) => {
    try {
      const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const key = `${keyPrefix}:${ip}`;

      const current = await redis.incr(key);

      if (current === 1) {
        // first hit, set expiry
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          status: "false",
          message: `Too many requests. Try again in ${ttl} seconds.`,
        });
      }

      next();
    } catch (err) {
      console.error("Rate limit error:", err);
      // if Redis fails, do not block login
      next();
    }
  };
};
