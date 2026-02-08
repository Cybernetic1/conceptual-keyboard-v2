#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/soundcard.h>

#define SAMPLE_RATE 8000  // Sample rate for PC speaker

void play_sound(const char *filename) {
    FILE *file = fopen(filename, "rb");
    if (!file) {
        perror("Could not open file");
        return;
    }

    // Read the WAV header
    char header[44];
    fread(header, sizeof(char), 44, file);

    // Extract data size
    uint32_t dataSize = *(uint32_t *)&header[40];

    // Allocate buffer for audio data
    uint8_t *buffer = (uint8_t *)malloc(dataSize);
    fread(buffer, sizeof(uint8_t), dataSize, file);
    fclose(file);

    // Open the PC speaker
    int fd = open("/dev/console", O_WRONLY);
    if (fd < 0) {
        perror("Cannot open /dev/console");
        free(buffer);
        return;
    }

    // Set the speaker frequency (if needed)
    // This part is not necessary for simple playback through /dev/console

    // Play the audio data
    for (uint32_t i = 0; i < dataSize; i++) {
        // Send the audio data to the speaker
        // Convert to a format that the PC speaker can handle
        // Note: You may need to scale or adjust the values based on your audio data
        int sound = (buffer[i] > 128) ? 1 : 0; // Simple thresholding for sound
        write(fd, &sound, sizeof(sound));
        usleep(125); // Adjust delay for sample rate
    }

    // Clean up
    close(fd);
    free(buffer);
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <wav_file>\n", argv[0]);
        return 1;
    }

    play_sound(argv[1]);
    return 0;
}
