/**
 * Redis Connection Configuration
 */

import IORedis, { RedisOptions } from 'ioredis';

// Default Redis configuration
const DEFAULT_REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};

// Singleton Redis client for shared connections
let redisIO: IORedis | null = null;
let redisSubscriber: IORedis | null = null;
let redisBClient: IORedis | null = null;

/**
 * Get a Redis client instance
 * Reuse existing instance or create new one
 */
export function getRedisClient(
  role: 'client' | 'subscriber' | 'bclient' = 'client',
): IORedis {
  switch (role) {
    case 'subscriber':
      if (!redisSubscriber) {
        redisSubscriber = new IORedis(DEFAULT_REDIS_CONFIG);
        redisSubscriber.setMaxListeners(20);
      }
      return redisSubscriber;

    case 'bclient':
      if (!redisBClient) {
        redisBClient = new IORedis(DEFAULT_REDIS_CONFIG);
      }
      return redisBClient;

    case 'client':
    default:
      if (!redisIO) {
        redisIO = new IORedis(DEFAULT_REDIS_CONFIG);
      }
      return redisIO;
  }
}

/**
 * Close all Redis connections
 */
export async function closeRedisConnections() {
  const promises = [];

  if (redisIO) {
    promises.push(redisIO.quit());
    redisIO = null;
  }
  if (redisSubscriber) {
    promises.push(redisSubscriber.quit());
    redisSubscriber = null;
  }
  if (redisBClient) {
    promises.push(redisBClient.quit());
    redisBClient = null;
  }

  await Promise.all(promises);
}

// BullMQ connection settings
export const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
};
