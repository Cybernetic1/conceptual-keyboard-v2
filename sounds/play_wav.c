#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <sys/ioctl.h>
#include <stdint.h>
#include <string.h>

#define PWM_FREQ 8000  // PWM carrier frequency

typedef struct {
    char riff[4];
    uint32_t file_size;
    char wave[4];
    char fmt[4];
    uint32_t fmt_size;
    uint16_t audio_format;
    uint16_t num_channels;
    uint32_t sample_rate;
    uint32_t byte_rate;
    uint16_t block_align;
    uint16_t bits_per_sample;
} WavHeader;

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <8-bit-mono.wav>\n", argv[0]);
        return 1;
    }

    FILE *wav_file = fopen(argv[1], "rb");
    if (!wav_file) {
        perror("Failed to open WAV file");
        return 1;
    }

    // Read WAV header
    WavHeader header;
    fread(&header, sizeof(WavHeader), 1, wav_file);

    // Verify it's a valid WAV file
    if (strncmp(header.riff, "RIFF", 4) != 0 || strncmp(header.wave, "WAVE", 4) != 0) {
        fprintf(stderr, "Not a valid WAV file\n");
        fclose(wav_file);
        return 1;
    }

    printf("Sample rate: %u Hz\n", header.sample_rate);
    printf("Channels: %u\n", header.num_channels);
    printf("Bits per sample: %u\n", header.bits_per_sample);

    if (header.num_channels != 1) {
        fprintf(stderr, "Error: Only mono WAV files are supported\n");
        fclose(wav_file);
        return 1;
    }

    if (header.bits_per_sample != 8) {
        fprintf(stderr, "Error: Only 8-bit WAV files are supported\n");
        fclose(wav_file);
        return 1;
    }

    // Skip to data chunk
    char chunk_id[4];
    uint32_t chunk_size;
    while (fread(chunk_id, 4, 1, wav_file) == 1) {
        fread(&chunk_size, 4, 1, wav_file);
        if (strncmp(chunk_id, "data", 4) == 0) {
            break;
        }
        fseek(wav_file, chunk_size, SEEK_CUR);
    }

    // Open console device
    int console_fd = open("/dev/tty0", O_WRONLY);
    if (console_fd < 0) {
        perror("Failed to open /dev/tty0 (try running with sudo)");
        fclose(wav_file);
        return 1;
    }

    printf("Playing WAV file through PC speaker using PWM...\n");

    // PWM parameters
    int period = 1193180 / PWM_FREQ;  // PC speaker period for PWM frequency
    int sample_duration = 1000000 / header.sample_rate;  // microseconds per sample
    int pwm_cycles = (header.sample_rate > PWM_FREQ) ? 1 : (PWM_FREQ / header.sample_rate);
    int pwm_period_us = 1000000 / PWM_FREQ;

    // Read and play samples
    uint8_t sample;
    int samples_played = 0;
    while (fread(&sample, 1, 1, wav_file) == 1) {
        // Calculate duty cycle (0-255 maps to 0-100% duty cycle)
        // Center around 128 for unsigned 8-bit audio
        int duty = sample;
        
        // Use PWM: turn on for duty% of each PWM cycle
        for (int cycle = 0; cycle < pwm_cycles; cycle++) {
            int on_time = (pwm_period_us * duty) / 255;
            int off_time = pwm_period_us - on_time;
            
            if (on_time > 5) {
                ioctl(console_fd, KIOCSOUND, period);
                usleep(on_time);
            }
            
            if (off_time > 5) {
                ioctl(console_fd, KIOCSOUND, 0);
                usleep(off_time);
            }
        }
        
        samples_played++;

        // Print progress
        if (samples_played % (header.sample_rate) == 0) {
            printf(".");
            fflush(stdout);
        }
    }

    // Stop sound
    ioctl(console_fd, KIOCSOUND, 0);

    printf("\nDone! Played %d samples\n", samples_played);

    close(console_fd);
    fclose(wav_file);

    return 0;
}
