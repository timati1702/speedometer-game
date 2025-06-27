export class AudioPanel {
    constructor() {
        this.audioPlayer = new Audio();
        this.currentTrackIndex = 0;
        this.trackList = [];
        this.initelements();
        this.bindEvents();
    }

    initelements() {
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.volumeBar = document.getElementById('volume-bar');
        this.progressBar = document.getElementById('progress-bar');
        this.nowPlaying = document.getElementById('now-playing');
        this.currentTimeDisplay = document.getElementById('current-time');
        this.durationDisplay = document.getElementById('duration');
        this.tracks = document.querySelectorAll('.track');
    }

    bindEvents() {
        this.tracks.forEach((track, index) => {
            track.addEventListener('click', () => this.playTrack(index));
        });

        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevTrack());
        this.nextBtn.addEventListener('click', () => this.playNextTrack());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.volumeBar.addEventListener('input', () => this.updateVolume());
        this.progressBar.addEventListener('input', () => this.seekAudio());

        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.playNextTrack());
    }

    setTracks() {
        this.trackList = Array.from(this.tracks).map((track, index) => ({
            name: track.textContent,
            src: track.dataset.src,
            index: index
        }));
    }

    playTrack(index) {
        if (index >= 0 && index < this.trackList.length) {
            this.currentTrackIndex = index;
            this.audioPlayer.src = this.trackList[index].src;
            this.audioPlayer.play()
                .then(() => {
                    this.nowPlaying.textContent = this.trackList[index].name;
                    this.playBtn.textContent = '⏸';

                    this.tracks.forEach(t => t.classList.remove('playing'));
                    this.tracks[index].classList.add('playing');
                })
                .catch(error => {
                    console.error("Ошибка воспроизведения:", error);
                });
        }
    }

    togglePlay() {
        if (this.audioPlayer.paused) {
            this.audioPlayer.play()
                .then(() => {
                    this.playBtn.textContent = '⏸';
                });
        } else {
            this.audioPlayer.pause();
            this.playBtn.textContent = '▶';
        }
        this.playClickSound();
    }

    playNextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.trackList.length;
        this.playTrack(nextIndex);
        this.playClickSound();
    }

    playPrevTrack() {
        const prevIndex = (this.currentTrackIndex - 1 + this.trackList.length) % this.trackList.length;
        this.playTrack(prevIndex);
        this.playClickSound();
    }

    toggleMute() {
        this.audioPlayer.muted = !this.audioPlayer.muted;
        this.muteBtn.textContent = this.audioPlayer.muted ? '🔇' : '🔊';
        this.playClickSound();
    }

    updateVolume() {
        this.audioPlayer.volume = this.volumeBar.value;
        this.muteBtn.textContent = this.audioPlayer.volume > 0 ? '🔊' : '🔇';
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressBar.value = percent;
            this.currentTimeDisplay.textContent = this.formatTime(this.audioPlayer.currentTime);
            this.durationDisplay.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    seekAudio() {
        const seekTime = (this.progressBar.value / 100) * this.audioPlayer.duration;
        this.audioPlayer.currentTime = seekTime;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    playClickSound() {
        const sound = new Audio('resources/audio/sounds/click-sound.mp3');
        sound.volume = 0.2;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }
}