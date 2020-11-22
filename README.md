# PID Simulator

This project aims to make some improvements to the original PID simulator created by Timothy Cherney.

## Added Features
* Manual controller operates with a slider instead of buttons.
* Cleaned up the UI to make the relationship between the Controller, Plant, and visual model more explicit.
* Create a system for viewing metrics such as overshoot, steady state error, rise time, and oscillation.

## Implementation Changes:
* Removed initPid() function, created new file scrpt.js., 'Start' button no longer calls initPid().
  * This function was called once when the pid.html is loaded, and every time the 'Start' button is pressed.
  * Since initPid() would immediately return every time after the first call, the 'Start' button doesn't need to call it.
  * initPid() would load html and js code from vars that were 3000+ characters long. For ease of development, the html has been moved to pid.html, and the js was moved to scrpt.js.
* Overshoot, steady-state error, oscillation, and rise time are implemented in pid.js
  * Buttons Start, Stop, Continue, have functions resetMetrics(), stopMetrics(), continueMetrics() added as onclick functions.
  * Information is displayed next to the graph.
* Replaced Controller and Plant images with html objects to allow for easier changes to UI in the future.
* Moved the fan animation inside the Plant Controller.
* Removed various unnecessary html tags from pid.html.
