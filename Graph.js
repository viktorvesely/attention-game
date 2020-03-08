class Grapher {
    constructor(left_timeline, right_timeline) {
        this.r_timeline = right_timeline;
        this.l_timeline = left_timeline;
        this.placeHolder = $("#graph");
        this.l_start_event = [];   
        this.l_fail_event = [];   
        this.l_react_event = [];   
        this.r_start_event = [];   
        this.r_fail_event = [];
        this.r_react_event = [];   
        this.names = ["Left start", "Left fail", "Left react", "Right start", "Right fail", "Right react"];
        this.init_events();
        this.make_graph(
            [
                this.l_start_event,
                this.l_fail_event,
                this.l_react_event,
                this.r_start_event,
                this.r_fail_event,
                this.r_react_event
            ],
            [
                this.get_array(this.l_start_event.length, 0.4),
                this.get_array(this.l_fail_event.length, 0.4),
                this.get_array(this.l_react_event.length, 0.4),
                this.get_array(this.r_start_event.length, 0.6),
                this.get_array(this.r_fail_event.length, 0.6),
                this.get_array(this.r_react_event.length, 0.6)
            ],
            this.names
        );
    }

    get_array(size, value) {
        let ret = [];
        while(size--) ret.push(value);
        return ret;
    }

    init_events() {
        let game_start = this.l_timeline[0].timestamp;
        this.l_timeline.forEach(event => {
            let timestamp = event.timestamp;
            if (event.name == "event_fail") {
                this.l_fail_event.push((timestamp - game_start) / 1000);
            }
            else if (event.name == "event_react") {
                this.l_react_event.push((timestamp - game_start) / 1000);
            }
            else if (event.name != "game_start" || event.name != "game_end") {
                this.l_start_event.push((timestamp - game_start) / 1000);
            }
        });

        this.r_timeline.forEach(event => {
            let timestamp = event.timestamp;
            if (event.name == "event_fail") {
                this.r_fail_event.push((timestamp - game_start) / 1000);
            }
            else if (event.name == "event_react") {
                this.r_react_event.push((timestamp - game_start) / 1000);
            }
            else if (event.name != "game_start" || event.name != "game_end") {
                this.r_start_event.push((timestamp - game_start) / 1000);
            }
        });
    }

    hide_placeholder() {
        this.placeHolder.css({
            opacity: 0
        });
    }

    show_placeholder() {
        this.placeHolder.css({
            opacity: 1
        });
    }

    make_graph(xs, ys, names) {
        let data = [];
        debugger;
        for (let i = 0; i < xs.length; ++i) {
            let trace = {
                x: xs[i],
                y: ys[i],
                mode: 'markers',
                type: 'scatter',
                name: names[i]
            };
            data.push(trace);
        }
        let layout = {
            title: {
                text:'Timeline',
                font: {
                  family: 'Courier New, monospace',
                  size: 24
                },
                xref: 'paper',
                x: 0.05,
              },
            yaxis: {
                range: [0, 1]
            },
            xaxis: {
                title: {
                  text: 'Time (s)',
                  font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                  }
                },
              },
              yaxis: {
                title: {
                  text: 'Tasks',
                  font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                  }
                }
              }
        };
        Plotly.newPlot('graph', data, layout);  
        this.show_placeholder();
    }
}