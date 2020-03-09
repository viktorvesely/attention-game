const g_game_time = 10; // in seconds how long will the test last
const g_avg_right_event_offset = 1.3; // in seconds avarage time between two events
const g_avg_left_event_offset = 1.7; // the same
const g_variation_offset = 300; // in milliseconds random time variation between events
const g_custom_audio_names = null; // leave null for default

var game = new Game(g_game_time);

game.set_right_port(
        game.get_visual_module(
            g_avg_right_event_offset,
            g_variation_offset
            )
    ).set_left_port(
        game.get_visual_module(
            g_avg_left_event_offset,
            g_variation_offset,
            g_custom_audio_names
            )
    );