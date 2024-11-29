import { createClient } from 'redis';
import type { APIRoute } from 'astro';

const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.connect().catch(console.error);

export const POST: APIRoute = async ({ request }) => {
    try {
        if (request.headers.get("Content-Type") === "application/json") {
            const { slug } = await request.json(); // Get the slug from the request body

            if (!slug) {
                return new Response(
                    JSON.stringify({ error: 'Slug is required' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Invalidate the cache for the specific post (based on its slug)
            const cacheKey = `api_post_${slug}`;
            await redis.del(cacheKey); // Delete the cache for that specific post

            return new Response(
                JSON.stringify({ message: 'Cache invalidated successfully' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            return new Response(
                JSON.stringify({ error: 'Invalid content type' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error('Error invalidating cache:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const GET: APIRoute = () => {
    return new Response(
        JSON.stringify({ message: 'This endpoint is for POST requests only' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
};
