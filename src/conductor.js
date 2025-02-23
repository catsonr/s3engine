class Chart {
    constructor(playbackData) {
        this.playbackData = playbackData;

        this.BPM = 96.51 * 2;
        this.beatspermeasure = 4;
        this.measuredivision = 4;
    }
}

class Conductor {
    constructor(chart) {
        this.chart = chart;

        this.t = 0;
        this.lastMeasureTime = 0.0;
        this.lastBeatTime = 0.0;

        this.measure = 0;
        this.beat = 0;

        this.milisecondsPerMeasure = (60 * 1000 * this.chart.beatspermeasure) / this.chart.BPM;
        this.milisecondsPerBeat = this.milisecondsPerMeasure / this.chart.measuredivision;

        this.playing = true;
    }

    setTime(t_new) {
        // setup as if playing from t_new
    }

    stepdt(dt) {
        this.t += dt;

        if(this.t - this.lastMeasureTime > this.milisecondsPerMeasure) {
            this.measure++;
            this.lastMeasureTime += this.milisecondsPerMeasure;
            this.lastBeatTime = this.lastMeasureTime;
            this.beat = 0;
        }

        if(this.t - this.lastBeatTime > this.milisecondsPerBeat) {
            let beatsPassed = Math.floor((this.t - this.lastMeasureTime) / this.milisecondsPerBeat);
            this.beat = beatsPassed % this.chart.measuredivision;
            this.lastBeatTime = this.lastMeasureTime + this.beat * this.milisecondsPerBeat;
        }
    }
}