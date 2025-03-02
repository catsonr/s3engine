class Chart {
    constructor(playbackData) {
        this.playbackData = playbackData;

        this.BPM = playbackData.m0.commands[0][1];
        this.beatspermeasure = 4;
        this.measuredivision = 4;
    }
}

class Conductor {
    constructor(chart) {
        this.chart = chart;
        console.log(this.chart);

        this.t = 0;
        this.lastMeasureTime = 0.0;
        this.lastBeatTime = 0.0;

        this.measure = 0;
        this.beat = 0;

        this.milisecondsPerMeasure = (60 * 1000 * this.chart.beatspermeasure) / this.chart.BPM;
        this.milisecondsPerBeat = this.milisecondsPerMeasure / this.chart.measuredivision;

        this.playing = false;
        this.metronome = false;

        this.bgm = new Howl({
            src: [chart.playbackData.bgm_source]
        });
        this.tick = new Howl({
            src: ['charts/shellfie/tick.wav']
        });

        // number of miliseconds conductor will wait to start counting
        this.offset = chart.playbackData.offset;

        // number of miliseconds bgm will wait to play
        this.bgmOffset = chart.playbackData.bgm_offset;
    }
    
    start() {
        this.playing = true;
        
        if(this.bgmOffset <= 0) {
            this.bgm.play();
        }
    }

    stop() {
        this.playing = false;
        this.bgm.pause();
    }

    setTime(t_new) {
        // setup as if playing from t_new
    }

    stepdt(dt) {
        if(!this.playing) return;

        this.t += dt;

        // if offset is still remaining
        if(this.offset > 0) {
            this.offset -= dt;

            // if offset has now been passed
            if(this.offset <= 0) {
                this.lastMeasureTime = this.t;
                this.lastBeatTime = this.t;
            }
            else {
                return;
            }
        }
        // if bgm offset is still remaining
        if(this.bgmOffset > 0) {
            this.bgmOffset -= dt;

            // if offset has now been passed
            if(this.bgmOffset <= 0) {
                this.bgm.play();
            }
        }

        // if beat passed
        if(this.t - this.lastBeatTime > this.milisecondsPerBeat) {
            let beatsPassed = Math.floor((this.t - this.lastMeasureTime) / this.milisecondsPerBeat);
            this.beat = beatsPassed % this.chart.measuredivision;
            this.lastBeatTime = this.lastMeasureTime + this.beat * this.milisecondsPerBeat;

            if(this.metronome) this.tick.play();
        }

        // if measure passed
        if(this.t - this.lastMeasureTime > this.milisecondsPerMeasure) {
            this.measure++;
            this.lastMeasureTime += this.milisecondsPerMeasure;
            this.lastBeatTime = this.lastMeasureTime;
            this.beat = 0;
        }

    }
}