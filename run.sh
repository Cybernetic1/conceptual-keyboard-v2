#!/bin/sh
cd /home/yky/misc-programs/conceptual-keyboard-v2
# kill any previous Java Conkey processes:
while read p; do
	kill $p
done < conkey_PID.txt
##### backup conkey database
# cp database_default.txt database_default.bak
##### close terminal window
# wmctrl -r :ACTIVE: -b add,hidden
sleep 0.5
##### run conkey server
truncate -s0 server-log.txt
node SSE-server.js > server-log.txt &
# mplayer --quiet chrome-extension/ip203_alert.ogg
##### remember process ID, so as to delete it later
Conkey_PID=$!
echo $Conkey_PID > conkey_PID.txt
sleep 1.5
##### start chrome browser;
# if chromium-browser --version >/dev/null; then
chromium-browser --app=http://localhost:8484/Cantonese-input.html &
# **** must put '&' at the end of command if script continues
# else
# google-chrome --new-window http://localhost:8484/index.html
# vivaldi --app=http://localhost:8484/index.html
# browser --app=http://localhost:8484/Cantonese-input.html
# fi
##### problem is the sleep time is often not enough esp during 1st start
##### set size and flags of Conkey broswer window
# wmctrl -r "iCant" -b remove,maximized_horz,maximized_vert
# wmctrl -r "iCant" -e 1,500,200,620,450
# wmctrl -r "iCant" -b add,above
# These are now moved to "web/Conkey_database.js :set_wmctrl()"
