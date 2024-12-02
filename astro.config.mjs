import {defineConfig} from 'astro/config';

// https://astro.build/config
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
import node from "@astrojs/node";

import alpinejs from "@astrojs/alpinejs";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone"
    }),
    server: {
        host: '0.0.0.0'
    },
    integrations: [tailwind({
        applyBaseStyles: false,
    }), alpinejs(), sitemap()]
});