# **** This is an old script, replaced by the Python version: hit-enter.py
# "xprop -root _NET_CLIENT_LIST_STACKING" to return a list of windows stacking order
# Find the window that is under Conkey: xdotool search --name "iCant"
# xdotool key --window "$WIN_ID" Return
stackorder=$(xprop -root _NET_CLIENT_LIST_STACKING)
winID_self=$(xdotool search --name "iCant")
winID_target=$(python3 - "$stackorder" "$winID_self" << 'EOF'
import sys
selfID = int(sys.argv[2])
print("self =", selfID)
order = sys.argv[1].split(',')
order.reverse()
found = False
for str in order:
    if str[0] == ' ':
        winID = int(str,16)
        print(winID, end=',')
    if found:
        # print("*", winID, "*", end=',')
        # break
        print("***")
    if winID == selfID:
        found = True
print("success")
EOF
)
beep
echo "target winID = $winID_target"
xdotool key --window "$winID_target" Return
