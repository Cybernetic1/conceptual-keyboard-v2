import subprocess

# Find Conkey window: xdotool search --name "iCant"
winID_self = int(subprocess.run(
	['xdotool', 'search', '--name', 'iCant'],
	capture_output = True,
	text=True,
	check=True
	).stdout)
print("Conkey window =", winID_self)

# Make window transparent
# xprop -f _NET_WM_WINDOW_OPACITY 32c -set _NET_WM_WINDOW_OPACITY `printf 0x%x $((0xFFFFFFFF * 80 / 100))`
color = '0xcccccccc'
subprocess.run(
	['xprop', '-id', str(winID_self), '-f', '_NET_WM_WINDOW_OPACITY', '32c', '-set', '_NET_WM_WINDOW_OPACITY', color]
	)

# subprocess.run(['beep'])
