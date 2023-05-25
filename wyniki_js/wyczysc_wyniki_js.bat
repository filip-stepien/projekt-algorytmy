@echo off

:choice
set /P c=Czy na pewno chcesz wyczyscic wyniki dzialania programu[y/n]?
if /I "%c%" EQU "y" goto :somewhere
if /I "%c%" EQU "n" goto :somewhere_else
goto :choice


:somewhere

if exist %cd%\macierze_js.txt ( del /q %cd%\macierze_js.txt )
if exist %cd%\histogram_js.json ( del /q %cd%\histogram_js.json )
if exist %cd%\histogram_js.png ( del /q %cd%\histogram_js.png )

cd..
if exist %cd%\src\histogram\histogram_temp_js.txt ( del /q %cd%\src\histogram\histogram_temp_js.txt )

echo Wyczyszczono wyniki dzialania programu (jezyk JavaScript).

pause
exit

:somewhere_else

echo Anulowano operacje.
pause