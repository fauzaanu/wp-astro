import dotenv from 'dotenv';
import {createClient} from 'redis';

dotenv.config();

const API_URL = process.env.API_URL;
const CACHE_TTL = 60 * 20; // 20 minutes in seconds

const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.connect().catch(console.error);

// Gets post by API URL and given path
export async function fetchAPI(path) {
    const cacheKey = path.startsWith('posts?slug=')
        ? `api_post_${path.split('=')[1].split('&')[0]}`
        : `api_${path}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const res = await fetch(`${API_URL}${path}`);
    const json = await res.json();

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(json));
    return json;
}

export async function getPosts() {
    let posts = await fetchAPI('posts?per_page=50&_embed');
    return posts;
}

export async function invalidatePostCache(slug) {
    const cacheKey = `api_post_${slug}`;

    try {
        // Retrieve the current cache value
        const initialCache = await redis.get(cacheKey);

        // If no cache exists, assume it's already invalidated
        if (!initialCache) {
            console.log('No cache found for this post.');
            return 1; // Cache was already invalidated
        }

        // Delete both the specific post cache and the posts list cache
        await Promise.all([
            redis.del(cacheKey),
            redis.del('api_posts?per_page=50&_embed')
        ]);

        // Ensure the post cache is invalidated
        const newCache = await redis.get(cacheKey);

        // If cache is still the same (not deleted), return 0
        if (initialCache === newCache) {
            console.log('Failed to invalidate cache. Cache still exists.');
            return 0; // Cache deletion failed
        } else if (newCache === null) {
            // If no cache is found after deletion, it’s successfully invalidated
            console.log('Cache invalidated successfully.');
            return 1; // Successfully invalidated
        } else {
            console.log('Unexpected behavior: Cache exists after deletion.');
            return 0; // Unexpected behavior, return failure
        }
    } catch (error) {
        console.error('Error while invalidating cache:', error);
        return 0; // Return failure on error
    }
}


// Fetch a single post by slug (or postId)
export async function fetchPostBySlug(slug) {
    const cacheKey = `api_post_${slug}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    // Fetch the specific post from the API
    const res = await fetchAPI(`posts?slug=${slug}&_embed`);
    const post = await res;

    if (post.length) {
        const postData = post[0];  // Assuming the post is returned as an array
        await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(postData));
        return postData;
    } else {
        throw new Error('Post not found');
    }
}

export async function getCategories() {
    const cacheKey = 'api_categories';
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const categories = await fetchAPI('categories?per_page=100');
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(categories));

    return categories;
}

export async function getPostsByCategory(categoryId) {
    const cacheKey = `api_category_posts_${categoryId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const posts = await fetchAPI(`posts?categories=${categoryId}&per_page=50&_embed`);
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(posts));

    return posts;
}

export async function searchPosts(query) {
    if (!query) return [];
    
    const cacheKey = `api_search_${query.toLowerCase()}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const posts = await fetchAPI(`posts?search=${encodeURIComponent(query)}&_embed`);
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(posts));

    return posts;
}


