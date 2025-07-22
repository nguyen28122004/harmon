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
        const layer = parseInt(item.dataset.layer || item.style.zIndex || '1'); // ✅ Lấy từ dataset.layer
        itemStates.push({ key, position, layer }); // ✅ Đổi từ zIndex → layer
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

    savedStates.forEach(({ key, position, layer }) => {
        if (items[key]) {
            const meta = items[key];
            meta.layer = layer || 1; // ✅ Gán layer vào meta trước khi tạo
            const clone = createCanvasItem(key, meta, true, {}, position, {
                skipSidebarCheck: true
            });

            clone.dataset.position = JSON.stringify(position);
            clone.dataset.key = key;
            clone.dataset.layer = layer || 1; // ✅ Gán layer cho dataset
            clone.style.zIndex = layer || 1; // ✅ Cập nhật zIndex để hiển thị đúng

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