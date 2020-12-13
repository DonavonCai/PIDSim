// metrics is a global variable that is accessed in pid.js
var metrics = {
    findOverShoot: true,
    overShoot: 0,
    findRiseTime: true,
    timeStart: Date.now(),
    riseTime: 0,
    steadyStateErr: 0,
    // for oscillation
    pit: 0,
    peak: 0,
    foundPit: false,
    foundPeak: false,

    reset: function() {
        this.findOverShoot = true;
        this.overShoot = 0;
        this.findRiseTime = true;
        this.timeStart = Date.now();
        this.riseTime = 0;
        this.steadyStateErr = 0;
        this.pit = 0;
        this.peak = 0;
        this.foundPeak = false;
        this.foundPeak = false;

        $("#OvershootValue").text("Overshoot: 0");
        $("#RiseTimeValue").text("Rise Time: 0s");
        $("#StateErrorValue").text("Steady-State Error: 0");
        $("#OscillationValue").text("Oscillation: 0");
    },

    stop: function() {
        if (this.findRiseTime)
        this.riseTime += (Date.now() - this.timeStart);
    },

    continue: function() {
        if (this.findRiseTime)
            this.timeStart = Date.now();
    },

    update: function() {
        if (this.findOverShoot)
        {
            if (pid.Actual >= pid.ActualPrev)
            {
                // This block never executes if the condition is moved up. I don't know why.
                if (pid.Actual >= pid.Desired) {
                    this.overShoot = pid.Actual - pid.Desired;
                    $("#OvershootValue").text("Overshoot: "+this.overShoot.toFixed(2));
                }
            }
            else
            {
                this.findOverShoot = false;
            }
        }

        if (this.findRiseTime)
        {
            if (pid.Actual >= pid.Desired)
            {
                this.riseTime += Date.now() - this.timeStart;
                this.findRiseTime = false;
                $("#RiseTimeValue").text("Rise Time: "+(this.riseTime / 1000).toFixed(2)+"s");
                this.steadyStateErr = 0;
                $("#StateErrorValue").text("Steady-State Error: 0");
            }
        }

        this.steadyStateErr = (pid.Desired - pid.Actual).toFixed(2);
        $("#StateErrorValue").text("Steady-State Error: "+this.steadyStateErr);

        if (!this.foundPeak) {
            if (pid.Actual < pid.ActualPrev) {
                if (pid.Actual >= pid.Desired) {
                    this.peak = Math.abs(pid.Actual - pid.Desired).toFixed(2);
                    this.foundPeak = true;
                    this.foundPit = false;
                }
            }
        }

        if (!this.foundPit) {
            if (pid.Actual > pid.ActualPrev) {
                this.pit = Math.abs(pid.Actual - pid.Desired).toFixed(2);
                this.foundPit = true;
                this.foundPeak = false;
            }
        }

        $("#OscillationValue").text("Oscillating between: +" + this.peak + ", -" + this.pit);
    }
}
