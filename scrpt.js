$(function() {
    $("#mode").menu({
        select:function(event,ui) {          
            mode=ui.item.text();         
            ChangeMode(mode);        
            }      
    });    
});        
$(function(){      
    $("#ball_weight").slider({        
        min:0.02,        
        max:0.04,        
        step:0.01,        
        value:0.03,        
        change:function(event,ui){          
            ball.m=parseFloat(ui.value);          
            $("#ball_weight_text").text(ui.value+' grams');        
            }      
    });    
});        
$(function(){      
    $("#fan_power").slider({        
        min:0.1,        
        max:1.0,        
        step:0.1,        
        value:0.5,        
        change:function(event,ui ) {                     
            fan.m = parseFloat(ui.value);                    
            $( "#fan_power_text" ).text(ui.value);                
        }            
    });        
});                
$(function() {
    $('#pidInputForm').append('<button id="up">UP</button>');            
    $('#pidInputForm').append('<button id="down">DOWN</button>');                        
    $("#up").hide();            
    $("#down").hide();                        
    $('#up').click(function() {                
        Actuator += 0.0075;                
        $("#actuatorValue").text("Actuator: "+Actuator.toFixed(6));                
        pidAnim.adjustFan(Actuator, maxSpeed);                
        return false;            
    });                                    
    $('#down').click(function() {                
        if (Actuator > 0) {                    
            Actuator -= 0.0075;                    
            $("#actuatorValue").text("Actuator: "+Actuator.toFixed(6));                    
            pidAnim.adjustFan(Actuator, maxSpeed);                
        }                
        return false;            
    });        
});   