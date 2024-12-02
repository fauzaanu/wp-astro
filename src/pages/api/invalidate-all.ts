import { createClient } from 'redis';
import type { APIRoute } from 'astro';

let redis;

async function getRedisClient() {
    if (!redis) {
        redis = createClient({
            url: process.env.REDIS_URL
        });
        await redis.connect();
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
