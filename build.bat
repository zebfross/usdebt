ECHO OFF
echo "cleaning build directory"
del /Q /S .\bin\*

xcopy /s /y .\scripts\knockout.js .\bin\scripts
xcopy /s /y .\styles\* .\bin\styles
xcopy /s /y .\images\* .\bin\images
xcopy /s /y .\fonts\* .\bin\fonts
xcopy /y .\index.html .\bin
xcopy /y .\about.html .\bin
xcopy /y .\node_modules\sizzle\dist\sizzle.min.js .\bin\scripts

copy /B ^
.\scripts\models.js + ^
.\scripts\index.js + ^
.\scripts\data\trump-1.js + ^
.\bin\scripts\index.js + ^
.\scripts\data\obama-2.js + ^
.\scripts\data\obama-1.js + ^
.\scripts\data\bush-jr-1.js + ^
.\scripts\data\bush-jr-2.js + ^
.\scripts\data\clinton-2.js + ^
.\scripts\data\clinton-1.js + ^
.\scripts\data\bush-2.js .\bin\scripts\index.js

rem uglifyjs --overwrite .\bin\scripts\index.js
