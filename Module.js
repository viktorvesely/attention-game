const g_penalty_no_event = 800;
const g_penalty_wrong_event = 400;

class Module {
    constructor(avg_delta_seconds, offset) {
        this.last_event_occurence = -1;
        this.avg_delta_seconds = avg_delta_seconds;
        this.offset = offset;
        this.port = null;
        this.onEventCallback = null;
        this.onButtonCallback = null;
        this.onViewPortCallback = null;
        this.isEventValidCallback = null;
        this.eventEndCallback = null;
        this.reactionModifierCallback = null;
        this.viewPort = null;

        if (offset >= avg_delta_seconds * 1000)
            throw Error("Offset cannot last more or the same as avg delta time");
        
        this.next_event_occurance = 0;

        this.event_occurances = 0;
        this.reactions_sum = 0;
        this.events = null;
    }

    game_start() {
        this.events = [];
        this.next_event_occurance = this.get_next_event_occurance_time(); 
        this.add_event_on_timeline("game_start");
    }

    game_end() {
        this.add_event_on_timeline("game_end");
        window.localStorage.setItem(
            `${Date.now()}_${this.viewPort.getAttribute("id")}`,
            JSON.stringify(this.events)
            );
        
    }

    add_event_on_timeline(name) {
        this.events.push({name: name, timestamp: Date.now()});
    }

    set_event_callback(onEventCallback) {
        this.onEventCallback = onEventCallback;
        return this;
    }

    set_button_callback(onButtonCallback) {
        this.onButtonCallback = onButtonCallback;
        return this;
    }

    set_viewPort_callback(onViewPortCallback) {
        this.onViewPortCallback = onViewPortCallback;
        return this;
    }

    set_valid_event_callback(isEventValidCallback) {
        this.isEventValidCallback = isEventValidCallback;
        return this;
    }

    set_event_on_end_callback(eventEndCallback) {
        this.eventEndCallback = eventEndCallback;
        return this;
    }

    set_reaction_modifier_callback(reactionModifierCallback) {
        this.reactionModifierCallback = reactionModifierCallback;
        return this;
    }

    get_next_event_occurance_time() {
        return this.now() +  (this.avg_delta_seconds * 1000 + (Math.random() * 2 - 1) * this.offset);
    }

    now() {
        return Date.now();
    }

    button() {
        if (!this.onButtonCallback) {
            throw new Error("On button callback has to be initialized before starting the game!");
        }

        if (this.last_event_occurence != -1) {
            if(!this.onButtonCallback()) {
                this.add_penalty(g_penalty_wrong_event);
                this.event_failed();
            }
            else {
                this.add_event_on_timeline("event_react");
            }
            this.event_reacted();
        } else {
            this.add_penalty(g_penalty_no_event);
            console.log("No shape is on the screen you stupid ginger");
        }
    }

    attach_viewPort(viewPort) {
        this.viewPort = viewPort;
        if (this.onViewPortCallback) {
            this.onViewPortCallback();
        }
        return this;
    }

    add_reaction(time) {
        if (this.reactionModifierCallback) {
            time = this.reactionModifierCallback(time);
        }
        this.add_event_on_timeline(`reaction:${time}`);
        this.reactions_sum += time;
        this.event_occurances++;
    }

    add_penalty(time) {
        this.reactions_sum += time;
        this.add_event_on_timeline(`penalty:${time}`);
    }

    get_avg_reaction() {
        return this.reactions_sum / this.event_occurances;
    }

    event_end() {
        if (this.isEventValidCallback()) {
            let reaction_time = this.now() - this.last_event_occurence;
            this.add_reaction(reaction_time);
        }
        this.last_event_occurence = -1;
        this.eventEndCallback();
    }

    event_reacted() {
        this.event_end();
    }

    event_failed() {
        this.add_event_on_timeline("event_fail");
    }

    event() {
        if (!this.onEventCallback) {
            throw new Error("On event callback has to be initialized before starting the game!");
        }
        if (this.onEventCallback()) {
            this.add_event_on_timeline("event_start");
        } else {
            this.add_event_on_timeline("decoy_start");
        }
        
        this.last_event_occurence = this.now();
    }

    random_int(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    step() {
        let now = this.now();
        if (now >= this.next_event_occurance) {
            if (this.last_event_occurence != -1) {
                if (this.isEventValidCallback()) {
                    this.event_failed();
                }
                this.event_end();
            }
            this.event();
            this.next_event_occurance = this.get_next_event_occurance_time();  
        }
        
    }
}