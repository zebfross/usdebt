ECHO OFF
echo "cleaning build directory"
del /Q /S .\bin\*

xcopy /s /y .\scripts\jquery.js .\bin\scripts
xcopy /s /y .\scripts\knockout.js .\bin\scripts
xcopy /s /y .\styles\* .\bin\styles
xcopy /s /y .\images\* .\bin\images
xcopy /s /y .\fonts\* .\bin\fonts
xcopy /y .\index.html .\bin
xcopy /y .\about.html .\bin
xcopy /y "C:\Users\Zeb\Documents\node\us_debt\node_modules\sizzle\dist\sizzle.min.js" .\bin\scripts

FOR /F "tokens=*" %%i IN (.\scripts\index.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\trump-1.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\obama-2.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\obama-1.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\bush-jr-1.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\bush-jr-2.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\clinton-2.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\clinton-1.js) DO @echo %%i >> .\bin\scripts\index.js
FOR /F "tokens=*" %%i IN (.\scripts\bush-2.js) DO @echo %%i >> .\bin\scripts\index.js

rem FOR /F "tokens=*" %%i IN (.\scripts\index.js) DO @echo %%i >> .\test.out

uglifyjs --overwrite .\bin\scripts\index.js
