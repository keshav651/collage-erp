import "dotenv/config";
import redis from "../services/redis_service.js";

const testRedis = async () => {
  try {
    const pong = await redis.ping();

    console.log("Redis PING:", pong);

    await redis.set("erp:test", "Hello College ERP", "EX", 60);

    const value = await redis.get("erp:test");

    console.log("Redis GET:", value);

    await redis.del("erp:test");

    console.log("Redis test successful");

  } catch (error) {
    console.error("Redis test failed:", error);
    process.exit(1);
  }finally {
    await redis.quit();
  }
};

testRedis();