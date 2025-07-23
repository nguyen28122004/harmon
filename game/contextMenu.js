import { saveItemStates } from "./stateManager.js";
import { createCanvasItem } from "./logic.js";

const contextMenu = document.getElementById('contextMenu');
let contextTarget = null;
let contextKey = null;
let contextMeta = null;

// Ngăn context menu bị ẩn khi click vào bên trong nó
contextMenu.addEventListener("click", (e) => e.stopPropagation());

// Tạo lại nội dung context menu
function renderContextMenu(canvas, key, meta, pageX, pageY) {
    const pos = JSON.parse(canvas.dataset.position || '{}');
    const locked = canvas.dataset.locked === 'true';
    const ignoreClick = canvas.dataset.ignoreClick === 'true';
    const layer = canvas.dataset.layer || meta.layer || 0;

    contextMenu.innerHTML = `
    <button disabled>🔍 <b>${key}</b> — (${pos.x ?? 0}, ${pos.y ?? 0}) — Layer ${layer}</button>
    <button id="toggleLock">${locked ? '🔓 Mở khóa vị trí' : '🔒 Khóa vị trí'}</button>
    <button id="toggleClick">${ignoreClick ? '🖱️ Cho phép click trái' : '🚫 Bỏ qua click trái'}</button>
    
    <div style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: #ffe0f0; border-radius: 12px; margin-top: 6px; font-weight: bold; color: #c2185b;">
        Layer:
        <input id="layerInput" type="number" value="${layer}"
            style="width: 48px; padding: 2px 6px; border: none; border-radius: 6px; font-size: 14px; background: #fff0f6; color: #880e4f;" />
    </div>
${key?.includes('eggmon') ? `
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
        Scale: <span style="display:inline-block" id="scaleItemValue">${canvas.dataset.scale || meta.scale || 1}</span>
        <input id="scaleItemSlider" type="range" min="0.1" max="3" step="0.001" 
            value="${canvas.dataset.scale || meta.scale || 1}" />
            <button id="resetScaleBtn" style="font-size: 14px; width:2rem; padding: 2px 6px;">↺</button>
    </div>

    <button id="deleteItemBtn" style="background-color: #ffcccc; color: #800000; border: none; border-radius: 6px; padding: 6px 12px; margin-top: 8px;">🗑️ Xoá item</button>
`;


    contextMenu.style.left = `${pageX}px`;
    contextMenu.style.top = `${pageY}px`;
    contextMenu.style.display = 'block';

    // Layer input
    // Layer input
    const layerInput = document.getElementById("layerInput");
    if (layerInput) {
        layerInput.addEventListener("change", () => {
            const newLayer = parseInt(layerInput.value);
            if (!isNaN(newLayer)) {
                contextTarget.dataset.layer = newLayer;
                contextMeta.layer = newLayer;
                contextTarget.style.zIndex = newLayer;

                // ✅ Lưu lại localStorage
                if (typeof saveItemStates === 'function') saveItemStates();

                // ✅ Cập nhật lại nội dung context menu cho khớp
                renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
            }
        });
    }


    const scaleItemSlider = document.getElementById("scaleItemSlider");
    const scaleItemValue = document.getElementById("scaleItemValue");
    if (scaleItemSlider && scaleItemValue) {
        scaleItemSlider.addEventListener("input", () => {
            const newScale = parseFloat(scaleItemSlider.value);
            if (!isNaN(newScale)) {
                canvas.dataset.scale = newScale;
                scaleItemValue.textContent = newScale.toFixed(3);

                const img = new Image();
                img.src = meta.src;
                img.onload = () => {
                    const frameWidth = img.width / (meta.frames || 1);
                    const frameHeight = img.height;

                    canvas.width = frameWidth * newScale;
                    canvas.height = frameHeight * newScale;

                    const ctx = canvas.getContext('2d');
                    const currentFrame = 0;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.shadowColor = 'rgba(0,0,0,0.2)';
                    ctx.shadowBlur = 12;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 6;

                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(0, 0, canvas.width, canvas.height, 12);
                    ctx.clip();

                    ctx.drawImage(
                        img,
                        currentFrame * frameWidth,
                        0,
                        frameWidth,
                        frameHeight,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    ctx.restore();
                };

                if (typeof saveItemStates === 'function') saveItemStates();
            }
        });
    }

const eggmonStateSelector = document.getElementById('eggmonStateSelector');
if (eggmonStateSelector) {
    eggmonStateSelector.addEventListener('change', () => {
        const newRow = parseInt(eggmonStateSelector.value);
        if (!isNaN(newRow)) {
            // Cập nhật meta và dataset
            contextMeta.row = newRow;

            // Lưu lại vị trí hiện tại
            const position = JSON.parse(contextTarget.dataset.position || '{"x":0,"y":0}');
            const layer = parseInt(contextTarget.dataset.layer || '1');
            const scale = parseFloat(contextTarget.dataset.scale || contextMeta.scale || 1);

            // Xóa canvas cũ
            contextTarget.remove();

            // Tạo lại item mới với row mới
            const newCanvas = createCanvasItem(contextKey, contextMeta, true, {}, position, {
                skipSidebarCheck: true
            });
            newCanvas.dataset.key = contextKey
            newCanvas.dataset.row = newRow;
            newCanvas.dataset.rownum = contextMeta.rownum;
            newCanvas.dataset.layer = layer;
            newCanvas.dataset.scale = scale;
            newCanvas.dataset.position = JSON.stringify(position);
            newCanvas.style.left = position.x + 'px';
            newCanvas.style.top = position.y + 'px';
            newCanvas.style.zIndex = layer;

            gameCanvas.appendChild(newCanvas);

            // Lưu lại vào local
            saveItemStates();

            // Ẩn context menu
            contextMenu.style.display = 'none';
        }
    });
}

    // ✅ Reset scale
    const resetBtn = document.getElementById("resetScaleBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            const defaultScale = (meta && meta.scale) ? meta.scale : 1;
            scaleItemSlider.value = defaultScale;
            scaleItemSlider.dispatchEvent(new Event("input"));
        });

    }

    // ✅ Delete item
    const deleteBtn = document.getElementById("deleteItemBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            contextTarget.remove();
            saveItemStates();
            // Tìm tab phù hợp để thêm lại
const cat = contextMeta.category || 'Others';
const currentTabBtn = document.querySelector('.tab-button-vertical.active');
const currentTabName = currentTabBtn ? currentTabBtn.textContent : null;

// Nếu item bị xóa, thì cho phép hiển thị lại trong tab phù hợp
if (currentTabName === cat) {
    if (!document.getElementById('sidebar-' + contextKey)) {
        const newItem = createCanvasItem(contextKey, contextMeta);
        newItem.id = 'sidebar-' + contextKey;
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            tabContent.appendChild(newItem);
        }
    }
}
            contextMenu.style.display = "none";
        });
    }
}

// Gắn context menu cho canvas item
export function attachContextMenu(canvas, key, meta) {
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextTarget = canvas;
        contextKey = key;
        contextMeta = meta;

        renderContextMenu(canvas, key, meta, e.pageX, e.pageY);
    });
}

// Click ngoài thì ẩn menu
window.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
        contextMenu.style.display = "none";
    }
});

// Xử lý click các nút trong menu
contextMenu.addEventListener('click', (e) => {
    if (!contextTarget) return;
    const id = e.target.id;

    if (id === 'toggleLock') {
        const isLocked = contextTarget.dataset.locked === 'true';
        contextTarget.dataset.locked = (!isLocked).toString();
        if (typeof saveItemStates === 'function') saveItemStates();
        renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
    }

    if (id === 'toggleClick') {
        const ignoreClick = contextTarget.dataset.ignoreClick === 'true';
        contextTarget.dataset.ignoreClick = (!ignoreClick).toString();
        if (typeof saveItemStates === 'function') saveItemStates();
        renderContextMenu(contextTarget, contextKey, contextMeta, parseInt(contextMenu.style.left), parseInt(contextMenu.style.top));
    }
});