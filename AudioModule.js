const g_audio_handicap_reaction = 350;
const Audio_events_names = ["ginger", "glasses", "machine", "mango"];

class AudioModule extends Module {
    constructor(avg_delta_seconds, offset, event_names=null) {
        super(avg_delta_seconds, offset);
        this.set_event_callback(
                this.event_act
            ).set_button_callback(
                this.event_button
            ).set_viewPort_callback(
                this.load_events
            ).set_valid_event_callback(
                this.event_is_valid
            ).set_event_on_end_callback(
                this.event_on_end
            ).set_reaction_modifier_callback(
                this.handicap
            );

        if (event_names && event_names.length > 0) {
            this.event_names = event.names;
        } else {
            this.event_names = Audio_events_names;
        }
        
        this.suffix = "";
        this.current_audio_id = -1;
        this.current_audio = new Audio();
        this.expected_event = this.random_int(0, this.event_names.length);
    }

    load_events() {
        this.suffix = this.viewPort.getAttribute("id");
    }

    handicap(reactionTime) {
        return reactionTime - g_audio_handicap_reaction;
    } 

    ready() {
        this.play_event_by_id(this.expected_event);
    }

    is_event_playing() {
        return this.current_audio.paused || this.current_audio.ended;
    }

    stop_event() {
        if (this.is_event_playing()) {
            this.current_audio.pause();
            this.current_audio_id = -1;
        }
    }

    play_event(src, id) {
        this.stop_event();
        this.current_audio_id = id;
        this.current_audio.src = src;
        this.current_audio.load();
        this.current_audio.play();
    }

    play_random_not_previous_event() {
        let newId;
        do {
            newId = this.random_int(0, this.event_names.length);
        } while (newId === this.current_audio_id);
        this.play_event_by_id(newId);
    }


    name_to_src(name) {
        return `./audio/${name}_${this.suffix}.mp3`;
    }

    play_event_by_id(id) {
        let name = this.event_names[id];
        this.play_event(this.name_to_src(name), id);
    }

    play_event_by_name(name) {
        this.play_event(this.name_to_src(name), id);
    }

    event_is_valid() {
        return this.expected_event === this.current_audio_id;
    }

    event_on_end() {
        this.stop_event();
    }

    event_act() {
        this.play_random_not_previous_event();
    }

    event_button() {
        let success = this.event_is_valid();
        return success;
    }
    
    
}