import { restoreItemStates, resetItems } from './stateManager.js';
import { initZoomControl } from './zoomControl.js';
import { setSnapEnabled } from './logic.js';
import { renderSidebarTabs } from './sidebar.js';



const sidebar = document.getElementById('sidebar');
const gameCanvas = document.getElementById('gameCanvas');
const activeItems = new Set();

const snapToggle = document.getElementById("snapToggle");

restoreItemStates();

window.addEventListener('DOMContentLoaded', () => {
    restoreItemStates();
    renderSidebarTabs();
    initZoomControl();
});