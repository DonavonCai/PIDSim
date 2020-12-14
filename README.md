# PID Simulator

This project aims to make some improvements to the original PID simulator created by Timothy Cherney.

## Added Features
* Manual controller operates with a slider instead of buttons.
* Cleaned up the UI to make the relationship between the Controller, Plant, and visual model more explicit.
* Created a system for viewing metrics such as overshoot, steady state error, rise time, and oscillation.
* Custom controller using arithmetic expressions.
  * Equations must be in the form:`<variable name> = <expression>`
  * Instructions are performed in order, from top to bottom.
  * Multi-character variable names are supported, but variables must only contain alphabetic characters. Numbers and special characters are not allowed in variable names.
  * The variables `Desired`, `Actual`, and `Actuator` are system variables that can be used in the model.
    * Ex. `Actuator = 0.5` will set the actuator of the controller to 0.5 and update the fan accordingly.
    * The controller was designed with the assumption that `Desired` and `Actual` are never written to.
  * Variables are implicitly declared, so an instruction `x = y` is valid, even if `y` has not been explicitly declared. All variables implicitly declared are initialized to 0.
  * Implicit multiplication is supported: `x = 2y` or `x = y2` will evaluate as `x = y * 2`.
  * Parentheses are supported and work with implicit multiplication: `x = 2(y + z)`
  * The custom controller doesn't do extensive syntactical analysis or error checking. The program currently handles all detected errors by printing an error message to console.

## Implementation / Changes:
### Code
* Removed initPid() function, created new file scrpt.js., 'Start' button no longer calls initPid().
  * This function was called once when the pid.html is loaded, and every time the 'Start' button is pressed.
  * Since initPid() would immediately return every time after the first call, the 'Start' button doesn't need to call it.
  * initPid() would load html and js code from vars that were 3000+ characters long. For ease of development, the html has been moved to pid.html, and the js was moved to scrpt.js.
### Metrics
* Overshoot, steady-state error, oscillation, and rise time are implemented in pid.js
  * Buttons Start, Stop, Continue, have functions resetMetrics(), stopMetrics(), continueMetrics() added as onclick functions.
  * Information is displayed next to the graph.
* Replaced Controller and Plant images with html objects to allow for easier changes to UI in the future.
* Moved the fan animation inside the Plant Controller.
* Removed various unnecessary html tags from pid.html.
### Custom Control
* Custom control is implemented in multiple files in the js/customControl directory.
* The custom controller takes in a series of arithmetic expressions entered by the user.
* The program assumes each equation is separated by a newline.
* The program performs lexical analysis on each equation, separating them into a series of tokens.
* The tokens are then converted into postfix notation using the [Shunting Yard Algorithm](https://brilliant.org/wiki/shunting-yard-algorithm/).
* From postfix, a parse tree is built for each equation, which is used to compute values for each variable.
