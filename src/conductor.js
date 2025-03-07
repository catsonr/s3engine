class Chart {
    constructor(playbackData) {
        this.playbackData = playbackData;

        this.BPM = undefined;
        this.beatspermeasure = undefined;
        this.measuredivision = undefined;

        // miliseconds until conductor starts
        this.conductor_offset = playbackData.conductor_offset;
        // miliseconds until bgm starts
        this.bgmOffset = playbackData.bgm_offset;

        this.setMeasure(0);
    }

    setMeasure(measureIndex) {
        const measure = this.playbackData.measures[measureIndex];
        if(measure == undefined) return;
        
        if("bpm" in measure) {
            this.BPM = measure.bpm;
        }
        if("beatspermeasure" in measure) {
            this.beatspermeasure = measure.beatspermeasure;
        }
        if("measuredivision" in measure) {
            this.measuredivision = measure.measuredivision;
        }

        this.milisecondsPerMeasure = (60 * 1000 * this.measuredivision) / this.BPM;
        this.milisecondsPerBeat = this.milisecondsPerMeasure / this.beatspermeasure;
    }
}

// --------------------------------------------------------------------------------

class Conductor {
    constructor(chart) {
        this.chart = chart;

        this.t = 0;
        this.lastMeasureTime = 0;
        this.lastBeatTime = -10000;

        this.measure = 0;
        this.beat = 0;

        this.playing = false;
        this.conductorOffsetOver = false;
        this.metronome = false;

        this.bgm = new Howl({
            src: [chart.playbackData.bgm_source]
        });
        this.bgm.once('load', function () {
            console.log('bgm loaded');
        });

        this.tick = new Howl({
            src: ['charts/tick.wav']
        });
    }
    
    start() {
        this.playing = true;
        this.bgm.play();
    }

    stop() {
        this.playing = false;
        this.bgm.pause();
    }

    pause() {
    }

    unpause() {
    }

    setTime(t_new) {
        // setup as if playing from t_new
    }

    // basically an update function. run every frame
    stepdt(dt) {
        if(!this.playing) return;

        if(this.chart.conductor_offset > 0) {
            this.chart.conductor_offset -= dt;

            if(this.chart.conductor_offset <= 0) {
                this.conductorOffsetOver = true;
            }
        }
        if(!this.conductorOffsetOver) return;

        this.t += dt;

        // if beat passed
        if(this.t - this.lastBeatTime > this.chart.milisecondsPerBeat) {
            let beatsPassed = Math.floor((this.t - this.lastMeasureTime) / this.chart.milisecondsPerBeat);
            this.beat = beatsPassed % this.chart.measuredivision;
            this.lastBeatTime = this.lastMeasureTime + this.beat * this.chart.milisecondsPerBeat;

            if(this.metronome) this.tick.play();
        }

        // if measure passed
        if(this.t - this.lastMeasureTime > this.chart.milisecondsPerMeasure) {
            this.measure++;
            this.lastMeasureTime += this.chart.milisecondsPerMeasure;
            this.lastBeatTime = this.lastMeasureTime;
            this.beat = 0;

            this.chart.setMeasure(this.measure);
        }

        this.bgm.on('end', function () {
            console.log('song over');
            this.stop();
        });
    }
}