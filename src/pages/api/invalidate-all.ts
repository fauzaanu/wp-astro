import { createClient } from 'redis';
import type { APIRoute } from 'astro';

let redis;

async function getRedisClient() {
    if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL environment variable is required');
    }
    
    console.log('Attempting to connect to Redis at:', process.env.REDIS_URL);
    
    if (!redis) {
        redis = createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    console.log(`Reconnection attempt ${retries}`);
                    return Math.min(retries * 100, 3000);
                }
            }
        });

        redis.on('error', (err) => console.error('Redis Client Error:', err));
        redis.on('connect', () => console.log('Redis Client Connected'));
        redis.on('ready', () => console.log('Redis Client Ready'));
        redis.on('reconnecting', () => console.log('Redis Client Reconnecting'));

        try {
            await redis.connect();
            console.log('Redis connection established successfully');
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    return redis;
}

export const POST: APIRoute = async () => {
    try {
        const client = await getRedisClient();
        // Flush all data from Redis
        await client.flushAll();

        return new Response(
            JSON.stringify({ message: 'All cache cleared successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' }}
        );
    } catch (error) {
        console.error('Error clearing cache:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' }}
        );
    }
};

export const GET: APIRoute = () => {
    return new Response(
        JSON.stringify({ message: 'This endpoint is for POST requests only' }),
        { status: 405, headers: { 'Content-Type': 'application/json' }}
    );
};
