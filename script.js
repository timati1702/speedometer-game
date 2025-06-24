document.addEventListener('DOMContentLoaded', function() {
    const speedValue = document.querySelector('.speedometer .value');
    const speedNeedle = document.querySelector('.speedometer .needle');
    const rpmValue = document.querySelector('.tachometer .value');
    const rpmNeedle = document.querySelector('.tachometer .needle');
    
    const gearLabels = document.querySelectorAll('.display .label');
    const currentGearDisplay = document.querySelector('.current-gear');
    
    const audioPlayer = new Audio();
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeBar = document.getElementById('volume-bar');
    const progressBar = document.getElementById('progress-bar');
    const nowPlaying = document.getElementById('now-playing');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const tracks = document.querySelectorAll('.track');
    
    let currentGear = 'N';
    let speed = 0;
    let rpm = 0;
    let isAccelerating = false;
    let isBraking = false;
    let accelerationRate = 0;
    let decelerationRate = 0.2;
    let engineInterval;
    let currentTrackIndex = 0;
    
    function initPlayer() {
        tracks.forEach((track, index) => {
            track.addEventListener('click', () => playTrack(index));
        });
        
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', playPrevTrack);
        nextBtn.addEventListener('click', playNextTrack);
        muteBtn.addEventListener('click', toggleMute);
        volumeBar.addEventListener('input', updateVolume);
        progressBar.addEventListener('input', seekAudio);
        
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', playNextTrack);
    }

    function initGearbox() {
        gearLabels.forEach(label => {
            label.addEventListener('click', () => {
                changeGear(label.textContent);
            });
        });
        
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }
    
    function changeGear(gear) {
        currentGear = gear;
        currentGearDisplay.textContent = gear;
        
        gearLabels.forEach(label => {
            label.classList.toggle('active', label.textContent === gear);
        });
        
        playGearSound();
        playEngineSound();
    }
    
    function handleKeyDown(e) {
        if (currentGear === 'D' || currentGear === 'R') {
            if (e.key === 'ArrowUp') {
                isAccelerating = true;
                isBraking = false;
            } else if (e.key === 'ArrowDown') {
                isBraking = true;
                isAccelerating = false;
            }
        }
    }
    
    function handleKeyUp(e) {
        if (e.key === 'ArrowUp') isAccelerating = false;
        if (e.key === 'ArrowDown') isBraking = false;
    }
    
    function startEngineLoop() {
        clearInterval(engineInterval);
        
        engineInterval = setInterval(() => {
            if (currentGear === 'D' || currentGear === 'R') {
                if (isAccelerating) {
                    speed = Math.min(speed + accelerationRate, currentGear === 'D' ? 240 : 60);
                } else if (isBraking) {
                    speed = Math.max(speed - decelerationRate * 2, 0);
                } else {
                    speed = Math.max(speed - decelerationRate, 0);
                }
            }
            
            rpm = 0.5 + Math.random() * 0.5; 
            updateSpeedometer(speed);
            updateTachometer(rpm);
            
        }, 100);
    }
    
    function updateSpeedometer(value) {
        const angle = (value / 240) * 180 - 90;
        speedNeedle.style.transform = `rotate(${angle}deg)`;
        speedValue.textContent = Math.round(value);
    }
    
    function updateTachometer(value) {
        const angle = (value / 8) * 180 - 90;
        rpmNeedle.style.transform = `rotate(${angle}deg)`;
        rpmValue.textContent = value.toFixed(1);
    }
    

    function playTrack(index) {
        if (index >= 0 && index < trackList.length) {
            currentTrackIndex = index;
            audioPlayer.src = trackList[index].src;
            audioPlayer.play()
                .then(() => {
                    nowPlaying.textContent = trackList[index].name;
                    playBtn.textContent = '⏸';

                    tracks.forEach(t => t.classList.remove('playing'));
                    tracks[index].classList.add('playing');
                })
                .catch(error => {
                    console.error("Ошибка воспроизведения:", error);
                });
        }
    }

    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play()
                .then(() => {
                    playBtn.textContent = '⏸';
                });
        } else {
            audioPlayer.pause();
            playBtn.textContent = '▶';
        }
        playClickSound();
    }

    function playNextTrack() {
        const nextIndex = (currentTrackIndex + 1) % trackList.length;
        playTrack(nextIndex);
        playClickSound();
    }

    function playPrevTrack() {
        const prevIndex = (currentTrackIndex - 1 + trackList.length) % trackList.length;
        playTrack(prevIndex);
        playClickSound();
    }

    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        muteBtn.textContent = audioPlayer.muted ? '🔇' : '🔊';
        playClickSound();
    }

    function updateVolume() {
        audioPlayer.volume = volumeBar.value;
        muteBtn.textContent = audioPlayer.volume > 0 ? '🔊' : '🔇';
    }

    function updateProgress() {
        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = percent;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        }
    }

    function seekAudio() {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function playGearSound() {
        const sound = new Audio('resources/sounds/gear-sound.mp3');
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playClickSound() {
        const sound = new Audio('resources/sounds/click-sound.mp3');
        sound.volume = 0.2;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playEngineSound() {
        const sound = new Audio('resources/sounds/engine-sound.mp3');
        sound.volume = 0.2;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    const trackList = Array.from(tracks).map((track, index) => ({
        name: track.textContent,
        src: track.dataset.src,
        index: index
    }));
    
    initPlayer();
    initGearbox();
    startEngineLoop();
    playEngineSound();
    
    changeGear('N');
    updateSpeedometer(0);
    updateTachometer(0.5);
});