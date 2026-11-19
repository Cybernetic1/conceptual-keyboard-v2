import sys
import subprocess

# Find Conkey window: xdotool search --name "iCant"
"""
winID_self = int(subprocess.run(
	['xdotool', 'search', '--name', 'iCant'],
	capture_output = True,
	text=True,
	check=True
	).stdout)
print("Conkey window =", winID_self)
"""

# Get list of windows in stack order
# "xprop -root _NET_CLIENT_LIST_STACKING" to return a list of windows stacking order
# Output format: "_NET_CLIENT_LIST_STACKING(WINDOW): window id # 0xe00006..."
#                 1234567890123456789012345678901234567890123456
stackorder = list(map(lambda x: int(x,16), subprocess.run(
	['xprop', '-root', '_NET_CLIENT_LIST_STACKING'],
	capture_output = True,
	text=True,
	check=True
	).stdout[46:-1].split(',')))
stackorder.reverse()
print("stackorder =", stackorder)

# Get list of windows that are Firefox
firefoxes = list(map(int, subprocess.run(
	['xdotool', 'search', '--name', 'firefox'],
	capture_output = True,
	text=True,
	check=True
	).stdout[:-1].split('\n')))
print("Firefoxes =", firefoxes)

# Find the first Firefox window, assume it is under Conkey
winID_target = None
for winID in stackorder:
	# print(winID)
	if winID in firefoxes:
		print("found:", winID)
		winID_target = winID
		break
	# if winID == winID_self:
		# found = True

subprocess.run(['beep'])

# Press Return key
# xdotool key --window "$winID_target" Return
if winID_target:
	subprocess.run(
		['xdotool', 'key', '--window', str(winID_target), 'Return'],
		capture_output = True,
		text=True,
		check=True
		)
