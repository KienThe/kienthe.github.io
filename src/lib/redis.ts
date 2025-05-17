import { Redis } from "ioredis"

const redis = new Redis({
  host: "localhost",
  port: 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  disconnectTimeout: 2000
})

redis.on("error", (error) => {
  console.error("Redis connection error:", error)
})

redis.on("connect", () => {
  console.log("Connected to Redis")
})

redis.on("ready", () => {
  console.log("Redis is ready")
})

redis.on("reconnecting", () => {
  console.log("Reconnecting to Redis...")
})

export default redis
