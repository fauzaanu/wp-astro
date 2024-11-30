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

        // Add plugin settings page to admin menu
        add_action('admin_menu', [$this, 'add_admin_page']);
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
        $webhook_url = 'https://wp-astro-production.up.railway.app/api/invalidate-cache';

        // Prepare the request arguments
        $args = [
            'method'  => 'POST',
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body'    => json_encode([ // Encode the body as JSON
                'slug' => $post_slug,
            ])
        ];

        // Send the webhook request
        $response = wp_remote_request($webhook_url, $args);

        // Handle response and store logs
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->store_log('Webhook request failed: ' . $error_message);
        } else {
            $this->store_log('Webhook response: ' . print_r($response, true));
        }
    }

    // Store log messages in an option or transient
    private function store_log($message) {
        // Get current log messages, if any
        $logs = get_option('post_update_webhook_logs', []);

        // Add the new log message to the array
        $logs[] = $message;

        // Limit logs to the last 10 messages
        $logs = array_slice($logs, -10);

        // Save the logs back to the option
        update_option('post_update_webhook_logs', $logs);
    }

    // Add admin page to view logs
    public function add_admin_page() {
        add_menu_page(
            'Post Update Webhook Logs',  // Page title
            'Webhook Logs',              // Menu title
            'manage_options',            // Capability
            'post-update-webhook-logs',  // Menu slug
            [$this, 'display_logs_page'], // Callback function to display logs
            'dashicons-info',            // Icon
            20                           // Position
        );
    }

    // Display the logs on the admin page
    public function display_logs_page() {
        ?>
        <div class="wrap">
            <h1>Post Update Webhook Logs</h1>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th scope="col">Log Message</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $logs = get_option('post_update_webhook_logs', []);
                    if (empty($logs)) {
                        echo '<tr><td>No logs available.</td></tr>';
                    } else {
                        foreach ($logs as $log) {
                            echo '<tr><td>' . esc_html($log) . '</td></tr>';
                        }
                    }
                    ?>
                </tbody>
            </table>
        </div>
        <?php
    }
}

// Initialize the plugin
new PostUpdateWebhook();
