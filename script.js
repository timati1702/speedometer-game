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
    
    const START_VALUE = 0;
    let currentGear = 'N';
    let speed = START_VALUE;
    let rpm = START_VALUE;
    let isAccelerating = false;
    let isBraking = false;
    let accelerationRate = START_VALUE;
    let decelerationRate = 0.2;
    let engineInterval;
    let currentTrackIndex = START_VALUE;
    let accelerationInterval;
    let decelerationInterval;
    let isKeyPressed = {
        ArrowUp: false,
        ArrowDown: false
    };
    
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
        const sound = new Audio('resources/audio/sounds/gear-sound.mp3');
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playEngineSound() {
        const sound = new Audio('resources/audio/sounds/engine-sound.mp3');
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playClickSound() {
        const sound = new Audio('resources/audio/sounds/click-sound.mp3');
        sound.volume = 0.2;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    const trackList = Array.from(tracks).map((track, index) => ({
        name: track.textContent,
        src: track.dataset.src,
        index: index
    }));

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
        if(['P', 'N'].includes(currentGear)) return;

        if(e.key === 'ArrowUp' && !isKeyPressed.ArrowUp) {
            isKeyPressed.ArrowUp = true;
            stopDeceleration();
            startAcceleration();
        }
        else if(e.key === 'ArrowDown' && !isKeyPressed.ArrowDown) {
            isKeyPressed.ArrowDown = true;
            stopAcceleration();
            startDeceleration();
        }
    }
    
    function handleKeyUp(e) {
        if(e.key === 'ArrowUp') {
            isKeyPressed.ArrowUp = false;
            stopAcceleration();
            startDeceleration();
        }
        else if(e.key === 'ArrowDown') {
            isKeyPressed.ArrowDown = false;
            stopDeceleration();
        }
    }

    function startAcceleration() {
        stopAcceleration(); 
        
        accelerationInterval = setInterval(() => {
            if (currentGear === 'D') {
                speed = Math.min(speed + 0.5, 240); 
            } 
            else if (currentGear === 'R') {
                speed = Math.min(speed + 0.3, 60); 
            }
            
            updateRPM();
            updateSpeedometer(speed);
        }, 50);
    }
    
    function startDeceleration() {
        stopDeceleration(); 
        
        decelerationInterval = setInterval(() => {
            speed = Math.max(speed - 0.2, START_VALUE); 
            updateRPM();
            updateSpeedometer(speed);
        }, 50);
    }
    
    function stopAcceleration() {
        clearInterval(accelerationInterval);
    }
    
    function stopDeceleration() {
        clearInterval(decelerationInterval);
    }
    
    function updateRPM() {
        if (currentGear === 'P' || currentGear === 'N') {
            rpm = 0.8 + Math.random() * 0.4;
        } 
        else if (currentGear === 'D') {
            rpm = Math.min(7, 0.5 + speed * 0.03 + Math.random() * 0.1);
        } 
        else if (currentGear === 'R') {
            rpm = Math.min(4, 0.5 + speed * 0.05 + Math.random() * 0.1);
        }
        
        updateTachometer(rpm);
    }
    
    function startEngineLoop() {
        clearInterval(engineInterval);
        
        engineInterval = setInterval(() => {
            if (currentGear === 'D' || currentGear === 'R') {
                if (isAccelerating) {
                    speed = Math.min(speed + accelerationRate, currentGear === 'D' ? 240 : 60);
                } else if (isBraking) {
                    speed = Math.max(speed - decelerationRate * 2, START_VALUE);
                } else {
                    speed = Math.max(speed - decelerationRate, START_VALUE);
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

    initPlayer();
    initGearbox();
    startEngineLoop();
    playEngineSound();
    
    changeGear('N');
    updateSpeedometer(START_VALUE);
    updateTachometer(0.5);
});