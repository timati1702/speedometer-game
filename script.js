import {AudioPanel} from './resources/modules/audio_panel.js';
import { CarPanel } from './resources/modules/car_panel.js';

document.addEventListener('DOMContentLoaded', function() {
    const tracks = document.querySelectorAll('.track');
    const player = new AudioPanel();
    player.render
    player.setTracks(tracks);

    const carControls = new CarPanel();
});