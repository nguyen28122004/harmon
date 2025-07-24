// --- Giữ nguyên các import ---
import { saveItemStates } from "./stateManager.js";
import { createCanvasItem } from "./logic.js";
import { activeItems } from './logic.js';
import { items } from "./items.js";

const contextMenu = document.getElementById('contextMenu');
let contextTarget = null;
let contextKey = null;
let contextMeta = null;

contextMenu.addEventListener("click", (e) => e.stopPropagation());

// --- REDRAW FUNCTION (được dùng lại cho scale và rotate) ---
function redrawCanvas(canvas, meta) {
    const img = new Image();
    img.src = meta.src;
    img.onload = () => {
        const scale = parseFloat(canvas.dataset.scale || meta.scale || 1);
        const frameWidth = img.width / (meta.frames || 1);
        const totalRows = meta.rownum || 1;
        const row = parseInt(canvas.dataset.row || '0');
        const frameHeight = img.height / totalRows;

        canvas.width = frameWidth * scale;
        canvas.height = frameHeight * scale;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, 12);
        ctx.clip();

        // Không xoay nữa, chỉ vẽ khung frame gốc
        ctx.drawImage(
            img,
            0,
            row * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

        // Thêm transform xoay ở CSS
        const rotation = parseFloat(canvas.dataset.rotation || '0');
        canvas.style.transform = `rotate(${rotation}deg)`;
        canvas.style.transformOrigin = 'center center';
    };
}


