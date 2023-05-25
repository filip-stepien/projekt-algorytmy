@echo off

:choice
set /P c=Czy na pewno chcesz wyczyscic wyniki dzialania programu[y/n]?
if /I "%c%" EQU "y" goto :somewhere
if /I "%c%" EQU "n" goto :somewhere_else
goto :choice


:somewhere

if exist %cd%\macierze_c.txt ( del /q %cd%\macierze_c.txt )
if exist %cd%\histogram_c.json ( del /q %cd%\histogram_c.json )
if exist %cd%\histogram_c.png ( del /q %cd%\histogram_c.png )

cd..
if exist %cd%\src\histogram\histogram_temp_c.txt ( del /q %cd%\src\histogram\histogram_temp_c.txt )

echo Wyczyszczono wyniki dzialania programu (jezyk C).

pause
exit

:somewhere_else

echo Anulowano operacje.
pause