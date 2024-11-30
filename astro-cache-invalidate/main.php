<?php
/*
Plugin Name: Post Update Webhook
Description: Sends a request to a custom endpoint with the post slug on post revision and update
Version: 1.0
Author: Your Name
*/

class PostUpdateWebhook {
    public function __construct() {
        // Hook into post save/update actions
        add_action('save_post', [$this, 'send_post_update_webhook'], 10, 3);
    }

    public function send_post_update_webhook($post_id, $post, $update) {
        // Check if this is an autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check post type (adjust as needed, e.g., 'post', 'page')
        $allowed_post_types = ['post', 'page'];
        if (!in_array($post->post_type, $allowed_post_types)) {
            return;
        }

        // Get the post slug
        $post_slug = $post->post_name;

        // Your custom endpoint URL
        $webhook_url = 'https://your-custom-endpoint.com/webhook';

        // Prepare the request arguments
        $args = [
            'method'  => 'POST',
            'timeout' => 30,
            'body'    => [
                'slug' => $post_slug,
                'post_id' => $post_id,
                'post_type' => $post->post_type
            ]
        ];

        // Send the webhook request
        $response = wp_remote_request($webhook_url, $args);

        // Optional: Log errors
        if (is_wp_error($response)) {
            error_log('Webhook request failed: ' . $response->get_error_message());
        }
    }
}

// Initialize the plugin
new PostUpdateWebhook();