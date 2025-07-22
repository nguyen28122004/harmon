import { restoreItemStates, resetItems } from './stateManager.js';
import { initZoomControl } from './zoomControl.js';
import { snapEnabled } from './logic.js';


const sidebar = document.getElementById('sidebar');
const gameCanvas = document.getElementById('gameCanvas');
const activeItems = new Set();



restoreItemStates();
document.getElementById('snapToggle').addEventListener('change', (e) => {
    snapEnabled = e.target.checked;
});

document.getElementById('resetBtn').addEventListener('click', () => {
    resetItems();
});

window.addEventListener('DOMContentLoaded', () => {
    restoreItemStates();
    initZoomControl();
});