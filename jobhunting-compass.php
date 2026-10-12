


<?php
/**
 * Plugin Name: Jobhunting Compass
 * Description: 就活現在地診断プラグイン
 * Version: 0.1.0
 * Author: TKF Project
 * GitHub Plugin URI: https://github.com/sorakondo/jobhunting-compass
 * Primary Branch: main
 */

if (!defined('ABSPATH')) {
    exit;
}

// 以下に既存のプラグイン処理を記述
if (!defined('ABSPATH')) {
    exit;
}

// 診断ページでCSSとJavaScriptを読み込む
function jhc_enqueue_assets() {
    $post = get_post();

    if (!$post || !has_shortcode(
        $post->post_content,
        'jobhunting_compass'
    )) {
        return;
    }

    $url = plugin_dir_url(__FILE__);
    $path = plugin_dir_path(__FILE__);

    wp_enqueue_style(
        'jhc-style',
        $url . 'assets/quiz.css',
        [],
        filemtime($path . 'assets/quiz.css')
    );

    wp_enqueue_script(
        'jhc-script',
        $url . 'assets/quiz.js',
        [],
        filemtime($path . 'assets/quiz.js'),
        true
    );
}
add_action('wp_enqueue_scripts', 'jhc_enqueue_assets');

// ショートコードを登録
function jhc_render_quiz() {
    $questions = require __DIR__ . '/includes/questions.php';

    return '<div class="jhc-app" data-questions="' .
        esc_attr(wp_json_encode($questions)) .
        '"></div>';
}

add_shortcode('jobhunting_compass', 'jhc_render_quiz');
