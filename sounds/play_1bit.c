#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <sys/ioctl.h>
#include <stdint.h>
#include <string.h>

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

int console_fd;
int speaker_period = 1193180 / 10000; // 10kHz carrier

void speaker_on() {
    ioctl(console_fd, KIOCSOUND, speaker_period);
}

void speaker_off() {
    ioctl(console_fd, KIOCSOUND, 0);
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <speech.wav>\n", argv[0]);
        fprintf(stderr, "\nGenerate with espeak-ng:\n");
        fprintf(stderr, "  espeak-ng -s 120 -w speech.wav \"your text here\"\n");
        fprintf(stderr, "  (slower speed -s 120 may improve clarity)\n");
        return 1;
    }

    FILE *wav_file = fopen(argv[1], "rb");
    if (!wav_file) {
        perror("Failed to open WAV file");
        return 1;
    }

    WavHeader header;
    fread(&header, sizeof(WavHeader), 1, wav_file);

    if (strncmp(header.riff, "RIFF", 4) != 0) {
        fprintf(stderr, "Not a valid WAV file\n");
        fclose(wav_file);
        return 1;
    }

    printf("Playing using 1-bit delta-sigma modulation...\n");
    printf("Sample rate: %u Hz\n", header.sample_rate);

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

    console_fd = open("/dev/tty0", O_WRONLY);
    if (console_fd < 0) {
        perror("Failed to open /dev/tty0");
        fclose(wav_file);
        return 1;
    }

    // Delta-sigma modulation state
    int integrator = 0;
    int sample_period_us = 1000000 / header.sample_rate;
    
    // Read samples
    int16_t sample;
    int samples_played = 0;
    int bytes_per_sample = header.bits_per_sample / 8;
    int bytes_to_read = bytes_per_sample * header.num_channels;
    
    uint8_t buffer[4];
    
    while (fread(buffer, 1, bytes_to_read, wav_file) == bytes_to_read) {
        // Convert to 16-bit mono
        if (header.bits_per_sample == 16) {
            sample = *(int16_t*)buffer;
            if (header.num_channels == 2) {
                sample = (sample + *(int16_t*)(buffer + 2)) / 2;
            }
        } else if (header.bits_per_sample == 8) {
            sample = ((int)buffer[0] - 128) * 256;
            if (header.num_channels == 2) {
                sample = (sample + ((int)buffer[1] - 128) * 256) / 2;
            }
        } else {
            continue;
        }
        
        // Delta-sigma: accumulate error and output 1-bit
        integrator += sample;
        
        if (integrator > 0) {
            speaker_on();
            integrator -= 32767;  // Feedback
        } else {
            speaker_off();
            integrator += 32767;
        }
        
        usleep(sample_period_us);
        
        samples_played++;
        if (samples_played % header.sample_rate == 0) {
            printf(".");
            fflush(stdout);
        }
    }

    speaker_off();
    
    printf("\nDone! Played %d samples\n", samples_played);
    
    close(console_fd);
    fclose(wav_file);
    
    return 0;
}
