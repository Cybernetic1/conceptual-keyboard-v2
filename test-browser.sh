#!/bin/sh
check=`ps -e | grep "chrome" | grep -v grep`
if [ $? -eq 0 ]
then
echo "Chromium-browser is here"
else
echo "Chromium-browser is not here"
fi
