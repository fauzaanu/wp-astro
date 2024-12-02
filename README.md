# Astro WordPress Headless Blog

A modern headless WordPress blog built with Astro, featuring a clean UI, Redis caching, and Docker support.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.app/template/i7GFrB?referralCode=NC4Tt6)

## Features

- 🚀 Built with Astro for easy customization
- 🌐 Wordpress backend so that editors can use an already familiar CMS
- 🎨 Clean and responsive UI with Tailwind CSS
- 💨 With Redis caching, subsequent requests never hit the backend
- 🔍 Search support
- 🎯 Category support
- 📝 Pagination support

## Todo

- [ ] Comments
- [ ] SEO
- [ ] PWA
- [ ] RSS feed

## Prerequisites

- Node.js 22.11.0
- Redis
- WordPress instance with:
  - Featured images for all posts
  - Permalink structure set to "Post name"
  - Install our own astro-cache-invalidate plugin found within this repo
  - Set up a .env file or the variables below
    - REDIS_URL: Redis connection URL (e.g., redis://localhost:6379)
    - API_URL: WordPress URL (e.g., http://localhost:8080/) (DO NOT INCLUDE THE wp-json stuff)

## How it works

- When requests hit the websites
  - We first check Redis for a cached version of the page
  - If not found, we fetch the page from the WordPress API
  - We then cache the page in Redis for future requests
  - We return the cached page to the user

- When an editor edits any post within wordpress
  - our plugin sends a request to our astro api endpoint to invalidate that page
  - We also have an endpoint to invalidate all but that is not implemented within the plugin as of now, but is useful in development

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Credits

Modified and improved from [astro-wordpress](https://github.com/leen-neel/astro-wordpress)
.
