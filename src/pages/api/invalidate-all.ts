import { createClient } from 'redis';
import type { APIRoute } from 'astro';

const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.connect().catch(console.error);

export const POST: APIRoute = async ({ request }) => {
    try {
        // Check for API key or other authentication if needed
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        // Flush all data from Redis
        await redis.flushAll();

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
