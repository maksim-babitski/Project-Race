# Project-Race
This is a simple racing game.  

There is a start menu with the rules of the game and 3 levels of difficulty. The task is to drive as much distance as possible. The distance traveled is displayed in the upper corner. After a collision with a rival car, the game ends and the user sees a menu with his result and record, information about whether the player broke the game record (if he did - the record is overwritten). The user is offered to improve his record and start the game again.  A table of records (different records for each level) is stored on the server.  

JavaScript animation: movement of lanes, rival cars, main car in four directions. When you turn left and right, the car tilt angle changes, as well as the angle of the wheels.  

The basic elements, road markings and cars, are built with DOM.  

Control in the main menu is done with the mouse (or touchscreen). The control of the car is done with the up/down/left/right keys. On mobile devices - touchscreen using 4 buttons. There is background music, which changes after a collision. Collision sound, vibration on collision.  

AJAX is used for loading hash with game records. For each level - a different record. If a player has beaten the record, it is overwritten and saved.  

This is a single page application. When the page is closed or reloaded, the user is warned about possible unsaved changes.  

The app automatically adjusts to available screen sizes. It works correctly in a mobile browser.  

project link: http://z29175ho.beget.tech
