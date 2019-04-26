@echo off

setlocal EnableDelayedExpansion

set filepath=%~dp0
set filename=tsconfig.json

set file=!%filepath%%filename%!

tsc -p "%~d0%file%"
