import dotenv from 'dotenv';
import {createClient} from 'redis';

dotenv.config();

const API_URL = `${process.env.API_URL}/wp-json/wp/v2/`;
const CACHE_TTL = 60 * 20; // 20 minutes in seconds

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

// Initialize Redis connection
getRedisClient().catch(error => {
    console.error('Failed to initialize Redis:', error);
    process.exit(1);  // Exit if Redis connection fails
});

// Gets post by API URL and given path
export async function fetchAPI(path) {
    const cacheKey = path.startsWith('posts?slug=')
        ? `api_post_${path.split('=')[1].split('&')[0]}`
        : `api_${path}`;
    
    try {
        const client = await getRedisClient();
        const cached = await client.get(cacheKey);

        if (cached) {
            console.log(`Cache hit for ${cacheKey}`);
            return JSON.parse(cached);
        }

        const fullUrl = `${API_URL}${path}`;
        console.log('Fetching from URL:', fullUrl);

        const res = await fetch(fullUrl);
        if (!res.ok) {
            console.error('API Error:', {
                status: res.status,
                statusText: res.statusText,
                url: fullUrl
            });
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        console.log(`API Response received for ${path}`);

        // If this is a paginated request, include headers in the response
        if (path.includes('page=') || path.includes('per_page=')) {
            const result = {
                data: json,
                headers: {
                    total: res.headers.get('X-WP-Total'),
                    totalPages: res.headers.get('X-WP-TotalPages')
                }
            };
            await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
            return result;
        }

        await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(json));
        return json;
    } catch (error) {
        console.error('Error in fetchAPI:', error);
        throw error;
    }
}

export async function getPosts() {
    try {
        console.log('Fetching posts...');
        const response = await fetchAPI('posts?per_page=50&_embed');
        
        // Handle both paginated and non-paginated responses
        const posts = response.data || response;
        
        if (!Array.isArray(posts)) {
            console.error('Unexpected posts response format:', posts);
            return [];
        }
        
        console.log(`Successfully fetched ${posts.length} posts`);
        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
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
    try {
        console.log('Fetching categories...');
        const cacheKey = 'api_categories';
        const client = await getRedisClient();
        const cached = await client.get(cacheKey);

        if (cached) {
            console.log('Using cached categories');
            const parsedCache = JSON.parse(cached);
            if (!Array.isArray(parsedCache)) {
                console.warn('Cached categories is not an array:', parsedCache);
                return [];
            }
            return parsedCache;
        }

        console.log('Fetching categories from API');
        const response = await fetchAPI('categories?per_page=100');
        
        // Handle both paginated and non-paginated responses
        const categories = response.data || response;
        
        if (!Array.isArray(categories)) {
            console.error('Unexpected categories response format:', categories);
            return [];
        }

        console.log(`Retrieved ${categories.length} categories from API`);
        await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(categories));

        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getPostsByCategory(categoryId, page = 1, perPage = 12) {
    const cacheKey = `api_category_posts_${categoryId}_page${page}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const response = await fetchAPI(`posts?categories=${categoryId}&per_page=${perPage}&page=${page}&_embed`);
    const posts = response.data || response;
    const total = parseInt(response.headers?.total || '0');
    const totalPages = parseInt(response.headers?.totalPages || '1');

    const result = {
        posts: Array.isArray(posts) ? posts : [],
        total,
        totalPages,
        currentPage: page
    };

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
}

export async function searchPosts(query, page = 1, perPage = 12) {
    if (!query) return { posts: [], total: 0, totalPages: 0, currentPage: 1 };

    const cacheKey = `api_search_${query.toLowerCase()}_page${page}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const response = await fetchAPI(`posts?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&_embed`);
    const posts = response.data || response;
    const total = parseInt(response.headers?.total || '0');
    const totalPages = parseInt(response.headers?.totalPages || '1');

    const result = {
        posts: Array.isArray(posts) ? posts : [],
        total,
        totalPages,
        currentPage: page
    };

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
}


