import dotenv from 'dotenv';
import { LRUCache } from 'lru-cache';
dotenv.config();

const API_URL = process.env.API_URL;

// Configure LRU cache with 20 minute TTL
const cache = new LRUCache({
    max: 500, // Maximum number of items
    ttl: 1000 * 60 * 20, // 20 minutes in milliseconds
});

// Gets post by API URL and given path
export async function fetchAPI(path) {
    const cacheKey = `api_${path}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
        return cached;
    }

    const res = await fetch(`${API_URL}${path}`);
    const json = await res.json();
    
    cache.set(cacheKey, json);
    return json;
}

export async function getPosts() {
    let posts = await fetchAPI('posts?per_page=50&_embed');
    return posts;
}
