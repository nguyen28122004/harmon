import { restoreItemStates, resetItems } from './stateManager.js';
import { initZoomControl } from './zoomControl.js';
import { setSnapEnabled } from './logic.js';
import { renderSidebarTabs } from './logic.js';



const sidebar = document.getElementById('sidebar');
const gameCanvas = document.getElementById('gameCanvas');
const activeItems = new Set();

const snapToggle = document.getElementById("snapToggle");
snapToggle.addEventListener("change", (e) => {
    setSnapEnabled(e.target.checked); // ✅ gọi setter thay vì gán trực tiếp
});

restoreItemStates();

document.getElementById('resetBtn').addEventListener('click', () => {
    resetItems();
});

window.addEventListener('DOMContentLoaded', () => {
    restoreItemStates();
    renderSidebarTabs();
    initZoomControl();
});