#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <sys/ioctl.h>
#include <math.h>

int console_fd;

void play_tone(int freq, int duration_ms) {
    if (freq > 0) {
        int period = 1193180 / freq;
        ioctl(console_fd, KIOCSOUND, period);
    } else {
        ioctl(console_fd, KIOCSOUND, 0);
    }
    usleep(duration_ms * 1000);
}

void silence(int duration_ms) {
    play_tone(0, duration_ms);
}

// Sweep from freq1 to freq2
void sweep(int freq1, int freq2, int duration_ms, int steps) {
    for (int i = 0; i < steps; i++) {
        int freq = freq1 + (freq2 - freq1) * i / steps;
        play_tone(freq, duration_ms / steps);
    }
}

// Play a chord by rapidly alternating frequencies
void chord(int freq1, int freq2, int freq3, int duration_ms) {
    int cycles = duration_ms / 30;  // 30ms per cycle
    for (int i = 0; i < cycles; i++) {
        play_tone(freq1, 10);
        play_tone(freq2, 10);
        play_tone(freq3, 10);
    }
}

// Musical notes (in Hz)
#define C4  262
#define D4  294
#define E4  330
#define F4  349
#define G4  392
#define A4  440
#define B4  494
#define C5  523
#define D5  587
#define E5  659
#define F5  698
#define G5  784

void demo_melody() {
    printf("Playing melody...\n");
    int notes[] = {C4, E4, G4, C5, G4, E4, C4};
    int durations[] = {200, 200, 200, 400, 200, 200, 400};
    
    for (int i = 0; i < 7; i++) {
        play_tone(notes[i], durations[i]);
        silence(50);
    }
}

void demo_siren() {
    printf("Siren effect...\n");
    for (int i = 0; i < 5; i++) {
        sweep(400, 800, 300, 30);
        sweep(800, 400, 300, 30);
    }
}

void demo_laser() {
    printf("Laser sound...\n");
    sweep(1800, 200, 400, 100);
    silence(200);
}

void demo_explosion() {
    printf("Explosion...\n");
    // Rapid descent with noise-like effect
    for (int i = 0; i < 50; i++) {
        play_tone(2000 - i * 35, 10);
    }
    // Low rumble
    for (int i = 0; i < 20; i++) {
        play_tone(80 + (i % 5) * 10, 20);
    }
}

void demo_coin() {
    printf("Coin pickup...\n");
    play_tone(988, 50);
    play_tone(1319, 100);
}

void demo_powerup() {
    printf("Power up...\n");
    for (int i = 200; i <= 2000; i += 50) {
        play_tone(i, 20);
    }
}

void demo_alarm() {
    printf("Alarm...\n");
    for (int i = 0; i < 6; i++) {
        play_tone(1000, 100);
        play_tone(800, 100);
    }
}

void demo_dtmf() {
    printf("DTMF tones (phone keypad)...\n");
    // Simulate pressing '1-2-3'
    chord(697, 1209, 0, 150); silence(50);  // 1
    chord(697, 1336, 0, 150); silence(50);  // 2
    chord(697, 1477, 0, 150); silence(50);  // 3
}

void demo_arpeggio() {
    printf("C major arpeggio...\n");
    int notes[] = {C4, E4, G4, C5, G4, E4, C4};
    for (int i = 0; i < 7; i++) {
        play_tone(notes[i], 100);
    }
}

void demo_phaser() {
    printf("Phaser effect...\n");
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 50; j++) {
            int freq = 400 + (int)(150 * sin(j * 0.3));
            play_tone(freq, 15);
        }
    }
}

int main() {
    console_fd = open("/dev/tty0", O_WRONLY);
    if (console_fd < 0) {
        perror("Failed to open /dev/tty0 (try running with sudo)");
        return 1;
    }

    printf("=== PC Speaker Sound Effects Demo ===\n\n");

    demo_melody();
    silence(500);
    
    demo_siren();
    silence(500);
    
    demo_laser();
    silence(500);
    
    demo_explosion();
    silence(500);
    
    demo_coin();
    silence(500);
    
    demo_powerup();
    silence(500);
    
    demo_alarm();
    silence(500);
    
    demo_dtmf();
    silence(500);
    
    demo_arpeggio();
    silence(500);
    
    demo_phaser();
    silence(500);

    // Silence at the end
    ioctl(console_fd, KIOCSOUND, 0);
    close(console_fd);
    
    printf("\nDemo complete!\n");
    return 0;
}
