// src/redis.ts
import { createClient } from "redis"

const redisUrl = process.env.NODE_ENV === 'production'
  ? process.env.REDIS_URL_PROD
  : process.env.REDIS_URL_DEV || 'redis://localhost:6379'

const redisClient = createClient({
  url: redisUrl,
})

redisClient.on("error", (err) => console.error("Redis Client Error", err))

async function connectRedis() {
  await redisClient.connect()
}

export { redisClient, connectRedis }

