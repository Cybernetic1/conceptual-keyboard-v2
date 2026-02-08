#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <linux/kd.h>
#include <sys/ioctl.h>
#include <string.h>
#include <ctype.h>

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

// Simulate formant by alternating between two frequencies
void play_formant(int f1, int f2, int duration_ms) {
    int cycles = duration_ms / 20;  // 20ms per cycle
    for (int i = 0; i < cycles; i++) {
        play_tone(f1, 10);
        play_tone(f2, 10);
    }
}

// Three formant synthesis (more natural)
void play_formant3(int f1, int f2, int f3, int duration_ms) {
    int cycles = duration_ms / 30;
    for (int i = 0; i < cycles; i++) {
        play_tone(f1, 10);
        play_tone(f2, 10);
        play_tone(f3, 10);
    }
}

// Vowel formants (F1, F2, F3 in Hz) - Male voice
typedef struct {
    char vowel;
    int f1, f2, f3;
} Formants;

Formants vowels[] = {
    {'A', 730, 1090, 2440},  // "ah" as in "father"
    {'E', 530, 1840, 2480},  // "eh" as in "bed"
    {'I', 390, 1990, 2550},  // "ee" as in "beet"
    {'O', 570, 840, 2410},   // "oh" as in "boat"
    {'U', 440, 1020, 2240},  // "oo" as in "boot"
};

void play_vowel(char v, int duration) {
    v = toupper(v);
    Formants *f = NULL;
    
    for (int i = 0; i < 5; i++) {
        if (vowels[i].vowel == v) {
            f = &vowels[i];
            break;
        }
    }
    
    if (f) {
        play_formant3(f->f1, f->f2, f->f3, duration);
    }
}

// Consonant sounds
void play_consonant(char c, int duration) {
    c = toupper(c);
    
    switch(c) {
        case 'S':
        case 'Z':
            // Hissing sound - high frequency noise
            for (int i = 0; i < duration/10; i++) {
                play_tone(4000 + (i % 100) * 20, 10);
            }
            break;
            
        case 'F':
        case 'V':
            // Friction - mid-high frequency
            for (int i = 0; i < duration/10; i++) {
                play_tone(3000 + (i % 80) * 15, 10);
            }
            break;
            
        case 'M':
        case 'N':
            // Nasal - low resonance
            play_formant(250, 2000, duration);
            break;
            
        case 'L':
        case 'R':
            // Liquid - formant-like
            play_formant(500, 1500, duration);
            break;
            
        case 'W':
            // Glide from U to next vowel
            play_formant(440, 1020, duration);
            break;
            
        case 'Y':
            // Glide from I
            play_formant(390, 1990, duration);
            break;
            
        case 'H':
            // Breathy - soft noise
            for (int i = 0; i < duration/15; i++) {
                play_tone(800 + (i % 50) * 30, 15);
            }
            break;
            
        case 'P':
        case 'B':
            // Stop - silence then pop
            play_tone(0, duration/2);
            play_tone(200, duration/2);
            break;
            
        case 'T':
        case 'D':
            // Alveolar stop
            play_tone(0, duration/3);
            play_tone(2500, duration/3);
            play_tone(0, duration/3);
            break;
            
        case 'K':
        case 'G':
            // Velar stop
            play_tone(0, duration/3);
            play_tone(2000, duration/3);
            play_tone(0, duration/3);
            break;
            
        default:
            play_tone(0, duration/2);  // Short silence for unknown
            break;
    }
}

// Simple phoneme synthesizer
void speak_phonemes(const char *phonemes) {
    int vowel_duration = 150;
    int consonant_duration = 80;
    
    for (int i = 0; phonemes[i]; i++) {
        char c = toupper(phonemes[i]);
        
        if (c == ' ') {
            play_tone(0, 100);  // Pause between words
        } else if (c == 'A' || c == 'E' || c == 'I' || c == 'O' || c == 'U') {
            play_vowel(c, vowel_duration);
        } else if (isalpha(c)) {
            play_consonant(c, consonant_duration);
        }
    }
}

// Pre-defined words with phoneme approximations
void say_hello() {
    printf("Saying: HELLO\n");
    speak_phonemes("HELOO");
}

void say_robot() {
    printf("Saying: ROBOT\n");
    speak_phonemes("ROBAT");
}

void say_computer() {
    printf("Saying: COMPUTER\n");
    speak_phonemes("KAMPYUUTAR");
}

void say_error() {
    printf("Saying: ERROR\n");
    speak_phonemes("EROR");
}

void say_warning() {
    printf("Saying: WARNING\n");
    speak_phonemes("WAORNING");
}

void say_ready() {
    printf("Saying: READY\n");
    speak_phonemes("REDI");
}

void say_yes() {
    printf("Saying: YES\n");
    speak_phonemes("YES");
}

void say_no() {
    printf("Saying: NO\n");
    speak_phonemes("NOO");
}

void say_danger() {
    printf("Saying: DANGER\n");
    speak_phonemes("DAYNJOR");
}

void say_ok() {
    printf("Saying: OK\n");
    speak_phonemes("OKEI");
}

int main(int argc, char *argv[]) {
    console_fd = open("/dev/tty0", O_WRONLY);
    if (console_fd < 0) {
        perror("Failed to open /dev/tty0 (try running with sudo)");
        return 1;
    }

    printf("=== PC Speaker Speech Synthesis ===\n\n");

    if (argc > 1) {
        // Custom phoneme string
        printf("Speaking custom phonemes: %s\n", argv[1]);
        speak_phonemes(argv[1]);
    } else {
        // Demo words
        say_hello();
        play_tone(0, 500);
        
        say_robot();
        play_tone(0, 500);
        
        say_ready();
        play_tone(0, 500);
        
        say_yes();
        play_tone(0, 300);
        
        say_no();
        play_tone(0, 500);
        
        say_warning();
        play_tone(0, 500);
        
        say_error();
        play_tone(0, 500);
        
        say_ok();
        play_tone(0, 500);
        
        say_computer();
        play_tone(0, 500);
        
        say_danger();
        play_tone(0, 500);
    }

    ioctl(console_fd, KIOCSOUND, 0);
    close(console_fd);
    
    printf("\nSpeech synthesis complete!\n");
    printf("\nTip: Try custom phonemes like:\n");
    printf("  sudo ./pc_speaker_speech \"HELOO WAORLD\"\n");
    
    return 0;
}
