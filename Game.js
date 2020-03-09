const g_animation_duration = 0.18; // seconds
const g_tick_base = 64; // ticks per seconds

class Game {
    constructor(game_time=30) {
        this.task1_div = document.getElementById("left");
        this.task2_div = document.getElementById("right");

        let origin_color1 = this.get_color(this.task1_div);
        this.task1_div.style.setProperty("--originColor", origin_color1);
        let origin_color2 = this.get_color(this.task2_div);
        this.task2_div.style.setProperty("--originColor", origin_color2);
        
        this.task1_div.style.setProperty("--animationDuration", `${g_animation_duration}s`);
        this.task2_div.style.setProperty("--animationDuration", `${g_animation_duration}s`);

        this.left_port = null;
        this.right_port = null;
        this.task1_timeout = null;
        this.task2_timeout = null;
        this.main_loop_interval = null;
        this.game_time = game_time;
        
        this.running = false;
        this.ready_left = false;
        this.ready_right = false;
        this.start_time = 0;
        this.wasReady = false;

        let ctx = this;
        window.addEventListener("keydown", e => {
            ctx.on_key_down_listener.call(ctx, e);
        });
    }

    set_left_port(module) {
        this.left_port = module.attach_viewPort(this.task1_div);
        return this;
    }

    set_right_port(module) {
        this.right_port = module.attach_viewPort(this.task2_div);
        return this;
    }

    get_visual_module(avarage_time_delta, offset) {
        return new VisualModule(avarage_time_delta, offset);
    }

    get_audio_module(avarage_time_delta, offset, custom_names=null) {
        return new AudioModule(avarage_time_delta, offset, custom_names);
    }

    get_color(element) {
        let style = window.getComputedStyle(element);
        return style.backgroundColor;
    }

    end_left_animation() {
        this.task1_div.classList.remove("flash-animation");
        this.task1_timeout = null;
    }

    end_right_animation() {
        this.task2_div.classList.remove("flash-animation");
        this.task2_timeout = null;
    }

    flash_left() {
        if (this.task1_timeout !== null) {
            return;
        }
        this.task1_div.classList.add("flash-animation");
        this.task1_timeout = setTimeout(() => {
            this.end_left_animation();
        }, g_animation_duration * 1000);
    }

    flash_right() {
        if (this.task2_timeout !== null) {
            return;
        }
        this.task2_div.classList.add("flash-animation");
        this.task2_timeout = setTimeout(() => {
            this.end_right_animation();
        }, g_animation_duration * 1000);
    }

    evaluate_game() {
        let avg_reaction_time = 0;
        avg_reaction_time += this.left_port.get_avg_reaction();
        avg_reaction_time += this.right_port.get_avg_reaction();
        avg_reaction_time /= 2;
        avg_reaction_time = Math.round(avg_reaction_time);
        this.set_text(`Avg reaction time: ${avg_reaction_time}ms`);
        new Grapher().set_data(this.left_port.events, this.right_port.events);
    }

    step() {
        if (Date.now() - this.start_time >= this.game_time * 1000) {
            window.clearInterval(this.main_loop_interval);
            this.left_port.game_end();
            this.right_port.game_end();
            this.evaluate_game();
            return;
        }
        this.left_port.step()
        this.right_port.step();
    }

    set_text(text) {
        $(".overlay .text").text(text);
    }

    ready_sequence() {
        let ctx = this;
        if (this.wasReady) return;
        this.wasReady = true;
        setTimeout(()=> {
            ctx.set_text("3");
            setTimeout(()=> {
                ctx.set_text("2");
                setTimeout(()=> {
                    ctx.set_text("1");
                    setTimeout(()=> {
                        ctx.set_text("");
                        ctx.main_loop.call(ctx);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 500);
    }
    
    game_start() {
        if (!this.ready_left || !this.ready_right) return;
        this.ready_sequence();
    }

    main_loop() {
        this.running = true;

        if (this.left_port) {
            this.left_port.game_start();
        }
        if (this.right_port) {
            this.right_port.game_start();
        }
        this.start_time = Date.now();
        let ctx = this;
        this.main_loop_interval = setInterval(() => {this.step.call(ctx)}, 1000 / g_tick_base);
    }

    on_key_down_listener(e) {
        switch(e.keyCode) {
            case 39: // RightArrow
                this.flash_right();
                if (this.running) {
                    if (this.right_port) {
                        this.right_port.button();
                    }
                } else {
                    this.ready_right = true;
                    this.right_port.ready();
                    this.game_start();
                }
                break;
            case 37: // LeftArrow
                this.flash_left();
                if (this.running) {
                    if (this.left_port) {
                        this.left_port.button();
                    }
                } else {
                    this.ready_left = true;
                    this.left_port.ready();
                    this.game_start();
                }
                break;
        }
    }
}

