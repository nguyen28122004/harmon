import { restoreItemStates, saveItemStates } from './stateManager.js';
import { showPopup, showPopupNearButton } from './logic.js';

const presetInput = document.getElementById('presetNameInput');
const saveBtn = document.getElementById('savePresetBtn');
const presetList = document.getElementById('presetList');
import { renderSidebarTabs } from './sidebar.js';

function getPresets() {
    return JSON.parse(localStorage.getItem('itemPresets') || '{}');
}

function savePresets(presets) {
    renderSidebarTabs();
    localStorage.setItem('itemPresets', JSON.stringify(presets));
}

function renderPresetList() {
    const presets = getPresets();
    presetList.innerHTML = '';

    for (const name in presets) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${name}</span>
            <div class="preset-actions">
                <button onclick="window.loadPreset('${name}')">📤</button>
                <button onclick="window.renamePreset('${name}')">✏️</button>
                <button onclick="window.deletePreset('${name}')">🗑️</button>
            </div>
        `;
        presetList.appendChild(li);
    }
}

saveBtn.addEventListener('click', () => {
    const name = presetInput.value.trim();
    if (!name.trim()) {
        showPopup("📛 Bạn cần nhập tên preset!");
        return;
    }

    const presets = getPresets();
    const itemStates = JSON.parse(localStorage.getItem('gameItemStates') || '[]');
    presets[name] = itemStates;
    savePresets(presets);
    renderPresetList();
    presetInput.value = '';
});

// Gắn các hàm vào window để dùng inline onclick
window.loadPreset = function(name) {
    const presets = getPresets();
    const itemStates = presets[name];
    if (itemStates) {
        localStorage.setItem('gameItemStates', JSON.stringify(itemStates));
        restoreItemStates();
        renderSidebarTabs();
    }
};

window.deletePreset = function(name) {
    const presets = getPresets();
    if (confirm(`Xóa preset "${name}"?`)) {
        delete presets[name];
        savePresets(presets);
        renderPresetList();
    }
};

window.renamePreset = function(name) {
    const newName = prompt("Tên mới:", name);
    if (newName && newName !== name) {
        const presets = getPresets();
        presets[newName] = presets[name];
        delete presets[name];
        savePresets(presets);
        renderPresetList();
    }
};

// Khởi tạo khi load
renderPresetList();