import { items } from "./items.js";
import { activeItems } from "./logic.js";
import { createCanvasItem } from "./logic.js";
import { setSnapEnabled } from "./logic.js";
import { resetItems } from "./stateManager.js";
import {
    exportImage,
    exportToGIF
} from "./exportImage.js";

const sidebar = document.getElementById('sidebar');
const gameCanvas = document.getElementById('gameCanvas');

document.getElementById('resetBtn').addEventListener('click', () => {
    resetItems();
});

snapToggle.addEventListener("change", (e) => {
    setSnapEnabled(e.target.checked);
});

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportImageBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportImage);
    };


    const exportGifBtn = document.getElementById('exportGifBtn')
    if (exportGifBtn)
        exportGifBtn.addEventListener('click', () => {
            exportToGIF();
        })
});

export function renderSidebarTabs() {
    sidebar.innerHTML = '';

    // Tạo container cho phần tab nằm dọc
    const tabWrapper = document.createElement('div');
    tabWrapper.className = 'tab-wrapper';

    const tabHeader = document.createElement('div');
    tabHeader.className = 'tab-header-vertical';

    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';

    // Gom item theo category
    const categories = {};
    for (const key in items) {
        const meta = items[key];
        const cat = meta.category || 'Others';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ key, meta });
    }

    const tabNames = Object.keys(categories);
    let currentTab = tabNames[0];

    tabNames.forEach((catName, index) => {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-button-vertical';
        tabBtn.textContent = catName;
        if (index === 0) tabBtn.classList.add('active');

        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button-vertical').forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');
            renderTabContent(catName);
        });

        tabHeader.appendChild(tabBtn);
    });

    function renderTabContent(catName) {
        tabContent.innerHTML = '';
        categories[catName].forEach(({ key, meta }) => {
            if (activeItems.has(key)) return; // 🛑 Đã có trên canvas → bỏ qua
            const canvasItem = createCanvasItem(key, meta);
            tabContent.appendChild(canvasItem);
        });
    }


    renderTabContent(currentTab);

    tabWrapper.appendChild(tabHeader);
    tabWrapper.appendChild(tabContent);
    sidebar.appendChild(tabWrapper);
}