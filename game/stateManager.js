import { createCanvasItem, activeItems } from './logic.js';
import { items } from './items.js';
import { attachContextMenu } from './contextMenu.js';

const gameCanvas = document.getElementById('gameCanvas');
const sidebar = document.getElementById('sidebar');
export let isRestoring = false;
export function saveItemStates() {
    const itemStates = [];
    const itemsOnCanvas = gameCanvas.querySelectorAll('.game-item');

    itemsOnCanvas.forEach((item) => {
        const key = item.dataset.key;
        const position = JSON.parse(item.dataset.position || '{}');
        const layer = parseInt(item.dataset.layer || item.style.zIndex || '0');
        const scale = parseFloat(item.dataset.scale || '1'); // ✅ Lấy scale từ dataset
        const row = parseInt(item.dataset.row || '0');
        const rownum = parseInt(item.dataset.rownum || '1');

        itemStates.push({ key, position, layer, scale, row, rownum }); // ✅ Thêm scale vào object
    });

    localStorage.setItem('gameItemStates', JSON.stringify(itemStates));
}


export function restoreItemStates() {
    isRestoring = true;

    gameCanvas.querySelectorAll('.game-item').forEach(item => item.remove());

    sidebar.innerHTML = '';
    activeItems.clear();

    const savedStates = JSON.parse(localStorage.getItem('gameItemStates') || '[]');
    const keysPlaced = new Set();

    savedStates.forEach(({ key, position, layer, scale, row, rownum }) => {
        if (items[key]) {
            const meta = {...items[key], layer: layer || 1, row: row || 0, rownum: rownum || 0 };
            console.log("", meta);
            const clone = createCanvasItem(key, meta, true, {}, position, {
                skipSidebarCheck: true
            });

            clone.dataset.position = JSON.stringify(position);
            clone.dataset.key = key;
            clone.dataset.layer = layer || 0;
            clone.dataset.scale = scale || 1;
            clone.dataset.row = row || 0;
            clone.dataset.rownum = rownum || 1;
            clone.style.zIndex = layer || 1;
            // clone.style.transform = `scale(${scale || 1})`; // ✅ Sửa tại đây

            gameCanvas.appendChild(clone);
            activeItems.add(key);
            keysPlaced.add(key);
        }
    });



    for (const key in items) {
        if (!keysPlaced.has(key)) {
            const canvas = createCanvasItem(key, items[key]);
            canvas.id = 'sidebar-' + key;
            sidebar.appendChild(canvas);
        }
    }

    isRestoring = false;
}

export function resetItems() {
    const itemsOnCanvas = gameCanvas.querySelectorAll('.game-item');
    itemsOnCanvas.forEach(item => item.remove());
    localStorage.removeItem('gameItemStates');
    sidebar.innerHTML = '';

    for (const key in items) {
        const canvas = createCanvasItem(key, items[key]);
        canvas.id = 'sidebar-' + key;
        sidebar.appendChild(canvas);
    }

    activeItems.clear();
}