import { restoreItemStates, resetItems } from './stateManager.js';
import { initZoomControl } from './zoomControl.js';
import { setSnapEnabled } from './logic.js';
import { renderSidebarTabs } from './sidebar.js';
import { sendLogToTelegram } from './logic.js';


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

// Gửi log khi có người vào
// window.onload = () => {
//     const ipFetch = fetch('https://api.ipify.org?format=json')
//         .then(res => res.json())
//         .then(data => {
//             let contentText = '-------------------\n';
//             contentText += "👀 Truy cập từ IP: " + data.ip
//             sendLogToTelegram(contentText)
//         });
// };