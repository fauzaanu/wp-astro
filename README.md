# Astro WordPress Headless Blog

A modern headless WordPress blog built with Astro, featuring a clean UI, Redis caching, and Docker support.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.app/template/i7GFrB?referralCode=NC4Tt6)

## Features

- 🚀 Built with Astro for optimal performance
- 🎨 Clean and responsive UI with Tailwind CSS
- 💨 Fast page loads with Redis caching
- 🐳 Easy local development with Docker
- 🔍 Built-in search functionality
- 📱 Mobile-first design
- 🌟 SEO optimized
- 🎯 Category support
- 💜 Beautiful purple glow effects

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- WordPress instance with:
  - Featured images for all posts
  - Permalink structure set to "Post name"
  - Redis Object Cache plugin installed

## Quick Start

1. Clone the repository
2. Copy `.env.sample` to `.env` and configure your variables
3. Start the development environment:
   ```bash
   docker compose up -d
   ```
4. Visit `http://localhost:8000` to access WordPress
5. Visit `http://localhost:3000` to see your Astro site

## Setting Up Redis Cache

1. Access your WordPress container:
   ```bash
   docker compose exec wordpress bash
   ```

2. Install vim:
   ```bash
   apt-get update && apt-get install -y vim
   ```

3. Edit wp-config.php:
   ```bash
   vim wp-config.php
   ```

4. Add Redis configuration ([see documentation](https://github.com/rhubarbgroup/redis-cache/blob/develop/INSTALL.md#3-configuring-the-plugin))

5. Enable Redis Object Cache in WordPress admin interface

## Development

- The Astro frontend is in the `src` directory
- WordPress runs in Docker with persistent volumes
- Redis cache improves performance
- Tailwind CSS for styling
- TypeScript for type safety

## Docker Commands

Stop all containers:
```bash
docker compose down
```

Clean database:
```bash
docker volume rm astro-wordpress_db_data
docker volume rm astro-wordpress_wordpress_data
```

Start services:
```bash
docker compose up -d
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Credits

Modified and improved from [astro-wordpress](https://github.com/leen-neel/astro-wordpress)
.
