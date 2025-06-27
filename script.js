import { AudioPanel } from './resources/modules/audio_panel.js';
import { CarPanel } from './resources/modules/car_panel.js';

document.addEventListener('DOMContentLoaded', function () {
    const load = document.getElementById('loading-indicator');
    load.classList.add('active');
    setTimeout(
        () => {
            load.classList.remove('active');
        },
        5 * 1000)

    const tracks = document.querySelectorAll('.track');
    const player = new AudioPanel();
    player.render
    player.setTracks(tracks);

    const carControls = new CarPanel();
});