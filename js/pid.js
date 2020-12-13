/*
    File: pid.js
    Author: Timothy Cherney
    Javascript simulation of a pid controlled system
*/

/*
  Dependencies:
  * metrics.js must be loaded in pid.html before this file.
*/

var ACTUATOR_MAX = 10;
var INTEG_MAX = 1000;
var INTEG_MIN = -1000;

/* PID vars */
var pid = {
    Desired: 0,
    Actual: 0,
    ActualPrev: 0,
    Error:0,
    Deriv:0,
    Integ: 0,
    Actuator: 0,
    p: 0,
    i: 0,
    d: 0
};

/* Timer vars */
var timer = -1;
var timerPeriod = 1;
var timeCnt = 0;
var simSpeed = timerPeriod*50;
var dt = simSpeed/1000;

/* System sim vars */
var sampleRate = 10;
var fan = {f:0,m:0.5,a:0};
var g = 9.8;
var ball = {pos:0,v:0,a:0,m:0.027};
var ActuatorPrev=0;
var ballMin = 0;
var ballMax;
var maxSpeed;
var baseSpeed = 0.2;
var actuatorMin = 0;
var mode = "PID Controller"

/* Plot vars */
var maxNumPoints = 500;
var maxVisiblePoints = 100;
var plots = new Array(maxNumPoints); //pre allocate array
var yMin;
var yMax;
var xMin;
var xMax;
var indexToWrite = 0;
var adjustWindow = false;
var plot =null;


/* Anim var */
var pidAnim = new PIDAnim(timerPeriod);

//fix lame positioning from jqplot.
$('#chartdiv').animate({ top: "-=70" }, 1);
$('#modelAnimation').animate({ top: "-=160" }, 1);

function ChangeMode(mode) {
    if (mode == "PID Controller") {
        $("#p").show();
        $("#i").show();
        $("#d").show();
        $("#P_label").show();
        $("#I_label").show();
        $("#D_label").show();
        $("#desiredContainer").show();
        $("#manualSliderContainer").hide();
        hideCustom();
    }
    else if (mode == "Manual Control") {
        $("#p").hide();
        $("#i").hide();
        $("#d").hide();
        $("#P_label").hide();
        $("#I_label").hide();
        $("#D_label").hide();
        $("#desiredContainer").hide();
        $("#manualSliderContainer").show();
        hideCustom();
    }
    else if (mode == "Custom Control") {
        $("#p").hide();
        $("#i").hide();
        $("#d").hide();
        $("#P_label").hide();
        $("#I_label").hide();
        $("#D_label").hide();
        $("#desiredContainer").hide();
        $("#manualSliderContainer").hide();
        $("#openCustom").show();
    }
    reset();
}

function updateController()
{
    pid.Error = (pid.Desired) - (pid.Actual);
    pid.Deriv = (pid.Actual) - (pid.ActualPrev);
    pid.Integ += pid.Error;
    if(pid.Integ > INTEG_MAX)
    {
        pid.Integ=INTEG_MAX;
    }
    if(pid.Integ < INTEG_MIN)
    {
        pid.Integ=INTEG_MIN;
    }

    pid.Actuator = pid.p*(pid.Error) + pid.i*(pid.Integ) - pid.d*(pid.Deriv);
    if(pid.Actuator < actuatorMin)
    {
        pid.Actuator = actuatorMin;
    }
    if(pid.Actuator > ACTUATOR_MAX)
    {
        pid.Actuator = ACTUATOR_MAX;
    }

    pid.Actuator += baseSpeed;
    $("#actuatorValue").text("Actuator: "+pid.Actuator.toFixed(6));
    pidAnim.adjustFan(pid.Actuator, maxSpeed);

}

