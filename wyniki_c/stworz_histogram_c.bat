@echo off
cd..
cd src/node
node.exe ../histogram/app.js ../histogram/histogram_temp_c.txt ../../wyniki_c/histogram_c.json ../../wyniki_c/histogram_c.png
pause