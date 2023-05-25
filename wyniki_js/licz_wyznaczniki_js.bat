@echo off
cd..
set "ABS_PATH_MATRIX=%cd%\wyniki_js\macierze_js.txt"
set "ABS_PATH_HISTOGRAM=%cd%\src\histogram\histogram_temp_js.txt"

cd src\node
node.exe ..\js\app.js %ABS_PATH_MATRIX% %ABS_PATH_HISTOGRAM%

pause
