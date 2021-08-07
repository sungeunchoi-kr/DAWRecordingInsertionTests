:: "inject" custom version of electron-dl into node_modules
copy lib\electron-dl node_modules\electron-dl /y

:: "inject" custom fork of iohook into node_modules.
:: Make sure the project in `..\iohook-sungeunchoi.kr` is properly built.
:: Refer to <https://github.com/sungeunchoi-kr/muse-app/issues/161#issuecomment-841917089>.
:: node build.js --upload=false --runtime=electron --version=12.0.6 --abi=87
copy ..\iohook-sungeunchoi.kr node_modules\iohook /y
md node_modules\iohook\builds\electron-v87-win32-x64\build\Release
copy ..\iohook-sungeunchoi.kr\build\Release\iohook.node node_modules\iohook\builds\electron-v87-win32-x64\build\Release /y
copy ..\iohook-sungeunchoi.kr\build\Release\uiohook.dll node_modules\iohook\builds\electron-v87-win32-x64\build\Release /y

:: copy MuseWinNAB binaries (assumed to be compiled) into the resources dir.
copy ..\MuseWinNAB\MuseWinNAB\bin\Release\netcoreapp3.1\win-x64 resources\win32\bin /y

:: build
node node_modules\react-scripts\bin\react-scripts.js build