#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/io.h>

#define SPEAKER_PORT 0x61
#define COMMAND_PORT 0x43
#define DATA_PORT 0x40

void play_sound(int frequency) {
    int divisor = 1193180 / frequency; // Calculate divisor for the desired frequency

    // Send command to set the frequency
    outb(0xB6, COMMAND_PORT); // Command to set the frequency
    outb(divisor & 0xFF, DATA_PORT); // Send low byte
    outb(divisor >> 8, DATA_PORT); // Send high byte

    // Turn on the speaker
    unsigned char tmp = inb(SPEAKER_PORT);
    outb(tmp | 3, SPEAKER_PORT); // Enable speaker
}

void stop_sound() {
    unsigned char tmp = inb(SPEAKER_PORT);
    outb(tmp & 0xFC, SPEAKER_PORT); // Turn off the speaker
}

int main() {
    // Enable I/O port access (requires root privileges)
    if (ioperm(0x61, 1, 1) || ioperm(0x43, 1, 1) || ioperm(0x40, 1, 1)) {
        perror("ioperm failed");
        return 1;
    }

    // Play a sound at 440 Hz (A4)
    play_sound(440);
    
    // Let the hardware generate the tone for 1 second
    usleep(1000000);

    stop_sound();

    // Disable I/O port access
    ioperm(0x61, 1, 0);
    ioperm(0x43, 1, 0);
    ioperm(0x40, 1, 0);

    return 0;
}
