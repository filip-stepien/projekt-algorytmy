@echo off
cd..
cd src/node
node.exe ../histogram/app.js ../histogram/histogram_temp_js.txt ../../wyniki_js/histogram_js.json ../../wyniki_js/histogram_js.png
pause