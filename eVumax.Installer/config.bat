@echo off
cls

set day=%date:~0,2%
set month=%date:~3,2%
set year=%date:~10,4%

set today=%year%%month%%day%

echo Today day = %day%
echo Today month = %month%
echo Today year = %year%
echo.

echo Today date =%today%