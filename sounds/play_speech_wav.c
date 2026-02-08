#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <sys/ioctl.h>
#include <stdint.h>
#include <string.h>
#include <math.h>

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

void play_tone(int freq, int duration_ms) {
    if (freq > 20 && freq < 8000) {
        int period = 1193180 / freq;
        ioctl(console_fd, KIOCSOUND, period);
    } else {
        ioctl(console_fd, KIOCSOUND, 0);
    }
    if (duration_ms > 0) {
        usleep(duration_ms * 1000);
    }
}

// Detect pitch using zero-crossing method (simple but effective)
int detect_pitch_zero_crossing(int16_t *samples, int num_samples, int sample_rate) {
    int zero_crossings = 0;
    
    for (int i = 1; i < num_samples; i++) {
        if ((samples[i-1] >= 0 && samples[i] < 0) || 
            (samples[i-1] < 0 && samples[i] >= 0)) {
            zero_crossings++;
        }
    }
    
    if (zero_crossings < 2) return 0;  // Too few crossings - silence
    
    // Frequency = (crossings / 2) / duration
    double duration = (double)num_samples / sample_rate;
    int freq = (int)((zero_crossings / 2.0) / duration);
    
    // Filter out unrealistic frequencies
    if (freq < 60 || freq > 500) return 0;
    
    return freq;
}

// Calculate energy/amplitude of a frame
int calculate_energy(int16_t *samples, int num_samples) {
    long long sum = 0;
    for (int i = 0; i < num_samples; i++) {
        sum += abs(samples[i]);
    }
    return sum / num_samples;
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <speech.wav>\n", argv[0]);
        fprintf(stderr, "\nGenerate a WAV file first with espeak-ng:\n");
        fprintf(stderr, "  espeak-ng -w speech.wav \"hello world\"\n");
        fprintf(stderr, "Then play it:\n");
        fprintf(stderr, "  sudo %s speech.wav\n", argv[0]);
        return 1;
    }

    FILE *wav_file = fopen(argv[1], "rb");
    if (!wav_file) {
        perror("Failed to open WAV file");
        return 1;
    }

    WavHeader header;
    fread(&header, sizeof(WavHeader), 1, wav_file);

    if (strncmp(header.riff, "RIFF", 4) != 0 || strncmp(header.wave, "WAVE", 4) != 0) {
        fprintf(stderr, "Not a valid WAV file\n");
        fclose(wav_file);
        return 1;
    }

    printf("Sample rate: %u Hz\n", header.sample_rate);
    printf("Channels: %u\n", header.num_channels);
    printf("Bits per sample: %u\n", header.bits_per_sample);

    if (header.bits_per_sample != 16) {
        fprintf(stderr, "Warning: Expected 16-bit audio, got %d-bit\n", header.bits_per_sample);
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

    console_fd = open("/dev/tty0", O_WRONLY);
    if (console_fd < 0) {
        perror("Failed to open /dev/tty0 (try running with sudo)");
        fclose(wav_file);
        return 1;
    }

    printf("Playing pitch contour through PC speaker...\n");

    // Frame size: 10ms windows for pitch detection
    int frame_size = (header.sample_rate * 10) / 1000;
    int16_t *frame = malloc(frame_size * sizeof(int16_t) * header.num_channels);
    
    int frames_played = 0;
    int voiced_frames = 0;
    
    while (1) {
        size_t samples_read = fread(frame, sizeof(int16_t) * header.num_channels, 
                                    frame_size, wav_file);
        if (samples_read == 0) break;
        
        // Convert to mono if stereo
        int16_t *mono_frame = malloc(samples_read * sizeof(int16_t));
        if (header.num_channels == 2) {
            for (size_t i = 0; i < samples_read; i++) {
                mono_frame[i] = (frame[i*2] + frame[i*2+1]) / 2;
            }
        } else {
            memcpy(mono_frame, frame, samples_read * sizeof(int16_t));
        }
        
        // Calculate energy to detect voiced segments
        int energy = calculate_energy(mono_frame, samples_read);
        
        // Detect pitch
        int pitch = 0;
        if (energy > 200) {  // Energy threshold for voiced speech
            pitch = detect_pitch_zero_crossing(mono_frame, samples_read, header.sample_rate);
            if (pitch > 0) {
                voiced_frames++;
            }
        }
        
        // Play the detected pitch
        if (pitch > 0) {
            play_tone(pitch, 10);
        } else {
            play_tone(0, 10);  // Silence for unvoiced/quiet parts
        }
        
        free(mono_frame);
        frames_played++;
        
        if (frames_played % 100 == 0) {
            printf(".");
            fflush(stdout);
        }
    }

    play_tone(0, 0);  // Stop sound
    
    printf("\n\nPlayback complete!\n");
    printf("Frames: %d, Voiced: %d (%.1f%%)\n", 
           frames_played, voiced_frames, 
           100.0 * voiced_frames / frames_played);

    free(frame);
    close(console_fd);
    fclose(wav_file);

    return 0;
}
