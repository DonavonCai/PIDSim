/*
    File: pid.js
    Author: Timothy Cherney
    Javascript simulation of a pid controlled system
*/

/* PID vars */
var Desired = 0;
var Actual = 0;
var Error;
var Deriv;
var Integ = 0;
var ActualPrev = 0;
var Actuator = 0;
var actuatorMax = 10;
var integMax = 1000;
var integMin = -1000;
var p;
var i;
var d;

/* Metrics vars */
var overShoot = 0;
var steadyStateErr = 0;
var oscillation = 0;
var riseTime = 0;

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
        $("#up").hide();
        $("#down").hide();
    }
    else {
        $("#p").hide();
        $("#i").hide();
        $("#d").hide();
        $("#P_label").hide();
        $("#I_label").hide();
        $("#D_label").hide();
        $("#up").show();
        $("#down").show();
    }
    reset();
}

function updateController()
{
    //console.log("Absolute max: "+(p*Desired+i*integMax));
    Error = (Desired) - (Actual);
    Deriv = (Actual) - (ActualPrev);
    Integ += Error;
    if(Integ > integMax)
    {
        Integ=integMax;
    }
    if(Integ < integMin)
    {
        Integ=integMin;
    }
    //console.log((p*Error)+" "+(i*Integ)+" "+(d*Deriv));
    Actuator = p*Error + i*Integ - d*Deriv;
    if(Actuator < actuatorMin)
    {
        Actuator = actuatorMin;
    }
    if(Actuator > actuatorMax)
    {
        Actuator = actuatorMax;
    }

    Actuator += baseSpeed;
    $("#actuatorValue").text("Actuator: "+Actuator.toFixed(6));
    pidAnim.adjustFan(Actuator, maxSpeed);

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
    Desired = 0;
    Actual = 0;
    Integ = 0;
    ActualPrev = 0;
    ActuatorPrev=0;
    if (mode == "PID Controller") {
        Actuator = 0;
    }
    timer = -1;
    Actual = 0;
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
    if(validateForm())
    {
        stopSimulation();
        reset();
        p = parseFloat($("#p").val());
        i = parseFloat($("#i").val());
        d = parseFloat($("#d").val());
        Desired = parseFloat($("#desired").val());
        Actual = 0;
        $("#p").attr("disabled",true);
        $("#i").attr("disabled",true);
        $("#d").attr("disabled",true);
        $("#desired").attr("disabled",true);
        $("#resetButton").attr("disabled",true);
        $("#mode").menu( "option", "disabled", true);
        yMin = 0;
        yMax = (Desired*2);
        ballMax = (Desired*2);
        xMin = 0;
        xMax = maxVisiblePoints*sampleRate*dt;
        maxSpeed = (p*Desired+i*integMax) > actuatorMax ? actuatorMax : (p*Desired+i*integMax) + 1;
        pidAnim.init(Desired);
        timer = setInterval(simulate,timerPeriod);

        plot = $.jqplot("chartdiv",[plots],{
            title: "PID simulation",
            canvasOverlay: {
                show: true,
                objects: [
                    {
                        horizontalLine: {
                            name: "Desired",
                            y: Desired,
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
                    tickInterval: (Desired*2)/20
                }
            }
        });
        applyChartText(plot,"Desired",Desired);

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
        p = $("#p").val();
        i = $("#i").val();
        d = $("#d").val();
        Desired = $("#desired").val();
        $("#p").attr("disabled",true);
        $("#i").attr("disabled",true);
        $("#d").attr("disabled",true);
        $("#desired").attr("disabled",true);
        $("#resetButton").attr("disabled",true);
        ballMax = (Desired*2);
        maxSpeed = (p*Desired+i*integMax)>actuatorMax?actuatorMax:(p*Desired+i*integMax);
        pidAnim.init(Desired);
        timer = setInterval(simulate,timerPeriod);

    }
}

function updateSystem()
{

    //console.log("System Actuator: "+Actuator);
    fan.a = Actuator;
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

    ActuatorPrev = Actuator;
    ActualPrev = Actual;
    Actual = ball.pos;
    //console.log("Actual: "+Actual+" timeCnt: "+timeCnt);
    $("#actualValue").text("Actual: "+Actual.toFixed(2));
    if((timeCnt%sampleRate) == 0)
    {
        plots[indexToWrite][0] = dt*timeCnt;
        plots[indexToWrite][1] = Actual;
        indexToWrite = (indexToWrite+1)%maxNumPoints;
        pidAnim.adjustBall(Actual);
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
        applyChartText(plot,"Desired",Desired);


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
