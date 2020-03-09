class Grapher {
    constructor() {
        this.r_timeline = null;
        this.l_timeline = null;
        this.placeHolder = $("#graph");
        this.l_start_event = [];   
        this.l_fail_event = [];   
        this.l_react_event = [];
        this.l_decoy_event = [];
        this.r_start_event = [];   
        this.r_fail_event = [];
        this.r_react_event = [];   
        this.r_decoy_event = [];
        this.avg = [
        {
            reaction_x: [],
            reaction_y: [],
            reaction_sum: 0,
            reaction_count: 0,
            color: "rgb(0, 0, 0)",
            name: "l_avg"
        },
        {
            reaction_x: [],
            reaction_y: [],
            reaction_sum: 0,
            reaction_count: 0,
            color: "rgb(196, 0, 207)",
            name: "r_avg"
        }];
        this.end_x = 0;
        this.reaction_max = 1;
        this.game_start = null;
        this.names = ["l_start", "l_fail", "l_react", "l_decoy" ,"r_start", "r_fail", "r_react", "r_decoy"];
        this.colors = [
            "rgb(0, 162, 255)",
            "rgb(225, 10, 40)",
            "rgb(30, 130, 62)",
            "rgb(200, 200, 200)"
        ]
        this.colors = this.colors.concat(this.colors);
    }

    set_data(left_timeline, right_timeline) {
        this.l_timeline = left_timeline;
        this.r_timeline = right_timeline;
        this.init_events();
        this.make_graph(
            [
                this.l_start_event,
                this.l_fail_event,
                this.l_react_event,
                this.l_decoy_event,
                this.r_start_event,
                this.r_fail_event,
                this.r_react_event,
                this.r_decoy_event
            ],
            [
                this.get_array(this.l_start_event.length, 200),
                this.get_array(this.l_fail_event.length, 200),
                this.get_array(this.l_react_event.length, 200),
                this.get_array(this.l_decoy_event.length, 200),
                this.get_array(this.r_start_event.length, 0),
                this.get_array(this.r_fail_event.length, 0),
                this.get_array(this.r_react_event.length, 0),
                this.get_array(this.r_decoy_event.length, 0)
            ],
            this.names,
            this.colors
        );
        return this;
    }

    get_array(size, value) {
        let ret = [];
        while(size--) ret.push(value);
        return ret;
    }

    transform_x(timestamp) {
        return (timestamp - this.game_start) / 1000
    }

    resolve_dynamic_events(name, timestamp, isRight) {
        let args = name.split(":");
        switch(args[0]) {
            case "reaction":
                this.avg[isRight].reaction_count++;
                this.avg[isRight].reaction_sum += parseFloat(args[1]);
                let avg = this.avg[isRight].reaction_sum / this.avg[isRight].reaction_count;
                this.reaction_max = Math.max(avg, this.reaction_max);
                this.avg[isRight].reaction_y.push(avg);
                this.avg[isRight].reaction_x.push(this.transform_x(timestamp));
                break;
            case "penalty":
                this.avg[isRight].reaction_sum += parseFloat(args[1]);
                break;
            default:
                break;
        }
    } 

    init_events() {
        this.game_start = this.l_timeline[0].timestamp;
        this.l_timeline.forEach(event => {
            let timestamp = event.timestamp;
            switch(event.name) {
                case "event_fail":
                    this.l_fail_event.push(this.transform_x(timestamp));
                    break;
                case "event_start":
                    this.l_start_event.push(this.transform_x(timestamp));
                    break;
                case "decoy_start":
                    this.l_decoy_event.push(this.transform_x(timestamp));
                    break;
                case "event_react":
                    this.l_react_event.push(this.transform_x(timestamp));
                    break;
                case "game_start":
                    break;
                case "game_end":
                    this.end_x = this.transform_x(timestamp);
                    break;
                default:
                    this.resolve_dynamic_events(event.name, timestamp, 0);
                    break;
            }
        });

        this.r_timeline.forEach(event => {
            let timestamp = event.timestamp;
            switch(event.name) {
                case "event_fail":
                    this.r_fail_event.push(this.transform_x(timestamp));
                    break;
                case "event_start":
                    this.r_start_event.push(this.transform_x(timestamp));
                    break;
                case "decoy_start":
                    this.r_decoy_event.push(this.transform_x(timestamp));
                    break;
                case "event_react":
                    this.r_react_event.push(this.transform_x(timestamp));
                    break;
                case "game_start":
                case "game_end":
                    break;
                default:
                    this.resolve_dynamic_events(event.name, timestamp, 1);
                    break;
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

    make_graph(xs, ys, names, colors) {
        let data = [];
        for (let i = 0; i < xs.length; ++i) {
            let trace = {
                x: xs[i],
                y: ys[i],
                mode: 'markers',
                type: 'scatter',
                name: names[i],
                marker: {
                    color: colors[i],
                    size: 10
                }
            };
            data.push(trace);
        }
        this.avg.forEach(trace => {
            let avg_trace = {
                x: trace.reaction_x,
                y: trace.reaction_y,
                mode: 'lines+markers',
                name: trace.name,
                marker: {
                    color: trace.color,
                    size: 5
                },
                line: {
                    color: trace.color,
                    width: 1
                }
            };
            data.push(avg_trace);
        });
        let total_avg = (
            this.avg[0].reaction_y[this.avg[0].reaction_y.length - 1] +
            this.avg[1].reaction_y[this.avg[1].reaction_y.length - 1]
            )  / 2;

        let layout = {
            shapes: [
            {
                x0: 0,
                y0: total_avg,
                x1: this.end_x,
                y1: total_avg,
                type: 'line',
                line: {
                    color: 'rgb(0, 0, 0)',
                    width: 1
                }
            }],
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
                  text: 'Reaction (ms)',
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