#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <sys/ioctl.h>

int main() {
    int console_fd;
    int frequency = 440;
    int duration = 1000;
    
    // Try to open /dev/tty0 (requires root)
    console_fd = open("/dev/tty0", O_WRONLY);
    if (console_fd < 0) {
        perror("Failed to open /dev/tty0 (try running with sudo)");
        return 1;
    }
    
    printf("Opened /dev/tty0\n");
    
    // Calculate clock divisor for the frequency
    // PC speaker clock is 1193180 Hz
    int period = 1193180 / frequency;
    
    printf("Playing %d Hz tone for %d ms...\n", frequency, duration);
    
    // Start the tone
    if (ioctl(console_fd, KIOCSOUND, period) < 0) {
        perror("ioctl KIOCSOUND failed");
        close(console_fd);
        return 1;
    }
    
    // Wait for the duration
    usleep(duration * 1000);
    
    // Stop the sound (0 = silence)
    if (ioctl(console_fd, KIOCSOUND, 0) < 0) {
        perror("ioctl KIOCSOUND stop failed");
    }
    
    close(console_fd);
    printf("Done!\n");
    
    return 0;
}
