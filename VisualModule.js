const g_visual_size = 180;


const Visual_events = {
    "visual-square": {

    },
    "visual-circle": {

    },
    "visual-triangle": {

    },
    "visual-x": {

    }
}

const Visual_events_names = ["visual-square", "visual-circle", "visual-triangle", "visual-x"];

class VisualModule extends Module {
    constructor(avg_delta_seconds, offset) {
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
            );
        this.event_show = -1;
        this.addClass = null;
        this.expected_event = this.random_int(0, Visual_events_names.length);
    }

    ready() {
        this.hide_event();
    }

    is_event_visible() {
        return this.show_event !== -1;
    }


    init_element(jEl, dx, width, name) {
        jEl.css({
            "width": g_visual_size + "px",
            "height": g_visual_size + "px"
        });
        jEl.css({
            "display": "none",
            "left": (dx + (width / 2 - jEl.width() / 2)).toString() + "px"
        });
        jEl.center_vertical();
    }

    get_jElement(name) {
        return $(`.${name}.${this.addClass}`);
    }

    load_events() {
        this.addClass = this.viewPort.getAttribute("id") 
        let position = $(this.viewPort).position();
        let width = $(this.viewPort).width();
        for(let name in Visual_events) {
            if (name === "visual-triangle") {
                $(document.body).append(this.get_triangle_svg(name));
            }
            else if (name === "visual-x") {
                $(document.body).append(this.get_x_svg(name));
            }
            else {
                $(document.body).append(`<div class='event ${name} ${this.addClass}'></div>`);
            }
            this.init_element(this.get_jElement(name), position.left, width, name);
        }
        this.show_event_by_id(this.expected_event);
    }

    hide_event() {
        let name = Visual_events_names[this.event_show];
        this.get_jElement(name).css({
            "display": "none"
        });
        this.event_show = -1;
    }

    show_event(element, id) {
        if (this.is_event_visible()) {
            this.hide_event();
        }
        this.event_show = id;
        element.css({
            "display": "inline-block"
        });
    }

    show_random_not_previous_event() {
        let newId;
        do {
            newId = this.random_int(0, Visual_events_names.length);
        } while (newId === this.event_show);
        this.show_event_by_id(newId);
    }

    show_event_by_id(id) {
        let name = Visual_events_names[id];
        this.show_event(this.get_jElement(name), id);
    }

    show_event_by_name(name) {
        let id = -1;
        for(let i in Visual_events_names) {
            if (Visual_events_names[i] == name) {
                id = i;
                break;
            }
        }
        if (id === -1) {
            throw new Error(`Invalid visual event name, got '${name}'`);
        }
        this.show_event(this.get_jElement(name), id);
    }

    event_is_valid() {
        return this.expected_event === this.event_show;
    }

    event_on_end() {
        if (this.is_event_visible()) {
            this.hide_event();
        }
    }

    event_act() {
        this.show_random_not_previous_event();
        return this.event_show === this.expected_event;
    }

    event_button() {
        let success = this.event_is_valid();
        return success;
    }
    
    get_x_svg(name) {
        return `<img class='event ${name} ${this.addClass}' src="./x.svg">`;
    }

    get_triangle_svg(name) {
        return `<img class='event ${name} ${this.addClass}' src="./triangle.svg">`;
    }
}