// --- CONTEXT MENU FUNCTION ---
function renderContextMenu(canvas, key, meta, pageX, pageY) {
    const pos = JSON.parse(canvas.dataset.position || '{}');
    const locked = canvas.dataset.locked === 'true';
    const ignoreClick = canvas.dataset.ignoreClick === 'true';
    const layer = canvas.dataset.layer || meta.layer || 0;
    const scale = parseFloat(canvas.dataset.scale || meta.scale || 1);
    const rotation = parseFloat(canvas.dataset.rotation || 0);

    contextMenu.innerHTML = `
    <button disabled>🔍 <b>${key}</b> — (${pos.x ?? 0}, ${pos.y ?? 0}) — Layer ${layer}</button>
    <button id="toggleLock">${locked ? '🔓 Mở khóa vị trí' : '🔒 Khóa vị trí'}</button>
    <button id="toggleClick">${ignoreClick ? '🖱️ Cho phép click trái' : '🚫 Bỏ qua click trái'}</button>

    <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #ffe0f0; border-radius: 12px; margin-top: 6px; font-weight: bold; color: #c2185b;">
        Layer:
        <input id="layerInput" type="number" value="${layer}"
            style="width: 48px; padding: 2px 6px; border: none; border-radius: 6px; font-size: 14px; background: #fff0f6; color: #880e4f;" />
    </div>

    ${key.includes('eggmon') ? `
    <div style="display: flex; flex-direction: row; align-items: center; gap: 4px; padding: 6px 12px; background: #ffe0f0; border-radius: 12px; margin-top: 6px; font-weight: bold; color: #880e4f;">
        Trạng thái:
        <select id="eggmonStateSelector" 
            style="padding: 6px 12px; 
                   border-radius: 10px; 
                   border: none; 
                   font-size: 14px; 
                   background: #fff0f6; 
                   color: #880e4f; 
                   font-weight: bold; 
                   box-shadow: inset 0 0 0 1px #b2ebf2;">
            <option value="0" ${meta.row == 0 ? 'selected' : ''}>0</option>
            <option value="1" ${meta.row == 1 ? 'selected' : ''}>1</option>
            <option value="2" ${meta.row == 2 ? 'selected' : ''}>2</option>
        </select>
    </div>
    ` : ''}

    <div style="display: flex; flex-direction: row;align-items: center; gap: 4px; padding: 6px 12px; background: #ffe0f0; border-radius: 12px; margin-top: 6px; font-weight: bold; color: #c2185b;">
        Scale: 
        <span style="display:inline-block" id="scaleItemValue">${scale.toFixed(3)}</span>
        <input id="scaleItemSlider" type="range" min="0.1" max="3" step="0.001" value="${scale}" />
        <button id="resetScaleBtn" style="font-size: 14px; width:2rem; padding: 2px 6px;">↺</button>
    </div>

    <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #ffe0f0; border-radius: 12px; margin-top: 6px; font-weight: bold; color: #c2185b;">
        Xoay:
        <input id="rotateSlider" type="range" min="0" max="360" step="1" value="${rotation}" />
        <span id="rotateValue">${rotation}°</span>
    </div>

    <button id="deleteItemBtn" 
        style="background-color: #ffcccc; color: #800000; border: none; border-radius: 6px; padding: 6px 12px; margin-top: 8px;">
        🗑️ Xoá item
    </button>
`;


    contextMenu.style.left = `${pageX}px`;
    contextMenu.style.top = `${pageY}px`;
    contextMenu.style.display = 'block';

    // Event: Layer
    const layerInput = document.getElementById("layerInput");
    if (layerInput) {
        layerInput.addEventListener("change", () => {
            const newLayer = parseInt(layerInput.value);
            contextTarget.dataset.layer = newLayer;
            contextTarget.style.zIndex = newLayer;
            contextMeta.layer = newLayer;
            saveItemStates();
            renderContextMenu(canvas, key, meta, pageX, pageY);
        });
    }

    // Event: Scale
    const scaleSlider = document.getElementById("scaleItemSlider");
    const scaleValue = document.getElementById("scaleItemValue");
    if (scaleSlider) {
        scaleSlider.addEventListener("input", () => {
            const newScale = parseFloat(scaleSlider.value);
            contextTarget.dataset.scale = newScale;
            scaleValue.textContent = newScale.toFixed(3);
            redrawCanvas(contextTarget, contextMeta);
            saveItemStates();
        });
    }

    // Event: Reset scale
    document.getElementById("resetScaleBtn")?.addEventListener("click", () => {
        const defaultScale = meta.scale || 1;
        scaleSlider.value = defaultScale;
        scaleSlider.dispatchEvent(new Event("input"));
    });

    // Event: Rotate
    const rotateSlider = document.getElementById("rotateSlider");
    const rotateValue = document.getElementById("rotateValue");
    if (rotateSlider) {
        rotateSlider.addEventListener("input", () => {
            const deg = parseFloat(rotateSlider.value);
            contextTarget.dataset.rotation = deg;
            rotateValue.textContent = `${deg}°`;
        
            // Bỏ redrawCanvas vì không còn dùng ctx.rotate()
            contextTarget.style.transform = `rotate(${deg}deg)`;
            contextTarget.style.transformOrigin = 'center center';
        
            saveItemStates();
        });
        
    }

    // Event: eggmonStateSelector
    const eggmonSelector = document.getElementById('eggmonStateSelector');
if (eggmonSelector) {
    eggmonSelector.addEventListener('change', () => {
        const newRow = parseInt(eggmonSelector.value);
        const pos = JSON.parse(canvas.dataset.position || '{"x":0,"y":0}');
        const scale = parseFloat(canvas.dataset.scale || meta.scale || 1);
        const layer = parseInt(canvas.dataset.layer || '0');

        canvas.remove();
        contextMeta.row = newRow;

        const newCanvas = createCanvasItem(key, meta, true, {}, pos, { skipSidebarCheck: true });

        // ✅ Gán từng thuộc tính dataset riêng lẻ
        newCanvas.dataset.key = key;
        newCanvas.dataset.row = newRow;
        newCanvas.dataset.rownum = meta.rownum;
        newCanvas.dataset.rotation = canvas.dataset.rotation || '0';
        newCanvas.dataset.layer = layer;
        newCanvas.dataset.scale = scale;
        newCanvas.dataset.position = JSON.stringify(pos);

        newCanvas.style.left = pos.x + 'px';
        newCanvas.style.top = pos.y + 'px';
        newCanvas.style.zIndex = layer;

        gameCanvas.appendChild(newCanvas);
        saveItemStates();
        contextMenu.style.display = 'none';
    });
}


    // Event: Delete item
    document.getElementById("deleteItemBtn")?.addEventListener("click", () => {
        contextTarget.remove();
        activeItems.delete(contextKey);
        saveItemStates();

        const cat = contextMeta.category || 'Others';
        const currentTabBtn = document.querySelector('.tab-button-vertical.active');
        const currentTabName = currentTabBtn?.textContent;

        if (currentTabName === cat && !document.getElementById('sidebar-' + contextKey)) {
            items[contextKey] = contextMeta;
            const newItem = createCanvasItem(contextKey, contextMeta);
            newItem.id = 'sidebar-' + contextKey;
            document.querySelector('.tab-content')?.appendChild(newItem);
        }

        contextMenu.style.display = 'none';
    });
}

// --- GẮN MENU CHUỘT PHẢI ---
export function attachContextMenu(canvas, key, meta) {
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextTarget = canvas;
        contextKey = key;
        contextMeta = meta;
        renderContextMenu(canvas, key, meta, e.pageX, e.pageY);
    });
}

// --- ẨN MENU KHI CLICK NGOÀI ---
window.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = "none";
    }
});

// --- NÚT KHÓA + CLICK BỎ QUA ---
contextMenu.addEventListener('click', (e) => {
    if (!contextTarget) return;
    const id = e.target.id;

    if (id === 'toggleLock') {
        const isLocked = contextTarget.dataset.locked === 'true';
        contextTarget.dataset.locked = (!isLocked).toString();
        saveItemStates();
        renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
    }

    if (id === 'toggleClick') {
        const ignoreClick = contextTarget.dataset.ignoreClick === 'true';
        contextTarget.dataset.ignoreClick = (!ignoreClick).toString();
        saveItemStates();
        renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
    }
});