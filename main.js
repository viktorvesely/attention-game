const g_game_time = 30; // seconds
const g_avg_right_event_offset = 1.3; // seconds
const g_avg_left_event_offset = 1.7; // seconds
const g_max_min_variation_offset = 300; // milliseconds
const g_custom_audio_names = null; // leave null for default

var game = new Game(g_game_time);

game.set_right_port(
        game.get_visual_module(g_avg_right_event_offset, g_max_min_variation_offset)
    ).set_left_port(
        game.get_audio_module(g_avg_left_event_offset, g_max_min_variation_offset)
    );