function stopSimulation()
{
    clearInterval(timer);
    $("#p").removeAttr("disabled");
    $("#i").removeAttr("disabled");
    $("#d").removeAttr("disabled");
    $("#desired").removeAttr("disabled");
    $("#resetButton").removeAttr("disabled");
    $("#mode").menu( "option", "disabled", false);
    clearInterval(pidAnim.handle)
}
function reset()
{
    $('#chartdiv').empty();
    temp = 0;
    pid.Desired = 0;
    pid.Actual = 0;
    pid.Integ = 0;
    pid.ActualPrev = 0;
    ActuatorPrev=0;
    if (mode == "PID Controller") {
        pid.Actuator = 0;
    }
    timer = -1;
    pid.Actual = 0;
    timeCnt = 0;
    plot = null;
    for(var i=0; i < maxNumPoints; i++)
    {
        plots[i] = [0,0];
    }
    fan.f = 0;
    fan.a = 0;
    ball.pos = 0;
    ball.v = 0;
    ball.a = 0;
    pidAnim.handle = 0;
    indexToWrite = 0;
    adjustWindow = false;
}
function validateInput(input)
{
    var value = $(input).val();
    var re = new RegExp(/(^([0-9]+)$)|(^([0-9]+.[0-9]+)$)/);
    if(!value.trim().match(re))
    {
        $(input).css("border-color","red");
        return false;
    }else
    {
        $(input).css("border-color","");
    }
    return true;
}
function validateForm()
{
    //display errors for all
    var valid = validateInput("#p");
    valid &= validateInput("#i");
    valid &= validateInput("#d");
    valid &= validateInput("#desired");
    return valid;
}
function startSimulation()
{
    if (mode == "Custom Control") {
        customController.parse($("#customEquationField").val());
        return;
    }

    if(validateForm())
    {
        stopSimulation();
        reset();
        pid.p = parseFloat($("#p").val());
        pid.i = parseFloat($("#i").val());
        pid.d = parseFloat($("#d").val());
        pid.Desired = parseFloat($("#desired").val());
        pid.Actual = 0;
        $("#p").attr("disabled",true);
        $("#i").attr("disabled",true);
        $("#d").attr("disabled",true);
        $("#desired").attr("disabled",true);
        $("#resetButton").attr("disabled",true);
        $("#mode").menu( "option", "disabled", true);
        yMin = 0;
        yMax = (pid.Desired*2);
        ballMax = (pid.Desired*2);
        xMin = 0;
        xMax = maxVisiblePoints*sampleRate*dt;
        maxSpeed = ((pid.p*pid.Desired) + pid.i * INTEG_MAX) > ACTUATOR_MAX ? ACTUATOR_MAX : ((pid.p * pid.Desired) + pid.i * INTEG_MAX) + 1;
        pidAnim.init(pid.Desired);
        timer = setInterval(simulate,timerPeriod);

        plot = $.jqplot("chartdiv",[plots],{
            title: "PID simulation",
            canvasOverlay: {
                show: true,
                objects: [
                    {
                        horizontalLine: {
                            name: "Desired",
                            y: pid.Desired,
                            color: "#c5b47f",
                            XOffset: 0
                        }
                    }]
            },
            series:[{showMarker:false}],
            axes:{
                xaxis:{
                    label:'Time (s)',
                    min:xMin,
                    max:xMax
                },
                yaxis:{
                    label:'Distance',
                    labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                    min:yMin,
                    max:yMax,
                    tickInterval: (pid.Desired*2)/20
                }
            }
        });
        applyChartText(plot,"Desired",pid.Desired);

    }
}
function continueSimulation()
{
    if(plot == null)
    {
        startSimulation();
    }
    if(validateForm())
    {
        stopSimulation();
        pid.p = $("#p").val();
        pid.i = $("#i").val();
        pid.d = $("#d").val();
        pid.Desired = $("#desired").val();
        $("#p").attr("disabled",true);
        $("#i").attr("disabled",true);
        $("#d").attr("disabled",true);
        $("#desired").attr("disabled",true);
        $("#resetButton").attr("disabled",true);
        ballMax = 2*(pid.Desired);
        maxSpeed = ((pid.p * pid.Desired) + pid.i * INTEG_MAX) > ACTUATOR_MAX ? ACTUATOR_MAX : ((pid.p * pid.Desired) + pid.i * INTEG_MAX);
        pidAnim.init(pid.Desired);
        timer = setInterval(simulate,timerPeriod);

    }
}

function updateSystem()
{
    fan.a = pid.Actuator;
    fan.f = fan.m*fan.a;
    ball.a = (fan.f/ball.m)-g;
    timeCnt+=1;
    ball.v = ball.v+(ball.a*dt);
    ball.pos = ball.pos+(ball.v*dt);
    if(ball.pos < ballMin)
    {
        ball.v = 0;
        ball.pos = ballMin;
    }
    if(ball.pos > ballMax)
    {
        ball.v = 0;
        ball.pos = ballMax;
    }

    ActuatorPrev = pid.Actuator;
    pid.ActualPrev = pid.Actual;
    pid.Actual = ball.pos;

    $("#actualValue").text("Actual: "+pid.Actual.toFixed(2));
    if((timeCnt%sampleRate) == 0)
    {
        plots[indexToWrite][0] = dt*timeCnt;
        plots[indexToWrite][1] = pid.Actual;
        indexToWrite = (indexToWrite+1)%maxNumPoints;
        pidAnim.adjustBall(pid.Actual);
    }
}
function resetForm()
{
    if(!($("#resetButton").is("[disabled]")))
    {
        $("#pidInputForm")[0].reset();
    }
    validateForm();
}
function simulate()
{
    if (mode == "PID Controller") {
        updateController();
    }
    updateSystem();
    // updateMetrics();
    metrics.update();

    if((timeCnt%sampleRate) == 0)
    {
        if(indexToWrite >= (maxVisiblePoints-10) || adjustWindow)
        {
            xMin+=dt*sampleRate;
            xMax+=dt*sampleRate;
            adjustWindow = true;
        }

        plot.series[0].data = plots;
        plot.axes.xaxis.min = xMin;
        plot.axes.xaxis.max = xMax;
        plot.replot();
        applyChartText(plot,"Desired",pid.Desired);
    }
}
function applyChartText(plot, text, lineValue) {
     var maxVal = yMax;
     var minVal = yMin;
     var range = maxVal + Math.abs(minVal); // account for negative values
     var titleHeight = plot.title.getHeight();
     if (plot.title.text.indexOf("<br") > -1) { // account for line breaks in the title
          titleHeight = titleHeight * 0.5; // half it
     }
     // you now need to calculate how many pixels make up each point in your y-axis
     var pixelsPerPoint = (plot._height - titleHeight  - plot.axes.xaxis.getHeight()) / range;
     if(maxVal - lineValue < 0)return; //dont print when not visible
     var valueHeight = ((maxVal - lineValue) * pixelsPerPoint) + 10;
     // insert the label div as a child of the jqPlot parent
     var title_selector = $(plot.target.selector).children('.jqplot-overlayCanvas-canvas');
     $('<div class="jqplot-point-label " style="position:absolute;  text-align:right;width:95%;top:' + valueHeight + 'px;">' + text + '</div>').insertAfter(title_selector);
}
