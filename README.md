
# Atro Wordpress

Modified and improved from: https://github.com/leen-neel/astro-wordpress

- Added a docker compose for local development or .. 
- Added aider-chat for AI (python/uv)
- Created config for making the site settings / metadata dynamic
- Created a .env.sample file making it more clear on how the variables should be
- Simplfied the UI
- Using redis as a cache with Redis Object Cache plugin

### Setup
1. Copy the .env.sample file and rename it to .env
2. Make sure to have a featured image on all posts
3. Change the permalink to post name
4. Run `docker compose up -d`
5. Visit http://localhost:8000
6. To setup redis object cache we need to edit the wp-config.php file
7. First install vim inside the container
8. Run `docker compose exec bash`
9. Run `apt-get update && apt-get install -y vim`
10. RUN `vim wp-config.php`
11. See https://github.com/rhubarbgroup/redis-cache/blob/develop/INSTALL.md#3-configuring-the-plugin and edit accordingly
12. Reload and enable object cache form interface
13. Develop front on astro :)

### Useful docker commands

# Stop and remove all containers
docker compose down

# Remove the database volume to clean it
docker volume rm astro-wordpress_db_data
docker volume rm astro-wordpress_wordpress_data

# Bring the services back up
docker compose up -d
