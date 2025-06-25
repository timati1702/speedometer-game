export class CarPanel {
    constructor() {
        this.START_VALUE = 0;
        this.currentGear = 'N';
        this.speed = this.START_VALUE;
        this.rpm = this.START_VALUE;
        this.isAccelerating = false;
        this.isBraking = false;
        this.accelerationRate = this.START_VALUE;
        this.decelerationRate = 0.2;
        this.engineInterval = null;
        this.accelerationInterval = null;
        this.decelerationInterval = null;
        this.isKeyPressed = {
            ArrowUp: false,
            ArrowDown: false
        };

        this.speedValue = document.querySelector('.speedometer .value');
        this.speedNeedle = document.querySelector('.speedometer .needle');
        this.rpmValue = document.querySelector('.tachometer .value');
        this.rpmNeedle = document.querySelector('.tachometer .needle');
        this.gearLabels = document.querySelectorAll('.display .label');
        this.currentGearDisplay = document.querySelector('.current-gear');

        this.initGearbox();
        this.startEngineLoop();
        this.changeGear('N');
        this.updateSpeedometer(this.START_VALUE);
        this.updateTachometer(0.5);
    }

    playGearSound() {
        const sound = new Audio('resources/audio/sounds/gear-sound.mp3');
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    playEngineSound() {
        const sound = new Audio('resources/audio/sounds/engine-sound.mp3');
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    initGearbox() {
        this.gearLabels.forEach(label => {
            label.addEventListener('click', () => {
                this.changeGear(label.textContent);
            });
        });

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    changeGear(gear) {
        this.currentGear = gear;
        this.currentGearDisplay.textContent = gear;

        this.gearLabels.forEach(label => {
            label.classList.toggle('active', label.textContent === gear);
        });

        this.playGearSound();
        this.playEngineSound();
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowUp' && !this.isKeyPressed.ArrowUp) {
            this.isKeyPressed.ArrowUp = true;
            this.stopDeceleration();
            this.startAcceleration();
        }
        else if (e.key === 'ArrowDown' && !this.isKeyPressed.ArrowDown) {
            this.isKeyPressed.ArrowDown = true;
            this.stopAcceleration();
            this.startRpmIncrease();
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowUp') {
            this.isKeyPressed.ArrowUp = false;
            this.stopAcceleration();
            this.startDeceleration();
        }
        else if (e.key === 'ArrowDown') {
            this.isKeyPressed.ArrowDown = false;
            this.stopRpmIncrease();
            this.startDeceleration();
        }
    }

    startAcceleration() {
        this.stopAcceleration();

        this.accelerationInterval = setInterval(() => {
            if (this.currentGear === 'D') {
                this.speed = Math.min(this.speed + 0.5, 240);
            }
            else if (this.currentGear === 'R') {
                this.speed = Math.min(this.speed + 0.3, 60);
            }

            this.updateRPM();
            this.updateSpeedometer(this.speed);
        }, 50);
    }

    startRpmIncrease() {
        this.stopRpmIncrease();

        this.accelerationInterval = setInterval(() => {
            this.rpm = Math.min(this.rpm + 0.1, 8);
            this.updateTachometer(this.rpm);

            if(this.currentGear === 'P' || this.currentGear === 'N') {
                this.speed = 0;
                this.updateSpeedometer(this.speed);
            }
        }, 50);
    }

    stopRpmIncrease() {
        clearInterval(this.accelerationInterval);
    }

    startDeceleration() {
        this.stopDeceleration();

        this.decelerationInterval = setInterval(() => {
            this.speed = Math.max(this.speed - 0.2, this.START_VALUE);
            this.rpm = Math.max(this.rpm - 0.05, 0.5);
            this.updateSpeedometer(this.speed);
            this.updateTachometer(this.rpm);
        }, 50);
    }

    stopAcceleration() {
        clearInterval(this.accelerationInterval);
    }

    stopDeceleration() {
        clearInterval(this.decelerationInterval);
    }

    updateRPM() {
        if (this.currentGear === 'D' || this.currentGear === 'P' || this.currentGear === 'N') {
            this.rpm = Math.min(7, 0.5 + this.speed * 0.03 + Math.random() * 0.1);
        }
        else if (this.currentGear === 'R') {
            this.rpm = Math.min(4, 0.5 + this.speed * 0.05 + Math.random() * 0.1);
        }

        this.updateTachometer(this.rpm);
    }

    startEngineLoop() {
        clearInterval(this.engineInterval);

        this.engineInterval = setInterval(() => {
            if (this.currentGear === 'D' || this.currentGear === 'R') {
                if (this.isAccelerating) {
                    this.speed = Math.min(this.speed + this.accelerationRate, this.currentGear === 'D' ? 240 : 60);
                } else if (this.isBraking) {
                    this.speed = Math.max(this.speed - this.decelerationRate * 2, this.START_VALUE);
                } else {
                    this.speed = Math.max(this.speed - this.decelerationRate, this.START_VALUE);
                }
            }

            this.rpm = 0.5 + Math.random() * 0.5;
            this.updateSpeedometer(this.speed);
            this.updateTachometer(this.rpm);

        }, 100);
    }

    updateSpeedometer(value) {
        const angle = (value / 240) * 180 - 90;
        this.speedNeedle.style.transform = `rotate(${angle}deg)`;
        this.speedValue.textContent = Math.round(value);
    }

    updateTachometer(value) {
        const angle = (value / 8) * 180 - 90;
        this.rpmNeedle.style.transform = `rotate(${angle}deg)`;
        this.rpmValue.textContent = value.toFixed(1);
    }
}