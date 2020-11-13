# PID Simulator

This project aims to make some improvements to the original PID simulator created by Timothy Cherney.

## Improvements (tentative)
* Make the manual controller operate with a slider instead of buttons.
* Clean up the UI to make the relationship between the Controller, Plant, and visual model more explicit.
* Create a system for viewing metrics such as overshoot, steady state error, rise time, and oscillation.
* Implement system for recommendations for PID tuning from results of simulation.
* Increase the range for ball weight?
* Change 'Reset' button to 'Default Values'

## Implementation Details:
* Removed initPid() function, created new file scrpt.js., 'Start' button no longer calls initPid().
  * This function was called once when the pid.html is loaded, and every time the 'Start' button is pressed.
  * Since initPid() would immediately return every time after the first call, the 'Start' button doesn't need to call it.
  * initPid() would load html and js code from vars that were 3000+ characters long. The html is for <div id='pid>, and the js handled behavior for sliders, menus, and hiding elements when switching between PID and Manual Control. For ease of development, the html code has been moved to pid.html, and the js code was moved to scrpt.js.
