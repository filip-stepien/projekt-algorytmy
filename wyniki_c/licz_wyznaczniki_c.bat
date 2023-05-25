@echo off
cd..
set "ABS_PATH_MATRIX=%cd%\wyniki_c\macierze_c.txt"
set "ABS_PATH_HISTOGRAM=%cd%\src\histogram\histogram_temp_c.txt"

cd src\c\bin\Release
wyznaczniki.exe %ABS_PATH_MATRIX% %ABS_PATH_HISTOGRAM%

pause
